import React from 'react';
import { useReportStore } from '../../store/useReportStore';
import { FormField } from './ReportEditor';
import { ImageUpload } from '../common/ImageUpload';
import { ImageAnnotator } from './ImageAnnotator';
import { Pencil, X } from 'lucide-react';

export const SectionEditor: React.FC<{ sectionId: string }> = ({ sectionId }) => {
    const { report, updateSection } = useReportStore();
    const section = report.sections.find(s => s.id === sectionId);

    if (!section) return null;

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Section Editor</h2>

            <FormField label="Category Title">
                <input
                    type="text"
                    value={section.sectionTitle}
                    onChange={(e) => updateSection(sectionId, { sectionTitle: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Reference Text">
                <input
                    type="text"
                    value={section.referenceText}
                    onChange={(e) => updateSection(sectionId, { referenceText: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Last Analysis Date & Time">
                <input
                    type="text"
                    value={section.lastAnalysisDatetime}
                    onChange={(e) => updateSection(sectionId, { lastAnalysisDatetime: e.target.value })}
                    placeholder="e.g. 26-08-2025 03:58:57 AM"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Number of Slots">
                <input
                    type="number"
                    value={section.slots || ''}
                    onChange={(e) => updateSection(sectionId, { slots: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Enter slot count manually"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Notes">
                <textarea
                    rows={3}
                    value={section.notes}
                    onChange={(e) => updateSection(sectionId, { notes: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                />
            </FormField>

            <FormField label="Main Image">
                {!section.mainImage?.url ? (
                    <ImageUpload
                        value={null}
                        onChange={(val) => updateSection(sectionId, {
                            mainImage: val ? { url: val, fit: 'contain', zoom: 1, offsetX: 0, offsetY: 0, rotation: 0 } : null
                        })}
                        label="Upload main category image"
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Pencil size={12} /> ANNOTATION TOOL (DRAW ON IMAGE)
                            </div>
                            <button
                                onClick={() => updateSection(sectionId, { mainImage: null, annotations: [] })}
                                style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <X size={12} /> Remove image
                            </button>
                        </div>
                        <ImageAnnotator sectionId={sectionId} imageUrl={section.mainImage.url} />
                    </div>
                )}
            </FormField>
        </div>
    );
};
