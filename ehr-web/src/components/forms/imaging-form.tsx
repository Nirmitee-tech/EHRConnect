'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nirmitee.io/design-system';
import { ClinicalService } from '@/services/clinical.service';
import { IMAGING_MODALITIES, IMAGING_STUDY_STATUS } from '@/constants/clinical.constants';

interface ImagingFormProps {
  patientId: string;
  patientName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ImagingForm({ patientId, patientName, onSuccess, onCancel }: ImagingFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    modality: '',
    modalityDisplay: '',
    description: '',
    startedDate: new Date().toISOString().split('T')[0],
    status: 'available',
    numberOfSeries: '1',
    numberOfInstances: '1',
    referrer: '',
    interpreter: '',
    reasonCode: ''
  });

  const handleModalityChange = (code: string) => {
    const modality = IMAGING_MODALITIES.find(m => m.code === code);
    if (modality) {
      setFormData({
        ...formData,
        modality: code,
        modalityDisplay: modality.display
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.modality || !formData.description || !formData.startedDate) {
      alert('Please provide modality, description, and study date');
      return;
    }

    setSaving(true);
    try {
      await ClinicalService.createImagingStudy(patientId, patientName, formData);
      onSuccess();
    } catch (error) {
      console.error('Error saving imaging study:', error);
      alert('Failed to save imaging study');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Imaging Modality <span className="text-red-500">*</span></Label>
        <Select
          value={formData.modality}
          onValueChange={handleModalityChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select modality..." />
          </SelectTrigger>
          <SelectContent>
            {IMAGING_MODALITIES.map((modality) => (
              <SelectItem key={modality.code} value={modality.code}>
                {modality.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Study Description <span className="text-red-500">*</span></Label>
        <Input
          placeholder="e.g., Chest X-Ray, Brain MRI with contrast"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Study Date <span className="text-red-500">*</span></Label>
        <Input
          type="date"
          value={formData.startedDate}
          onChange={(e) => setFormData({ ...formData, startedDate: e.target.value })}
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
            {IMAGING_STUDY_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Number of Series</Label>
          <Input
            type="number"
            min="1"
            value={formData.numberOfSeries}
            onChange={(e) => setFormData({ ...formData, numberOfSeries: e.target.value })}
          />
        </div>

        <div>
          <Label>Number of Images</Label>
          <Input
            type="number"
            min="1"
            value={formData.numberOfInstances}
            onChange={(e) => setFormData({ ...formData, numberOfInstances: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Referring Physician</Label>
        <Input
          placeholder="e.g., Dr. Smith"
          value={formData.referrer}
          onChange={(e) => setFormData({ ...formData, referrer: e.target.value })}
        />
      </div>

      <div>
        <Label>Interpreting Radiologist</Label>
        <Input
          placeholder="e.g., Dr. Johnson"
          value={formData.interpreter}
          onChange={(e) => setFormData({ ...formData, interpreter: e.target.value })}
        />
      </div>

      <div>
        <Label>Reason for Study</Label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded text-sm"
          rows={3}
          placeholder="Clinical indication or reason for imaging..."
          value={formData.reasonCode}
          onChange={(e) => setFormData({ ...formData, reasonCode: e.target.value })}
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
            'Add Imaging Study'
          )}
        </Button>
      </div>
    </form>
  );
}
