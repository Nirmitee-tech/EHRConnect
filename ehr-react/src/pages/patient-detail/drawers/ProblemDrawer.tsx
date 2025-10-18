import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet as Drawer, Sheet as DrawerContent, Sheet as DrawerHeader, Sheet as DrawerTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProblemFormData } from '../types';

interface ProblemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProblemFormData) => Promise<void>;
}

export function ProblemDrawer({ open, onOpenChange, onSave }: ProblemDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProblemFormData>({
    condition: '',
    category: 'problem-list-item',
    severity: '',
    onsetDate: new Date().toISOString().split('T')[0]
  });

  const handleSave = async () => {
    if (!formData.condition) return;

    setSaving(true);
    try {
      await onSave(formData);
      setFormData({
        condition: '',
        category: 'problem-list-item',
        severity: '',
        onsetDate: new Date().toISOString().split('T')[0]
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md" className="overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Add Problem / Condition</DrawerTitle>
        </DrawerHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label>Condition / Problem <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Enter condition name"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="problem-list-item">Problem List Item</SelectItem>
                <SelectItem value="encounter-diagnosis">Encounter Diagnosis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Severity</Label>
            <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Onset Date</Label>
            <Input
              type="date"
              value={formData.onsetDate}
              onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.condition} className="flex-1 bg-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Problem'
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
