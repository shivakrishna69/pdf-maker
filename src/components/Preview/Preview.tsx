import React from 'react';
import './Preview.css';
import { useReportStore } from '../../store/useReportStore';
import { InlineInput } from './InlineInput';

export const Preview: React.FC = () => {
    const { report, updateSection, updateItem, setActiveIds } = useReportStore();
    let pageCounter = 1;

    return (
        <div className={`page-a4 template-${report.template.toLowerCase()}`}>

            {/* Sections rendering */}
            {/* Sections rendering - Reduced gap for cleaner layout */}
            <div className="report-sections-container">
                {report.sections.map((section) => {
                    const firstPageItems = section.items.slice(0, 5);
                    const remainingItems = section.items.slice(5);

                    const subsequentPages = [];
                    for (let i = 0; i < remainingItems.length; i += 10) {
                        subsequentPages.push(remainingItems.slice(i, i + 10));
                    }

                    const renderItemCard = (item: any, sectionId: string) => (
                        <div key={item.id} className="item-list-row" style={{ display: 'flex', gap: '1.2rem', padding: '0.1rem 0', alignItems: 'flex-start' }} onClick={(e) => { e.stopPropagation(); setActiveIds(sectionId, item.id); }}>
                            {/* Balanced thumbnail for 50/50 layout */}
                            <div style={{ width: '65px', height: '90px', flexShrink: 0, overflow: 'hidden' }}>
                                {item.smallImage ? (
                                    <img src={item.smallImage} alt="Thumbnail" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'crisp-edges' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', border: '1px dashed #eee' }}>
                                        No Img
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11pt', lineHeight: '1.1', flex: 1, minWidth: 0, color: '#000' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '0.1rem' }}>
                                    <InlineInput
                                        style={{ color: '#0000FF', flex: 1, fontWeight: 600, textTransform: 'uppercase' }}
                                        value={item.productName || 'Unnamed'}
                                        onValueChange={val => updateItem(sectionId, item.id, { productName: val })}
                                    />
                                </div>
                                <div style={{
                                    color: item.statusColor === 'red' ? '#FF0000' :
                                        item.statusColor === 'orange' ? '#ed7d31' :
                                            item.statusColor === 'default' ? '#444' :
                                                (item.status === 'PARTIAL' ? '#ed7d31' : item.status === 'OOS' ? '#FF0000' : '#444'),
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    fontSize: '10pt'
                                }}>
                                    {item.status}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.2rem', color: '#333' }}>
                                    <span style={{ fontWeight: 400 }}>Idcam: </span>
                                    <InlineInput style={{ flex: 1 }} value={item.idcam} onValueChange={val => updateItem(sectionId, item.id, { idcam: val })} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', color: '#333' }}>
                                    <span style={{ fontWeight: 400 }}>Upc: </span>
                                    <InlineInput style={{ flex: 1 }} value={item.upc} onValueChange={val => updateItem(sectionId, item.id, { upc: val })} />
                                </div>
                            </div>
                        </div>
                    );

                    return (
                        <div key={section.id} className="report-section">
                            {/* PAGE 1 Wrapper */}
                            <div className="report-page" onClick={() => setActiveIds(section.id, null)} style={{ position: 'relative' }}>
                                {/* Content Area */}
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'stretch' }}>
                                    {/* Left Column: Image */}
                                    <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column' }}>
                                        {section.mainImage?.url ? (
                                            <div style={{ width: '100%', height: '600px', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                                <img
                                                    src={section.mainImage.url}
                                                    alt="Main Shelf"
                                                    style={{
                                                        width: '100%',
                                                        height: '600px',
                                                        display: 'block',
                                                        objectFit: 'fill',
                                                        imageRendering: 'crisp-edges'
                                                    }}
                                                />
                                                <svg
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                                                    viewBox="0 0 100 100"
                                                    preserveAspectRatio="none"
                                                >
                                                    {(section.annotations || []).map((ann) => {
                                                        const strokeColor = ann.color === 'red' ? '#ef4444' : ann.color === 'green' ? '#22c55e' : ann.color === 'yellow' ? '#f59e0b' : '#0000FF';
                                                        return (
                                                            <g key={ann.id}>
                                                                <rect x={ann.x} y={ann.y} width={ann.width} height={ann.height} fill={strokeColor + '1a'} stroke={strokeColor} strokeWidth="0.8" />
                                                                <foreignObject x={ann.x} y={ann.y} width={ann.width} height={ann.height} style={{ overflow: 'visible' }}>
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                                                        <div style={{ color: '#fff', fontSize: '0.3rem', fontWeight: 'bold', textShadow: '0 1px 1px rgba(0,0,0,0.6)' }}>
                                                                            {ann.customMarker || ann.order}
                                                                        </div>
                                                                    </div>
                                                                </foreignObject>
                                                            </g>
                                                        );
                                                    })}
                                                </svg>
                                            </div>
                                        ) : (
                                            <div style={{ width: '100%', minHeight: '300px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ddd' }}>No Main Image</div>
                                        )}
                                    </div>

                                    {/* Right Column: Meta & List */}
                                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                        <h2 style={{ fontSize: '18pt', fontWeight: 700, marginBottom: '0.1rem', color: '#000', textTransform: 'uppercase', lineHeight: 1 }}>
                                            <InlineInput value={section.sectionTitle} onValueChange={(val) => updateSection(section.id, { sectionTitle: val })} />
                                        </h2>
                                        <div className="section-meta-header" style={{ fontSize: '11pt', color: '#000', fontWeight: 400, marginBottom: '0.1rem' }}>
                                            <p style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.05rem' }}>
                                                <span style={{ fontWeight: 600 }}><span className="lang-en">Reference:</span><span className="lang-fr">Référence:</span></span>
                                                <InlineInput style={{ flex: 1 }} value={section.referenceText} onValueChange={(val) => updateSection(section.id, { referenceText: val })} />
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                                                <span style={{ fontWeight: 600 }}><span className="lang-en">Last Analysis:</span><span className="lang-fr">Dernière analyse:</span></span>
                                                <InlineInput style={{ flex: 1 }} value={section.lastAnalysisDatetime.replace('T', ' ')} onValueChange={(val) => updateSection(section.id, { lastAnalysisDatetime: val })} />
                                            </div>
                                        </div>
                                        <div className="blue-separator" style={{ margin: '0.3rem 0 0.5rem 0' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px', justifyContent: 'flex-start' }}>
                                            {firstPageItems.map((item) => renderItemCard(item, section.id))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Page 1 */}
                                <div className="print-footer" style={{
                                    position: 'absolute',
                                    bottom: '10mm',
                                    left: '15mm',
                                    right: '15mm',
                                    height: '10mm',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '10pt',
                                    color: '#666',
                                    zIndex: 100
                                }}>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <span className="lang-en">Number of slots : {section.slots || 0}</span>
                                        <span className="lang-fr">Nombre de slots : {section.slots || 0}</span>
                                    </div>
                                    <div style={{ position: 'absolute', right: 0 }}>
                                        <span>Page {pageCounter++}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SUBSEQUENT PAGES */}
                            {subsequentPages.map((pageChunk, pageIndex) => (
                                <div key={pageIndex} className="report-page subsequent-page-wrapper">
                                    <div style={{ display: 'flex', gap: '3rem', flex: 1 }}>
                                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                            {pageChunk.slice(0, 5).map((item) => renderItemCard(item, section.id))}
                                        </div>
                                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                            {pageChunk.slice(5, 10).map((item) => renderItemCard(item, section.id))}
                                        </div>
                                    </div>
                                    {/* Footer Subsequent Pages */}
                                    <div className="print-footer" style={{
                                        position: 'absolute',
                                        bottom: '10mm',
                                        left: '15mm',
                                        right: '15mm',
                                        height: '10mm',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '10pt',
                                        color: '#666',
                                        zIndex: 100
                                    }}>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <span className="lang-en">Number of slots : {section.slots || 0}</span>
                                            <span className="lang-fr">Nombre de slots : {section.slots || 0}</span>
                                        </div>
                                        <div style={{ position: 'absolute', right: 0 }}>
                                            <span>Page {pageCounter++}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
