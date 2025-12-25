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
  FilePlus, FolderOpen, Anchor, Wind, Camera, Wallet, HelpCircle, Info,
  Droplets, Accessibility, Baby, ArrowLeft, Plus, Rocket
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
export default function SettingsPage() {
  const { t } = useTranslation('common');

  const SETTINGS_DATA: SettingItem[] = [
    // --- CORE GOVERNANCE (1-10) ---
    { id: 'org', title: 'Global Enterprise', description: 'Multi-entity structure & legal hierarchy', icon: Landmark, href: '#', category: 'General Admin' },
    { id: 'facility', title: t('settings_registry.facility_settings.title'), description: t('settings_registry.facility_settings.subtitle'), icon: Building2, href: '/settings/facility', category: 'General Admin' },
    { id: 'locations', title: t('settings_registry.locations.title'), description: t('settings_registry.locations.subtitle'), icon: MapPin, href: '/settings/locations', category: 'General Admin' },
    { id: 'branding', title: t('settings_registry.appearance.title'), description: t('settings_registry.appearance.subtitle'), icon: Palette, href: '/settings/appearance', category: 'General Admin' },
    { id: 'timezone', title: 'Regional Master', description: 'Global calendars, currencies & timezones', icon: Globe, href: '/settings/localization', category: 'General Admin' },
    { id: 'hours', title: 'Capacity Logic', description: 'Unit-level operational availability master', icon: Clock, href: '/settings/office-hours', category: 'General Admin' },
    { id: 'tax-reg', title: 'Tax Jurisdictions', description: 'Multi-regional tax protocols and rules', icon: Landmark, href: '/settings/tax-jurisdictions', category: 'General Admin' },
    { id: 'languages', title: 'Language Packs', description: 'Translation keys and local character sets', icon: Globe2, href: '/settings/languages', category: 'General Admin' },
    { id: 'audit-root', title: 'Root Audit Logs', description: 'Lowest-level system access & mutation logs', icon: ShieldCheck, href: '#', category: 'General Admin', badge: 'Root' },
    { id: 'entity-links', title: t('settings_registry.entity_linking.title'), description: t('settings_registry.entity_linking.subtitle'), icon: Share, href: '/settings/entity-linking', category: 'General Admin' },

    // --- CLINICAL MASTERS - EPIC/CERNER SCALE (11-30) ---
    { id: 'order-sets', title: t('settings_registry.order_sets.title'), description: t('settings_registry.order_sets.subtitle'), icon: Workflow, href: '/settings/order-sets', category: 'Clinical Masters' },
    { id: 'drug-lib', title: t('settings_registry.formulary.title'), description: t('settings_registry.formulary.subtitle'), icon: Pill, href: '/settings/formulary', category: 'Clinical Masters' },
    { id: 'proc-lib', title: t('settings_registry.procedures.title'), description: t('settings_registry.procedures.subtitle'), icon: Scissors, href: '/settings/procedures', category: 'Clinical Masters' },
    { id: 'codes', title: t('settings_registry.clinical_coding.title'), description: t('settings_registry.clinical_coding.subtitle'), icon: Hash, href: '/settings/billing/codes', category: 'Clinical Masters' },
    { id: 'templates', title: 'Documentation', description: 'Dynamic encounter forms & smart-text', icon: FileText, href: '/settings/templates', category: 'Clinical Masters' },
    { id: 'allergies', title: t('settings_registry.allergies.title'), description: t('settings_registry.allergies.subtitle'), icon: ShieldAlert, href: '/settings/allergies', category: 'Clinical Masters' },
    { id: 'vitals', title: t('settings_registry.vitals.title'), description: t('settings_registry.vitals.subtitle'), icon: Activity, href: '/settings/vitals', category: 'Clinical Masters' },
    { id: 'consent-templates', title: t('settings_registry.consents.title'), description: t('settings_registry.consents.subtitle'), icon: FileCheck, href: '/settings/consents', category: 'Clinical Masters' },
    { id: 'smart-triggers', title: t('settings_registry.smart_triggers.title'), description: t('settings_registry.smart_triggers.subtitle'), icon: Zap, href: '/settings/smart-triggers', category: 'Clinical Masters' },
    { id: 'specimen-types', title: t('settings_registry.specimen_types.title'), description: t('settings_registry.specimen_types.subtitle'), icon: Syringe, href: '/settings/specimen-types', category: 'Clinical Masters' },
    { id: 'care-plans', title: t('settings_registry.care_plans.title'), description: t('settings_registry.care_plans.subtitle'), icon: Workflow, href: '/settings/care-plans', category: 'Clinical Masters' },
    { id: 'pharmaco', title: t('settings_registry.pharmaco.title'), description: t('settings_registry.pharmaco.subtitle'), icon: Dna, href: '/settings/pharmaco', category: 'Clinical Masters' },
    { id: 'immunization', title: t('settings_registry.immunization.title'), description: t('settings_registry.immunization.subtitle'), icon: Syringe, href: '/settings/immunization', category: 'Clinical Masters' },
    { id: 'diet-masters', title: 'Dietary Masters', description: 'Nutritional constraints & meal logic', icon: ShoppingCart, href: '/settings/dietary', category: 'Clinical Masters' },
    { id: 'triage-rules', title: t('settings_registry.triage.title'), description: t('settings_registry.triage.subtitle'), icon: ActivityIcon, href: '/settings/triage-rules', category: 'Clinical Masters' },
    { id: 'icu-acuity', title: t('settings_registry.icu.title'), description: t('settings_registry.icu.subtitle'), icon: Heart, href: '/settings/icu-acuity', category: 'Clinical Masters' },
    { id: 'vte-risk', title: 'VTE Risk Master', description: 'Venous thromboembolism assessment rules', icon: Activity, href: '#', category: 'Clinical Masters', isComingSoon: true },
    { id: 'fall-risk', title: 'Fall Assessment', description: 'Standardized fall-risk score logic', icon: Activity, href: '#', category: 'Clinical Masters', isComingSoon: true },
    { id: 'wound-care', title: 'Wound Registry', description: 'Staging, image analysis & therapy rules', icon: Camera, href: '#', category: 'Clinical Masters', isComingSoon: true },
    { id: 'patient-education', title: 'Patient Education', description: 'Manage patient education modules and content', icon: BookOpen, href: '/settings/patient-education', category: 'Clinical Masters', isComingSoon: false },
    { id: 'dialysis-masters', title: t('settings_registry.dialysis.title'), description: t('settings_registry.dialysis.subtitle'), icon: Droplets, href: '/settings/dialysis-masters', category: 'Clinical Masters' },
    { id: 'rehab-logic', title: 'Rehab Logic', description: 'Functional scoring & therapy goals', icon: Accessibility, href: '/settings/rehab-logic', category: 'Clinical Masters' },
    { id: 'theatre-config', title: t('settings_registry.theatre.title'), description: t('settings_registry.theatre.subtitle'), icon: Scissors, href: '/settings/theatre-config', category: 'Clinical Masters' },
    { id: 'maternity-logic', title: t('settings_registry.maternity.title'), description: t('settings_registry.maternity.subtitle'), icon: Baby, href: '/settings/maternity-logic', category: 'Clinical Masters' },

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
    { id: 'lis', title: t('settings_registry.lis.title'), description: t('settings_registry.lis.subtitle'), icon: Microscope, href: '/settings/lis', category: 'Diagnostic & Ancillary' },
    { id: 'ris', title: t('settings_registry.ris.title'), description: t('settings_registry.ris.subtitle'), icon: Layers, href: '/settings/ris', category: 'Diagnostic & Ancillary' },
    { id: 'path', title: t('settings_registry.pathology.title'), description: t('settings_registry.pathology.subtitle'), icon: LabIcon, href: '/settings/pathology', category: 'Diagnostic & Ancillary' },
    { id: 'blood', title: t('settings_registry.blood_bank.title'), description: t('settings_registry.blood_bank.subtitle'), icon: Syringe, href: '/settings/blood-bank', category: 'Diagnostic & Ancillary' },
    { id: 'cssd', title: t('settings_registry.cssd.title'), description: t('settings_registry.cssd.subtitle'), icon: ShieldCheck, href: '/settings/cssd', category: 'Diagnostic & Ancillary' },
    { id: 'biomed', title: t('settings_registry.biomed.title'), description: t('settings_registry.biomed.subtitle'), icon: MonitorCheck, href: '/settings/biomed', category: 'Diagnostic & Ancillary' },
    { id: 'molecular', title: 'Molecular Dx', description: 'PCR & DNA sequencing workflows', icon: Dna, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },
    { id: 'pharm-clinical', title: 'Clinical Pharmacy', description: 'TPN mixing & clinical drug counseling', icon: Pill, href: '#', category: 'Diagnostic & Ancillary', isComingSoon: true },

    // --- HOSPITAL LOGISTICS (66-80) ---
    { id: 'pharma', title: t('settings_registry.central_pharmacy.title'), description: t('settings_registry.central_pharmacy.subtitle'), icon: Pill, href: '/settings/central-pharmacy', category: 'Hospital Logistics' },
    { id: 'inventory', title: t('settings_registry.inventory.title'), description: t('settings_registry.inventory.subtitle'), icon: Boxes, href: '/settings/inventory', category: 'Hospital Logistics' },
    { id: 'scm', title: t('settings_registry.scm.title'), description: t('settings_registry.scm.subtitle'), icon: Truck, href: '/settings/scm', category: 'Hospital Logistics' },
    { id: 'laundry', title: 'Linen & Laundry', description: 'Linen circulation & sanitation logs', icon: Archive, href: '#', category: 'Hospital Logistics', isComingSoon: true },
    { id: 'dietary', title: 'Food & Nutrition', description: 'Dietetic orders & kitchen workflow', icon: ShoppingCart, href: '/settings/dietary', category: 'Hospital Logistics' },
    { id: 'housekeep', title: 'Environmental Svcs', description: 'Cleaning schedules & bed-turnover tracking', icon: Archive, href: '#', category: 'Hospital Logistics', isComingSoon: true },
    { id: 'mrd', title: t('settings_registry.mrd.title'), description: t('settings_registry.mrd.subtitle'), icon: FolderOpen, href: '/settings/mrd', category: 'Hospital Logistics' },
    { id: 'waste', title: 'Medical Waste', description: 'Bio-hazard tracking & disposal registers', icon: Leaf, href: '#', category: 'Hospital Logistics', isComingSoon: true },
    { id: 'security-phys', title: 'Physical Security', description: 'CCTV, access cards & gate logs', icon: Lock, href: '#', category: 'Hospital Logistics', isComingSoon: true },

    // --- REVENUE CYCLE - RCM (81-95) ---
    { id: 'billing', title: 'Billing & Accounting', description: 'Chart of accounts, billing codes, payers & fee schedules', icon: CreditCard, href: '/settings/billing', category: 'Revenue Cycle' },
    { id: 'insurance', title: t('settings_registry.insurance_registry.title'), description: t('settings_registry.insurance_registry.subtitle'), icon: Landmark, href: '/settings/insurance', category: 'Revenue Cycle' },
    { id: 'chargemaster', title: t('settings_registry.chargemaster.title'), description: t('settings_registry.chargemaster.subtitle'), icon: BarChart3, href: '/settings/chargemaster', category: 'Revenue Cycle' },
    { id: 'claims', title: t('settings_registry.claims.title'), description: t('settings_registry.claims.subtitle'), icon: FilePlus, href: '/settings/claims', category: 'Revenue Cycle' },
    { id: 'ar-mgmt', title: t('settings_registry.ar_mgmt.title'), description: t('settings_registry.ar_mgmt.subtitle'), icon: TrendingUp, href: '/settings/ar-mgmt', category: 'Revenue Cycle' },
    { id: 'collections', title: t('settings_registry.collections.title'), description: t('settings_registry.collections.subtitle'), icon: Wallet, href: '/settings/collections', category: 'Revenue Cycle' },
    { id: 'rcm-audit', title: t('settings_registry.financial_audit.title'), description: t('settings_registry.financial_audit.subtitle'), icon: ShieldCheck, href: '/settings/financial-audit', category: 'Revenue Cycle' },

    // --- HUMAN CAPITAL & HR (96-110) ---
    { id: 'staff', title: 'People Registry', description: 'Staff records, credentials & HR files', icon: Users, href: '/staff', category: 'People & HR' },
    { id: 'payroll', title: t('settings_registry.payroll.title'), description: t('settings_registry.payroll.subtitle'), icon: Banknote, href: '/settings/payroll', category: 'People & HR' },
    { id: 'attendance', title: t('settings_registry.attendance.title'), description: t('settings_registry.attendance.subtitle'), icon: Clock, href: '/settings/attendance', category: 'People & HR' },
    { id: 'rostering', title: t('settings_registry.rostering.title'), description: t('settings_registry.rostering.subtitle'), icon: History, href: '/settings/rostering', category: 'People & HR' },
    { id: 'training', title: t('settings_registry.training.title'), description: t('settings_registry.training.subtitle'), icon: GraduationCap, href: '/settings/training', category: 'People & HR' },
    { id: 'recruitment', title: t('settings_registry.recruitment.title'), description: t('settings_registry.recruitment.subtitle'), icon: Rocket, href: '/settings/recruitment', category: 'People & HR' },

    // --- RESEARCH & PUBLIC HEALTH (111-125) ---
    { id: 'trials', title: 'Clinical Trials', description: 'Trial protocols, IRB & subject logs', icon: SearchCode, href: '#', category: 'Public Health' },
    { id: 'pop-health', title: t('settings_registry.pop_health.title'), description: t('settings_registry.pop_health.subtitle'), icon: Globe2, href: '/settings/pop-health', category: 'Public Health' },
    { id: 'surveillance', title: t('settings_registry.surveillance.title'), description: t('settings_registry.surveillance.subtitle'), icon: ShieldAlert, href: '/settings/surveillance', category: 'Public Health' },
    { id: 'genomic-db', title: 'Genomic Lake', description: 'Bio-bank and genetic sequencing registry', icon: Dna, href: '#', category: 'Public Health', isComingSoon: true },

    // --- INFRASTRUCTURE & TECH (126-140) ---
    { id: 'fhir-bridge', title: t('settings_registry.fhir_bridge.title'), description: t('settings_registry.fhir_bridge.subtitle'), icon: Share2, href: '/settings/fhir-bridge', category: 'Infrastructure' },
    { id: 'api-mgmt', title: t('settings_registry.api_mgmt.title'), description: t('settings_registry.api_mgmt.subtitle'), icon: Terminal, href: '/settings/api-mgmt', category: 'Infrastructure' },
    { id: 'cloud-nodes', title: 'Cluster Health', description: 'Compute, memory & node distribution', icon: Cpu, href: '#', category: 'Infrastructure', isComingSoon: true },
    { id: 'cyber-defense', title: t('settings_registry.cyber_defense.title'), description: t('settings_registry.cyber_defense.subtitle'), icon: ShieldCheck, href: '/settings/cyber-defense', category: 'Infrastructure' },
    { id: 'cyber', title: 'Cyber Defense', description: 'SSO, MFA & threat detection registry', icon: Lock, href: '#', category: 'Infrastructure' },
    { id: 'it-support', title: 'IT Service Management', description: 'Internal ticket registry & asset health', icon: LifeBuoy, href: '#', category: 'Infrastructure', isComingSoon: true },
  ];

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
