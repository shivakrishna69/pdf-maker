import React from 'react';
import { useReportStore } from '../../store/useReportStore';
import { FormField } from './ReportEditor';
import { ImageUpload } from '../common/ImageUpload';


export const ItemEditor: React.FC<{ sectionId: string, itemId: string }> = ({ sectionId, itemId }) => {
    const { report, updateItem } = useReportStore();
    const section = report.sections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);

    if (!section || !item) return null;

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Éditeur d'article</h2>

            <FormField label="Nom du produit">
                <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => updateItem(sectionId, itemId, { productName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Status">
                <input
                    type="text"
                    value={item.status}
                    onChange={(e) => updateItem(sectionId, itemId, { status: e.target.value })}
                    placeholder="e.g. OOS, TOTAL..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="IDCAM">
                <input
                    type="text"
                    value={item.idcam}
                    onChange={(e) => updateItem(sectionId, itemId, { idcam: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="UPC">
                <input
                    type="text"
                    value={item.upc}
                    onChange={(e) => updateItem(sectionId, itemId, { upc: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Notes complémentaires">
                <textarea
                    rows={3}
                    value={item.notes}
                    onChange={(e) => updateItem(sectionId, itemId, { notes: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                />
            </FormField>

            <FormField label="Petite image de l'article">
                <ImageUpload
                    value={item.smallImage}
                    onChange={(val) => updateItem(sectionId, itemId, { smallImage: val })}
                    label="Télécharger la miniature"
                />
            </FormField>
        </div>
    );
};
