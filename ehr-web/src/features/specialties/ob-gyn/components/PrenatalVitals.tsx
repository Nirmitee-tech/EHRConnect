'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart, Activity, TrendingUp, AlertTriangle, Calendar, Plus,
  Thermometer, Droplet, Baby, Scale, Ruler, Eye, Filter,
  Info, Save, X, CheckCircle, XCircle, Download
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * PRENATAL VITALS COMPONENT
 * ==========================
 *
 * Tracks maternal and fetal physiological measurements across prenatal visits.
 *
 * KEY FEATURES:
 * - Quick vital signs entry with real-time validation
 * - Automatic clinical rule checking (BP thresholds, FHR range, etc.)
 * - Trend visualization across gestational weeks
 * - Color-coded alerts for abnormal values
 * - FHIR Observation resource compatible
 */

// Types
interface VitalReading {
  id: string;
  date: string;
  ga: string; // Gestational Age
  gaWeeks: number;
  encounterId?: string;

  // Maternal Vitals
  maternal: {
    weight?: number; // kg or lbs
    weightUnit?: 'kg' | 'lbs';
    bpSystolic?: number;
    bpDiastolic?: number;
    pulse?: number; // bpm
    temperature?: number; // °C
    temperatureUnit?: 'C' | 'F';
    respiratoryRate?: number; // breaths/min
  };

  // Urine Parameters
  urine: {
    protein?: 'Negative' | 'Trace' | '+1' | '+2' | '+3' | '+4';
    sugar?: 'Negative' | 'Trace' | '+1' | '+2' | '+3';
    ketone?: 'Negative' | 'Trace' | '+1' | '+2';
  };

  // Physical Exam
  physical: {
    edema?: 'Absent' | 'Trace pedal' | '+1 bilateral' | '+2 bilateral' | '+3 generalized';
    fundalHeight?: number; // cm
    abdominalGirth?: number; // cm
  };

  // Fetal Vitals
  fetal: {
    presentation?: 'Vertex' | 'Breech' | 'Transverse' | 'Oblique';
    fetalMovement?: 'Present' | 'Decreased' | 'Absent';
    fhr?: number; // bpm
    contractions?: 'Absent' | 'Present - Regular' | 'Present - Irregular';
  };

  // Cervical Exam
  cervical?: {
    dilation?: number; // cm
    effacement?: number; // %
    station?: number; // -3 to +3
    consistency?: 'Firm' | 'Medium' | 'Soft';
  };

  // Labs (if done)
  labs?: {
    hemoglobin?: number; // g/dL
    glucose?: number; // mg/dL
    glucoseType?: 'Fasting' | 'Random' | '1-hour OGTT' | '2-hour OGTT';
  };

  notes?: string;
  recordedBy?: string;
}

interface Alert {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  recommendation?: string;
}

interface PrenatalVitalsProps {
  patientId: string;
  pregnancyEpisodeId?: string;
}

export function PrenatalVitals({ patientId }: PrenatalVitalsProps) {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'maternal' | 'fetal' | 'urine' | 'labs'>('all');

  // Mock data - in production, fetch from FHIR Observation resources
  const [readings, setReadings] = useState<VitalReading[]>([
    {
      id: '1',
      date: '2025-01-15',
      ga: '18w 3d',
      gaWeeks: 18.4,
      maternal: {
        weight: 72, // kg
        weightUnit: 'kg',
        bpSystolic: 118,
        bpDiastolic: 72,
        pulse: 78,
        temperature: 36.8,
        temperatureUnit: 'C',
      },
      urine: {
        protein: 'Negative',
        sugar: 'Negative',
        ketone: 'Negative',
      },
      physical: {
        edema: 'Absent',
        fundalHeight: 18,
      },
      fetal: {
        presentation: 'Vertex',
        fetalMovement: 'Present',
        fhr: 142,
        contractions: 'Absent',
      },
      labs: {
        hemoglobin: 12.1,
        glucose: 92,
        glucoseType: 'Fasting',
      },
      recordedBy: 'Dr. Smith',
    },
    {
      id: '2',
      date: '2025-02-12',
      ga: '22w 1d',
      gaWeeks: 22.1,
      maternal: {
        weight: 73.5,
        weightUnit: 'kg',
        bpSystolic: 120,
        bpDiastolic: 70,
        pulse: 82,
        temperature: 36.7,
        temperatureUnit: 'C',
      },
      urine: {
        protein: 'Negative',
        sugar: 'Negative',
        ketone: 'Negative',
      },
      physical: {
        edema: 'Absent',
        fundalHeight: 20,
      },
      fetal: {
        presentation: 'Vertex',
        fetalMovement: 'Present',
        fhr: 148,
        contractions: 'Absent',
      },
      labs: {
        glucose: 88,
        glucoseType: 'Fasting',
      },
      recordedBy: 'Dr. Smith',
    },
    {
      id: '3',
      date: '2025-03-05',
      ga: '25w 0d',
      gaWeeks: 25.0,
      maternal: {
        weight: 75,
        weightUnit: 'kg',
        bpSystolic: 124,
        bpDiastolic: 78,
        pulse: 84,
        temperature: 36.9,
        temperatureUnit: 'C',
      },
      urine: {
        protein: 'Trace',
        sugar: 'Negative',
        ketone: 'Negative',
      },
      physical: {
        edema: 'Trace pedal',
        fundalHeight: 24,
      },
      fetal: {
        presentation: 'Vertex',
        fetalMovement: 'Present',
        fhr: 152,
        contractions: 'Absent',
      },
      labs: {
        hemoglobin: 11.8,
        glucose: 145,
        glucoseType: '1-hour OGTT',
      },
      recordedBy: 'Dr. Smith',
    },
    {
      id: '4',
      date: '2025-03-19',
      ga: '27w 0d',
      gaWeeks: 27.0,
      maternal: {
        weight: 76.5,
        weightUnit: 'kg',
        bpSystolic: 132,
        bpDiastolic: 84,
        pulse: 88,
        temperature: 36.8,
        temperatureUnit: 'C',
      },
      urine: {
        protein: 'Trace',
        sugar: 'Negative',
        ketone: 'Negative',
      },
      physical: {
        edema: '+1 bilateral',
        fundalHeight: 26,
      },
      fetal: {
        presentation: 'Vertex',
        fetalMovement: 'Present',
        fhr: 150,
        contractions: 'Absent',
      },
      labs: {
        hemoglobin: 11.6,
        glucose: 156,
        glucoseType: 'Fasting',
      },
      cervical: {
        dilation: 0,
        effacement: 0,
        station: -3,
        consistency: 'Firm',
      },
      recordedBy: 'Dr. Johnson',
    },
  ]);

  // Clinical Rules Engine
  const checkVitals = (reading: VitalReading): Alert[] => {
    const alerts: Alert[] = [];

    // BP Rules
    if (reading.maternal.bpSystolic && reading.maternal.bpDiastolic) {
      const sys = reading.maternal.bpSystolic;
      const dia = reading.maternal.bpDiastolic;

      if (sys >= 160 || dia >= 110) {
        alerts.push({
          severity: 'critical',
          category: 'Blood Pressure',
          message: `Severe hypertension: ${sys}/${dia} mmHg`,
          recommendation: 'Immediate evaluation required. Check for preeclampsia.',
        });
      } else if (sys >= 140 || dia >= 90) {
        alerts.push({
          severity: 'critical',
          category: 'Blood Pressure',
          message: `Hypertension: ${sys}/${dia} mmHg`,
          recommendation: 'Recheck BP, order urine protein, LFT/RFT if sustained.',
        });
      } else if (sys >= 130 || dia >= 85) {
        alerts.push({
          severity: 'warning',
          category: 'Blood Pressure',
          message: `Elevated BP: ${sys}/${dia} mmHg`,
          recommendation: 'Monitor closely, recheck in 15 minutes.',
        });
      }
    }

    // Proteinuria + HTN = Preeclampsia Risk
    if (reading.urine.protein && reading.urine.protein !== 'Negative' &&
        reading.maternal.bpSystolic && reading.maternal.bpSystolic >= 140) {
      alerts.push({
        severity: 'critical',
        category: 'Preeclampsia Risk',
        message: `Proteinuria (${reading.urine.protein}) + Hypertension detected`,
        recommendation: 'Evaluate for preeclampsia: order 24-hr urine, LFT, RFT, platelets.',
      });
    }

    // FHR Rules
    if (reading.fetal.fhr) {
      const fhr = reading.fetal.fhr;
      if (fhr < 110) {
        alerts.push({
          severity: 'critical',
          category: 'Fetal Heart Rate',
          message: `Fetal bradycardia: ${fhr} bpm`,
          recommendation: 'Immediate evaluation - consider NST or ultrasound.',
        });
      } else if (fhr > 160) {
        alerts.push({
          severity: 'critical',
          category: 'Fetal Heart Rate',
          message: `Fetal tachycardia: ${fhr} bpm`,
          recommendation: 'Rule out maternal fever, fetal distress, or infection.',
        });
      }
    }

    // Fundal Height vs GA
    if (reading.physical.fundalHeight && reading.gaWeeks) {
      const fh = reading.physical.fundalHeight;
      const ga = Math.floor(reading.gaWeeks);
      const diff = Math.abs(fh - ga);

      if (diff > 3) {
        alerts.push({
          severity: 'warning',
          category: 'Fundal Height',
          message: fh < ga
            ? `Fundal height ${fh} cm < GA ${ga} weeks (possible IUGR)`
            : `Fundal height ${fh} cm > GA ${ga} weeks (possible polyhydramnios/twins)`,
          recommendation: 'Consider growth ultrasound.',
        });
      }
    }

    // Glucose Rules
    if (reading.labs?.glucose) {
      const glucose = reading.labs.glucose;
      const type = reading.labs.glucoseType;

      if (type === 'Fasting' && glucose >= 95) {
        alerts.push({
          severity: 'warning',
          category: 'Glucose',
          message: `Elevated fasting glucose: ${glucose} mg/dL`,
          recommendation: 'Evaluate for gestational diabetes - order 3-hour OGTT.',
        });
      } else if (type === '1-hour OGTT' && glucose >= 140) {
        alerts.push({
          severity: 'warning',
          category: 'Glucose',
          message: `1-hour OGTT elevated: ${glucose} mg/dL`,
          recommendation: 'Screen positive for GDM - order 3-hour OGTT.',
        });
      }
    }

    // Hemoglobin Rules
    if (reading.labs?.hemoglobin && reading.labs.hemoglobin < 10) {
      alerts.push({
        severity: 'warning',
        category: 'Hemoglobin',
        message: `Anemia: Hb ${reading.labs.hemoglobin} g/dL`,
        recommendation: 'Start iron supplementation, recheck in 4 weeks.',
      });
    }

    // Fetal Movement
    if (reading.fetal.fetalMovement === 'Absent' || reading.fetal.fetalMovement === 'Decreased') {
      alerts.push({
        severity: 'critical',
        category: 'Fetal Movement',
        message: `${reading.fetal.fetalMovement} fetal movement`,
        recommendation: 'Urgent: Order NST or biophysical profile.',
      });
    }

    // Weight Gain Rate (if previous reading exists)
    const prevReading = readings.find(r =>
      parseISO(r.date) < parseISO(reading.date) &&
      r.maternal.weight && reading.maternal.weight
    );

    if (prevReading && prevReading.maternal.weight && reading.maternal.weight) {
      const weightChange = reading.maternal.weight - prevReading.maternal.weight;
      const weeksDiff = reading.gaWeeks - prevReading.gaWeeks;
      const ratePerWeek = weightChange / weeksDiff;

      if (reading.gaWeeks > 13 && ratePerWeek > 1) { // >1 kg/week is concerning
        alerts.push({
          severity: 'warning',
          category: 'Weight Gain',
          message: `Rapid weight gain: ${weightChange.toFixed(1)} kg in ${weeksDiff.toFixed(1)} weeks`,
          recommendation: 'Evaluate for fluid retention, preeclampsia.',
        });
      }
    }

    return alerts;
  };

  // Get all alerts for latest reading
  const latestReading = readings[readings.length - 1];
  const currentAlerts = latestReading ? checkVitals(latestReading) : [];

  // Calculate trends
  const trends = useMemo(() => {
    if (readings.length < 2) return null;

    const recent = readings.slice(-3);
    const bps = recent.map(r => r.maternal.bpSystolic).filter(Boolean) as number[];
    const weights = recent.map(r => r.maternal.weight).filter(Boolean) as number[];
    const fhrs = recent.map(r => r.fetal.fhr).filter(Boolean) as number[];
    const fhs = recent.map(r => r.physical.fundalHeight).filter(Boolean) as number[];

    return {
      bpTrend: bps.length >= 2 ? bps[bps.length - 1] - bps[0] : 0,
      weightTrend: weights.length >= 2 ? weights[weights.length - 1] - weights[0] : 0,
      fhrTrend: fhrs.length >= 2 ? fhrs[fhrs.length - 1] - fhrs[0] : 0,
      fhTrend: fhs.length >= 2 ? fhs[fhs.length - 1] - fhs[0] : 0,
    };
  }, [readings]);

  // Filter readings by category
  const filteredReadings = useMemo(() => {
    if (selectedCategory === 'all') return readings;
    // In a real app, you'd filter based on which vitals have data
    return readings;
  }, [readings, selectedCategory]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-300 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-pink-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Prenatal Vitals</h1>
                <p className="text-xs text-gray-600">
                  Maternal & Fetal Physiological Measurements
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
              <button
                onClick={() => setShowEntryForm(true)}
                className="px-3 py-1.5 text-xs font-medium bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Record Vitals
              </button>
              <button className="p-1.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {showFilters && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs font-semibold text-gray-700">View:</span>
              {(['all', 'maternal', 'fetal', 'urine', 'labs'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    selectedCategory === cat
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Alerts */}
        {currentAlerts.length > 0 && (
          <div className="border-t border-gray-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-bold text-red-900 mb-1">
                  {currentAlerts.filter(a => a.severity === 'critical').length} Critical Alert(s) •{' '}
                  {currentAlerts.filter(a => a.severity === 'warning').length} Warning(s)
                </div>
                <div className="space-y-1">
                  {currentAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded ${
                        alert.severity === 'critical'
                          ? 'bg-red-100 border border-red-300'
                          : 'bg-yellow-100 border border-yellow-300'
                      }`}
                    >
                      <div className={`font-bold ${
                        alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                      }`}>
                        {alert.category}: {alert.message}
                      </div>
                      {alert.recommendation && (
                        <div className="text-gray-700 mt-0.5">
                          → {alert.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Trend Cards - Compact */}
        {trends && (
          <div className="grid grid-cols-4 gap-3 mb-3">
            {/* BP Trend */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">BP</span>
                </div>
                {Math.abs(trends.bpTrend) < 5 ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {trends.bpTrend > 0 ? '+' : ''}{trends.bpTrend}
              </div>
              <div className="text-[8px] text-gray-500">mmHg (3 visits)</div>
            </div>

            {/* Weight Trend */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Scale className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">Weight</span>
                </div>
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {trends.weightTrend > 0 ? '+' : ''}{trends.weightTrend.toFixed(1)}
              </div>
              <div className="text-[8px] text-gray-500">kg (3 visits)</div>
            </div>

            {/* FHR Trend */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">FHR</span>
                </div>
                {Math.abs(trends.fhrTrend) < 20 ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-orange-600" />
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {trends.fhrTrend > 0 ? '+' : ''}{trends.fhrTrend}
              </div>
              <div className="text-[8px] text-gray-500">bpm (3 visits)</div>
            </div>

            {/* Fundal Height Trend */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">FH</span>
                </div>
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                +{trends.fhTrend}
              </div>
              <div className="text-[8px] text-gray-500">cm (3 visits)</div>
            </div>
          </div>
        )}

        {/* Vitals Table */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead className="bg-gradient-to-b from-gray-100 to-gray-50">
                <tr className="border-b-2 border-gray-300">
                  <th className="sticky left-0 z-10 bg-gray-100 text-left p-2 font-bold text-gray-700 border-r border-gray-200">Date / GA</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Weight</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">BP</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Pulse</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Temp</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Urine<br/>P/S/K</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Edema</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">FH</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">FHR</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">FM</th>
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Presentation</th>
                  <th className="text-center p-2 font-bold text-gray-700">Hb / Gluc</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadings.map((reading) => {
                  const alerts = checkVitals(reading);
                  const hasAlerts = alerts.length > 0;

                  return (
                    <tr
                      key={reading.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        hasAlerts ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="sticky left-0 z-10 bg-white p-2 border-r border-gray-200">
                        <div className="font-semibold text-gray-900">{format(parseISO(reading.date), 'MM/dd/yyyy')}</div>
                        <div className="text-gray-600">{reading.ga}</div>
                      </td>
                      <td className="text-center p-2 border-r border-gray-200">
                        {reading.maternal.weight ? `${reading.maternal.weight} ${reading.maternal.weightUnit}` : '-'}
                      </td>
                      <td className={`text-center p-2 border-r border-gray-200 ${
                        reading.maternal.bpSystolic && reading.maternal.bpSystolic >= 140
                          ? 'bg-red-100 font-semibold text-red-900'
                          : reading.maternal.bpSystolic && reading.maternal.bpSystolic >= 130
                          ? 'bg-orange-100 font-semibold text-orange-900'
                          : ''
                      }`}>
                        {reading.maternal.bpSystolic && reading.maternal.bpDiastolic
                          ? `${reading.maternal.bpSystolic}/${reading.maternal.bpDiastolic}`
                          : '-'}
                      </td>
                      <td className="text-center p-2 border-r border-gray-200">
                        {reading.maternal.pulse || '-'}
                      </td>
                      <td className="text-center p-2 border-r border-gray-200">
                        {reading.maternal.temperature
                          ? `${reading.maternal.temperature}°${reading.maternal.temperatureUnit}`
                          : '-'}
                      </td>
                      <td className={`text-center p-2 border-r border-gray-200 text-[9px] ${
                        reading.urine.protein && reading.urine.protein !== 'Negative'
                          ? 'bg-orange-100 font-semibold text-orange-900'
                          : ''
                      }`}>
                        <div>{reading.urine.protein?.charAt(0) || '-'}</div>
                        <div>{reading.urine.sugar?.charAt(0) || '-'}</div>
                        <div>{reading.urine.ketone?.charAt(0) || '-'}</div>
                      </td>
                      <td className={`text-center p-2 border-r border-gray-200 ${
                        reading.physical.edema && reading.physical.edema !== 'Absent'
                          ? 'bg-yellow-100 font-semibold text-yellow-900'
                          : ''
                      }`}>
                        {reading.physical.edema || '-'}
                      </td>
                      <td className="text-center p-2 border-r border-gray-200">
                        {reading.physical.fundalHeight || '-'}
                      </td>
                      <td className={`text-center p-2 border-r border-gray-200 ${
                        reading.fetal.fhr && (reading.fetal.fhr < 110 || reading.fetal.fhr > 160)
                          ? 'bg-red-100 font-semibold text-red-900'
                          : ''
                      }`}>
                        {reading.fetal.fhr || '-'}
                      </td>
                      <td className={`text-center p-2 border-r border-gray-200 ${
                        reading.fetal.fetalMovement && reading.fetal.fetalMovement !== 'Present'
                          ? 'bg-red-100 font-semibold text-red-900'
                          : ''
                      }`}>
                        {reading.fetal.fetalMovement?.charAt(0) || '-'}
                      </td>
                      <td className="text-center p-2 border-r border-gray-200">
                        {reading.fetal.presentation || '-'}
                      </td>
                      <td className="text-center p-2 text-[9px]">
                        <div className={reading.labs?.hemoglobin && reading.labs.hemoglobin < 10 ? 'text-red-700 font-semibold' : ''}>
                          {reading.labs?.hemoglobin ? `${reading.labs.hemoglobin}` : '-'}
                        </div>
                        <div className={reading.labs?.glucose && reading.labs.glucose >= 140 ? 'text-orange-700 font-semibold' : ''}>
                          {reading.labs?.glucose ? `${reading.labs.glucose}` : '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="text-[9px] text-gray-600">
              <div className="font-semibold text-gray-700 mb-1">Legend:</div>
              <div>BP=Blood Pressure, P/S/K=Protein/Sugar/Ketone, FH=Fundal Height (cm), FHR=Fetal Heart Rate (bpm), FM=Fetal Movement, Hb=Hemoglobin (g/dL), Gluc=Glucose (mg/dL)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Form Dialog (placeholder) */}
      {showEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-pink-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Record Prenatal Vitals</h2>
              <button onClick={() => setShowEntryForm(false)} className="p-1 hover:bg-pink-700 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">
                Full vitals entry form would go here. (Implementation in progress)
              </p>
              <button
                onClick={() => setShowEntryForm(false)}
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
