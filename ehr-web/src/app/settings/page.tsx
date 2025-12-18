'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Users, Building2, Bell, Shield, Palette, Globe, CreditCard,
  FileText, Settings as SettingsIcon, ChevronRight, Clock, Activity,
  Stethoscope, Terminal, Zap, Lock, Database, Search, ArrowUpRight,
  Sparkles, Heart, Microscope, Pill, Truck, Share2, ClipboardList,
  UserPlus, Hash, BarChart3, HardDrive, Cpu, Layers, Workflow, Key,
  MapPin, FlaskConical, Syringe, Bed, Scissors, GraduationCap, Gavel,
  Briefcase, Landmark, GitPullRequest, Boxes, History,
  TrendingUp, MonitorCheck, Crosshair, Award, BookOpen, ShieldAlert,
  LifeBuoy, UserCheck, FileSearch, Share, Archive, Wifi, Banknote,
  ShieldCheck, ShoppingCart, Activity as ActivityIcon, Users2, SearchCode,
  Globe2, HeartPulse, Building, Factory, Truck as LogisticsIcon,
  ShoppingBag, Mail, Phone, Laptop2, Fingerprint, ShieldEllipsis,
  FileBadge, Scale, Microscope as LabIcon, Eye, Ear, Thermometer,
  Stethoscope as ClinicalIcon, Dna, FileCheck, HandCoins, MessageSquare,
  Video, Smartphone, HeartHandshake, Leaf, ShieldQuestion, UserMinus,
  FilePlus, FolderOpen, Anchor, Wind, Camera, Wallet, HelpCircle, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  category: string;
  isComingSoon?: boolean;
}

const SETTINGS_DATA: SettingItem[] = [
  // --- CORE GOVERNANCE (1-10) ---
  { id: 'org', title: 'Global Enterprise', description: 'Multi-entity structure & legal hierarchy', icon: Landmark, href: '#', category: 'General Admin' },
  { id: 'facility', title: 'Facility Registry', description: 'Hospital IDs, licenses & certifications', icon: Building2, href: '/settings/facility', category: 'General Admin' },
  { id: 'locations', title: 'Space Management', description: 'Campus, building, room & bed mapping', icon: MapPin, href: '/settings/locations', category: 'General Admin' },
  { id: 'branding', title: 'Identity Engine', description: 'White-labeling & global aesthetic control', icon: Palette, href: '/settings/appearance', category: 'General Admin' },
  { id: 'timezone', title: 'Regional Master', description: 'Global calendars, currencies & timezones', icon: Globe, href: '/settings/localization', category: 'General Admin' },
  { id: 'hours', title: 'Capacity Logic', description: 'Unit-level operational availability master', icon: Clock, href: '/settings/office-hours', category: 'General Admin' },
  { id: 'tax-reg', title: 'Tax Jurisdictions', description: 'Multi-regional tax protocols and rules', icon: Landmark, href: '#', category: 'General Admin', isComingSoon: true },
  { id: 'languages', title: 'Language Packs', description: 'Translation keys and local character sets', icon: Globe2, href: '#', category: 'General Admin', isComingSoon: true },
  { id: 'audit-root', title: 'Root Audit Logs', description: 'Lowest-level system access & mutation logs', icon: ShieldCheck, href: '#', category: 'General Admin', badge: 'Root' },
  { id: 'entity-links', title: 'Entity Linking', description: 'Parent-child hospital & clinic relationships', icon: Share, href: '#', category: 'General Admin', isComingSoon: true },

  // --- CLINICAL MASTERS - EPIC/CERNER SCALE (11-30) ---
  { id: 'order-sets', title: 'Order Set Builder', description: 'Evidence-based clinical order bundles', icon: Workflow, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'drug-lib', title: 'Formulary Master', description: 'Global drug dictionary & interaction DB', icon: Pill, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'proc-lib', title: 'Procedure Registry', description: 'Surgical CPT and clinical procedural catalog', icon: Scissors, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'codes', title: 'Clinical Coding', description: 'ICD-10/11, SNOMED & LOINC registries', icon: Hash, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'templates', title: 'Documentation', description: 'Dynamic encounter forms & smart-text', icon: FileText, href: '/settings/templates', category: 'Clinical Masters' },
  { id: 'allergies', title: 'Allergy DB', description: 'Global allergen & contraindication master', icon: ShieldAlert, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'vitals', title: 'Alert Thresholds', description: 'Vital range masters for clinical alerts', icon: Activity, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'consent-templates', title: 'Consent Master', description: 'Legal and clinical consent form builder', icon: FileCheck, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'smart-triggers', title: 'Smart Triggers', description: 'Automated clinical event logic engine', icon: Zap, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'specimen-types', title: 'Specimen Registry', description: 'Global lab specimen & collection rules', icon: Syringe, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'care-plans', title: 'Care Pathways', description: 'Disease-specific longitudinal care logic', icon: Workflow, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'pharmaco', title: 'Pharmacogenomics', description: 'Genetic markers & drug sensitivity rules', icon: Dna, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'immunization', title: 'Vaccine Catalog', description: 'Global immunization schedules & registries', icon: Syringe, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'diet-masters', title: 'Dietary Masters', description: 'Nutritional constraints & meal logic', icon: ShoppingCart, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'triage-rules', title: 'Triage Logic', description: 'Emergency severity index configuration', icon: ActivityIcon, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'icu-acuity', title: 'ICU Acuity Math', description: 'SAPS/APACHE clinical scoring logic', icon: Heart, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'vte-risk', title: 'VTE Risk Master', description: 'Venous thromboembolism assessment rules', icon: Activity, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'fall-risk', title: 'Fall Assessment', description: 'Standardized fall-risk score logic', icon: Activity, href: '#', category: 'Clinical Masters', isComingSoon: true },
  { id: 'wound-care', title: 'Wound Registry', description: 'Staging, image analysis & therapy rules', icon: Camera, href: '#', category: 'Clinical Masters', isComingSoon: true },

  // --- SPECIALTY CARE UNITS (31-50) ---
  { id: 'icu', title: 'Critical Care (ICU)', description: 'Ventilation protocols & acuity scoring', icon: Heart, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'er', title: 'Emergency / Triage', description: 'ESI triage logic & rapid response flows', icon: Activity, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'ot', title: 'Surgical Deck (OT)', description: 'Sterile cycles, pre-op & anesthesia logs', icon: Scissors, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'nicu', title: 'NICU / Pediatrics', description: 'Neo-natal growth & feeding protocols', icon: Crosshair, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'dialysis', title: 'Renal Dialysis', description: 'Cycle management & dialysis unit logic', icon: FlaskConical, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'oncology', title: 'Molecular Oncology', description: 'Chemotherapy regimens & staging logic', icon: Dna, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'ivf', title: 'Reproductive Med', description: 'Embryology lab flows & IVF cycles', icon: Syringe, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'cardio', title: 'Cardiology Center', description: 'Holter, Stress & Cath-lab protocols', icon: HeartPulse, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'mental', title: 'Psychiatry Unit', description: 'Mental health assessment & safety logs', icon: ShieldCheck, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'ophthalmology', title: 'Ophthalmology', description: 'Visual acuity & retinopathy screening', icon: Eye, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'ent', title: 'ENT / Audiology', description: 'Hearing tests & endoscopic procedure logs', icon: Ear, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'derma', title: 'Dermatology Hub', description: 'Skin lesion imaging & biopsy protocols', icon: Camera, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'ortho', title: 'Orthopedics / PT', description: 'Physiotherapy & fracture management', icon: Activity, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'pulmo', title: 'Pulmonology', description: 'PFT registers & respiratory therapy', icon: Wind, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'gastro', title: 'Gastroenterology', description: 'Endoscopy & colonoscopy workflow rules', icon: Activity, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'neuro', title: 'Neurology / EEG', description: 'Stroke protocols & EEG scan registry', icon: Activity, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'transplant', title: 'Transplant Hub', description: 'Waitlist management & organ matching', icon: Anchor, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'palliative', title: 'Palliative Care', description: 'Pain management & end-of-life care', icon: HeartHandshake, href: '#', category: 'Medical Specialty', isComingSoon: true },
  { id: 'telemed', title: 'Virtual Health', description: 'Tele-consultation & remote sensing', icon: Video, href: '#', category: 'Medical Specialty', isComingSoon: true },

  // --- DIAGNOSTICS & ANCILLARY (51-65) ---
  { id: 'lis', title: 'Laboratory (LIS)', description: 'Sample tracking & analyzer interfacing', icon: Microscope, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
  { id: 'ris', title: 'Imaging (PACS)', description: 'DICOM routing & PACS storage management', icon: Layers, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
  { id: 'path', title: 'Cellular Pathology', description: 'Histopath & frozen section workflows', icon: LabIcon, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
  { id: 'blood', title: 'Blood Transfusion', description: 'Donation tracking & cross-match logic', icon: Syringe, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
  { id: 'cssd', title: 'Sterile Supply', description: 'CSSD asset cycles & sterile validity', icon: ShieldCheck, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
  { id: 'biomed', title: 'Biomedical Eng', description: 'Medical device maintenance & calibration', icon: MonitorCheck, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
  { id: 'molecular', title: 'Molecular Dx', description: 'PCR & DNA sequencing workflows', icon: Dna, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
  { id: 'pharm-clinical', title: 'Clinical Pharmacy', description: 'TPN mixing & clinical drug counseling', icon: Pill, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },

  // --- HOSPITAL LOGISTICS (66-80) ---
  { id: 'pharma', title: 'Central Pharmacy', description: 'Global drug distribution & narcotic logs', icon: Pill, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'inventory', title: 'Inventory Control', description: 'Store management, re-order & PO logs', icon: Boxes, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'scm', title: 'Supply Chain (SCM)', description: 'Vendor management & procurement engine', icon: Truck, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'laundry', title: 'Linen & Laundry', description: 'Linen circulation & sanitation logs', icon: Archive, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'dietary', title: 'Food & Nutrition', description: 'Dietetic orders & kitchen workflow', icon: ShoppingCart, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'housekeep', title: 'Environmental Svcs', description: 'Cleaning schedules & bed-turnover tracking', icon: Archive, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'mrd', title: 'Medical Records', description: 'Physical chart tracking & digital archival', icon: FolderOpen, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'waste', title: 'Medical Waste', description: 'Bio-hazard tracking & disposal registers', icon: Leaf, href: '#', category: 'Hospital Logistics', isComingSoon: true },
  { id: 'security-phys', title: 'Physical Security', description: 'CCTV, access cards & gate logs', icon: Lock, href: '#', category: 'Hospital Logistics', isComingSoon: true },

  // --- REVENUE CYCLE - RCM (81-95) ---
  { id: 'billing', title: 'Revenue Engine', description: 'Master billing ledger & charging rules', icon: CreditCard, href: '/settings/billing', category: 'Revenue Cycle' },
  { id: 'insurance', title: 'Insurance / TPA', description: 'Payer contracts & pre-auth protocols', icon: Landmark, href: '#', category: 'Revenue Cycle', isComingSoon: true },
  { id: 'rcm-audit', title: 'Financial Auditing', description: 'Leak detection & revenue reconciliation', icon: TrendingUp, href: '#', category: 'Revenue Cycle', isComingSoon: true },
  { id: 'chargemaster', title: 'Global Fee Master', description: 'Departmental tariffs & service masters', icon: BarChart3, href: '#', category: 'Revenue Cycle', isComingSoon: true },
  { id: 'discounts', title: 'Discount Engine', description: 'Corporate & patient waiver logic', icon: HandCoins, href: '#', category: 'Revenue Cycle', isComingSoon: true },
  { id: 'claims', title: 'Claims Exchange', description: 'Electronic claim scrubbing & submission', icon: FilePlus, href: '#', category: 'Revenue Cycle', isComingSoon: true },
  { id: 'ar-mgmt', title: 'Accounts Receivable', description: 'Aging reports & payment follow-up', icon: TrendingUp, href: '#', category: 'Revenue Cycle', isComingSoon: true },
  { id: 'collections', title: 'Collections Hub', description: 'Patient balance & recovery workflows', icon: Wallet, href: '#', category: 'Revenue Cycle', isComingSoon: true },

  // --- HUMAN CAPITAL & HR (96-110) ---
  { id: 'staff', title: 'People Registry', description: 'Staff records, credentials & HR files', icon: Users, href: '/staff', category: 'People & HR' },
  { id: 'payroll', title: 'Payroll Engine', description: 'Salary components & tax math logic', icon: Banknote, href: '#', category: 'People & HR', isComingSoon: true },
  { id: 'attendance', title: 'Time & Attendance', description: 'Biometric logs & leave management', icon: Clock, href: '#', category: 'People & HR', isComingSoon: true },
  { id: 'rostering', title: 'Clinical Rosters', description: 'Staff shift patterns & assignment rules', icon: History, href: '#', category: 'People & HR', isComingSoon: true },
  { id: 'training', title: 'Skills & Training', description: 'CME credits & competency tracking', icon: GraduationCap, href: '#', category: 'People & HR', isComingSoon: true },
  { id: 'recruitment', title: 'Talent Pipeline', description: 'Clinician recruitment & hiring logs', icon: UserPlus, href: '#', category: 'People & HR', isComingSoon: true },

  // --- RESEARCH & PUBLIC HEALTH (111-125) ---
  { id: 'trials', title: 'Clinical Trials', description: 'Trial protocols, IRB & subject logs', icon: SearchCode, href: '#', category: 'Public Health' },
  { id: 'pop-health', title: 'Population Health', description: 'Risk profiling & epidemiology registries', icon: Globe2, href: '#', category: 'Public Health', isComingSoon: true },
  { id: 'surveillance', title: 'Outbreak Watch', description: 'Real-time infectious disease tracking', icon: ActivityIcon, href: '#', category: 'Public Health', isComingSoon: true },
  { id: 'genomic-db', title: 'Genomic Lake', description: 'Bio-bank and genetic sequencing registry', icon: Dna, href: '#', category: 'Public Health', isComingSoon: true },

  // --- INFRASTRUCTURE & TECH (126-140) ---
  { id: 'fhir-bridge', title: 'HL7 / FHIR Bridge', description: 'Interoperability & data exchange hub', icon: Share2, href: '#', category: 'Infrastructure' },
  { id: 'api-mgmt', title: 'API Management', description: 'Key registry & developer access logs', icon: Terminal, href: '#', category: 'Infrastructure' },
  { id: 'cloud-nodes', title: 'Cluster Health', description: 'Compute, memory & node distribution', icon: Cpu, href: '#', category: 'Infrastructure', isComingSoon: true },
  { id: 'cyber', title: 'Cyber Defense', description: 'SSO, MFA & threat detection registry', icon: Lock, href: '#', category: 'Infrastructure' },
  { id: 'it-support', title: 'IT Service Management', description: 'Internal ticket registry & asset health', icon: LifeBuoy, href: '#', category: 'Infrastructure', isComingSoon: true },
];

// Removed local BanknoteIcon helper as it's now imported as Banknote

// Removed local BanknoteIcon helper as it's now imported as Banknote

export default function SettingsPage() {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showGuide, setShowGuide] = useState(false);

  const categories = useMemo(() => ['All', ...Array.from(new Set(SETTINGS_DATA.map(s => s.category)))], []);

  const filteredSettings = SETTINGS_DATA.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1500px] mx-auto p-4 animate-in fade-in duration-500">
      {/* Refined Compact Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Platform Settings
            <span className="text-gray-300 font-light translate-y-[1px]">/</span>
            <span className="text-gray-400 text-sm font-semibold translate-y-[1px]">Registry Explorer</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Configuration-driven clinical & administrative controls</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] font-medium transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none"
            />
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all border",
              showGuide ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            )}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {showGuide ? "Close Guide" : "Help Guide"}
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="mb-6 p-3 bg-blue-50/50 border border-blue-100 rounded-lg animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 rounded text-blue-600">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-tight mb-1">Module Registry Guide</h4>
              <p className="text-[10px] text-blue-700 leading-relaxed max-w-3xl">
                This registry contains all global configuration modules for the EHR platform.
                Use the category filters to browse by domain (Clinical, Finance, Admin).
                Modules marked with a <span className="font-bold underline italic">Scheduled</span> badge are upcoming features in the next release.
                Hover over any card to view its specific functional flow.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Extreme Compact Filter Bar */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all uppercase tracking-tight border",
              activeCategory === cat
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* The Ultra-Compact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
        {filteredSettings.map((setting) => (
          <RegistryCard key={setting.id} setting={setting} />
        ))}
      </div>

      {filteredSettings.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
          <MonitorCheck className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight mb-1">No Modules Found</h3>
          <p className="text-[10px] text-gray-400 font-medium mb-4">Try adjusting your search or category filter</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Minimal Footer */}
      <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">System Status: Stable</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-tight italic text-gray-300">HIPAA Compliant Environment</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded border border-gray-100 text-gray-500">
            <Cpu className="h-3 w-3" />
            NODE: B2-NORTH
          </div>
          <span>v4.0.2-stable</span>
        </div>
      </div>
    </div>
  );
}

function RegistryCard({ setting }: { setting: SettingItem }) {
  const Icon = setting.icon;

  return (
    <Link
      href={setting.href}
      title={`Configure flow for: ${setting.title}`}
      className={cn(
        "group relative flex flex-col p-3 rounded-lg border transition-all duration-200 h-full",
        setting.isComingSoon
          ? "bg-gray-50/60 border-gray-100 opacity-60 cursor-not-allowed"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 cursor-pointer shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
          setting.isComingSoon
            ? "bg-gray-200 text-gray-400"
            : "bg-gray-50 text-gray-600 group-hover:bg-gray-900 group-hover:text-white"
        )}>
          <Icon className="h-4 w-4" />
        </div>

        {setting.isComingSoon ? (
          <span className="px-1 py-0.5 rounded bg-gray-100 text-[6px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200/50">Scheduled</span>
        ) : (
          <div className="flex items-center gap-1.5">
            {setting.badge && (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[7px] font-bold uppercase tracking-tight">
                {setting.badge}
              </span>
            )}
            <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-gray-900 transition-colors" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className={cn(
          "text-[11px] font-bold leading-tight",
          setting.isComingSoon ? "text-gray-500" : "text-gray-900 shadow-none"
        )}>
          {setting.title}
        </h3>
        <p className="text-[9px] text-gray-500 font-medium leading-normal line-clamp-2 uppercase tracking-tight">
          {setting.description}
        </p>
      </div>

      {/* Tooltip hint integrated into card for practical guidance */}
      {!setting.isComingSoon && (
        <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 rounded-lg pointer-events-none">
          <Info className="h-4 w-4 text-blue-400 mb-2" />
          <p className="text-[9px] text-white font-bold uppercase tracking-widest text-center leading-relaxed">
            Configure {setting.title} workflow, protocols and global entities
          </p>
          <span className="mt-2 text-[8px] text-gray-400 font-medium uppercase underline">Click to open manager</span>
        </div>
      )}
    </Link>
  );
}
