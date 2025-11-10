'use client';

import React, { useState } from 'react';
import { usePatientDetailStore } from '../../store/patient-detail-store';
import { format } from 'date-fns';
import { Calendar, Baby, AlertTriangle, Activity, TrendingUp, Printer, FileDown } from 'lucide-react';

interface PrenatalFacesheetTabProps {
  patientId: string;
}

export function PrenatalFacesheetTab({ patientId }: PrenatalFacesheetTabProps) {
  const {
    patient,
    problems,
    medications,
    observations,
    encounters
  } = usePatientDetailStore();

  // Mock prenatal data - in real app, fetch from OB/GYN episode
  const prenatalData = {
    edd: '2025-08-15',
    lmp: '2024-11-08',
    currentGA: '26w 2d',
    trimester1USDate: '2024-12-15',
    trimester2USDate: '2025-02-20',
    trimester3USDate: null,
    gravida: 2,
    para: 1,
    highRisk: true,
    riskFactors: ['Type II Diabetes', 'Trisomy 18 screen positive']
  };

  // Mock prenatal visits flow
  const prenatalVisits = [
    { date: '2025-01-15', ga: '18w 3d', weight: 158, fh: '-', fpr: 'Vertex', fhr: 142, fm: 'Present', ptl: '-', pes: '-', cervix: 'Closed', bpS: 118, bpD: 72, urine: 'Neg', edema: 'Absent', comments: '' },
    { date: '2025-02-12', ga: '22w 1d', weight: 162, fh: '20', fpr: 'Vertex', fhr: 148, fm: 'Present', ptl: '-', pes: '-', cervix: 'Closed', bpS: 120, bpD: 70, urine: 'Neg', edema: 'Absent', comments: '' },
    { date: '2025-03-05', ga: '25w 0d', weight: 165, fh: '24', fpr: 'Vertex', fhr: 152, fm: 'Present', ptl: '-', pes: '-', cervix: 'Fingertip', bpS: 124, bpD: 78, urine: 'Trace Protein', edema: 'Trace', comments: 'Monitor BP' }
  ];

  // Active prenatal problems
  const prenatalProblems = [
    { problem: 'Trichomonas Vaginalis', plan: 'Metronidazole', medication: 'Metronidazole 500mg BID x7 days' },
    { problem: 'Trisomy 18 screen positive', plan: 'Genetic counselling', medication: '-' },
    { problem: 'Gestational Nausea', plan: 'Continue monitor', medication: 'Ondansetron 4mg PRN' },
    { problem: 'Type II Diabetes (pre-existing)', plan: 'Monitor glucose, insulin adjustment', medication: 'Insulin Aspart' }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with Quick Actions */}
      <div className="border-b border-gray-300 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Baby className="h-5 w-5 text-gray-700" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Prenatal Facesheet</h2>
              <p className="text-xs text-gray-600">{patient?.name} • G{prenatalData.gravida}/P{prenatalData.para}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              + Add Visit
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              + Order Lab
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              + Add Ultrasound
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded">
              <Printer className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded">
              <FileDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner for High Risk */}
      {prenatalData.highRisk && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-300 rounded p-2 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-red-900">HIGH RISK PREGNANCY</div>
            <div className="text-xs text-red-800 mt-0.5">
              {prenatalData.riskFactors.join(' • ')}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-[1800px] mx-auto space-y-4">
          {/* Top Section: EDD/Ultrasound + Problems/Plans */}
          <div className="grid grid-cols-2 gap-4">
            {/* EDD & Ultrasound Details */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <Calendar className="h-4 w-4 text-gray-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase">EDD & Ultrasound Details</h3>
              </div>

              <div className="space-y-3">
                {/* Key Dates */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <div className="text-[9px] text-blue-600 font-semibold uppercase mb-1">Current GA</div>
                    <div className="text-lg font-bold text-blue-900">{prenatalData.currentGA}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <div className="text-[9px] text-gray-500 font-semibold uppercase mb-1">LMP</div>
                    <div className="text-xs font-bold text-gray-900">
                      {format(new Date(prenatalData.lmp), 'MM/dd/yyyy')}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-[9px] text-green-600 font-semibold uppercase mb-1">EDD</div>
                    <div className="text-xs font-bold text-green-900">
                      {format(new Date(prenatalData.edd), 'MM/dd/yyyy')}
                    </div>
                  </div>
                </div>

                {/* Ultrasound Dates */}
                <div>
                  <div className="text-[10px] font-bold text-gray-700 uppercase mb-2">Trimester Ultrasounds</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded p-2">
                      <span className="font-medium text-gray-700">1st Trimester (Dating)</span>
                      <span className="font-bold text-gray-900">
                        {prenatalData.trimester1USDate ? format(new Date(prenatalData.trimester1USDate), 'MM/dd/yyyy') : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded p-2">
                      <span className="font-medium text-gray-700">2nd Trimester (Anatomy)</span>
                      <span className="font-bold text-gray-900">
                        {prenatalData.trimester2USDate ? format(new Date(prenatalData.trimester2USDate), 'MM/dd/yyyy') : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded p-2">
                      <span className="font-medium text-gray-700">3rd Trimester (Growth)</span>
                      <span className="font-bold text-gray-900">
                        {prenatalData.trimester3USDate ? format(new Date(prenatalData.trimester3USDate), 'MM/dd/yyyy') : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Problems and Plans Table */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase">Problems & Plans</h3>
              </div>

              <div className="overflow-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr className="border-b border-gray-300">
                      <th className="text-left p-2 font-bold text-gray-700 text-[10px] uppercase">Problem</th>
                      <th className="text-left p-2 font-bold text-gray-700 text-[10px] uppercase">Plan</th>
                      <th className="text-left p-2 font-bold text-gray-700 text-[10px] uppercase">Medication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prenatalProblems.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 font-medium text-gray-900">{item.problem}</td>
                        <td className="p-2 text-gray-700">{item.plan}</td>
                        <td className="p-2 text-gray-700">{item.medication}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Prenatal Flow Record Table */}
          <div className="bg-white border border-gray-300 rounded shadow-sm p-3">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase">Prenatal Flow Record</h3>
              </div>
              <div className="text-[9px] text-gray-500">
                <span className="font-semibold text-gray-700">Comments:</span> Mom has Type II Diabetes - Monitor glucose closely
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse">
                <thead className="bg-gray-100">
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-2 font-bold text-gray-700 border-r border-gray-200 min-w-[80px]">Date</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">GA<br/>Weeks</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Weight<br/>(lbs)</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">FH<br/>(cm)</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">FPR</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">FHR<br/>(bpm)</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">FM</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">PTL</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">PES</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Cervix</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">BP<br/>(S/D)</th>
                    <th className="text-center p-2 font-bold text-gray-700 border-r border-gray-200">Urine</th>
                    <th className="text-center p-2 font-bold text-gray-700">Edema</th>
                  </tr>
                </thead>
                <tbody>
                  {prenatalVisits.map((visit, idx) => {
                    const bpHigh = visit.bpS > 120 || visit.bpD > 80;
                    const edemaPresent = visit.edema !== 'Absent';

                    return (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-blue-50">
                        <td className="p-2 font-medium text-gray-900 border-r border-gray-200">{visit.date}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.ga}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.weight}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.fh}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.fpr}</td>
                        <td className="p-2 text-center font-semibold text-green-700 border-r border-gray-200">{visit.fhr}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.fm}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.ptl}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.pes}</td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.cervix}</td>
                        <td className={`p-2 text-center font-semibold border-r border-gray-200 ${bpHigh ? 'text-red-700 bg-red-50' : 'text-gray-800'}`}>
                          {visit.bpS}/{visit.bpD}
                        </td>
                        <td className="p-2 text-center text-gray-800 border-r border-gray-200">{visit.urine}</td>
                        <td className={`p-2 text-center font-semibold ${edemaPresent ? 'text-yellow-700 bg-yellow-50' : 'text-gray-800'}`}>
                          {visit.edema}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Baby B/C Support (for twins/triplets) */}
                  <tr className="bg-gray-50">
                    <td colSpan={13} className="p-2 text-xs text-gray-600 italic">
                      <span className="font-semibold">Baby B:</span> Not applicable (singleton pregnancy)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-3 pt-2 border-t border-gray-200 text-[9px] text-gray-600">
              <span className="font-semibold">Legend:</span> GA=Gestational Age, FH=Fundal Height, FPR=Fetal Presentation, FHR=Fetal Heart Rate, FM=Fetal Movement, PTL=Preterm Labor, PES=Preeclampsia Symptoms
            </div>
          </div>

          {/* Growth Trends Chart */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-300 rounded shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <h4 className="text-[10px] font-bold text-gray-800 uppercase">Weight Trend</h4>
              </div>
              <div className="h-24 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[9px] text-gray-500">
                Chart: 158 → 162 → 165 lbs (Normal progression)
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <h4 className="text-[10px] font-bold text-gray-800 uppercase">FHR Trend</h4>
              </div>
              <div className="h-24 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[9px] text-gray-500">
                Chart: 142 → 148 → 152 bpm (Normal range)
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3 w-3 text-red-600" />
                <h4 className="text-[10px] font-bold text-gray-800 uppercase">BP Trend</h4>
              </div>
              <div className="h-24 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[9px] text-gray-500">
                Chart: 118/72 → 120/70 → 124/78 (Monitor closely)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
