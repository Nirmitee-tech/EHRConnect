'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar, Activity, TrendingUp, TrendingDown, AlertCircle,
  Plus, Download, Printer, Filter, Eye, EyeOff,
  Heart, Scale, CheckCircle, Edit2, FileText, Settings, Info
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AddVisitDialog } from './AddVisitDialog';

/**
 * PRENATAL FLOWSHEET COMPONENT
 * ============================
 *
 * HOW TO READ THIS FLOWSHEET:
 * ---------------------------
 * 1. HEADER: Shows patient's pregnancy info (G/P status, current GA, EDD)
 * 2. HIGH RISK BANNER: Red alert if pregnancy is high-risk with factors listed
 * 3. TOOLBAR:
 *    - "Columns" button: Show/hide different data columns
 *    - "Filter" button: Filter visits by gestational age range
 *    - "Highlight" button: Toggle color-coding of abnormal values
 *    - "Add Visit" button: Add a new prenatal visit
 *    - Print/Download icons: Generate reports
 * 4. MAIN TABLE: Chronological list of all prenatal visits with:
 *    - Date, GA (gestational age), Weight, Fundal Height (FH)
 *    - Fetal Presentation (FPR), Fetal Heart Rate (FHR), Fetal Movement (FM)
 *    - Blood Pressure (BP), Urine analysis, Edema
 *    - Optional columns: Cervix exam, Labs (glucose, hemoglobin), Clinical notes
 * 5. COLOR CODING:
 *    - RED background = Severe abnormal (needs immediate attention)
 *    - ORANGE background = Moderate abnormal (concerning)
 *    - YELLOW background = Mild abnormal (monitor)
 *    - WHITE background = Normal values
 * 6. TRENDS SECTION (bottom): 4 cards showing trends over last 3 visits:
 *    - Weight gain/loss
 *    - Blood pressure changes
 *    - Fetal heart rate stability
 *    - Total visits & next appointment
 *
 * CLINICAL USE:
 * -------------
 * - Quickly scan the table to see all prenatal visits at a glance
 * - Red/orange highlights draw attention to problems
 * - Click "Edit" icon to modify a visit
 * - Click "View" icon to see detailed notes
 * - Use filters to focus on specific trimesters
 * - Trends cards help identify patterns (e.g., rising BP)
 */

// Types
interface PrenatalVisit {
  id: string;
  date: string;
  ga: string; // Gestational Age
  gaWeeks: number; // For calculations
  weight?: number;
  weightChange?: number;
  fh?: number; // Fundal Height
  fpr?: string; // Fetal Presentation
  fhr?: number; // Fetal Heart Rate
  fm?: string; // Fetal Movement
  bp?: { systolic: number; diastolic: number };
  urine?: {
    protein?: string;
    glucose?: string;
    ketones?: string;
  };
  edema?: string;
  cervix?: {
    dilation?: number;
    effacement?: number;
    station?: number;
    consistency?: string;
  };
  labs?: {
    glucose?: number;
    hemoglobin?: number;
    platelets?: number;
  };
  complaints?: string;
  assessment?: string;
  plan?: string;
  provider?: string;
  nextVisit?: string;
  notes?: string;
}

interface FlowsheetColumn {
  key: string;
  label: string;
  shortLabel?: string;
  visible: boolean;
  width?: string;
  category: 'vital' | 'exam' | 'lab' | 'assessment';
}

interface PrenatalFlowsheetProps {
  patientId: string;
  pregnancyEpisodeId?: string;
}

export function PrenatalFlowsheet({ patientId }: PrenatalFlowsheetProps) {
  // State
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showAddVisitDialog, setShowAddVisitDialog] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  const [filterGARange, setFilterGARange] = useState<[number, number]>([0, 42]);
  const [highlightAbnormal, setHighlightAbnormal] = useState(true);

  // Column configuration
  const [columns, setColumns] = useState<FlowsheetColumn[]>([
    { key: 'date', label: 'Visit Date', visible: true, width: '100px', category: 'vital' },
    { key: 'ga', label: 'GA', shortLabel: 'GA\nWeeks', visible: true, width: '80px', category: 'vital' },
    { key: 'weight', label: 'Weight', shortLabel: 'Wt\n(lbs)', visible: true, width: '80px', category: 'vital' },
    { key: 'fh', label: 'Fundal Height', shortLabel: 'FH\n(cm)', visible: true, width: '70px', category: 'exam' },
    { key: 'fpr', label: 'Presentation', shortLabel: 'FPR', visible: true, width: '90px', category: 'exam' },
    { key: 'fhr', label: 'Fetal HR', shortLabel: 'FHR\n(bpm)', visible: true, width: '80px', category: 'vital' },
    { key: 'fm', label: 'Movement', shortLabel: 'FM', visible: true, width: '80px', category: 'exam' },
    { key: 'bp', label: 'Blood Pressure', shortLabel: 'BP\n(S/D)', visible: true, width: '90px', category: 'vital' },
    { key: 'urine', label: 'Urine', shortLabel: 'Urine', visible: true, width: '100px', category: 'lab' },
    { key: 'edema', label: 'Edema', shortLabel: 'Edema', visible: true, width: '80px', category: 'exam' },
    { key: 'cervix', label: 'Cervix', shortLabel: 'Cervix', visible: false, width: '120px', category: 'exam' },
    { key: 'glucose', label: 'Glucose', shortLabel: 'Gluc\n(mg/dL)', visible: false, width: '80px', category: 'lab' },
    { key: 'hemoglobin', label: 'Hemoglobin', shortLabel: 'Hgb\n(g/dL)', visible: false, width: '80px', category: 'lab' },
    { key: 'provider', label: 'Provider', visible: false, width: '120px', category: 'assessment' },
    { key: 'complaints', label: 'Complaints', visible: false, width: '150px', category: 'assessment' },
    { key: 'assessment', label: 'Assessment', visible: false, width: '150px', category: 'assessment' },
    { key: 'plan', label: 'Plan', visible: false, width: '150px', category: 'assessment' },
  ]);

  // Mock data - in production, fetch from API
  // This would come from your backend API
  const [visits, setVisits] = useState<PrenatalVisit[]>([
    {
      id: '1',
      date: '2025-01-15',
      ga: '18w 3d',
      gaWeeks: 18.4,
      weight: 158,
      weightChange: 3,
      fh: 18,
      fpr: 'Vertex',
      fhr: 142,
      fm: 'Present',
      bp: { systolic: 118, diastolic: 72 },
      urine: { protein: 'Neg', glucose: 'Neg', ketones: 'Neg' },
      edema: 'None',
      labs: { glucose: 92, hemoglobin: 12.1 },
      complaints: 'None',
      assessment: 'Normal prenatal visit',
      plan: 'Continue routine care, anatomy scan scheduled',
      provider: 'Dr. Smith',
      nextVisit: '2025-02-12',
      notes: ''
    },
    {
      id: '2',
      date: '2025-02-12',
      ga: '22w 1d',
      gaWeeks: 22.1,
      weight: 162,
      weightChange: 4,
      fh: 20,
      fpr: 'Vertex',
      fhr: 148,
      fm: 'Present',
      bp: { systolic: 120, diastolic: 70 },
      urine: { protein: 'Neg', glucose: 'Neg', ketones: 'Neg' },
      edema: 'None',
      labs: { glucose: 88 },
      complaints: 'Mild back pain',
      assessment: 'Normal prenatal visit, anatomy scan normal',
      plan: 'Continue routine care, discuss glucose screening',
      provider: 'Dr. Smith',
      nextVisit: '2025-03-05'
    },
    {
      id: '3',
      date: '2025-03-05',
      ga: '25w 0d',
      gaWeeks: 25.0,
      weight: 165,
      weightChange: 3,
      fh: 24,
      fpr: 'Vertex',
      fhr: 152,
      fm: 'Present',
      bp: { systolic: 124, diastolic: 78 },
      urine: { protein: 'Trace', glucose: 'Neg', ketones: 'Neg' },
      edema: 'Trace pedal',
      labs: { glucose: 145, hemoglobin: 11.8 },
      complaints: 'Increased swelling in feet',
      assessment: 'Mild edema, elevated glucose - screen positive',
      plan: '3hr GTT ordered, monitor BP closely, return in 2 weeks',
      provider: 'Dr. Smith',
      nextVisit: '2025-03-19',
      notes: 'Patient counseled on GDM risk'
    },
    {
      id: '4',
      date: '2025-03-19',
      ga: '27w 0d',
      gaWeeks: 27.0,
      weight: 168,
      weightChange: 3,
      fh: 26,
      fpr: 'Vertex',
      fhr: 150,
      fm: 'Present',
      bp: { systolic: 132, diastolic: 84 },
      urine: { protein: 'Trace', glucose: 'Neg', ketones: 'Neg' },
      edema: '+1 bilateral',
      labs: { glucose: 156, hemoglobin: 11.6, platelets: 185000 },
      complaints: 'Headaches, increased swelling',
      assessment: 'Gestational diabetes confirmed, borderline BP, mild preeclampsia signs',
      plan: 'Start GDM diet, home BP monitoring, NST q week, recheck labs in 1 week',
      provider: 'Dr. Johnson',
      nextVisit: '2025-03-26',
      notes: 'HIGH RISK - close monitoring required'
    }
  ]);

  // Pregnancy context data
  const pregnancyData = {
    edd: '2025-08-15',
    lmp: '2024-11-08',
    currentGA: '27w 0d',
    gravida: 2,
    para: 1,
    highRisk: true,
    riskFactors: ['Gestational Diabetes', 'Borderline HTN', 'Trace Proteinuria']
  };

  // Helper functions for abnormal value detection
  const isAbnormalBP = (bp?: { systolic: number; diastolic: number }) => {
    if (!bp) return false;
    return bp.systolic >= 140 || bp.diastolic >= 90 || bp.systolic >= 130 || bp.diastolic >= 85;
  };

  const getBPSeverity = (bp?: { systolic: number; diastolic: number }) => {
    if (!bp) return 'normal';
    if (bp.systolic >= 140 || bp.diastolic >= 90) return 'severe';
    if (bp.systolic >= 130 || bp.diastolic >= 85) return 'moderate';
    if (bp.systolic >= 120 || bp.diastolic >= 80) return 'mild';
    return 'normal';
  };

  const isAbnormalFHR = (fhr?: number) => {
    if (!fhr) return false;
    return fhr < 110 || fhr > 160;
  };

  const isAbnormalWeight = (visit: PrenatalVisit, previousVisit?: PrenatalVisit) => {
    if (!visit.weight || !previousVisit?.weight) return false;
    const change = visit.weight - previousVisit.weight;
    const weeksDiff = visit.gaWeeks - previousVisit.gaWeeks;
    const ratePerWeek = change / weeksDiff;
    // Flag if gaining > 2 lbs/week in 2nd/3rd trimester
    return visit.gaWeeks > 13 && ratePerWeek > 2;
  };

  const isAbnormalFH = (fh?: number, ga?: number) => {
    if (!fh || !ga) return false;
    // Fundal height should be ± 2cm of GA in weeks
    return Math.abs(fh - ga) > 2;
  };

  const isAbnormalGlucose = (glucose?: number) => {
    if (!glucose) return false;
    return glucose >= 140; // Screening threshold
  };

  const isAbnormalHemoglobin = (hemoglobin?: number) => {
    if (!hemoglobin) return false;
    return hemoglobin < 11.0; // Anemia threshold in pregnancy
  };

  // Toggle column visibility
  const toggleColumn = (key: string) => {
    setColumns(cols => cols.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  // Handler: Add new visit
  const handleAddVisit = (newVisit: PrenatalVisit) => {
    setVisits([...visits, newVisit].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    console.log('✅ New visit added:', newVisit);
  };

  // Handler: Print flowsheet
  const handlePrint = () => {
    window.print();
    console.log('🖨️ Printing flowsheet...');
  };

  // Handler: Export to CSV
  const handleExport = () => {
    // Create CSV content
    const headers = columns.filter(c => c.visible).map(c => c.label).join(',');
    const rows = filteredVisits.map(visit => {
      return columns.filter(c => c.visible).map(col => {
        switch (col.key) {
          case 'date': return format(parseISO(visit.date), 'MM/dd/yyyy');
          case 'ga': return visit.ga;
          case 'weight': return visit.weight || '';
          case 'fh': return visit.fh || '';
          case 'fpr': return visit.fpr || '';
          case 'fhr': return visit.fhr || '';
          case 'fm': return visit.fm || '';
          case 'bp': return visit.bp ? `${visit.bp.systolic}/${visit.bp.diastolic}` : '';
          case 'urine': return visit.urine ? `P:${visit.urine.protein} G:${visit.urine.glucose}` : '';
          case 'edema': return visit.edema || '';
          default: return '';
        }
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prenatal-flowsheet-${patientId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('📥 Exported flowsheet to CSV');
  };

  // Filter visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => v.gaWeeks >= filterGARange[0] && v.gaWeeks <= filterGARange[1]);
  }, [visits, filterGARange]);

  // Render cell content
  const renderCell = (visit: PrenatalVisit, column: FlowsheetColumn, index: number) => {
    const previousVisit = index > 0 ? filteredVisits[index - 1] : undefined;

    let content: React.ReactNode = '-';
    let isAbnormal = false;
    let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';

    switch (column.key) {
      case 'date':
        content = format(parseISO(visit.date), 'MM/dd/yyyy');
        break;
      case 'ga':
        content = visit.ga;
        break;
      case 'weight':
        if (visit.weight) {
          isAbnormal = isAbnormalWeight(visit, previousVisit);
          const change = visit.weightChange;
          content = (
            <div className="flex items-center gap-1">
              <span>{visit.weight}</span>
              {change && (
                <span className={`text-[9px] ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change > 0 ? '↑' : '↓'}{Math.abs(change)}
                </span>
              )}
            </div>
          );
        }
        break;
      case 'fh':
        if (visit.fh) {
          isAbnormal = isAbnormalFH(visit.fh, visit.gaWeeks);
          content = visit.fh;
        }
        break;
      case 'fpr':
        content = visit.fpr || '-';
        break;
      case 'fhr':
        if (visit.fhr) {
          isAbnormal = isAbnormalFHR(visit.fhr);
          severity = isAbnormal ? 'severe' : 'normal';
          content = (
            <div className="flex items-center gap-1 justify-center">
              <Heart className="h-3 w-3" />
              <span>{visit.fhr}</span>
            </div>
          );
        }
        break;
      case 'fm':
        content = visit.fm || '-';
        break;
      case 'bp':
        if (visit.bp) {
          isAbnormal = isAbnormalBP(visit.bp);
          severity = getBPSeverity(visit.bp);
          content = `${visit.bp.systolic}/${visit.bp.diastolic}`;
        }
        break;
      case 'urine':
        if (visit.urine) {
          const hasProtein = visit.urine.protein && visit.urine.protein !== 'Neg';
          const hasGlucose = visit.urine.glucose && visit.urine.glucose !== 'Neg';
          isAbnormal = Boolean(hasProtein || hasGlucose);
          severity = hasProtein ? 'moderate' : 'mild';
          content = (
            <div className="text-[9px]">
              <div>P: {visit.urine.protein || '-'}</div>
              <div>G: {visit.urine.glucose || '-'}</div>
            </div>
          );
        }
        break;
      case 'edema':
        isAbnormal = visit.edema !== 'None' && visit.edema !== undefined;
        severity = visit.edema?.includes('+1') ? 'mild' : visit.edema?.includes('+2') || visit.edema?.includes('+3') ? 'moderate' : 'normal';
        content = visit.edema || '-';
        break;
      case 'cervix':
        if (visit.cervix && visit.cervix.dilation !== undefined) {
          content = (
            <div className="text-[9px]">
              <div>{visit.cervix.dilation}cm / {visit.cervix.effacement}%</div>
              {visit.cervix.station !== undefined && <div>Stn: {visit.cervix.station}</div>}
            </div>
          );
        }
        break;
      case 'glucose':
        if (visit.labs?.glucose) {
          isAbnormal = isAbnormalGlucose(visit.labs.glucose);
          severity = isAbnormal ? 'moderate' : 'normal';
          content = visit.labs.glucose;
        }
        break;
      case 'hemoglobin':
        if (visit.labs?.hemoglobin) {
          isAbnormal = isAbnormalHemoglobin(visit.labs.hemoglobin);
          severity = isAbnormal ? 'moderate' : 'normal';
          content = visit.labs.hemoglobin.toFixed(1);
        }
        break;
      case 'provider':
        content = visit.provider || '-';
        break;
      case 'complaints':
        content = visit.complaints || 'None';
        break;
      case 'assessment':
        content = visit.assessment || '-';
        break;
      case 'plan':
        content = visit.plan || '-';
        break;
    }

    // Styling based on abnormal values
    let cellClass = 'p-2 text-center border-r border-gray-200';
    if (highlightAbnormal && isAbnormal) {
      switch (severity) {
        case 'severe':
          cellClass += ' bg-red-100 text-red-900 font-semibold';
          break;
        case 'moderate':
          cellClass += ' bg-orange-100 text-orange-900 font-semibold';
          break;
        case 'mild':
          cellClass += ' bg-yellow-50 text-yellow-900';
          break;
      }
    }

    return <td className={cellClass}>{content}</td>;
  };

  // Calculate trends
  const trends = useMemo(() => {
    if (visits.length < 2) return null;

    const recentVisits = visits.slice(-3);
    const weights = recentVisits.map(v => v.weight).filter(Boolean) as number[];
    const bps = recentVisits.map(v => v.bp?.systolic).filter(Boolean) as number[];
    const fhrs = recentVisits.map(v => v.fhr).filter(Boolean) as number[];

    return {
      weightTrend: weights.length >= 2 ? (weights[weights.length - 1] - weights[0]) : 0,
      bpTrend: bps.length >= 2 ? (bps[bps.length - 1] - bps[0]) : 0,
      fhrTrend: fhrs.length >= 2 ? (fhrs[fhrs.length - 1] - fhrs[0]) : 0,
    };
  }, [visits]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-300 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Prenatal Flowsheet</h1>
                <p className="text-xs text-gray-600">
                  G{pregnancyData.gravida}/P{pregnancyData.para} • Current: {pregnancyData.currentGA} • EDD: {format(parseISO(pregnancyData.edd), 'MM/dd/yyyy')}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDemoInfo(!showDemoInfo)}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors flex items-center gap-1.5"
                title="Click for demo guide and explanations"
              >
                <Info className="h-3.5 w-3.5" />
                Demo Guide
              </button>
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" />
                Columns
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
              <button
                onClick={() => setHighlightAbnormal(!highlightAbnormal)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                  highlightAbnormal
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {highlightAbnormal ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Highlight
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button
                onClick={() => setShowAddVisitDialog(true)}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                title="Add a new prenatal visit"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Visit
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                title="Print flowsheet"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-1.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                title="Export to CSV"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Risk Alert Banner */}
          {pregnancyData.highRisk && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-red-900">HIGH RISK PREGNANCY</div>
                <div className="text-xs text-red-800">
                  {pregnancyData.riskFactors.join(' • ')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Info Panel */}
        {showDemoInfo && (
          <div className="border-t border-gray-200 bg-purple-50 p-4">
            <div className="max-w-6xl">
              <h3 className="text-sm font-bold text-purple-900 mb-3">📋 How to Read This Flowsheet (Demo Guide)</h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">🎯 What Am I Looking At?</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• <strong>Each row</strong> = one prenatal visit</li>
                    <li>• <strong>Columns</strong> = vitals, measurements, lab results</li>
                    <li>• <strong>Colors</strong> = automatic abnormal value detection</li>
                    <li>• <strong>Trends</strong> = summary cards at bottom</li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">🚦 Color Coding</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                      <strong>RED</strong> = Severe (BP ≥140/90, FHR &lt;110 or &gt;160)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
                      <strong>ORANGE</strong> = Moderate (BP 130+, proteinuria, glucose ≥140)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded" />
                      <strong>YELLOW</strong> = Mild (BP 120+, trace edema)
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">📊 Demo Scenario</h4>
                  <p className="text-gray-700 mb-2">This patient shows a <strong>concerning trend</strong>:</p>
                  <ul className="space-y-1 text-gray-700 text-[11px]">
                    <li>• <strong>Visit 1-2:</strong> Everything normal ✅</li>
                    <li>• <strong>Visit 3:</strong> Trace protein + elevated glucose (early warning ⚠️)</li>
                    <li>• <strong>Visit 4:</strong> Rising BP + confirmed GDM + worsening edema 🚨</li>
                  </ul>
                  <p className="text-purple-800 font-semibold mt-2">→ High-risk pregnancy needing close monitoring</p>
                </div>

                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">🎮 Try These Actions</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Click <strong>"Columns"</strong> to show/hide data</li>
                    <li>• Click <strong>"Filter"</strong> to focus on specific weeks</li>
                    <li>• Click <strong>"Highlight"</strong> to toggle colors on/off</li>
                    <li>• Click <strong>"Add Visit"</strong> to enter new data</li>
                    <li>• Click <strong>Download</strong> icon to export CSV</li>
                    <li>• Check <strong>Trends</strong> at bottom for analysis</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 p-2 bg-purple-100 rounded border border-purple-300 text-xs text-purple-900">
                <strong>💡 Pro Tip:</strong> In Visit 4, notice how BP (132/84), Glucose (156), and Edema (+1) are all highlighted orange.
                Multiple orange/red flags together = higher clinical priority. The system helps you quickly spot these patterns!
              </div>
            </div>
          </div>
        )}

        {/* Column Selector */}
        {showColumnSelector && (
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-bold text-gray-700 mb-2">Select Columns to Display:</div>
            <div className="grid grid-cols-6 gap-2">
              {columns.map(col => (
                <label key={col.key} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-100 p-1.5 rounded">
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleColumn(col.key)}
                    className="rounded border-gray-300"
                  />
                  <span className={col.visible ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Gestational Age Range:</span>
                <input
                  type="number"
                  value={filterGARange[0]}
                  onChange={(e) => setFilterGARange([Number(e.target.value), filterGARange[1]])}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  min="0"
                  max="42"
                />
                <span className="text-xs text-gray-600">to</span>
                <input
                  type="number"
                  value={filterGARange[1]}
                  onChange={(e) => setFilterGARange([filterGARange[0], Number(e.target.value)])}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  min="0"
                  max="42"
                />
                <span className="text-xs text-gray-600">weeks</span>
              </div>
              <button
                onClick={() => setFilterGARange([0, 42])}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flowsheet Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead className="bg-gradient-to-b from-gray-100 to-gray-50 sticky top-0 z-10">
                <tr className="border-b-2 border-gray-300">
                  <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200 min-w-[40px]">
                    #
                  </th>
                  {columns.filter(col => col.visible).map(col => (
                    <th
                      key={col.key}
                      className="text-center p-2 font-bold text-gray-700 border-r border-gray-200 whitespace-pre-line"
                      style={{ minWidth: col.width }}
                    >
                      {col.shortLabel || col.label}
                    </th>
                  ))}
                  <th className="text-center p-2 font-bold text-gray-700 min-w-[60px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={columns.filter(c => c.visible).length + 2} className="p-8 text-center text-gray-500">
                      No visits recorded in the selected range
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit, index) => (
                    <tr
                      key={visit.id}
                      className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-2 text-center font-semibold text-gray-700 border-r border-gray-200">
                        {index + 1}
                      </td>
                      {columns.filter(col => col.visible).map(col => (
                        <React.Fragment key={col.key}>
                          {renderCell(visit, col, index)}
                        </React.Fragment>
                      ))}
                      <td className="p-2 text-center border-l border-gray-200">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingVisitId(visit.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit visit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="View details"
                          >
                            <FileText className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="flex items-start justify-between">
              <div className="text-[9px] text-gray-600 space-y-1">
                <div className="font-semibold text-gray-700 mb-1">Legend:</div>
                <div>GA=Gestational Age, FH=Fundal Height, FPR=Fetal Presentation, FHR=Fetal Heart Rate, FM=Fetal Movement</div>
                <div>BP=Blood Pressure, P=Protein, G=Glucose, Stn=Station</div>
              </div>
              <div className="flex items-center gap-4 text-[9px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                  <span className="text-gray-700">Severe abnormal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
                  <span className="text-gray-700">Moderate abnormal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded" />
                  <span className="text-gray-700">Mild abnormal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Summary - Compact */}
        {trends && (
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Scale className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">Weight</span>
                </div>
                {trends.weightTrend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {trends.weightTrend > 0 ? '+' : ''}{trends.weightTrend.toFixed(1)}
              </div>
              <div className="text-[8px] text-gray-500">lbs (3 visits)</div>
            </div>

            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">BP</span>
                </div>
                {Math.abs(trends.bpTrend) < 5 ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {trends.bpTrend > 0 ? '+' : ''}{trends.bpTrend}
              </div>
              <div className="text-[8px] text-gray-500">mmHg (systolic)</div>
            </div>

            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">FHR</span>
                </div>
                {Math.abs(trends.fhrTrend) < 20 ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {trends.fhrTrend > 0 ? '+' : ''}{trends.fhrTrend}
              </div>
              <div className="text-[8px] text-gray-500">bpm (3 visits)</div>
            </div>

            <div className="bg-white border border-gray-300 rounded shadow-sm p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-bold text-gray-700">Visits</span>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">{visits.length}</div>
              <div className="text-[8px] text-gray-500">
                Next: {visits[visits.length - 1]?.nextVisit ? format(parseISO(visits[visits.length - 1].nextVisit!), 'MM/dd') : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Visit Dialog */}
      <AddVisitDialog
        isOpen={showAddVisitDialog}
        onClose={() => setShowAddVisitDialog(false)}
        onSave={handleAddVisit}
        currentGA={pregnancyData.currentGA}
      />
    </div>
  );
}
