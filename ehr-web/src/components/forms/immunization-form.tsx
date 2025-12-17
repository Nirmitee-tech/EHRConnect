'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nirmitee.io/design-system';
import { ClinicalService } from '@/services/clinical.service';
import { VACCINE_TYPES, IMMUNIZATION_SITES, IMMUNIZATION_ROUTES, IMMUNIZATION_STATUS } from '@/constants/clinical.constants';

interface ImmunizationFormProps {
  patientId: string;
  patientName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ImmunizationForm({ patientId, patientName, onSuccess, onCancel }: ImmunizationFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    vaccineCode: '',
    vaccineDisplay: '',
    occurrenceDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    lotNumber: '',
    expirationDate: '',
    manufacturer: '',
    site: '',
    route: '',
    doseQuantity: '',
    doseNumber: '',
    performer: '',
    note: ''
  });

  const handleVaccineChange = (code: string) => {
    const vaccine = VACCINE_TYPES.find(v => v.code === code);
    if (vaccine) {
      setFormData({
        ...formData,
        vaccineCode: code,
        vaccineDisplay: vaccine.display
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vaccineCode || !formData.occurrenceDate) {
      alert('Please select a vaccine and provide the date administered');
      return;
    }

    setSaving(true);
    try {
      await ClinicalService.createImmunization(patientId, patientName, formData);
      onSuccess();
    } catch (error) {
      console.error('Error saving immunization:', error);
      alert('Failed to save immunization record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Vaccine Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Vaccine Information</h3>

          <div>
            <Label>Vaccine <span className="text-red-500">*</span></Label>
            <Select
              value={formData.vaccineCode}
              onValueChange={handleVaccineChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vaccine..." />
              </SelectTrigger>
              <SelectContent>
                {VACCINE_TYPES.map((vaccine) => (
                  <SelectItem key={vaccine.code} value={vaccine.code}>
                    {vaccine.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date Administered <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.occurrenceDate}
                onChange={(e) => setFormData({ ...formData, occurrenceDate: e.target.value })}
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
                  {IMMUNIZATION_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Vaccine Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Vaccine Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lot Number</Label>
              <Input
                placeholder="e.g., ABC123"
                value={formData.lotNumber}
                onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
              />
            </div>

            <div>
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label>Manufacturer</Label>
            <Input
              placeholder="e.g., Pfizer, Moderna"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dose Number</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 1, 2"
                value={formData.doseNumber}
                onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
              />
            </div>

            <div>
              <Label>Dose Quantity (mL)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 0.5"
                value={formData.doseQuantity}
                onChange={(e) => setFormData({ ...formData, doseQuantity: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Administration Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Administration Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Body Site</Label>
              <Select
                value={formData.site}
                onValueChange={(value) => setFormData({ ...formData, site: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  {IMMUNIZATION_SITES.map((site) => (
                    <SelectItem key={site.code} value={site.display}>
                      {site.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Route</Label>
              <Select
                value={formData.route}
                onValueChange={(value) => setFormData({ ...formData, route: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route..." />
                </SelectTrigger>
                <SelectContent>
                  {IMMUNIZATION_ROUTES.map((route) => (
                    <SelectItem key={route.code} value={route.display}>
                      {route.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Administered By</Label>
            <Input
              placeholder="e.g., Dr. Smith, Nurse Johnson"
              value={formData.performer}
              onChange={(e) => setFormData({ ...formData, performer: e.target.value })}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
              placeholder="Additional notes, adverse reactions, or special instructions..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
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
          className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Add Vaccine'
          )}
        </Button>
      </div>
    </form>
  );
}
