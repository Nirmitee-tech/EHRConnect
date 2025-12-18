'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Edit, Heart, AlertCircle, User } from 'lucide-react';
import type { FHIRFamilyMemberHistory } from '@/types/fhir';
import { fhirService } from '@/lib/medplum';
import type { FHIRPatient } from '@/types/fhir';

interface FamilyTreeChartProps {
  familyHistory: FHIRFamilyMemberHistory[];
  patientId: string;
  lineageFilter: 'all' | 'paternal' | 'maternal';
  onEditMember: (member: FHIRFamilyMemberHistory) => void;
}

interface TreeMember {
  id: string;
  name: string;
  relationship: string;
  relationshipCode: string;
  member: FHIRFamilyMemberHistory;
  generation: number;
  gender?: string;
  age?: string;
  deceased?: boolean;
  conditionsCount: number;
  lineage?: 'paternal' | 'maternal' | 'both';
}

const RELATIONSHIP_HIERARCHY: Record<string, number> = {
  // Generation -2 (Grandparents)
  'GRFTH': -2,
  'GRMTH': -2,
  'MGRFTH': -2,
  'MGRMTH': -2,

  // Generation -1 (Parents, In-Laws, Aunts, Uncles)
  'FTH': -1,
  'MTH': -1,
  'FTHINLAW': -1,
  'MTHINLAW': -1,
  'PUNCLE': -1,
  'PAUNT': -1,
  'MUNCLE': -1,
  'MAUNT': -1,

  // Generation 0 (Patient, Siblings, Spouse)
  'SIB': 0,
  'BRO': 0,
  'SIS': 0,
  'SPS': 0,
  'HUSB': 0,
  'WIFE': 0,
  'BROINLAW': 0,
  'SISINLAW': 0,
  'COUSN': 0,

  // Generation +1 (Children, Nephews, Nieces, Children-in-law)
  'CHILD': 1,
  'SON': 1,
  'DAU': 1,
  'SONINLAW': 1,
  'DAUINLAW': 1,
  'NEPH': 1,
  'NIECE': 1,

  // Generation +2 (Grandchildren)
  'GRNDSON': 2,
  'GRNDDAU': 2,
};

const PATERNAL_CODES = ['FTH', 'GRFTH', 'GRMTH', 'PUNCLE', 'PAUNT'];
const MATERNAL_CODES = ['MTH', 'MGRFTH', 'MGRMTH', 'MUNCLE', 'MAUNT'];

const getRelationshipGeneration = (relationshipCode?: string): number => {
  if (!relationshipCode) return 0;
  return RELATIONSHIP_HIERARCHY[relationshipCode] ?? 0;
};

const getLineage = (relationshipCode?: string): 'paternal' | 'maternal' | 'both' => {
  if (!relationshipCode) return 'both';
  if (PATERNAL_CODES.includes(relationshipCode)) return 'paternal';
  if (MATERNAL_CODES.includes(relationshipCode)) return 'maternal';
  return 'both';
};

export function FamilyTreeChart({
  familyHistory,
  patientId,
  lineageFilter,
  onEditMember
}: FamilyTreeChartProps) {
  const [patient, setPatient] = useState<FHIRPatient | null>(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const patientData = await fhirService.read('Patient', patientId);
        setPatient(patientData as FHIRPatient);
      } catch (error) {
        console.error('Error loading patient:', error);
      }
    };
    loadPatient();
  }, [patientId]);

  const patientName = useMemo(() => {
    if (!patient) return 'Patient';
    const name = patient.name?.[0];
    if (!name) return 'Patient';
    const parts = [name.given?.join(' '), name.family].filter(Boolean);
    return parts.join(' ') || 'Patient';
  }, [patient]);

  const patientGender = useMemo(() => {
    return patient?.gender || 'unknown';
  }, [patient]);

  const treeData = useMemo(() => {
    const nodes: TreeMember[] = familyHistory.map(member => {
      const relationshipCode = member.relationship?.coding?.[0]?.code || '';
      const relationshipDisplay = member.relationship?.coding?.[0]?.display || member.relationship?.text || 'Unknown';
      const conditionsCount = member.condition?.length || 0;

      let age = '';
      if (member.ageAge?.value) {
        age = `${member.ageAge.value}`;
      } else if (member.ageString) {
        age = member.ageString;
      }

      return {
        id: member.id || '',
        name: member.name || relationshipDisplay,
        relationship: relationshipDisplay,
        relationshipCode,
        member,
        generation: getRelationshipGeneration(relationshipCode),
        gender: member.sex?.coding?.[0]?.code || member.sex?.text,
        age,
        deceased: member.deceasedBoolean || !!member.deceasedDate || !!member.deceasedAge,
        conditionsCount,
        lineage: getLineage(relationshipCode)
      };
    });

    // Filter by lineage
    const filteredNodes = nodes.filter(node => {
      if (lineageFilter === 'all') return true;
      if (node.lineage === 'both') return true;
      return node.lineage === lineageFilter;
    });

    // Group by generation
    const generations = new Map<number, TreeMember[]>();
    filteredNodes.forEach(node => {
      const gen = node.generation;
      if (!generations.has(gen)) {
        generations.set(gen, []);
      }
      generations.get(gen)!.push(node);
    });

    // Sort generations
    const sortedGenerations = Array.from(generations.entries())
      .sort(([a], [b]) => a - b);

    return sortedGenerations;
  }, [familyHistory, lineageFilter]);

  const getGenerationLabel = (gen: number): string => {
    if (gen === -2) return 'Grandparents';
    if (gen === -1) return 'Parents & Aunts/Uncles';
    if (gen === 0) return 'Patient & Siblings/Spouse';
    if (gen === 1) return 'Children';
    if (gen === 2) return 'Grandchildren';
    return `Generation ${gen}`;
  };

  const getCardColor = (member: TreeMember) => {
    const isMale = member.gender?.toLowerCase() === 'male';
    const isFemale = member.gender?.toLowerCase() === 'female';

    if (member.deceased) {
      return 'bg-gray-100 border-gray-400';
    }
    if (isMale) {
      return 'bg-primary/5 border-primary/20';
    }
    if (isFemale) {
      return 'bg-theme-secondary/5 border-theme-secondary/20';
    }
    return 'bg-gray-50 border-gray-300';
  };

  const getTextColor = (member: TreeMember) => {
    const isMale = member.gender?.toLowerCase() === 'male';
    const isFemale = member.gender?.toLowerCase() === 'female';

    if (isMale) return 'text-primary';
    if (isFemale) return 'text-theme-secondary';
    return 'text-gray-900';
  };

  if (treeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No family members to display for selected filter</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-full overflow-x-auto">
        {/* Family Tree Visualization */}
        <div className="inline-flex flex-col gap-12 min-w-full">
          {treeData.map(([generation, nodes]) => (
            <div key={generation} className="space-y-6">
              {/* Generation Label */}
              <div className="flex items-center gap-3 justify-center">
                <div className="h-px bg-gray-300 flex-1 max-w-xs" />
                <span className="text-sm font-semibold text-gray-600 px-4 py-1 bg-white border border-gray-300 rounded-full">
                  {getGenerationLabel(generation)}
                </span>
                <div className="h-px bg-gray-300 flex-1 max-w-xs" />
              </div>

              {/* Family Members in Generation */}
              <div className="flex justify-center gap-6 flex-wrap">
                {/* Patient Card - Center of Generation 0 */}
                {generation === 0 && (
                  <div className="relative group">
                    <div className={`
                      relative w-40 rounded-xl border-4 shadow-lg
                      ${patientGender === 'male' ? 'bg-primary/10 border-primary' :
                        patientGender === 'female' ? 'bg-theme-secondary/10 border-theme-secondary' :
                          'bg-theme-accent/10 border-theme-accent'}
                    `}>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 bg-gradient-to-r from-primary to-theme-secondary text-white text-xs font-bold rounded-full shadow-md">
                          PATIENT
                        </span>
                      </div>
                      <div className="p-4 pt-6">
                        <div className={`text-sm font-bold text-center mb-0.5 min-h-[2.5rem] flex items-center justify-center ${patientGender === 'male' ? 'text-primary' :
                            patientGender === 'female' ? 'text-theme-secondary' :
                              'text-theme-accent'
                          }`}>
                          {patientName}
                        </div>
                        <div className="text-xs text-center text-gray-600 mb-3 font-medium">
                          Index Patient
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-700">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              {patientGender === 'male' ? '♂ Male' :
                                patientGender === 'female' ? '♀ Female' :
                                  patientGender || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {nodes.map(node => (
                  <div
                    key={node.id}
                    className="relative group"
                  >
                    {/* Connection Lines */}
                    {generation < 0 && (
                      <div className="absolute top-full left-1/2 w-0.5 h-8 bg-gray-300 transform -translate-x-1/2" />
                    )}

                    {/* Member Card */}
                    <div
                      className={`
                        relative w-40 rounded-xl border-2 shadow-sm
                        transition-all duration-200 cursor-pointer
                        hover:shadow-lg hover:scale-105
                        ${getCardColor(node)}
                      `}
                      onClick={() => onEditMember(node.member)}
                    >
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMember(node.member);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Edit className="h-3 w-3 text-gray-600" />
                      </button>

                      {/* Card Content */}
                      <div className="p-4">
                        {/* Name */}
                        <div className={`text-sm font-semibold text-center mb-0.5 min-h-[2.5rem] flex items-center justify-center ${getTextColor(node)}`}>
                          {node.name}
                        </div>

                        {/* Relationship */}
                        <div className="text-xs text-center text-gray-500 mb-3">
                          {node.relationship}
                        </div>

                        {/* Demographics */}
                        <div className="space-y-2">
                          {/* Gender & Age Row */}
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                            {node.gender && (
                              <span className={`font-medium ${getTextColor(node)}`}>
                                {node.gender === 'male' ? '♂' : node.gender === 'female' ? '♀' : node.gender}
                              </span>
                            )}
                            {node.gender && node.age && <span>•</span>}
                            {node.age && <span>{node.age}</span>}
                          </div>

                          {/* Status Indicators */}
                          {node.deceased && (
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-700 font-medium bg-gray-200 rounded-full px-2 py-1">
                              <AlertCircle className="h-3 w-3" />
                              Deceased
                            </div>
                          )}

                          {/* Conditions Badge */}
                          {node.conditionsCount > 0 && (
                            <div className="flex items-center justify-center gap-1 px-2 py-1 bg-red-100 border border-red-200 rounded-full">
                              <Heart className="h-3 w-3 text-red-600" />
                              <span className="text-xs font-semibold text-red-700">
                                {node.conditionsCount} {node.conditionsCount === 1 ? 'condition' : 'conditions'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm inline-flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/20 border-4 border-primary" />
              <span className="text-xs text-gray-700 font-semibold">Index Patient</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/5 border-2 border-primary/30" />
              <span className="text-xs text-gray-700">Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-theme-secondary/5 border-2 border-theme-secondary/30" />
              <span className="text-xs text-gray-700">Female</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-100 border-2 border-gray-400" />
              <span className="text-xs text-gray-700">Deceased</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-xs text-gray-700">Has Conditions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
