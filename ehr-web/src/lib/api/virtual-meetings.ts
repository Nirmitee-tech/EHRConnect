/**
 * Virtual Meetings API Client
 * Handles 100ms video meeting operations
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface VirtualMeeting {
  id: string;
  appointmentId?: string;
  encounterId?: string;
  orgId: string;
  meetingId: string;
  meetingCode: string;
  roomUrl: string;
  publicLink: string;
  hostLink?: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  hostPractitionerId?: string;
  patientId?: string;
  startedAt?: string;
  endedAt?: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstantMeetingRequest {
  orgId: string;
  practitionerId?: string;
  patientId?: string;
  displayName?: string;
  recordingEnabled?: boolean;
}

export interface CreateMeetingForAppointmentRequest {
  orgId: string;
  recordingEnabled?: boolean;
}

export interface JoinMeetingRequest {
  displayName: string;
  userId?: string;
  userType?: 'practitioner' | 'guest';
}

export interface JoinMeetingResponse extends VirtualMeeting {
  authToken: string;
  participantId: string;
  encounterId?: string;
}

export interface GenerateTokenRequest {
  userId?: string;
  userType?: string;
  displayName: string;
  role: 'host' | 'guest' | 'viewer';
}

/**
 * Create an instant meeting
 */
export async function createInstantMeeting(
  data: CreateInstantMeetingRequest,
  token?: string
): Promise<VirtualMeeting> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-org-id': data.orgId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/virtual-meetings/instant`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create instant meeting');
  }

  return response.json();
}

/**
 * Create meeting for appointment
 */
export async function createMeetingForAppointment(
  appointmentId: string,
  data: CreateMeetingForAppointmentRequest,
  token?: string
): Promise<VirtualMeeting> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-org-id': data.orgId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}/api/virtual-meetings/appointment/${appointmentId}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create meeting for appointment');
  }

  return response.json();
}

/**
 * Join meeting by code (public - no auth required)
 */
export async function joinMeetingByCode(
  meetingCode: string,
  data: JoinMeetingRequest
): Promise<JoinMeetingResponse> {
  const response = await fetch(
    `${API_BASE}/api/virtual-meetings/join/${meetingCode}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join meeting');
  }

  return response.json();
}

/**
 * Get meeting by code (public)
 */
export async function getMeetingByCode(
  meetingCode: string
): Promise<VirtualMeeting> {
  const response = await fetch(
    `${API_BASE}/api/virtual-meetings/code/${meetingCode}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Meeting not found');
  }

  return response.json();
}

/**
 * Get meeting details
 */
export async function getMeetingDetails(
  meetingId: string,
  token?: string
): Promise<VirtualMeeting> {
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}/api/virtual-meetings/${meetingId}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Meeting not found');
  }

  return response.json();
}

/**
 * End meeting
 */
export async function endMeeting(
  meetingId: string,
  token?: string
): Promise<{ message: string }> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}/api/virtual-meetings/${meetingId}/end`,
    {
      method: 'POST',
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to end meeting');
  }

  return response.json();
}

/**
 * List meetings for organization
 */
export async function listMeetings(
  orgId: string,
  options?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  },
  token?: string
): Promise<{
  data: VirtualMeeting[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}> {
  const params = new URLSearchParams({ org_id: orgId });

  if (options?.status) params.append('status', options.status);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const headers: HeadersInit = {
    'x-org-id': orgId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}/api/virtual-meetings/org/${orgId}?${params.toString()}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list meetings');
  }

  return response.json();
}

/**
 * Generate participant token
 */
export async function generateParticipantToken(
  meetingId: string,
  data: GenerateTokenRequest,
  token?: string
): Promise<{
  token: string;
  participantId: string;
}> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}/api/virtual-meetings/${meetingId}/token`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate token');
  }

  return response.json();
}
