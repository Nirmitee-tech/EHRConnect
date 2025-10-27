'use client';

import React, { useState } from 'react';
import { User, Edit, Trash2, ChevronDown, ChevronRight, Calendar, Heart, Skull, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FHIRFamilyMemberHistory } from '@/types/fhir';

interface FamilyFormViewProps {
  familyHistory: FHIRFamilyMemberHistory[];
  patientId: string;
  onEditMember: (member: FHIRFamilyMemberHistory) => void;
  onDeleteMember: (memberId: string) => void;
}

interface MemberCardProps {
  member: FHIRFamilyMemberHistory;
  onEdit: () => void;
  onDelete: () => void;
}

function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  const [expanded, setExpanded] = useState(false);

  const name = member.name || member.relationship?.coding?.[0]?.display || member.relationship?.text || 'Unknown';
  const relationship = member.relationship?.coding?.[0]?.display || member.relationship?.text || 'Unknown';
  const gender = member.sex?.coding?.[0]?.display || member.sex?.text;

  let age = '';
  if (member.ageAge?.value) {
    age = `${member.ageAge.value} ${member.ageAge.unit || 'years'}`;
  } else if (member.ageString) {
    age = member.ageString;
  }

  const deceased = member.deceasedBoolean || !!member.deceasedDate || !!member.deceasedAge;
  const conditions = member.condition || [];
  const notes = member.note || [];
  const recordedDate = member.date ? new Date(member.date).toLocaleDateString() : '';

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${name}'s family history?`)) {
      onDelete();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>

          <div className={`p-2 rounded-full ${deceased ? 'bg-gray-100' : 'bg-blue-100'}`}>
            <User className={`h-4 w-4 ${deceased ? 'text-gray-600' : 'text-blue-600'}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
              {deceased && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  <Skull className="h-3 w-3" />
                  Deceased
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 mt-0.5">
              <span>{relationship}</span>
              {gender && <span>{gender}</span>}
              {age && <span>{age}</span>}
            </div>
          </div>

          {conditions.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full">
              <Heart className="h-3 w-3 text-red-600" />
              <span className="text-xs font-semibold text-red-700">
                {conditions.length} {conditions.length === 1 ? 'Condition' : 'Conditions'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4 bg-gray-50">
          {/* Conditions */}
          {conditions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-red-500" />
                Health Conditions
              </h4>
              <div className="space-y-2">
                {conditions.map((condition, idx) => {
                  const conditionName = condition.code?.coding?.[0]?.display || condition.code?.text || 'Unknown condition';
                  const outcome = condition.outcome?.coding?.[0]?.display || condition.outcome?.text;
                  const contributedToDeath = condition.contributedToDeath;

                  let onset = '';
                  if (condition.onsetAge?.value) {
                    onset = `Onset: ${condition.onsetAge.value} ${condition.onsetAge.unit || 'years'}`;
                  } else if (condition.onsetString) {
                    onset = `Onset: ${condition.onsetString}`;
                  }

                  return (
                    <div key={idx} className="bg-white border border-red-100 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{conditionName}</div>
                          {onset && <div className="text-xs text-gray-600 mt-1">{onset}</div>}
                          {outcome && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Outcome:</span> {outcome}
                            </div>
                          )}
                          {contributedToDeath && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-700">
                              <AlertCircle className="h-3 w-3" />
                              Contributed to death
                            </div>
                          )}
                        </div>
                      </div>
                      {condition.note && condition.note.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Notes:</span> {condition.note[0].text}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* General Notes */}
          {notes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Additional Notes</h4>
              <div className="space-y-2">
                {notes.map((note, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-700">{note.text}</p>
                    {note.time && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.time).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Status: <span className="font-medium text-gray-700">{member.status}</span></span>
              {recordedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Recorded: {recordedDate}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FamilyFormView({
  familyHistory,
  patientId,
  onEditMember,
  onDeleteMember
}: FamilyFormViewProps) {

  // Group by relationship type
  const groupedMembers = familyHistory.reduce((acc, member) => {
    const relationshipCode = member.relationship?.coding?.[0]?.code || 'other';
    const key = relationshipCode.startsWith('FTH') || relationshipCode.startsWith('MTH') || relationshipCode.includes('PARENT')
      ? 'parents'
      : relationshipCode.startsWith('GR')
      ? 'grandparents'
      : relationshipCode.includes('SIB') || relationshipCode.includes('BRO') || relationshipCode.includes('SIS') || relationshipCode.includes('TWIN')
      ? 'siblings'
      : relationshipCode.includes('CHILD') || relationshipCode.includes('SON') || relationshipCode.includes('DAU')
      ? 'children'
      : relationshipCode.includes('UNCLE') || relationshipCode.includes('AUNT')
      ? 'aunts_uncles'
      : relationshipCode.includes('NEPH') || relationshipCode.includes('NIECE')
      ? 'nephews_nieces'
      : 'other';

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(member);
    return acc;
  }, {} as Record<string, FHIRFamilyMemberHistory[]>);

  const groups = [
    { key: 'grandparents', label: 'Grandparents', icon: User },
    { key: 'parents', label: 'Parents', icon: User },
    { key: 'aunts_uncles', label: 'Aunts & Uncles', icon: User },
    { key: 'siblings', label: 'Siblings', icon: User },
    { key: 'children', label: 'Children', icon: User },
    { key: 'nephews_nieces', label: 'Nephews & Nieces', icon: User },
    { key: 'other', label: 'Other Family Members', icon: User },
  ].filter(group => groupedMembers[group.key]?.length > 0);

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {groups.map(group => (
          <div key={group.key} className="space-y-3">
            {/* Group Header */}
            <div className="flex items-center gap-2 px-2">
              <group.icon className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">{group.label}</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {groupedMembers[group.key].length}
              </span>
            </div>

            {/* Members in this group */}
            <div className="space-y-2">
              {groupedMembers[group.key].map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={() => onEditMember(member)}
                  onDelete={() => onDeleteMember(member.id!)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
