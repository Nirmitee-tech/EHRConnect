import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SavedSection } from '@/app/patients/[id]/components/types';

interface SavedSectionCardProps {
  section: SavedSection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onESign?: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

/**
 * SavedSectionCard - Card component for displaying saved encounter sections
 * Provides collapsible header with edit/eSign/delete actions
 */
export function SavedSectionCard({
  section,
  isExpanded,
  onToggleExpand,
  onEdit,
  onESign,
  onDelete,
  children
}: SavedSectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      {/* Section Header - Collapsible */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform ${
              !isExpanded ? '-rotate-90' : ''
            }`}
          />
          <h4 className="text-sm font-semibold text-blue-600">{section.title}</h4>
          <span className="text-xs text-gray-500">
            (by {section.author || 'Unknown'})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
          >
            Edit
          </button>

          {onESign && (
            <button
              onClick={onESign}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
            >
              eSign
            </button>
          )}

          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4">
          {children}

          {/* eSign Log */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-right">
              eSign Log
              <br />
              {section.signatures?.length > 0 ? (
                section.signatures.map((sig: any, i: number) => (
                  <span key={i}>
                    {sig.name} - {new Date(sig.date).toLocaleString()}
                    <br />
                  </span>
                ))
              ) : (
                'No signatures on file'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
