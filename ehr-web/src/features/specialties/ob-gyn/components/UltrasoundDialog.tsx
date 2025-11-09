'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Scan, Calendar, Ruler, Baby, AlertCircle, Activity, FileImage } from 'lucide-react';
import { useEpisodeContext } from '@/contexts/episode-context';
import {
  calculateGestationalAge,
  formatGestationalAge,
  calculateEDDFromUltrasound,
  formatDate,
} from '../utils/pregnancy-calculators';

interface UltrasoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  ultrasoundData?: UltrasoundRecord | null;
  onSuccess?: () => void;
}

export interface UltrasoundRecord {
  id?: string;
  scanDate: string;
  gestationalAge: { weeks: number; days: number };
  scanType: 'dating' | 'anatomy' | 'growth' | 'biophysical' | 'other';

  // Measurements (mm unless specified)
  crl?: number;  // Crown-Rump Length (dating scans)
  bpd?: number;  // Biparietal Diameter
  hc?: number;   // Head Circumference
  ac?: number;   // Abdominal Circumference
  fl?: number;   // Femur Length
  efw?: number;  // Estimated Fetal Weight (grams)

  // Placenta
  placentaLocation?: 'anterior' | 'posterior' | 'fundal' | 'low-lying' | 'previa';
  placentaGrade?: 0 | 1 | 2 | 3;

  // Amniotic Fluid
  afi?: number;  // Amniotic Fluid Index (cm)
  mvp?: number;  // Maximum Vertical Pocket (cm)
  fluidStatus?: 'normal' | 'oligohydramnios' | 'polyhydramnios';

  // Fetal Assessment
  fetalHeartRate?: number;
  fetalMovement?: 'present' | 'reduced' | 'absent';
  numberOfFetuses: number;

  // Anatomy Assessment (for anatomy scans)
  brainNormal?: boolean;
  heartNormal?: boolean;
  spineNormal?: boolean;
  limbsNormal?: boolean;
  kidneyNormal?: boolean;
  stomachNormal?: boolean;

  // Findings
  findings: string;
  concerns?: string;

  // EDD Adjustment
  revisedEDD?: string;

  metadata?: any;
}

export function UltrasoundDialog({
  open,
  onOpenChange,
  patientId,
  ultrasoundData,
  onSuccess,
}: UltrasoundDialogProps) {
  const { getEpisodeBySpecialty } = useEpisodeContext();
  const episode = getEpisodeBySpecialty('ob-gyn');

  // Form state
  const [scanDate, setScanDate] = useState('');
  const [scanType, setScanType] = useState<string>('growth');
  const [numberOfFetuses, setNumberOfFetuses] = useState('1');

  // Measurements
  const [crl, setCrl] = useState('');
  const [bpd, setBpd] = useState('');
  const [hc, setHc] = useState('');
  const [ac, setAc] = useState('');
  const [fl, setFl] = useState('');
  const [efw, setEfw] = useState('');

  // Placenta
  const [placentaLocation, setPlacentaLocation] = useState<string>('');
  const [placentaGrade, setPlacentaGrade] = useState<string>('');

  // Amniotic Fluid
  const [afi, setAfi] = useState('');
  const [mvp, setMvp] = useState('');
  const [fluidStatus, setFluidStatus] = useState<string>('normal');

  // Fetal Assessment
  const [fetalHeartRate, setFetalHeartRate] = useState('');
  const [fetalMovement, setFetalMovement] = useState<string>('present');

  // Anatomy
  const [brainNormal, setBrainNormal] = useState(true);
  const [heartNormal, setHeartNormal] = useState(true);
  const [spineNormal, setSpineNormal] = useState(true);
  const [limbsNormal, setLimbsNormal] = useState(true);
  const [kidneyNormal, setKidneyNormal] = useState(true);
  const [stomachNormal, setStomachNormal] = useState(true);

  // Findings
  const [findings, setFindings] = useState('');
  const [concerns, setConcerns] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculated values
  const [gestationalAge, setGestationalAge] = useState<{ weeks: number; days: number } | null>(null);
  const [calculatedEFW, setCalculatedEFW] = useState<number | null>(null);
  const [revisedEDD, setRevisedEDD] = useState<Date | null>(null);

  const episodeMetadata = episode?.metadata as any;

  // Calculate gestational age from LMP at time of scan
  useEffect(() => {
    if (scanDate && episodeMetadata?.lmp) {
      const lmpDate = new Date(episodeMetadata.lmp);
      const scanDateObj = new Date(scanDate);
      const ga = calculateGestationalAge(lmpDate, scanDateObj);
      setGestationalAge(ga);
    }
  }, [scanDate, episodeMetadata?.lmp]);

  // Calculate EFW from measurements (Hadlock formula)
  useEffect(() => {
    if (bpd && hc && ac && fl) {
      const bpdVal = parseFloat(bpd);
      const hcVal = parseFloat(hc);
      const acVal = parseFloat(ac);
      const flVal = parseFloat(fl);

      if (!isNaN(bpdVal) && !isNaN(hcVal) && !isNaN(acVal) && !isNaN(flVal)) {
        // Hadlock formula (simplified)
        const logEFW = 1.3596 + 0.0064 * hcVal + 0.0424 * acVal + 0.174 * flVal + 0.0061 * bpdVal * acVal - 0.0386 * acVal * flVal;
        const efwGrams = Math.exp(logEFW);
        setCalculatedEFW(Math.round(efwGrams));
      }
    } else {
      setCalculatedEFW(null);
    }
  }, [bpd, hc, ac, fl]);

  // Calculate revised EDD from CRL (dating scan)
  useEffect(() => {
    if (crl && scanDate && scanType === 'dating') {
      const crlVal = parseFloat(crl);
      if (!isNaN(crlVal)) {
        // Estimate GA from CRL (simplified formula)
        const gaWeeks = (crlVal + 42) / 7;
        const scanDateObj = new Date(scanDate);
        const revised = calculateEDDFromUltrasound(scanDateObj, gaWeeks);
        setRevisedEDD(revised);
      }
    }
  }, [crl, scanDate, scanType]);

  // Initialize form
  useEffect(() => {
    if (ultrasoundData && open) {
      setScanDate(ultrasoundData.scanDate);
      setScanType(ultrasoundData.scanType);
      setNumberOfFetuses(ultrasoundData.numberOfFetuses.toString());
      setCrl(ultrasoundData.crl?.toString() || '');
      setBpd(ultrasoundData.bpd?.toString() || '');
      setHc(ultrasoundData.hc?.toString() || '');
      setAc(ultrasoundData.ac?.toString() || '');
      setFl(ultrasoundData.fl?.toString() || '');
      setEfw(ultrasoundData.efw?.toString() || '');
      setPlacentaLocation(ultrasoundData.placentaLocation || '');
      setPlacentaGrade(ultrasoundData.placentaGrade?.toString() || '');
      setAfi(ultrasoundData.afi?.toString() || '');
      setMvp(ultrasoundData.mvp?.toString() || '');
      setFluidStatus(ultrasoundData.fluidStatus || 'normal');
      setFetalHeartRate(ultrasoundData.fetalHeartRate?.toString() || '');
      setFetalMovement(ultrasoundData.fetalMovement || 'present');
      setBrainNormal(ultrasoundData.brainNormal ?? true);
      setHeartNormal(ultrasoundData.heartNormal ?? true);
      setSpineNormal(ultrasoundData.spineNormal ?? true);
      setLimbsNormal(ultrasoundData.limbsNormal ?? true);
      setKidneyNormal(ultrasoundData.kidneyNormal ?? true);
      setStomachNormal(ultrasoundData.stomachNormal ?? true);
      setFindings(ultrasoundData.findings);
      setConcerns(ultrasoundData.concerns || '');
    } else if (open && !ultrasoundData) {
      // Reset for new scan
      const today = new Date().toISOString().split('T')[0];
      setScanDate(today);
      setScanType('growth');
      setNumberOfFetuses('1');
      setCrl('');
      setBpd('');
      setHc('');
      setAc('');
      setFl('');
      setEfw('');
      setPlacentaLocation('');
      setPlacentaGrade('');
      setAfi('');
      setMvp('');
      setFluidStatus('normal');
      setFetalHeartRate('');
      setFetalMovement('present');
      setBrainNormal(true);
      setHeartNormal(true);
      setSpineNormal(true);
      setLimbsNormal(true);
      setKidneyNormal(true);
      setStomachNormal(true);
      setFindings('');
      setConcerns('');
    }
  }, [ultrasoundData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!scanDate || !findings) {
      setError('Please fill in required fields (Date, Findings)');
      return;
    }

    try {
      setLoading(true);

      const record: UltrasoundRecord = {
        id: ultrasoundData?.id,
        scanDate,
        gestationalAge: gestationalAge!,
        scanType: scanType as any,
        numberOfFetuses: parseInt(numberOfFetuses),
        crl: crl ? parseFloat(crl) : undefined,
        bpd: bpd ? parseFloat(bpd) : undefined,
        hc: hc ? parseFloat(hc) : undefined,
        ac: ac ? parseFloat(ac) : undefined,
        fl: fl ? parseFloat(fl) : undefined,
        efw: efw ? parseFloat(efw) : (calculatedEFW || undefined),
        placentaLocation: placentaLocation as any || undefined,
        placentaGrade: placentaGrade ? parseInt(placentaGrade) as any : undefined,
        afi: afi ? parseFloat(afi) : undefined,
        mvp: mvp ? parseFloat(mvp) : undefined,
        fluidStatus: fluidStatus as any,
        fetalHeartRate: fetalHeartRate ? parseInt(fetalHeartRate) : undefined,
        fetalMovement: fetalMovement as any,
        brainNormal,
        heartNormal,
        spineNormal,
        limbsNormal,
        kidneyNormal,
        stomachNormal,
        findings,
        concerns: concerns || undefined,
        revisedEDD: revisedEDD?.toISOString(),
        metadata: {
          calculatedEFW,
        },
      };

      // TODO: Save to backend via FHIR ImagingStudy/DiagnosticReport resources
      console.log('Saving ultrasound record:', record);

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving ultrasound record:', err);
      setError(err instanceof Error ? err.message : 'Failed to save ultrasound record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-purple-600" />
            {ultrasoundData ? 'Edit Ultrasound' : 'Record Ultrasound'}
          </DialogTitle>
          <DialogDescription>
            {gestationalAge && (
              <span className="text-purple-600 font-medium">
                Gestational Age: {formatGestationalAge(gestationalAge.weeks, gestationalAge.days)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Scan Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scan Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="scanDate" className="required">Scan Date</Label>
                <Input
                  id="scanDate"
                  type="date"
                  value={scanDate}
                  onChange={(e) => setScanDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="scanType" className="required">Scan Type</Label>
                <select
                  id="scanType"
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="dating">Dating Scan (6-13 weeks)</option>
                  <option value="anatomy">Anatomy Scan (18-22 weeks)</option>
                  <option value="growth">Growth Scan</option>
                  <option value="biophysical">Biophysical Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="numberOfFetuses">Number of Fetuses</Label>
                <Input
                  id="numberOfFetuses"
                  type="number"
                  min="1"
                  max="5"
                  value={numberOfFetuses}
                  onChange={(e) => setNumberOfFetuses(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Fetal Biometry */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Fetal Biometry (mm)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {scanType === 'dating' && (
                <div className="col-span-3">
                  <Label htmlFor="crl">Crown-Rump Length (CRL)</Label>
                  <Input
                    id="crl"
                    type="number"
                    step="0.1"
                    value={crl}
                    onChange={(e) => setCrl(e.target.value)}
                    placeholder="mm"
                    className="mt-1"
                  />
                  {revisedEDD && (
                    <p className="text-xs text-purple-600 mt-1">
                      📅 Revised EDD based on CRL: {formatDate(revisedEDD)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="bpd">Biparietal Diameter (BPD)</Label>
                <Input
                  id="bpd"
                  type="number"
                  step="0.1"
                  value={bpd}
                  onChange={(e) => setBpd(e.target.value)}
                  placeholder="mm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hc">Head Circumference (HC)</Label>
                <Input
                  id="hc"
                  type="number"
                  step="0.1"
                  value={hc}
                  onChange={(e) => setHc(e.target.value)}
                  placeholder="mm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ac">Abdominal Circumference (AC)</Label>
                <Input
                  id="ac"
                  type="number"
                  step="0.1"
                  value={ac}
                  onChange={(e) => setAc(e.target.value)}
                  placeholder="mm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fl">Femur Length (FL)</Label>
                <Input
                  id="fl"
                  type="number"
                  step="0.1"
                  value={fl}
                  onChange={(e) => setFl(e.target.value)}
                  placeholder="mm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="efw">Estimated Fetal Weight (g)</Label>
                <Input
                  id="efw"
                  type="number"
                  value={efw}
                  onChange={(e) => setEfw(e.target.value)}
                  placeholder={calculatedEFW ? `Auto: ${calculatedEFW}g` : 'grams'}
                  className="mt-1"
                />
                {calculatedEFW && !efw && (
                  <p className="text-xs text-purple-600 mt-1">
                    ✓ Auto-calculated: {calculatedEFW}g
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Placenta & Fluid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Placenta</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="placentaLocation">Location</Label>
                  <select
                    id="placentaLocation"
                    value={placentaLocation}
                    onChange={(e) => setPlacentaLocation(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Not specified</option>
                    <option value="anterior">Anterior</option>
                    <option value="posterior">Posterior</option>
                    <option value="fundal">Fundal</option>
                    <option value="low-lying">Low-lying</option>
                    <option value="previa">Placenta Previa</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="placentaGrade">Grade</Label>
                  <select
                    id="placentaGrade"
                    value={placentaGrade}
                    onChange={(e) => setPlacentaGrade(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Not graded</option>
                    <option value="0">Grade 0</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Amniotic Fluid</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="afi">AFI (cm)</Label>
                  <Input
                    id="afi"
                    type="number"
                    step="0.1"
                    value={afi}
                    onChange={(e) => setAfi(e.target.value)}
                    placeholder="Amniotic Fluid Index"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mvp">MVP (cm)</Label>
                  <Input
                    id="mvp"
                    type="number"
                    step="0.1"
                    value={mvp}
                    onChange={(e) => setMvp(e.target.value)}
                    placeholder="Max Vertical Pocket"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fluidStatus">Status</Label>
                  <select
                    id="fluidStatus"
                    value={fluidStatus}
                    onChange={(e) => setFluidStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="oligohydramnios">Oligohydramnios (Low)</option>
                    <option value="polyhydramnios">Polyhydramnios (High)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Fetal Assessment */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Fetal Assessment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fetalHeartRate">Fetal Heart Rate (bpm)</Label>
                <Input
                  id="fetalHeartRate"
                  type="number"
                  value={fetalHeartRate}
                  onChange={(e) => setFetalHeartRate(e.target.value)}
                  placeholder="bpm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fetalMovement">Fetal Movement</Label>
                <select
                  id="fetalMovement"
                  value={fetalMovement}
                  onChange={(e) => setFetalMovement(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="present">Present</option>
                  <option value="reduced">Reduced</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Anatomy Survey (for anatomy scans) */}
          {scanType === 'anatomy' && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Baby className="h-4 w-4" />
                Anatomy Survey
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brainNormal}
                    onChange={(e) => setBrainNormal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Brain Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={heartNormal}
                    onChange={(e) => setHeartNormal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Heart Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spineNormal}
                    onChange={(e) => setSpineNormal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Spine Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={limbsNormal}
                    onChange={(e) => setLimbsNormal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Limbs Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kidneyNormal}
                    onChange={(e) => setKidneyNormal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Kidneys Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stomachNormal}
                    onChange={(e) => setStomachNormal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Stomach Normal</span>
                </label>
              </div>
            </div>
          )}

          {/* Findings & Concerns */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Findings & Interpretation
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="findings" className="required">Findings</Label>
                <Textarea
                  id="findings"
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Detailed ultrasound findings and impressions..."
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="concerns">Concerns / Follow-up</Label>
                <Textarea
                  id="concerns"
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  placeholder="Any concerns or recommended follow-up..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Saving...' : ultrasoundData ? 'Update Record' : 'Save Ultrasound'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
