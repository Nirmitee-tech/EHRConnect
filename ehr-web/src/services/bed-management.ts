/**
 * Bed Management Service
 * Frontend API service for bed management and hospitalization
 */

import type {
  Ward,
  Bed,
  Hospitalization,
  BedAssignment,
  BedTransfer,
  NursingRound,
  BedReservation,
  CreateWardRequest,
  CreateBedRequest,
  AdmitPatientRequest,
  AssignBedRequest,
  TransferBedRequest,
  DischargePatientRequest,
  BedStatusChangeRequest,
  CreateNursingRoundRequest,
  CreateBedReservationRequest,
  BedOccupancyStats,
  WardOccupancyData,
  HospitalizationSummary,
} from '@/types/bed-management';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BED_MANAGEMENT_API = `${API_BASE_URL}/api/bed-management`;

/**
 * Get authorization headers
 * Uses the same pattern as inventory service with x-org-id and x-user-id headers
 */
function getAuthHeaders(orgId: string, userId?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-org-id': orgId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  return headers;
}

/**
 * NOTE: This function is deprecated - all API functions now accept orgId and userId as parameters
 * Keeping for backward compatibility but not recommended
 */
function getAuthContext(): { orgId: string; userId?: string } {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access auth context on server side');
  }

  // Try to get from localStorage (adjust based on your auth implementation)
  const orgId = localStorage.getItem('currentOrgId') || localStorage.getItem('orgId');
  const userId = localStorage.getItem('currentUserId') || localStorage.getItem('userId');

  if (!orgId) {
    throw new Error('Organization ID not found. Please ensure you are logged in.');
  }

  return { orgId, userId: userId || undefined };
}

/**
 * Convert snake_case to camelCase
 */
function toCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);

  return Object.keys(obj).reduce((acc: any, key: string) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const responseData = data.data !== undefined ? data.data : data;
  return toCamelCase(responseData) as T;
}

// =====================================================
// WARD MANAGEMENT
// =====================================================

/**
 * Get all wards
 */
export async function getWards(
  orgId: string,
  userId?: string,
  filters?: {
    locationId?: string;
    active?: boolean;
    wardType?: string;
  }
): Promise<Ward[]> {
  const params = new URLSearchParams();
  if (filters?.locationId) params.append('locationId', filters.locationId);
  if (filters?.active !== undefined) params.append('active', String(filters.active));
  if (filters?.wardType) params.append('wardType', filters.wardType);

  const response = await fetch(`${BED_MANAGEMENT_API}/wards?${params}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<Ward[]>(response);
}

/**
 * Get a specific ward
 */
export async function getWardById(
  orgId: string,
  userId: string | undefined,
  wardId: string
): Promise<Ward> {
  const response = await fetch(`${BED_MANAGEMENT_API}/wards/${wardId}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<Ward>(response);
}

/**
 * Create a new ward
 */
export async function createWard(
  orgId: string,
  userId: string | undefined,
  wardData: CreateWardRequest
): Promise<Ward> {
  const response = await fetch(`${BED_MANAGEMENT_API}/wards`, {
    method: 'POST',
    headers: getAuthHeaders(orgId, userId),
    body: JSON.stringify(wardData),
  });

  return handleResponse<Ward>(response);
}

/**
 * Update a ward
 */
export async function updateWard(
  orgId: string,
  userId: string | undefined,
  wardId: string,
  wardData: Partial<CreateWardRequest>
): Promise<Ward> {
  const response = await fetch(`${BED_MANAGEMENT_API}/wards/${wardId}`, {
    method: 'PUT',
    headers: getAuthHeaders(orgId, userId),
    body: JSON.stringify(wardData),
  });

  return handleResponse<Ward>(response);
}

// =====================================================
// BED MANAGEMENT
// =====================================================

/**
 * Get all beds with filters
 */
export async function getBeds(
  orgId: string,
  userId?: string,
  filters?: {
    locationId?: string;
    wardId?: string;
    status?: string;
    bedType?: string;
    active?: boolean;
  }
): Promise<Bed[]> {
  const params = new URLSearchParams();
  if (filters?.locationId) params.append('locationId', filters.locationId);
  if (filters?.wardId) params.append('wardId', filters.wardId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.bedType) params.append('bedType', filters.bedType);
  if (filters?.active !== undefined) params.append('active', String(filters.active));

  const response = await fetch(`${BED_MANAGEMENT_API}/beds?${params}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<Bed[]>(response);
}

/**
 * Get a specific bed
 */
export async function getBedById(
  orgId: string,
  userId: string | undefined,
  bedId: string
): Promise<Bed> {
  const response = await fetch(`${BED_MANAGEMENT_API}/beds/${bedId}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<Bed>(response);
}

/**
 * Create a new bed
 */
export async function createBed(
  orgId: string,
  userId: string | undefined,
  bedData: CreateBedRequest
): Promise<Bed> {
  const response = await fetch(`${BED_MANAGEMENT_API}/beds`, {
    method: 'POST',
    headers: getAuthHeaders(orgId, userId),
    body: JSON.stringify(bedData),
  });

  return handleResponse<Bed>(response);
}

/**
 * Update bed status
 */
export async function updateBedStatus(
  orgId: string,
  userId: string | undefined,
  request: BedStatusChangeRequest
): Promise<Bed> {
  const response = await fetch(`${BED_MANAGEMENT_API}/beds/${request.bedId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(orgId, userId),
    body: JSON.stringify({
      status: request.status,
      notes: request.notes,
    }),
  });

  return handleResponse<Bed>(response);
}

// =====================================================
// HOSPITALIZATION MANAGEMENT
// =====================================================

/**
 * Get all hospitalizations
 */
export async function getHospitalizations(
  orgId: string,
  userId?: string,
  filters?: {
    locationId?: string;
    status?: string | string[];
    wardId?: string;
    attendingDoctorId?: string;
    patientId?: string;
  }
): Promise<Hospitalization[]> {
  const params = new URLSearchParams();
  if (filters?.locationId) params.append('locationId', filters.locationId);
  if (filters?.status) {
    const status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
    params.append('status', status);
  }
  if (filters?.wardId) params.append('wardId', filters.wardId);
  if (filters?.attendingDoctorId) params.append('attendingDoctorId', filters.attendingDoctorId);
  if (filters?.patientId) params.append('patientId', filters.patientId);

  const response = await fetch(`${BED_MANAGEMENT_API}/hospitalizations?${params}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<Hospitalization[]>(response);
}

/**
 * Get a specific hospitalization
 */
export async function getHospitalizationById(
  orgId: string,
  userId: string | undefined,
  hospitalizationId: string
): Promise<Hospitalization> {
  const response = await fetch(`${BED_MANAGEMENT_API}/hospitalizations/${hospitalizationId}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<Hospitalization>(response);
}

/**
 * Admit a patient
 */
export async function admitPatient(
  orgId: string,
  userId: string | undefined,
  admissionData: AdmitPatientRequest
): Promise<Hospitalization> {
  const response = await fetch(`${BED_MANAGEMENT_API}/admissions`, {
    method: 'POST',
    headers: getAuthHeaders(orgId, userId),
    body: JSON.stringify(admissionData),
  });

  return handleResponse<Hospitalization>(response);
}

/**
 * Assign bed to hospitalization
 */
export async function assignBed(
  orgId: string,
  userId: string | undefined,
  request: AssignBedRequest
): Promise<void> {
  const response = await fetch(
    `${BED_MANAGEMENT_API}/hospitalizations/${request.hospitalizationId}/assign-bed`,
    {
      method: 'POST',
      headers: getAuthHeaders(orgId, userId),
      body: JSON.stringify({
        bedId: request.bedId,
        notes: request.notes,
      }),
    }
  );

  await handleResponse<void>(response);
}

/**
 * Transfer patient to different bed
 */
export async function transferBed(
  orgId: string,
  userId: string | undefined,
  request: TransferBedRequest
): Promise<void> {
  const response = await fetch(
    `${BED_MANAGEMENT_API}/hospitalizations/${request.hospitalizationId}/transfer`,
    {
      method: 'POST',
      headers: getAuthHeaders(orgId, userId),
      body: JSON.stringify({
        toBedId: request.toBedId,
        transferType: request.transferType,
        transferReason: request.transferReason,
        clinicalJustification: request.clinicalJustification,
      }),
    }
  );

  await handleResponse<void>(response);
}

/**
 * Discharge a patient
 */
export async function dischargePatient(
  orgId: string,
  userId: string | undefined,
  request: DischargePatientRequest
): Promise<Hospitalization> {
  const response = await fetch(
    `${BED_MANAGEMENT_API}/hospitalizations/${request.hospitalizationId}/discharge`,
    {
      method: 'POST',
      headers: getAuthHeaders(orgId, userId),
      body: JSON.stringify({
        dischargeDate: request.dischargeDate,
        dischargeType: request.dischargeType,
        dischargeSummary: request.dischargeSummary,
        dischargeDiagnosis: request.dischargeDiagnosis,
        dischargeDiagnosisCode: request.dischargeDiagnosisCode,
        dischargeInstructions: request.dischargeInstructions,
        dischargeDisposition: request.dischargeDisposition,
      }),
    }
  );

  return handleResponse<Hospitalization>(response);
}

// =====================================================
// ANALYTICS & DASHBOARD
// =====================================================

/**
 * Get bed occupancy statistics
 */
export async function getBedOccupancyStats(
  orgId: string,
  userId?: string,
  locationId?: string
): Promise<BedOccupancyStats> {
  const params = new URLSearchParams();
  if (locationId) params.append('locationId', locationId);

  const response = await fetch(`${BED_MANAGEMENT_API}/analytics/occupancy?${params}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<BedOccupancyStats>(response);
}

/**
 * Get ward-wise occupancy data
 */
export async function getWardOccupancy(
  orgId: string,
  userId?: string,
  locationId?: string
): Promise<WardOccupancyData[]> {
  const params = new URLSearchParams();
  if (locationId) params.append('locationId', locationId);

  const response = await fetch(`${BED_MANAGEMENT_API}/analytics/ward-occupancy?${params}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<WardOccupancyData[]>(response);
}

/**
 * Get hospitalization summary
 */
export async function getHospitalizationSummary(
  orgId: string,
  userId?: string,
  locationId?: string
): Promise<HospitalizationSummary> {
  const params = new URLSearchParams();
  if (locationId) params.append('locationId', locationId);

  const response = await fetch(`${BED_MANAGEMENT_API}/analytics/summary?${params}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<HospitalizationSummary>(response);
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get available beds for a ward
 */
export async function getAvailableBeds(
  orgId: string,
  userId: string | undefined,
  wardId: string
): Promise<Bed[]> {
  return getBeds(orgId, userId, {
    wardId,
    status: 'available',
    active: true,
  });
}

/**
 * Get current inpatients
 */
export async function getCurrentInpatients(
  orgId: string,
  userId?: string,
  locationId?: string
): Promise<Hospitalization[]> {
  return getHospitalizations(orgId, userId, {
    locationId,
    status: 'admitted',
  });
}

/**
 * Get patient hospitalization history
 */
export async function getPatientHospitalizationHistory(
  orgId: string,
  userId: string | undefined,
  patientId: string
): Promise<Hospitalization[]> {
  return getHospitalizations(orgId, userId, {
    patientId,
  });
}

/**
 * Search available beds with criteria
 */
export async function searchAvailableBeds(
  orgId: string,
  userId: string | undefined,
  criteria: {
    wardType?: string;
    bedType?: string;
    hasOxygen?: boolean;
    hasMonitor?: boolean;
    genderRestriction?: string;
  }
): Promise<Bed[]> {
  // Get all available beds
  const beds = await getBeds(orgId, userId, { status: 'available', active: true });

  // Filter based on criteria
  return beds.filter(bed => {
    if (criteria.wardType && bed.ward?.wardType !== criteria.wardType) return false;
    if (criteria.bedType && bed.bedType !== criteria.bedType) return false;
    if (criteria.hasOxygen && !bed.hasOxygen) return false;
    if (criteria.hasMonitor && !bed.hasMonitor) return false;
    if (criteria.genderRestriction && bed.genderRestriction !== 'none' && bed.genderRestriction !== criteria.genderRestriction) return false;
    return true;
  });
}

export default {
  // Ward management
  getWards,
  getWardById,
  createWard,
  updateWard,

  // Bed management
  getBeds,
  getBedById,
  createBed,
  updateBedStatus,
  getAvailableBeds,
  searchAvailableBeds,

  // Hospitalization management
  getHospitalizations,
  getHospitalizationById,
  admitPatient,
  assignBed,
  transferBed,
  dischargePatient,
  getCurrentInpatients,
  getPatientHospitalizationHistory,

  // Analytics
  getBedOccupancyStats,
  getWardOccupancy,
  getHospitalizationSummary,
};
