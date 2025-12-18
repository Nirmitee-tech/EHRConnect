'use client';

import React, { useMemo } from 'react';
import { User, Edit, Trash2, Heart, Skull, Info } from 'lucide-react';
import type { FHIRFamilyMemberHistory } from '@/types/fhir';

interface FamilyTreeViewProps {
  familyHistory: FHIRFamilyMemberHistory[];
  patientId: string;
  onEditMember: (member: FHIRFamilyMemberHistory) => void;
  onDeleteMember: (memberId: string) => void;
}

interface TreeNode {
  id: string;
  name: string;
  relationship: string;
  relationshipCode: string;
  member: FHIRFamilyMemberHistory;
  generation: number;
  gender?: string;
  age?: string;
  deceased?: boolean;
  conditions: Array<{ code: string; display: string }>;
}

const RELATIONSHIP_HIERARCHY: Record<string, number> = {
  // Generation -2 (Grandparents)
  'GGRFTH': -2, // Great-grandfather
  'GGRMTH': -2, // Great-grandmother
  'GRFTH': -2, // Grandfather
  'GRMTH': -2, // Grandmother

  // Generation -1 (Parents, Aunts, Uncles)
  'FTH': -1, // Father
  'MTH': -1, // Mother
  'NFTH': -1, // Natural father
  'NMTH': -1, // Natural mother
  'STPFTH': -1, // Step father
  'STPMTH': -1, // Step mother
  'ADOPTF': -1, // Adoptive father
  'ADOPTM': -1, // Adoptive mother
  'UNCLE': -1,
  'AUNT': -1,
  'MAUNT': -1, // Maternal aunt
  'PAUNT': -1, // Paternal aunt
  'MUNCLE': -1, // Maternal uncle
  'PUNCLE': -1, // Paternal uncle

  // Generation 0 (Patient, Siblings)
  'SIB': 0, // Sibling
  'BRO': 0, // Brother
  'SIS': 0, // Sister
  'HSIB': 0, // Half-sibling
  'HBRO': 0, // Half-brother
  'HSIS': 0, // Half-sister
  'STPBRO': 0, // Step brother
  'STPSIS': 0, // Step sister
  'TWIN': 0,
  'TWINBRO': 0,
  'TWINSIS': 0,
  'FTWIN': 0, // Fraternal twin
  'ITWIN': 0, // Identical twin
  'COUSN': 0, // Cousin

  // Generation +1 (Children, Nephews, Nieces)
  'CHILD': 1,
  'CHLDADOPT': 1, // Adopted child
  'DAUADOPT': 1, // Adopted daughter
  'SONADOPT': 1, // Adopted son
  'DAU': 1, // Daughter
  'SON': 1,
  'STPCHLD': 1, // Step child
  'STPDAU': 1, // Step daughter
  'STPSON': 1, // Step son
  'NEPH': 1, // Nephew
  'NIECE': 1,

  // Generation +2 (Grandchildren)
  'GRNDCHILD': 2,
  'GRNDDAU': 2,
  'GRNDSON': 2,
};

const getRelationshipGeneration = (relationshipCode?: string): number => {
  if (!relationshipCode) return 0;
  return RELATIONSHIP_HIERARCHY[relationshipCode] ?? 0;
};

export function FamilyTreeView({
  familyHistory,
  patientId,
  onEditMember,
  onDeleteMember
}: FamilyTreeViewProps) {

  const treeData = useMemo(() => {
    const nodes: TreeNode[] = familyHistory.map(member => {
      const relationshipCode = member.relationship?.coding?.[0]?.code || '';
      const relationshipDisplay = member.relationship?.coding?.[0]?.display || member.relationship?.text || 'Unknown';

      const conditions = (member.condition || []).map(c => ({
        code: c.code?.coding?.[0]?.code || '',
        display: c.code?.coding?.[0]?.display || c.code?.text || 'Unknown condition'
      }));

      let age = '';
      if (member.ageAge?.value) {
        age = `${member.ageAge.value} ${member.ageAge.unit || 'years'}`;
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
        gender: member.sex?.coding?.[0]?.display || member.sex?.text,
        age,
        deceased: member.deceasedBoolean || !!member.deceasedDate || !!member.deceasedAge,
        conditions
      };
    });

    // Group by generation
    const generations = new Map<number, TreeNode[]>();
    nodes.forEach(node => {
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
  }, [familyHistory]);

  const getGenerationLabel = (gen: number): string => {
    if (gen === -2) return 'Grandparents Generation';
    if (gen === -1) return 'Parents Generation';
    if (gen === 0) return 'Patient & Siblings Generation';
    if (gen === 1) return 'Children Generation';
    if (gen === 2) return 'Grandchildren Generation';
    return `Generation ${gen > 0 ? '+' : ''}${gen}`;
  };

  const handleDelete = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to delete ${memberName}'s family history?`)) {
      onDeleteMember(memberId);
    }
  };

  if (treeData.length === 0) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Family Tree Visualization */}
        <div className="space-y-8">
          {treeData.map(([generation, nodes]) => (
            <div key={generation} className="space-y-4">
              {/* Generation Header */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300" />
                <h3 className="text-sm font-semibold text-gray-700 px-3 py-1 bg-gray-100 rounded-full">
                  {getGenerationLabel(generation)}
                </h3>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Family Members in this generation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {nodes.map(node => (
                  <div
                    key={node.id}
                    className="bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-primary/50"
                  >
                    {/* Card Header */}
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${node.deceased ? 'bg-gray-100' : 'bg-primary/5'
                      }`}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-full ${node.deceased ? 'bg-gray-300' : 'bg-primary/10'
                          }`}>
                          <User className={`h-4 w-4 ${node.deceased ? 'text-gray-600' : 'text-primary'
                            }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {node.name}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {node.relationship}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditMember(node.member)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(node.id, node.name)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-4 py-3 space-y-2">
                      {/* Demographics */}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {node.gender && (
                          <span className="flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {node.gender}
                          </span>
                        )}
                        {node.age && (
                          <span>{node.age}</span>
                        )}
                        {node.deceased && (
                          <span className="flex items-center gap-1 text-gray-700 font-medium">
                            <Skull className="h-3 w-3" />
                            Deceased
                          </span>
                        )}
                      </div>

                      {/* Conditions */}
                      {node.conditions.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                            <Heart className="h-3 w-3 text-red-500" />
                            Health Conditions
                          </div>
                          <div className="space-y-1">
                            {node.conditions.slice(0, 3).map((condition, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-gray-600 bg-red-50 px-2 py-1 rounded border border-red-100"
                              >
                                {condition.display}
                              </div>
                            ))}
                            {node.conditions.length > 3 && (
                              <div className="text-xs text-primary font-medium">
                                +{node.conditions.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          No conditions recorded
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/5 border-2 border-primary/30 rounded" />
              <span>Living</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded" />
              <span>Deceased</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Has Health Conditions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
