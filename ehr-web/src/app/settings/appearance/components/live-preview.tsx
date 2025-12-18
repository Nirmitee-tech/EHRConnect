import React from 'react';
import { ThemeSettings } from '@/contexts/theme-context';
import { cn, getContrastColor } from '@/lib/utils';

interface LivePreviewProps {
    settings: ThemeSettings;
}

export const LivePreview = ({ settings }: LivePreviewProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900">Live Preview</h2>
                <span className="text-[10px] text-gray-400 font-mono">Real-time Visualization</span>
            </div>

            <div className="rounded-lg border border-gray-100 overflow-hidden shadow-inner flex flex-col md:flex-row min-h-[400px]">
                {/* Sidebar Preview */}
                <div
                    className="w-full md:w-1/3 p-4 flex flex-col"
                    style={{
                        backgroundColor: settings.sidebarBackgroundColor,
                        fontFamily: settings.fontFamily
                    }}
                >
                    <div className="flex items-center space-x-2 mb-6">
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                        ) : (
                            <div className="w-6 h-6 rounded flex items-center justify-center shadow-sm" style={{ backgroundColor: settings.primaryColor }}>
                                <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: settings.primaryTextColor || (getContrastColor(settings.primaryColor) === 'white' ? '#FFFFFF' : '#000000') }}
                                />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2
                                className="text-[11px] font-bold truncate leading-tight"
                                style={{ color: settings.sidebarTextColor || (getContrastColor(settings.sidebarBackgroundColor) === 'white' ? '#FFFFFF' : '#000000') }}
                            >
                                {settings.orgNameOverride || 'EHR Connect'}
                            </h2>
                            <p
                                className="text-[8px] font-medium opacity-60 truncate uppercase tracking-tighter"
                                style={{ color: settings.sidebarTextColor || (getContrastColor(settings.sidebarBackgroundColor) === 'white' ? '#FFFFFF' : '#000000') }}
                            >
                                Location Name
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {['Dashboard', 'Patients', 'Staff'].map((item, idx) => {
                            const isActive = idx === 0;
                            const activeBg = settings.sidebarActiveColor;
                            const activeText = settings.sidebarActiveTextColor || (getContrastColor(activeBg) === 'white' ? '#FFFFFF' : '#000000');
                            const inactiveText = settings.sidebarTextColor || (getContrastColor(settings.sidebarBackgroundColor) === 'white' ? '#FFFFFF' : '#000000');

                            return (
                                <div
                                    key={item}
                                    className="px-2 py-1.5 rounded flex items-center space-x-2 shadow-sm transition-all"
                                    style={{
                                        backgroundColor: isActive ? activeBg : 'transparent',
                                        color: isActive ? activeText : inactiveText
                                    }}
                                >
                                    <div className="w-1 h-1 rounded-full shadow-glow" style={{ backgroundColor: settings.accentColor }} />
                                    <span className="text-[10px] font-medium">{item}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area Preview */}
                <div
                    className={cn(
                        "w-full md:w-2/3 p-6 flex flex-col items-center justify-center text-center space-y-4 transition-colors duration-300",
                        ['#000000', '#121212', '#0F172A', '#18181B'].includes(settings.sidebarBackgroundColor)
                            ? "bg-[#1e1e1e] text-white"
                            : "bg-gray-50 text-gray-900"
                    )}
                >
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-1.5 text-[10px] font-bold rounded shadow-md transform hover:scale-105 transition-transform"
                                style={{
                                    backgroundColor: settings.primaryColor,
                                    color: settings.primaryTextColor || (getContrastColor(settings.primaryColor) === 'white' ? '#FFFFFF' : '#000000')
                                }}
                            >
                                Primary
                            </button>
                            <button
                                className="px-4 py-1.5 text-[10px] font-bold text-white rounded shadow-md transform hover:scale-105 transition-transform"
                                style={{ backgroundColor: settings.secondaryColor }}
                            >
                                Secondary
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse shadow-glow" style={{ backgroundColor: settings.accentColor }} />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                Accent Active
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] max-w-[150px] leading-relaxed text-gray-400">
                        Experimental branding for {settings.orgNameOverride || 'the facility'}.
                    </p>
                </div>
            </div>
        </div>
    );
};
