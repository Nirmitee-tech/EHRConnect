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
  X
} from 'lucide-react';
import { usePatientDetailStore } from '../store/patient-detail-store';

export function PatientTabsBar() {
  // Get state from Zustand
  const activeTab = usePatientDetailStore((state) => state.activeTab);
  const openTabs = usePatientDetailStore((state) => state.openTabs);
  const openEncounterTabs = usePatientDetailStore((state) => state.openEncounterTabs);
  const encounters = usePatientDetailStore((state) => state.encounters);
  const allergies = usePatientDetailStore((state) => state.allergies);
  const problems = usePatientDetailStore((state) => state.problems);
  const medications = usePatientDetailStore((state) => state.medications);

  // Get actions from Zustand
  const setActiveTab = usePatientDetailStore((state) => state.setActiveTab);
  const closeTab = usePatientDetailStore((state) => state.closeTab);
  const closeEncounterTab = usePatientDetailStore((state) => state.closeEncounterTab);
  const setSelectedEncounter = usePatientDetailStore((state) => state.setSelectedEncounter);

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
    <div className="bg-gray-50 border-b-2 border-gray-300 px-2 py-1 flex items-center gap-1 overflow-x-auto shadow-sm">
      {/* Regular Tabs */}
      {openTabs.map(tabId => {
        const section = sections.find(s => s.id === tabId);
        if (!section) return null;
        const Icon = section.icon;
        const isActive = activeTab === tabId;
        return (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-white text-blue-700 border border-b-0 border-gray-300 shadow-sm -mb-0.5'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-transparent'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <span>{section.label}</span>
            {openTabs.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                className="ml-1 hover:bg-gray-300 rounded p-0.5 transition-colors cursor-pointer inline-flex items-center"
              >
                <X className="h-3 w-3 text-gray-600" />
              </span>
            )}
          </button>
        );
      })}

      {/* Encounter Tabs */}
      {openEncounterTabs.map(encounterId => {
        const encounter = encounters.find(e => e.id === encounterId);
        const isActive = activeTab === `encounter-${encounterId}`;
        const encounterDate = encounter?.period?.start || encounter?.startTime;
        const dateStr = encounterDate ? new Date(encounterDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
        const encounterLabel = `Encounter ${dateStr}`;

        return (
          <button
            key={`encounter-${encounterId}`}
            onClick={() => {
              setActiveTab(`encounter-${encounterId}`);
              setSelectedEncounter(encounterId);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-white text-blue-700 border border-b-0 border-gray-300 shadow-sm -mb-0.5'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-transparent'
            }`}
          >
            <FileText className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <span>{encounterLabel}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeEncounterTab(encounterId);
              }}
              className="ml-1 hover:bg-gray-300 rounded p-0.5 transition-colors cursor-pointer inline-flex items-center"
            >
              <X className="h-3 w-3 text-gray-600" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
