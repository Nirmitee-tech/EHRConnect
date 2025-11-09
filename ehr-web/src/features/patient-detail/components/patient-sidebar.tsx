'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  Search,
  Pill,
  Syringe,
  Activity,
  TestTube,
  ImageIcon,
  History,
  FileText,
  Calendar,
  DollarSign,
  FileCheck,
  Shield,
  CreditCard,
  UserCircle,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ClipboardList,
  Users,
  LucideIcon
} from 'lucide-react';
import { usePatientDetailStore } from '../store/patient-detail-store';
import { useSpecialtyNavigation, useHasSpecialtyNavigation } from '@/features/specialties/shared/hooks/useSpecialtyNavigation';

type SidebarView = 'all' | 'clinical' | 'administrative' | 'financial' | string;

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number | null;
  category: string;
  encounterId?: string;
  specialtySlug?: string;
}

function PatientSidebarComponent() {
  const [sidebarView, setSidebarView] = useState<SidebarView>('all');

  // Get state from Zustand - using selectors for better performance
  const sidebarCollapsed = usePatientDetailStore((state) => state.sidebarCollapsed);
  const activeTab = usePatientDetailStore((state) => state.activeTab);
  const openEncounterTabs = usePatientDetailStore((state) => state.openEncounterTabs);
  const encounters = usePatientDetailStore((state) => state.encounters);
  const allergies = usePatientDetailStore((state) => state.allergies);
  const problems = usePatientDetailStore((state) => state.problems);
  const medications = usePatientDetailStore((state) => state.medications);
  const immunizations = usePatientDetailStore((state) => state.immunizations);
  const labResults = usePatientDetailStore((state) => state.labResults);
  const imagingStudies = usePatientDetailStore((state) => state.imagingStudies);
  const documents = usePatientDetailStore((state) => state.documents);

  // Get actions from Zustand
  const toggleSidebar = usePatientDetailStore((state) => state.toggleSidebar);
  const setActiveTab = usePatientDetailStore((state) => state.setActiveTab);
  const closeEncounterTab = usePatientDetailStore((state) => state.closeEncounterTab);

  // Try to use specialty navigation (Phase 2 enhancement)
  const hasSpecialtyNav = useHasSpecialtyNavigation();
  const { navigation: specialtyNavigation, viewOptions: specialtyViewOptions } = useSpecialtyNavigation(sidebarView);

  // All navigation sections organized by category
  const allSections = {
    general: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null, category: 'general' }
    ],
    clinical: [
      { id: 'allergies', label: 'Allergies', icon: AlertCircle, count: allergies.length, category: 'clinical' },
      { id: 'problems', label: 'Diagnoses', icon: Search, count: problems.length, category: 'clinical' },
      { id: 'medications', label: 'Medications', icon: Pill, count: medications.length, category: 'clinical' },
      { id: 'vaccines', label: 'Vaccines', icon: Syringe, count: null, category: 'clinical' },
      { id: 'vitals', label: 'Vitals', icon: Activity, count: null, category: 'clinical' },
      { id: 'lab', label: 'Lab', icon: TestTube, count: null, category: 'clinical' },
      { id: 'imaging', label: 'Imaging', icon: ImageIcon, count: null, category: 'clinical' },
      { id: 'forms', label: 'Forms', icon: ClipboardList, count: null, category: 'clinical' },
      { id: 'family-history', label: 'Family History', icon: Users, count: null, category: 'clinical' },
      { id: 'history', label: 'History', icon: History, count: null, category: 'clinical' },
      { id: 'encounters', label: 'Visit Details', icon: Calendar, count: null, category: 'clinical' }
    ],
    administrative: [
      { id: 'documents', label: 'Documents', icon: FileText, count: null, category: 'administrative' },
      { id: 'profile', label: 'Profile', icon: UserCircle, count: null, category: 'administrative' },
      { id: 'portal-access', label: 'Portal Access', icon: Globe, count: null, category: 'administrative' }
    ],
    financial: [
      { id: 'financial', label: 'Financial', icon: DollarSign, count: null, category: 'financial' },
      { id: 'billing', label: 'Billing', icon: FileCheck, count: null, category: 'financial' },
      { id: 'insurance', label: 'Insurance', icon: Shield, count: null, category: 'financial' },
      { id: 'card-details', label: 'Card Details', icon: CreditCard, count: null, category: 'financial' }
    ]
  };

  /**
   * Get final navigation sections
   * MERGES base sections WITH specialty sections (not replace!)
   */
  const sections = useMemo(() => {
    // Filter base sections based on selected view
    const getBaseSections = () => {
      if (sidebarView === 'all') {
        return [
          ...allSections.general,
          ...allSections.clinical,
          ...allSections.administrative,
          ...allSections.financial
        ];
      }
      if (sidebarView === 'clinical') {
        return [...allSections.general, ...allSections.clinical];
      }
      if (sidebarView === 'administrative') {
        return [...allSections.general, ...allSections.administrative];
      }
      if (sidebarView === 'financial') {
        return [...allSections.general, ...allSections.financial];
      }
      return [];
    };

    // Always start with base sections (allergies, medications, etc.)
    const baseSections = getBaseSections();

    // Phase 2 Enhancement: If specialty navigation available, MERGE it with base
    if (hasSpecialtyNav && specialtyNavigation.length > 0) {
      // Create merged array starting with base sections
      const merged = [...baseSections];

      // Add specialty-specific sections that don't exist in base
      for (const specialtyItem of specialtyNavigation) {
        const existsInBase = baseSections.some(base => base.id === specialtyItem.id);
        if (!existsInBase) {
          // This is a specialty-specific section (like prenatal-overview), add it
          merged.push(specialtyItem);
        }
      }

      // Add dynamic counts from Zustand state
      return merged.map(item => ({
        ...item,
        count:
          item.id === 'allergies' ? allergies.length :
          item.id === 'problems' ? problems.length :
          item.id === 'medications' ? medications.length :
          item.id === 'vaccines' ? immunizations.length :
          item.id === 'lab' ? labResults.length :
          item.id === 'imaging' ? imagingStudies.length :
          item.id === 'documents' ? documents.length :
          item.count ?? null
      }));
    }

    // No specialty navigation: Use base sections only
    return baseSections.map(item => ({
      ...item,
      count:
        item.id === 'allergies' ? allergies.length :
        item.id === 'problems' ? problems.length :
        item.id === 'medications' ? medications.length :
        item.id === 'vaccines' ? immunizations.length :
        item.id === 'lab' ? labResults.length :
        item.id === 'imaging' ? imagingStudies.length :
        item.id === 'documents' ? documents.length :
        item.count ?? null
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSpecialtyNav, specialtyNavigation, sidebarView, allergies.length, problems.length, medications.length, immunizations.length, labResults.length, imagingStudies.length, documents.length]);

  /**
   * Get view options for dropdown
   * Uses specialty view options if available, otherwise uses default options
   */
  const viewOptions = useMemo(() => {
    if (hasSpecialtyNav && specialtyViewOptions.length > 0) {
      return specialtyViewOptions;
    }

    // Fallback: Default view options (backwards compatible)
    return [
      { value: 'all', label: 'All Sections' },
      { value: 'clinical', label: 'Clinical' },
      { value: 'administrative', label: 'Admin' },
      { value: 'financial', label: 'Financial' },
    ];
  }, [hasSpecialtyNav, specialtyViewOptions]);

  // Add open encounters at the TOP - they're the active work items
  const allNavigationItems: NavigationItem[] = useMemo(() => [
    ...openEncounterTabs.map((encounterId): NavigationItem => {
      const encounter = encounters.find(e => e.id === encounterId);
      const encounterDate = encounter?.period?.start || encounter?.startTime;
      const dateStr = encounterDate
        ? new Date(encounterDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Encounter';

      return {
        id: `encounter-${encounterId}`,
        label: dateStr,
        icon: Calendar,
        count: null,
        category: 'encounter',
        encounterId
      };
    }),
    ...sections
  ], [openEncounterTabs, encounters, sections]);

  return (
    <div
      className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0 ${
        sidebarCollapsed ? 'w-12' : 'w-44'
      }`}
    >
      {/* Header with View Selector and Toggle */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100">
        {!sidebarCollapsed ? (
          <div className="px-2 py-2">
            {/* Combined Row: View Dropdown + Toggle */}
            <div className="flex items-center gap-1">
              {/* View Dropdown - Enhanced with specialty options */}
              <div className="relative flex-1">
                <select
                  value={sidebarView}
                  onChange={(e) => setSidebarView(e.target.value as SidebarView)}
                  className="w-full pl-2 pr-6 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white cursor-pointer appearance-none hover:bg-white transition-colors"
                >
                  {viewOptions.map((option) =>
                    option.isDivider ? (
                      <option key={option.value} disabled className="text-gray-400">
                        {option.label}
                      </option>
                    ) : (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-2 py-2">
            {/* Toggle Button (Collapsed) */}
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
              title="Expand sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <nav className="px-2 py-3 space-y-0.5">
        {/* Open Encounters Header */}
        {openEncounterTabs.length > 0 && !sidebarCollapsed && (
          <div className="px-2.5 pb-2">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Open Encounters
            </p>
          </div>
        )}

        {allNavigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const hasCount = item.count !== null && item.count > 0;
          const isEncounter = item.category === 'encounter';

          // Check if this is the last encounter item (to add separator after)
          const isLastEncounter = isEncounter &&
            index === openEncounterTabs.length - 1 &&
            openEncounterTabs.length > 0;

          return (
            <React.Fragment key={item.id}>
              <div className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all relative
                    ${isActive && isEncounter
                      ? 'text-blue-700 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                      : isActive
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }
                    ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between'}
                  `}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  {/* Active indicator */}
                  {isActive && !sidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-600 rounded-r" />
                  )}

                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Icon className={`flex-shrink-0 ${isActive ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && hasCount && (
                    <span className={`
                      inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full
                      ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {item.count}
                    </span>
                  )}
                </button>

                {/* Close button for encounters */}
                {isEncounter && !sidebarCollapsed && item.encounterId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeEncounterTab(item.encounterId!);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity z-10"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Separator after last encounter */}
              {isLastEncounter && !sidebarCollapsed && (
                <div className="my-2 border-t border-gray-200" />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const PatientSidebar = React.memo(PatientSidebarComponent);
