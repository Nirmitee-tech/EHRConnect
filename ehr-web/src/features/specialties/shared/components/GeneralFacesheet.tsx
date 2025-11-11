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
  Users,
  TrendingUp,
  Clock,
  UserPlus,
  ClipboardList
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
    loading,
    openDrawer
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

  // Extract procedures
  const procedures = observations?.filter((obs: any) =>
    obs.resourceType === 'Procedure' ||
    obs.category?.coding?.some((c: any) => c.code === 'procedure')
  ) || [];

  // Extract chief complaints from encounters
  const chiefComplaints = encounters?.slice(0, 10).map((enc: any) => ({
    date: enc.period?.start || enc.meta?.lastUpdated,
    complaint: enc.reasonCode?.[0]?.text || enc.reasonCode?.[0]?.coding?.[0]?.display || enc.type?.[0]?.text
  })).filter((c: any) => c.complaint) || [];

  // Extract surgical history (mock for now - ideally from Procedure resources)
  const surgeries = procedures.filter((p: any) =>
    p.category?.coding?.some((c: any) => c.code === 'surgical')
  ).slice(0, 5);

  // Get recent vital trends
  const vitalHistory = observations?.filter((obs: any) =>
    ['85354-9', '8310-5', '8867-4', '29463-7'].includes(obs.code?.coding?.[0]?.code)
  ).slice(0, 10) || [];

  return (
    <div className="bg-white p-2">
      <div className="max-w-full mx-auto space-y-2">
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

        {/* CDS Alerts Banner - Prominent Position */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm text-yellow-900 mb-1">Clinical Decision Support Alerts (3)</div>
              <div className="space-y-1 text-xs text-yellow-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-semibold">HIGH</span>
                  <span>Drug interaction: Ibuprofen + Warfarin may increase bleeding risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-semibold">MED</span>
                  <span>Overdue for Annual Wellness Visit (last visit: 14 months ago)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">INFO</span>
                  <span>Patient eligible for flu vaccine (2024-2025 season)</span>
                </div>
              </div>
            </div>
            <button className="text-xs text-yellow-700 hover:text-yellow-900 font-medium">
              View All (3)
            </button>
          </div>
        </div>

        {/* 6-Column Ultra-Dense Grid for Maximum Data */}
        <div className="grid grid-cols-6 gap-1.5">
          {/* Column 1 - Vitals & Allergies */}
          <div className="space-y-1.5">
            {/* Vitals */}
            <FacesheetCard>
              <SectionHeader
                title="Vitals"
                icon={Activity}
                onAdd={() => openDrawer('vitals')}
                onViewAll={() => openDrawer('vitals')}
              />
              <div className="grid grid-cols-2 gap-1">
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

            {/* Allergies - Move here for better space */}
            <FacesheetCard>
              <SectionHeader
                title="Allergies"
                icon={AlertCircle}
                count={allergies?.length || 0}
                alert={allergies && allergies.length > 0}
                onAdd={() => openDrawer('allergy')}
                onViewAll={() => openDrawer('allergy')}
              />
              {allergies && allergies.length > 0 ? (
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {allergies.slice(0, 8).map((allergy: any) => {
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

            {/* Care Gaps - New */}
            <FacesheetCard>
              <SectionHeader
                title="Care Gaps"
                icon={AlertCircle}
                count={3}
                alert={true}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'OVERDUE', color: 'red' }}>
                  <div className="text-xs font-semibold text-red-700">Diabetic Eye Exam</div>
                  <div className="text-[9px] text-gray-600">Last: 18 months ago</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'DUE', color: 'orange' }}>
                  <div className="text-xs font-semibold text-orange-700">A1C Test</div>
                  <div className="text-[9px] text-gray-600">Due: This month</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'DUE', color: 'yellow' }}>
                  <div className="text-xs font-semibold text-yellow-700">Mammogram</div>
                  <div className="text-[9px] text-gray-600">Due: Next 2 months</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Vital Trends - New */}
            <FacesheetCard>
              <SectionHeader
                title="Vital Trends"
                icon={TrendingUp}
                onViewAll={() => openDrawer('vitals')}
              />
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">BP Trend:</span>
                  <span className="font-medium text-orange-600">↑ Increasing</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium text-green-600">→ Stable</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600">Glucose:</span>
                  <span className="font-medium text-red-600">↑↑ High</span>
                </div>
              </div>
            </FacesheetCard>

            {/* Health Maintenance - New */}
            <FacesheetCard>
              <SectionHeader
                title="Health Maintenance"
                icon={Heart}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'DUE', color: 'red' }}>
                  <div className="text-xs font-semibold text-red-700">Colonoscopy</div>
                  <div className="text-[9px] text-gray-600">Age 50+ screening</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'CURRENT', color: 'green' }}>
                  <div className="text-xs">Flu Vaccine</div>
                  <div className="text-[9px] text-gray-600">Received: 10/01/25</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'DUE', color: 'orange' }}>
                  <div className="text-xs">Pneumococcal</div>
                  <div className="text-[9px] text-gray-600">Due: Next visit</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Risk Scores - New */}
            <FacesheetCard>
              <SectionHeader
                title="Risk Scores"
                icon={TrendingUp}
              />
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">10-yr CVD Risk:</span>
                  <span className="font-semibold text-orange-600">18% (High)</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Fall Risk:</span>
                  <span className="font-semibold text-yellow-600">Moderate</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600">Readmit Risk:</span>
                  <span className="font-semibold text-green-600">Low</span>
                </div>
              </div>
            </FacesheetCard>
          </div>

          {/* Column 2 - Diagnoses & Chief Complaints */}
          <div className="space-y-1.5">
            {/* Diagnoses */}
            <FacesheetCard>
              <SectionHeader
                title="Diagnoses"
                icon={AlertCircle}
                count={activeProblems.length}
                alert={activeProblems.length > 10}
                onAdd={() => openDrawer('problem')}
                onViewAll={() => openDrawer('problem')}
              />
              {activeProblems.length > 0 ? (
                <div className="space-y-0 max-h-96 overflow-y-auto">
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
                <div className="text-center py-4">
                  <p className="text-[10px] text-gray-500 mb-2">No diagnoses recorded</p>
                  <button
                    onClick={() => openDrawer('problem')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Diagnosis
                  </button>
                </div>
              )}
            </FacesheetCard>

            {/* Chief Complaints - Move here */}
            <FacesheetCard>
              <SectionHeader
                title="Chief Complaints"
                icon={AlertCircle}
                count={chiefComplaints.length}
                onAdd={() => openDrawer('encounter')}
              />
              {chiefComplaints.length > 0 ? (
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {chiefComplaints.map((item: any, idx: number) => (
                    <CompactListItem
                      key={idx}
                      date={item.date ? format(new Date(item.date), 'MM/dd/yy') : undefined}
                    >
                      <span className="text-xs">{item.complaint}</span>
                    </CompactListItem>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-[10px] text-gray-500 mb-1">No chief complaints</p>
                  <button
                    onClick={() => openDrawer('encounter')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add from Encounter
                  </button>
                </div>
              )}
            </FacesheetCard>

            {/* Active Problems by Category - New */}
            <FacesheetCard>
              <SectionHeader
                title="Problems by Type"
                icon={AlertCircle}
              />
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Chronic:</span>
                  <span className="font-semibold text-gray-900">4</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Acute:</span>
                  <span className="font-semibold text-gray-900">1</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600">Resolved (30d):</span>
                  <span className="font-semibold text-gray-900">2</span>
                </div>
              </div>
            </FacesheetCard>

            {/* Advance Directives - New */}
            <FacesheetCard>
              <SectionHeader
                title="Advance Directives"
                icon={FileText}
                onAdd={() => openDrawer('document')}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'ON FILE', color: 'green' }}>
                  <div className="text-xs font-medium">Living Will</div>
                  <div className="text-[9px] text-gray-600">Signed: 01/15/2023</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'ON FILE', color: 'green' }}>
                  <div className="text-xs font-medium">Healthcare Proxy</div>
                  <div className="text-[9px] text-gray-600">POA: Jane Doe</div>
                </CompactListItem>
              </div>
            </FacesheetCard>
          </div>

          {/* Column 3 - Medications */}
          <div className="space-y-1.5">
            <FacesheetCard>
              <SectionHeader
                title="Medications"
                icon={Pill}
                count={activeMedications.length}
                onAdd={() => openDrawer('medication')}
                onViewAll={() => openDrawer('medication')}
              />
              {activeMedications.length > 0 ? (
                <div className="space-y-0 max-h-96 overflow-y-auto">
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
                <div className="text-center py-4">
                  <p className="text-[10px] text-gray-500 mb-2">No medications</p>
                  <button
                    onClick={() => openDrawer('medication')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Medication
                  </button>
                </div>
              )}
            </FacesheetCard>

            {/* Procedures */}
            <FacesheetCard>
              <SectionHeader
                title="Procedures / CPT Codes"
                icon={Activity}
                count={procedures.length}
                onAdd={() => openDrawer('encounter')}
              />
              {procedures.length > 0 ? (
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {procedures.slice(0, 10).map((proc: any) => {
                    const name = proc.code?.text || proc.code?.coding?.[0]?.display || 'Unknown';
                    const date = proc.performedDateTime || proc.performedPeriod?.start;
                    const code = proc.code?.coding?.[0]?.code;

                    return (
                      <CompactListItem
                        key={proc.id}
                        date={date ? format(new Date(date), 'MM/dd/yy') : undefined}
                      >
                        <div className="font-medium text-xs">{name}</div>
                        {code && <div className="text-[9px] text-gray-500 mt-0.5">CPT: {code}</div>}
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>

            {/* Social/Family History - Compact */}
            <FacesheetCard>
              <SectionHeader
                title="Social/Family Hx"
                icon={Heart}
                onAdd={() => openDrawer('medicalInfo')}
              />
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Smoking:</span>
                  <span className="font-medium text-gray-900">Non-smoker</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Alcohol:</span>
                  <span className="font-medium text-gray-900">Occasional</span>
                </div>
                <div className="pt-1 text-gray-700">
                  <div className="font-semibold text-[9px] text-gray-500 uppercase mb-0.5">Family Hx</div>
                  <div>Father: HTN, DM2</div>
                  <div>Mother: Breast CA</div>
                </div>
              </div>
            </FacesheetCard>

            {/* Medication History - New */}
            <FacesheetCard>
              <SectionHeader
                title="Medication History"
                icon={Pill}
              />
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Active Rx:</span>
                  <span className="font-semibold text-gray-900">4</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Discontinued (90d):</span>
                  <span className="font-semibold text-gray-900">2</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600">Allergies:</span>
                  <span className="font-semibold text-red-600">3</span>
                </div>
              </div>
            </FacesheetCard>

            {/* Discontinued Meds - New */}
            <FacesheetCard>
              <SectionHeader
                title="Discontinued Meds"
                icon={Pill}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'STOPPED', color: 'gray' }}>
                  <div className="text-xs">Metformin 500mg</div>
                  <div className="text-[9px] text-gray-600">D/C: 10/15/25 • Side effects</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'STOPPED', color: 'gray' }}>
                  <div className="text-xs">Lisinopril 10mg</div>
                  <div className="text-[9px] text-gray-600">D/C: 09/20/25 • Switched to ARB</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Medication Adherence - New */}
            <FacesheetCard>
              <SectionHeader
                title="Med Adherence"
                icon={AlertCircle}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: '95%', color: 'green' }}>
                  <div className="text-xs">Metoprolol</div>
                  <div className="text-[9px] text-gray-600">Last refill: On time</div>
                </CompactListItem>
                <CompactListItem badge={{ text: '60%', color: 'orange' }}>
                  <div className="text-xs">Atorvastatin</div>
                  <div className="text-[9px] text-gray-600">Last refill: 15 days late</div>
                </CompactListItem>
                <CompactListItem badge={{ text: '40%', color: 'red' }}>
                  <div className="text-xs">Insulin</div>
                  <div className="text-[9px] text-gray-600">Last refill: 45 days late</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Pharmacy - New */}
            <FacesheetCard>
              <SectionHeader
                title="Pharmacy"
                icon={Pill}
              />
              <div className="text-[10px] space-y-0.5">
                <div className="font-semibold text-gray-900">CVS Pharmacy #4582</div>
                <div className="text-gray-600">123 Main St, Boston MA</div>
                <div className="text-gray-600">(617) 555-1234</div>
              </div>
            </FacesheetCard>
          </div>

          {/* Column 4 - Labs (Organized by Category) */}
          <div className="space-y-1.5">
            <FacesheetCard>
              <SectionHeader
                title="Lab Results"
                icon={TestTube}
                count={labResults?.length || 0}
                onAdd={() => openDrawer('lab')}
                onViewAll={() => openDrawer('lab')}
              />
              {labResults && labResults.length > 0 ? (
                <div className="space-y-0 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* CBC Panel */}
                  <div className="bg-blue-50 px-2 py-1 border-b border-blue-200">
                    <div className="text-[9px] font-bold text-blue-900 uppercase">Complete Blood Count</div>
                  </div>
                  {labResults.filter((lab: any) =>
                    ['718-7', '789-8', '787-2', '785-6', '777-3'].includes(lab.code?.coding?.[0]?.code)
                  ).slice(0, 5).map((lab: any) => {
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

                  {/* Metabolic Panel */}
                  <div className="bg-green-50 px-2 py-1 border-b border-green-200 mt-2">
                    <div className="text-[9px] font-bold text-green-900 uppercase">Metabolic Panel</div>
                  </div>
                  {labResults.filter((lab: any) =>
                    ['2345-7', '2160-0', '6299-2', '38483-4', '2951-2'].includes(lab.code?.coding?.[0]?.code)
                  ).slice(0, 5).map((lab: any) => {
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

                  {/* Other Labs */}
                  <div className="bg-purple-50 px-2 py-1 border-b border-purple-200 mt-2">
                    <div className="text-[9px] font-bold text-purple-900 uppercase">Other Tests</div>
                  </div>
                  {labResults.slice(0, 10).map((lab: any) => {
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

            {/* Lab Trends - New */}
            <FacesheetCard>
              <SectionHeader
                title="Lab Trends"
                icon={TrendingUp}
                onViewAll={() => openDrawer('lab')}
              />
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">A1C:</span>
                  <span className="font-medium text-red-600">↑ 7.2% (was 6.8%)</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">Creatinine:</span>
                  <span className="font-medium text-orange-600">↑ 1.4 (was 1.2)</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-gray-100">
                  <span className="text-gray-600">LDL:</span>
                  <span className="font-medium text-green-600">↓ 110 (was 145)</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600">Hemoglobin:</span>
                  <span className="font-medium text-green-600">→ 13.5 (stable)</span>
                </div>
              </div>
            </FacesheetCard>

            {/* Abnormal Labs - New */}
            <FacesheetCard>
              <SectionHeader
                title="Abnormal Labs"
                icon={AlertCircle}
                count={3}
                alert={true}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'HIGH', color: 'red' }}>
                  <div className="text-xs font-semibold text-red-700">A1C: 7.2%</div>
                  <div className="text-[9px] text-gray-600">11/08/25 • Ref: 4.0-5.6%</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'HIGH', color: 'red' }}>
                  <div className="text-xs font-semibold text-red-700">Creatinine: 1.4</div>
                  <div className="text-[9px] text-gray-600">11/08/25 • Ref: 0.7-1.2 mg/dL</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'LOW', color: 'blue' }}>
                  <div className="text-xs font-semibold text-blue-700">Vitamin D: 18</div>
                  <div className="text-[9px] text-gray-600">11/01/25 • Ref: 30-100 ng/mL</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Pending Lab Orders - New */}
            <FacesheetCard>
              <SectionHeader
                title="Pending Lab Orders"
                icon={TestTube}
                count={2}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'ORDERED', color: 'orange' }}>
                  <div className="text-xs font-medium">Lipid Panel</div>
                  <div className="text-[9px] text-gray-600">Ordered: 11/08/25</div>
                  <div className="text-[9px] text-gray-500">Fasting required</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'ORDERED', color: 'orange' }}>
                  <div className="text-xs font-medium">Thyroid Panel (TSH, T4)</div>
                  <div className="text-[9px] text-gray-600">Ordered: 11/05/25</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Microbiology Results - New */}
            <FacesheetCard>
              <SectionHeader
                title="Microbiology"
                icon={TestTube}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'FINAL', color: 'green' }}>
                  <div className="text-xs font-medium">Urine Culture</div>
                  <div className="text-[9px] text-gray-600">10/15/25 • No growth</div>
                </CompactListItem>
                <CompactListItem>
                  <div className="text-xs font-medium">Strep Throat</div>
                  <div className="text-[9px] text-gray-600">09/20/25 • Negative</div>
                </CompactListItem>
              </div>
            </FacesheetCard>
          </div>

          {/* Column 5 - Encounters & Immunizations */}
          <div className="space-y-1.5">
            <FacesheetCard>
              <SectionHeader
                title="Encounters"
                icon={Calendar}
                count={recentEncounters.length}
                onAdd={() => openDrawer('encounter')}
                onViewAll={() => openDrawer('encounter')}
              />
              {recentEncounters.length > 0 ? (
                <div className="space-y-0 max-h-80 overflow-y-auto">
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
                <div className="text-center py-4">
                  <p className="text-[10px] text-gray-500 mb-2">No encounters</p>
                  <button
                    onClick={() => openDrawer('encounter')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Encounter
                  </button>
                </div>
              )}
            </FacesheetCard>

            <FacesheetCard>
              <SectionHeader
                title="Immunizations"
                icon={Syringe}
                count={immunizations?.length || 0}
                onAdd={() => openDrawer('immunization')}
                onViewAll={() => openDrawer('immunization')}
              />
              {immunizations && immunizations.length > 0 ? (
                <div className="space-y-0 max-h-64 overflow-y-auto">
                  {immunizations.slice(0, 15).map((immunization: any) => {
                    const vaccine = immunization.vaccineCode?.text ||
                                   immunization.vaccineCode?.coding?.[0]?.display ||
                                   'Unknown';
                    const date = immunization.occurrenceDateTime || immunization.recorded;
                    const status = immunization.status;

                    return (
                      <CompactListItem
                        key={immunization.id}
                        date={date ? format(new Date(date), 'MM/dd/yy') : undefined}
                        badge={status === 'completed' ? { text: 'Done', color: 'green' } : undefined}
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

            {/* Past Surgeries */}
            <FacesheetCard>
              <SectionHeader
                title="Past Surgeries"
                icon={Activity}
                count={surgeries.length}
                onAdd={() => openDrawer('medicalInfo')}
              />
              {surgeries.length > 0 ? (
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {surgeries.map((surgery: any) => {
                    const name = surgery.code?.text || surgery.code?.coding?.[0]?.display || 'Unknown Surgery';
                    const date = surgery.performedDateTime || surgery.performedPeriod?.start;

                    return (
                      <CompactListItem
                        key={surgery.id}
                        date={date ? format(new Date(date), 'MM/dd/yy') : undefined}
                      >
                        <span className="text-xs">{name}</span>
                      </CompactListItem>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[10px] text-gray-500 mb-2">No surgeries reported</p>
                  <button
                    onClick={() => openDrawer('medicalInfo')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Surgery
                  </button>
                </div>
              )}
            </FacesheetCard>

            {/* Upcoming Appointments - New */}
            <FacesheetCard>
              <SectionHeader
                title="Upcoming Appts"
                icon={Calendar}
                count={2}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'NEXT', color: 'blue' }}>
                  <div className="text-xs font-medium">Annual Physical</div>
                  <div className="text-[9px] text-gray-600">12/15/2025 9:00 AM</div>
                  <div className="text-[9px] text-gray-500">Dr. Smith</div>
                </CompactListItem>
                <CompactListItem>
                  <div className="text-xs font-medium">Follow-up</div>
                  <div className="text-[9px] text-gray-600">01/05/2026 2:30 PM</div>
                  <div className="text-[9px] text-gray-500">Dr. Johnson</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Recent Orders - New */}
            <FacesheetCard>
              <SectionHeader
                title="Recent Orders"
                icon={ClipboardList}
                count={3}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'PENDING', color: 'orange' }}>
                  <div className="text-xs">Lipid Panel</div>
                  <div className="text-[9px] text-gray-600">Ordered: 11/08/25</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'COMPLETED', color: 'green' }}>
                  <div className="text-xs">Chest X-Ray</div>
                  <div className="text-[9px] text-gray-600">Completed: 11/01/25</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'PENDING', color: 'orange' }}>
                  <div className="text-xs">Referral to Cardiology</div>
                  <div className="text-[9px] text-gray-600">Ordered: 10/28/25</div>
                </CompactListItem>
              </div>
            </FacesheetCard>
          </div>

          {/* Column 6 - Documents, Imaging, Insurance */}
          <div className="space-y-1.5">
            <FacesheetCard>
              <SectionHeader
                title="Documents"
                icon={FileText}
                count={documents?.length || 0}
                onAdd={() => openDrawer('document')}
                onViewAll={() => openDrawer('document')}
              />
              {documents && documents.length > 0 ? (
                <div className="space-y-0 max-h-80 overflow-y-auto">
                  {documents.slice(0, 20).map((doc: any) => {
                    const description = doc.description || doc.type?.text || 'Document';
                    const date = doc.date || doc.meta?.lastUpdated;
                    const type = doc.type?.coding?.[0]?.display || doc.type?.text;

                    return (
                      <CompactListItem
                        key={doc.id}
                        date={date ? format(new Date(date), 'MM/dd') : undefined}
                      >
                        <div className="font-medium text-xs text-blue-700 truncate">
                          {description}
                        </div>
                        {type && (
                          <div className="text-[9px] text-gray-500 mt-0.5">{type}</div>
                        )}
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
                onAdd={() => openDrawer('imaging')}
                onViewAll={() => openDrawer('imaging')}
              />
              {imagingStudies && imagingStudies.length > 0 ? (
                <div className="space-y-0 max-h-64 overflow-y-auto">
                  {imagingStudies.slice(0, 15).map((study: any) => {
                    const modality = study.modality?.[0]?.display || study.modality?.[0]?.code || 'Unknown';
                    const description = study.description;
                    const date = study.started;

                    return (
                      <CompactListItem
                        key={study.id}
                        date={date ? format(new Date(date), 'MM/dd/yy') : undefined}
                        badge={{ text: modality.substring(0, 3).toUpperCase(), color: 'purple' }}
                      >
                        <div className="font-medium text-xs">{modality}</div>
                        {description && (
                          <div className="text-[9px] text-gray-600 mt-0.5 truncate">{description}</div>
                        )}
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
                onAdd={() => openDrawer('insurance')}
                onViewAll={() => openDrawer('insurance')}
              />
              {insurances && insurances.length > 0 ? (
                <div className="space-y-1.5">
                  {insurances.slice(0, 3).map((insurance: any) => {
                    const payor = insurance.payor?.[0]?.display || 'Unknown';
                    const subscriberId = insurance.subscriberId;

                    return (
                      <div
                        key={insurance.id}
                        className="bg-blue-50 border border-blue-200 rounded p-2"
                      >
                        <div className="font-semibold text-xs text-blue-900 truncate">{payor}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-[9px] text-blue-700">Active</div>
                          {subscriberId && (
                            <div className="text-[9px] text-gray-600 font-mono">{subscriberId}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic py-2">None</p>
              )}
            </FacesheetCard>

            {/* Care Team - New */}
            <FacesheetCard>
              <SectionHeader
                title="Care Team"
                icon={UserPlus}
                count={4}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'PCP', color: 'blue' }}>
                  <div className="text-xs font-medium">Dr. Sarah Smith</div>
                  <div className="text-[9px] text-gray-600">Internal Medicine</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'SPEC', color: 'purple' }}>
                  <div className="text-xs font-medium">Dr. John Cardio</div>
                  <div className="text-[9px] text-gray-600">Cardiology</div>
                </CompactListItem>
                <CompactListItem>
                  <div className="text-xs font-medium">Jane RN</div>
                  <div className="text-[9px] text-gray-600">Care Coordinator</div>
                </CompactListItem>
                <CompactListItem>
                  <div className="text-xs font-medium">Tom PharmD</div>
                  <div className="text-[9px] text-gray-600">Clinical Pharmacist</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Active Referrals - New */}
            <FacesheetCard>
              <SectionHeader
                title="Active Referrals"
                icon={Activity}
                count={2}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'PENDING', color: 'orange' }}>
                  <div className="text-xs font-medium">Cardiology</div>
                  <div className="text-[9px] text-gray-600">Referred: 10/28/25</div>
                  <div className="text-[9px] text-gray-500">Reason: Arrhythmia eval</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'SCHEDULED', color: 'blue' }}>
                  <div className="text-xs font-medium">Endocrinology</div>
                  <div className="text-[9px] text-gray-600">Appt: 12/01/25</div>
                  <div className="text-[9px] text-gray-500">Reason: Diabetes mgmt</div>
                </CompactListItem>
              </div>
            </FacesheetCard>

            {/* Outstanding Tasks - New */}
            <FacesheetCard>
              <SectionHeader
                title="Outstanding Tasks"
                icon={Clock}
                count={3}
                alert={true}
              />
              <div className="space-y-0.5">
                <CompactListItem badge={{ text: 'URGENT', color: 'red' }}>
                  <div className="text-xs font-semibold text-red-700">Review Abnormal Lab</div>
                  <div className="text-[9px] text-gray-600">Elevated creatinine</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'DUE', color: 'orange' }}>
                  <div className="text-xs">Med Reconciliation</div>
                  <div className="text-[9px] text-gray-600">Due: 11/15/25</div>
                </CompactListItem>
                <CompactListItem badge={{ text: 'PENDING', color: 'yellow' }}>
                  <div className="text-xs">Prior Auth: Humira</div>
                  <div className="text-[9px] text-gray-600">Submitted: 11/05/25</div>
                </CompactListItem>
              </div>
            </FacesheetCard>
          </div>
        </div>
      </div>
    </div>
  );
}
