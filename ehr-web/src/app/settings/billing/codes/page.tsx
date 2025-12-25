'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Hash, Layers, ShieldCheck,
  Zap, Download, Plus, Filter, Info,
  BookOpen, GitPullRequest, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

type TerminologyType = 'ICD-10/11' | 'CPT' | 'SNOMED-CT';

interface CodeEntry {
  id: string;
  code: string;
  description: string;
  type: TerminologyType;
  status: 'active' | 'legacy' | 'staged';
  mapping?: string;
  chapter?: string;
  specialty?: string;
  alias?: string;
}

export default function ClinicalCodingPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TerminologyType>('ICD-10/11');
  const [searchQuery, setSearchQuery] = useState('');

  const [codes] = useState<CodeEntry[]>([
    // ICD-10/11
    { id: '1', code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', type: 'ICD-10/11', status: 'active', chapter: 'Endocrine', specialty: 'Internal Medicine', alias: 'T2DM' },
    { id: '2', code: 'I10', description: 'Essential (primary) hypertension', type: 'ICD-10/11', status: 'active', chapter: 'Circulatory', specialty: 'Cardiology', alias: 'HTN' },
    { id: '3', code: 'J45.909', description: 'Unspecified asthma, uncomplicated', type: 'ICD-10/11', status: 'active', chapter: 'Respiratory', specialty: 'Pulmonology' },
    { id: '4', code: 'M54.5', description: 'Low back pain', type: 'ICD-10/11', status: 'legacy', chapter: 'Musculoskeletal', specialty: 'Orthopedics' },
    { id: '5', code: 'MG30.0', description: 'Chronic primary pain (ICD-11)', type: 'ICD-10/11', status: 'staged', chapter: 'Pain Management', specialty: 'Neurology' },

    // CPT
    { id: 'c1', code: '99213', description: 'Office visit, established patient, 15 min', type: 'CPT', status: 'active', chapter: 'Evaluation & Management', specialty: 'General' },
    { id: 'c2', code: '33533', description: 'Coronary artery bypass, single arterial graft', type: 'CPT', status: 'active', chapter: 'Surgery', specialty: 'Cardiac Surgery' },
    { id: 'c3', code: '71045', description: 'X-ray exam chest, 1 view', type: 'CPT', status: 'active', chapter: 'Radiology', specialty: 'Radiology' },

    // SNOMED-CT
    { id: 's1', code: '427081008', description: 'Diabetes mellitus type 2', type: 'SNOMED-CT', status: 'active', mapping: 'E11.9', chapter: 'Clinical Finding', specialty: 'Endocrine' },
    { id: 's2', code: '38341003', description: 'Hypertension', type: 'SNOMED-CT', status: 'active', mapping: 'I10', chapter: 'Clinical Finding', specialty: 'Cardiology' },
    { id: 's3', code: '49436004', description: 'Atrial fibrillation', type: 'SNOMED-CT', status: 'active', chapter: 'Clinical Finding', specialty: 'Cardiology' },
  ]);

  const filteredCodes = codes.filter(c =>
    c.type === activeTab &&
    (c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.alias?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-5">
          <Link
            href="/settings"
            className="p-2.5 hover:bg-accent rounded-xl transition-all border border-transparent hover:border-border group"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {t('settings_registry.clinical_coding.title')}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider opacity-70">
              {t('settings_registry.clinical_coding.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-[10px] font-black uppercase border-2 h-10 px-5 hover:bg-accent transition-all">
            <Download className="h-4 w-4" />
            {t('settings_registry.clinical_coding.import_terminology')}
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-[10px] font-black uppercase h-10 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            {t('settings_registry.clinical_coding.download_packs')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Terminology Explorer */}
        <div className="lg:col-span-3 space-y-8">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-2xl w-fit border border-border/50 shadow-inner">
            {(['ICD-10/11', 'CPT', 'SNOMED-CT'] as TerminologyType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                  activeTab === tab
                    ? "bg-background text-foreground shadow-lg ring-1 ring-border translate-y-[-1px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden transition-all duration-500 group">
            <div className="p-6 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground font-mono">
                    {activeTab} Global Registry
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                      {filteredCodes.length} Standard Codes Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={t('settings_registry.clinical_coding.search_codes')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 text-xs w-full sm:w-[320px] bg-background border-2 border-border focus:border-primary transition-all rounded-xl shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground font-black uppercase tracking-[0.15em] border-b border-border">
                    <th className="px-8 py-4 text-left font-mono">Protocol Identifier</th>
                    <th className="px-8 py-4 text-left font-mono">Clinical Specification</th>
                    <th className="px-8 py-4 text-center font-mono">Taxonomy/Chapter</th>
                    <th className="px-8 py-4 text-right font-mono">Cross-Map</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredCodes.map(item => (
                    <tr key={item.id} className="hover:bg-primary/[0.02] transition-all group/row">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="font-black text-foreground font-mono bg-muted/80 px-3 py-1.5 rounded-lg border border-border shadow-sm group-hover/row:bg-background transition-all">
                            {item.code}
                          </div>
                          {item.alias && (
                            <Badge variant="outline" className="text-[8px] h-4 uppercase font-black tracking-tighter opacity-70">
                              {item.alias}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-foreground text-sm tracking-tight">{item.description}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Spec: {item.specialty || 'General'}</span>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <Badge className={cn(
                            "text-[8px] h-4 py-0 uppercase font-bold border-none",
                            item.status === 'active' ? "bg-green-500/10 text-green-700" :
                              item.status === 'legacy' ? "bg-amber-500/10 text-amber-700" :
                                "bg-blue-500/10 text-blue-700"
                          )}>
                            {item.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border">
                          <Filter className="h-3 w-3 text-muted-foreground" />
                          <span className="font-bold text-[10px] uppercase text-muted-foreground">
                            {item.chapter || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {item.mapping ? (
                          <div className="flex items-center justify-end gap-2 text-primary font-black group/map">
                            <GitPullRequest className="h-3.5 w-3.5 group-hover/map:rotate-12 transition-transform" />
                            <span className="font-mono">{item.mapping}</span>
                          </div>
                        ) : (
                          <button className="text-[10px] font-black text-muted-foreground/40 uppercase hover:text-primary transition-all hover:scale-105">
                            Define Sync
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCodes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <Search className="h-12 w-12" />
                          <p className="font-black uppercase tracking-widest text-sm">No code sequences detected</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mapping Engine Interface */}
          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000 rotate-12">
              <Layers className="h-48 w-48" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8">
              <div className="p-4 bg-primary/10 rounded-2xl h-fit shadow-inner group-hover:scale-110 transition-transform duration-500">
                <GitPullRequest className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-6 flex-1">
                <div>
                  <h4 className="text-lg font-black text-foreground uppercase tracking-widest mb-2 flex items-center gap-3">
                    {t('settings_registry.clinical_coding.mapping_engine')}
                    <Badge className="bg-primary text-white text-[9px] h-5">V3.4 AI Enabled</Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl font-medium">
                    {t('settings_registry.clinical_coding.mapping_desc')}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-background/80 backdrop-blur-xl border-2 border-border p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-primary/30 transition-all cursor-pointer group/card">
                    <div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase mb-1 tracking-wider">Automated Logic</div>
                      <div className="text-xs font-black text-foreground uppercase tracking-tight">CPT to ICD-10 Linker</div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                  </div>
                  <div className="bg-background/80 backdrop-blur-xl border-2 border-border p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-primary/30 transition-all cursor-pointer group/card">
                    <div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase mb-1 tracking-wider">Cross-walks</div>
                      <div className="text-xs font-black text-foreground uppercase tracking-tight">ICD-9 to 10 GEM Matrix</div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                  </div>
                </div>
                <Button className="bg-foreground text-background hover:bg-foreground/90 text-[10px] font-black uppercase h-11 px-8 rounded-xl shadow-xl transition-all hover:translate-y-[-2px]">
                  Initialize Global Sync Sequence
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          <div className="bg-card rounded-[2rem] border border-border shadow-2xl p-6 space-y-6 transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono">
                {t('settings_registry.clinical_coding.active_registries')}
              </h2>
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            </div>

            <div className="space-y-4">
              {[
                { name: 'HCPCS Level II', version: '2024.Q1', status: 'ready', color: 'green' },
                { name: 'DSM-5 Clinical', version: 'v5.2.0', status: 'ready', color: 'green' },
                { name: 'LOINC Master', version: 'v2.76', status: 'ready', color: 'green' },
                { name: 'ICD-11 Alpha', version: 'Build 842', status: 'staged', color: 'blue' },
              ].map((reg, idx) => (
                <div key={idx} className="p-4 bg-muted/30 rounded-2xl border-2 border-transparent hover:border-border transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{reg.name}</div>
                      <div className="text-[9px] text-muted-foreground mt-1 font-mono font-bold">Release: {reg.version}</div>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                      reg.color === 'green' ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600 animate-pulse"
                    )}>
                      {reg.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="secondary" className="w-full text-[10px] font-black uppercase h-12 border-2 border-dashed bg-transparent hover:bg-muted border-border text-muted-foreground flex items-center justify-center gap-3 rounded-2xl transition-all">
              <Layers className="h-4 w-4" />
              Integrate External FHIR V3
            </Button>
          </div>

          <div className="bg-black rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-125 transition-transform duration-1000 rotate-12">
              <ShieldCheck className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Integrity Matrix</h3>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed font-bold">
                Daily clinical coding audit completed. Encounter compliance stands at 100% for active billable periods.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                  <span>Audit Strength</span>
                  <span className="text-green-400">Optimal</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-full shadow-[0_0_20px_rgba(34,197,94,0.4)]" />
                </div>
              </div>
              <Button variant="secondary" className="w-full h-10 bg-white/5 hover:bg-white/10 border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">
                Export Compliance Log
              </Button>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-tight text-primary">Terminology Pro-Tip</h4>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  Use the 'Define Sync' button to create a many-to-one relationship between SNOMED-CT findings and ICD-10 billing codes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
