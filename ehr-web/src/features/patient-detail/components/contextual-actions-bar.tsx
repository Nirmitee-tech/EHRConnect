'use client';

import React, { useMemo } from 'react';
import {
  FileText,
  Download,
  Upload,
  Plus,
  RefreshCw,
  Printer,
  Share2,
  Edit,
  Save,
  Copy,
  Calendar
} from 'lucide-react';
import { getEncounterIdFromTab, isEncounterTab } from '../utils/encounter-utils';

interface ContextualActionsBarProps {
  activeTab: string;
  encounters?: any[];
}

function ContextualActionsBarComponent({ activeTab, encounters = [] }: ContextualActionsBarProps) {
  // Extract active encounter ID if on an encounter tab
  const activeEncounterId = getEncounterIdFromTab(activeTab);
  const isOnEncounter = isEncounterTab(activeTab);

  // Get encounter details if active
  const activeEncounter = activeEncounterId
    ? encounters.find(e => e.id === activeEncounterId)
    : null;

  // Only use encounter context if we're actually ON an encounter tab
  // Don't auto-assume context from open encounters - user must explicitly select encounter
  const contextEncounterId = activeEncounterId;
  const contextEncounter = activeEncounter;

  // Memoize actions to prevent recalculation on every render
  const actions = useMemo(() => {
    const getActionsForTab = () => {
      const baseActions = {
        'dashboard': [
          { label: 'Refresh', icon: RefreshCw, onClick: () => console.log('Refresh') }
        ],
        'encounters': [
          { label: 'New Visit', icon: Plus, onClick: () => console.log('New Visit') },
          { label: 'Import Template', icon: Upload, onClick: () => console.log('Import Template') },
          { label: 'Print Summary', icon: Printer, onClick: () => console.log('Print Summary') }
        ],
        'allergies': [
          { label: 'Add Allergy', icon: Plus, onClick: () => console.log('Add Allergy') },
          { label: 'Export List', icon: Download, onClick: () => console.log('Export') }
        ],
        'problems': [
          { label: 'Add Diagnosis', icon: Plus, onClick: () => console.log('Add Diagnosis') },
          { label: 'Export List', icon: Download, onClick: () => console.log('Export') }
        ],
        'medications': [
          { label: 'Prescribe', icon: Plus, onClick: () => console.log('Prescribe') },
          { label: 'Refill', icon: RefreshCw, onClick: () => console.log('Refill') },
          { label: 'Print List', icon: Printer, onClick: () => console.log('Print') }
        ],
        'vaccines': [
          { label: 'Add Vaccine', icon: Plus, onClick: () => console.log('Add Vaccine') },
          { label: 'View Schedule', icon: FileText, onClick: () => console.log('Schedule') }
        ],
        'vitals': [
          { label: 'Record Vitals', icon: Plus, onClick: () => console.log('Record Vitals') },
          { label: 'View Chart', icon: FileText, onClick: () => console.log('View Chart') }
        ],
        'lab': [
          { label: 'Order Lab', icon: Plus, onClick: () => console.log('Order Lab') },
          { label: 'Import Results', icon: Upload, onClick: () => console.log('Import') },
          { label: 'Export Results', icon: Download, onClick: () => console.log('Export') }
        ],
        'imaging': [
          { label: 'Order Imaging', icon: Plus, onClick: () => console.log('Order Imaging') },
          { label: 'Import Study', icon: Upload, onClick: () => console.log('Import') },
          { label: 'View PACS', icon: FileText, onClick: () => console.log('View PACS') }
        ],
        'documents': [
          { label: 'Upload Document', icon: Upload, onClick: () => console.log('Upload') },
          { label: 'Generate Report', icon: FileText, onClick: () => console.log('Generate') },
          { label: 'Share', icon: Share2, onClick: () => console.log('Share') }
        ],
        'profile': [
          { label: 'Edit Profile', icon: Edit, onClick: () => console.log('Edit') },
          { label: 'Save Changes', icon: Save, onClick: () => console.log('Save') }
        ],
        'insurance': [
          { label: 'Add Insurance', icon: Plus, onClick: () => console.log('Add Insurance') },
          { label: 'Verify Coverage', icon: RefreshCw, onClick: () => console.log('Verify') },
          { label: 'Export', icon: Download, onClick: () => console.log('Export') }
        ],
        'billing': [
          { label: 'New Claim', icon: Plus, onClick: () => console.log('New Claim') },
          { label: 'Submit Claims', icon: Upload, onClick: () => console.log('Submit') },
          { label: 'Export', icon: Download, onClick: () => console.log('Export') }
        ],
        'financial': [
          { label: 'Record Payment', icon: Plus, onClick: () => console.log('Payment') },
          { label: 'Generate Statement', icon: FileText, onClick: () => console.log('Statement') },
          { label: 'Export', icon: Download, onClick: () => console.log('Export') }
        ],
        'portal-access': [
          { label: 'Send Invite', icon: Share2, onClick: () => console.log('Invite') },
          { label: 'Reset Password', icon: RefreshCw, onClick: () => console.log('Reset') }
        ]
      };

      // Handle encounter tabs
      if (activeTab.startsWith('encounter-')) {
        return [
          { label: 'Add Note', icon: Plus, onClick: () => console.log('Add Note') },
          { label: 'Import Template', icon: Upload, onClick: () => console.log('Import') },
          { label: 'Print', icon: Printer, onClick: () => console.log('Print') },
          { label: 'Share', icon: Share2, onClick: () => console.log('Share') }
        ];
      }

      return baseActions[activeTab as keyof typeof baseActions] || [];
    };

    return getActionsForTab();
  }, [activeTab]);

  // Memoize date formatting to avoid recalculation
  const dateStr = useMemo(() => {
    const encounterDate = activeEncounter?.period?.start || activeEncounter?.startTime;
    return encounterDate
      ? new Date(encounterDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      : '';
  }, [activeEncounter]);

  const contextDateStr = useMemo(() => {
    const contextEncounterDate = contextEncounter?.period?.start || contextEncounter?.startTime;
    return contextEncounterDate
      ? new Date(contextEncounterDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      : '';
  }, [contextEncounter]);

  // Early return AFTER all hooks have been called
  if (actions.length === 0) return null;

  // Tabs where clinical data is added and should be linked to encounter
  const clinicalDataTabs = [
    'allergies', 'problems', 'medications', 'vaccines', 'vitals',
    'lab', 'imaging', 'documents'
  ];
  const isClinicalTab = clinicalDataTabs.includes(activeTab);
  const showEncounterContext = (isOnEncounter || isClinicalTab) && contextEncounter;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Encounter Context Indicator */}
        {showEncounterContext && (
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md ${isOnEncounter
              ? 'bg-primary/5 border border-primary/20'
              : 'bg-amber-50 border border-amber-200'
            }`}>
            <Calendar className={`h-3.5 w-3.5 ${isOnEncounter ? 'text-primary' : 'text-amber-600'}`} />
            <span className={`text-xs font-medium ${isOnEncounter ? 'text-primary' : 'text-amber-700'}`}>
              {isOnEncounter ? 'Active Encounter:' : 'Context Encounter:'} {isOnEncounter ? dateStr : contextDateStr}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${isOnEncounter
                ? 'bg-primary text-primary-foreground'
                : 'bg-amber-600 text-white'
              }`}>
              {contextEncounter.status || 'in-progress'}
            </span>
            {!isOnEncounter && isClinicalTab && (
              <span className="text-[10px] text-amber-700 font-medium">
                • Data will be linked to this encounter
              </span>
            )}
          </div>
        )}

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ContextualActionsBar = React.memo(ContextualActionsBarComponent);
