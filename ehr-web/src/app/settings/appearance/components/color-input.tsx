import React from 'react';
import { ThemeSettings } from '@/contexts/theme-context';

interface ColorInputProps {
    label: string;
    field: keyof ThemeSettings;
    description: string;
    value: string;
    onChange: (field: keyof ThemeSettings, value: string) => void;
}

export const ColorInput = ({
    label,
    field,
    description,
    value,
    onChange
}: ColorInputProps) => (
    <div className="flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
        <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-900 truncate">{label}</label>
            <p className="text-[10px] text-gray-500 truncate">{description}</p>
        </div>
        <div className="flex items-center gap-2">
            <div
                className="relative w-8 h-8 rounded-md border border-gray-200 overflow-hidden shadow-sm shrink-0 transition-transform active:scale-90"
                style={{ backgroundColor: value || 'transparent' }}
            >
                <input
                    type="color"
                    value={value || '#ffffff'}
                    onInput={(e) => onChange(field, (e.target as HTMLInputElement).value)}
                    className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0"
                />
            </div>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(field, e.target.value)}
                className="w-20 px-2 py-1 text-[11px] font-mono border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                placeholder="Auto"
                maxLength={7}
            />
            {!value && (
                <span className="text-[9px] text-primary font-bold uppercase tracking-tighter">Smart</span>
            )}
        </div>
    </div>
);
