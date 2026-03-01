import React, { useState } from 'react';
import { useReportStore } from '../../store/useReportStore';
import { X, Copy, Check, Globe, Link as LinkIcon, Loader2 } from 'lucide-react';

interface ShareModalProps {
    onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
    const { report } = useReportStore();
    const [loading, setLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateLink = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: report,
                    reportTitle: report.reportTitle
                })
            });

            if (!response.ok) {
                let errorMsg = `Server Error (${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMsg += `: ${errorData.error || response.statusText}`;
                    if (errorData.stack) console.error('Server Stack:', errorData.stack);
                } catch {
                    // If not JSON, get raw text (Vercel error page)
                    const rawText = await response.text().catch(() => '');
                    errorMsg += `: ${rawText.substring(0, 100)}...`;
                    console.error('Raw Server Response:', rawText);
                }
                throw new Error(errorMsg);
            }
            const data = await response.json();

            const baseUrl = window.location.origin;
            setShareUrl(`${baseUrl}/share/${data.slug}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={20} className="text-primary" /> Share Report
                    </h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {!shareUrl ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                                Create a unique URL to share this report with anyone. They will be able to view and download it.
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={handleCreateLink}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <LinkIcon size={18} />}
                                {loading ? 'Generating Link...' : 'Generate Shareable Link'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                Your shareable link is ready:
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {shareUrl}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    style={{
                                        backgroundColor: copied ? '#10b981' : 'var(--color-primary)',
                                        color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                                        padding: '0 1rem', cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                                Anyone with this link can view this version of the report.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
