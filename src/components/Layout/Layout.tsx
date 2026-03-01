import React, { useState, useRef, useEffect } from 'react';
import './Layout.css';
import { Sidebar } from '../Sidebar/Sidebar';
import { Editor } from '../Editor/Editor';
import { Preview } from '../Preview/Preview';
import { useReportStore, waitForStorageSync } from '../../store/useReportStore';
import { generateDocx } from '../../utils/exportDocx';
import { Share, Download, ChevronDown, Save, File, History } from 'lucide-react';

import { ShareModal } from '../common/ShareModal';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { report, reportHistory, saveReport, createNewReport, loadReport, deleteReport } = useReportStore();
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'Saved' | 'Draft' | 'History'>('Saved');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDownloadOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const checkAndDraftOnLoad = () => {
            const state = useReportStore.getState();
            const currentReport = state.report;
            if (!currentReport) return;

            // Strict check: Is this a report worth keeping?
            const hasMeaningfulContent = currentReport.sections.some(s =>
                s.sectionTitle !== 'New Category' ||
                s.items.length > 1 ||
                s.items[0]?.productName !== '' ||
                s.mainImage !== null
            ) || currentReport.reportTitle !== 'Untitled Report' || currentReport.logo !== null;

            const wasJustAutoDrafted = sessionStorage.getItem('auto_drafted_on_refresh');

            if (hasMeaningfulContent && !wasJustAutoDrafted) {
                // They refreshed with a real project. Move it to drafts and wipe the board.
                (async () => {
                    console.log('Detected meaningful unsaved work on refresh. Auto-drafting...');
                    setIsSaving(true);
                    sessionStorage.setItem('auto_drafted_on_refresh', 'true');

                    const state = useReportStore.getState();
                    state.saveAndNewReport('Draft');

                    // CRITICAL: Wait for IDB to finish writing before we reload
                    console.log('Waiting for storage sync before reload...');
                    await waitForStorageSync();
                    console.log('Sync complete. Reloading...');
                    window.location.reload();
                })();
            } else {
                // Either it's empty or we already wiped it.
                sessionStorage.removeItem('auto_drafted_on_refresh');
            }
        };

        // Run ONLY when rehydrated to prevent checking empty defaults
        const unsubscribe = useReportStore.persist.onFinishHydration(() => {
            checkAndDraftOnLoad();
        });

        // If already hydrated (unlikely on first mount but possible)
        if (useReportStore.persist.hasHydrated()) {
            checkAndDraftOnLoad();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            unsubscribe();
        };
    }, []);

    const handleExportDocx = async () => {
        try {
            await generateDocx(report);
        } catch (err) {
            console.error('Failed to generate DOCX', err);
            alert('Export failed. Please check the console for details.');
        }
    };

    return (
        <div className="layout-container">
            <header className="layout-header no-print">
                <div className="layout-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo-report-default.png" alt="NUTS-PDF" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div className="layout-actions">
                    <button
                        className="btn btn-outline flex items-center gap-2"
                        onClick={() => createNewReport()}
                        title="Start a new report"
                    >
                        <File size={16} /> New Form
                    </button>
                    <button
                        className="btn btn-outline flex items-center gap-2"
                        disabled={isSaving}
                        onClick={() => {
                            const name = window.prompt('Enter project name to save as Draft:', report.reportTitle !== 'Untitled Report' ? report.reportTitle : 'My Draft');
                            if (name !== null) {
                                (async () => {
                                    setIsSaving(true);
                                    console.log('Saving as Draft (Atomic):', name);
                                    const store = useReportStore.getState();
                                    store.saveAndNewReport('Draft', name || undefined);

                                    console.log('Waiting for IDB sync...');
                                    await waitForStorageSync();
                                    console.log('Ready. Reloading.');
                                    window.location.reload();
                                })();
                            }
                        }}
                    >
                        <Save size={16} /> Save as Draft
                    </button>
                    <button
                        className="btn btn-primary flex items-center gap-2"
                        disabled={isSaving}
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: 'white' }}
                        onClick={() => {
                            const name = window.prompt('Enter project name to Save:', report.reportTitle !== 'Untitled Report' ? report.reportTitle : 'Final Report');
                            if (name !== null) {
                                (async () => {
                                    setIsSaving(true);
                                    console.log('Saving final Report (Atomic):', name);
                                    const store = useReportStore.getState();
                                    store.saveAndNewReport('Saved', name || undefined);

                                    console.log('Waiting for IDB sync...');
                                    await waitForStorageSync();
                                    console.log('Ready. Reloading.');
                                    window.location.reload();
                                })();
                            }
                        }}
                    >
                        <Save size={16} /> Save Report
                    </button>

                    <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }} />

                    <button
                        className="btn btn-outline flex items-center gap-2"
                        onClick={() => setIsHistoryOpen(true)}
                    >
                        <History size={16} /> My Reports
                    </button>

                    <button
                        className="btn btn-outline flex items-center gap-2"
                        onClick={() => setIsShareOpen(true)}
                    >
                        <Share size={16} /> Share
                    </button>

                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button className="btn btn-secondary flex items-center gap-2" onClick={() => setIsDownloadOpen(!isDownloadOpen)}>
                            <Download size={16} /> Download <ChevronDown size={16} />
                        </button>

                        {isDownloadOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                                backgroundColor: 'var(--color-bg-panel)', border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                                zIndex: 100, minWidth: '180px', overflow: 'hidden'
                            }}>
                                <button
                                    className="dropdown-item"
                                    onClick={() => { window.print(); setIsDownloadOpen(false); }}
                                >
                                    PDF Document (.pdf)
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={() => { handleExportDocx(); setIsDownloadOpen(false); }}
                                >
                                    MS Word (.docx)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="layout-main">
                {children ? children : (
                    <>
                        <aside className="layout-sidebar no-print">
                            <Sidebar />
                        </aside>
                        <section className="layout-editor no-print">
                            <Editor />
                        </section>
                        <section className="layout-preview-wrapper" onClick={() => useReportStore.getState().setActiveIds(null, null)}>
                            <div onClick={e => e.stopPropagation()}>
                                <Preview />
                            </div>
                        </section>
                    </>
                )}
            </main>

            {isShareOpen && (
                <ShareModal onClose={() => setIsShareOpen(false)} />
            )}

            {/* History Modal */}
            {isHistoryOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'var(--color-bg-panel)', width: '90%', maxWidth: '800px', height: '80vh', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>My Reports</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={async () => {
                                        const { get } = await import('idb-keyval');
                                        const raw = await get('stock-outage-report-storage');
                                        console.log('[Storage Debug] Raw IDB metadata:', raw);
                                    }}
                                    style={{ fontSize: '0.7rem', opacity: 0.5, background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    Debug Storage
                                </button>
                                <button onClick={() => setIsHistoryOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-light)' }}>&times;</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                            {(['Saved', 'Draft', 'History'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: '1rem', fontWeight: activeTab === tab ? 600 : 400,
                                        color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text)',
                                        borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                                        paddingBottom: '0.4rem'
                                    }}
                                >
                                    {tab === 'History' ? 'All / Archieved' : tab}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                            Showing {reportHistory.length} projects in local storage (IndexedDB)
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {reportHistory
                                .filter(r => {
                                    if (activeTab === 'Saved') return r.status === 'Saved';
                                    if (activeTab === 'Draft') return r.status === 'Draft';
                                    return true; // History shows all
                                })
                                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                .map(historyItem => (
                                    <div key={historyItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: historyItem.id === report.id ? 'var(--color-bg)' : 'transparent' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                                {historyItem.reportTitle || 'Untitled Report'}
                                                {historyItem.id === report.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.1rem 0.4rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '12px' }}>Active</span>}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                                Status: {historyItem.status} | Last modified: {new Date(historyItem.updatedAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {historyItem.status !== 'Deleted' && (
                                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }} onClick={() => {
                                                    loadReport(historyItem.id);
                                                    setIsHistoryOpen(false);
                                                }}>
                                                    Load
                                                </button>
                                            )}
                                            {historyItem.status === 'Deleted' && (
                                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }} onClick={() => {
                                                    // "Restore" basically re-saves it as a Draft
                                                    loadReport(historyItem.id);
                                                    saveReport('Draft');
                                                    setIsHistoryOpen(false);
                                                }}>
                                                    Restore
                                                </button>
                                            )}
                                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => {
                                                if (window.confirm(activeTab === 'History' && historyItem.status === 'Deleted' ? 'Permanently delete this project forever?' : 'Move this project to Deleted History?')) {
                                                    deleteReport(historyItem.id, activeTab === 'History' && historyItem.status === 'Deleted');
                                                }
                                            }}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            {reportHistory.filter(r => activeTab === 'Saved' ? r.status === 'Saved' : activeTab === 'Draft' ? r.status === 'Draft' : true).length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                                    No {activeTab.toLowerCase()} reports found yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Saving Overlay */}
            {isSaving && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <div style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Saving Report Histoy...</h3>
                    <p style={{ opacity: 0.8 }}>Ensuring database sync before refresh</p>
                </div>
            )}
        </div>
    );
};
