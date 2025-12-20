/**
 * GeneticScreeningPanel - First Trimester Genetic Screening
 * 
 * Tracks:
 * - NIPT (Non-Invasive Prenatal Testing) results
 * - NT (Nuchal Translucency) measurements
 * - First trimester combined screening
 * - CVS/Amniocentesis results
 * - Carrier screening
 * - Genetic counseling documentation
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
import { Textarea } from '@/components/ui/textarea';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dna,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  XCircle,
  Calendar,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { obgynService } from '@/services/obgyn.service';

interface GeneticScreeningPanelProps {
  patientId: string;
  episodeId?: string;
  gestationalAge?: string;
  onUpdate?: () => void;
}

interface NIPTResult {
  id: string;
  orderDate: string;
  resultDate?: string;
  status: 'ordered' | 'pending' | 'resulted' | 'cancelled';
  labName?: string;
  testType: string;
  fetalFraction?: number;
  results: {
    trisomy21: ResultStatus;
    trisomy18: ResultStatus;
    trisomy13: ResultStatus;
    sexChromosomes?: ResultStatus;
    sexDetermined?: string;
    microdeletions?: Record<string, ResultStatus>;
  };
  notes?: string;
}

interface NTResult {
  id: string;
  measurementDate: string;
  gestationalAge: string;
  crownRumpLength: number;
  ntMeasurement: number;
  ntPercentile?: number;
  nasalBone: 'present' | 'absent' | 'hypoplastic' | 'not_visualized';
  tricuspidRegurgitation: boolean;
  ductusVenosus: 'normal' | 'abnormal' | 'not_assessed';
  heartRate: number;
  riskT21?: string;
  riskT18?: string;
  notes?: string;
}

interface InvasiveTestResult {
  id: string;
  testType: 'cvs' | 'amniocentesis';
  procedureDate: string;
  gestationalAge: string;
  indication: string;
  provider: string;
  complications?: string[];
  resultDate?: string;
  status: 'scheduled' | 'completed' | 'resulted' | 'cancelled';
  karyotype?: string;
  microarray?: string;
  singleGeneTests?: string[];
  notes?: string;
}

interface CarrierScreeningResult {
  id: string;
  orderDate: string;
  resultDate?: string;
  status: 'ordered' | 'pending' | 'resulted';
  panelType: string;
  conditions: {
    name: string;
    result: 'negative' | 'carrier' | 'affected' | 'inconclusive';
    partnerTested?: boolean;
    partnerResult?: string;
  }[];
}

type ResultStatus = 'low_risk' | 'high_risk' | 'no_result' | 'not_tested' | 'pending';

interface GeneticCounseling {
  id: string;
  date: string;
  counselor: string;
  reason: string;
  topics: string[];
  decisions: string[];
  followUp?: string;
  notes?: string;
}

export function GeneticScreeningPanel({
  patientId,
  episodeId,
  gestationalAge,
  onUpdate,
}: GeneticScreeningPanelProps) {
  const [niptResults, setNiptResults] = useState<NIPTResult[]>([]);
  const [ntResults, setNtResults] = useState<NTResult[]>([]);
  const [invasiveTests, setInvasiveTests] = useState<InvasiveTestResult[]>([]);
  const [carrierScreening, setCarrierScreening] = useState<CarrierScreeningResult[]>([]);
  const [counselingSessions, setCounselingSessions] = useState<GeneticCounseling[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('nipt');
  const [isAddingNIPT, setIsAddingNIPT] = useState(false);
  const [isAddingNT, setIsAddingNT] = useState(false);
  const [isAddingInvasive, setIsAddingInvasive] = useState(false);
  const [isAddingCarrier, setIsAddingCarrier] = useState(false);

  // Form states
  const [newNIPT, setNewNIPT] = useState<Partial<NIPTResult>>({
    status: 'ordered',
    testType: 'standard',
    results: {
      trisomy21: 'pending',
      trisomy18: 'pending',
      trisomy13: 'pending',
    },
  });

  const [newNT, setNewNT] = useState<Partial<NTResult>>({
    nasalBone: 'present',
    tricuspidRegurgitation: false,
    ductusVenosus: 'normal',
  });

  const [newInvasive, setNewInvasive] = useState<Partial<InvasiveTestResult>>({
    testType: 'amniocentesis',
    status: 'scheduled',
  });

  useEffect(() => {
    loadScreeningData();
  }, [patientId, episodeId]);

  const loadScreeningData = async () => {
    setIsLoading(true);
    try {
      const data = await obgynService.getGeneticScreening(patientId, episodeId);
      if (data) {
        setNiptResults(data.nipt || []);
        setNtResults(data.nt || []);
        setInvasiveTests(data.invasive || []);
        setCarrierScreening(data.carrier || []);
        setCounselingSessions(data.counseling || []);
      }
    } catch (error) {
      console.error('Failed to load genetic screening:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveScreeningData = async () => {
    setIsSaving(true);
    try {
      await obgynService.saveGeneticScreening(patientId, {
        episodeId,
        nipt: niptResults,
        nt: ntResults,
        invasive: invasiveTests,
        carrier: carrierScreening,
        counseling: counselingSessions,
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save genetic screening:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNIPT = () => {
    if (!newNIPT.orderDate) return;

    const nipt: NIPTResult = {
      id: `nipt-${Date.now()}`,
      orderDate: newNIPT.orderDate,
      resultDate: newNIPT.resultDate,
      status: newNIPT.status as NIPTResult['status'],
      labName: newNIPT.labName,
      testType: newNIPT.testType || 'standard',
      fetalFraction: newNIPT.fetalFraction,
      results: newNIPT.results || {
        trisomy21: 'pending',
        trisomy18: 'pending',
        trisomy13: 'pending',
      },
      notes: newNIPT.notes,
    };

    setNiptResults([...niptResults, nipt]);
    setIsAddingNIPT(false);
    setNewNIPT({
      status: 'ordered',
      testType: 'standard',
      results: {
        trisomy21: 'pending',
        trisomy18: 'pending',
        trisomy13: 'pending',
      },
    });
  };

  const addNT = () => {
    if (!newNT.measurementDate || !newNT.ntMeasurement) return;

    const nt: NTResult = {
      id: `nt-${Date.now()}`,
      measurementDate: newNT.measurementDate,
      gestationalAge: newNT.gestationalAge || gestationalAge || '',
      crownRumpLength: newNT.crownRumpLength || 0,
      ntMeasurement: newNT.ntMeasurement,
      ntPercentile: newNT.ntPercentile,
      nasalBone: newNT.nasalBone as NTResult['nasalBone'],
      tricuspidRegurgitation: newNT.tricuspidRegurgitation || false,
      ductusVenosus: newNT.ductusVenosus as NTResult['ductusVenosus'],
      heartRate: newNT.heartRate || 0,
      riskT21: newNT.riskT21,
      riskT18: newNT.riskT18,
      notes: newNT.notes,
    };

    setNtResults([...ntResults, nt]);
    setIsAddingNT(false);
    setNewNT({
      nasalBone: 'present',
      tricuspidRegurgitation: false,
      ductusVenosus: 'normal',
    });
  };

  const addInvasive = () => {
    if (!newInvasive.procedureDate || !newInvasive.testType) return;

    const test: InvasiveTestResult = {
      id: `inv-${Date.now()}`,
      testType: newInvasive.testType as InvasiveTestResult['testType'],
      procedureDate: newInvasive.procedureDate,
      gestationalAge: newInvasive.gestationalAge || gestationalAge || '',
      indication: newInvasive.indication || '',
      provider: newInvasive.provider || '',
      status: newInvasive.status as InvasiveTestResult['status'],
      resultDate: newInvasive.resultDate,
      karyotype: newInvasive.karyotype,
      microarray: newInvasive.microarray,
      notes: newInvasive.notes,
    };

    setInvasiveTests([...invasiveTests, test]);
    setIsAddingInvasive(false);
    setNewInvasive({
      testType: 'amniocentesis',
      status: 'scheduled',
    });
  };

  const getResultBadge = (result: ResultStatus) => {
    switch (result) {
      case 'low_risk':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Low Risk
          </Badge>
        );
      case 'high_risk':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High Risk
          </Badge>
        );
      case 'no_result':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            No Result
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Not Tested
          </Badge>
        );
    }
  };

  const getScreeningProgress = () => {
    let completed = 0;
    let total = 3; // NIPT, NT, Carrier

    if (niptResults.some(n => n.status === 'resulted')) completed++;
    if (ntResults.length > 0) completed++;
    if (carrierScreening.some(c => c.status === 'resulted')) completed++;

    return (completed / total) * 100;
  };

  const hasHighRisk = () => {
    return niptResults.some(n => 
      n.results.trisomy21 === 'high_risk' ||
      n.results.trisomy18 === 'high_risk' ||
      n.results.trisomy13 === 'high_risk'
    ) || ntResults.some(nt => 
      nt.ntMeasurement > 3.5
    );
  };

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
              <Dna className="h-5 w-5 text-pink-500" />
              Genetic Screening
            </CardTitle>
            <Button 
              size="sm" 
              onClick={saveScreeningData}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Screening Progress</span>
                <span className="font-medium">{Math.round(getScreeningProgress())}%</span>
              </div>
              <Progress value={getScreeningProgress()} className="h-2" />
            </div>

            {hasHighRisk() && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  High-risk result detected - Genetic counseling recommended
                </span>
              </div>
            )}

            {/* Quick Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className={cn(
                'rounded-lg p-3 text-center border',
                niptResults.some(n => n.status === 'resulted') 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : niptResults.length > 0 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              )}>
                <div className="text-lg font-bold">NIPT</div>
                <div className="text-xs text-muted-foreground">
                  {niptResults.some(n => n.status === 'resulted') 
                    ? 'Complete' 
                    : niptResults.length > 0 
                      ? 'Pending'
                      : 'Not Done'}
                </div>
              </div>
              <div className={cn(
                'rounded-lg p-3 text-center border',
                ntResults.length > 0 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              )}>
                <div className="text-lg font-bold">NT Scan</div>
                <div className="text-xs text-muted-foreground">
                  {ntResults.length > 0 ? 'Complete' : 'Not Done'}
                </div>
              </div>
              <div className={cn(
                'rounded-lg p-3 text-center border',
                carrierScreening.some(c => c.status === 'resulted') 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : carrierScreening.length > 0 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              )}>
                <div className="text-lg font-bold">Carrier</div>
                <div className="text-xs text-muted-foreground">
                  {carrierScreening.some(c => c.status === 'resulted') 
                    ? 'Complete' 
                    : carrierScreening.length > 0 
                      ? 'Pending'
                      : 'Not Done'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Tabs */}
      <Card>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="nipt">NIPT</TabsTrigger>
              <TabsTrigger value="nt">NT Scan</TabsTrigger>
              <TabsTrigger value="invasive">CVS/Amnio</TabsTrigger>
              <TabsTrigger value="carrier">Carrier</TabsTrigger>
            </TabsList>

            {/* NIPT Tab */}
            <TabsContent value="nipt" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Non-Invasive Prenatal Testing</h3>
                <Dialog open={isAddingNIPT} onOpenChange={setIsAddingNIPT}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add NIPT
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add NIPT Result</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Order Date</Label>
                          <Input
                            type="date"
                            value={newNIPT.orderDate || ''}
                            onChange={(e) => setNewNIPT({ ...newNIPT, orderDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Result Date</Label>
                          <Input
                            type="date"
                            value={newNIPT.resultDate || ''}
                            onChange={(e) => setNewNIPT({ ...newNIPT, resultDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Status</Label>
                          <Select
                            value={newNIPT.status}
                            onValueChange={(value) => setNewNIPT({ 
                              ...newNIPT, 
                              status: value as NIPTResult['status'] 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ordered">Ordered</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="resulted">Resulted</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Fetal Fraction (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newNIPT.fetalFraction || ''}
                            onChange={(e) => setNewNIPT({ 
                              ...newNIPT, 
                              fetalFraction: parseFloat(e.target.value) 
                            })}
                          />
                        </div>
                      </div>
                      {newNIPT.status === 'resulted' && (
                        <>
                          <div className="border-t pt-4">
                            <Label className="text-base">Results</Label>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Trisomy 21</Label>
                              <Select
                                value={newNIPT.results?.trisomy21}
                                onValueChange={(value) => setNewNIPT({ 
                                  ...newNIPT, 
                                  results: { 
                                    ...newNIPT.results!, 
                                    trisomy21: value as ResultStatus 
                                  } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low_risk">Low Risk</SelectItem>
                                  <SelectItem value="high_risk">High Risk</SelectItem>
                                  <SelectItem value="no_result">No Result</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Trisomy 18</Label>
                              <Select
                                value={newNIPT.results?.trisomy18}
                                onValueChange={(value) => setNewNIPT({ 
                                  ...newNIPT, 
                                  results: { 
                                    ...newNIPT.results!, 
                                    trisomy18: value as ResultStatus 
                                  } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low_risk">Low Risk</SelectItem>
                                  <SelectItem value="high_risk">High Risk</SelectItem>
                                  <SelectItem value="no_result">No Result</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Trisomy 13</Label>
                              <Select
                                value={newNIPT.results?.trisomy13}
                                onValueChange={(value) => setNewNIPT({ 
                                  ...newNIPT, 
                                  results: { 
                                    ...newNIPT.results!, 
                                    trisomy13: value as ResultStatus 
                                  } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low_risk">Low Risk</SelectItem>
                                  <SelectItem value="high_risk">High Risk</SelectItem>
                                  <SelectItem value="no_result">No Result</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={newNIPT.notes || ''}
                          onChange={(e) => setNewNIPT({ ...newNIPT, notes: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingNIPT(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addNIPT}>Add</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {niptResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Dna className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No NIPT results recorded</p>
                  <p className="text-xs">Typically performed 10-13 weeks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {niptResults.map((nipt) => (
                    <div key={nipt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">NIPT - {nipt.testType}</div>
                          <div className="text-sm text-muted-foreground">
                            Ordered: {new Date(nipt.orderDate).toLocaleDateString()}
                            {nipt.resultDate && ` | Resulted: ${new Date(nipt.resultDate).toLocaleDateString()}`}
                          </div>
                        </div>
                        <Badge variant={nipt.status === 'resulted' ? 'default' : 'secondary'}>
                          {nipt.status}
                        </Badge>
                      </div>
                      {nipt.fetalFraction && (
                        <div className="text-sm mb-2">
                          Fetal Fraction: <span className={cn(
                            'font-medium',
                            nipt.fetalFraction < 4 ? 'text-red-500' : 'text-green-600'
                          )}>{nipt.fetalFraction}%</span>
                        </div>
                      )}
                      {nipt.status === 'resulted' && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">T21 (Down)</div>
                            {getResultBadge(nipt.results.trisomy21)}
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">T18 (Edwards)</div>
                            {getResultBadge(nipt.results.trisomy18)}
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">T13 (Patau)</div>
                            {getResultBadge(nipt.results.trisomy13)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* NT Scan Tab */}
            <TabsContent value="nt" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Nuchal Translucency Scan</h3>
                <Dialog open={isAddingNT} onOpenChange={setIsAddingNT}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add NT
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add NT Measurement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={newNT.measurementDate || ''}
                            onChange={(e) => setNewNT({ ...newNT, measurementDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Gestational Age</Label>
                          <Input
                            placeholder="e.g., 12w3d"
                            value={newNT.gestationalAge || ''}
                            onChange={(e) => setNewNT({ ...newNT, gestationalAge: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>CRL (mm)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newNT.crownRumpLength || ''}
                            onChange={(e) => setNewNT({ 
                              ...newNT, 
                              crownRumpLength: parseFloat(e.target.value) 
                            })}
                          />
                        </div>
                        <div>
                          <Label>NT (mm)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newNT.ntMeasurement || ''}
                            onChange={(e) => setNewNT({ 
                              ...newNT, 
                              ntMeasurement: parseFloat(e.target.value) 
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nasal Bone</Label>
                          <Select
                            value={newNT.nasalBone}
                            onValueChange={(value) => setNewNT({ 
                              ...newNT, 
                              nasalBone: value as NTResult['nasalBone'] 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="hypoplastic">Hypoplastic</SelectItem>
                              <SelectItem value="not_visualized">Not Visualized</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Heart Rate (bpm)</Label>
                          <Input
                            type="number"
                            value={newNT.heartRate || ''}
                            onChange={(e) => setNewNT({ 
                              ...newNT, 
                              heartRate: parseInt(e.target.value) 
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Risk T21</Label>
                          <Input
                            placeholder="e.g., 1:1000"
                            value={newNT.riskT21 || ''}
                            onChange={(e) => setNewNT({ ...newNT, riskT21: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Risk T18</Label>
                          <Input
                            placeholder="e.g., 1:5000"
                            value={newNT.riskT18 || ''}
                            onChange={(e) => setNewNT({ ...newNT, riskT18: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingNT(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addNT}>Add</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {ntResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No NT scan recorded</p>
                  <p className="text-xs">Typically performed 11-14 weeks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ntResults.map((nt) => (
                    <div key={nt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">NT Scan</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(nt.measurementDate).toLocaleDateString()} at {nt.gestationalAge}
                          </div>
                        </div>
                        <Badge className={cn(
                          nt.ntMeasurement > 3.5 
                            ? 'bg-red-100 text-red-800' 
                            : nt.ntMeasurement > 3.0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        )}>
                          NT: {nt.ntMeasurement} mm
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">CRL</div>
                          <div className="font-medium">{nt.crownRumpLength} mm</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Nasal Bone</div>
                          <div className="font-medium capitalize">{nt.nasalBone.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">T21 Risk</div>
                          <div className="font-medium">{nt.riskT21 || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">T18 Risk</div>
                          <div className="font-medium">{nt.riskT18 || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* CVS/Amnio Tab */}
            <TabsContent value="invasive" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Invasive Testing</h3>
                <Dialog open={isAddingInvasive} onOpenChange={setIsAddingInvasive}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Invasive Test</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Test Type</Label>
                          <Select
                            value={newInvasive.testType}
                            onValueChange={(value) => setNewInvasive({ 
                              ...newInvasive, 
                              testType: value as InvasiveTestResult['testType'] 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cvs">CVS</SelectItem>
                              <SelectItem value="amniocentesis">Amniocentesis</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select
                            value={newInvasive.status}
                            onValueChange={(value) => setNewInvasive({ 
                              ...newInvasive, 
                              status: value as InvasiveTestResult['status'] 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="resulted">Resulted</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Procedure Date</Label>
                          <Input
                            type="date"
                            value={newInvasive.procedureDate || ''}
                            onChange={(e) => setNewInvasive({ 
                              ...newInvasive, 
                              procedureDate: e.target.value 
                            })}
                          />
                        </div>
                        <div>
                          <Label>Gestational Age</Label>
                          <Input
                            placeholder="e.g., 16w0d"
                            value={newInvasive.gestationalAge || ''}
                            onChange={(e) => setNewInvasive({ 
                              ...newInvasive, 
                              gestationalAge: e.target.value 
                            })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Indication</Label>
                        <Input
                          placeholder="e.g., Advanced maternal age, abnormal NIPT"
                          value={newInvasive.indication || ''}
                          onChange={(e) => setNewInvasive({ 
                            ...newInvasive, 
                            indication: e.target.value 
                          })}
                        />
                      </div>
                      {newInvasive.status === 'resulted' && (
                        <>
                          <div>
                            <Label>Karyotype</Label>
                            <Input
                              placeholder="e.g., 46,XX"
                              value={newInvasive.karyotype || ''}
                              onChange={(e) => setNewInvasive({ 
                                ...newInvasive, 
                                karyotype: e.target.value 
                              })}
                            />
                          </div>
                          <div>
                            <Label>Microarray</Label>
                            <Input
                              placeholder="Normal / Abnormal / VUS"
                              value={newInvasive.microarray || ''}
                              onChange={(e) => setNewInvasive({ 
                                ...newInvasive, 
                                microarray: e.target.value 
                              })}
                            />
                          </div>
                        </>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingInvasive(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addInvasive}>Add</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {invasiveTests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No invasive testing performed</p>
                  <p className="text-xs">CVS: 10-13 weeks | Amnio: 15+ weeks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invasiveTests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">
                            {test.testType === 'cvs' ? 'CVS' : 'Amniocentesis'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(test.procedureDate).toLocaleDateString()} at {test.gestationalAge}
                          </div>
                        </div>
                        <Badge variant={test.status === 'resulted' ? 'default' : 'secondary'}>
                          {test.status}
                        </Badge>
                      </div>
                      {test.indication && (
                        <div className="text-sm mb-2">
                          <span className="text-muted-foreground">Indication:</span> {test.indication}
                        </div>
                      )}
                      {test.status === 'resulted' && (
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t">
                          <div>
                            <div className="text-muted-foreground">Karyotype</div>
                            <div className="font-medium">{test.karyotype || 'Pending'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Microarray</div>
                            <div className="font-medium">{test.microarray || 'Pending'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Carrier Screening Tab */}
            <TabsContent value="carrier" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Carrier Screening</h3>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Screening
                </Button>
              </div>

              {carrierScreening.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Dna className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No carrier screening performed</p>
                  <p className="text-xs">Can be done at any time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrierScreening.map((cs) => (
                    <div key={cs.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{cs.panelType}</div>
                          <div className="text-sm text-muted-foreground">
                            Ordered: {new Date(cs.orderDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={cs.status === 'resulted' ? 'default' : 'secondary'}>
                          {cs.status}
                        </Badge>
                      </div>
                      {cs.status === 'resulted' && cs.conditions.length > 0 && (
                        <div className="space-y-1">
                          {cs.conditions.filter(c => c.result === 'carrier').map((cond, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span>Carrier: {cond.name}</span>
                              {cond.partnerTested && (
                                <Badge variant="outline" className="text-xs">
                                  Partner: {cond.partnerResult || 'Not tested'}
                                </Badge>
                              )}
                            </div>
                          ))}
                          {cs.conditions.every(c => c.result === 'negative') && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              All conditions negative
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
