'use client';

import React from 'react';
import { 
  AlertCircle, 
  Pill, 
  FileText, 
  User, 
  CreditCard, 
  Shield,
  Calendar,
  Syringe,
  Bell,
  MessageSquare,
  FileCheck,
  Microscope,
  Activity,
  Zap
} from 'lucide-react';

interface DashboardTabProps {
  patient: any;
  allergies: any[];
  problems: any[];
  medications: any[];
  encounters: any[];
  observations: any[];
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  badge?: string | number;
  isEmpty?: boolean;
  onEdit?: () => void;
}

function SectionCard({ title, icon, children, badge, isEmpty, onEdit }: SectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="text-blue-600">{icon}</div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {badge !== undefined && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {badge}
            </span>
          )}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            Edit
          </button>
        )}
      </div>
      <div className="p-4">
        {isEmpty ? (
          <p className="text-sm text-gray-500 italic">Nothing Recorded</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

interface DataRowProps {
  label: string;
  value: string;
}

function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-600 min-w-[120px]">{label}</span>
      <span className="text-xs text-gray-900 text-right flex-1">{value}</span>
    </div>
  );
}

export function DashboardTab({
  patient,
  allergies,
  problems,
  medications,
  encounters,
  observations
}: DashboardTabProps) {
  
  // Get latest vitals
  const latestVitals = React.useMemo(() => {
    const vitalTypes = {
      'weight': '29463-7',
      'height': '8302-2',
      'bmi': '39156-5',
      'bp_systolic': '8480-6',
      'bp_diastolic': '8462-4',
      'heart_rate': '8867-4',
      'temperature': '8310-5',
      'respiratory_rate': '9279-1',
      'oxygen_saturation': '59408-5'
    };

    const vitals: Record<string, any> = {};
    
    Object.entries(vitalTypes).forEach(([key, loincCode]) => {
      const obs = observations.find(o => 
        o.code?.coding?.some((c: any) => c.code === loincCode)
      );
      if (obs) {
        vitals[key] = obs;
      }
    });

    return vitals;
  }, [observations]);

  // Get insurance info from patient resource
  const primaryInsurance = React.useMemo(() => {
    // This would typically come from Coverage resources
    // For now, using placeholder data structure
    return {
      insurer: 'Aetna',
      subscriber: patient.name,
      subscriberEmployer: 'SARL',
      planName: 'AssurPlus Silver',
      copay: 'Prise en charge par la mutuelle',
      policyNumber: 'FICT-POL-20082',
      groupNumber: 'GRP-2082',
      effectiveDate: '2018-01-01',
      effectiveDateEnd: '',
      acceptsAssignment: 'Yes'
    };
  }, [patient]);

  // Get billing info
  const billingInfo = React.useMemo(() => {
    return {
      patientBalanceDue: '0.00',
      insuranceBalanceDue: '0.00',
      totalBalanceDue: '0.00',
      billingNote: 'Prise en charge par la mutuelle',
      primaryInsurance: 'Aetna',
      effectiveDate: '2018-01-01',
      effectiveDateEnd: ''
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-[1600px] mx-auto">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Allergies */}
        <SectionCard
          title="Allergies"
          icon={<AlertCircle className="h-4 w-4" />}
          badge={allergies.length}
          isEmpty={allergies.length === 0}
        >
          <div className="space-y-2">
            {allergies.slice(0, 5).map((allergy: any, idx: number) => {
              const substanceName = allergy.code?.text || 
                allergy.code?.coding?.[0]?.display || 
                'Unknown Allergen';
              const reaction = allergy.reaction?.[0]?.manifestation?.[0]?.text || 
                allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display ||
                'Reaction not specified';
              const severity = allergy.reaction?.[0]?.severity || allergy.criticality || 'unknown';
              
              return (
                <div key={allergy.id || idx} className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-red-900">{substanceName}</div>
                    <div className="text-xs text-red-700">{reaction}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        severity === 'high' || severity === 'severe' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {severity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Medical Problems */}
        <SectionCard
          title="Medical Problems"
          icon={<AlertCircle className="h-4 w-4" />}
          badge={problems.length}
          isEmpty={problems.length === 0}
        >
          <div className="space-y-2">
            {problems.slice(0, 5).map((problem: any, idx: number) => {
              const problemText = problem.code?.text || 
                problem.code?.coding?.[0]?.display || 
                'Unspecified Condition';
              const status = problem.clinicalStatus?.coding?.[0]?.code || 'active';
              const onsetDate = problem.onsetDateTime 
                ? new Date(problem.onsetDateTime).toLocaleDateString()
                : 'Unknown onset';
              
              return (
                <div key={problem.id || idx} className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-100">
                  <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-orange-900">{problemText}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-orange-700">
                      <span className="capitalize">{status}</span>
                      <span>•</span>
                      <span>{onsetDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Prescriptions/Medications */}
        <SectionCard
          title="Prescriptions"
          icon={<FileText className="h-4 w-4" />}
          badge={medications.length}
          isEmpty={medications.length === 0}
        >
          <div className="space-y-2">
            {medications.slice(0, 5).map((med: any, idx: number) => {
              const medName = med.medicationCodeableConcept?.text ||
                med.medicationCodeableConcept?.coding?.[0]?.display ||
                'Unknown Medication';
              const dosage = med.dosageInstruction?.[0]?.text || 
                `${med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value || ''} ${med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || ''}`.trim() ||
                'Dosage not specified';
              const status = med.status || 'active';
              
              return (
                <div key={med.id || idx} className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <Pill className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-blue-900">{medName}</div>
                    <div className="text-xs text-blue-700">{dosage}</div>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Demographics */}
        <SectionCard
          title="Demographics"
          icon={<User className="h-4 w-4" />}
        >
          <div className="space-y-0.5">
            <DataRow label="Patient Balance Due" value={billingInfo.patientBalanceDue} />
            <DataRow label="Insurance Balance Due" value={billingInfo.insuranceBalanceDue} />
            <DataRow label="Total Balance Due" value={billingInfo.totalBalanceDue} />
            <DataRow label="Billing Note" value={billingInfo.billingNote} />
            <DataRow label="Primary Insurance" value={primaryInsurance.insurer} />
            <DataRow label="Effective Date" value={primaryInsurance.effectiveDate} />
            <DataRow label="Effective Date End" value={primaryInsurance.effectiveDateEnd || '—'} />
          </div>
        </SectionCard>

        {/* Billing */}
        <SectionCard
          title="Billing"
          icon={<CreditCard className="h-4 w-4" />}
        >
          <div className="space-y-0.5">
            <DataRow label="Patient Balance Due" value={billingInfo.patientBalanceDue} />
            <DataRow label="Insurance Balance Due" value={billingInfo.insuranceBalanceDue} />
            <DataRow label="Total Balance Due" value={billingInfo.totalBalanceDue} />
            <DataRow label="Billing Note" value={billingInfo.billingNote} />
            <DataRow label="Primary Insurance" value={primaryInsurance.insurer} />
            <DataRow label="Effective Date" value={primaryInsurance.effectiveDate} />
            <DataRow label="Effective Date End" value={primaryInsurance.effectiveDateEnd || '—'} />
          </div>
        </SectionCard>

        {/* Insurance */}
        <SectionCard
          title="Insurance"
          icon={<Shield className="h-4 w-4" />}
        >
          <div className="space-y-0.5">
            <DataRow label="Primary" value="Eligibility" />
            <DataRow label="Insurer" value={primaryInsurance.insurer} />
            <DataRow label="Subscriber" value={primaryInsurance.subscriber} />
            <DataRow label="Subscriber Employer" value={primaryInsurance.subscriberEmployer} />
            <div className="my-3 border-t border-gray-200" />
            <DataRow label="Plan Name" value={primaryInsurance.planName} />
            <DataRow label="Copay" value={primaryInsurance.copay} />
            <DataRow label="Policy Number" value={primaryInsurance.policyNumber} />
            <DataRow label="Group Number" value={primaryInsurance.groupNumber} />
            <DataRow label="S.S. FICT-EXT-8-82" value="" />
            <DataRow label="D.O.B. 2015-05-14" value="" />
          </div>
        </SectionCard>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Medications */}
        <SectionCard
          title="Medications"
          icon={<Pill className="h-4 w-4" />}
          badge={medications.length}
          isEmpty={medications.length === 0}
        >
          <div className="space-y-2">
            {medications.slice(0, 5).map((med: any, idx: number) => {
              const medName = med.medicationCodeableConcept?.text ||
                med.medicationCodeableConcept?.coding?.[0]?.display ||
                'Unknown Medication';
              const dosage = med.dosageInstruction?.[0]?.text || 
                `${med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value || ''} ${med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || ''}`.trim() ||
                'Dosage not specified';
              const frequency = med.dosageInstruction?.[0]?.timing?.repeat?.frequency 
                ? `${med.dosageInstruction[0].timing.repeat.frequency}x per ${med.dosageInstruction[0].timing.repeat.periodUnit || 'day'}`
                : '';
              
              return (
                <div key={med.id || idx} className="p-2 bg-purple-50 rounded border border-purple-100">
                  <div className="text-sm font-semibold text-purple-900">{medName}</div>
                  <div className="text-xs text-purple-700 mt-0.5">{dosage}</div>
                  {frequency && (
                    <div className="text-xs text-purple-600 mt-0.5">{frequency}</div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Patient Portal / API Access */}
        <SectionCard
          title="Patient Portal / API Access"
          icon={<Shield className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Portal Access</h4>
              <p className="text-xs text-yellow-800 mb-2">
                Allow Patient Portal in Demographic Employer
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Credentials</h4>
              <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                + Create
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Clinical Reminders */}
        <SectionCard
          title="Clinical Reminders"
          icon={<Bell className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-900">Measurement: Weight</span>
                <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Past Due</span>
              </div>
            </div>
            
            <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-900">Assessment: Colon Cancer Screening</span>
                <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Past Due</span>
              </div>
            </div>
            
            <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-900">Assessment: Prostate Cancer Screening</span>
                <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Past Due</span>
              </div>
            </div>
            
            <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-900">Treatment: Influenza Vaccine</span>
                <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Past Due</span>
              </div>
            </div>
            
            <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-900">Treatment: Pneumococcal Vaccine</span>
                <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Past Due</span>
              </div>
            </div>
            
            <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-900">Assessment: Tobacco</span>
                <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Past Due</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Recall */}
        <SectionCard
          title="Recall"
          icon={<Calendar className="h-4 w-4" />}
          isEmpty={true}
        />

        {/* Appointments */}
        <SectionCard
          title="Appointments"
          icon={<Calendar className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Future Appointments</span>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-green-900">New Patient</div>
                  <div className="text-xs text-green-700 mt-0.5">Sat, 2025-10-18 13:45</div>
                  <div className="text-xs text-green-600 mt-0.5">Donna Lee</div>
                </div>
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                  &lt; in exam room
                </span>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2 text-sm border-t pt-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Recurring Appointments</span>
            </div>
            <p className="text-sm text-gray-500 italic">No Recurring Appointments</p>
          </div>
        </SectionCard>

        {/* Immunizations */}
        <SectionCard
          title="Immunizations"
          icon={<Syringe className="h-4 w-4" />}
          isEmpty={true}
        >
          <p className="text-sm text-gray-500">None</p>
        </SectionCard>
      </div>
    </div>
  );
}
