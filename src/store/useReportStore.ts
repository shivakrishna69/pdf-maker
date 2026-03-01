import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { Report, ReportSection, ReportItem } from '../types';

// Track pending writes to IndexedDB to ensure we don't reload before sync finishes
let pendingWrite: Promise<void> | null = null;
export const waitForStorageSync = () => pendingWrite || Promise.resolve();

const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        pendingWrite = set(name, value);
        await pendingWrite;
        pendingWrite = null;
    },
    removeItem: async (name: string): Promise<void> => {
        pendingWrite = del(name);
        await pendingWrite;
        pendingWrite = null;
    },
};

const createEmptyItem = (): ReportItem => ({
    id: crypto.randomUUID(),
    smallImage: null,
    productName: '',
    status: 'TOTAL',
    implantations: null,
    idcam: '',
    upc: '',
    notes: '',
});

const createEmptySection = (): ReportSection => ({
    id: crypto.randomUUID(),
    sectionTitle: 'New Category',
    referenceText: '',
    lastAnalysisDatetime: new Date().toISOString().slice(0, 19),
    mainImage: null,
    annotations: [],
    notes: '',
    items: [createEmptyItem()],
});

const createEmptyReport = (): Report => ({
    id: crypto.randomUUID(),
    reportTitle: 'Untitled Report',
    template: 'SOP',
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logo: null,
    sections: [createEmptySection()],
});

interface ReportState {
    report: Report;
    reportHistory: Report[];
    activeSectionId: string | null;
    activeItemId: string | null;

    // Actions
    setActiveIds: (sectionId: string | null, itemId: string | null) => void;
    updateReport: (data: Partial<Omit<Report, 'sections' | 'id'>>) => void;

    // History Actions
    saveReport: (status: 'Draft' | 'Saved') => void;
    saveAndNewReport: (status: 'Draft' | 'Saved', newTitle?: string) => void;
    loadReport: (reportId: string) => void;
    deleteReport: (reportId: string, hardDelete?: boolean) => void;
    createNewReport: () => void;

    addSection: () => void;
    updateSection: (sectionId: string, data: Partial<ReportSection>) => void;
    duplicateSection: (sectionId: string) => void;
    removeSection: (sectionId: string) => void;
    reorderSections: (startIndex: number, endIndex: number) => void;

    addItem: (sectionId: string) => void;
    updateItem: (sectionId: string, itemId: string, data: Partial<ReportItem>) => void;
    duplicateItem: (sectionId: string, itemId: string) => void;
    removeItem: (sectionId: string, itemId: string) => void;
    reorderItems: (sectionId: string, startIndex: number, endIndex: number) => void;

    resetReport: () => void;

}

export const useReportStore = create<ReportState>()(
    persist(
        (set) => ({
            report: createEmptyReport(),
            reportHistory: [],
            activeSectionId: null,
            activeItemId: null,

            setActiveIds: (sectionId, itemId) => set({ activeSectionId: sectionId, activeItemId: itemId }),

            updateReport: (data) => set((state) => {
                const updatedReport = { ...state.report, ...data, updatedAt: new Date().toISOString() };

                // If it's already in history, auto-update the history entry too so it doesn't get out of sync
                const newHistory = state.reportHistory.map(r =>
                    r.id === updatedReport.id ? updatedReport : r
                );

                return {
                    report: updatedReport,
                    reportHistory: state.reportHistory.some(r => r.id === updatedReport.id) ? newHistory : state.reportHistory
                };
            }),

            saveReport: (status) => set((state) => {
                const now = new Date().toISOString();
                const finalizedReport = { ...state.report, status, updatedAt: now };
                const existingIndex = state.reportHistory.findIndex(r => r.id === finalizedReport.id);

                let newHistory = [...state.reportHistory];
                if (existingIndex >= 0) {
                    newHistory[existingIndex] = finalizedReport;
                } else {
                    newHistory.push(finalizedReport);
                }

                return {
                    report: finalizedReport,
                    reportHistory: newHistory
                };
            }),

            saveAndNewReport: (status, newTitle) => set((state) => {
                const now = new Date().toISOString();
                const reportToSave = {
                    ...state.report,
                    reportTitle: newTitle || state.report.reportTitle,
                    status,
                    updatedAt: now
                };

                const existingIndex = state.reportHistory.findIndex(r => r.id === reportToSave.id);
                let newHistory = [...state.reportHistory];
                if (existingIndex >= 0) {
                    newHistory[existingIndex] = reportToSave;
                } else {
                    newHistory.push(reportToSave);
                }

                console.log(`[Store] Atomic Save and New: ${status}. History size: ${newHistory.length}`);

                return {
                    report: createEmptyReport(),
                    reportHistory: newHistory,
                    activeSectionId: null,
                    activeItemId: null
                };
            }),

            loadReport: (reportId) => set((state) => {
                const target = state.reportHistory.find(r => r.id === reportId);
                if (!target) return state;
                return { report: target, activeSectionId: null, activeItemId: null };
            }),

            deleteReport: (reportId, hardDelete = false) => set((state) => {
                let newHistory = [...state.reportHistory];
                if (hardDelete) {
                    newHistory = newHistory.filter(r => r.id !== reportId);
                } else {
                    newHistory = newHistory.map(r => r.id === reportId ? { ...r, status: 'Deleted' as const } : r);
                }

                return {
                    reportHistory: newHistory,
                    // If they deleted the currently active report, clear the canvas
                    report: state.report.id === reportId ? createEmptyReport() : state.report
                };
            }),

            createNewReport: () => set(() => {
                return {
                    report: createEmptyReport(),
                    activeSectionId: null,
                    activeItemId: null
                };
            }),

            addSection: () => set((state) => {
                const newSection = createEmptySection();
                return {
                    report: {
                        ...state.report,
                        updatedAt: new Date().toISOString(),
                        sections: [...state.report.sections, newSection]
                    }
                };
            }),

            updateSection: (sectionId, data) => set((state) => ({
                report: {
                    ...state.report,
                    updatedAt: new Date().toISOString(),
                    sections: state.report.sections.map(sec =>
                        sec.id === sectionId ? { ...sec, ...data } : sec
                    )
                }
            })),

            duplicateSection: (sectionId) => set((state) => {
                const sectionToDuplicate = state.report.sections.find(s => s.id === sectionId);
                if (!sectionToDuplicate) return state;

                const newSection = {
                    ...sectionToDuplicate,
                    id: crypto.randomUUID(),
                    items: sectionToDuplicate.items.map(item => ({ ...item, id: crypto.randomUUID() }))
                };

                const sectionIndex = state.report.sections.findIndex(s => s.id === sectionId);
                const newSections = [...state.report.sections];
                newSections.splice(sectionIndex + 1, 0, newSection);

                return { report: { ...state.report, updatedAt: new Date().toISOString(), sections: newSections } };
            }),

            removeSection: (sectionId) => set((state) => ({
                report: {
                    ...state.report,
                    updatedAt: new Date().toISOString(),
                    sections: state.report.sections.filter(sec => sec.id !== sectionId)
                },
                activeSectionId: state.activeSectionId === sectionId ? null : state.activeSectionId,
                activeItemId: state.activeSectionId === sectionId ? null : state.activeItemId
            })),

            reorderSections: (startIndex, endIndex) => set((state) => {
                const newSections = Array.from(state.report.sections);
                const [removed] = newSections.splice(startIndex, 1);
                newSections.splice(endIndex, 0, removed);
                return { report: { ...state.report, updatedAt: new Date().toISOString(), sections: newSections } };
            }),

            addItem: (sectionId) => set((state) => ({
                report: {
                    ...state.report,
                    updatedAt: new Date().toISOString(),
                    sections: state.report.sections.map(sec =>
                        sec.id === sectionId ? { ...sec, items: [...sec.items, createEmptyItem()] } : sec
                    )
                }
            })),

            updateItem: (sectionId, itemId, data) => set((state) => ({
                report: {
                    ...state.report,
                    updatedAt: new Date().toISOString(),
                    sections: state.report.sections.map(sec =>
                        sec.id === sectionId
                            ? { ...sec, items: sec.items.map(item => item.id === itemId ? { ...item, ...data } : item) }
                            : sec
                    )
                }
            })),

            duplicateItem: (sectionId, itemId) => set((state) => {
                return {
                    report: {
                        ...state.report,
                        updatedAt: new Date().toISOString(),
                        sections: state.report.sections.map(sec => {
                            if (sec.id !== sectionId) return sec;
                            const itemIndex = sec.items.findIndex(i => i.id === itemId);
                            if (itemIndex === -1) return sec;

                            const itemToDuplicate = sec.items[itemIndex];
                            const newItem = { ...itemToDuplicate, id: crypto.randomUUID() };

                            const newItems = [...sec.items];
                            newItems.splice(itemIndex + 1, 0, newItem);

                            return { ...sec, items: newItems };
                        })
                    }
                };
            }),

            removeItem: (sectionId, itemId) => set((state) => ({
                report: {
                    ...state.report,
                    updatedAt: new Date().toISOString(),
                    sections: state.report.sections.map(sec =>
                        sec.id === sectionId ? { ...sec, items: sec.items.filter(item => item.id !== itemId) } : sec
                    )
                },
                activeItemId: state.activeItemId === itemId ? null : state.activeItemId
            })),

            reorderItems: (sectionId, startIndex, endIndex) => set((state) => ({
                report: {
                    ...state.report,
                    updatedAt: new Date().toISOString(),
                    sections: state.report.sections.map(sec => {
                        if (sec.id !== sectionId) return sec;
                        const newItems = Array.from(sec.items);
                        const [removed] = newItems.splice(startIndex, 1);
                        newItems.splice(endIndex, 0, removed);
                        return { ...sec, items: newItems };
                    })
                }
            })),

            resetReport: () => set({ report: createEmptyReport(), activeSectionId: null, activeItemId: null }),
        }),
        {
            name: 'stock-outage-report-storage',
            storage: createJSONStorage(() => idbStorage),
        }
    )
);
