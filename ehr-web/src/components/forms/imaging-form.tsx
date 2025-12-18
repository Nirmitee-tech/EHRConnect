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
    bodyPart: '',
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
    <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Study Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Study Information</h3>

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
              placeholder="e.g., Chest X-Ray PA and Lateral, Brain MRI with contrast"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Body Part Examined</Label>
              <Select
                value={formData.bodyPart}
                onValueChange={(value) => setFormData({ ...formData, bodyPart: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body part..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head">Head</SelectItem>
                  <SelectItem value="neck">Neck</SelectItem>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="abdomen">Abdomen</SelectItem>
                  <SelectItem value="pelvis">Pelvis</SelectItem>
                  <SelectItem value="spine">Spine</SelectItem>
                  <SelectItem value="upper-extremity">Upper Extremity</SelectItem>
                  <SelectItem value="lower-extremity">Lower Extremity</SelectItem>
                  <SelectItem value="whole-body">Whole Body</SelectItem>
                </SelectContent>
              </Select>
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
        </div>

        {/* Study Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Study Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Number of Series</Label>
              <Input
                type="number"
                min="1"
                value={formData.numberOfSeries}
                onChange={(e) => setFormData({ ...formData, numberOfSeries: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Total series in study</p>
            </div>

            <div>
              <Label>Number of Images</Label>
              <Input
                type="number"
                min="1"
                value={formData.numberOfInstances}
                onChange={(e) => setFormData({ ...formData, numberOfInstances: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Total images/instances</p>
            </div>
          </div>
        </div>

        {/* Clinical Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Clinical Information</h3>

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
              placeholder="e.g., Dr. Johnson, Radiologist"
              value={formData.interpreter}
              onChange={(e) => setFormData({ ...formData, interpreter: e.target.value })}
            />
          </div>

          <div>
            <Label>Clinical Indication / Reason</Label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={4}
              placeholder="Enter clinical indication, symptoms, or reason for imaging study..."
              value={formData.reasonCode}
              onChange={(e) => setFormData({ ...formData, reasonCode: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              e.g., "Rule out pneumonia", "Evaluate for fracture", etc.
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
            'Add Imaging Study'
          )}
        </Button>
      </div>
    </form>
  );
}
