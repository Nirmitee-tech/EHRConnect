import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, Activity, Heart, Thermometer, Wind, Droplet, Weight as WeightIcon, Ruler, AlertCircle, Info, Sparkles, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, Button, Input, Label } from '@nirmitee.io/design-system';
import { VitalsFormData } from '../types';

interface VitalsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: VitalsFormData) => Promise<void>;
  editData?: VitalsFormData | null;
  mode?: 'create' | 'edit';
  recentVitals?: any[]; // For showing recent history
}

interface ValidationResult {
  isValid: boolean;
  status: 'normal' | 'warning' | 'critical' | 'empty';
  message: string;
}

export function VitalsDrawer({ open, onOpenChange, onSave, editData, mode = 'create', recentVitals = [] }: VitalsDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
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

  // Debounced form data for validation
  const [debouncedFormData, setDebouncedFormData] = useState(formData);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounce form data updates for validation
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFormData(formData);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData]);

  // Load edit data when provided
  useEffect(() => {
    if (editData && mode === 'edit') {
      setFormData(editData);
      setDebouncedFormData(editData);
    } else if (!open) {
      // Reset form when drawer closes
      const emptyForm = {
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
      };
      setFormData(emptyForm);
      setDebouncedFormData(emptyForm);
      setNotes('');
      setRecordedAt(new Date().toISOString().slice(0, 16));
    }
  }, [editData, mode, open]);

  // Validation functions
  const validateBP = (sys: string, dia: string): ValidationResult => {
    if (!sys && !dia) return { isValid: true, status: 'empty', message: '' };
    const sysNum = parseFloat(sys);
    const diaNum = parseFloat(dia);
    if (isNaN(sysNum) || isNaN(diaNum)) return { isValid: false, status: 'warning', message: 'Both values required' };

    if (sysNum >= 180 || diaNum >= 120) {
      return { isValid: true, status: 'critical', message: 'Hypertensive Crisis - Immediate attention needed!' };
    } else if (sysNum < 70 || diaNum < 40) {
      return { isValid: true, status: 'critical', message: 'Critically Low - Immediate attention needed!' };
    } else if (sysNum > 140 || diaNum > 90) {
      return { isValid: true, status: 'warning', message: 'Elevated (Stage 2 Hypertension)' };
    } else if (sysNum < 90 || diaNum < 60) {
      return { isValid: true, status: 'warning', message: 'Low blood pressure (Hypotension)' };
    }
    return { isValid: true, status: 'normal', message: 'Normal range' };
  };

  const validateHeartRate = (value: string): ValidationResult => {
    if (!value) return { isValid: true, status: 'empty', message: '' };
    const num = parseFloat(value);
    if (isNaN(num)) return { isValid: false, status: 'warning', message: 'Invalid value' };

    if (num > 120 || num < 50) {
      return { isValid: true, status: 'critical', message: num > 120 ? 'Severe Tachycardia' : 'Severe Bradycardia' };
    } else if (num > 100 || num < 60) {
      return { isValid: true, status: 'warning', message: num > 100 ? 'Tachycardia' : 'Bradycardia' };
    }
    return { isValid: true, status: 'normal', message: 'Normal range' };
  };

  const validateTemperature = (value: string): ValidationResult => {
    if (!value) return { isValid: true, status: 'empty', message: '' };
    const num = parseFloat(value);
    if (isNaN(num)) return { isValid: false, status: 'warning', message: 'Invalid value' };

    if (num >= 39.5 || num < 35) {
      return { isValid: true, status: 'critical', message: num >= 39.5 ? 'High Fever' : 'Hypothermia' };
    } else if (num > 38 || num < 36) {
      return { isValid: true, status: 'warning', message: num > 38 ? 'Fever' : 'Low Temperature' };
    }
    return { isValid: true, status: 'normal', message: 'Normal range' };
  };

  const validateRespiratoryRate = (value: string): ValidationResult => {
    if (!value) return { isValid: true, status: 'empty', message: '' };
    const num = parseFloat(value);
    if (isNaN(num)) return { isValid: false, status: 'warning', message: 'Invalid value' };

    if (num > 24 || num < 10) {
      return { isValid: true, status: 'critical', message: 'Critical - Requires attention' };
    } else if (num > 20 || num < 12) {
      return { isValid: true, status: 'warning', message: 'Outside normal range' };
    }
    return { isValid: true, status: 'normal', message: 'Normal range' };
  };

  const validateOxygenSat = (value: string): ValidationResult => {
    if (!value) return { isValid: true, status: 'empty', message: '' };
    const num = parseFloat(value);
    if (isNaN(num)) return { isValid: false, status: 'warning', message: 'Invalid value' };

    if (num < 90) {
      return { isValid: true, status: 'critical', message: 'Critical Hypoxemia - Urgent!' };
    } else if (num < 95) {
      return { isValid: true, status: 'warning', message: 'Low oxygen saturation' };
    }
    return { isValid: true, status: 'normal', message: 'Normal range' };
  };

  // Get validation results (using debounced data)
  const bpValidation = validateBP(debouncedFormData.bloodPressureSystolic, debouncedFormData.bloodPressureDiastolic);
  const hrValidation = validateHeartRate(debouncedFormData.heartRate);
  const tempValidation = validateTemperature(debouncedFormData.temperature);
  const rrValidation = validateRespiratoryRate(debouncedFormData.respiratoryRate);
  const o2Validation = validateOxygenSat(debouncedFormData.oxygenSaturation);

  // Calculate BMI (using debounced data)
  const bmi = useMemo(() => {
    const weight = parseFloat(debouncedFormData.weight);
    const height = parseFloat(debouncedFormData.height);
    if (weight && height && height > 0) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  }, [debouncedFormData.weight, debouncedFormData.height]);

  const getBMIStatus = (bmiValue: number) => {
    if (bmiValue < 16) return { status: 'critical', label: 'Severely Underweight' };
    if (bmiValue < 18.5) return { status: 'warning', label: 'Underweight' };
    if (bmiValue < 25) return { status: 'normal', label: 'Normal Weight' };
    if (bmiValue < 30) return { status: 'warning', label: 'Overweight' };
    return { status: 'critical', label: 'Obese' };
  };

  // Quick fill normal values
  const fillNormalValues = () => {
    setFormData({
      bloodPressureSystolic: '120',
      bloodPressureDiastolic: '80',
      heartRate: '72',
      temperature: '37.0',
      respiratoryRate: '16',
      oxygenSaturation: '98',
      weight: formData.weight || '70',
      height: formData.height || '170'
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...formData, recordedAt, notes } as any);
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
      setNotes('');
      setRecordedAt(new Date().toISOString().slice(0, 16));
    } finally {
      setSaving(false);
    }
  };

  const hasAnyValue = Object.values(formData).some(v => v !== '');
  const hasWarningOrCritical = [bpValidation, hrValidation, tempValidation, rrValidation, o2Validation]
    .some(v => v.status === 'warning' || v.status === 'critical');

  // Render input with validation
  const VitalInput = ({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    unit,
    validation,
    step = "1",
    normalRange
  }: any) => {
    const getInputStyle = () => {
      if (validation.status === 'critical') return 'border-red-500 bg-red-50';
      if (validation.status === 'warning') return 'border-orange-400 bg-orange-50';
      if (validation.status === 'normal') return 'border-green-500 bg-green-50';
      return 'border-gray-300';
    };

    const getStatusColor = () => {
      if (validation.status === 'critical') return 'text-red-600';
      if (validation.status === 'warning') return 'text-orange-600';
      if (validation.status === 'normal') return 'text-green-600';
      return 'text-gray-500';
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="h-4 w-4 text-gray-600" />
            {label}
          </Label>
          {validation.status !== 'empty' && (
            <div className="group relative">
              <Info className="h-3 w-3 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute z-20 right-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg w-48">
                <div className="font-semibold mb-1">Normal Range</div>
                <div className="text-gray-300">{normalRange}</div>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <Input
            type="number"
            step={step}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`pr-12 ${getInputStyle()}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
            {unit}
          </div>
        </div>
        {validation.message && (
          <div className={`flex items-center gap-1 text-xs font-medium ${getStatusColor()}`}>
            {(validation.status === 'critical' || validation.status === 'warning') && (
              <AlertCircle className="h-3 w-3" />
            )}
            {validation.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="2xl" className="overflow-y-auto">
        <DrawerHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                {mode === 'edit' ? 'Edit Vitals' : 'Record Vitals'}
              </DrawerTitle>
              <p className="text-xs text-gray-500 mt-1">Real-time validation with clinical alerts</p>
            </div>
            <button
              onClick={fillNormalValues}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Fill Normal
            </button>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  Recorded Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  value={recordedAt}
                  onChange={(e) => setRecordedAt(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Blood Pressure
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2">Systolic</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                  className={`pr-16 ${bpValidation.status === 'critical' ? 'border-red-500 bg-red-50' :
                      bpValidation.status === 'warning' ? 'border-orange-400 bg-orange-50' :
                        bpValidation.status === 'normal' ? 'border-green-500 bg-green-50' : ''
                    }`}
                />
                <div className="absolute right-3 top-9 text-xs font-medium text-gray-500">mmHg</div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2">Diastolic</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                  className={`pr-16 ${bpValidation.status === 'critical' ? 'border-red-500 bg-red-50' :
                      bpValidation.status === 'warning' ? 'border-orange-400 bg-orange-50' :
                        bpValidation.status === 'normal' ? 'border-green-500 bg-green-50' : ''
                    }`}
                />
                <div className="absolute right-3 top-9 text-xs font-medium text-gray-500">mmHg</div>
              </div>
            </div>
            {bpValidation.message && (
              <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${bpValidation.status === 'critical' ? 'text-red-600' :
                  bpValidation.status === 'warning' ? 'text-orange-600' :
                    'text-green-600'
                }`}>
                {(bpValidation.status === 'critical' || bpValidation.status === 'warning') && (
                  <AlertCircle className="h-4 w-4" />
                )}
                {bpValidation.message}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">Normal: 90-140 / 60-90 mmHg</div>
          </div>

          {/* Vital Signs Grid */}
          <div className="grid grid-cols-2 gap-4">
            <VitalInput
              label="Heart Rate"
              icon={Heart}
              value={formData.heartRate}
              onChange={(e: any) => setFormData({ ...formData, heartRate: e.target.value })}
              placeholder="72"
              unit="bpm"
              validation={hrValidation}
              normalRange="60-100 bpm"
            />
            <VitalInput
              label="Temperature"
              icon={Thermometer}
              value={formData.temperature}
              onChange={(e: any) => setFormData({ ...formData, temperature: e.target.value })}
              placeholder="37.0"
              unit="°C"
              step="0.1"
              validation={tempValidation}
              normalRange="36-38°C"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <VitalInput
              label="Respiratory Rate"
              icon={Wind}
              value={formData.respiratoryRate}
              onChange={(e: any) => setFormData({ ...formData, respiratoryRate: e.target.value })}
              placeholder="16"
              unit="/min"
              validation={rrValidation}
              normalRange="12-20 /min"
            />
            <VitalInput
              label="O2 Saturation"
              icon={Droplet}
              value={formData.oxygenSaturation}
              onChange={(e: any) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
              placeholder="98"
              unit="%"
              validation={o2Validation}
              normalRange="95-100%"
            />
          </div>

          {/* Body Measurements */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Body Measurements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <WeightIcon className="h-4 w-4 text-gray-600" />
                  Weight
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">kg</div>
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Ruler className="h-4 w-4 text-gray-600" />
                  Height
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">cm</div>
                </div>
              </div>
            </div>

            {/* BMI Display */}
            {bmi && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">BMI (Calculated)</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${parseFloat(bmi) < 16 || parseFloat(bmi) > 30 ? 'text-red-600' :
                        parseFloat(bmi) < 18.5 || parseFloat(bmi) > 25 ? 'text-orange-600' :
                          'text-green-600'
                      }`}>
                      {bmi}
                    </span>
                    <span className="text-xs text-gray-500">kg/m²</span>
                  </div>
                </div>
                {parseFloat(bmi) && (
                  <div className={`mt-2 text-xs font-medium ${parseFloat(bmi) < 16 || parseFloat(bmi) > 30 ? 'text-red-600' :
                      parseFloat(bmi) < 18.5 || parseFloat(bmi) > 25 ? 'text-orange-600' :
                        'text-green-600'
                    }`}>
                    {getBMIStatus(parseFloat(bmi)).label}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-semibold mb-2">Additional Notes (Optional)</Label>
            <textarea
              placeholder="Add any additional observations or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Warning banner */}
          {hasWarningOrCritical && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Abnormal Values Detected</h4>
                  <p className="text-xs text-red-700 mt-1">
                    Some vital signs are outside normal ranges. Please review before saving.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasAnyValue}
              className="flex-1 bg-primary hover:opacity-90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {mode === 'edit' ? 'Update' : 'Save'} Vitals
                </>
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
