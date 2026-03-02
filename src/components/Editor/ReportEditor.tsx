import { useReportStore } from '../../store/useReportStore';
import { ImageUpload } from '../common/ImageUpload';

export const FormField: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
            {label}
        </label>
        {children}
    </div>
);

export const ReportEditor: React.FC = () => {
    const { report, updateReport } = useReportStore();

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Report Settings</h2>

            <FormField label="Report Title">
                <input
                    type="text"
                    value={report.reportTitle}
                    onChange={(e) => updateReport({ reportTitle: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Template Style">
                <select
                    value={report.template}
                    onChange={(e) => updateReport({ template: e.target.value as 'SOP' | 'Minimal' })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                    <option value="SOP">SOP Template (Default)</option>
                    <option value="Minimal">Minimal Layout</option>
                </select>
            </FormField>

            <FormField label="Created Date">
                <input
                    type="date"
                    value={report.createdAt.split('T')[0]}
                    onChange={(e) => updateReport({ createdAt: new Date(e.target.value).toISOString() })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
            </FormField>

            <FormField label="Logo">
                <ImageUpload
                    value={report.logo}
                    onChange={(val) => updateReport({ logo: val })}
                    label="Upload Report Logo"
                />
            </FormField>
        </div>
    );
};
