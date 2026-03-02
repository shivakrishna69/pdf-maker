import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Square, Trash2, Check } from 'lucide-react';
import { useReportStore } from '../../store/useReportStore';
import type { Annotation } from '../../types';

interface ImageAnnotatorProps {
    sectionId: string;
    imageUrl: string;
}

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({ sectionId, imageUrl }) => {
    const { report, updateSection } = useReportStore();
    const section = report.sections.find(s => s.id === sectionId);
    const annotations = section?.annotations || [];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTool, setActiveTool] = useState<'none' | 'rect'>('none');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);
    const [tempMarker, setTempMarker] = useState<string>('');

    useEffect(() => {
        if (selectedAnnId) {
            const ann = annotations.find(a => a.id === selectedAnnId);
            if (ann) setTempMarker(ann.customMarker ?? ann.order.toString());
        } else {
            setTempMarker('');
        }
    }, [selectedAnnId, annotations]);

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Mouse to Percentage conversion
    const getCoords = (e: React.MouseEvent | MouseEvent) => {
        if (!imgRef.current) return { x: 0, y: 0 };
        const rect = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        return { x, y };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // If clicking on an existing annotation area, don't start drawing
        const target = e.target as HTMLElement;
        const isAnnotationArea = target.hasAttribute('data-annotation-id');
        if (isAnnotationArea) return;

        if (activeTool !== 'rect') {
            // If not drawing, check if we clicked outside to deselect
            if (e.target === containerRef.current || e.target === imgRef.current) {
                setSelectedAnnId(null);
            }
            return;
        }
        setIsDrawing(true);
        const coords = getCoords(e);
        setCurrentRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
        setSelectedAnnId(null); // Deselect when drawing new
    };

    const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
        if (!isDrawing || !currentRect) return;
        const coords = getCoords(e as any);
        setCurrentRect({
            ...currentRect,
            w: coords.x - currentRect.x,
            h: coords.y - currentRect.y
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentRect) return;
        setIsDrawing(false);

        // Normalize (handle dragging in negative directions)
        const finalRect = {
            x: currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
            y: currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
            w: Math.abs(currentRect.w),
            h: Math.abs(currentRect.h)
        };

        // Ignore tiny clicks, otherwise show color picker
        if (finalRect.w > 1 && finalRect.h > 1) {
            setPendingAnnotation(finalRect);
        }
        setCurrentRect(null);
    };

    const addAnnotationWithColor = (color: 'red' | 'green' | 'blue' | 'yellow') => {
        if (!pendingAnnotation) return;

        const nextOrder = annotations.length + 1;
        const newAnnotation: Annotation = {
            id: crypto.randomUUID(),
            x: pendingAnnotation.x,
            y: pendingAnnotation.y,
            width: pendingAnnotation.w,
            height: pendingAnnotation.h,
            order: nextOrder,
            label: '',
            color: color
        };
        updateSection(sectionId, { annotations: [...annotations, newAnnotation] });
        setPendingAnnotation(null);
        setSelectedAnnId(newAnnotation.id); // Select the new one immediately
    };

    const removeAnnotation = (id: string) => {
        const newAnns = annotations
            .filter(a => a.id !== id)
            .map((a, i) => ({ ...a, order: i + 1 })); // Re-order numbers
        updateSection(sectionId, { annotations: newAnns });
        if (selectedAnnId === id) setSelectedAnnId(null);
    };

    return (
        <div style={{ position: 'relative', width: '100%', userSelect: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }} ref={containerRef}>
            {/* Toolbar - Moved outside/above image */}
            <div style={{
                display: 'flex', gap: '1rem', alignItems: 'center',
                padding: '0.5rem', background: '#f8fafc', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
            }}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: isMenuOpen ? '#4472c4' : '#2563eb',
                        color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '2px solid #fff', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    title="Annotation Tools"
                >
                    <Pencil size={18} fill={isMenuOpen ? 'rgba(255,255,255,0.2)' : 'none'} />
                </button>

                {isMenuOpen && (
                    <div style={{
                        display: 'flex', gap: '0.5rem', background: '#fff', padding: '0.2rem',
                        borderRadius: '2rem', border: '1px solid #e2e8f0',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <button
                            onClick={() => setActiveTool(activeTool === 'rect' ? 'none' : 'rect')}
                            style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: activeTool === 'rect' ? '#ede9fe' : 'transparent',
                                color: activeTool === 'rect' ? '#6d28d9' : '#444',
                                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                            title="Draw Rectangle"
                        >
                            <Square size={14} />
                        </button>
                    </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
                    {activeTool === 'rect' ? 'Click and drag on image' : 'Click labels to edit'}
                </div>
            </div>

            {/* Drawing Area */}
            <div
                style={{
                    position: 'relative', width: '100%',
                    cursor: activeTool === 'rect' ? 'crosshair' : 'default',
                    overflow: 'visible', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#000' // Dark bg for contrast
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Section image"
                    style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', borderRadius: 'calc(var(--radius-md) - 1px)' }}
                />

                {/* SVG Overlay for Annotations */}
                <svg
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        pointerEvents: 'none'
                    }}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    {annotations.map((ann) => {
                        const colorMap = {
                            red: '#ef4444',
                            green: '#22c55e',
                            blue: '#0000FF',
                            yellow: '#f59e0b'
                        };
                        const strokeColor = colorMap[ann.color || 'blue'];
                        const isSelected = selectedAnnId === ann.id;
                        const fillColor = isSelected ? strokeColor + '4d' : strokeColor + '1a';

                        return (
                            <g key={ann.id}>
                                <rect
                                    x={ann.x} y={ann.y} width={ann.width} height={ann.height}
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth={isSelected ? '1.2' : '0.8'}
                                />
                                {/* Number */}
                                <circle
                                    cx={ann.x + ann.width / 2}
                                    cy={ann.y + ann.height / 2}
                                    r="2.5"
                                    fill={strokeColor}
                                />
                                <text
                                    x={ann.x + ann.width / 2}
                                    y={ann.y + ann.height / 2}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="#fff"
                                    fontSize="3.5"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {ann.customMarker || ann.order}
                                </text>
                            </g>
                        );
                    })}

                    {/* Active Drawing Preview */}
                    {currentRect && (
                        <rect
                            x={currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x}
                            y={currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y}
                            width={Math.abs(currentRect.w)}
                            height={Math.abs(currentRect.h)}
                            fill="rgba(68, 114, 196, 0.2)"
                            stroke="#0000FF"
                            strokeWidth="0.5"
                            strokeDasharray="1 1"
                        />
                    )}
                </svg>

                {/* Interactive UI Layers */}
                {annotations.map((ann) => {
                    const isNearRightEdge = (ann.x + ann.width) > 85;
                    const isNearTopEdge = ann.y < 10;
                    const isSelected = selectedAnnId === ann.id;

                    return (
                        <div
                            key={ann.id}
                            data-annotation-id={ann.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAnnId(isSelected ? null : ann.id);
                            }}
                            style={{
                                position: 'absolute',
                                left: `${ann.x}%`,
                                top: `${ann.y}%`,
                                width: `${ann.width}%`,
                                height: `${ann.height}%`,
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                zIndex: isSelected ? 30 : 20
                            }}
                        >
                        </div>
                    );
                })}

                {/* Color Picker Popup for NEW annotations */}
                {pendingAnnotation && (
                    <div style={{
                        position: 'absolute',
                        left: `${Math.max(15, Math.min(85, pendingAnnotation.x + (pendingAnnotation.w / 2)))}%`,
                        top: `${pendingAnnotation.y}%`,
                        transform: pendingAnnotation.y < 15 ? 'translate(-50%, 15px)' : 'translate(-50%, -120%)',
                        background: '#fff',
                        padding: '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        gap: '8px',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        border: '1px solid #e2e8f0',
                        pointerEvents: 'auto'
                    }}>
                        {[
                            { id: 'red', color: '#ef4444' },
                            { id: 'green', color: '#22c55e' },
                            { id: 'blue', color: '#0000FF' },
                            { id: 'yellow', color: '#f59e0b' }
                        ].map(c => (
                            <button
                                key={c.id}
                                onClick={(e) => { e.stopPropagation(); addAnnotationWithColor(c.id as any); }}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: c.color, border: 'none', cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.15s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title={c.id.charAt(0).toUpperCase() + c.id.slice(1)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* EXTERNAL SETTINGS PANEL */}
            {selectedAnnId && (
                <div style={{
                    padding: '1rem',
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    animation: 'fadeIn 0.2s ease-out',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            Selected Annotation Settings
                        </h4>
                        <button
                            onClick={() => setSelectedAnnId(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                        >
                            <Check size={16} /> Done
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                        {/* Number Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Marker / Number</label>
                            <input
                                type="text"
                                value={tempMarker}
                                onChange={(e) => {
                                    setTempMarker(e.target.value);
                                    const { updateAnnotation } = useReportStore.getState();
                                    updateAnnotation(sectionId, selectedAnnId, { customMarker: e.target.value });
                                }}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold',
                                    outline: 'none',
                                    width: '100%'
                                }}
                            />
                        </div>

                        {/* Color Picker */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Color</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[
                                    { id: 'red', color: '#ef4444' },
                                    { id: 'green', color: '#22c55e' },
                                    { id: 'blue', color: '#0000FF' },
                                    { id: 'yellow', color: '#f59e0b' }
                                ].map(c => {
                                    const ann = annotations.find(a => a.id === selectedAnnId);
                                    const isCurrent = ann?.color === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                const { updateAnnotation } = useReportStore.getState();
                                                updateAnnotation(sectionId, selectedAnnId, { color: c.id as any });
                                            }}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: c.color,
                                                border: isCurrent ? '2px solid #000' : '2px solid transparent',
                                                cursor: 'pointer',
                                                boxShadow: isCurrent ? '0 0 0 2px #fff' : 'none',
                                                transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.1s'
                                            }}
                                            title={c.id}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Delete Action */}
                        <button
                            onClick={() => removeAnnotation(selectedAnnId)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: '#fee2e2',
                                color: '#ef4444',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                        >
                            <Trash2 size={16} /> Remove
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
