import React from 'react';
import './Preview.css';
import { useReportStore } from '../../store/useReportStore';
import { InlineInput } from './InlineInput';

export const Preview: React.FC = () => {
    const { report, updateSection, updateItem, setActiveIds } = useReportStore();

    return (
        <div className={`page-a4 template-${report.template.toLowerCase()}`}>

            {/* Sections rendering */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
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
                                    <img src={item.smallImage} alt="Thumbnail" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', imageRendering: '-webkit-optimize-contrast' }} />
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
                                <div style={{ color: item.status === 'PARTIAL' ? '#ed7d31' : item.status === 'OOS' ? '#FF0000' : '#444', textTransform: 'uppercase', fontWeight: 600, fontSize: '10pt' }}>
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
                        <div key={section.id} className="report-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* PAGE 1: 50/50 Perfection - Fixed 600px Height */}
                            <div style={{ display: 'flex', pageBreakInside: 'avoid', gap: '2rem', alignItems: 'stretch' }} onClick={() => setActiveIds(section.id, null)}>
                                {/* Left Column: 600px Height (50%) */}
                                <div style={{ flex: '0 0 50%', display: 'flex' }}>
                                    {section.mainImage?.url ? (
                                        <div style={{ width: '100%', height: '600px', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                            <img
                                                src={section.mainImage.url}
                                                alt="Main Shelf"
                                                style={{
                                                    width: '100%',
                                                    height: '600px',
                                                    display: 'block'
                                                }}
                                            />
                                            {/* SVG Overlay for Annotations (Percentage based) */}
                                            <svg
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                                                viewBox="0 0 100 100"
                                                preserveAspectRatio="none"
                                            >
                                                {(section.annotations || []).map((ann) => {
                                                    const colorMap = {
                                                        red: '#ef4444',
                                                        green: '#22c55e',
                                                        blue: '#0000FF',
                                                        yellow: '#f59e0b'
                                                    };
                                                    const strokeColor = colorMap[ann.color || 'blue'];
                                                    const fillColor = strokeColor + '1a';

                                                    return (
                                                        <g key={ann.id}>
                                                            <rect
                                                                x={ann.x} y={ann.y} width={ann.width} height={ann.height}
                                                                fill={fillColor}
                                                                stroke={strokeColor}
                                                                strokeWidth="0.8"
                                                            />
                                                            {/* Number - Centered and Minimal */}
                                                            <foreignObject
                                                                x={ann.x}
                                                                y={ann.y}
                                                                width={ann.width}
                                                                height={ann.height}
                                                                style={{ overflow: 'visible' }}
                                                            >
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    pointerEvents: 'none'
                                                                }}>
                                                                    <div style={{
                                                                        color: '#fff',
                                                                        fontSize: '0.3rem',
                                                                        fontWeight: 'bold',
                                                                        textShadow: '0 1px 1px rgba(0,0,0,0.6)'
                                                                    }}>
                                                                        {ann.customMarker || ann.order}
                                                                    </div>
                                                                </div>
                                                            </foreignObject>
                                                        </g>
                                                    );
                                                })}
                                            </svg>

                                            {/* Labels Overlay */}
                                            {(section.annotations || []).map((ann) => (
                                                <div
                                                    key={`label-${ann.id}`}
                                                    style={{
                                                        position: 'absolute',
                                                        left: `${ann.x + ann.width}%`,
                                                        top: `${ann.y}%`,
                                                        transform: 'translateX(5px)',
                                                        background: 'rgba(255,255,255,0.95)',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        border: '0.5px solid rgba(0,0,0,0.1)',
                                                        pointerEvents: 'none',
                                                        zIndex: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '6px', height: '6px', borderRadius: '50%',
                                                        background: ann.color === 'red' ? '#ef4444' : ann.color === 'green' ? '#22c55e' : ann.color === 'yellow' ? '#f59e0b' : '#0000FF'
                                                    }} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', minHeight: '300px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ddd' }}>
                                            No Main Image
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Details & Item List (50%) - Stretches to match */}
                                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <h2 style={{ fontSize: '18pt', fontWeight: 700, marginBottom: '0.1rem', color: '#000', textTransform: 'uppercase', lineHeight: 1 }}>
                                        <InlineInput
                                            value={section.sectionTitle}
                                            onValueChange={(val) => updateSection(section.id, { sectionTitle: val })}
                                        />
                                    </h2>
                                    <div className="section-meta-header" style={{ fontSize: '11pt', color: '#000', fontWeight: 400, marginBottom: '0.1rem' }}>
                                        <p style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.05rem' }}>
                                            <span style={{ fontWeight: 600 }}>Reference:</span>
                                            <InlineInput
                                                style={{ flex: 1 }}
                                                value={section.referenceText}
                                                onValueChange={(val) => updateSection(section.id, { referenceText: val })}
                                            />
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                                            <span style={{ fontWeight: 600 }}>Last analysis:</span>
                                            <InlineInput
                                                style={{ flex: 1 }}
                                                value={section.lastAnalysisDatetime.replace('T', ' ')}
                                                onValueChange={(val) => updateSection(section.id, { lastAnalysisDatetime: val })}
                                            />
                                        </div>
                                    </div>

                                    <div className="blue-separator" style={{ margin: '0.3rem 0 0.5rem 0' }} />

                                    {/* Items List (First 5) - Perfectly spreads to match image height */}
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                        {firstPageItems.map((item) => renderItemCard(item, section.id))}
                                    </div>
                                </div>
                            </div>

                            {/* SUBSEQUENT PAGES: 10 items per page (5 left, 5 right) */}
                            {subsequentPages.map((pageChunk, pageIndex) => {
                                const leftCol = pageChunk.slice(0, 5);
                                const rightCol = pageChunk.slice(5, 10);

                                return (
                                    <div key={pageIndex} style={{ display: 'flex', gap: '3rem', pageBreakBefore: 'always', paddingTop: '2.5rem' }}>
                                        {/* Left Column: 5 items */}
                                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                            {leftCol.map((item) => renderItemCard(item, section.id))}
                                        </div>
                                        {/* Right Column: 5 items */}
                                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                            {rightCol.map((item) => renderItemCard(item, section.id))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
