import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, Button, Input, Label } from '@ehrconnect/design-system';
import { VitalsFormData } from '../types';

interface VitalsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: VitalsFormData) => Promise<void>;
}

export function VitalsDrawer({ open, onOpenChange, onSave }: VitalsDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<VitalsFormData>({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setFormData({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="2xl" className="overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Record Vitals</DrawerTitle>
        </DrawerHeader>
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Blood Pressure - Systolic</Label>
              <Input
                type="number"
                placeholder="120"
                value={formData.bloodPressureSystolic}
                onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
              />
            </div>
            <div>
              <Label>Blood Pressure - Diastolic</Label>
              <Input
                type="number"
                placeholder="80"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heart Rate (bpm)</Label>
              <Input
                type="number"
                placeholder="72"
                value={formData.heartRate}
                onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
              />
            </div>
            <div>
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="37.0"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Respiratory Rate (/min)</Label>
              <Input
                type="number"
                placeholder="16"
                value={formData.respiratoryRate}
                onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
              />
            </div>
            <div>
              <Label>O2 Saturation (%)</Label>
              <Input
                type="number"
                placeholder="98"
                value={formData.oxygenSaturation}
                onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="70.0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                placeholder="170"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Vitals'
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
