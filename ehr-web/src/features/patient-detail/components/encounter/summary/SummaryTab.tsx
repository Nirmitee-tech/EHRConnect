import React from 'react';
import { SavedSection } from '@/app/patients/[id]/components/types';
import { SavedSectionCard } from './SavedSectionCard';
import { SectionRenderer } from './section-renderers';
import { carePlanService, CarePlanFormData } from '@/services/careplan.service';

interface SummaryTabProps {
  encounterId: string;
  encounter: any;
  patient: any;
  savedSections: SavedSection[];
  expandedSections: { [key: string]: boolean };
  onToggleSectionExpand: (sectionKey: string) => void;
  onEditSection: (sectionIndex: number, section: SavedSection) => void;
  onDeleteSection: (sectionIndex: number, section: SavedSection) => Promise<void>;
}

/**
 * SummaryTab - Displays encounter summary with all saved documentation sections
 */
export function SummaryTab({
  encounterId,
  encounter,
  patient,
  savedSections,
  expandedSections,
  onToggleSectionExpand,
  onEditSection,
  onDeleteSection
}: SummaryTabProps) {
  return (
    <div className="space-y-3">
      {/* Encounter Header */}
      <div className="bg-white border border-gray-200 rounded p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          {new Date(encounter.period?.start || encounter.startTime || '').toLocaleDateString(
            'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}{' '}
          Encounter for {patient?.name}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 font-medium capitalize">{encounter.status}</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium">
              {typeof encounter.class === 'object' ? encounter.class?.display : encounter.class}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Practitioner:</span>
            <span className="ml-2 font-medium">
              {encounter.practitionerName || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Display all saved sections */}
      {savedSections.map((section, idx) => {
        const sectionKey = `${encounterId}-${idx}`;
        const isExpanded = expandedSections[sectionKey] !== false; // Default to expanded

        return (
          <SavedSectionCard
            key={idx}
            section={section}
            isExpanded={isExpanded}
            onToggleExpand={() => onToggleSectionExpand(sectionKey)}
            onEdit={() => onEditSection(idx, section)}
            onDelete={() => onDeleteSection(idx, section)}
          >
            <SectionRenderer section={section} />
          </SavedSectionCard>
        );
      })}

      {/* Show message if no sections saved yet */}
      {(!savedSections || savedSections.length === 0) && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded p-8 text-center">
          <p className="text-sm text-gray-600">No documentation added yet</p>
          <p className="text-xs text-gray-500 mt-2">
            Use the dropdown menus above to add sections
          </p>
        </div>
      )}
    </div>
  );
}
