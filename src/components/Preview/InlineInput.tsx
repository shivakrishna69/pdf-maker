import React from 'react';
import type { InputHTMLAttributes } from 'react';
import './Preview.css';

interface InlineInputProps extends InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onValueChange: (val: string) => void;
    textClassName?: string;
    multiline?: boolean;
}

export const InlineInput: React.FC<InlineInputProps> = ({
    value,
    onValueChange,
    textClassName = '',
    multiline = false,
    ...props
}) => {
    if (multiline) {
        return (
            <textarea
                className={`inline-input multiline ${textClassName}`}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                rows={value.split('\n').length}
            />
        );
    }

    return (
        <input
            type="text"
            className={`inline-input ${textClassName}`}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            {...props}
        />
    );
};
