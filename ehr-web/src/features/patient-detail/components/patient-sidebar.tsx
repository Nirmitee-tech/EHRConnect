'use client';

import React from 'react';
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
  X
} from 'lucide-react';
import { usePatientDetailStore } from '../store/patient-detail-store';

export function PatientSidebar() {
  // Get state from Zustand
  const sidebarCollapsed = usePatientDetailStore((state) => state.sidebarCollapsed);
  const activeTab = usePatientDetailStore((state) => state.activeTab);
  const openEncounterTabs = usePatientDetailStore((state) => state.openEncounterTabs);
  const encounters = usePatientDetailStore((state) => state.encounters);
  const allergies = usePatientDetailStore((state) => state.allergies);
  const problems = usePatientDetailStore((state) => state.problems);
  const medications = usePatientDetailStore((state) => state.medications);

  // Get actions from Zustand
  const toggleSidebar = usePatientDetailStore((state) => state.toggleSidebar);
  const setActiveTab = usePatientDetailStore((state) => state.setActiveTab);
  const closeEncounterTab = usePatientDetailStore((state) => state.closeEncounterTab);

  // Navigation sections - same as original
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'allergies', label: 'Allergies', icon: AlertCircle, count: allergies.length },
    { id: 'problems', label: 'Diagnoses', icon: Search, count: problems.length },
    { id: 'medications', label: 'Medications', icon: Pill, count: medications.length },
    { id: 'vaccines', label: 'Vaccines', icon: Syringe, count: null },
    { id: 'vitals', label: 'Vitals', icon: Activity, count: null },
    { id: 'lab', label: 'Lab', icon: TestTube, count: null },
    { id: 'imaging', label: 'Imaging', icon: ImageIcon, count: null },
    { id: 'history', label: 'History', icon: History, count: null },
    { id: 'documents', label: 'Documents', icon: FileText, count: null },
    { id: 'encounters', label: 'Visit Details', icon: Calendar, count: null },
    { id: 'financial', label: 'Financial', icon: DollarSign, count: null },
    { id: 'billing', label: 'Billing', icon: FileCheck, count: null },
    { id: 'insurance', label: 'Insurance', icon: Shield, count: null },
    { id: 'card-details', label: 'Card Details', icon: CreditCard, count: null },
    { id: 'profile', label: 'Profile', icon: UserCircle, count: null },
    { id: 'portal-access', label: 'Portal Access', icon: Globe, count: null }
  ];

  return (
    <div
      className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0 ${
        sidebarCollapsed ? 'w-14' : 'w-48'
      }`}
    >
      {/* Toggle Button */}
      <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeTab === section.id;
          const hasCount = section.count !== null && section.count > 0;
          return (
            <button
              key={section.id}
              onClick={() => {
                setActiveTab(section.id);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
                }
                ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between'}
              `}
              title={sidebarCollapsed ? section.label : ''}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{section.label}</span>}
              </div>
              {!sidebarCollapsed && hasCount && (
                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full ${
                  isActive ? 'bg-white text-primary' : 'bg-green-100 text-green-700'
                }`}>
                  {section.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Dynamic Encounter Tabs */}
        {openEncounterTabs.length > 0 && !sidebarCollapsed && (
          <>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p className="px-3 text-xs font-semibold text-gray-500 mb-1">ENCOUNTERS</p>
            </div>
            {openEncounterTabs.map((encounterId) => {
              const encounter = encounters.find(e => e.id === encounterId);
              const isActive = activeTab === `encounter-${encounterId}`;
              const encounterDate = encounter?.period?.start || encounter?.startTime;
              const dateStr = encounterDate ? new Date(encounterDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

              return (
                <div key={encounterId} className="relative group">
                  <button
                    onClick={() => setActiveTab(`encounter-${encounterId}`)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1 text-left text-xs">{dateStr}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeEncounterTab(encounterId);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                  >
                    <X className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}
