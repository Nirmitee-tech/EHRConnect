import React from 'react';
import { X } from 'lucide-react';
import { tabIdToLabel } from '../../config/encounter-menus';

interface EncounterSubTabsProps {
  activeSubTab: string;
  openSubTabs: string[];
  onSubTabClick: (tabId: string) => void;
  onSubTabClose: (tabId: string) => void;
}

/**
 * EncounterSubTabs - Browser-style tabs for encounter sections
 * Displays Summary tab (always visible) plus dynamic sub-tabs with close buttons
 */
export function EncounterSubTabs({
  activeSubTab,
  openSubTabs,
  onSubTabClick,
  onSubTabClose
}: EncounterSubTabsProps) {
  return (
    <div className="flex items-center gap-0.5 px-4 py-1 overflow-x-auto bg-gray-50">
      {/* Summary Tab - Always visible */}
      <button
        onClick={() => onSubTabClick('summary')}
        className={`px-3 py-1.5 text-xs font-medium rounded-t whitespace-nowrap transition-colors border-t border-l border-r ${activeSubTab === 'summary'
            ? 'bg-white text-primary border-gray-300'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          }`}
      >
        Summary
      </button>

      {/* Dynamic Sub-Tabs */}
      {openSubTabs.map((tabId) => {
        const tabLabel = tabIdToLabel(tabId);
        return (
          <div key={tabId} className="relative group">
            <button
              onClick={() => onSubTabClick(tabId)}
              className={`px-3 py-1.5 pr-7 text-xs font-medium rounded-t whitespace-nowrap transition-colors border-t border-l border-r ${activeSubTab === tabId
                  ? 'bg-white text-primary border-gray-300'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
            >
              {tabLabel}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubTabClose(tabId);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
