import React, { useState } from 'react';
import { Loader2, Info } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nirmitee.io/design-system';
import { MedicationFormData } from '../types';
import { ClinicalService } from '@/services/clinical.service';

interface MedicationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MedicationFormData) => Promise<void>;
  patientId?: string;
  patientName?: string;
  useDirectAPI?: boolean; // If true, save directly via API instead of using onSave callback
}

export function MedicationDrawer({
  open,
  onOpenChange,
  onSave,
  patientId,
  patientName,
  useDirectAPI = false
}: MedicationDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<MedicationFormData>({
    medication: '',
    dosageValue: '',
    dosageUnit: 'mg',
    route: 'oral',
    frequency: '1',
    period: '1',
    periodUnit: 'd',
    instructions: ''
  });

  const resetForm = () => {
    setFormData({
      medication: '',
      dosageValue: '',
      dosageUnit: 'mg',
      route: 'oral',
      frequency: '1',
      period: '1',
      periodUnit: 'd',
      instructions: ''
    });
    setError('');
  };

  const handleSave = async () => {
    if (!formData.medication || !formData.dosageValue) {
      setError('Medication name and dosage are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (useDirectAPI && patientId && patientName) {
        // Save directly via FHIR API
        await ClinicalService.createMedication(patientId, patientName, formData);
        resetForm();
        onOpenChange(false);
      } else {
        // Use callback (e.g., for encounter prescriptions)
        await onSave(formData);
        resetForm();
      }
    } catch (err: any) {
      console.error('Error saving medication:', err);
      setError(err.message || 'Failed to save medication. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DrawerContent side="right" size="md" className="overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Prescribe Medication</DrawerTitle>
        </DrawerHeader>

        {/* API Integration Info */}
        {useDirectAPI && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">FHIR API Integration Active</p>
              <p className="text-blue-600 mt-0.5">
                Medication will be saved as a FHIR MedicationRequest resource
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <Label>Medication Name <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Enter medication name"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Dosage <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                step="0.01"
                placeholder="10"
                value={formData.dosageValue}
                onChange={(e) => setFormData({ ...formData, dosageValue: e.target.value })}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={formData.dosageUnit} onValueChange={(value) => setFormData({ ...formData, dosageUnit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="mcg">mcg</SelectItem>
                  <SelectItem value="units">units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Route</Label>
            <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oral">Oral</SelectItem>
                <SelectItem value="intravenous">Intravenous</SelectItem>
                <SelectItem value="intramuscular">Intramuscular</SelectItem>
                <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                <SelectItem value="topical">Topical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Frequency</Label>
              <Input
                type="number"
                placeholder="1"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
            </div>
            <div>
              <Label>Per</Label>
              <Input
                type="number"
                placeholder="1"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              />
            </div>
            <div>
              <Label>Period</Label>
              <Select value={formData.periodUnit} onValueChange={(value) => setFormData({ ...formData, periodUnit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h">Hour(s)</SelectItem>
                  <SelectItem value="d">Day(s)</SelectItem>
                  <SelectItem value="wk">Week(s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Instructions</Label>
            <Input
              placeholder="Take with food"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.medication || !formData.dosageValue} className="flex-1 bg-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Prescribe'
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
