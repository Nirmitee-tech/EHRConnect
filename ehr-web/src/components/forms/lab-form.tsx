'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nirmitee.io/design-system';
import { ClinicalService } from '@/services/clinical.service';
import { LAB_TEST_TYPES, DIAGNOSTIC_REPORT_STATUS } from '@/constants/clinical.constants';

interface LabFormProps {
  patientId: string;
  patientName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LabForm({ patientId, patientName, onSuccess, onCancel }: LabFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    testCode: '',
    testDisplay: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'final',
    performer: '',
    conclusion: '',
    specimenType: '',
    collectionDate: new Date().toISOString().split('T')[0],
    category: 'LAB'
  });

  const handleTestChange = (code: string) => {
    const test = LAB_TEST_TYPES.find(t => t.code === code);
    if (test) {
      setFormData({
        ...formData,
        testCode: code,
        testDisplay: test.display
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.testCode || !formData.effectiveDate) {
      alert('Please select a test type and provide the test date');
      return;
    }

    setSaving(true);
    try {
      await ClinicalService.createDiagnosticReport(patientId, patientName, formData);
      onSuccess();
    } catch (error) {
      console.error('Error saving lab result:', error);
      alert('Failed to save lab result');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Test Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Test Information</h3>

          <div>
            <Label>Test Type <span className="text-red-500">*</span></Label>
            <Select
              value={formData.testCode}
              onValueChange={handleTestChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select test type..." />
              </SelectTrigger>
              <SelectContent>
                {LAB_TEST_TYPES.map((test) => (
                  <SelectItem key={test.code} value={test.code}>
                    {test.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Test Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAGNOSTIC_REPORT_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Specimen Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Specimen Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Specimen Type</Label>
              <Select
                value={formData.specimenType}
                onValueChange={(value) => setFormData({ ...formData, specimenType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specimen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Blood</SelectItem>
                  <SelectItem value="serum">Serum</SelectItem>
                  <SelectItem value="plasma">Plasma</SelectItem>
                  <SelectItem value="urine">Urine</SelectItem>
                  <SelectItem value="saliva">Saliva</SelectItem>
                  <SelectItem value="tissue">Tissue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Collection Date</Label>
              <Input
                type="date"
                value={formData.collectionDate}
                onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label>Performed By / Laboratory</Label>
            <Input
              placeholder="e.g., Quest Diagnostics, LabCorp, Hospital Laboratory"
              value={formData.performer}
              onChange={(e) => setFormData({ ...formData, performer: e.target.value })}
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Results & Interpretation</h3>

          <div>
            <Label>Clinical Conclusion / Results</Label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={6}
              placeholder="Enter test results, values, interpretations, and clinical conclusions..."
              value={formData.conclusion}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include numerical values, units, reference ranges, and interpretation notes
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 bg-primary hover:bg-primary/80 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Add Lab Result'
          )}
        </Button>
      </div>
    </form>
  );
}
