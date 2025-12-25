'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Activity, Plus, Filter, Info,
    Bell, Settings, ShieldCheck, HeartPulse,
    Thermometer, Wind, Droplets, Zap, Users,
    ChevronRight, Save, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

type AgeGroup = 'Neonate' | 'Pediatric' | 'Adult' | 'Geriatric';

interface VitalThreshold {
    id: string;
    vital: string;
    unit: string;
    group: AgeGroup;
    normalRange: { min: number; max: number };
    yellowRange: { min: number; max: number };
    redRange: { min: number; max: number };
}

export default function AlertThresholdsPage() {
    const { t } = useTranslation('common');
    const [activeGroup, setActiveGroup] = useState<AgeGroup>('Adult');

    const [thresholds] = useState<VitalThreshold[]>([
        // Adult
        { id: '1', vital: 'Heart Rate', unit: 'BPM', group: 'Adult', normalRange: { min: 60, max: 100 }, yellowRange: { min: 50, max: 120 }, redRange: { min: 40, max: 140 } },
        { id: '2', vital: 'Systolic BP', unit: 'mmHg', group: 'Adult', normalRange: { min: 90, max: 140 }, yellowRange: { min: 80, max: 160 }, redRange: { min: 70, max: 180 } },
        { id: '3', vital: 'Oxygen Saturation', unit: '%', group: 'Adult', normalRange: { min: 95, max: 100 }, yellowRange: { min: 90, max: 94 }, redRange: { min: 0, max: 89 } },
        { id: '4', vital: 'Temperature', unit: '°C', group: 'Adult', normalRange: { min: 36.5, max: 37.5 }, yellowRange: { min: 36.0, max: 38.5 }, redRange: { min: 35.0, max: 39.5 } },

        // Neonate
        { id: '5', vital: 'Heart Rate', unit: 'BPM', group: 'Neonate', normalRange: { min: 120, max: 160 }, yellowRange: { min: 100, max: 180 }, redRange: { min: 80, max: 200 } },
        { id: '6', vital: 'Systolic BP', unit: 'mmHg', group: 'Neonate', normalRange: { min: 60, max: 90 }, yellowRange: { min: 50, max: 100 }, redRange: { min: 40, max: 110 } },
        { id: '7', vital: 'Oxygen Saturation', unit: '%', group: 'Neonate', normalRange: { min: 92, max: 98 }, yellowRange: { min: 88, max: 91 }, redRange: { min: 0, max: 87 } },

        // Pediatric
        { id: '8', vital: 'Heart Rate', unit: 'BPM', group: 'Pediatric', normalRange: { min: 80, max: 120 }, yellowRange: { min: 70, max: 140 }, redRange: { min: 60, max: 160 } },
        { id: '9', vital: 'Respiratory Rate', unit: 'BPM', group: 'Pediatric', normalRange: { min: 20, max: 30 }, yellowRange: { min: 15, max: 40 }, redRange: { min: 10, max: 50 } },

        // Geriatric
        { id: '10', vital: 'Diastolic BP', unit: 'mmHg', group: 'Geriatric', normalRange: { min: 60, max: 90 }, yellowRange: { min: 50, max: 100 }, redRange: { min: 40, max: 110 } },
        { id: '11', vital: 'Temperature', unit: '°C', group: 'Geriatric', normalRange: { min: 36.0, max: 37.2 }, yellowRange: { min: 35.5, max: 38.0 }, redRange: { min: 35.0, max: 39.0 } },
    ]);

    const filteredThresholds = thresholds.filter(t => t.group === activeGroup);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/settings"
                        className="p-2 hover:bg-accent rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                            {t('settings_registry.vitals.title')}
                            <Activity className="h-5 w-5 text-primary" />
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">{t('settings_registry.vitals.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 text-[10px] font-bold uppercase border-border hover:bg-accent">
                        <Settings className="h-4 w-4" />
                        {t('settings_registry.vitals.alert_settings')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase shadow-sm">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.vitals.add_threshold')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Age Group Selector */}
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit border border-border shadow-sm">
                        {(['Neonate', 'Pediatric', 'Adult', 'Geriatric'] as AgeGroup[]).map((group) => (
                            <button
                                key={group}
                                onClick={() => setActiveGroup(group)}
                                className={cn(
                                    "px-5 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest flex items-center gap-2",
                                    activeGroup === group
                                        ? "bg-background text-foreground shadow-lg ring-1 ring-border translate-y-[-1px]"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Users className="h-3.5 w-3.5" />
                                {group}
                            </button>
                        ))}
                    </div>

                    {/* Threshold Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredThresholds.map((item) => (
                            <div key={item.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-xl transition-all group overflow-hidden border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            {item.vital === 'Heart Rate' && <HeartPulse className="h-5 w-5" />}
                                            {item.vital === 'Temperature' && <Thermometer className="h-5 w-5" />}
                                            {item.vital === 'Systolic BP' && <Zap className="h-5 w-5" />}
                                            {item.vital === 'Oxygen Saturation' && <Droplets className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground font-mono">{item.vital}</h3>
                                            <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter">{item.unit} • Global Rule</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[9px] font-bold px-3">
                                        ACTIVE
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <ThresholdRow label="Normal" range={item.normalRange} color="bg-green-500" />
                                    <ThresholdRow label="Yellow (Warning)" range={item.yellowRange} color="bg-amber-500" />
                                    <ThresholdRow label="Red (Critical)" range={item.redRange} color="bg-destructive" />
                                </div>

                                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase">
                                        <Clock className="h-3 w-3" />
                                        Last Adjusted: 12 Nov
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase hover:bg-accent hover:text-foreground text-primary">
                                        Modify Ranges
                                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Alert Intelligence Unit */}
                    <div className="bg-indigo-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <Zap className="h-32 w-32 text-white" />
                        </div>
                        <div className="relative z-10 flex gap-6">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                                <Zap className="h-7 w-7 text-indigo-200" />
                            </div>
                            <div className="space-y-5 flex-1">
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        Platform Intelligence Units
                                        <Badge className="bg-indigo-400/20 text-indigo-200 border-none text-[8px] h-3.5 px-2">Live Analysis</Badge>
                                    </h4>
                                    <p className="text-xs text-indigo-100/70 leading-relaxed max-w-2xl font-medium italic">
                                        The AI Assistant monitors these thresholds in real-time. If multiple parameters cross the "Soft Trigger" simultaneously, a Predictive Hazard Alert is sent to the charge nurse.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex-1 hover:bg-white/10 transition-colors">
                                        <div className="text-[9px] font-bold text-indigo-300 uppercase mb-2 tracking-widest">Early Warning (EWS)</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">NEWS2 Scoring</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex-1 hover:bg-white/10 transition-colors">
                                        <div className="text-[9px] font-bold text-indigo-300 uppercase mb-2 tracking-widest">Sepsis Marker</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">SIRS Logic Engine</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                                        </div>
                                    </div>
                                </div>
                                <Button className="bg-white text-indigo-900 hover:bg-indigo-50 text-[10px] font-bold uppercase h-9 px-8 shadow-xl border-none">
                                    Configure Smart Logic
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border shadow-lg p-5 space-y-6">
                        <div>
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <Info className="h-3.5 w-3.5 text-primary" />
                                {t('settings_registry.vitals.alert_desc')}
                            </h2>
                            <div className="space-y-3">
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                    Yellow Alerts generate a visual indicator on patient dashboards. Red Alerts trigger audible alarms and mobile notifications for the primary caregiver.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <Settings className="h-3.5 w-3.5 text-primary" />
                                Advanced Config
                            </h2>
                            <Button variant="secondary" className="w-full text-[10px] font-bold uppercase h-9 border-dashed border-2 bg-transparent hover:bg-accent border-border text-muted-foreground flex items-center justify-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {t('settings_registry.vitals.unit_overrides')}
                            </Button>
                            <Button variant="secondary" className="w-full text-[10px] font-bold uppercase h-9 border-dashed border-2 bg-transparent hover:bg-accent border-border text-muted-foreground flex items-center justify-center gap-2">
                                <Activity className="h-3.5 w-3.5" />
                                {t('settings_registry.vitals.icu_monitors')}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Zap className="h-20 w-20" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2 text-blue-200">
                                <Zap className="h-4 w-4" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('settings_registry.vitals.optimization')}</h3>
                            </div>
                            <p className="text-[10px] text-blue-50 leading-relaxed font-bold">
                                Optimization complete. Automated range adjustments based on 30-day inpatient outcome data are ready for review.
                            </p>
                            <Button className="w-full h-9 bg-white text-blue-600 hover:bg-blue-50 text-[10px] font-bold uppercase border-none shadow-lg">
                                Review Recommendations
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThresholdRow({ label, range, color }: { label: string, range: { min: number, max: number }, color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">{range.min} - {range.max}</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex gap-1">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: '100%' }} />
            </div>
        </div>
    );
}
