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

  // Get latest vitals with trends
  const latestVitals = React.useMemo(() => {
    const vitalTypes = {
      'weight': { code: '29463-7', label: 'Weight', unit: 'kg', normalRange: '50-90' },
      'height': { code: '8302-2', label: 'Height', unit: 'cm', normalRange: '150-190' },
      'bmi': { code: '39156-5', label: 'BMI', unit: 'kg/m²', normalRange: '18.5-24.9' },
      'bp_systolic': { code: '8480-6', label: 'BP Systolic', unit: 'mmHg', normalRange: '90-120' },
      'bp_diastolic': { code: '8462-4', label: 'BP Diastolic', unit: 'mmHg', normalRange: '60-80' },
      'heart_rate': { code: '8867-4', label: 'Heart Rate', unit: 'bpm', normalRange: '60-100' },
      'temperature': { code: '8310-5', label: 'Temperature', unit: '°C', normalRange: '36.5-37.5' },
      'respiratory_rate': { code: '9279-1', label: 'Resp Rate', unit: '/min', normalRange: '12-20' },
      'oxygen_saturation': { code: '59408-5', label: 'SpO2', unit: '%', normalRange: '95-100' }
    };

    const vitals: Record<string, any> = {};

    Object.entries(vitalTypes).forEach(([key, config]) => {
      const allObs = observations
        .filter(o => o.code?.coding?.some((c: any) => c.code === config.code))
        .sort((a, b) => new Date(b.effectiveDateTime || 0).getTime() - new Date(a.effectiveDateTime || 0).getTime());

      if (allObs.length > 0) {
        vitals[key] = {
          latest: allObs[0],
          previous: allObs[1],
          config,
          history: allObs.slice(0, 5)
        };
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

  // Calculate trends
  const getTrend = (vital: any) => {
    if (!vital?.latest || !vital?.previous) return null;
    const latestValue = vital.latest.valueQuantity?.value;
    const previousValue = vital.previous.valueQuantity?.value;
    if (!latestValue || !previousValue) return null;

    const change = latestValue - previousValue;
    const percentChange = (change / previousValue) * 100;
    return { change, percentChange, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' };
  };

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto">
      {/* Compact Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Visits</p>
              <p className="text-2xl font-bold text-gray-900">{encounters.length}</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active Problems</p>
              <p className="text-2xl font-bold text-gray-900">
                {problems.filter((p: any) => p.clinicalStatus?.coding?.[0]?.code === 'active').length}
              </p>
            </div>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active Meds</p>
              <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
            </div>
            <Pill className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Care Alerts</p>
              <p className="text-2xl font-bold text-red-600">6</p>
            </div>
            <Bell className="h-5 w-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {/* Vital Signs - Compact Table */}
          <SectionCard
            title="Latest Vital Signs"
            icon={<Activity className="h-4 w-4" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Vital</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Value</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Normal Range</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Trend</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(latestVitals).slice(0, 6).map(([key, vital]: [string, any]) => {
                    const value = vital.latest.valueQuantity?.value;
                    const unit = vital.config.unit;
                    const trend = getTrend(vital);
                    const date = vital.latest.effectiveDateTime
                      ? new Date(vital.latest.effectiveDateTime).toLocaleDateString()
                      : '';

                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs font-medium text-gray-900">{vital.config.label}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-semibold">{value} {unit}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{vital.config.normalRange}</td>
                        <td className="px-3 py-2">
                          {trend && (
                            <span className={`text-xs ${
                              trend.direction === 'up' ? 'text-red-600' :
                              trend.direction === 'down' ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                              {Math.abs(trend.percentChange).toFixed(1)}%
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">{date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Recent Visit Summary */}
          <SectionCard
            title="Recent Visit Summary"
            icon={<FileText className="h-4 w-4" />}
          >
            {encounters.length > 0 ? (
              <div className="space-y-3">
                {encounters.slice(0, 3).map((encounter: any, idx: number) => {
                  const encounterDate = encounter.period?.start || encounter.startTime || '';
                  const dateStr = encounterDate ? new Date(encounterDate).toLocaleDateString() : 'Unknown date';
                  const encounterType = typeof encounter.class === 'object'
                    ? encounter.class?.display
                    : encounter.class || 'Visit';

                  return (
                    <div key={encounter.id || idx} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">{encounterType}</p>
                          <p className="text-xs text-blue-700 mt-1">{dateStr}</p>
                          <p className="text-xs text-gray-600 mt-2">
                            Chief Complaint: Routine checkup and medication review
                          </p>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          View →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No recent visits</p>
            )}
          </SectionCard>

          {/* Lab Results - Table */}
          <SectionCard
            title="Recent Lab Results"
            icon={<Microscope className="h-4 w-4" />}
          >
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Test</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Value</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Range</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs font-medium text-gray-900">HbA1c</td>
                  <td className="px-3 py-2 text-xs font-semibold text-gray-900">5.8%</td>
                  <td className="px-3 py-2 text-xs text-gray-600">&lt; 5.7%</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Normal</span></td>
                  <td className="px-3 py-2 text-xs text-gray-600">Oct 10, 2025</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs font-medium text-gray-900">Total Cholesterol</td>
                  <td className="px-3 py-2 text-xs font-semibold text-gray-900">180 mg/dL</td>
                  <td className="px-3 py-2 text-xs text-gray-600">&lt; 200 mg/dL</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Normal</span></td>
                  <td className="px-3 py-2 text-xs text-gray-600">Oct 10, 2025</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs font-medium text-gray-900">Vitamin D</td>
                  <td className="px-3 py-2 text-xs font-semibold text-gray-900">28 ng/mL</td>
                  <td className="px-3 py-2 text-xs text-gray-600">30-100 ng/mL</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Low</span></td>
                  <td className="px-3 py-2 text-xs text-gray-600">Oct 10, 2025</td>
                </tr>
              </tbody>
            </table>
          </SectionCard>

        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-3">
          {/* Quick Actions */}
          <SectionCard
            title="Quick Actions"
            icon={<Zap className="h-4 w-4" />}
          >
            <div className="space-y-1.5">
              <button className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors text-left">
                Order Labs
              </button>
              <button className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors text-left">
                Prescribe Medication
              </button>
              <button className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors text-left">
                Schedule Follow-up
              </button>
              <button className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors text-left">
                Send Message
              </button>
            </div>
          </SectionCard>

          {/* Care Gaps & Quality Measures */}
          <SectionCard
            title="Care Gaps"
            icon={<Bell className="h-4 w-4" />}
            badge={6}
          >
            <div className="space-y-2">
              <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-900">Colon Cancer Screening</span>
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Due</span>
                </div>
                <p className="text-xs text-red-700 mt-1">Last: Never | Due: Now</p>
              </div>

              <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-900">Influenza Vaccine</span>
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Due</span>
                </div>
                <p className="text-xs text-red-700 mt-1">Last: 2024 | Due: Oct 2025</p>
              </div>

              <div className="p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-yellow-900">Vitamin D Follow-up</span>
                  <span className="px-2 py-0.5 bg-yellow-600 text-white text-[10px] font-bold rounded">Soon</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">Recheck in 3 months</p>
              </div>
            </div>
          </SectionCard>

          {/* Upcoming Appointments */}
          <SectionCard
            title="Upcoming Visits"
            icon={<Calendar className="h-4 w-4" />}
          >
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-green-900">Follow-up Visit</div>
                    <div className="text-xs text-green-700 mt-0.5">Oct 25, 2025 at 2:00 PM</div>
                    <div className="text-xs text-green-600 mt-0.5">Dr. Sarah Johnson</div>
                  </div>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                    Confirmed
                  </span>
                </div>
              </div>

              <button className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                + Schedule New Appointment
              </button>
            </div>
          </SectionCard>

          {/* Recent Documents */}
          <SectionCard
            title="Recent Documents"
            icon={<FileText className="h-4 w-4" />}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">Lab Report - Lipid Panel</p>
                  <p className="text-xs text-gray-500">Oct 10, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">Consultation Note</p>
                  <p className="text-xs text-gray-500">Oct 8, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">Prescription - Atorvastatin</p>
                  <p className="text-xs text-gray-500">Oct 5, 2025</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
