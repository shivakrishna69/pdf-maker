import React, { useRef } from 'react';
import { UploadCloud, X, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
    value: string | null;
    onChange: (base64: string | null) => void;
    label?: string;
    fit?: 'contain' | 'cover';
    onFitChange?: (fit: 'contain' | 'cover') => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = 'Upload Image', fit, onFitChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            onChange(result);
        };
        reader.readAsDataURL(file);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const item = e.clipboardData.items[0];
        if (item?.type.includes('image')) {
            const file = item.getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result as string;
                    onChange(result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    if (value) {
        return (
            <div
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                onPaste={handlePaste}
                tabIndex={0}
            >
                <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img
                        src={value}
                        alt="Uploaded content"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: fit || 'contain',
                            display: 'block',
                            imageRendering: '-webkit-optimize-contrast'
                        }}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange(null); }}
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', padding: '0.25rem', display: 'flex' }}
                        title="Remove Image"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline flex items-center gap-2"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', flex: 1, justifyContent: 'center' }}
                    >
                        <RefreshCw size={14} /> Replace
                    </button>

                    {onFitChange && (
                        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)', padding: '0.125rem' }}>
                            <button
                                onClick={() => onFitChange('contain')}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: 'none', background: fit === 'contain' ? 'white' : 'transparent', borderRadius: 'var(--radius-sm)', boxShadow: fit === 'contain' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
                            >
                                Contain
                            </button>
                            <button
                                onClick={() => onFitChange('cover')}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: 'none', background: fit === 'cover' ? 'white' : 'transparent', borderRadius: 'var(--radius-sm)', boxShadow: fit === 'cover' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
                            >
                                Cover
                            </button>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>
        );
    }

    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            onPaste={handlePaste}
            tabIndex={0}
            style={{
                width: '100%', height: '100%', minHeight: '100px',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-tertiary)', cursor: 'pointer', backgroundColor: '#f8fafc',
                outline: 'none'
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        >
            <UploadCloud size={24} style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.875rem' }}>{label}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>(or Paste Ctrl+V)</span>
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </div>
    );
};
