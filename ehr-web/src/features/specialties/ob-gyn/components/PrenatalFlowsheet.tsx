'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@nirmitee.io/design-system';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PrenatalFlowsheetProps {
  patientId: string;
}

/**
 * PrenatalFlowsheet Component
 * Displays prenatal vitals and measurements over time
 */
export function PrenatalFlowsheet({ patientId }: PrenatalFlowsheetProps) {
  // Mock data - in production, fetch from API
  const flowsheetData = [
    {
      date: '2025-01-15',
      gestationalAge: 28,
      weight: 165,
      bp: '120/80',
      fetalHeartRate: 145,
      fundalHeight: 28,
      notes: 'Normal visit, no concerns'
    },
    {
      date: '2025-01-08',
      gestationalAge: 27,
      weight: 163,
      bp: '118/78',
      fetalHeartRate: 142,
      fundalHeight: 27,
      notes: 'Patient feeling well'
    },
    {
      date: '2025-01-01',
      gestationalAge: 26,
      weight: 161,
      bp: '115/75',
      fetalHeartRate: 140,
      fundalHeight: 26,
      notes: 'Normal parameters'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prenatal Flowsheet</h2>
          <p className="text-sm text-gray-500 mt-1">Vitals and measurements tracking</p>
        </div>
        <button className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors">
          Add New Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Current Weight</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">165</span>
              <span className="text-sm text-gray-500">lbs</span>
              <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            <div className="text-xs text-green-600 mt-1">+2 lbs from last visit</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Blood Pressure</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">120/80</span>
              <Activity className="h-4 w-4 text-blue-500 ml-auto" />
            </div>
            <div className="text-xs text-gray-500 mt-1">Normal range</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Fetal Heart Rate</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">145</span>
              <span className="text-sm text-gray-500">bpm</span>
              <Activity className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            <div className="text-xs text-green-600 mt-1">Normal</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Fundal Height</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">28</span>
              <span className="text-sm text-gray-500">cm</span>
              <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            <div className="text-xs text-gray-500 mt-1">Appropriate for GA</div>
          </CardContent>
        </Card>
      </div>

      {/* Flowsheet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">GA (weeks)</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Weight (lbs)</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">BP</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">FHR (bpm)</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Fundal Height (cm)</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {flowsheetData.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.gestationalAge}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.weight}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.bp}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.fetalHeartRate}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.fundalHeight}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
