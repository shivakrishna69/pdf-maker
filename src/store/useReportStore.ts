import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { Report, ReportSection, ReportItem, Annotation } from '../types';

// Track pending writes to IndexedDB
let activeWrites = 0;
export const waitForStorageSync = async () => {
    while (activeWrites > 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
};

const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        activeWrites++;
        try {
            await set(name, value);
        } finally {
            activeWrites--;
        }
    },
    removeItem: async (name: string): Promise<void> => {
        activeWrites++;
        try {
            await del(name);
        } finally {
            activeWrites--;
        }
    },
};

const createEmptyItem = (): ReportItem => ({
    id: crypto.randomUUID(),
    smallImage: null,
    productName: '',
    status: 'TOTAL',
    statusColor: 'default',
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
    slots: null,
    mainImage: null,
    annotations: [],
    notes: '',
    items: [createEmptyItem()],
});

const createEmptyReport = (userId?: string | null): Report => ({
    id: crypto.randomUUID(),
    userId: userId || undefined,
    reportTitle: 'Untitled Report',
    template: 'SOP',
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logo: '/logo-report-v2.png',
    sections: [createEmptySection()],
});

interface ReportState {
    report: Report;
    reportHistory: Report[];
    userId: string | null;
    activeSectionId: string | null;
    activeItemId: string | null;

    // Actions
    setUserId: (userId: string | null) => void;
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
    setReport: (report: Report) => void;
    fetchUserReports: () => Promise<void>;
    saveToCloud: (report: Report) => Promise<void>;
    updateAnnotation: (sectionId: string, annotationId: string, data: Partial<Annotation>) => void;
}

export const useReportStore = create<ReportState>()(
    persist(
        (set) => ({
            report: createEmptyReport(),
            reportHistory: [],
            userId: null,
            activeSectionId: null,
            activeItemId: null,

            setUserId: (userId) => set({ userId }),
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

                // Push to cloud asynchronously
                state.saveToCloud(finalizedReport);

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

                // Push to cloud asynchronously
                state.saveToCloud(reportToSave);

                console.log(`[Store] Atomic Save and New: ${status}. History size: ${newHistory.length}`);

                return {
                    report: createEmptyReport(state.userId),
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

                // Push deletion to cloud if logged in
                const storeState = useReportStore.getState();
                const userId = storeState.userId;
                if (userId) {
                    fetch(`/api/reports?id=${reportId}`, {
                        method: 'DELETE',
                        headers: { 'x-user-id': userId }
                    }).catch(err => console.error('Failed to sync deletion:', err));
                }

                return {
                    reportHistory: newHistory,
                    // If they deleted the currently active report, clear the canvas
                    report: state.report.id === reportId ? createEmptyReport(state.userId) : state.report
                };
            }),

            createNewReport: () => set((state) => {
                return {
                    report: createEmptyReport(state.userId),
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

            resetReport: () => set((state) => ({ report: createEmptyReport(state.userId), activeSectionId: null, activeItemId: null })),
            setReport: (report) => set({ report, activeSectionId: null, activeItemId: null }),

            fetchUserReports: async () => {
                const { userId } = useReportStore.getState();
                if (!userId) return;

                try {
                    const response = await fetch('/api/reports', {
                        headers: { 'x-user-id': userId }
                    });
                    if (response.ok) {
                        const cloudHistory = await response.json() as Report[];
                        const localHistory = useReportStore.getState().reportHistory;

                        // Merge logic: Prioritize newer updatedAt, keep uniqueness by id
                        const mergedHistory = [...localHistory];
                        cloudHistory.forEach(cloudReport => {
                            const localIndex = mergedHistory.findIndex(r => r.id === cloudReport.id);
                            if (localIndex === -1) {
                                mergedHistory.push(cloudReport);
                            } else {
                                const localReport = mergedHistory[localIndex];
                                if (new Date(cloudReport.updatedAt) > new Date(localReport.updatedAt)) {
                                    mergedHistory[localIndex] = cloudReport;
                                }
                            }
                        });

                        set({ reportHistory: mergedHistory });
                    }
                } catch (error) {
                    console.error('Failed to fetch user reports:', error);
                }
            },

            saveToCloud: async (report) => {
                const { userId } = useReportStore.getState();
                if (!userId) return;

                try {
                    await fetch('/api/reports', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': userId
                        },
                        body: JSON.stringify(report)
                    });
                } catch (error) {
                    console.error('Failed to save report to cloud:', error);
                }
            },

            updateAnnotation: (sectionId, annotationId, data) => set((state) => {
                const now = new Date().toISOString();
                return {
                    report: {
                        ...state.report,
                        updatedAt: now,
                        sections: state.report.sections.map(sec =>
                            sec.id === sectionId ? {
                                ...sec,
                                annotations: sec.annotations.map(ann =>
                                    ann.id === annotationId ? { ...ann, ...data } : ann
                                )
                            } : sec
                        )
                    }
                };
            }),
        }),
        {
            name: 'stock-outage-report-storage',
            storage: createJSONStorage(() => idbStorage),
        }
    )
);
