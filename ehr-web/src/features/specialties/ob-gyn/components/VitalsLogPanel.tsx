/**
 * VitalsLogPanel - Comprehensive Prenatal Vitals Tracking
 * 
 * Clinical micro-features:
 * - Weight gain tracking with IOM guidelines visualization
 * - Blood pressure trending with preeclampsia alerts
 * - Fundal height measurement vs gestational age
 * - Heart rate and respiratory rate logging
 * - Edema assessment documentation
 * - Visual charts and trend analysis
 * - Alert system for abnormal values
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Activity,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Scale,
  Thermometer,
  Ruler,
  Save,
  Download,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface VitalsLogPanelProps {
  patientId: string;
  episodeId?: string;
  prePregnancyWeight?: number;
  height?: number; // in inches
  gestationalAge?: string;
  onUpdate?: () => void;
}

interface VitalsEntry {
  id: string;
  date: string;
  time: string;
  gestationalAge: string;
  weight?: number;
  weightUnit: 'lbs' | 'kg';
  bpSystolic?: number;
  bpDiastolic?: number;
  pulse?: number;
  respiratoryRate?: number;
  temperature?: number;
  tempUnit: 'F' | 'C';
  fundalHeight?: number;
  fetalHeartRate?: number;
  fetalPosition?: string;
  edema: 'none' | 'trace' | '1+' | '2+' | '3+' | '4+';
  reflexes?: string;
  urineProtein?: 'negative' | 'trace' | '1+' | '2+' | '3+' | '4+';
  urineGlucose?: 'negative' | 'trace' | '1+' | '2+' | '3+' | '4+';
  urineKetones?: 'negative' | 'trace' | '1+' | '2+' | '3+';
  notes?: string;
  recordedBy?: string;
}

// IOM Weight Gain Guidelines by BMI category
const WEIGHT_GAIN_GUIDELINES = {
  underweight: { min: 28, max: 40, weekly2nd3rd: { min: 1.0, max: 1.3 } },
  normal: { min: 25, max: 35, weekly2nd3rd: { min: 0.8, max: 1.0 } },
  overweight: { min: 15, max: 25, weekly2nd3rd: { min: 0.5, max: 0.7 } },
  obese: { min: 11, max: 20, weekly2nd3rd: { min: 0.4, max: 0.6 } },
};

const getBMICategory = (bmi: number): keyof typeof WEIGHT_GAIN_GUIDELINES => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

const calculateBMI = (weightLbs: number, heightInches: number): number => {
  return (weightLbs / (heightInches * heightInches)) * 703;
};

export function VitalsLogPanel({
  patientId,
  episodeId,
  prePregnancyWeight,
  height,
  gestationalAge,
  onUpdate,
}: VitalsLogPanelProps) {
  const [entries, setEntries] = useState<VitalsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingEntry, setEditingEntry] = useState<VitalsEntry | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<VitalsEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    gestationalAge: gestationalAge || '',
    weightUnit: 'lbs',
    tempUnit: 'F',
    edema: 'none',
    urineProtein: 'negative',
    urineGlucose: 'negative',
    urineKetones: 'negative',
  });

  // Mock data - would be fetched from API
  useEffect(() => {
    setIsLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setEntries([
        {
          id: '1',
          date: '2025-01-15',
          time: '10:30',
          gestationalAge: '12w 0d',
          weight: 145,
          weightUnit: 'lbs',
          bpSystolic: 118,
          bpDiastolic: 72,
          pulse: 78,
          respiratoryRate: 16,
          temperature: 98.6,
          tempUnit: 'F',
          fundalHeight: undefined, // Not measurable this early
          fetalHeartRate: 162,
          edema: 'none',
          urineProtein: 'negative',
          urineGlucose: 'negative',
          urineKetones: 'negative',
          notes: 'First prenatal visit, all vitals normal',
        },
        {
          id: '2',
          date: '2025-02-12',
          time: '09:15',
          gestationalAge: '16w 0d',
          weight: 150,
          weightUnit: 'lbs',
          bpSystolic: 116,
          bpDiastolic: 70,
          pulse: 80,
          respiratoryRate: 16,
          temperature: 98.4,
          tempUnit: 'F',
          fundalHeight: 15,
          fetalHeartRate: 150,
          fetalPosition: 'Vertex',
          edema: 'none',
          urineProtein: 'negative',
          urineGlucose: 'negative',
          urineKetones: 'negative',
        },
        {
          id: '3',
          date: '2025-03-12',
          time: '11:00',
          gestationalAge: '20w 0d',
          weight: 156,
          weightUnit: 'lbs',
          bpSystolic: 120,
          bpDiastolic: 74,
          pulse: 82,
          respiratoryRate: 18,
          temperature: 98.6,
          tempUnit: 'F',
          fundalHeight: 19,
          fetalHeartRate: 145,
          fetalPosition: 'Vertex',
          edema: 'trace',
          urineProtein: 'negative',
          urineGlucose: 'trace',
          urineKetones: 'negative',
          notes: 'Mild dependent edema noted, counseled on foot elevation',
        },
        {
          id: '4',
          date: '2025-04-09',
          time: '14:30',
          gestationalAge: '24w 0d',
          weight: 162,
          weightUnit: 'lbs',
          bpSystolic: 128,
          bpDiastolic: 82,
          pulse: 85,
          respiratoryRate: 18,
          temperature: 98.8,
          tempUnit: 'F',
          fundalHeight: 24,
          fetalHeartRate: 148,
          fetalPosition: 'Vertex',
          edema: '1+',
          urineProtein: 'trace',
          urineGlucose: 'negative',
          urineKetones: 'negative',
          notes: 'Elevated BP noted, will monitor closely. Schedule 3hr GTT.',
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, [patientId, episodeId]);

  // Calculate weight gain statistics
  const weightStats = useMemo(() => {
    if (!prePregnancyWeight || entries.length === 0) return null;

    const latestEntry = entries.find(e => e.weight);
    if (!latestEntry?.weight) return null;

    const totalGain = latestEntry.weight - prePregnancyWeight;
    const bmi = height ? calculateBMI(prePregnancyWeight, height) : null;
    const bmiCategory = bmi ? getBMICategory(bmi) : 'normal';
    const guidelines = WEIGHT_GAIN_GUIDELINES[bmiCategory];

    // Parse gestational age to weeks
    const gaMatch = latestEntry.gestationalAge.match(/(\d+)w/);
    const currentWeeks = gaMatch ? parseInt(gaMatch[1]) : 0;

    // Calculate expected weight gain
    let expectedMinGain = 0;
    let expectedMaxGain = 0;
    
    if (currentWeeks <= 13) {
      // First trimester: 1-5 lbs total
      expectedMinGain = 1;
      expectedMaxGain = 5;
    } else {
      // Second/third trimester: first trimester + weekly rate
      const secondThirdWeeks = currentWeeks - 13;
      expectedMinGain = 1 + (secondThirdWeeks * guidelines.weekly2nd3rd.min);
      expectedMaxGain = 5 + (secondThirdWeeks * guidelines.weekly2nd3rd.max);
    }

    return {
      totalGain,
      prePregnancyWeight,
      currentWeight: latestEntry.weight,
      bmi,
      bmiCategory,
      guidelines,
      currentWeeks,
      expectedMinGain,
      expectedMaxGain,
      isOnTrack: totalGain >= expectedMinGain && totalGain <= expectedMaxGain,
      isLow: totalGain < expectedMinGain,
      isHigh: totalGain > expectedMaxGain,
    };
  }, [entries, prePregnancyWeight, height]);

  // Check for BP alerts
  const bpAlerts = useMemo(() => {
    const alerts: { type: 'warning' | 'critical'; message: string; entry: VitalsEntry }[] = [];
    
    entries.forEach(entry => {
      if (entry.bpSystolic && entry.bpDiastolic) {
        if (entry.bpSystolic >= 160 || entry.bpDiastolic >= 110) {
          alerts.push({
            type: 'critical',
            message: `Severe hypertension: ${entry.bpSystolic}/${entry.bpDiastolic} on ${entry.date}`,
            entry,
          });
        } else if (entry.bpSystolic >= 140 || entry.bpDiastolic >= 90) {
          alerts.push({
            type: 'warning',
            message: `Elevated BP: ${entry.bpSystolic}/${entry.bpDiastolic} on ${entry.date}`,
            entry,
          });
        }
      }
    });

    return alerts;
  }, [entries]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entryToSave: VitalsEntry = {
        id: editingEntry?.id || Date.now().toString(),
        date: newEntry.date!,
        time: newEntry.time!,
        gestationalAge: newEntry.gestationalAge!,
        weight: newEntry.weight,
        weightUnit: newEntry.weightUnit as 'lbs' | 'kg',
        bpSystolic: newEntry.bpSystolic,
        bpDiastolic: newEntry.bpDiastolic,
        pulse: newEntry.pulse,
        respiratoryRate: newEntry.respiratoryRate,
        temperature: newEntry.temperature,
        tempUnit: newEntry.tempUnit as 'F' | 'C',
        fundalHeight: newEntry.fundalHeight,
        fetalHeartRate: newEntry.fetalHeartRate,
        fetalPosition: newEntry.fetalPosition,
        edema: newEntry.edema as VitalsEntry['edema'],
        reflexes: newEntry.reflexes,
        urineProtein: newEntry.urineProtein as VitalsEntry['urineProtein'],
        urineGlucose: newEntry.urineGlucose as VitalsEntry['urineGlucose'],
        urineKetones: newEntry.urineKetones as VitalsEntry['urineKetones'],
        notes: newEntry.notes,
      };

      if (editingEntry) {
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? entryToSave : e));
      } else {
        setEntries(prev => [...prev, entryToSave].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }

      setIsDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      onUpdate?.();
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      gestationalAge: gestationalAge || '',
      weightUnit: 'lbs',
      tempUnit: 'F',
      edema: 'none',
      urineProtein: 'negative',
      urineGlucose: 'negative',
      urineKetones: 'negative',
    });
  };

  const handleEdit = (entry: VitalsEntry) => {
    setEditingEntry(entry);
    setNewEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vitals entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
      onUpdate?.();
    }
  };

  const getBPStatusColor = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return 'text-gray-500';
    if (systolic >= 160 || diastolic >= 110) return 'text-red-600 font-bold';
    if (systolic >= 140 || diastolic >= 90) return 'text-orange-600 font-semibold';
    if (systolic >= 130 || diastolic >= 85) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-pink-600" />
          <h2 className="text-lg font-semibold">Prenatal Vitals Log</h2>
          <Badge variant="outline">{entries.length} entries</Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingEntry(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Log Vitals
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Vitals' : 'Log New Vitals'}</DialogTitle>
              <DialogDescription>
                Record comprehensive prenatal vitals with all measurements
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Date/Time/GA Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEntry.date}
                    onChange={e => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newEntry.time}
                    onChange={e => setNewEntry(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Gestational Age</Label>
                  <Input
                    placeholder="e.g., 24w 3d"
                    value={newEntry.gestationalAge}
                    onChange={e => setNewEntry(prev => ({ ...prev, gestationalAge: e.target.value }))}
                  />
                </div>
              </div>

              {/* Weight & BP Row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label>Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Weight"
                      value={newEntry.weight || ''}
                      onChange={e => setNewEntry(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                    />
                    <Select
                      value={newEntry.weightUnit}
                      onValueChange={value => setNewEntry(prev => ({ ...prev, weightUnit: value as 'lbs' | 'kg' }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>BP Systolic</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={newEntry.bpSystolic || ''}
                    onChange={e => setNewEntry(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label>BP Diastolic</Label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={newEntry.bpDiastolic || ''}
                    onChange={e => setNewEntry(prev => ({ ...prev, bpDiastolic: parseInt(e.target.value) || undefined }))}
                  />
                </div>
              </div>

              {/* Pulse, RR, Temp Row */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Pulse (bpm)</Label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={newEntry.pulse || ''}
                    onChange={e => setNewEntry(prev => ({ ...prev, pulse: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label>Resp Rate</Label>
                  <Input
                    type="number"
                    placeholder="16"
                    value={newEntry.respiratoryRate || ''}
                    onChange={e => setNewEntry(prev => ({ ...prev, respiratoryRate: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Temperature</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={newEntry.temperature || ''}
                      onChange={e => setNewEntry(prev => ({ ...prev, temperature: parseFloat(e.target.value) || undefined }))}
                    />
                    <Select
                      value={newEntry.tempUnit}
                      onValueChange={value => setNewEntry(prev => ({ ...prev, tempUnit: value as 'F' | 'C' }))}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F">°F</SelectItem>
                        <SelectItem value="C">°C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Obstetric Measurements */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Fundal Height (cm)</Label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={newEntry.fundalHeight || ''}
                    onChange={e => setNewEntry(prev => ({ ...prev, fundalHeight: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label>Fetal Heart Rate</Label>
                  <Input
                    type="number"
                    placeholder="140"
                    value={newEntry.fetalHeartRate || ''}
                    onChange={e => setNewEntry(prev => ({ ...prev, fetalHeartRate: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label>Fetal Position</Label>
                  <Select
                    value={newEntry.fetalPosition || ''}
                    onValueChange={value => setNewEntry(prev => ({ ...prev, fetalPosition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vertex">Vertex</SelectItem>
                      <SelectItem value="Breech">Breech</SelectItem>
                      <SelectItem value="Transverse">Transverse</SelectItem>
                      <SelectItem value="Oblique">Oblique</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Edema */}
              <div>
                <Label>Edema</Label>
                <Select
                  value={newEntry.edema}
                  onValueChange={value => setNewEntry(prev => ({ ...prev, edema: value as VitalsEntry['edema'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="trace">Trace</SelectItem>
                    <SelectItem value="1+">1+</SelectItem>
                    <SelectItem value="2+">2+</SelectItem>
                    <SelectItem value="3+">3+</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Urinalysis */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Urine Protein</Label>
                  <Select
                    value={newEntry.urineProtein}
                    onValueChange={value => setNewEntry(prev => ({ ...prev, urineProtein: value as VitalsEntry['urineProtein'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="trace">Trace</SelectItem>
                      <SelectItem value="1+">1+</SelectItem>
                      <SelectItem value="2+">2+</SelectItem>
                      <SelectItem value="3+">3+</SelectItem>
                      <SelectItem value="4+">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urine Glucose</Label>
                  <Select
                    value={newEntry.urineGlucose}
                    onValueChange={value => setNewEntry(prev => ({ ...prev, urineGlucose: value as VitalsEntry['urineGlucose'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="trace">Trace</SelectItem>
                      <SelectItem value="1+">1+</SelectItem>
                      <SelectItem value="2+">2+</SelectItem>
                      <SelectItem value="3+">3+</SelectItem>
                      <SelectItem value="4+">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urine Ketones</Label>
                  <Select
                    value={newEntry.urineKetones}
                    onValueChange={value => setNewEntry(prev => ({ ...prev, urineKetones: value as VitalsEntry['urineKetones'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="trace">Trace</SelectItem>
                      <SelectItem value="1+">1+</SelectItem>
                      <SelectItem value="2+">2+</SelectItem>
                      <SelectItem value="3+">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Clinical Notes</Label>
                <Textarea
                  placeholder="Add any relevant clinical notes..."
                  value={newEntry.notes || ''}
                  onChange={e => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingEntry ? 'Update' : 'Save'} Vitals
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {bpAlerts.length > 0 && (
        <div className="space-y-2">
          {bpAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg',
                alert.type === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
              )}
            >
              <AlertTriangle className={cn('h-5 w-5', alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600')} />
              <span className={cn('font-medium', alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800')}>
                {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weight">Weight Tracking</TabsTrigger>
          <TabsTrigger value="history">Full History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Latest Weight */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Current Weight</span>
                  </div>
                  {weightStats && (
                    weightStats.isOnTrack ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )
                  )}
                </div>
                <div className="text-2xl font-bold mt-1">
                  {entries.find(e => e.weight)?.weight || '-'} lbs
                </div>
                {weightStats && (
                  <div className="text-sm text-gray-600">
                    {weightStats.totalGain > 0 ? '+' : ''}{weightStats.totalGain.toFixed(1)} lbs gain
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest BP */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600">Blood Pressure</span>
                </div>
                <div className={cn(
                  'text-2xl font-bold mt-1',
                  getBPStatusColor(entries[0]?.bpSystolic, entries[0]?.bpDiastolic)
                )}>
                  {entries[0]?.bpSystolic && entries[0]?.bpDiastolic 
                    ? `${entries[0].bpSystolic}/${entries[0].bpDiastolic}`
                    : '-'
                  }
                </div>
                <div className="text-sm text-gray-600">mmHg</div>
              </CardContent>
            </Card>

            {/* Fetal Heart Rate */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-pink-600" />
                  <span className="text-sm text-gray-600">Fetal HR</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {entries[0]?.fetalHeartRate || '-'}
                </div>
                <div className="text-sm text-gray-600">bpm</div>
              </CardContent>
            </Card>

            {/* Fundal Height */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Fundal Height</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {entries[0]?.fundalHeight || '-'} cm
                </div>
                <div className="text-sm text-gray-600">
                  GA: {entries[0]?.gestationalAge || '-'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>GA</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>BP</TableHead>
                    <TableHead>Pulse</TableHead>
                    <TableHead>FHR</TableHead>
                    <TableHead>FH</TableHead>
                    <TableHead>Edema</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 5).map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell>{entry.gestationalAge}</TableCell>
                      <TableCell>{entry.weight ? `${entry.weight} ${entry.weightUnit}` : '-'}</TableCell>
                      <TableCell className={getBPStatusColor(entry.bpSystolic, entry.bpDiastolic)}>
                        {entry.bpSystolic && entry.bpDiastolic 
                          ? `${entry.bpSystolic}/${entry.bpDiastolic}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{entry.pulse || '-'}</TableCell>
                      <TableCell>{entry.fetalHeartRate || '-'}</TableCell>
                      <TableCell>{entry.fundalHeight || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={entry.edema === 'none' ? 'outline' : 'secondary'}>
                          {entry.edema}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {entries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        No vitals recorded yet. Click &quot;Log Vitals&quot; to add the first entry.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weight Tracking Tab */}
        <TabsContent value="weight" className="space-y-4">
          {weightStats ? (
            <>
              {/* Weight Gain Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    Weight Gain Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Pre-Pregnancy</div>
                      <div className="text-2xl font-bold">{weightStats.prePregnancyWeight} lbs</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Current</div>
                      <div className="text-2xl font-bold text-blue-700">{weightStats.currentWeight} lbs</div>
                    </div>
                    <div className={cn(
                      'text-center p-4 rounded-lg',
                      weightStats.isOnTrack ? 'bg-green-50' : 'bg-yellow-50'
                    )}>
                      <div className="text-sm text-gray-600">Total Gain</div>
                      <div className={cn(
                        'text-2xl font-bold',
                        weightStats.isOnTrack ? 'text-green-700' : 'text-yellow-700'
                      )}>
                        {weightStats.totalGain > 0 ? '+' : ''}{weightStats.totalGain.toFixed(1)} lbs
                      </div>
                    </div>
                  </div>

                  {/* IOM Guidelines */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">IOM Guidelines (BMI: {weightStats.bmi?.toFixed(1)} - {weightStats.bmiCategory})</h4>
                    <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                      {/* Expected range */}
                      <div
                        className="absolute h-full bg-green-200"
                        style={{
                          left: `${(weightStats.expectedMinGain / weightStats.guidelines.max) * 100}%`,
                          width: `${((weightStats.expectedMaxGain - weightStats.expectedMinGain) / weightStats.guidelines.max) * 100}%`,
                        }}
                      />
                      {/* Current position */}
                      <div
                        className={cn(
                          'absolute w-1 h-full',
                          weightStats.isOnTrack ? 'bg-green-600' : 'bg-yellow-600'
                        )}
                        style={{
                          left: `${Math.min((weightStats.totalGain / weightStats.guidelines.max) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-600">
                      <span>0 lbs</span>
                      <span>Expected: {weightStats.expectedMinGain.toFixed(1)}-{weightStats.expectedMaxGain.toFixed(1)} lbs at {weightStats.currentWeeks}w</span>
                      <span>{weightStats.guidelines.max} lbs</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Target total gain: </span>
                      {weightStats.guidelines.min}-{weightStats.guidelines.max} lbs by delivery
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weight History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weight History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>GA</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Total Gain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.filter(e => e.weight).map((entry, idx, arr) => {
                        const prevWeight = idx < arr.length - 1 ? arr[idx + 1].weight : prePregnancyWeight;
                        const change = entry.weight && prevWeight ? entry.weight - prevWeight : null;
                        const totalGain = entry.weight && prePregnancyWeight ? entry.weight - prePregnancyWeight : null;

                        return (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.gestationalAge}</TableCell>
                            <TableCell className="font-medium">{entry.weight} lbs</TableCell>
                            <TableCell>
                              {change !== null && (
                                <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {change > 0 ? '+' : ''}{change.toFixed(1)} lbs
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {totalGain !== null && (
                                <span className="font-medium">
                                  {totalGain > 0 ? '+' : ''}{totalGain.toFixed(1)} lbs
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Scale className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Enter pre-pregnancy weight and log vitals to see weight gain tracking</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Full History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Complete Vitals History</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge>{entry.gestationalAge}</Badge>
                        <span className="font-medium">{entry.date}</span>
                        <span className="text-gray-500">{entry.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-2 font-medium">{entry.weight ? `${entry.weight} ${entry.weightUnit}` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">BP:</span>
                        <span className={cn('ml-2 font-medium', getBPStatusColor(entry.bpSystolic, entry.bpDiastolic))}>
                          {entry.bpSystolic && entry.bpDiastolic ? `${entry.bpSystolic}/${entry.bpDiastolic}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Pulse:</span>
                        <span className="ml-2 font-medium">{entry.pulse || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">FHR:</span>
                        <span className="ml-2 font-medium">{entry.fetalHeartRate || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">FH:</span>
                        <span className="ml-2 font-medium">{entry.fundalHeight ? `${entry.fundalHeight}cm` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Position:</span>
                        <span className="ml-2 font-medium">{entry.fetalPosition || '-'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Edema:</span>
                        <Badge variant="outline" className="ml-2">{entry.edema}</Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Protein:</span>
                        <Badge variant={entry.urineProtein === 'negative' ? 'outline' : 'secondary'} className="ml-2">
                          {entry.urineProtein}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Glucose:</span>
                        <Badge variant={entry.urineGlucose === 'negative' ? 'outline' : 'secondary'} className="ml-2">
                          {entry.urineGlucose}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Ketones:</span>
                        <Badge variant={entry.urineKetones === 'negative' ? 'outline' : 'secondary'} className="ml-2">
                          {entry.urineKetones}
                        </Badge>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <span className="text-gray-500">Notes: </span>
                        {entry.notes}
                      </div>
                    )}
                  </div>
                ))}

                {entries.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No vitals recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
