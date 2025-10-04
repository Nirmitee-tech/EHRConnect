import React from 'react';
import { Plus } from 'lucide-react';
import { Button, Badge } from '@ehrconnect/design-system';

interface AllergiesTabProps {
  allergies: any[];
  onAddAllergy: () => void;
}

export function AllergiesTab({ allergies, onAddAllergy }: AllergiesTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Allergies & Intolerances</h3>
          <Button size="sm" className="bg-primary" onClick={onAddAllergy}>
            <Plus className="h-4 w-4 mr-1" />
            Add Allergy
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Allergen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Criticality</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Reaction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allergies.map((allergy: any) => (
                <tr key={allergy.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown allergen'}
                  </td>
                  <td className="px-4 py-3 text-sm">{allergy.type || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {allergy.category?.[0] ? allergy.category[0].charAt(0).toUpperCase() + allergy.category[0].slice(1) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${
                      allergy.criticality === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                      allergy.criticality === 'low' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {allergy.criticality || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {allergy.reaction?.[0]?.manifestation?.[0]?.text ||
                     allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {allergy.recordedDate ? new Date(allergy.recordedDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allergies.length === 0 && (
            <div className="p-8 text-center text-gray-500">No known allergies</div>
          )}
        </div>
      </div>
    </div>
  );
}
