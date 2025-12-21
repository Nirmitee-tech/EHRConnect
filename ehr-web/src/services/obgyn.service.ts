/**
 * OB/GYN Service
 * API client for OB/GYN-specific clinical data
 */

import axios, { AxiosError } from 'axios';
import { Session } from 'next-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to check if error is an Axios error with specific status
function isAxiosErrorWithStatus(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}

// Helper to extract API headers from session
export interface ApiHeaders {
  'x-org-id': string;
  'x-user-id': string;
  [key: string]: string;
}

export function getApiHeaders(session: Session | null): ApiHeaders {
  const extendedSession = session as Session & { org_id?: string; user?: { id?: string } };
  return {
    'x-org-id': extendedSession?.org_id || '',
    'x-user-id': extendedSession?.user?.id || ''
  };
}

// Types
export interface EPDSResult {
  totalScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  interpretation: string;
  recommendation: string;
  selfHarmRisk: boolean;
  answers: number[];
  completedAt: string;
}

export interface EPDSAssessment extends EPDSResult {
  id: string;
  patientId: string;
  episodeId?: string;
  assessedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaborDeliveryRecord {
  id?: string;
  patientId?: string;
  episodeId?: string;
  deliveryDateTime: string;
  gestationalAge: string;
  deliveryMode: 'SVD' | 'Cesarean' | 'Vacuum' | 'Forceps' | 'VBAC';
  laborOnset?: 'Spontaneous' | 'Induced' | 'Augmented';
  ruptureOfMembranes?: 'Spontaneous' | 'Artificial' | 'Intact at delivery';
  amnioticFluid?: 'Clear' | 'Meconium-stained' | 'Bloody' | 'Foul-smelling';
  anesthesiaType?: string;
  cesareanDetails?: {
    type?: 'Primary' | 'Repeat';
    uterineIncision?: string;
    indication?: string;
  };
  bloodLoss?: number;
  episiotomy?: string;
  laceration?: string;
  placentaDelivery?: string;
  uterotonic?: string;
  maternalComplications?: string[];
  newborn?: {
    sex: 'Male' | 'Female' | 'Unknown';
    birthWeight: number;
    birthLength?: number;
    headCircumference?: number;
    apgar1: number;
    apgar5: number;
    apgar10?: number;
    resuscitation?: string;
    cordClamping?: 'Immediate' | 'Delayed';
    cordBlood?: boolean;
    skinToSkin?: boolean;
    breastfeedingInitiated?: boolean;
    nicuAdmission?: boolean;
    nicuReason?: string;
  };
  deliveryProvider?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostpartumVisit {
  id?: string;
  patientId?: string;
  episodeId?: string;
  visitDate: string;
  visitType: 'phone_contact' | 'wound_check' | 'comprehensive' | 'lactation' | 'mental_health';
  daysPostpartum: number;
  provider: string;
  vitals?: {
    bp?: { systolic: number; diastolic: number };
    pulse?: number;
    temperature?: number;
    weight?: number;
  };
  physicalExam?: {
    uterusInvolution?: string;
    lochia?: string;
    incisionHealing?: string;
    breastExam?: string;
    perineum?: string;
  };
  mentalHealth?: {
    epdsScore?: number;
    epdsRisk?: string;
    concerns?: string[];
    referral?: boolean;
  };
  breastfeeding?: {
    status: 'Exclusive' | 'Mixed' | 'Formula' | 'Not started';
    issues?: string[];
    lactationConsultNeeded?: boolean;
  };
  contraception?: {
    discussed: boolean;
    method?: string;
    started?: boolean;
  };
  labs?: {
    hemoglobin?: number;
    ogtt?: { fasting?: number; twoHour?: number; result?: string };
    thyroid?: { tsh?: number; result?: string };
  };
  notes?: string;
  nextVisitDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UltrasoundRecord {
  id?: string;
  patientId?: string;
  episodeId?: string;
  scanDate: string;
  gestationalAge: string;
  scanType: 'dating' | 'nt_screening' | 'anatomy' | 'growth' | 'bpp' | 'targeted' | 'cervical_length';
  indication?: string;
  provider: string;
  facility?: string;
  fetalNumber: number;
  presentation?: string;
  placentaLocation?: string;
  amnioticFluid?: {
    afi?: number;
    mvp?: number;
    status: 'Normal' | 'Oligohydramnios' | 'Polyhydramnios';
  };
  biometry?: {
    crl?: number;
    bpd?: number;
    hc?: number;
    ac?: number;
    fl?: number;
    efw?: number;
    efwPercentile?: number;
  };
  findings: Array<{
    parameter: string;
    value: string;
    unit?: string;
    status: 'normal' | 'abnormal' | 'borderline';
    percentile?: number;
    notes?: string;
  }>;
  assessment: 'Normal' | 'Abnormal' | 'Follow-up recommended';
  abnormalFindings?: string[];
  recommendations?: string[];
  imageCount?: number;
  reportUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get axios instance with headers
function getAxiosConfig(headers: Record<string, string> = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
}

// ============================================
// EPDS APIs
// ============================================

export async function saveEPDSAssessment(
  patientId: string,
  data: EPDSResult,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<EPDSAssessment> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/epds`,
    { ...data, episodeId },
    getAxiosConfig(headers)
  );
  return response.data.assessment;
}

export async function getEPDSAssessments(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<EPDSAssessment[]> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/epds${params}`,
    getAxiosConfig(headers)
  );
  return response.data.assessments;
}

export async function getLatestEPDS(
  patientId: string,
  headers?: Record<string, string>
): Promise<EPDSAssessment | null> {
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/epds/latest`,
    getAxiosConfig(headers)
  );
  return response.data.assessment;
}

// ============================================
// Labor & Delivery APIs
// ============================================

export async function saveLaborDeliveryRecord(
  patientId: string,
  data: LaborDeliveryRecord,
  headers?: Record<string, string>
): Promise<LaborDeliveryRecord> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/labor-delivery`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

export async function getLaborDeliveryRecord(
  patientId: string,
  episodeId: string,
  headers?: Record<string, string>
): Promise<LaborDeliveryRecord | null> {
  try {
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/labor-delivery/${episodeId}`,
      getAxiosConfig(headers)
    );
    return response.data.record;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateLaborDeliveryRecord(
  patientId: string,
  recordId: string,
  updates: Partial<LaborDeliveryRecord>,
  headers?: Record<string, string>
): Promise<LaborDeliveryRecord> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/labor-delivery/${recordId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

// ============================================
// Postpartum Visit APIs
// ============================================

export async function savePostpartumVisit(
  patientId: string,
  data: PostpartumVisit,
  headers?: Record<string, string>
): Promise<PostpartumVisit> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/postpartum-visits`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.visit;
}

export async function getPostpartumVisits(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<PostpartumVisit[]> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/postpartum-visits${params}`,
    getAxiosConfig(headers)
  );
  return response.data.visits;
}

// ============================================
// Ultrasound APIs
// ============================================

export async function saveUltrasoundRecord(
  patientId: string,
  data: UltrasoundRecord,
  headers?: Record<string, string>
): Promise<UltrasoundRecord> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/ultrasounds`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

export async function getUltrasoundRecords(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<UltrasoundRecord[]> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/ultrasounds${params}`,
    getAxiosConfig(headers)
  );
  return response.data.records;
}

export async function getUltrasoundById(
  patientId: string,
  recordId: string,
  headers?: Record<string, string>
): Promise<UltrasoundRecord | null> {
  try {
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/ultrasounds/${recordId}`,
      getAxiosConfig(headers)
    );
    return response.data.record;
  } catch (error: unknown) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return null;
    }
    throw error;
  }
}

// ============================================
// Pregnancy History APIs
// ============================================

export async function savePregnancyHistory(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/pregnancy-history`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.history;
}

export async function getPregnancyHistory(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/pregnancy-history${params}`,
    getAxiosConfig(headers)
  );
  return response.data.history;
}

// ============================================
// Genetic Screening APIs
// ============================================

export async function saveGeneticScreening(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/genetic-screening`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.screening;
}

export async function getGeneticScreening(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/genetic-screening${params}`,
    getAxiosConfig(headers)
  );
  return response.data.screening;
}

// ============================================
// Labs Tracking APIs
// ============================================

export async function saveLabsTracking(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/labs`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.labs;
}

export async function getLabsTracking(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/labs${params}`,
    getAxiosConfig(headers)
  );
  return response.data.labs;
}

// ============================================
// Kick Counts APIs
// ============================================

export async function saveKickCounts(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/kick-counts`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.kickCounts;
}

export async function getKickCounts(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/kick-counts${params}`,
    getAxiosConfig(headers)
  );
  return response.data.kickCounts;
}

// ============================================
// Birth Plan APIs
// ============================================

export async function saveBirthPlan(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/birth-plan`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.birthPlan;
}

export async function getBirthPlan(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/birth-plan${params}`,
    getAxiosConfig(headers)
  );
  return response.data.birthPlan;
}

// ============================================
// Vitals Log APIs
// ============================================

export async function saveVitalsLog(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/vitals-log`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.vitalsLog;
}

export async function getVitalsLog(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/vitals-log${params}`,
    getAxiosConfig(headers)
  );
  return response.data.vitalsLog;
}

// ============================================
// Fetal Assessment (NST/BPP) APIs
// ============================================

export async function saveFetalAssessment(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/fetal-assessment`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.fetalAssessment;
}

export async function getFetalAssessment(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/fetal-assessment${params}`,
    getAxiosConfig(headers)
  );
  return response.data.fetalAssessment;
}

// ============================================
// Risk Assessment APIs
// ============================================

export async function saveRiskAssessment(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/risk-assessment`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.riskAssessment;
}

export async function getRiskAssessment(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/risk-assessment${params}`,
    getAxiosConfig(headers)
  );
  return response.data.riskAssessment;
}

// ============================================
// Medication Review APIs
// ============================================

export async function saveMedicationReview(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/medication-review`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.medicationReview;
}

export async function getMedicationReview(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/medication-review${params}`,
    getAxiosConfig(headers)
  );
  return response.data.medicationReview;
}

// ============================================
// Consent Management APIs
// ============================================

export async function saveConsents(
  patientId: string,
  data: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/consents`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.consents;
}

export async function getConsents(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<unknown> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/consents${params}`,
    getAxiosConfig(headers)
  );
  return response.data.consents;
}

// ============================================
// IVF Cycle Types and APIs
// ============================================

export interface Embryo {
  id: string;
  embryoNumber: number;
  day: number;
  cellNumber?: number;
  grade: string;
  status: 'developing' | 'transferred' | 'frozen' | 'discarded';
  fertilizationMethod: 'ivf' | 'icsi';
  pgtResult?: 'euploid' | 'aneuploid' | 'mosaic' | 'no_result';
  notes?: string;
}

export interface IVFCycle {
  id: string;
  patientId: string;
  episodeId?: string;
  cycleType: 'fresh_ivf' | 'fet' | 'egg_freezing' | 'pgt_cycle';
  protocolType: 'antagonist' | 'long_lupron' | 'microdose_flare' | 'mild' | 'natural';
  status: 'active' | 'cancelled' | 'completed' | 'frozen';
  startDate: string;
  donorCycle?: boolean;
  baseline?: {
    afcLeft?: number;
    afcRight?: number;
    amh?: number;
    fsh?: number;
    lh?: number;
    estradiol?: number;
    tsh?: number;
    prolactin?: number;
  };
  semenAnalysis?: {
    volume?: number;
    concentration?: number;
    motility?: number;
    morphology?: number;
  };
  medications?: Array<{
    id: string;
    name: string;
    dose: number;
    unit: string;
    startDay: number;
    endDay: number;
  }>;
  retrievalDate?: string;
  oocytesRetrieved?: number;
  matureOocytes?: number;
  embryos?: Embryo[];
  monitoringVisits?: Array<{
    id: string;
    cycleDay: number;
    date: string;
    estradiol?: number;
    follicles?: Array<{ ovary: 'left' | 'right'; size: number }>;
  }>;
  transfers?: Array<{
    id: string;
    date: string;
    embryoIds: string[];
    endometrialThickness?: number;
    transferDifficulty?: string;
  }>;
  cryoStorage?: Array<{
    embryoId: string;
    tankId: string;
    slot: string;
    consentVersion?: string;
  }>;
  outcome?: {
    betaHcg1?: number;
    betaHcg1Date?: string;
    betaHcg2?: number;
    betaHcg2Date?: string;
    pregnancyConfirmed?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export async function getIVFCycles(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<IVFCycle[]> {
  try {
    const params = episodeId ? `?episodeId=${episodeId}` : '';
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles${params}`,
      getAxiosConfig(headers)
    );
    return response.data.cycles || [];
  } catch (error) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return [];
    }
    throw error;
  }
}

export async function createIVFCycle(
  patientId: string,
  data: Partial<IVFCycle>,
  headers?: Record<string, string>
): Promise<IVFCycle> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.cycle;
}

export async function updateIVFCycle(
  patientId: string,
  cycleId: string,
  updates: Partial<IVFCycle>,
  headers?: Record<string, string>
): Promise<IVFCycle> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.cycle;
}

// ============================================
// IVF Monitoring (Daily Stimulation Tracking)
// ============================================

export interface IVFMonitoringRecord {
  id: string;
  cycleId: string;
  patientId: string;
  monitoringDate: string;
  stimDay: number;
  folliclesRight: number[];
  folliclesLeft: number[];
  estradiolPgMl: number | null;
  lhMiuMl: number | null;
  progesteroneNgMl: number | null;
  endometrialThicknessMm: number | null;
  endometrialPattern: 'trilaminar' | 'homogeneous' | 'irregular' | null;
  medicationChanges: Array<{ medication: string; dosage: string; reason: string }>;
  assessment: string;
  plan: string;
  triggerReady: boolean;
  ohssRiskLevel: 'low' | 'moderate' | 'high' | 'critical' | null;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export async function getIVFMonitoring(
  patientId: string,
  cycleId: string,
  headers?: Record<string, string>
): Promise<{ records: IVFMonitoringRecord[]; count: number }> {
  try {
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/monitoring`,
      getAxiosConfig(headers)
    );
    return {
      records: response.data.records || [],
      count: response.data.count || 0
    };
  } catch (error) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return { records: [], count: 0 };
    }
    throw error;
  }
}

export async function createIVFMonitoring(
  patientId: string,
  cycleId: string,
  data: Partial<IVFMonitoringRecord>,
  headers?: Record<string, string>
): Promise<IVFMonitoringRecord> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/monitoring`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

export async function updateIVFMonitoring(
  patientId: string,
  cycleId: string,
  monitoringId: string,
  updates: Partial<IVFMonitoringRecord>,
  headers?: Record<string, string>
): Promise<IVFMonitoringRecord> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/monitoring/${monitoringId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

export async function deleteIVFMonitoring(
  patientId: string,
  cycleId: string,
  monitoringId: string,
  headers?: Record<string, string>
): Promise<void> {
  await axios.delete(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/monitoring/${monitoringId}`,
    getAxiosConfig(headers)
  );
}

// ============================================
// IVF Retrieval (Egg Retrieval Procedure)
// ============================================

export interface IVFRetrieval {
  id: string;
  cycleId: string;
  patientId: string;
  retrievalDate: string;
  retrievalTime?: string;
  triggerDate?: string;
  triggerTime?: string;
  triggerMedication?: string;
  anesthesiaType?: 'general' | 'conscious_sedation' | 'local' | 'none';
  anesthesiologist?: string;
  rightOvaryFolliclesAspirated?: number;
  leftOvaryFolliclesAspirated?: number;
  aspirationDifficulty?: 'easy' | 'moderate' | 'difficult';
  aspirationNotes?: string;
  totalOocytesRetrieved: number;
  matureOocytes?: number;
  immatureOocytes?: number;
  cumulusQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  follicularFluidQuality?: 'clear' | 'bloody' | 'cloudy';
  complications?: Array<{ type: string; severity: string; notes: string }>;
  procedureDuration?: number;
  primaryPhysician?: string;
  embryologist?: string;
  physicianNotes?: string;
  embryologistNotes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export async function getIVFRetrieval(
  patientId: string,
  cycleId: string,
  headers?: Record<string, string>
): Promise<IVFRetrieval | null> {
  try {
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/retrieval`,
      getAxiosConfig(headers)
    );
    return response.data.record || null;
  } catch (error) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return null;
    }
    throw error;
  }
}

export async function createIVFRetrieval(
  patientId: string,
  cycleId: string,
  data: Partial<IVFRetrieval>,
  headers?: Record<string, string>
): Promise<IVFRetrieval> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/retrieval`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

export async function updateIVFRetrieval(
  patientId: string,
  cycleId: string,
  retrievalId: string,
  updates: Partial<IVFRetrieval>,
  headers?: Record<string, string>
): Promise<IVFRetrieval> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/retrieval/${retrievalId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

// ============================================
// IVF Oocytes (Individual Oocyte Tracking)
// ============================================

export interface IVFOocyte {
  id: string;
  retrievalId: string;
  cycleId: string;
  patientId: string;
  oocyteNumber: number;
  ovarySide?: 'right' | 'left' | 'unknown';
  maturityGrade: 'MII' | 'MI' | 'GV' | 'degenerated';
  cumulusCells?: 'expanded' | 'compact' | 'partial' | 'denuded';
  fertilizationMethod?: 'ICSI' | 'conventional_IVF' | 'rescue_ICSI' | 'not_inseminated';
  inseminationTime?: string;
  fertilizationCheckTime?: string;
  pronucleiCount?: number;
  fertilizationStatus?: '2PN_normal' | '1PN' | '3PN' | 'unfertilized' | 'degenerated';
  polarBodies?: number;
  cytoplasmQuality?: 'clear' | 'granular' | 'dark' | 'vacuolated';
  zonaPellucida?: 'normal' | 'thick' | 'thin' | 'dark';
  developedToEmbryo: boolean;
  embryoId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getIVFOocytes(
  patientId: string,
  cycleId: string,
  retrievalId: string,
  headers?: Record<string, string>
): Promise<IVFOocyte[]> {
  try {
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/retrieval/${retrievalId}/oocytes`,
      getAxiosConfig(headers)
    );
    return response.data.records || [];
  } catch (error) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return [];
    }
    throw error;
  }
}

export async function createIVFOocyte(
  patientId: string,
  cycleId: string,
  retrievalId: string,
  data: Partial<IVFOocyte>,
  headers?: Record<string, string>
): Promise<IVFOocyte> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/retrieval/${retrievalId}/oocytes`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

export async function updateIVFOocyte(
  patientId: string,
  cycleId: string,
  retrievalId: string,
  oocyteId: string,
  updates: Partial<IVFOocyte>,
  headers?: Record<string, string>
): Promise<IVFOocyte> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/retrieval/${retrievalId}/oocytes/${oocyteId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

// ============================================
// IVF Embryo Development (Day-by-Day Tracking)
// ============================================

export interface IVFEmbryoDevelopment {
  id: string;
  oocyteId?: string;
  cycleId: string;
  patientId: string;
  embryoNumber: number;

  // Day 1 assessment
  day1CheckTime?: string;
  day1Pronuclei?: number;
  day1PolarBodies?: number;
  day1Status?: '2PN' | '1PN' | '3PN' | 'unfertilized';
  day1Notes?: string;

  // Day 2 assessment
  day2CheckTime?: string;
  day2CellCount?: number;
  day2Fragmentation?: number;
  day2Symmetry?: 'symmetric' | 'mildly_asymmetric' | 'asymmetric';
  day2Grade?: string;
  day2Notes?: string;

  // Day 3 assessment
  day3CheckTime?: string;
  day3CellCount?: number;
  day3Fragmentation?: number;
  day3Symmetry?: 'symmetric' | 'mildly_asymmetric' | 'asymmetric';
  day3Compaction?: 'none' | 'beginning' | 'partial' | 'full';
  day3Grade?: string;
  day3Notes?: string;

  // Day 4 assessment
  day4CheckTime?: string;
  day4Stage?: 'compacting' | 'morula' | 'early_blast' | 'arrested';
  day4Notes?: string;

  // Day 5 assessment (blastocyst)
  day5CheckTime?: string;
  day5Stage?: 'early_blast' | 'blast' | 'expanded_blast' | 'hatching_blast' | 'hatched_blast' | 'arrested';
  day5Expansion?: '1' | '2' | '3' | '4' | '5' | '6';
  day5IcmGrade?: 'A' | 'B' | 'C';
  day5TeGrade?: 'A' | 'B' | 'C';
  day5OverallGrade?: string;
  day5Notes?: string;

  // Day 6 assessment
  day6CheckTime?: string;
  day6Stage?: string;
  day6Expansion?: string;
  day6IcmGrade?: string;
  day6TeGrade?: string;
  day6OverallGrade?: string;
  day6Notes?: string;

  // Day 7 assessment
  day7CheckTime?: string;
  day7Stage?: string;
  day7Notes?: string;

  // Culture conditions
  cultureMedia?: string;
  incubatorType?: 'standard' | 'time_lapse' | 'benchtop';
  co2Concentration?: number;
  o2Concentration?: number;

  // Final outcome
  finalDisposition?: 'fresh_transfer' | 'frozen' | 'biopsied' | 'discarded' | 'arrested' | 'research';
  dispositionDate?: string;
  freezingMethod?: 'vitrification' | 'slow_freeze' | 'not_frozen';
  thawSurvival?: boolean;

  // PGT-A testing
  biopsyDate?: string;
  biopsyDay?: number;
  pgtResult?: 'euploid' | 'aneuploid' | 'mosaic' | 'no_result' | 'pending';
  pgtDetails?: any;

  primaryEmbryologist?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getIVFEmbryos(
  patientId: string,
  cycleId: string,
  headers?: Record<string, string>
): Promise<IVFEmbryoDevelopment[]> {
  try {
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/embryos`,
      getAxiosConfig(headers)
    );
    return response.data.records || [];
  } catch (error) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return [];
    }
    throw error;
  }
}

export async function createIVFEmbryo(
  patientId: string,
  cycleId: string,
  data: Partial<IVFEmbryoDevelopment>,
  headers?: Record<string, string>
): Promise<IVFEmbryoDevelopment> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/embryos`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

export async function updateIVFEmbryo(
  patientId: string,
  cycleId: string,
  embryoId: string,
  updates: Partial<IVFEmbryoDevelopment>,
  headers?: Record<string, string>
): Promise<IVFEmbryoDevelopment> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/ivf-cycles/${cycleId}/embryos/${embryoId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

// ============================================
// Cervical Length Types and APIs
// ============================================

export interface CervicalLength {
  id?: string;
  patientId?: string;
  episodeId?: string;
  date: string;
  gestationalAge: string;
  length: number;
  method: 'transvaginal' | 'transabdominal' | 'translabial';
  funneling: boolean;
  funnelingLength?: number;
  internalOsOpen: boolean;
  notes?: string;
  createdAt?: string;
}

export async function getCervicalLengths(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<CervicalLength[]> {
  try {
    const params = episodeId ? `?episodeId=${episodeId}` : '';
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/cervical-length${params}`,
      getAxiosConfig(headers)
    );
    return response.data.measurements || [];
  } catch (error) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return [];
    }
    throw error;
  }
}

export async function saveCervicalLength(
  patientId: string,
  data: CervicalLength,
  headers?: Record<string, string>
): Promise<CervicalLength> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/cervical-length`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.measurement;
}

// ============================================
// Patient Education Types and APIs
// ============================================

export interface PatientEducation {
  moduleId: string;
  completed: boolean;
  completedDate?: string;
  episodeId?: string;
}

export async function getPatientEducation(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<PatientEducation[]> {
  try {
    const params = episodeId ? `?episodeId=${episodeId}` : '';
    const response = await axios.get(
      `${API_BASE}/api/patients/${patientId}/obgyn/education${params}`,
      getAxiosConfig(headers)
    );
    return response.data.records || [];
  } catch (error) {
    if (isAxiosErrorWithStatus(error, 404)) {
      return [];
    }
    throw error;
  }
}

export async function savePatientEducation(
  patientId: string,
  data: PatientEducation,
  headers?: Record<string, string>
): Promise<PatientEducation> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/education`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.record;
}

// ============================================
// Care Plan APIs (FHIR R4)
// ============================================

export interface CarePlanActivity {
  id?: string;
  detail: {
    kind?: string;
    code?: { text: string };
    status: string;
    description?: string;
    scheduledString?: string;
    performer?: { display: string }[];
  };
}

export interface CarePlan {
  id: string;
  resourceType: 'CarePlan';
  status: string;
  intent: string;
  title: string;
  description?: string;
  subject: { reference: string };
  period?: { start: string; end?: string };
  created: string;
  activity: CarePlanActivity[];
  episodeId?: string;
}

export interface Goal {
  id: string;
  resourceType: 'Goal';
  lifecycleStatus: string;
  priority?: { coding: { code: string; display: string }[] };
  category?: { coding: { code: string; display: string }[] }[];
  description: { text: string };
  subject: { reference: string };
  startDate?: string;
  target?: { dueDate?: string; measure?: { text: string }; detailString?: string }[];
  carePlanId?: string;
  episodeId?: string;
}

export async function getCarePlans(
  patientId: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<CarePlan[]> {
  const params = episodeId ? `?episodeId=${episodeId}` : '';
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/care-plans${params}`,
    getAxiosConfig(headers)
  );
  return response.data.carePlans || [];
}

export async function createCarePlan(
  patientId: string,
  data: { carePlan: Partial<CarePlan>; episodeId?: string },
  headers?: Record<string, string>
): Promise<CarePlan> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/care-plans`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.carePlan;
}

export async function updateCarePlan(
  patientId: string,
  carePlanId: string,
  updates: Partial<CarePlan>,
  headers?: Record<string, string>
): Promise<CarePlan> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/care-plans/${carePlanId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.carePlan;
}

export async function addCarePlanActivity(
  patientId: string,
  carePlanId: string,
  activity: CarePlanActivity,
  headers?: Record<string, string>
): Promise<CarePlan> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/care-plans/${carePlanId}/activities`,
    { activity },
    getAxiosConfig(headers)
  );
  return response.data.carePlan;
}

export async function updateActivityStatus(
  patientId: string,
  carePlanId: string,
  activityIndex: number,
  status: string,
  headers?: Record<string, string>
): Promise<CarePlan> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/care-plans/${carePlanId}/activities/${activityIndex}`,
    { status },
    getAxiosConfig(headers)
  );
  return response.data.carePlan;
}

// ============================================
// Goal APIs (FHIR R4)
// ============================================

export async function getGoals(
  patientId: string,
  carePlanId?: string,
  episodeId?: string,
  headers?: Record<string, string>
): Promise<Goal[]> {
  const params = new URLSearchParams();
  if (carePlanId) params.append('carePlanId', carePlanId);
  if (episodeId) params.append('episodeId', episodeId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await axios.get(
    `${API_BASE}/api/patients/${patientId}/obgyn/goals${queryString}`,
    getAxiosConfig(headers)
  );
  return response.data.goals || [];
}

export async function createGoal(
  patientId: string,
  data: { goal: Partial<Goal>; carePlanId?: string; episodeId?: string },
  headers?: Record<string, string>
): Promise<Goal> {
  const response = await axios.post(
    `${API_BASE}/api/patients/${patientId}/obgyn/goals`,
    data,
    getAxiosConfig(headers)
  );
  return response.data.goal;
}

export async function updateGoal(
  patientId: string,
  goalId: string,
  updates: Partial<Goal>,
  headers?: Record<string, string>
): Promise<Goal> {
  const response = await axios.patch(
    `${API_BASE}/api/patients/${patientId}/obgyn/goals/${goalId}`,
    updates,
    getAxiosConfig(headers)
  );
  return response.data.goal;
}

export async function deleteGoal(
  patientId: string,
  goalId: string,
  headers?: Record<string, string>
): Promise<void> {
  await axios.delete(
    `${API_BASE}/api/patients/${patientId}/obgyn/goals/${goalId}`,
    getAxiosConfig(headers)
  );
}

// Export as default service object
export const obgynService = {
  // EPDS
  saveEPDSAssessment,
  getEPDSAssessments,
  getLatestEPDS,
  // Labor & Delivery
  saveLaborDeliveryRecord,
  getLaborDeliveryRecord,
  updateLaborDeliveryRecord,
  // Postpartum
  savePostpartumVisit,
  getPostpartumVisits,
  // Ultrasound
  saveUltrasoundRecord,
  getUltrasoundRecords,
  getUltrasoundById,
  // Pregnancy History
  savePregnancyHistory,
  getPregnancyHistory,
  // Genetic Screening
  saveGeneticScreening,
  getGeneticScreening,
  // Labs Tracking
  saveLabsTracking,
  getLabsTracking,
  // Kick Counts
  saveKickCounts,
  getKickCounts,
  // Birth Plan
  saveBirthPlan,
  getBirthPlan,
  // Vitals Log
  saveVitalsLog,
  getVitalsLog,
  // Fetal Assessment (NST/BPP)
  saveFetalAssessment,
  getFetalAssessment,
  // Risk Assessment
  saveRiskAssessment,
  getRiskAssessment,
  // Medication Review
  saveMedicationReview,
  getMedicationReview,
  // Consent Management
  saveConsents,
  getConsents,
  // IVF Cycles
  getIVFCycles,
  createIVFCycle,
  updateIVFCycle,
  // IVF Monitoring
  getIVFMonitoring,
  createIVFMonitoring,
  updateIVFMonitoring,
  deleteIVFMonitoring,
  // IVF Retrieval
  getIVFRetrieval,
  createIVFRetrieval,
  updateIVFRetrieval,
  // IVF Oocytes
  getIVFOocytes,
  createIVFOocyte,
  updateIVFOocyte,
  // IVF Embryos
  getIVFEmbryos,
  createIVFEmbryo,
  updateIVFEmbryo,
  // Cervical Length
  getCervicalLengths,
  saveCervicalLength,
  // Patient Education
  getPatientEducation,
  savePatientEducation,
  // Care Plans (FHIR R4)
  getCarePlans,
  createCarePlan,
  updateCarePlan,
  addCarePlanActivity,
  updateActivityStatus,
  // Goals (FHIR R4)
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};

export default obgynService;
