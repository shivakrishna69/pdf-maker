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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Item Editor</h2>

            <FormField label="Product Name">
                <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => updateItem(sectionId, itemId, { productName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Status">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={item.status}
                        onChange={(e) => updateItem(sectionId, itemId, { status: e.target.value })}
                        placeholder="e.g. OOS, TOTAL..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Text Color:</span>
                        <button
                            onClick={() => updateItem(sectionId, itemId, { statusColor: 'red' })}
                            style={{
                                width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#FF0000', border: item.statusColor === 'red' ? '2px solid #000' : '1px solid #ddd', cursor: 'pointer', padding: 0
                            }}
                            title="Red"
                        />
                        <button
                            onClick={() => updateItem(sectionId, itemId, { statusColor: 'orange' })}
                            style={{
                                width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ed7d31', border: item.statusColor === 'orange' ? '2px solid #000' : '1px solid #ddd', cursor: 'pointer', padding: 0
                            }}
                            title="Orange"
                        />
                        <button
                            onClick={() => updateItem(sectionId, itemId, { statusColor: 'default' })}
                            style={{
                                width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#444', border: item.statusColor === 'default' ? '2px solid #000' : '1px solid #ddd', cursor: 'pointer', padding: 0
                            }}
                            title="Default (Gray)"
                        />
                    </div>
                </div>
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

            <FormField label="Additional Notes">
                <textarea
                    rows={3}
                    value={item.notes}
                    onChange={(e) => updateItem(sectionId, itemId, { notes: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                />
            </FormField>

            <FormField label="Small Item Image">
                <ImageUpload
                    value={item.smallImage}
                    onChange={(val) => updateItem(sectionId, itemId, { smallImage: val })}
                    label="Upload Thumbnail"
                />
            </FormField>
        </div>
    );
};
