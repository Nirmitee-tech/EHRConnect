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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <Label>Performed By</Label>
        <Input
          placeholder="e.g., Quest Diagnostics, LabCorp"
          value={formData.performer}
          onChange={(e) => setFormData({ ...formData, performer: e.target.value })}
        />
      </div>

      <div>
        <Label>Results / Conclusion</Label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded text-sm"
          rows={5}
          placeholder="Enter test results or clinical conclusion..."
          value={formData.conclusion}
          onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="flex-1 bg-primary">
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
