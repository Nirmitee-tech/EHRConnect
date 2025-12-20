/**
 * LabsTrackingPanel - Comprehensive Prenatal Labs Tracking
 * 
 * Tracks all required prenatal labs organized by trimester:
 * - First trimester: Blood type, antibody screen, CBC, HIV, Hep B, Rubella, etc.
 * - Second trimester: Glucose tolerance, Quad screen, amnio results
 * - Third trimester: GBS, repeat labs for at-risk patients
 * - Additional: GDM monitoring, preeclampsia labs
 */

import React, { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import {
  TestTube,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Save,
  Calendar,
  TrendingUp,
  Droplet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { obgynService } from '@/services/obgyn.service';

interface LabsTrackingPanelProps {
  patientId: string;
  episodeId?: string;
  gestationalAge?: string;
  hasGDM?: boolean;
  hasPreeclampsia?: boolean;
  onUpdate?: () => void;
}

interface LabResult {
  id: string;
  labName: string;
  category: string;
  trimester: 1 | 2 | 3 | 'any';
  orderDate?: string;
  resultDate?: string;
  status: 'not_ordered' | 'ordered' | 'pending' | 'resulted' | 'cancelled';
  value?: string;
  unit?: string;
  referenceRange?: string;
  interpretation: 'normal' | 'abnormal' | 'critical' | 'pending';
  notes?: string;
}

interface GlucoseLog {
  id: string;
  date: string;
  time: string;
  type: 'fasting' | 'pre_meal' | 'post_meal_1h' | 'post_meal_2h' | 'bedtime';
  value: number;
  notes?: string;
}

const PRENATAL_LABS_TEMPLATE: Omit<LabResult, 'id' | 'status' | 'interpretation'>[] = [
  // First Trimester
  { labName: 'Blood Type & Rh', category: 'Blood Bank', trimester: 1, unit: '', referenceRange: '' },
  { labName: 'Antibody Screen', category: 'Blood Bank', trimester: 1, unit: '', referenceRange: 'Negative' },
  { labName: 'CBC with Differential', category: 'Hematology', trimester: 1, unit: '', referenceRange: '' },
  { labName: 'Hemoglobin', category: 'Hematology', trimester: 1, unit: 'g/dL', referenceRange: '11.0-14.0' },
  { labName: 'Hematocrit', category: 'Hematology', trimester: 1, unit: '%', referenceRange: '33-40' },
  { labName: 'Platelet Count', category: 'Hematology', trimester: 1, unit: 'K/uL', referenceRange: '150-400' },
  { labName: 'HIV Screen', category: 'Infectious Disease', trimester: 1, unit: '', referenceRange: 'Non-reactive' },
  { labName: 'Hepatitis B Surface Antigen', category: 'Infectious Disease', trimester: 1, unit: '', referenceRange: 'Negative' },
  { labName: 'Hepatitis C Antibody', category: 'Infectious Disease', trimester: 1, unit: '', referenceRange: 'Negative' },
  { labName: 'Rubella IgG', category: 'Infectious Disease', trimester: 1, unit: '', referenceRange: 'Immune' },
  { labName: 'Syphilis (RPR/VDRL)', category: 'Infectious Disease', trimester: 1, unit: '', referenceRange: 'Non-reactive' },
  { labName: 'Varicella IgG', category: 'Infectious Disease', trimester: 1, unit: '', referenceRange: 'Immune' },
  { labName: 'Urinalysis', category: 'Urine', trimester: 1, unit: '', referenceRange: '' },
  { labName: 'Urine Culture', category: 'Urine', trimester: 1, unit: '', referenceRange: 'No growth' },
  { labName: 'TSH', category: 'Thyroid', trimester: 1, unit: 'mIU/L', referenceRange: '0.1-2.5' },
  
  // Second Trimester
  { labName: '1-Hour Glucose Challenge (GCT)', category: 'Glucose', trimester: 2, unit: 'mg/dL', referenceRange: '<140' },
  { labName: '3-Hour GTT (if GCT abnormal)', category: 'Glucose', trimester: 2, unit: '', referenceRange: '' },
  { labName: 'AFP/Quad Screen', category: 'Genetic', trimester: 2, unit: '', referenceRange: '' },
  { labName: 'Repeat Hemoglobin', category: 'Hematology', trimester: 2, unit: 'g/dL', referenceRange: '10.5-14.0' },
  { labName: 'Repeat Antibody Screen (if Rh-)', category: 'Blood Bank', trimester: 2, unit: '', referenceRange: 'Negative' },
  
  // Third Trimester
  { labName: 'Group B Strep Culture', category: 'Infectious Disease', trimester: 3, unit: '', referenceRange: 'Negative' },
  { labName: 'Repeat Hemoglobin', category: 'Hematology', trimester: 3, unit: 'g/dL', referenceRange: '10.5-14.0' },
  { labName: 'Repeat HIV (high-risk)', category: 'Infectious Disease', trimester: 3, unit: '', referenceRange: 'Non-reactive' },
  { labName: 'Repeat Syphilis (high-risk)', category: 'Infectious Disease', trimester: 3, unit: '', referenceRange: 'Non-reactive' },
];

const PREECLAMPSIA_LABS: Omit<LabResult, 'id' | 'status' | 'interpretation'>[] = [
  { labName: 'AST', category: 'Liver', trimester: 'any', unit: 'U/L', referenceRange: '0-35' },
  { labName: 'ALT', category: 'Liver', trimester: 'any', unit: 'U/L', referenceRange: '0-35' },
  { labName: 'LDH', category: 'Liver', trimester: 'any', unit: 'U/L', referenceRange: '100-190' },
  { labName: 'Total Bilirubin', category: 'Liver', trimester: 'any', unit: 'mg/dL', referenceRange: '0.1-1.2' },
  { labName: 'Creatinine', category: 'Kidney', trimester: 'any', unit: 'mg/dL', referenceRange: '0.4-0.9' },
  { labName: 'Uric Acid', category: 'Kidney', trimester: 'any', unit: 'mg/dL', referenceRange: '2.0-5.5' },
  { labName: 'Urine Protein/Creatinine Ratio', category: 'Urine', trimester: 'any', unit: '', referenceRange: '<0.3' },
  { labName: '24-Hour Urine Protein', category: 'Urine', trimester: 'any', unit: 'mg/24h', referenceRange: '<300' },
];

export function LabsTrackingPanel({
  patientId,
  episodeId,
  gestationalAge,
  hasGDM,
  hasPreeclampsia,
  onUpdate,
}: LabsTrackingPanelProps) {
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [glucoseLogs, setGlucoseLogs] = useState<GlucoseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingLab, setIsAddingLab] = useState(false);
  const [isAddingGlucose, setIsAddingGlucose] = useState(false);
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);

  const [newGlucose, setNewGlucose] = useState<Partial<GlucoseLog>>({
    date: new Date().toISOString().split('T')[0],
    type: 'fasting',
  });

  useEffect(() => {
    loadLabs();
  }, [patientId, episodeId]);

  const loadLabs = async () => {
    setIsLoading(true);
    try {
      const data = await obgynService.getLabsTracking(patientId, episodeId);
      if (data && data.labs) {
        setLabs(data.labs);
        setGlucoseLogs(data.glucoseLogs || []);
      } else {
        // Initialize with template if no data exists
        initializeLabs();
      }
    } catch (error) {
      console.error('Failed to load labs:', error);
      initializeLabs();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeLabs = () => {
    const initialLabs: LabResult[] = PRENATAL_LABS_TEMPLATE.map((template, idx) => ({
      ...template,
      id: `lab-${idx}`,
      status: 'not_ordered',
      interpretation: 'pending',
    }));
    
    // Add preeclampsia labs if indicated
    if (hasPreeclampsia) {
      PREECLAMPSIA_LABS.forEach((template, idx) => {
        initialLabs.push({
          ...template,
          id: `pe-lab-${idx}`,
          status: 'not_ordered',
          interpretation: 'pending',
        });
      });
    }
    
    setLabs(initialLabs);
  };

  const saveLabs = async () => {
    setIsSaving(true);
    try {
      await obgynService.saveLabsTracking(patientId, {
        episodeId,
        labs,
        glucoseLogs,
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save labs:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLab = (labId: string, updates: Partial<LabResult>) => {
    setLabs(labs.map(lab => 
      lab.id === labId ? { ...lab, ...updates } : lab
    ));
  };

  const addGlucoseLog = () => {
    if (!newGlucose.date || !newGlucose.value) return;

    const log: GlucoseLog = {
      id: `glucose-${Date.now()}`,
      date: newGlucose.date,
      time: newGlucose.time || new Date().toTimeString().slice(0, 5),
      type: newGlucose.type as GlucoseLog['type'],
      value: newGlucose.value,
      notes: newGlucose.notes,
    };

    setGlucoseLogs([log, ...glucoseLogs]);
    setIsAddingGlucose(false);
    setNewGlucose({
      date: new Date().toISOString().split('T')[0],
      type: 'fasting',
    });
  };

  const getCompletionStats = () => {
    const total = labs.length;
    const ordered = labs.filter(l => l.status !== 'not_ordered').length;
    const resulted = labs.filter(l => l.status === 'resulted').length;
    const abnormal = labs.filter(l => l.interpretation === 'abnormal' || l.interpretation === 'critical').length;
    
    return { total, ordered, resulted, abnormal };
  };

  const getLabsByTrimester = (trimester: 1 | 2 | 3 | 'any') => {
    return labs.filter(l => l.trimester === trimester);
  };

  const getStatusBadge = (status: LabResult['status']) => {
    switch (status) {
      case 'resulted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Resulted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'ordered':
        return <Badge className="bg-blue-100 text-blue-800"><Calendar className="h-3 w-3 mr-1" />Ordered</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">Not Ordered</Badge>;
    }
  };

  const getInterpretationBadge = (interpretation: LabResult['interpretation'], value?: string) => {
    if (!value || interpretation === 'pending') return null;
    
    switch (interpretation) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
      case 'abnormal':
        return <Badge className="bg-yellow-100 text-yellow-800">Abnormal</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return null;
    }
  };

  const getGlucoseTarget = (type: GlucoseLog['type']) => {
    switch (type) {
      case 'fasting':
        return { target: '<95', warning: 95, critical: 105 };
      case 'pre_meal':
        return { target: '<95', warning: 95, critical: 105 };
      case 'post_meal_1h':
        return { target: '<140', warning: 140, critical: 180 };
      case 'post_meal_2h':
        return { target: '<120', warning: 120, critical: 150 };
      case 'bedtime':
        return { target: '<120', warning: 120, critical: 150 };
      default:
        return { target: '<120', warning: 120, critical: 150 };
    }
  };

  const stats = getCompletionStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="h-5 w-5 text-pink-500" />
              Prenatal Labs
            </CardTitle>
            <Button 
              size="sm" 
              onClick={saveLabs}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Labs Complete</span>
                <span className="font-medium">{stats.resulted}/{stats.total}</span>
              </div>
              <Progress value={(stats.resulted / stats.total) * 100} className="h-2" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{stats.ordered}</div>
                <div className="text-xs text-muted-foreground">Ordered</div>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg font-bold text-green-600">{stats.resulted}</div>
                <div className="text-xs text-muted-foreground">Resulted</div>
              </div>
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-lg font-bold text-red-600">{stats.abnormal}</div>
                <div className="text-xs text-muted-foreground">Abnormal</div>
              </div>
            </div>

            {/* Alerts */}
            {stats.abnormal > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  {stats.abnormal} abnormal result{stats.abnormal > 1 ? 's' : ''} require review
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Labs by Trimester */}
      <Card>
        <CardContent className="pt-4">
          <Accordion type="multiple" defaultValue={['t1', 't2', 't3']} className="space-y-2">
            {/* First Trimester */}
            <AccordionItem value="t1" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">T1</Badge>
                  <span className="font-medium">First Trimester Labs</span>
                  <span className="text-sm text-muted-foreground">
                    ({getLabsByTrimester(1).filter(l => l.status === 'resulted').length}/{getLabsByTrimester(1).length} complete)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lab</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getLabsByTrimester(1).map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.labName}</TableCell>
                        <TableCell>
                          <Select
                            value={lab.status}
                            onValueChange={(value) => updateLab(lab.id, { 
                              status: value as LabResult['status'] 
                            })}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_ordered">Not Ordered</SelectItem>
                              <SelectItem value="ordered">Ordered</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="resulted">Resulted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {lab.status === 'resulted' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="w-24 h-8"
                                value={lab.value || ''}
                                onChange={(e) => updateLab(lab.id, { value: e.target.value })}
                                placeholder="Value"
                              />
                              {lab.unit && <span className="text-xs text-muted-foreground">{lab.unit}</span>}
                              {getInterpretationBadge(lab.interpretation, lab.value)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lab.referenceRange || '-'}
                        </TableCell>
                        <TableCell>
                          {lab.status === 'resulted' && (
                            <Select
                              value={lab.interpretation}
                              onValueChange={(value) => updateLab(lab.id, { 
                                interpretation: value as LabResult['interpretation'] 
                              })}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="abnormal">Abnormal</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            {/* Second Trimester */}
            <AccordionItem value="t2" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">T2</Badge>
                  <span className="font-medium">Second Trimester Labs</span>
                  <span className="text-sm text-muted-foreground">
                    ({getLabsByTrimester(2).filter(l => l.status === 'resulted').length}/{getLabsByTrimester(2).length} complete)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lab</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getLabsByTrimester(2).map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.labName}</TableCell>
                        <TableCell>
                          <Select
                            value={lab.status}
                            onValueChange={(value) => updateLab(lab.id, { 
                              status: value as LabResult['status'] 
                            })}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_ordered">Not Ordered</SelectItem>
                              <SelectItem value="ordered">Ordered</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="resulted">Resulted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {lab.status === 'resulted' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="w-24 h-8"
                                value={lab.value || ''}
                                onChange={(e) => updateLab(lab.id, { value: e.target.value })}
                                placeholder="Value"
                              />
                              {lab.unit && <span className="text-xs text-muted-foreground">{lab.unit}</span>}
                              {getInterpretationBadge(lab.interpretation, lab.value)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lab.referenceRange || '-'}
                        </TableCell>
                        <TableCell>
                          {lab.status === 'resulted' && (
                            <Select
                              value={lab.interpretation}
                              onValueChange={(value) => updateLab(lab.id, { 
                                interpretation: value as LabResult['interpretation'] 
                              })}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="abnormal">Abnormal</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            {/* Third Trimester */}
            <AccordionItem value="t3" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">T3</Badge>
                  <span className="font-medium">Third Trimester Labs</span>
                  <span className="text-sm text-muted-foreground">
                    ({getLabsByTrimester(3).filter(l => l.status === 'resulted').length}/{getLabsByTrimester(3).length} complete)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lab</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getLabsByTrimester(3).map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.labName}</TableCell>
                        <TableCell>
                          <Select
                            value={lab.status}
                            onValueChange={(value) => updateLab(lab.id, { 
                              status: value as LabResult['status'] 
                            })}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_ordered">Not Ordered</SelectItem>
                              <SelectItem value="ordered">Ordered</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="resulted">Resulted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {lab.status === 'resulted' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="w-24 h-8"
                                value={lab.value || ''}
                                onChange={(e) => updateLab(lab.id, { value: e.target.value })}
                                placeholder="Value"
                              />
                              {lab.unit && <span className="text-xs text-muted-foreground">{lab.unit}</span>}
                              {getInterpretationBadge(lab.interpretation, lab.value)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lab.referenceRange || '-'}
                        </TableCell>
                        <TableCell>
                          {lab.status === 'resulted' && (
                            <Select
                              value={lab.interpretation}
                              onValueChange={(value) => updateLab(lab.id, { 
                                interpretation: value as LabResult['interpretation'] 
                              })}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="abnormal">Abnormal</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            {/* Preeclampsia Labs (if applicable) */}
            {hasPreeclampsia && getLabsByTrimester('any').length > 0 && (
              <AccordionItem value="pe" className="border rounded-lg px-4 border-red-200 dark:border-red-800">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">PE</Badge>
                    <span className="font-medium">Preeclampsia Monitoring Labs</span>
                    <span className="text-sm text-muted-foreground">
                      ({getLabsByTrimester('any').filter(l => l.status === 'resulted').length}/{getLabsByTrimester('any').length} complete)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lab</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getLabsByTrimester('any').map((lab) => (
                        <TableRow key={lab.id}>
                          <TableCell className="font-medium">{lab.labName}</TableCell>
                          <TableCell>
                            <Select
                              value={lab.status}
                              onValueChange={(value) => updateLab(lab.id, { 
                                status: value as LabResult['status'] 
                              })}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_ordered">Not Ordered</SelectItem>
                                <SelectItem value="ordered">Ordered</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="resulted">Resulted</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {lab.status === 'resulted' ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  className="w-24 h-8"
                                  value={lab.value || ''}
                                  onChange={(e) => updateLab(lab.id, { value: e.target.value })}
                                  placeholder="Value"
                                />
                                {lab.unit && <span className="text-xs text-muted-foreground">{lab.unit}</span>}
                                {getInterpretationBadge(lab.interpretation, lab.value)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {lab.referenceRange || '-'}
                          </TableCell>
                          <TableCell>
                            {lab.status === 'resulted' && (
                              <Select
                                value={lab.interpretation}
                                onValueChange={(value) => updateLab(lab.id, { 
                                  interpretation: value as LabResult['interpretation'] 
                                })}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="abnormal">Abnormal</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>

      {/* GDM Glucose Monitoring (if applicable) */}
      {hasGDM && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplet className="h-5 w-5 text-pink-500" />
                Glucose Monitoring (GDM)
              </CardTitle>
              <Dialog open={isAddingGlucose} onOpenChange={setIsAddingGlucose}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Reading
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Glucose Reading</DialogTitle>
                    <DialogDescription>
                      Record blood glucose measurement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newGlucose.date || ''}
                          onChange={(e) => setNewGlucose({ ...newGlucose, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={newGlucose.time || ''}
                          onChange={(e) => setNewGlucose({ ...newGlucose, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newGlucose.type}
                          onValueChange={(value) => setNewGlucose({ 
                            ...newGlucose, 
                            type: value as GlucoseLog['type'] 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fasting">Fasting</SelectItem>
                            <SelectItem value="pre_meal">Pre-meal</SelectItem>
                            <SelectItem value="post_meal_1h">1h Post-meal</SelectItem>
                            <SelectItem value="post_meal_2h">2h Post-meal</SelectItem>
                            <SelectItem value="bedtime">Bedtime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Value (mg/dL)</Label>
                        <Input
                          type="number"
                          value={newGlucose.value || ''}
                          onChange={(e) => setNewGlucose({ 
                            ...newGlucose, 
                            value: parseInt(e.target.value) 
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingGlucose(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addGlucoseLog}>Log</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {glucoseLogs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Droplet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No glucose readings logged</p>
                <p className="text-xs">Target: Fasting &lt;95, 1h post-meal &lt;140, 2h &lt;120</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-muted-foreground">Avg Fasting</div>
                    <div className="text-lg font-bold">
                      {Math.round(
                        glucoseLogs
                          .filter(g => g.type === 'fasting')
                          .reduce((sum, g) => sum + g.value, 0) / 
                        Math.max(glucoseLogs.filter(g => g.type === 'fasting').length, 1)
                      )} mg/dL
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-muted-foreground">Avg 1h PP</div>
                    <div className="text-lg font-bold">
                      {Math.round(
                        glucoseLogs
                          .filter(g => g.type === 'post_meal_1h')
                          .reduce((sum, g) => sum + g.value, 0) / 
                        Math.max(glucoseLogs.filter(g => g.type === 'post_meal_1h').length, 1)
                      ) || '-'} mg/dL
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-muted-foreground">Out of Range</div>
                    <div className="text-lg font-bold text-red-600">
                      {glucoseLogs.filter(g => {
                        const target = getGlucoseTarget(g.type);
                        return g.value >= target.warning;
                      }).length}
                    </div>
                  </div>
                </div>

                {/* Recent Readings */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {glucoseLogs.slice(0, 10).map((log) => {
                      const target = getGlucoseTarget(log.type);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.date).toLocaleDateString()} {log.time}
                          </TableCell>
                          <TableCell className="capitalize">
                            {log.type.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              'font-medium',
                              log.value >= target.critical ? 'text-red-600' :
                              log.value >= target.warning ? 'text-yellow-600' :
                              'text-green-600'
                            )}>
                              {log.value} mg/dL
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {target.target}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
