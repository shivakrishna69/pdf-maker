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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Éditeur de section</h2>

            <FormField label="Titre de la catégorie">
                <input
                    type="text"
                    value={section.sectionTitle}
                    onChange={(e) => updateSection(sectionId, { sectionTitle: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Texte de référence">
                <input
                    type="text"
                    value={section.referenceText}
                    onChange={(e) => updateSection(sectionId, { referenceText: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Date et heure de la dernière analyse">
                <input
                    type="datetime-local"
                    step="1"
                    value={section.lastAnalysisDatetime}
                    onChange={(e) => updateSection(sectionId, { lastAnalysisDatetime: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Nombre de slots">
                <input
                    type="number"
                    value={section.slots || ''}
                    onChange={(e) => updateSection(sectionId, { slots: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Saisir manuellement le nombre de slots"
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

            <FormField label="Image principale">
                {!section.mainImage?.url ? (
                    <ImageUpload
                        value={null}
                        onChange={(val) => updateSection(sectionId, {
                            mainImage: val ? { url: val, fit: 'contain', zoom: 1, offsetX: 0, offsetY: 0, rotation: 0 } : null
                        })}
                        label="Télécharger l'image principale de la catégorie"
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Pencil size={12} /> OUTIL D'ANNOTATION (DESSINER SUR L'IMAGE)
                            </div>
                            <button
                                onClick={() => updateSection(sectionId, { mainImage: null, annotations: [] })}
                                style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <X size={12} /> Supprimer l'image
                            </button>
                        </div>
                        <ImageAnnotator sectionId={sectionId} imageUrl={section.mainImage.url} />
                    </div>
                )}
            </FormField>
        </div>
    );
};
