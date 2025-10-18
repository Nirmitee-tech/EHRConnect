import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MedicationsTabProps {
  medications: any[];
  onPrescribe: () => void;
}

export function MedicationsTab({ medications, onPrescribe }: MedicationsTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Active Medications</h3>
          <Button size="sm" className="bg-primary" onClick={onPrescribe}>
            <Plus className="h-4 w-4 mr-1" />
            Prescribe Medication
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Medication</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Dosage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prescribed</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {medications.map((med: any) => (
                <tr key={med.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {med.medicationCodeableConcept?.text ||
                     med.medicationCodeableConcept?.coding?.[0]?.display ||
                     'Unknown medication'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value || '-'} {med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || ''}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {med.dosageInstruction?.[0]?.route?.coding?.[0]?.display || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {med.dosageInstruction?.[0]?.timing?.repeat?.frequency || '-'}x /
                    {med.dosageInstruction?.[0]?.timing?.repeat?.period || '-'}
                    {med.dosageInstruction?.[0]?.timing?.repeat?.periodUnit || ''}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${
                      med.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      med.status === 'stopped' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {med.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {med.authoredOn ? new Date(med.authoredOn).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {medications.length === 0 && (
            <div className="p-8 text-center text-gray-500">No active medications</div>
          )}
        </div>
      </div>
    </div>
  );
}
