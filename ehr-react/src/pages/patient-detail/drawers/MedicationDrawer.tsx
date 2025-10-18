import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet as Drawer, Sheet as DrawerContent, Sheet as DrawerHeader, Sheet as DrawerTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MedicationFormData } from '../types';

interface MedicationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MedicationFormData) => Promise<void>;
}

export function MedicationDrawer({ open, onOpenChange, onSave }: MedicationDrawerProps) {
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!formData.medication || !formData.dosageValue) return;

    setSaving(true);
    try {
      await onSave(formData);
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md" className="overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Prescribe Medication</DrawerTitle>
        </DrawerHeader>
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
