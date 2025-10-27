'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@nirmitee.io/design-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import type { FHIRFamilyMemberHistory } from '@/types/fhir';
import { CONDITION_MASTERS, CONDITION_CATEGORIES } from '@/data/condition-masters';

interface FamilyMemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FHIRFamilyMemberHistory>) => Promise<void>;
  member: FHIRFamilyMemberHistory | null;
  patientId: string;
}

interface ConditionFormData {
  code: string;
  display: string;
  onset: string;
  outcome: string;
  contributedToDeath: boolean;
  notes: string;
}

// Common relationship codes
const RELATIONSHIP_OPTIONS: SelectOption[] = [
  // Immediate Family
  { value: 'FTH', label: 'Father', subtitle: 'Immediate Family' },
  { value: 'MTH', label: 'Mother', subtitle: 'Immediate Family' },
  { value: 'BRO', label: 'Brother', subtitle: 'Immediate Family' },
  { value: 'SIS', label: 'Sister', subtitle: 'Immediate Family' },

  // Spouse
  { value: 'SPS', label: 'Spouse', subtitle: 'Spouse' },
  { value: 'HUSB', label: 'Husband', subtitle: 'Spouse' },
  { value: 'WIFE', label: 'Wife', subtitle: 'Spouse' },

  // Children
  { value: 'CHILD', label: 'Child', subtitle: 'Children' },
  { value: 'SON', label: 'Son', subtitle: 'Children' },
  { value: 'DAU', label: 'Daughter', subtitle: 'Children' },

  // Grandparents
  { value: 'GRFTH', label: 'Grandfather (Paternal)', subtitle: 'Paternal Grandparents' },
  { value: 'GRMTH', label: 'Grandmother (Paternal)', subtitle: 'Paternal Grandparents' },
  { value: 'MGRFTH', label: 'Grandfather (Maternal)', subtitle: 'Maternal Grandparents' },
  { value: 'MGRMTH', label: 'Grandmother (Maternal)', subtitle: 'Maternal Grandparents' },

  // Grandchildren
  { value: 'GRNDSON', label: 'Grandson', subtitle: 'Grandchildren' },
  { value: 'GRNDDAU', label: 'Granddaughter', subtitle: 'Grandchildren' },

  // Aunts & Uncles
  { value: 'PUNCLE', label: 'Uncle (Paternal)', subtitle: 'Paternal Side' },
  { value: 'PAUNT', label: 'Aunt (Paternal)', subtitle: 'Paternal Side' },
  { value: 'MUNCLE', label: 'Uncle (Maternal)', subtitle: 'Maternal Side' },
  { value: 'MAUNT', label: 'Aunt (Maternal)', subtitle: 'Maternal Side' },

  // In-Laws
  { value: 'FTHINLAW', label: 'Father-in-Law', subtitle: 'In-Laws' },
  { value: 'MTHINLAW', label: 'Mother-in-Law', subtitle: 'In-Laws' },
  { value: 'BROINLAW', label: 'Brother-in-Law', subtitle: 'In-Laws' },
  { value: 'SISINLAW', label: 'Sister-in-Law', subtitle: 'In-Laws' },
  { value: 'SONINLAW', label: 'Son-in-Law', subtitle: 'In-Laws' },
  { value: 'DAUINLAW', label: 'Daughter-in-Law', subtitle: 'In-Laws' },

  // Cousins & Extended
  { value: 'NEPH', label: 'Nephew', subtitle: 'Extended Family' },
  { value: 'NIECE', label: 'Niece', subtitle: 'Extended Family' },
  { value: 'COUSN', label: 'Cousin', subtitle: 'Extended Family' },
];

const GENDER_OPTIONS: SelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

// Relationship to gender mapping (can be overridden by user)
const RELATIONSHIP_GENDER_MAP: Record<string, string> = {
  // Male relationships
  'FTH': 'male',
  'BRO': 'male',
  'HUSB': 'male',
  'SON': 'male',
  'GRFTH': 'male',
  'MGRFTH': 'male',
  'GRNDSON': 'male',
  'PUNCLE': 'male',
  'MUNCLE': 'male',
  'FTHINLAW': 'male',
  'BROINLAW': 'male',
  'SONINLAW': 'male',
  'NEPH': 'male',

  // Female relationships
  'MTH': 'female',
  'SIS': 'female',
  'WIFE': 'female',
  'DAU': 'female',
  'GRMTH': 'female',
  'MGRMTH': 'female',
  'GRNDDAU': 'female',
  'PAUNT': 'female',
  'MAUNT': 'female',
  'MTHINLAW': 'female',
  'SISINLAW': 'female',
  'DAUINLAW': 'female',
  'NIECE': 'female',

  // Neutral relationships (no default)
  'SPS': '',
  'CHILD': '',
  'COUSN': '',
};

export function FamilyMemberDrawer({
  isOpen,
  onClose,
  onSave,
  member,
  patientId
}: FamilyMemberDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deceased, setDeceased] = useState(false);
  const [deceasedAge, setDeceasedAge] = useState('');
  const [conditions, setConditions] = useState<ConditionFormData[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().slice(0, 10));
  const [customConditions, setCustomConditions] = useState<SelectOption[]>([]);

  // Prepare condition options
  const conditionOptions: SelectOption[] = [
    ...CONDITION_MASTERS.map(c => ({
      value: c.code,
      label: c.display,
      subtitle: c.category
    })),
    ...customConditions
  ];

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setRelationship(member.relationship?.coding?.[0]?.code || '');
      setGender(member.sex?.coding?.[0]?.code || '');
      setAge(member.ageAge?.value?.toString() || member.ageString || '');
      setBirthDate(member.bornDate || '');
      setDeceased(member.deceasedBoolean || false);
      setDeceasedAge(member.deceasedAge?.value?.toString() || member.deceasedString || '');
      setRecordedDate(member.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
      setGeneralNotes(member.note?.[0]?.text || '');

      const conditionsData: ConditionFormData[] = (member.condition || []).map(c => ({
        code: c.code?.coding?.[0]?.code || '',
        display: c.code?.coding?.[0]?.display || c.code?.text || '',
        onset: c.onsetAge?.value?.toString() || c.onsetString || '',
        outcome: c.outcome?.coding?.[0]?.display || c.outcome?.text || '',
        contributedToDeath: c.contributedToDeath || false,
        notes: c.note?.[0]?.text || ''
      }));
      setConditions(conditionsData);
    } else {
      // Reset form
      setName('');
      setRelationship('');
      setGender('');
      setAge('');
      setBirthDate('');
      setDeceased(false);
      setDeceasedAge('');
      setConditions([]);
      setGeneralNotes('');
      setRecordedDate(new Date().toISOString().slice(0, 10));
    }
  }, [member, isOpen]);

  // Auto-populate gender based on relationship (can be manually overridden)
  useEffect(() => {
    if (relationship && RELATIONSHIP_GENDER_MAP[relationship]) {
      // Only auto-populate if:
      // 1. It's a new member (not editing), OR
      // 2. Gender is currently empty
      if (!member || !gender) {
        const suggestedGender = RELATIONSHIP_GENDER_MAP[relationship];
        if (suggestedGender) {
          setGender(suggestedGender);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relationship]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        code: '',
        display: '',
        onset: '',
        outcome: '',
        contributedToDeath: false,
        notes: ''
      }
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof ConditionFormData, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const handleConditionSelect = (index: number, conditionCode: string) => {
    const selected = CONDITION_MASTERS.find(c => c.code === conditionCode);
    if (selected) {
      updateCondition(index, 'code', selected.code);
      updateCondition(index, 'display', selected.display);
    } else {
      // It's a custom condition
      const custom = customConditions.find(c => c.value === conditionCode);
      if (custom) {
        updateCondition(index, 'code', '');
        updateCondition(index, 'display', custom.label);
      }
    }
  };

  const handleAddCustomCondition = () => {
    const conditionName = prompt('Enter condition name:');
    if (conditionName && conditionName.trim()) {
      const newCondition: SelectOption = {
        value: `custom-${Date.now()}`,
        label: conditionName.trim(),
        subtitle: 'Custom'
      };
      setCustomConditions([...customConditions, newCondition]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const relationshipObj = RELATIONSHIP_OPTIONS.find(r => r.value === relationship);
      const genderObj = GENDER_OPTIONS.find(g => g.value === gender);

      const memberData: Partial<FHIRFamilyMemberHistory> = {
        name: name || undefined,
        relationship: relationshipObj
          ? {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
                  code: relationshipObj.value,
                  display: relationshipObj.label
                }
              ],
              text: relationshipObj.label
            }
          : undefined,
        sex: genderObj
          ? {
              coding: [
                {
                  system: 'http://hl7.org/fhir/administrative-gender',
                  code: genderObj.value,
                  display: genderObj.label
                }
              ],
              text: genderObj.label
            }
          : undefined,
        date: recordedDate ? new Date(recordedDate).toISOString() : undefined,
        bornDate: birthDate || undefined
      };

      // Add age
      if (age) {
        const ageNum = parseInt(age);
        if (!isNaN(ageNum)) {
          memberData.ageAge = {
            value: ageNum,
            unit: 'years',
            system: 'http://unitsofmeasure.org',
            code: 'a'
          };
        } else {
          memberData.ageString = age;
        }
      }

      // Add deceased info
      if (deceased) {
        memberData.deceasedBoolean = true;
        if (deceasedAge) {
          const deceasedAgeNum = parseInt(deceasedAge);
          if (!isNaN(deceasedAgeNum)) {
            memberData.deceasedAge = {
              value: deceasedAgeNum,
              unit: 'years',
              system: 'http://unitsofmeasure.org',
              code: 'a'
            };
          } else {
            memberData.deceasedString = deceasedAge;
          }
        }
      }

      // Add conditions
      if (conditions.length > 0) {
        memberData.condition = conditions
          .filter(c => c.display)
          .map(c => {
            const condition: any = {
              code: {
                coding: c.code
                  ? [
                      {
                        system: 'http://snomed.info/sct',
                        code: c.code,
                        display: c.display
                      }
                    ]
                  : undefined,
                text: c.display
              }
            };

            if (c.onset) {
              const onsetNum = parseInt(c.onset);
              if (!isNaN(onsetNum)) {
                condition.onsetAge = {
                  value: onsetNum,
                  unit: 'years',
                  system: 'http://unitsofmeasure.org',
                  code: 'a'
                };
              } else {
                condition.onsetString = c.onset;
              }
            }

            if (c.outcome) {
              condition.outcome = {
                text: c.outcome
              };
            }

            if (c.contributedToDeath) {
              condition.contributedToDeath = true;
            }

            if (c.notes) {
              condition.note = [{ text: c.notes }];
            }

            return condition;
          });
      }

      // Add general notes
      if (generalNotes) {
        memberData.note = [{ text: generalNotes }];
      }

      await onSave(memberData);
      onClose();
    } catch (error) {
      console.error('Error saving family member:', error);
      alert('Failed to save family member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent side="right" size="2xl" className="overflow-y-auto">
        {/* Header */}
        <DrawerHeader className="border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold text-gray-900">
              {member ? 'Edit Family Member' : 'Add Family Member'}
            </DrawerTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-8 py-6">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-5">Basic Information</h3>

                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="h-11"
                    />
                  </div>

                  <div>
                    <SearchableSelect
                      label="Relationship"
                      required
                      options={RELATIONSHIP_OPTIONS}
                      value={relationship}
                      onChange={setRelationship}
                      placeholder="Select relationship"
                    />
                  </div>

                  <div>
                    <SearchableSelect
                      label="Gender"
                      options={GENDER_OPTIONS}
                      value={gender}
                      onChange={setGender}
                      placeholder="Select gender"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">
                      Age
                    </Label>
                    <Input
                      id="age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g., 45"
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 mb-2 block">
                      Birth Date
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recordedDate" className="text-sm font-medium text-gray-700 mb-2 block">
                      Recorded Date
                    </Label>
                    <Input
                      id="recordedDate"
                      type="date"
                      value={recordedDate}
                      onChange={(e) => setRecordedDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Deceased Toggle */}
                <div className="mt-5 flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <Label htmlFor="deceased" className="text-sm font-medium text-gray-700">
                    Deceased
                  </Label>
                  <label htmlFor="deceased" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="deceased"
                      checked={deceased}
                      onChange={(e) => setDeceased(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {deceased && (
                  <div className="mt-4">
                    <Label htmlFor="deceasedAge" className="text-sm font-medium text-gray-700 mb-2 block">
                      Age at Death
                    </Label>
                    <Input
                      id="deceasedAge"
                      value={deceasedAge}
                      onChange={(e) => setDeceasedAge(e.target.value)}
                      placeholder="e.g., 65"
                      className="h-11 max-w-xs"
                    />
                  </div>
                )}
              </div>

              {/* Health Conditions */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-medium text-gray-900">Health Conditions</h3>
                  <Button
                    type="button"
                    onClick={addCondition}
                    className="h-9 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Condition
                  </Button>
                </div>

                {conditions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">No conditions added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conditions.map((condition, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-medium text-gray-500 uppercase">Condition {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <SearchableSelect
                              label="Select Condition"
                              options={conditionOptions}
                              value={condition.code || `custom-${condition.display}`}
                              onChange={(value) => handleConditionSelect(index, value)}
                              placeholder="Search conditions..."
                              onAddNew={handleAddCustomCondition}
                              addNewLabel="Add Custom Condition"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Age at Onset
                            </Label>
                            <Input
                              value={condition.onset}
                              onChange={(e) => updateCondition(index, 'onset', e.target.value)}
                              placeholder="e.g., 35"
                              className="h-11"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Outcome
                            </Label>
                            <Input
                              value={condition.outcome}
                              onChange={(e) => updateCondition(index, 'outcome', e.target.value)}
                              placeholder="e.g., Recovered"
                              className="h-11"
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-between bg-red-50 rounded-lg p-3">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              Contributed to death
                            </Label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={condition.contributedToDeath}
                                onChange={(e) => updateCondition(index, 'contributedToDeath', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="col-span-2">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Additional Notes
                            </Label>
                            <textarea
                              value={condition.notes}
                              onChange={(e) => updateCondition(index, 'notes', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              placeholder="Notes about this condition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* General Notes */}
              <div>
                <Label htmlFor="generalNotes" className="text-base font-medium text-gray-900 mb-3 block">
                  General Notes
                </Label>
                <textarea
                  id="generalNotes"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add any additional notes about this family member's health history..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 bg-white">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="h-11 px-6 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !relationship}
              className="h-11 px-8 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {saving ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
