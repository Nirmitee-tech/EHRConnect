/**
 * PregnancyHistoryPanel - Pre-Pregnancy History & GTPAL
 * 
 * Comprehensive obstetric history tracking including:
 * - GTPAL (Gravida, Term, Preterm, Abortion, Living)
 * - Prior pregnancy details with outcomes
 * - Prior complications and risk factors
 * - Medical/surgical history relevant to pregnancy
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  History,
  Plus,
  Edit2,
  Save,
  AlertTriangle,
  Baby,
  Heart,
  Clock,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { obgynService } from '@/services/obgyn.service';

interface PregnancyHistoryPanelProps {
  patientId: string;
  episodeId?: string;
  onUpdate?: () => void;
}

interface PriorPregnancy {
  id: string;
  year: number;
  gestationalAge: string;
  outcome: 'term' | 'preterm' | 'miscarriage' | 'ectopic' | 'stillbirth' | 'termination';
  deliveryMode?: 'SVD' | 'cesarean' | 'vacuum' | 'forceps' | 'N/A';
  birthWeight?: number;
  sex?: 'male' | 'female' | 'unknown';
  complications: string[];
  notes?: string;
  living: boolean;
}

interface GTPAL {
  gravida: number;
  term: number;
  preterm: number;
  abortion: number;
  living: number;
}

interface RiskFactor {
  id: string;
  category: string;
  factor: string;
  severity: 'low' | 'moderate' | 'high';
  notes?: string;
}

const PREGNANCY_COMPLICATIONS = [
  'Gestational Diabetes',
  'Preeclampsia',
  'Eclampsia',
  'HELLP Syndrome',
  'Placenta Previa',
  'Placental Abruption',
  'Preterm Labor',
  'PPROM',
  'IUGR',
  'Oligohydramnios',
  'Polyhydramnios',
  'Cervical Insufficiency',
  'Postpartum Hemorrhage',
  'Cesarean Section',
  'Shoulder Dystocia',
  'Cord Prolapse',
  'Chorioamnionitis',
  'Venous Thromboembolism',
  'Depression/Anxiety',
  'None',
];

const RISK_FACTORS_BY_CATEGORY = {
  'Medical History': [
    'Chronic Hypertension',
    'Pre-existing Diabetes (Type 1)',
    'Pre-existing Diabetes (Type 2)',
    'Thyroid Disease',
    'Autoimmune Disease',
    'Kidney Disease',
    'Heart Disease',
    'Epilepsy',
    'Asthma',
    'Blood Clotting Disorder',
    'BMI > 35',
    'BMI < 18.5',
  ],
  'Reproductive History': [
    'Recurrent Miscarriage (≥3)',
    'Prior Preterm Birth',
    'Prior Stillbirth',
    'Prior Cesarean Section',
    'Cervical Surgery (LEEP/Cone)',
    'Uterine Anomaly',
    'Fibroids',
    'History of Infertility',
    'Prior TTTS',
    'Prior Preeclampsia',
  ],
  'Current Pregnancy': [
    'Advanced Maternal Age (≥35)',
    'IVF Conception',
    'Multiple Gestation',
    'Short Interpregnancy Interval',
    'Substance Use',
    'Smoking',
    'Rh Negative',
  ],
  'Social/Environmental': [
    'Domestic Violence Risk',
    'Food Insecurity',
    'Housing Instability',
    'Limited Social Support',
    'Transportation Barriers',
    'Language Barrier',
  ],
};

export function PregnancyHistoryPanel({
  patientId,
  episodeId,
  onUpdate,
}: PregnancyHistoryPanelProps) {
  const [gtpal, setGtpal] = useState<GTPAL>({
    gravida: 1,
    term: 0,
    preterm: 0,
    abortion: 0,
    living: 0,
  });
  const [priorPregnancies, setPriorPregnancies] = useState<PriorPregnancy[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [isAddingPregnancy, setIsAddingPregnancy] = useState(false);
  const [isAddingRisk, setIsAddingRisk] = useState(false);
  const [editingPregnancy, setEditingPregnancy] = useState<PriorPregnancy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New pregnancy form state
  const [newPregnancy, setNewPregnancy] = useState<Partial<PriorPregnancy>>({
    year: new Date().getFullYear() - 1,
    outcome: 'term',
    complications: [],
    living: true,
  });

  // New risk factor form state
  const [newRiskFactor, setNewRiskFactor] = useState<Partial<RiskFactor>>({
    category: 'Medical History',
    severity: 'moderate',
  });

  useEffect(() => {
    loadHistory();
  }, [patientId, episodeId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await obgynService.getPregnancyHistory(patientId, episodeId);
      if (data) {
        setGtpal(data.gtpal || gtpal);
        setPriorPregnancies(data.priorPregnancies || []);
        setRiskFactors(data.riskFactors || []);
      }
    } catch (error) {
      console.error('Failed to load pregnancy history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHistory = async () => {
    setIsSaving(true);
    try {
      await obgynService.savePregnancyHistory(patientId, {
        episodeId,
        gtpal,
        priorPregnancies,
        riskFactors,
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save pregnancy history:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addPregnancy = () => {
    if (!newPregnancy.year || !newPregnancy.outcome) return;

    const pregnancy: PriorPregnancy = {
      id: `preg-${Date.now()}`,
      year: newPregnancy.year,
      gestationalAge: newPregnancy.gestationalAge || '',
      outcome: newPregnancy.outcome as PriorPregnancy['outcome'],
      deliveryMode: newPregnancy.deliveryMode as PriorPregnancy['deliveryMode'],
      birthWeight: newPregnancy.birthWeight,
      sex: newPregnancy.sex as PriorPregnancy['sex'],
      complications: newPregnancy.complications || [],
      notes: newPregnancy.notes,
      living: newPregnancy.living ?? true,
    };

    setPriorPregnancies([...priorPregnancies, pregnancy]);
    recalculateGTPAL([...priorPregnancies, pregnancy]);
    setIsAddingPregnancy(false);
    setNewPregnancy({
      year: new Date().getFullYear() - 1,
      outcome: 'term',
      complications: [],
      living: true,
    });
  };

  const recalculateGTPAL = (pregnancies: PriorPregnancy[]) => {
    const term = pregnancies.filter(p => p.outcome === 'term').length;
    const preterm = pregnancies.filter(p => p.outcome === 'preterm').length;
    const abortion = pregnancies.filter(p => 
      ['miscarriage', 'ectopic', 'termination'].includes(p.outcome)
    ).length;
    const living = pregnancies.filter(p => p.living).length;

    setGtpal({
      gravida: pregnancies.length + 1, // +1 for current pregnancy
      term,
      preterm,
      abortion,
      living,
    });
  };

  const addRiskFactor = () => {
    if (!newRiskFactor.factor || !newRiskFactor.category) return;

    const risk: RiskFactor = {
      id: `risk-${Date.now()}`,
      category: newRiskFactor.category,
      factor: newRiskFactor.factor,
      severity: newRiskFactor.severity as RiskFactor['severity'],
      notes: newRiskFactor.notes,
    };

    setRiskFactors([...riskFactors, risk]);
    setIsAddingRisk(false);
    setNewRiskFactor({
      category: 'Medical History',
      severity: 'moderate',
    });
  };

  const removeRiskFactor = (id: string) => {
    setRiskFactors(riskFactors.filter(r => r.id !== id));
  };

  const getOutcomeBadgeColor = (outcome: PriorPregnancy['outcome']) => {
    switch (outcome) {
      case 'term':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'preterm':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'miscarriage':
      case 'ectopic':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'stillbirth':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'termination':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: RiskFactor['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const highRiskCount = riskFactors.filter(r => r.severity === 'high').length;

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
      {/* GTPAL Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-pink-500" />
              Obstetric History (GTPAL)
            </CardTitle>
            <Button 
              size="sm" 
              onClick={saveHistory}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* GTPAL Display */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {[
              { label: 'G', value: gtpal.gravida, color: 'bg-pink-100 text-pink-800', desc: 'Gravida' },
              { label: 'T', value: gtpal.term, color: 'bg-green-100 text-green-800', desc: 'Term' },
              { label: 'P', value: gtpal.preterm, color: 'bg-yellow-100 text-yellow-800', desc: 'Preterm' },
              { label: 'A', value: gtpal.abortion, color: 'bg-red-100 text-red-800', desc: 'Abortion' },
              { label: 'L', value: gtpal.living, color: 'bg-blue-100 text-blue-800', desc: 'Living' },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  'rounded-lg p-3 text-center',
                  item.color
                )}
              >
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs font-medium">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Risk Alert */}
          {highRiskCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {highRiskCount} high-risk factor{highRiskCount > 1 ? 's' : ''} identified
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prior Pregnancies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Baby className="h-5 w-5 text-pink-500" />
              Prior Pregnancies
            </CardTitle>
            <Dialog open={isAddingPregnancy} onOpenChange={setIsAddingPregnancy}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Prior Pregnancy</DialogTitle>
                  <DialogDescription>
                    Document a previous pregnancy outcome
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={newPregnancy.year || ''}
                        onChange={(e) => setNewPregnancy({ 
                          ...newPregnancy, 
                          year: parseInt(e.target.value) 
                        })}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <Label>Gestational Age</Label>
                      <Input
                        placeholder="e.g., 39w2d"
                        value={newPregnancy.gestationalAge || ''}
                        onChange={(e) => setNewPregnancy({ 
                          ...newPregnancy, 
                          gestationalAge: e.target.value 
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Outcome</Label>
                      <Select
                        value={newPregnancy.outcome}
                        onValueChange={(value) => setNewPregnancy({ 
                          ...newPregnancy, 
                          outcome: value as PriorPregnancy['outcome'],
                          living: !['miscarriage', 'ectopic', 'stillbirth', 'termination'].includes(value),
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="term">Term Delivery</SelectItem>
                          <SelectItem value="preterm">Preterm Delivery</SelectItem>
                          <SelectItem value="miscarriage">Miscarriage</SelectItem>
                          <SelectItem value="ectopic">Ectopic</SelectItem>
                          <SelectItem value="stillbirth">Stillbirth</SelectItem>
                          <SelectItem value="termination">Termination</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Delivery Mode</Label>
                      <Select
                        value={newPregnancy.deliveryMode || ''}
                        onValueChange={(value) => setNewPregnancy({ 
                          ...newPregnancy, 
                          deliveryMode: value as PriorPregnancy['deliveryMode'] 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SVD">SVD (Vaginal)</SelectItem>
                          <SelectItem value="cesarean">Cesarean</SelectItem>
                          <SelectItem value="vacuum">Vacuum</SelectItem>
                          <SelectItem value="forceps">Forceps</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {['term', 'preterm'].includes(newPregnancy.outcome || '') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Birth Weight (g)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 3200"
                          value={newPregnancy.birthWeight || ''}
                          onChange={(e) => setNewPregnancy({ 
                            ...newPregnancy, 
                            birthWeight: parseInt(e.target.value) 
                          })}
                        />
                      </div>
                      <div>
                        <Label>Sex</Label>
                        <Select
                          value={newPregnancy.sex || ''}
                          onValueChange={(value) => setNewPregnancy({ 
                            ...newPregnancy, 
                            sex: value as PriorPregnancy['sex'] 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Complications</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !newPregnancy.complications?.includes(value)) {
                          setNewPregnancy({ 
                            ...newPregnancy, 
                            complications: [...(newPregnancy.complications || []), value] 
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add complication..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PREGNANCY_COMPLICATIONS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newPregnancy.complications && newPregnancy.complications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newPregnancy.complications.map((c) => (
                          <Badge
                            key={c}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setNewPregnancy({
                              ...newPregnancy,
                              complications: newPregnancy.complications?.filter(comp => comp !== c)
                            })}
                          >
                            {c} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={newPregnancy.notes || ''}
                      onChange={(e) => setNewPregnancy({ 
                        ...newPregnancy, 
                        notes: e.target.value 
                      })}
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="living"
                      checked={newPregnancy.living}
                      onCheckedChange={(checked) => setNewPregnancy({ 
                        ...newPregnancy, 
                        living: !!checked 
                      })}
                    />
                    <label
                      htmlFor="living"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Child is living
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingPregnancy(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addPregnancy}>
                      Add Pregnancy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {priorPregnancies.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Baby className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No prior pregnancies documented</p>
              <p className="text-xs">This is G1 (first pregnancy)</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>GA</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Complications</TableHead>
                  <TableHead>Living</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priorPregnancies.map((preg) => (
                  <TableRow key={preg.id}>
                    <TableCell>{preg.year}</TableCell>
                    <TableCell>{preg.gestationalAge || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getOutcomeBadgeColor(preg.outcome)}>
                        {preg.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell>{preg.deliveryMode || '-'}</TableCell>
                    <TableCell>{preg.birthWeight ? `${preg.birthWeight}g` : '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {preg.complications.slice(0, 2).map((c) => (
                          <Badge key={c} variant="outline" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                        {preg.complications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{preg.complications.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {preg.living ? (
                        <Heart className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-pink-500" />
              Risk Factors
            </CardTitle>
            <Dialog open={isAddingRisk} onOpenChange={setIsAddingRisk}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Risk Factor</DialogTitle>
                  <DialogDescription>
                    Document a pregnancy risk factor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newRiskFactor.category}
                      onValueChange={(value) => setNewRiskFactor({ 
                        ...newRiskFactor, 
                        category: value,
                        factor: undefined 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(RISK_FACTORS_BY_CATEGORY).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Risk Factor</Label>
                    <Select
                      value={newRiskFactor.factor || ''}
                      onValueChange={(value) => setNewRiskFactor({ 
                        ...newRiskFactor, 
                        factor: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(RISK_FACTORS_BY_CATEGORY[newRiskFactor.category as keyof typeof RISK_FACTORS_BY_CATEGORY] || []).map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select
                      value={newRiskFactor.severity}
                      onValueChange={(value) => setNewRiskFactor({ 
                        ...newRiskFactor, 
                        severity: value as RiskFactor['severity'] 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={newRiskFactor.notes || ''}
                      onChange={(e) => setNewRiskFactor({ 
                        ...newRiskFactor, 
                        notes: e.target.value 
                      })}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingRisk(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addRiskFactor}>
                      Add Risk Factor
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {riskFactors.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No risk factors documented</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(
                riskFactors.reduce((acc, rf) => {
                  if (!acc[rf.category]) acc[rf.category] = [];
                  acc[rf.category].push(rf);
                  return acc;
                }, {} as Record<string, RiskFactor[]>)
              ).map(([category, factors]) => (
                <div key={category} className="border rounded-lg p-3">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {factors.map((rf) => (
                      <Badge
                        key={rf.id}
                        className={cn(getSeverityColor(rf.severity), 'cursor-pointer')}
                        onClick={() => removeRiskFactor(rf.id)}
                      >
                        {rf.factor} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
