import { medplum } from '@/lib/medplum'
import type {
  Patient,
  Address,
  Appointment,
  AppointmentParticipant,
  Bundle,
  Observation,
  MedicationRequest,
  AllergyIntolerance,
  Condition,
  Encounter,
  DocumentReference,
  Communication,
  Consent,
  Coverage,
  RelatedPerson,
  ExplanationOfBenefit,
  Invoice,
  Questionnaire,
  QuestionnaireResponse,
  Task,
  FhirExtension,
  FhirContactPoint,
  FhirIdentifier,
  FhirCoding,
} from '@medplum/fhirtypes'

interface PatientRegistrationData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address?: {
    line: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

interface PatientDashboardData {
  upcomingAppointments: Appointment[]
  recentEncounters: Encounter[]
  medications: MedicationRequest[]
  allergies: AllergyIntolerance[]
  conditions: Condition[]
  vitalSigns: Observation[]
  unreadMessages: number
  pendingDocuments: number
}

interface AppointmentSearchParams {
  status?: string[]
  dateRange?: { start: string; end: string }
  practitionerId?: string
  serviceType?: string
}

export interface PatientPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  shareHealthData: boolean
  telehealthReminders: boolean
}

export interface PatientNotification {
  id: string
  type: 'appointment' | 'message' | 'document'
  title: string
  description: string
  date: string
  status?: string
  link?: string
}

export interface PatientFormAssignment {
  id: string
  title: string
  description?: string
  status: 'not-started' | 'in-progress' | 'completed'
  dueDate?: string
  submittedOn?: string
  questionnaire?: Questionnaire
  questionnaireResponse?: QuestionnaireResponse
}

const PATIENT_PREFERENCES_URL = 'urn:oid:ehrconnect:patient-preferences'

export const DEFAULT_PATIENT_PREFERENCES: PatientPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  shareHealthData: false,
  telehealthReminders: true,
}

export class PatientPortalService {
  /**
   * Find patient by email (search by email identifier)
   */
  static async findPatientByEmail(email: string): Promise<Patient | null> {
    try {
      const bundle = await medplum.search('Patient', {
        identifier: `email|${email}`,
        _count: 1,
      })

      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry[0].resource as Patient
      }

      return null
    } catch (error) {
      console.error('Error finding patient by email:', error)
      return null
    }
  }

  /**
   * Register a new patient in the system
   */
  static async registerPatient(
    data: PatientRegistrationData,
    hashedPassword: string
  ): Promise<Patient> {
    try {
      // Generate unique patient identifier (MRN)
      const mrn = await this.generateMRN()

      // Construct FHIR Patient resource
      const patientResource: Patient = {
        resourceType: 'Patient',
        identifier: [
          {
            use: 'official',
            system: 'urn:oid:ehrconnect:mrn',
            value: mrn,
          },
          {
            use: 'secondary',
            system: 'email',
            value: data.email,
          },
        ],
        active: true,
        name: [
          {
            use: 'official',
            family: data.lastName,
            given: [data.firstName],
            text: `${data.firstName} ${data.lastName}`,
          },
        ],
        telecom: [
          {
            system: 'email',
            value: data.email,
            use: 'home',
            rank: 1,
          },
          {
            system: 'phone',
            value: data.phone,
            use: 'mobile',
            rank: 1,
          },
        ],
        gender: data.gender as 'male' | 'female' | 'other' | 'unknown',
        birthDate: data.dateOfBirth,
        address: data.address ? [data.address as Address] : undefined,
        meta: {
          tag: [
            {
              system: 'urn:oid:ehrconnect:patient-portal',
              code: 'portal-patient',
              display: 'Patient Portal User',
            },
          ],
        },
        extension: [
          {
            url: 'urn:oid:ehrconnect:password',
            valueString: hashedPassword,
          },
          {
            url: 'urn:oid:ehrconnect:email-verified',
            valueBoolean: false,
          },
          {
            url: 'urn:oid:ehrconnect:registered-date',
            valueDateTime: new Date().toISOString(),
          },
        ],
      }

      // Create patient in FHIR server
      const patient = await medplum.createResource(patientResource)

      // Create initial consent record
      await this.createInitialConsent(patient.id!)

      return patient
    } catch (error) {
      console.error('Error registering patient:', error)
      throw new Error('Failed to register patient')
    }
  }

  /**
   * Generate unique Medical Record Number (MRN)
   */
  static async generateMRN(): Promise<string> {
    const prefix = 'PT'
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')

    return `${prefix}${timestamp}${random}`
  }

  /**
   * Create initial consent record for new patient
   */
  static async createInitialConsent(patientId: string): Promise<Consent> {
    const consent: Consent = {
      resourceType: 'Consent',
      status: 'active',
      scope: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/consentscope',
            code: 'patient-privacy',
            display: 'Privacy Consent',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes',
              code: 'hipaa',
              display: 'HIPAA Authorization',
            },
          ],
        },
      ],
      patient: {
        reference: `Patient/${patientId}`,
      },
      dateTime: new Date().toISOString(),
      provision: {
        type: 'permit',
        period: {
          start: new Date().toISOString(),
        },
      },
    }

    return await medplum.createResource(consent)
  }

  /**
   * Authenticate patient by email and password
   */
  static async authenticatePatient(
    email: string,
    password: string
  ): Promise<{ patient: Patient | null; success: boolean }> {
    try {
      const patient = await this.findPatientByEmail(email)

      if (!patient) {
        return { patient: null, success: false }
      }

      // Get hashed password from extension
      const passwordExt = patient.extension?.find(
        (ext) => ext.url === 'urn:oid:ehrconnect:password'
      )

      if (!passwordExt?.valueString) {
        return { patient, success: false }
      }

      // Compare passwords (you'll need to import bcrypt.compare)
      const { compare } = await import('bcryptjs')
      const isValid = await compare(password, passwordExt.valueString)

      return { patient: isValid ? patient : null, success: isValid }
    } catch (error) {
      console.error('Error authenticating patient:', error)
      return { patient: null, success: false }
    }
  }

  /**
   * Get patient dashboard data
   */
  static async getPatientDashboard(patientId: string): Promise<PatientDashboardData> {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Fetch upcoming appointments
      const appointmentsBundle = await medplum.search('Appointment', {
        patient: `Patient/${patientId}`,
        date: `ge${now.toISOString().split('T')[0]}`,
        status: 'booked,pending,arrived,checked-in',
        _sort: 'date',
        _count: 5,
      })

      // Fetch recent encounters
      const encountersBundle = await medplum.search('Encounter', {
        patient: `Patient/${patientId}`,
        date: `ge${thirtyDaysAgo.toISOString().split('T')[0]}`,
        _sort: '-date',
        _count: 5,
      })

      // Fetch active medications
      const medicationsBundle = await medplum.search('MedicationRequest', {
        patient: `Patient/${patientId}`,
        status: 'active',
        _sort: '-authored-on',
      })

      // Fetch allergies
      const allergiesBundle = await medplum.search('AllergyIntolerance', {
        patient: `Patient/${patientId}`,
        'clinical-status': 'active',
      })

      // Fetch active conditions
      const conditionsBundle = await medplum.search('Condition', {
        patient: `Patient/${patientId}`,
        'clinical-status': 'active',
      })

      // Fetch recent vital signs
      const vitalsBundle = await medplum.search('Observation', {
        patient: `Patient/${patientId}`,
        category: 'vital-signs',
        date: `ge${thirtyDaysAgo.toISOString().split('T')[0]}`,
        _sort: '-date',
        _count: 10,
      })

      // Count unread messages
      const messagesBundle = await medplum.search('Communication', {
        recipient: `Patient/${patientId}`,
        status: 'completed',
        _count: 0,
        _summary: 'count',
      })

      // Count pending documents
      const documentsBundle = await medplum.search('DocumentReference', {
        subject: `Patient/${patientId}`,
        status: 'current',
        _count: 0,
        _summary: 'count',
      })

      return {
        upcomingAppointments: appointmentsBundle.entry?.map((e) => e.resource as Appointment) || [],
        recentEncounters: encountersBundle.entry?.map((e) => e.resource as Encounter) || [],
        medications: medicationsBundle.entry?.map((e) => e.resource as MedicationRequest) || [],
        allergies: allergiesBundle.entry?.map((e) => e.resource as AllergyIntolerance) || [],
        conditions: conditionsBundle.entry?.map((e) => e.resource as Condition) || [],
        vitalSigns: vitalsBundle.entry?.map((e) => e.resource as Observation) || [],
        unreadMessages: messagesBundle.total || 0,
        pendingDocuments: documentsBundle.total || 0,
      }
    } catch (error) {
      console.error('Error fetching patient dashboard:', error)
      throw error
    }
  }

  /**
   * Get patient appointments with filtering
   */
  static async getPatientAppointments(
    patientId: string,
    params?: AppointmentSearchParams
  ): Promise<Appointment[]> {
    try {
      const searchParams: Record<string, string> = {
        patient: `Patient/${patientId}`,
        _sort: '-date',
        _count: '50',
      }

      if (params?.status && params.status.length > 0) {
        searchParams.status = params.status.join(',')
      }

      if (params?.dateRange) {
        searchParams.date = `ge${params.dateRange.start},le${params.dateRange.end}`
      }

      if (params?.practitionerId) {
        searchParams.practitioner = `Practitioner/${params.practitionerId}`
      }

      if (params?.serviceType) {
        searchParams['service-type'] = params.serviceType
      }

      const bundle = await medplum.search('Appointment', searchParams)

      return bundle.entry?.map((e) => e.resource as Appointment) || []
    } catch (error) {
      console.error('Error fetching patient appointments:', error)
      throw error
    }
  }

  /**
   * Get patient health records
   */
  static async getPatientHealthRecords(patientId: string) {
    try {
      const [medications, allergies, conditions, observations, immunizations] = await Promise.all([
        medplum.search('MedicationRequest', {
          patient: `Patient/${patientId}`,
          _sort: '-authored-on',
        }),
        medplum.search('AllergyIntolerance', {
          patient: `Patient/${patientId}`,
          _sort: '-recorded-date',
        }),
        medplum.search('Condition', {
          patient: `Patient/${patientId}`,
          _sort: '-recorded-date',
        }),
        medplum.search('Observation', {
          patient: `Patient/${patientId}`,
          _sort: '-date',
          _count: 100,
        }),
        medplum.search('Immunization', {
          patient: `Patient/${patientId}`,
          _sort: '-date',
        }),
      ])

      return {
        medications: medications.entry?.map((e) => e.resource) || [],
        allergies: allergies.entry?.map((e) => e.resource) || [],
        conditions: conditions.entry?.map((e) => e.resource) || [],
        observations: observations.entry?.map((e) => e.resource) || [],
        immunizations: immunizations.entry?.map((e) => e.resource) || [],
      }
    } catch (error) {
      console.error('Error fetching patient health records:', error)
      throw error
    }
  }

  /**
   * Get patient messages
   */
  static async getPatientMessages(patientId: string): Promise<Communication[]> {
    try {
      const bundle = await medplum.search('Communication', {
        recipient: `Patient/${patientId}`,
        _sort: '-sent',
        _count: 50,
      })

      return bundle.entry?.map((e) => e.resource as Communication) || []
    } catch (error) {
      console.error('Error fetching patient messages:', error)
      throw error
    }
  }

  /**
   * Send message to care team
   */
  static async sendMessage(
    patientId: string,
    recipientId: string,
    subject: string,
    message: string
  ): Promise<Communication> {
    try {
      const communication: Communication = {
        resourceType: 'Communication',
        status: 'completed',
        subject: {
          display: subject,
        },
        payload: [
          {
            contentString: message,
          },
        ],
        sender: {
          reference: `Patient/${patientId}`,
        },
        recipient: [
          {
            reference: `Practitioner/${recipientId}`,
          },
        ],
        sent: new Date().toISOString(),
      }

      return await medplum.createResource(communication)
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Get patient documents
   */
  static async getPatientDocuments(patientId: string): Promise<DocumentReference[]> {
    try {
      const bundle = await medplum.search('DocumentReference', {
        subject: `Patient/${patientId}`,
        _sort: '-date',
      })

      return bundle.entry?.map((e) => e.resource as DocumentReference) || []
    } catch (error) {
      console.error('Error fetching patient documents:', error)
      throw error
    }
  }

  /**
   * Get patient billing summary including coverage, explanations of benefits, and invoices
   */
  static async getPatientBillingSummary(patientId: string): Promise<{
    coverages: Coverage[]
    explanations: ExplanationOfBenefit[]
    invoices: Invoice[]
  }> {
    try {
      const [coverageBundle, explanationBundle, invoiceBundle] = await Promise.all([
        medplum.search('Coverage', {
          beneficiary: `Patient/${patientId}`,
          status: 'active,cancelled,draft,entered-in-error',
        }),
        medplum.search('ExplanationOfBenefit', {
          patient: `Patient/${patientId}`,
          _sort: '-created',
          _count: 25,
        }),
        medplum
          .search('Invoice', {
            subject: `Patient/${patientId}`,
            _sort: '-date',
            _count: 25,
          })
          .catch(() => null),
      ])

      return {
        coverages: coverageBundle.entry?.map((e) => e.resource as Coverage) || [],
        explanations: explanationBundle.entry?.map((e) => e.resource as ExplanationOfBenefit) || [],
        invoices: invoiceBundle?.entry?.map((e) => e.resource as Invoice) || [],
      }
    } catch (error) {
      console.error('Error fetching patient billing summary:', error)
      throw error
    }
  }

  /**
   * Get patient family/authorized contacts (RelatedPerson resources)
   */
  static async getPatientFamilyMembers(patientId: string): Promise<RelatedPerson[]> {
    try {
      const bundle = await medplum.search('RelatedPerson', {
        patient: `Patient/${patientId}`,
        _sort: 'name',
        _count: 50,
      })

      return bundle.entry?.map((e) => e.resource as RelatedPerson) || []
    } catch (error) {
      console.error('Error fetching patient family members:', error)
      throw error
    }
  }

  /**
   * Build notifications timeline for patient based on appointments, documents, and communications
   */
  static async getPatientNotifications(patientId: string): Promise<PatientNotification[]> {
    try {
      const now = new Date()
      const upcomingWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const [appointmentsBundle, communicationsBundle, documentsBundle] = await Promise.all([
        medplum.search('Appointment', {
          patient: `Patient/${patientId}`,
          date: `ge${now.toISOString().split('T')[0]}`,
          status: 'booked,pending,arrived,checked-in',
          _sort: 'date',
          _count: 20,
        }),
        medplum.search('Communication', {
          recipient: `Patient/${patientId}`,
          _sort: '-sent',
          _count: 20,
        }),
        medplum.search('DocumentReference', {
          subject: `Patient/${patientId}`,
          _sort: '-date',
          _count: 20,
        }),
      ])

      const notifications: PatientNotification[] = []

      appointmentsBundle.entry?.forEach((entry) => {
        const appointment = entry.resource as Appointment
        const startDate = appointment.start ? new Date(appointment.start) : null

        if (startDate && startDate <= upcomingWindow) {
          const practitioner = appointment.participant?.find((participant) =>
            participant.actor?.reference?.startsWith('Practitioner/')
          )
          notifications.push({
            id: appointment.id || `appointment-${notifications.length}`,
            type: 'appointment',
            title: practitioner?.actor?.display
              ? `Appointment with ${practitioner.actor.display}`
              : 'Upcoming appointment',
            description: startDate
              ? `Scheduled for ${startDate.toLocaleString()}`
              : 'Upcoming appointment scheduled',
            date: appointment.start || new Date().toISOString(),
            status: appointment.status,
            link: appointment.id ? `/portal/appointments/${appointment.id}` : undefined,
          })
        }
      })

      communicationsBundle.entry?.forEach((entry) => {
        const communication = entry.resource as Communication
        const senderName = communication.sender?.display || communication.sender?.reference || 'Care team'
        const payloadText = communication.payload?.[0]?.contentString || 'You have a new message.'
        notifications.push({
          id: communication.id || `message-${notifications.length}`,
          type: 'message',
          title: `New message from ${senderName}`,
          description: payloadText.slice(0, 120),
          date: communication.sent || communication.received || new Date().toISOString(),
          status: communication.status,
          link: '/portal/messages',
        })
      })

      documentsBundle.entry?.forEach((entry) => {
        const document = entry.resource as DocumentReference
        notifications.push({
          id: document.id || `document-${notifications.length}`,
          type: 'document',
          title: document.description || document.type?.text || 'New health document available',
          description: document.category?.[0]?.text || 'A new document has been shared with you.',
          date: document.date || document.created || new Date().toISOString(),
          status: document.status,
          link: '/portal/documents',
        })
      })

      return notifications.sort((a, b) => (a.date > b.date ? -1 : 1))
    } catch (error) {
      console.error('Error building patient notifications:', error)
      throw error
    }
  }

  /**
   * Retrieve patient preference flags stored on the Patient resource
   */
  static async getPatientPreferences(patientId: string): Promise<PatientPreferences> {
    try {
      const patient = await medplum.readResource('Patient', patientId)
      const extensions = patient.extension as FhirExtension[] | undefined
      const prefExtension = extensions?.find(
        (ext) => ext.url === PATIENT_PREFERENCES_URL && ext.valueString
      )

      if (!prefExtension?.valueString) {
        return DEFAULT_PATIENT_PREFERENCES
      }

      try {
        const parsed = JSON.parse(prefExtension.valueString) as Partial<PatientPreferences>
        return { ...DEFAULT_PATIENT_PREFERENCES, ...parsed }
      } catch (parseError) {
        console.warn('Failed to parse patient preferences extension:', parseError)
        return DEFAULT_PATIENT_PREFERENCES
      }
    } catch (error) {
      console.error('Error fetching patient preferences:', error)
      throw error
    }
  }

  /**
   * Update patient preference flags stored on the Patient resource
   */
  static async updatePatientPreferences(
    patientId: string,
    preferences: PatientPreferences
  ): Promise<Patient> {
    try {
      const patient = await medplum.readResource('Patient', patientId)
      const existingExtensions = Array.isArray(patient.extension)
        ? (patient.extension as FhirExtension[])
        : []
      const sanitizedExtensions = existingExtensions.filter(
        (ext) => ext.url !== PATIENT_PREFERENCES_URL
      )

      sanitizedExtensions.push({
        url: PATIENT_PREFERENCES_URL,
        valueString: JSON.stringify(preferences),
      } as FhirExtension)

      patient.extension = sanitizedExtensions

      return await medplum.updateResource(patient)
    } catch (error) {
      console.error('Error updating patient preferences:', error)
      throw error
    }
  }

  /**
   * Get patient form assignments (questionnaires to complete)
   */
  static async getPatientForms(patientId: string): Promise<{
    current: PatientFormAssignment[]
    past: PatientFormAssignment[]
  }> {
    const now = new Date()
    const fallback: { current: PatientFormAssignment[]; past: PatientFormAssignment[] } = {
      current: [
        {
          id: 'sample-annual-wellness',
          title: 'Annual Wellness Questionnaire',
          description: 'Share updates about your overall health and lifestyle before your annual visit.',
          status: 'in-progress',
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          questionnaire: {
            resourceType: 'Questionnaire',
            id: 'sample-annual-wellness',
            title: 'Annual Wellness Questionnaire',
          },
        },
        {
          id: 'sample-medication-review',
          title: 'Medication Review Form',
          description: 'Confirm your current medications and note any side effects you may be experiencing.',
          status: 'not-started',
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          questionnaire: {
            resourceType: 'Questionnaire',
            id: 'sample-medication-review',
            title: 'Medication Review Form',
          },
        },
      ],
      past: [
        {
          id: 'sample-post-visit-feedback',
          title: 'Post Visit Feedback',
          description: 'Tell us about your recent visit so we can continue improving your experience.',
          status: 'completed',
          submittedOn: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          questionnaire: {
            resourceType: 'Questionnaire',
            id: 'sample-post-visit-feedback',
            title: 'Post Visit Feedback',
          },
        },
      ],
    }

    try {
      const [taskBundle, responseBundle] = await Promise.all([
        medplum
          .search('Task', {
            for: `Patient/${patientId}`,
            status: 'requested,received,accepted,in-progress',
            _count: 50,
          })
          .catch(() => ({ entry: [] } as Bundle<Task>)),
        medplum
          .search('QuestionnaireResponse', {
            subject: `Patient/${patientId}`,
            _sort: '-authored',
            _count: 100,
          })
          .catch(() => ({ entry: [] } as Bundle<QuestionnaireResponse>)),
      ])

      const taskForms: PatientFormAssignment[] =
        taskBundle.entry?.map((entry) => {
          const task = entry.resource as Task
          const dueDate = task.executionPeriod?.end || task.restriction?.period?.end
          const questionnaireRef = task.focus?.reference || task.input?.[0]?.valueReference?.reference
          const questionnaire: Questionnaire | undefined = questionnaireRef?.startsWith('Questionnaire/')
            ? {
                resourceType: 'Questionnaire',
                id: questionnaireRef.split('/').pop() || questionnaireRef,
                title: task.description || questionnaireRef.split('/').pop() || 'Patient Form',
              }
            : undefined

          return {
            id: task.id || `task-${task.identifier?.[0]?.value || Math.random().toString(36).slice(2)}`,
            title: task.description || questionnaire?.title || 'Patient Form',
            description: task.note?.[0]?.text,
            status: 'not-started',
            dueDate,
            questionnaire,
          }
        }) || []

      const responseForms: PatientFormAssignment[] =
        responseBundle.entry?.map((entry, index) => {
          const response = entry.resource as QuestionnaireResponse
          const canonical = response.questionnaire
          let questionnaire: Questionnaire | undefined
          let title = 'Patient Questionnaire'

          if (typeof canonical === 'string') {
            const segments = canonical.split('/')
            const lastSegment = segments[segments.length - 1]
            title = lastSegment || title
            questionnaire = {
              resourceType: 'Questionnaire',
              id: lastSegment || canonical,
              title,
            }
          }

          const normalizedStatus: PatientFormAssignment['status'] =
            response.status === 'completed'
              ? 'completed'
              : response.status === 'in-progress'
              ? 'in-progress'
              : 'completed'

          return {
            id: response.id || `questionnaire-response-${index}`,
            title: questionnaire?.title || 'Patient Questionnaire',
            description: response.text?.div
              ? response.text.div.replace(/<[^>]+>/g, '').slice(0, 140)
              : undefined,
            status: normalizedStatus,
            submittedOn: response.authored || response.meta?.lastUpdated,
            questionnaire,
            questionnaireResponse: response,
          }
        }) || []

      const allForms: PatientFormAssignment[] = [...taskForms, ...responseForms]

      const nowIso = now.toISOString()
      const currentForms = allForms.filter((form) => {
        if (form.status === 'completed') {
          return false
        }
        if (form.dueDate && form.dueDate < nowIso) {
          return false
        }
        return true
      })

      const pastForms = allForms.filter((form) => {
        if (form.status === 'completed') {
          return true
        }
        if (form.dueDate && form.dueDate < nowIso) {
          return true
        }
        return false
      })

      if (currentForms.length === 0 && pastForms.length === 0) {
        return fallback
      }

      return { current: currentForms, past: pastForms }
    } catch (error) {
      console.error('Error fetching patient forms:', error)
      return fallback
    }
  }

  /**
   * Get telehealth-specific appointments for patient
   */
  static async getPatientTelehealthSessions(patientId: string): Promise<Appointment[]> {
    try {
      const upcomingAppointments = await this.getPatientAppointments(patientId, {
        status: ['booked', 'pending', 'arrived', 'checked-in'],
      })

      return upcomingAppointments.filter((appointment) => {
        const serviceType = appointment.serviceType?.[0]?.text?.toLowerCase() || ''
        const appointmentTypeText = appointment.appointmentType?.text?.toLowerCase() || ''
        const videoExtension = appointment.extension?.some((ext) =>
          (ext.url || '').toLowerCase().includes('telehealth')
        )

        return (
          serviceType.includes('video') ||
          serviceType.includes('telehealth') ||
          appointmentTypeText.includes('video') ||
          appointmentTypeText.includes('telehealth') ||
          videoExtension
        )
      })
    } catch (error) {
      console.error('Error fetching patient telehealth sessions:', error)
      throw error
    }
  }

  /**
   * Book appointment for patient
   */
  static async bookAppointment(
    patientId: string,
    appointmentData: {
      practitionerId: string
      serviceType: string
      start: string
      end: string
      reason?: string
    }
  ): Promise<Appointment> {
    try {
      const appointment: Appointment = {
        resourceType: 'Appointment',
        status: 'pending', // Pending approval
        serviceType: [
          {
            text: appointmentData.serviceType,
          },
        ],
        start: appointmentData.start,
        end: appointmentData.end,
        participant: [
          {
            actor: {
              reference: `Patient/${patientId}`,
            },
            status: 'accepted',
          },
          {
            actor: {
              reference: `Practitioner/${appointmentData.practitionerId}`,
            },
            status: 'needs-action',
          },
        ],
        reasonCode: appointmentData.reason
          ? [
              {
                text: appointmentData.reason,
              },
            ]
          : undefined,
      }

      return await medplum.createResource(appointment)
    } catch (error) {
      console.error('Error booking appointment:', error)
      throw error
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(
    appointmentId: string,
    patientId: string,
    reason?: string
  ): Promise<Appointment> {
    try {
      const appointment = await medplum.readResource('Appointment', appointmentId)

      // Verify patient owns this appointment
      const patientParticipant = appointment.participant?.find((p: AppointmentParticipant) =>
        p.actor?.reference?.includes(`Patient/${patientId}`)
      )

      if (!patientParticipant) {
        throw new Error('Unauthorized to cancel this appointment')
      }

      appointment.status = 'cancelled'
      if (reason) {
        appointment.cancelationReason = {
          text: reason,
        }
      }

      return await medplum.updateResource(appointment)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      throw error
    }
  }

  /**
   * Get patient's insurance coverage
   */
  static async getPatientCoverage(patientId: string): Promise<Coverage[]> {
    try {
      const bundle = await medplum.search('Coverage', {
        beneficiary: `Patient/${patientId}`,
        status: 'active',
      })

      return bundle.entry?.map((e) => e.resource as Coverage) || []
    } catch (error) {
      console.error('Error fetching patient coverage:', error)
      throw error
    }
  }

  /**
   * Update patient profile
   */
  static async updatePatientProfile(
    patientId: string,
    updates: Partial<PatientRegistrationData>
  ): Promise<Patient> {
    try {
      const patient = await medplum.readResource('Patient', patientId)

      // Update name
      if (updates.firstName || updates.lastName) {
        patient.name = [
          {
            use: 'official',
            family: updates.lastName || patient.name?.[0]?.family || '',
            given: [updates.firstName || patient.name?.[0]?.given?.[0] || ''],
            text: `${updates.firstName || patient.name?.[0]?.given?.[0]} ${
              updates.lastName || patient.name?.[0]?.family
            }`,
          },
        ]
      }

      // Update contact info
      if (updates.email || updates.phone) {
        const existingTelecom = Array.isArray(patient.telecom)
          ? (patient.telecom as FhirContactPoint[])
          : []
        const emailContact = existingTelecom.find((t) => t.system === 'email')
        const phoneContact = existingTelecom.find((t) => t.system === 'phone')

        patient.telecom = [
          {
            system: 'email',
            value: updates.email || emailContact?.value || '',
            use: 'home',
          },
          {
            system: 'phone',
            value: updates.phone || phoneContact?.value || '',
            use: 'mobile',
          },
        ]
      }

      // Update address
      if (updates.address) {
        patient.address = [updates.address as Address]
      }

      return await medplum.updateResource(patient)
    } catch (error) {
      console.error('Error updating patient profile:', error)
      throw error
    }
  }

  /**
   * Get patient by ID
   */
  static async getPatientById(patientId: string): Promise<Patient> {
    try {
      return await medplum.readResource('Patient', patientId)
    } catch (error) {
      console.error('Error getting patient by ID:', error)
      throw error
    }
  }

  /**
   * Grant portal access to a patient
   */
  static async grantPortalAccess(
    patientId: string,
    email: string,
    hashedPassword: string
  ): Promise<Patient> {
    try {
      const patient = await medplum.readResource('Patient', patientId)

      // Update email if not already set
      const telecomEntries = Array.isArray(patient.telecom)
        ? (patient.telecom as FhirContactPoint[])
        : []
      const emailContact = telecomEntries.find((t) => t.system === 'email')
      if (!emailContact) {
        telecomEntries.push({
          system: 'email',
          value: email,
          use: 'home',
          rank: 1,
        })
        patient.telecom = telecomEntries
      } else {
        emailContact.value = email
      }

      // Add email identifier if not exists
      const identifiers = Array.isArray(patient.identifier)
        ? (patient.identifier as FhirIdentifier[])
        : []
      const emailIdentifier = identifiers.find((i) => i.system === 'email')
      if (!emailIdentifier) {
        identifiers.push({
          use: 'secondary',
          system: 'email',
          value: email,
        })
        patient.identifier = identifiers
      } else {
        emailIdentifier.value = email
      }

      // Add portal tag
      if (!patient.meta) {
        patient.meta = {}
      }
      if (!patient.meta.tag) {
        patient.meta.tag = []
      }

      const metaTags: FhirCoding[] = Array.isArray(patient.meta.tag)
        ? (patient.meta.tag as FhirCoding[])
        : []
      const hasPortalTag = metaTags.some((tag) => tag.code === 'portal-patient')
      if (!hasPortalTag) {
        metaTags.push({
          system: 'urn:oid:ehrconnect:patient-portal',
          code: 'portal-patient',
          display: 'Patient Portal User',
        })
        patient.meta.tag = metaTags
      }

      // Add or update password extension
      if (!patient.extension) {
        patient.extension = []
      }
      const patientExtensions = patient.extension as FhirExtension[]

      const passwordExtIndex = patientExtensions.findIndex(
        (ext) => ext.url === 'urn:oid:ehrconnect:password'
      )

      if (passwordExtIndex >= 0) {
        patientExtensions[passwordExtIndex].valueString = hashedPassword
      } else {
        patientExtensions.push({
          url: 'urn:oid:ehrconnect:password',
          valueString: hashedPassword,
        } as FhirExtension)
      }

      // Add portal access granted date
      const portalAccessExtIndex = patientExtensions.findIndex(
        (ext) => ext.url === 'urn:oid:ehrconnect:portal-access-granted'
      )

      if (portalAccessExtIndex >= 0) {
        patientExtensions[portalAccessExtIndex].valueDateTime = new Date().toISOString()
      } else {
        patientExtensions.push({
          url: 'urn:oid:ehrconnect:portal-access-granted',
          valueDateTime: new Date().toISOString(),
        } as FhirExtension)
      }

      // Update patient resource
      return await medplum.updateResource(patient)
    } catch (error) {
      console.error('Error granting portal access:', error)
      throw error
    }
  }
}
