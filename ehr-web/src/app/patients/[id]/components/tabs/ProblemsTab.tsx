import React from 'react';
import { Plus } from 'lucide-react';
import { Button, Badge } from '@ehrconnect/design-system';

interface ProblemsTabProps {
  problems: any[];
  onAddProblem: () => void;
}

export function ProblemsTab({ problems, onAddProblem }: ProblemsTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Active Problems & Conditions</h3>
          <Button size="sm" className="bg-primary" onClick={onAddProblem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Problem
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Onset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {problems.map((problem: any) => (
                <tr key={problem.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown condition'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {problem.category?.[0]?.coding?.[0]?.display || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${
                      problem.clinicalStatus?.coding?.[0]?.code === 'active' ? 'bg-red-50 text-red-700 border-red-200' :
                      problem.clinicalStatus?.coding?.[0]?.code === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {problem.clinicalStatus?.coding?.[0]?.display || problem.clinicalStatus?.coding?.[0]?.code || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {problem.onsetDateTime ? new Date(problem.onsetDateTime).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {problem.severity?.coding?.[0]?.display || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {problems.length === 0 && (
            <div className="p-8 text-center text-gray-500">No problems recorded</div>
          )}
        </div>
      </div>
    </div>
  );
}
