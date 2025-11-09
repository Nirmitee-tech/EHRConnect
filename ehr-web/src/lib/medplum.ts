import { MedplumClient } from '@medplum/core'

// Initialize Medplum client
export const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  fhirUrlPath: 'fhir/R4',
  clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID || 'medplum-client',
  onUnauthenticated: () => {
    // Redirect to sign in page when unauthenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/signin'
    }
  },
})

// FHIR Resource Types commonly used in EHR
export type FHIRResourceType =
  | 'Patient'
  | 'Practitioner'
  | 'Organization'
  | 'Encounter'
  | 'Observation'
  | 'DiagnosticReport'
  | 'Medication'
  | 'MedicationRequest'
  | 'Appointment'
  | 'AllergyIntolerance'
  | 'Condition'
  | 'Procedure'
  | 'DocumentReference'
  | 'ServiceRequest'
  | 'Coverage'
  | 'Communication'
  | 'CommunicationRequest'
  | 'Immunization'
  | 'ImagingStudy'
  | 'Binary'
  | 'Goal'
  | 'Task'
  | 'Questionnaire'
  | 'QuestionnaireResponse'
  | 'RelatedPerson'
  | 'Consent'
  | 'ExplanationOfBenefit'
  | 'Invoice'
  | 'PaymentNotice'
  | 'CarePlan'
  | 'FamilyMemberHistory'

// Generic FHIR search parameters
export interface FHIRSearchParams {
  _count?: number
  _offset?: number
  _sort?: string
  _include?: string
  _revinclude?: string
  [key: string]: any
}

// Common FHIR operations
export class FHIRService {
  private client: MedplumClient

  constructor(client: MedplumClient) {
    this.client = client
  }

  // Generic read operation
  async read<T>(resourceType: FHIRResourceType, id: string): Promise<T> {
    return await this.client.readResource(resourceType, id) as T
  }

  // Generic search operation
  async search<T>(
    resourceType: FHIRResourceType, 
    params?: FHIRSearchParams
  ): Promise<{ entry?: Array<{ resource: T }>, total?: number }> {
    return await this.client.search(resourceType, params) as any
  }

  // Generic create operation
  async create<T>(resource: T): Promise<T> {
    return await this.client.createResource(resource) as T
  }

  // Generic update operation
  async update<T>(resource: T): Promise<T> {
    return await this.client.updateResource(resource) as T
  }

  // Generic delete operation
  async delete(resourceType: FHIRResourceType, id: string): Promise<void> {
    return await this.client.deleteResource(resourceType, id)
  }

  // Patient-specific operations
  async getPatients(params?: FHIRSearchParams) {
    return await this.search('Patient', params)
  }

  async getPatientById(id: string) {
    return await this.read('Patient', id)
  }

  async createPatient(patient: any) {
    return await this.create({ ...patient, resourceType: 'Patient' })
  }

  // Practitioner-specific operations
  async getPractitioners(params?: FHIRSearchParams) {
    return await this.search('Practitioner', params)
  }

  async getPractitionerById(id: string) {
    return await this.read('Practitioner', id)
  }

  // Observation-specific operations
  async getObservations(params?: FHIRSearchParams) {
    return await this.search('Observation', params)
  }

  async getPatientObservations(patientId: string, params?: FHIRSearchParams) {
    return await this.search('Observation', {
      ...params,
      patient: patientId
    })
  }

  // Encounter-specific operations
  async getEncounters(params?: FHIRSearchParams) {
    return await this.search('Encounter', params)
  }

  async getPatientEncounters(patientId: string, params?: FHIRSearchParams) {
    return await this.search('Encounter', {
      ...params,
      patient: patientId
    })
  }

  // Medication-related operations
  async getMedicationRequests(params?: FHIRSearchParams) {
    return await this.search('MedicationRequest', params)
  }

  async getPatientMedications(patientId: string, params?: FHIRSearchParams) {
    return await this.search('MedicationRequest', {
      ...params,
      patient: patientId
    })
  }

  // Appointment operations
  async getAppointments(params?: FHIRSearchParams) {
    return await this.search('Appointment', params)
  }

  async getPatientAppointments(patientId: string, params?: FHIRSearchParams) {
    return await this.search('Appointment', {
      ...params,
      patient: patientId
    })
  }
}

// Export configured service instance
export const fhirService = new FHIRService(medplum)
