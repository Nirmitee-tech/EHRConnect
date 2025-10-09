'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nirmitee.io/design-system';
import { ClinicalService } from '@/services/clinical.service';
import { ALLERGY_CATEGORIES, ALLERGY_CRITICALITY, REACTION_SEVERITY } from '@/constants/clinical.constants';

interface AllergyFormProps {
  patientId: string;
  patientName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AllergyForm({ patientId, patientName, onSuccess, onCancel }: AllergyFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    allergen: '',
    category: 'medication',
    criticality: 'low',
    reaction: '',
    severity: 'moderate'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.allergen) {
      alert('Please enter the allergen name');
      return;
    }

    setSaving(true);
    try {
      await ClinicalService.createAllergy(patientId, patientName, formData);
      onSuccess();
    } catch (error) {
      console.error('Error saving allergy:', error);
      alert('Failed to save allergy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Allergen <span className="text-red-500">*</span></Label>
        <Input
          placeholder="e.g., Penicillin, Peanuts, Latex"
          value={formData.allergen}
          onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALLERGY_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Criticality</Label>
        <Select 
          value={formData.criticality} 
          onValueChange={(value) => setFormData({ ...formData, criticality: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALLERGY_CRITICALITY.map((crit) => (
              <SelectItem key={crit.value} value={crit.value}>
                {crit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Reaction (optional)</Label>
        <Input
          placeholder="e.g., Rash, Anaphylaxis, Hives"
          value={formData.reaction}
          onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
        />
      </div>

      {formData.reaction && (
        <div>
          <Label>Reaction Severity</Label>
          <Select 
            value={formData.severity} 
            onValueChange={(value) => setFormData({ ...formData, severity: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REACTION_SEVERITY.map((sev) => (
                <SelectItem key={sev.value} value={sev.value}>
                  {sev.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
            'Add Allergy'
          )}
        </Button>
      </div>
    </form>
  );
}
