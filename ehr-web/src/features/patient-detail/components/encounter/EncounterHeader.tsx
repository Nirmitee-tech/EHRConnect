import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ENCOUNTER_DROPDOWN_MENUS, menuItemToTabId } from '../../config/encounter-menus';
import AmcRequiresPopover from '@/components/encounters/AmcRequiresPopover';

interface EncounterHeaderProps {
  encounterId: string;
  openDropdown: string | null;
  onDropdownToggle: (category: string | null) => void;
  onMenuItemClick: (tabId: string) => void;
  showAmcPopover: boolean;
  onAmcPopoverToggle: () => void;
  onAmcPopoverClose: () => void;
  onAmcSave: (requirements: any) => void;
  onEdit?: () => void;
  onESign?: () => void;
  onDelete?: () => void;
  onCollapseAll?: () => void;
  onExpandAll?: () => void;
}

/**
 * EncounterHeader - Top bar with dropdown menus and action buttons
 * Provides OpenEMR-style navigation for encounter documentation sections
 */
export function EncounterHeader({
  encounterId,
  openDropdown,
  onDropdownToggle,
  onMenuItemClick,
  showAmcPopover,
  onAmcPopoverToggle,
  onAmcPopoverClose,
  onAmcSave,
  onEdit,
  onESign,
  onDelete,
  onCollapseAll,
  onExpandAll
}: EncounterHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Dropdown Menus Row */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200">
        {Object.entries(ENCOUNTER_DROPDOWN_MENUS).map(([category, items]) => (
          <div key={category} className="relative">
            <button
              onClick={() => onDropdownToggle(openDropdown === category ? null : category)}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded flex items-center gap-1"
            >
              {category}
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Dropdown Menu */}
            {openDropdown === category && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
                {items.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onMenuItemClick(menuItemToTabId(item));
                      onDropdownToggle(null);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button
              onClick={onAmcPopoverToggle}
              className="px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded hover:opacity-90"
            >
              AMC Requires
            </button>
            <AmcRequiresPopover
              isOpen={showAmcPopover}
              onClose={onAmcPopoverClose}
              encounterId={encounterId}
              onSave={onAmcSave}
            />
          </div>

          {onEdit && (
            <button
              onClick={onEdit}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Edit
            </button>
          )}

          {onESign && (
            <button
              onClick={onESign}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              eSign
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          )}

          {onCollapseAll && (
            <button
              onClick={onCollapseAll}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Collapse All
            </button>
          )}

          {onExpandAll && (
            <button
              onClick={onExpandAll}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Expand All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
