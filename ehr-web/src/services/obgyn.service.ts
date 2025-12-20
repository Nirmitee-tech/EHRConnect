/**
 * OB/GYN Service
 * API client for OB/GYN-specific clinical data
 */

import axios from 'axios';
import { Session } from 'next-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    if ((error as { response?: { status: number } }).response?.status === 404) {
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
  getBirthPlan
};

export default obgynService;
