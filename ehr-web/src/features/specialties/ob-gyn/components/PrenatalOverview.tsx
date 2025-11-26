'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart, Calendar, Activity, AlertCircle, Plus, Weight, Clock,
  Baby, FileText, Droplet, Ruler, Eye, Pill,
  TestTube, Syringe, User, Shield, Clipboard,
  Target, Zap, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useEpisodeContext } from '@/contexts/episode-context';
import { CreatePrenatalEpisodeDialog } from './CreatePrenatalEpisodeDialog';
import {
  calculateGestationalAge,
  calculateDaysToDelivery,
  calculateTrimester,
  calculatePregnancyProgress,
  formatGestationalAge,
  formatDate,
} from '../utils/pregnancy-calculators';

interface PrenatalOverviewProps {
  patientId: string;
}

/**
 * PRENATAL OVERVIEW - ULTRA COMPACT & DETAILED
 * ============================================
 * Maximum information density dashboard showing:
 * - Pregnancy progression & timeline
 * - Risk assessment & alerts
 * - Recent vitals & trends
 * - Upcoming milestones & appointments
 * - Lab results & screenings
 * - Maternal & fetal status
 */
export function PrenatalOverview({ patientId }: PrenatalOverviewProps) {
  const { getEpisodeBySpecialty } = useEpisodeContext();
  const episode = getEpisodeBySpecialty('ob-gyn');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Extract metadata before useMemo to avoid conditional hook calls
  const metadata = (episode?.metadata || {}) as Record<string, any>;

  // Calculate pregnancy metrics - MUST be called before any returns
  const pregnancyMetrics = useMemo(() => {
    if (!metadata?.lmp) return null;
    const lmpDate = new Date(metadata.lmp);
    const eddDate = metadata.edd ? new Date(metadata.edd) : null;
    const ga = calculateGestationalAge(lmpDate);
    const trimester = calculateTrimester(ga.weeks);
    const daysToDelivery = eddDate ? calculateDaysToDelivery(eddDate) : null;
    const progress = calculatePregnancyProgress(ga.weeks);
    return { gestationalAge: ga, trimester, daysToDelivery, progress, lmpDate, eddDate };
  }, [metadata?.lmp, metadata?.edd]);

  // Mock data - in production, fetch from API
  const mockData = {
    // Recent vitals (last visit)
    lastVisit: {
      date: '2025-03-19',
      ga: '27w 0d',
      weight: 76.5,
      weightUnit: 'kg' as const,
      bp: { systolic: 132, diastolic: 84 },
      pulse: 88,
      fhr: 150,
      fm: 'Present' as const,
      fundalHeight: 26,
      presentation: 'Vertex' as const,
      urineProtein: 'Trace' as const,
      edema: '+1 bilateral' as const,
    },
    // Lab results
    labs: {
      hemoglobin: { value: 11.6, date: '2025-03-19', normal: false },
      glucose: { value: 156, date: '2025-03-19', normal: false, type: 'Fasting' as const },
      bloodType: 'A+',
      rhFactor: 'Positive',
      rubella: 'Immune',
      hbsag: 'Negative',
      hiv: 'Negative',
      syphilis: 'Negative',
      gbs: { status: 'Pending', dueDate: '2025-04-15' },
    },
    // Ultrasounds
    ultrasounds: [
      { type: 'Dating', date: '2024-12-15', ga: '12w 2d', result: 'Normal' },
      { type: 'Anatomy', date: '2025-02-20', ga: '20w 0d', result: 'Normal' },
      { type: 'Growth', date: null, ga: null, result: 'Scheduled 2025-04-10' },
    ],
    // Appointments
    nextAppointment: { date: '2025-03-26', type: 'Follow-up', provider: 'Dr. Johnson' },
    // Immunizations
    immunizations: {
      tdap: { status: 'Given', date: '2025-02-15' },
      flu: { status: 'Given', date: '2024-12-01' },
      covid: { status: 'Up to date', date: '2024-11-15' },
    },
    // Medications
    medications: [
      { name: 'Prenatal Vitamin', dose: '1 tab daily', status: 'Active' },
      { name: 'Iron Supplement', dose: '325mg daily', status: 'Active' },
      { name: 'Metformin', dose: '500mg BID', status: 'Active' },
    ],
    // Alerts & Tasks
    alerts: [
      { severity: 'critical' as const, message: 'Elevated BP - recheck in 3 days', category: 'Vitals' },
      { severity: 'warning' as const, message: 'GDM confirmed - start diet & monitoring', category: 'Labs' },
      { severity: 'info' as const, message: 'GBS screening due in 2 weeks', category: 'Screening' },
    ],
    // Pregnancy history
    history: {
      previousCesarean: true,
      previousPreterm: false,
      previousLoss: 1,
      livingChildren: 1,
    },
  };

  // NOW safe to have conditional returns after all hooks are called
  // No episode state - compact empty state
  if (!episode) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <Heart className="h-16 w-16 mx-auto mb-3 text-pink-300" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Prenatal Episode</h3>
          <p className="text-sm text-gray-600 mb-4">Start tracking pregnancy care and monitoring</p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded hover:bg-pink-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Start Prenatal Episode
          </button>
        </div>
        <CreatePrenatalEpisodeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          patientId={patientId}
          onSuccess={() => setShowCreateDialog(false)}
        />
      </div>
    );
  }

  if (!pregnancyMetrics) {
    return (
      <div className="p-4 flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-orange-400" />
          <p className="text-sm text-gray-600">Incomplete episode data. LMP required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-3">
      <div className="max-w-[1600px] mx-auto space-y-3">
        {/* COMPACT HEADER ROW */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-gray-700" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Prenatal Overview</h1>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Episode: {episode.id.slice(0, 8)}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold">{episode.status}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatGestationalAge(pregnancyMetrics.gestationalAge.weeks, pregnancyMetrics.gestationalAge.days)}
              </div>
              <div className="text-xs text-gray-600">{pregnancyMetrics.trimester.label}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-500"
                style={{ width: `${pregnancyMetrics.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>0 weeks</span>
              <span className="font-semibold">{pregnancyMetrics.progress}%</span>
              <span>40 weeks • {pregnancyMetrics.daysToDelivery} days to EDD</span>
            </div>
          </div>
        </div>

        {/* ACTIVE ALERTS BANNER - COMPACT */}
        {mockData.alerts.length > 0 && (
          <div className="bg-white border-l-4 border-red-500 rounded shadow-sm p-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-red-900 mb-1">
                  {mockData.alerts.filter(a => a.severity === 'critical').length} Critical • {mockData.alerts.filter(a => a.severity === 'warning').length} Warning
                </div>
                <div className="space-y-0.5">
                  {mockData.alerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px]">
                      <span className={`mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'warning' ? 'text-orange-600' : 'text-blue-600'
                      }`}>●</span>
                      <span className="text-gray-700">
                        <span className="font-semibold">[{alert.category}]</span> {alert.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN GRID - 3 COLUMNS */}
        <div className="grid grid-cols-3 gap-3">
          {/* LEFT COLUMN - Key Metrics & Vitals */}
          <div className="space-y-3">
            {/* Key Dates Card */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Key Dates
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">EDD:</span>
                  <span className="font-bold text-pink-700">{pregnancyMetrics.eddDate ? formatDate(pregnancyMetrics.eddDate) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LMP:</span>
                  <span className="font-semibold text-gray-900">{formatDate(pregnancyMetrics.lmpDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Visit:</span>
                  <span className="font-semibold text-blue-700">{formatDate(new Date(mockData.nextAppointment.date))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days to EDD:</span>
                  <span className="font-bold text-gray-900">{pregnancyMetrics.daysToDelivery}</span>
                </div>
              </div>
            </div>

            {/* Obstetric History */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Clipboard className="h-3 w-3" /> OB History
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                <div>
                  <span className="text-gray-600">Gravida:</span>
                  <span className="ml-1 font-bold text-gray-900">{metadata.gravida || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Para:</span>
                  <span className="ml-1 font-bold text-gray-900">{metadata.para || 0}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1 mt-1">
                  {mockData.history.previousCesarean && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-semibold">Prev C/S</span>
                  )}
                  {mockData.history.previousLoss > 0 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[9px]">Loss: {mockData.history.previousLoss}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Maternal Demographics */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <User className="h-3 w-3" /> Demographics
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold text-gray-900">{metadata.maternalAge || 'N/A'} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-semibold text-gray-900">
                    {metadata.bmi ? `${metadata.bmi.toFixed(1)} (${metadata.bmiCategory})` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pre-Preg Wt:</span>
                  <span className="font-semibold text-gray-900">{metadata.prePregnancyWeight || 'N/A'} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-semibold text-gray-900">{metadata.height || 'N/A'} cm</span>
                </div>
              </div>
            </div>

            {/* Latest Vitals - ULTRA COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Latest Vitals <span className="text-gray-500 font-normal">({mockData.lastVisit.date})</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Weight className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">Wt:</span>
                  <span className="font-bold text-gray-900">{mockData.lastVisit.weight} kg</span>
                </div>
                <div className={`flex items-center gap-1 ${mockData.lastVisit.bp.systolic >= 130 ? 'bg-orange-50 px-1 rounded' : ''}`}>
                  <Activity className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">BP:</span>
                  <span className={`font-bold ${mockData.lastVisit.bp.systolic >= 130 ? 'text-orange-700' : 'text-gray-900'}`}>
                    {mockData.lastVisit.bp.systolic}/{mockData.lastVisit.bp.diastolic}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">Pulse:</span>
                  <span className="font-bold text-gray-900">{mockData.lastVisit.pulse}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-pink-500" />
                  <span className="text-gray-600">FHR:</span>
                  <span className="font-bold text-gray-900">{mockData.lastVisit.fhr}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">FH:</span>
                  <span className="font-bold text-gray-900">{mockData.lastVisit.fundalHeight} cm</span>
                </div>
                <div className="flex items-center gap-1">
                  <Baby className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">Pres:</span>
                  <span className="font-bold text-gray-900">{mockData.lastVisit.presentation}</span>
                </div>
                <div className={`flex items-center gap-1 col-span-2 ${mockData.lastVisit.urineProtein === 'Trace' ? 'bg-orange-50 px-1 rounded' : ''}`}>
                  <Droplet className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">Urine Protein:</span>
                  <span className={`font-bold ${mockData.lastVisit.urineProtein === 'Trace' ? 'text-orange-700' : 'text-gray-900'}`}>
                    {mockData.lastVisit.urineProtein}
                  </span>
                </div>
                <div className={`flex items-center gap-1 col-span-2 ${mockData.lastVisit.edema === '+1 bilateral' ? 'bg-orange-50 px-1 rounded' : ''}`}>
                  <Activity className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">Edema:</span>
                  <span className={`font-bold ${mockData.lastVisit.edema === '+1 bilateral' ? 'text-orange-700' : 'text-gray-900'}`}>
                    {mockData.lastVisit.edema}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - Labs, Screenings, Ultrasounds */}
          <div className="space-y-3">
            {/* Risk Assessment - COMPACT */}
            {metadata.isHighRisk && (
              <div className={`rounded shadow-sm p-2 border-2 ${
                metadata.riskLevel === 'high' ? 'bg-red-50 border-red-400' :
                metadata.riskLevel === 'moderate' ? 'bg-orange-50 border-orange-400' :
                'bg-yellow-50 border-yellow-400'
              }`}>
                <div className={`text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1 ${
                  metadata.riskLevel === 'high' ? 'text-red-800' :
                  metadata.riskLevel === 'moderate' ? 'text-orange-800' : 'text-yellow-800'
                }`}>
                  <Shield className="h-3 w-3" /> {metadata.riskLevel} Risk Pregnancy
                </div>
                <div className="space-y-0.5">
                  {metadata.riskFactors?.map((factor: string, i: number) => (
                    <div key={i} className={`text-[9px] flex items-start gap-1 ${
                      metadata.riskLevel === 'high' ? 'text-red-700' :
                      metadata.riskLevel === 'moderate' ? 'text-orange-700' : 'text-yellow-700'
                    }`}>
                      <span>•</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Results - COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <TestTube className="h-3 w-3" /> Lab Results
              </div>
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                  <div className={`${!mockData.labs.hemoglobin.normal ? 'bg-orange-50 px-1 rounded' : ''}`}>
                    <span className="text-gray-600">Hgb:</span>
                    <span className={`ml-1 font-bold ${!mockData.labs.hemoglobin.normal ? 'text-orange-700' : 'text-gray-900'}`}>
                      {mockData.labs.hemoglobin.value} g/dL
                    </span>
                    {!mockData.labs.hemoglobin.normal && <span className="ml-1 text-orange-600">↓</span>}
                  </div>
                  <div className={`${!mockData.labs.glucose.normal ? 'bg-orange-50 px-1 rounded' : ''}`}>
                    <span className="text-gray-600">Glucose:</span>
                    <span className={`ml-1 font-bold ${!mockData.labs.glucose.normal ? 'text-orange-700' : 'text-gray-900'}`}>
                      {mockData.labs.glucose.value}
                    </span>
                    {!mockData.labs.glucose.normal && <span className="ml-1 text-orange-600">↑</span>}
                  </div>
                  <div>
                    <span className="text-gray-600">Blood Type:</span>
                    <span className="ml-1 font-bold text-gray-900">{mockData.labs.bloodType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rh:</span>
                    <span className="ml-1 font-bold text-gray-900">{mockData.labs.rhFactor}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-1.5 space-y-0.5">
                  <div className="text-[9px] text-gray-600 font-semibold mb-0.5">Infectious Disease Screening</div>
                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      <span className="text-gray-600">Rubella: {mockData.labs.rubella}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      <span className="text-gray-600">HBsAg: {mockData.labs.hbsag}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      <span className="text-gray-600">HIV: {mockData.labs.hiv}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      <span className="text-gray-600">Syphilis: {mockData.labs.syphilis}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <Clock className="h-2.5 w-2.5 text-blue-600" />
                      <span className="text-gray-600">GBS: {mockData.labs.gbs.status} (Due {mockData.labs.gbs.dueDate})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ultrasounds - COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Ultrasounds
              </div>
              <div className="space-y-1">
                {mockData.ultrasounds.map((us, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] py-0.5">
                    <div className="flex items-center gap-1.5">
                      {us.date ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-blue-600" />
                      )}
                      <span className="font-semibold text-gray-900">{us.type}</span>
                    </div>
                    <div className="text-gray-600 text-[9px]">
                      {us.date ? `${us.date} (${us.ga})` : us.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immunizations - COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Syringe className="h-3 w-3" /> Immunizations
              </div>
              <div className="space-y-1">
                {Object.entries(mockData.immunizations).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="font-semibold text-gray-900 uppercase">{key}</span>
                    </div>
                    <span className="text-gray-600 text-[9px]">{value.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications - COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Pill className="h-3 w-3" /> Medications
              </div>
              <div className="space-y-1">
                {mockData.medications.map((med, i) => (
                  <div key={i} className="text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{med.name}</span>
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[8px] font-semibold">
                        {med.status}
                      </span>
                    </div>
                    <div className="text-gray-600 text-[9px]">{med.dose}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Appointments, Milestones, Quick Actions */}
          <div className="space-y-3">
            {/* Next Appointment - COMPACT */}
            <div className="bg-white border-2 border-gray-900 rounded shadow-sm p-2">
              <div className="text-[10px] font-bold uppercase mb-2 flex items-center gap-1 text-gray-700">
                <Calendar className="h-3 w-3" /> Next Appointment
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-gray-900">{formatDate(new Date(mockData.nextAppointment.date))}</div>
                <div className="text-[10px] text-gray-600">{mockData.nextAppointment.type} • {mockData.nextAppointment.provider}</div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                  <button className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded hover:bg-gray-200">
                    Reschedule
                  </button>
                  <button className="flex-1 px-2 py-1 bg-gray-900 text-white text-[10px] font-semibold rounded hover:bg-gray-800">
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Milestones - COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Upcoming Milestones
              </div>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 text-[10px]">
                  <Clock className="h-3 w-3 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">28 Weeks (1 week)</div>
                    <div className="text-gray-600 text-[9px]">3rd Trimester begins • Weekly visits start</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[10px]">
                  <Clock className="h-3 w-3 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">35-37 Weeks (8-10 weeks)</div>
                    <div className="text-gray-600 text-[9px]">GBS screening</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[10px]">
                  <Clock className="h-3 w-3 text-pink-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">39-40 Weeks (12-13 weeks)</div>
                    <div className="text-gray-600 text-[9px]">Term delivery window</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pregnancy Timeline - ULTRA COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Trimester Timeline
              </div>
              <div className="space-y-2">
                {/* 1st Trimester */}
                <div>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="text-gray-600">1st Trimester (0-13w)</span>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full" />
                  </div>
                </div>
                {/* 2nd Trimester */}
                <div>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="text-gray-600">2nd Trimester (14-27w)</span>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full" />
                  </div>
                </div>
                {/* 3rd Trimester */}
                <div>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="text-gray-600">3rd Trimester (28-40w)</span>
                    <span className="font-semibold text-blue-700">Current</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[8%]" />
                  </div>
                  <div className="text-[8px] text-gray-500 mt-0.5">1/13 weeks complete</div>
                </div>
              </div>
            </div>

            {/* Quick Actions - COMPACT GRID */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 text-left">
                  <FileText className="h-3 w-3 mb-0.5" />
                  Record Visit
                </button>
                <button className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 text-left">
                  <Eye className="h-3 w-3 mb-0.5" />
                  Add Ultrasound
                </button>
                <button className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 text-left">
                  <TestTube className="h-3 w-3 mb-0.5" />
                  Order Labs
                </button>
                <button className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 text-left">
                  <Activity className="h-3 w-3 mb-0.5" />
                  View Flowsheet
                </button>
                <button className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 text-left">
                  <Calendar className="h-3 w-3 mb-0.5" />
                  Schedule
                </button>
                <button className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-[10px] font-semibold text-gray-700 text-left">
                  <Pill className="h-3 w-3 mb-0.5" />
                  Prescribe
                </button>
              </div>
            </div>

            {/* Visit Summary Stats - COMPACT */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-700 uppercase mb-2">Visit Statistics</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-900">12</div>
                  <div className="text-[8px] text-gray-600">Total Visits</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">3</div>
                  <div className="text-[8px] text-gray-600">Ultrasounds</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">8</div>
                  <div className="text-[8px] text-gray-600">Lab Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
