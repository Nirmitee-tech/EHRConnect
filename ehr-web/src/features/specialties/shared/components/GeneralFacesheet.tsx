'use client';

import React from 'react';
import { usePatientDetailStore } from '@/features/patient-detail/store/patient-detail-store';
import { format } from 'date-fns';
import {
  Activity,
  AlertCircle,
  Pill,
  TestTube,
  FileText,
  Calendar,
  Heart,
  Syringe,
  ImageIcon,
  Shield,
  Droplet,
  ThermometerSun,
  User as UserIcon,
  Users
} from 'lucide-react';

import {
  FacesheetCard,
  FacesheetHeader,
  VitalSignCard,
  SectionHeader,
  CompactListItem
} from './facesheet';

interface GeneralFacesheetProps {
  patientId: string;
}

export function GeneralFacesheet({ patientId: _ }: GeneralFacesheetProps) {
  const {
    patient,
    allergies,
    medications,
    problems,
    observations,
    immunizations,
    labResults,
    encounters,
    documents,
    imagingStudies,
    insurances,
    loading
  } = usePatientDetailStore();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-gray-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-xs text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        <p>Patient data not available</p>
      </div>
    );
  }

  const activeMedications = medications?.filter((med: any) => med.status === 'active') || [];
  const activeProblems = problems?.filter((p: any) => p.clinicalStatus?.coding?.[0]?.code === 'active') || [];
  const recentEncounters = encounters?.slice(0, 10) || [];

  const getLatestVital = (code: string) => {
    return observations?.find((obs: any) =>
      obs.code?.coding?.some((c: any) => c.code === code)
    );
  };

  const bpObs = getLatestVital('85354-9');
  const tempObs = getLatestVital('8310-5');
  const heartRateObs = getLatestVital('8867-4');
  const weightObs = getLatestVital('29463-7');
  const heightObs = getLatestVital('8302-2');
  const spo2Obs = getLatestVital('2708-6');

  const calculateBMI = () => {
    if (!weightObs || !heightObs) return null;
    const weight = weightObs.valueQuantity?.value;
    const height = heightObs.valueQuantity?.value;
    if (!weight || !height) return null;
    const heightM = height > 3 ? height / 100 : height;
    const bmi = weight / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const bmi = calculateBMI();

  return (
    <div className="bg-white p-3">
      <div className="max-w-[1600px] mx-auto space-y-3">
        <FacesheetHeader
          patient={{
            id: patient.id,
            name: patient.name,
            dob: patient.dob,
            gender: patient.gender,
            mrn: patient.mrn,
            phone: patient.phone,
            email: patient.email
          }}
          identifiers={[
            ...(insurances && insurances.length > 0 ? [{
              label: 'INS',
              value: insurances[0].payor?.[0]?.display?.substring(0, 8) || 'Active'
            }] : []),
            { label: 'MRN', value: patient.mrn || patient.id.substring(0, 8) }
          ]}
        />

        {/* 4-Column Dense Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Column 1 - Vitals & Diagnoses */}
          <div className="space-y-2">
            {/* Vitals */}
            <FacesheetCard>
              <SectionHeader title="Vitals" icon={Activity} />
              <div className="grid grid-cols-2 gap-1.5">
                <VitalSignCard
                  label="BP"
                  currentValue={bpObs?.component?.[0]?.valueQuantity?.value && bpObs?.component?.[1]?.valueQuantity?.value
                    ? `${bpObs.component[0].valueQuantity.value}/${bpObs.component[1].valueQuantity.value}`
                    : '120/80'}
                  unit="mmHg"
                  timestamp={bpObs?.effectiveDateTime}
                  status="normal"
                  referenceRange="<120/80"
                />
                <VitalSignCard
                  label="HR"
                  currentValue={heartRateObs?.valueQuantity?.value?.toString() || '72'}
                  unit="bpm"
                  timestamp={heartRateObs?.effectiveDateTime}
                  status="normal"
                  referenceRange="60-100"
                  icon={<Heart className="h-3 w-3" />}
                />
                <VitalSignCard
                  label="Temp"
                  currentValue={tempObs?.valueQuantity?.value?.toString() || '98.6'}
                  unit="°F"
                  timestamp={tempObs?.effectiveDateTime}
                  status="normal"
                  icon={<ThermometerSun className="h-3 w-3" />}
                />
                <VitalSignCard
                  label="SpO₂"
                  currentValue={spo2Obs?.valueQuantity?.value?.toString() || '98'}
                  unit="%"
                  timestamp={spo2Obs?.effectiveDateTime}
                  status="normal"
                  referenceRange=">95%"
                  icon={<Droplet className="h-3 w-3" />}
                />
                {bmi && (
                  <VitalSignCard
                    label="BMI"
                    currentValue={bmi}
                    unit="kg/m²"
                    status={parseFloat(bmi) > 25 ? 'high' : parseFloat(bmi) < 18.5 ? 'low' : 'normal'}
                    referenceRange="18.5-25"
                  />
                )}
              </div>
            </FacesheetCard>

            {/* Diagnoses */}
            <FacesheetCard>
              <SectionHeader
                title="Diagnoses"
                icon={AlertCircle}
                count={activeProblems.length}
                alert={activeProblems.length > 10}
              />
              {activeProblems.length > 0 ? (
                <div className="space-y-0 max-h-64 overflow-y-auto">
                  {activeProblems.slice(0, 15).map((problem: any) => {
                    const name = problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown';
                    const date = problem.onsetDateTime || problem.recordedDate;
                    const severity = problem.severity?.coding?.[0]?.display;

                    return (
                      <CompactListItem
                        key={problem.id}
                        date={date ? format(new Date(date), 'MM/dd/yy') : undefined}
                        badge={severity ? { text: severity, color: 'orange' } : undefined}
                      >
                        <div className="font-medium text-xs">{name}</div>
                        {problem.code?.coding?.[0]?.code && (
                          <div className="text-[9px] text-gray-500 mt-0.5">
                            {problem.code.coding[0].code}
                          </div>
                        )}
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>

            {/* Allergies */}
            <FacesheetCard>
              <SectionHeader
                title="Allergies"
                icon={AlertCircle}
                count={allergies?.length || 0}
                alert={allergies && allergies.length > 0}
              />
              {allergies && allergies.length > 0 ? (
                <div className="space-y-0">
                  {allergies.slice(0, 10).map((allergy: any) => {
                    const name = allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown';
                    const reactions = allergy.reaction?.map((r: any) =>
                      r.manifestation?.[0]?.text || r.manifestation?.[0]?.coding?.[0]?.display
                    ).filter(Boolean).join(', ');

                    return (
                      <CompactListItem
                        key={allergy.id}
                        badge={{ text: 'ALLERGY', color: 'red' }}
                      >
                        <div className="font-semibold text-red-700 uppercase text-[10px]">{name}</div>
                        {reactions && (
                          <div className="text-[9px] text-gray-600 mt-0.5">{reactions}</div>
                        )}
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-1.5 bg-green-50 border border-green-200 rounded text-[10px]">
                  <span className="font-semibold text-green-800">NKDA</span>
                </div>
              )}
            </FacesheetCard>

            {/* Social History */}
            <FacesheetCard>
              <SectionHeader title="Social History" icon={UserIcon} />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Smoking:</span>
                  <span className="font-semibold text-gray-900">Non-smoker</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Alcohol:</span>
                  <span className="font-semibold text-gray-900">Occasional</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Exercise:</span>
                  <span className="font-semibold text-gray-900">3x/week</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Occupation:</span>
                  <span className="font-semibold text-gray-900">Office Worker</span>
                </div>
              </div>
            </FacesheetCard>

            {/* Family History */}
            <FacesheetCard>
              <SectionHeader title="Family History" icon={Users} />
              <div className="space-y-0 max-h-32 overflow-y-auto">
                <CompactListItem>
                  <span className="text-xs">Father: Hypertension, Type 2 Diabetes</span>
                </CompactListItem>
                <CompactListItem>
                  <span className="text-xs">Mother: Breast Cancer (age 65)</span>
                </CompactListItem>
                <CompactListItem>
                  <span className="text-xs">Sibling: Asthma</span>
                </CompactListItem>
              </div>
            </FacesheetCard>
          </div>

          {/* Column 2 - Medications */}
          <div className="space-y-2">
            <FacesheetCard>
              <SectionHeader
                title="Medications"
                icon={Pill}
                count={activeMedications.length}
              />
              {activeMedications.length > 0 ? (
                <div className="space-y-0 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {activeMedications.map((medication: any) => {
                    const name = medication.medicationCodeableConcept?.text ||
                                medication.medicationCodeableConcept?.coding?.[0]?.display ||
                                'Unknown';
                    const dosage = medication.dosageInstruction?.[0]?.text;
                    const date = medication.authoredOn;

                    return (
                      <CompactListItem
                        key={medication.id}
                        date={date ? format(new Date(date), 'MM/dd') : undefined}
                        badge={{ text: 'Active', color: 'green' }}
                      >
                        <div className="font-semibold text-xs">{name}</div>
                        {dosage && <div className="text-[9px] text-gray-600 mt-0.5">{dosage}</div>}
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>
          </div>

          {/* Column 3 - Labs & Immunizations */}
          <div className="space-y-2">
            <FacesheetCard>
              <SectionHeader
                title="Labs"
                icon={TestTube}
                count={labResults?.length || 0}
              />
              {labResults && labResults.length > 0 ? (
                <div className="space-y-0 max-h-80 overflow-y-auto">
                  {labResults.slice(0, 15).map((lab: any) => {
                    const name = lab.code?.text || lab.code?.coding?.[0]?.display || 'Unknown Test';
                    const value = lab.valueQuantity?.value;
                    const unit = lab.valueQuantity?.unit;
                    const date = lab.effectiveDateTime || lab.issued;
                    const interpretation = lab.interpretation?.[0]?.coding?.[0]?.code;

                    let badgeColor: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray' = 'gray';
                    let badgeText = 'N';

                    if (interpretation === 'H' || interpretation === 'HH') {
                      badgeColor = 'red';
                      badgeText = 'H';
                    } else if (interpretation === 'L' || interpretation === 'LL') {
                      badgeColor = 'blue';
                      badgeText = 'L';
                    } else if (interpretation === 'N') {
                      badgeColor = 'green';
                      badgeText = 'N';
                    }

                    return (
                      <CompactListItem
                        key={lab.id}
                        date={date ? format(new Date(date), 'MM/dd') : undefined}
                        badge={{ text: badgeText, color: badgeColor }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-xs truncate">{name}</span>
                          {value && (
                            <span className="font-bold text-gray-900 ml-1 text-[10px]">
                              {value} {unit}
                            </span>
                          )}
                        </div>
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>

            <FacesheetCard>
              <SectionHeader
                title="Immunizations"
                icon={Syringe}
                count={immunizations?.length || 0}
              />
              {immunizations && immunizations.length > 0 ? (
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {immunizations.slice(0, 10).map((immunization: any) => {
                    const vaccine = immunization.vaccineCode?.text ||
                                   immunization.vaccineCode?.coding?.[0]?.display ||
                                   'Unknown';
                    const date = immunization.occurrenceDateTime || immunization.recorded;

                    return (
                      <CompactListItem
                        key={immunization.id}
                        date={date ? format(new Date(date), 'MM/dd/yy') : undefined}
                      >
                        <span className="text-xs">{vaccine}</span>
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>
          </div>

          {/* Column 4 - Encounters, Documents, Imaging */}
          <div className="space-y-2">
            <FacesheetCard>
              <SectionHeader
                title="Encounters"
                icon={Calendar}
                count={recentEncounters.length}
              />
              {recentEncounters.length > 0 ? (
                <div className="space-y-0 max-h-64 overflow-y-auto">
                  {recentEncounters.map((encounter: any) => {
                    const date = encounter.period?.start || encounter.meta?.lastUpdated;
                    const type = encounter.type?.[0]?.text || encounter.type?.[0]?.coding?.[0]?.display || 'Visit';
                    const status = encounter.status;

                    let badgeColor: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray' = 'gray';
                    if (status === 'finished') badgeColor = 'green';
                    else if (status === 'in-progress') badgeColor = 'blue';

                    return (
                      <CompactListItem
                        key={encounter.id}
                        badge={{ text: status.substring(0, 3).toUpperCase(), color: badgeColor }}
                      >
                        <div className="font-medium text-xs">
                          {date ? format(new Date(date), 'MM/dd/yy') : '-'}
                        </div>
                        <div className="text-[9px] text-gray-600 mt-0.5 truncate">{type}</div>
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>

            <FacesheetCard>
              <SectionHeader
                title="Documents"
                icon={FileText}
                count={documents?.length || 0}
              />
              {documents && documents.length > 0 ? (
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {documents.slice(0, 10).map((doc: any) => {
                    const description = doc.description || doc.type?.text || 'Document';
                    const date = doc.date || doc.meta?.lastUpdated;

                    return (
                      <CompactListItem
                        key={doc.id}
                        date={date ? format(new Date(date), 'MM/dd') : undefined}
                      >
                        <div className="font-medium text-xs text-blue-700 truncate">
                          {description}
                        </div>
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>

            <FacesheetCard>
              <SectionHeader
                title="Imaging"
                icon={ImageIcon}
                count={imagingStudies?.length || 0}
              />
              {imagingStudies && imagingStudies.length > 0 ? (
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {imagingStudies.slice(0, 8).map((study: any) => {
                    const modality = study.modality?.[0]?.display || study.modality?.[0]?.code || 'Unknown';
                    const date = study.started;

                    return (
                      <CompactListItem
                        key={study.id}
                        date={date ? format(new Date(date), 'MM/dd') : undefined}
                      >
                        <span className="text-xs">{modality}</span>
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>

            <FacesheetCard>
              <SectionHeader
                title="Insurance"
                icon={Shield}
                count={insurances?.length || 0}
              />
              {insurances && insurances.length > 0 ? (
                <div className="space-y-1">
                  {insurances.slice(0, 2).map((insurance: any) => {
                    const payor = insurance.payor?.[0]?.display || 'Unknown';

                    return (
                      <div
                        key={insurance.id}
                        className="bg-blue-50 border border-blue-200 rounded p-1.5"
                      >
                        <div className="font-semibold text-xs text-blue-900 truncate">{payor}</div>
                        <div className="text-[9px] text-blue-700 mt-0.5">Active</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>
          </div>
        </div>
      </div>
    </div>
  );
}
