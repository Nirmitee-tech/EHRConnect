import React, { memo } from 'react';
import { Calendar, AlertCircle, Pill, AlertTriangle } from 'lucide-react';
import { Badge } from '@nirmitee.io/design-system';

interface OverviewTabProps {
  encounters: any[];
  problems: any[];
  medications: any[];
  allergies: any[];
}

export const OverviewTab = memo(function OverviewTab({ encounters, problems, medications, allergies }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Recent Encounters</p>
              <p className="text-2xl font-bold text-gray-900">{encounters.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Active Problems</p>
              <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Pill className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold">Recent Encounters</h3>
          </div>
          <div className="p-4 space-y-3">
            {encounters.slice(0, 3).map((encounter: any) => (
              <div key={encounter.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {encounter.type?.[0]?.text || encounter.class?.display || 'Visit'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {encounter.period?.start ? new Date(encounter.period.start).toLocaleDateString() : 'Date unknown'}
                  </p>
                </div>
                <Badge className={`text-xs ${
                  encounter.status === 'finished' ? 'bg-green-50 text-green-700 border-green-200' :
                  encounter.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {encounter.status}
                </Badge>
              </div>
            ))}
            {encounters.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No encounters recorded</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold">Active Problems</h3>
          </div>
          <div className="p-4 space-y-3">
            {problems.slice(0, 3).map((problem: any) => (
              <div key={problem.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown condition'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Onset: {problem.onsetDateTime ? new Date(problem.onsetDateTime).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
            {problems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No active problems</p>
            )}
          </div>
        </div>
      </div>

      {/* Allergies Alert */}
      {allergies.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">Known Allergies ({allergies.length})</h3>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy: any) => (
                  <Badge key={allergy.id} className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown allergen'}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
