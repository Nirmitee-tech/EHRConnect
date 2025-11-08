import { fhirService } from '@/lib/medplum';
import {
  FHIRPatient,
  FHIRBundle,
  FHIROrganization,
  FHIRRelatedPerson,
  FHIRCoverage,
  FHIRConsent,
  FHIRContactPoint,
  FHIRIdentifier,
  PatientSummary,
  FacilitySummary,
  AuditLogEntry
} from '@/types/fhir';

export interface PatientSearchParams {
  facilityId?: string;
  active?: boolean;
  name?: string;
  mrn?: string;
  gender?: string;
  birthDate?: string;
  _count?: number;
  _offset?: number;
  _sort?: string;
}

export interface AddressPayload {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ProviderInfoPayload {
  primaryProviderId: string;
  providerLocationId: string;
  registrationDate: string;
  referredBy?: string;
}

export interface DemographicsPayload {
  photo?: string;
  prefix: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  age?: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  pronouns?: string;
  maritalStatus?: string;
  occupation?: string;
  employer?: string;
  timeZone?: string;
  language?: string;
  race?: string;
  ethnicity?: string;
  religion?: string;
  bloodGroup?: string;
  ssn?: string;
  hospitalId?: string;
  healthId?: string;
  mrn?: string;
  preferredCommunication?: string;
  disabilityStatus?: string;
}

export interface ContactPayload {
  mobileNumber: string;
  homeNumber?: string;
  email: string;
  faxNumber?: string;
  address: AddressPayload;
  preferredContactTime?: string;
}

export interface EmergencyContactPayload {
  relationship?: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
}

export interface InsurancePayload {
  insuranceType: string;
  insuranceName: string;
  planType?: string;
  planName?: string;
  memberId: string;
  groupId?: string;
  groupName?: string;
  effectiveStart: string;
  effectiveEnd: string;
  relationshipToInsured: string;
  insuredFirstName?: string;
  insuredLastName?: string;
  insuredAddress: AddressPayload;
  insuredPhone?: string;
  insuredEmail?: string;
  cardImage?: string;
}

export interface PreferencesPayload {
  pharmacy?: string;
  lab?: string;
  radiology?: string;
  preferredDoctorGender?: string;
  preferredHospital?: string;
  preferredContactMethod?: string;
}

export interface ConsentPayload {
  consentEmail: boolean;
  consentCall: boolean;
  consentMessage: boolean;
  allowDataSharing: boolean;
  patientStatus: 'active' | 'inactive';
  dataCaptureDate?: string;
  signature?: string;
}

export interface ClinicalPayload {
  allergies?: string;
  chronicConditions?: string;
  allergiesList?: string[];
  chronicConditionsList?: string[];
  smokingStatus?: string;
  alcoholUse?: string;
  heightCm?: string;
  weightKg?: string;
  bmi?: string;
}

export interface CreatePatientRequest {
  facilityId: string;
  provider: ProviderInfoPayload;
  demographics: DemographicsPayload;
  contact: ContactPayload;
  emergencyContacts: EmergencyContactPayload[];
  insurance?: InsurancePayload;
  preferences?: PreferencesPayload;
  consent: ConsentPayload;
  clinical?: ClinicalPayload;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: string;
  active?: boolean;
}

export class PatientService {
  private auditLog: AuditLogEntry[] = [];

  /**
   * Search patients with facility filtering and other criteria
   */
  async searchPatients(params: PatientSearchParams = {}): Promise<{
    patients: PatientSummary[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const searchParams: Record<string, string | number | boolean> = {
        _count: params._count || 50,
        _offset: params._offset || 0,
        _sort: params._sort || '-_lastUpdated',
        _include: 'Patient:organization'
      };

      // Filter by facility (organization)
      if (params.facilityId) {
        searchParams.organization = params.facilityId;
      }

      // Filter by active status
      if (params.active !== undefined) {
        searchParams.active = params.active;
      }

      // Name search
      if (params.name) {
        searchParams.name = params.name;
      }

      // MRN search
      if (params.mrn) {
        searchParams.identifier = params.mrn;
      }

      // Gender filter
      if (params.gender) {
        searchParams.gender = params.gender;
      }

      // Birth date filter
      if (params.birthDate) {
        searchParams.birthdate = params.birthDate;
      }

      const response = await fhirService.search('Patient', searchParams);
      
      const patients: PatientSummary[] = [];
      const facilities = new Map<string, string>();

      if (response.entry) {
        // Extract facilities from included resources
        response.entry
          .filter(entry => this.isOrganizationResource(entry.resource))
          .forEach(entry => {
            const org = entry.resource as FHIROrganization;
            if (org.id && org.name) {
              facilities.set(org.id, org.name);
            }
          });

        // Process patient entries
        response.entry
          .filter(entry => this.isPatientResource(entry.resource))
          .forEach(entry => {
            const patient = entry.resource as FHIRPatient;
            const summary = this.convertToPatientSummary(patient, facilities);
            if (summary) {
              patients.push(summary);
            }
          });
      }

      return {
        patients,
        total: response.total || 0,
        hasMore: patients.length === (params._count || 50)
      };

    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Failed to search patients');
    }
  }

  /**
   * Get a single patient by ID
   */
  async getPatientById(id: string): Promise<FHIRPatient | null> {
    try {
      return await fhirService.getPatientById(id) as FHIRPatient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(request: CreatePatientRequest, userId: string): Promise<FHIRPatient> {
    try {
      const patientResource = this.buildPatientResource(request);
      console.log('Creating patient with enhanced demographics:', patientResource.id ?? 'pending assignment');

      const createdPatient = await fhirService.createPatient(patientResource) as FHIRPatient;
      if (createdPatient.id) {
        await this.syncAncillaryResources(request, createdPatient.id);
      }

      // Log audit entry
      this.logAudit({
        resourceType: 'Patient',
        resourceId: createdPatient.id!,
        action: 'CREATE',
        userId,
        facilityId: request.facilityId,
        timestamp: new Date().toISOString(),
        changes: request as unknown as Record<string, unknown>
      });

      return createdPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient');
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(request: UpdatePatientRequest, userId: string): Promise<FHIRPatient> {
    try {
      // Get existing patient first
      const existingPatient = await this.getPatientById(request.id);
      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      if (!request.provider || !request.demographics || !request.contact || !request.consent) {
        throw new Error('Incomplete payload for patient update');
      }

      const facilityId = request.facilityId || this.extractFacilityId(existingPatient);

      const rebuildPayload: CreatePatientRequest = {
        facilityId,
        provider: request.provider,
        demographics: request.demographics,
        contact: request.contact,
        emergencyContacts: request.emergencyContacts || [],
        insurance: request.insurance,
        preferences: request.preferences,
        consent: request.consent,
        clinical: request.clinical
      };

      const rebuiltPatient = this.buildPatientResource(rebuildPayload);
      const updatedPatient: FHIRPatient = {
        ...existingPatient,
        ...rebuiltPatient,
        id: existingPatient.id
      };

      const result = await fhirService.update(updatedPatient) as FHIRPatient;

      // Log audit entry
      this.logAudit({
        resourceType: 'Patient',
        resourceId: request.id,
        action: 'UPDATE',
        userId,
        facilityId: request.facilityId || this.extractFacilityId(existingPatient),
        timestamp: new Date().toISOString(),
        changes: request as unknown as Record<string, unknown>
      });

      return result;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient');
    }
  }

  /**
   * Soft delete a patient (set active = false)
   */
  async softDeletePatient(id: string, userId: string): Promise<FHIRPatient> {
    try {
      const existingPatient = await this.getPatientById(id);
      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      const deactivatedPatient = {
        ...existingPatient,
        active: false
      };

      const result = await fhirService.update(deactivatedPatient) as FHIRPatient;

      // Log audit entry
      this.logAudit({
        resourceType: 'Patient',
        resourceId: id,
        action: 'DELETE',
        userId,
        facilityId: this.extractFacilityId(existingPatient),
        timestamp: new Date().toISOString(),
        changes: { active: false }
      });

      return result;
    } catch (error) {
      console.error('Error soft deleting patient:', error);
      throw new Error('Failed to delete patient');
    }
  }

  /**
   * Get patients by facility
   */
  async getPatientsByFacility(facilityId: string, params: Omit<PatientSearchParams, 'facilityId'> = {}): Promise<{
    patients: PatientSummary[];
    total: number;
    hasMore: boolean;
  }> {
    return this.searchPatients({ ...params, facilityId });
  }

  /**
   * Convert FHIR Patient to PatientSummary
   */
  private convertToPatientSummary(
    patient: FHIRPatient, 
    facilities: Map<string, string>
  ): PatientSummary | null {
    if (!patient.id) return null;

    const name = this.extractPatientName(patient);
    const mrn = this.extractMRN(patient);
    const facilityId = this.extractFacilityId(patient);
    const facilityName = facilityId ? facilities.get(facilityId) : undefined;

    return {
      id: patient.id,
      name,
      dateOfBirth: patient.birthDate || '',
      gender: patient.gender || 'unknown',
      mrn,
      facilityId,
      facilityName,
      active: patient.active !== false,
      lastUpdated: patient.meta?.lastUpdated
    };
  }

  /**
   * Extract patient name from FHIR resource
   */
  private extractPatientName(patient: FHIRPatient): string {
    const name = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
    if (!name) return 'Unknown';

    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    
    return `${given} ${family}`.trim() || 'Unknown';
  }

  /**
   * Extract MRN from patient identifiers
   */
  private extractMRN(patient: FHIRPatient): string | undefined {
    return patient.identifier?.find(
      id => id.type?.coding?.some(c => c.code === 'MR')
    )?.value;
  }

  /**
   * Extract facility ID from managing organization
   */
  private extractFacilityId(patient: FHIRPatient): string {
    const ref = patient.managingOrganization?.reference;
    if (ref?.startsWith('Organization/')) {
      return ref.substring('Organization/'.length);
    }
    return patient.managingOrganization?.reference || '';
  }

  /**
   * Build FHIR Patient resource from request
   */
  private buildPatientResource(request: CreatePatientRequest): Omit<FHIRPatient, 'id'> {
    const { demographics, contact, consent, preferences, clinical, provider } = request;

    const identifiers: FHIRIdentifier[] = [];
    const mrnValue = (demographics.mrn || '').trim() || this.generateMRN();

    identifiers.push({
      use: 'official',
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical Record Number'
          }
        ]
      },
      value: mrnValue
    });

    const addIdentifier = (system: string, value?: string, code?: string, display?: string) => {
      if (!value) return;
      identifiers.push({
        use: 'official',
        system,
        value: value.trim(),
        type: code
          ? {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code,
                  display
                }
              ]
            }
          : undefined
      });
    };

    addIdentifier('urn:oid:ehrconnect:hospital-id', demographics.hospitalId, 'HPI', 'Hospital ID');
    addIdentifier('urn:oid:ehrconnect:health-id', demographics.healthId, 'NI', 'Health ID');
    addIdentifier('http://hl7.org/fhir/sid/us-ssn', demographics.ssn, 'SS', 'Social Security Number');

    const telecom: FHIRContactPoint[] = [
      contact.mobileNumber
        ? { system: 'phone', value: contact.mobileNumber, use: 'mobile', rank: 1 }
        : undefined,
      contact.homeNumber
        ? { system: 'phone', value: contact.homeNumber, use: 'home', rank: 2 }
        : undefined,
      contact.email
        ? { system: 'email', value: contact.email, use: 'home', rank: 1 }
        : undefined,
      contact.faxNumber ? { system: 'fax', value: contact.faxNumber, use: 'work' } : undefined
    ].filter(Boolean) as FHIRContactPoint[];

    const addressLines = [contact.address.line1, contact.address.line2]
      .filter(Boolean)
      .map(line => line.trim());

    const extensions: any[] = [];
    const pushExtension = (extension?: any) => {
      if (!extension) return;
      extensions.push(extension);
    };

    pushExtension(
      provider.primaryProviderId
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/primary-provider',
            valueString: provider.primaryProviderId
          }
        : undefined
    );
    pushExtension(
      provider.providerLocationId
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/primary-location',
            valueString: provider.providerLocationId
          }
        : undefined
    );
    pushExtension(
      provider.registrationDate
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/registration-date',
            valueDate: provider.registrationDate
          }
        : undefined
    );
    pushExtension(
      provider.referredBy
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/referred-by',
            valueString: provider.referredBy
          }
        : undefined
    );
    pushExtension(
      demographics.pronouns
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-pronouns',
            valueString: demographics.pronouns
          }
        : undefined
    );
    pushExtension(
      demographics.timeZone
        ? {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-timezone',
            valueCode: demographics.timeZone
          }
        : undefined
    );
    pushExtension(
      demographics.occupation
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-occupation',
            valueString: demographics.occupation
          }
        : undefined
    );
    pushExtension(
      demographics.employer
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-employer',
            valueString: demographics.employer
          }
        : undefined
    );
    pushExtension(
      demographics.religion
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-religion',
            valueString: demographics.religion
          }
        : undefined
    );
    pushExtension(
      demographics.bloodGroup
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-blood-group',
            valueString: demographics.bloodGroup
          }
        : undefined
    );
    pushExtension(
      demographics.disabilityStatus
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-disability',
            valueString: demographics.disabilityStatus
          }
        : undefined
    );
    pushExtension(
      demographics.preferredCommunication
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/preferred-communication',
            valueString: demographics.preferredCommunication
          }
        : undefined
    );
    pushExtension(
      contact.preferredContactTime
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/preferred-contact-time',
            valueString: contact.preferredContactTime
          }
        : undefined
    );
    pushExtension(
      demographics.race
        ? {
            url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
            valueCodeableConcept: {
              text: demographics.race,
              coding: [
                {
                  system: 'urn:oid:2.16.840.1.113883.6.238',
                  code: demographics.race,
                  display: demographics.race
                }
              ]
            }
          }
        : undefined
    );
    pushExtension(
      demographics.ethnicity
        ? {
            url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity',
            valueCodeableConcept: {
              text: demographics.ethnicity,
              coding: [
                {
                  system: 'urn:oid:2.16.840.1.113883.6.238',
                  code: demographics.ethnicity,
                  display: demographics.ethnicity
                }
              ]
            }
          }
        : undefined
    );
    pushExtension(
      preferences
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-preferences',
            valueString: JSON.stringify(preferences)
          }
        : undefined
    );
    pushExtension(
      clinical
        ? {
            url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-clinical-profile',
            valueString: JSON.stringify(clinical)
          }
        : undefined
    );

    const maritalDisplay = this.mapMaritalStatusDisplay(demographics.maritalStatus);

    const photo = demographics.photo
      ? [
          {
            contentType: demographics.photo.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
            data: demographics.photo.split(',')[1] || demographics.photo,
            url: demographics.photo
          }
        ]
      : undefined;

    const emergencyContact = request.emergencyContacts
      ?.filter(ec => ec.firstName || ec.lastName || ec.mobileNumber)
      .slice(0, 1)
      .map(contactEntry => ({
        relationship: contactEntry.relationship
          ? [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
                    code: contactEntry.relationship,
                    display: contactEntry.relationship
                  }
                ]
              }
            ]
          : undefined,
        name: {
          family: contactEntry.lastName,
          given: [contactEntry.firstName].filter(Boolean)
        },
        telecom: [
          contactEntry.mobileNumber
            ? { system: 'phone', value: contactEntry.mobileNumber, use: 'mobile' }
            : undefined,
          contactEntry.email ? { system: 'email', value: contactEntry.email, use: 'home' } : undefined
        ].filter(Boolean),
        gender: 'unknown'
      }));

    return {
      resourceType: 'Patient',
      identifier: identifiers,
      active: consent.patientStatus !== 'inactive',
      name: [
        {
          use: 'official',
          family: demographics.lastName,
          given: [demographics.firstName, demographics.middleName].filter(Boolean),
          text: demographics.preferredName || undefined,
          prefix: [demographics.prefix].filter(Boolean)
        }
      ],
      telecom: telecom.length ? telecom : undefined,
      gender: demographics.gender,
      birthDate: demographics.dateOfBirth,
      photo,
      address: [
        {
          use: 'home',
          type: 'physical',
          line: addressLines,
          city: contact.address.city,
          state: contact.address.state,
          postalCode: contact.address.postalCode,
          country: contact.address.country || 'US'
        }
      ],
      maritalStatus: maritalDisplay
        ? {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
                code: demographics.maritalStatus,
                display: maritalDisplay
              }
            ],
            text: maritalDisplay
          }
        : undefined,
      communication: demographics.language
        ? [
            {
              language: {
                coding: [
                  {
                    system: 'urn:ietf:bcp:47',
                    code: demographics.language,
                    display: demographics.language
                  }
                ],
                text: demographics.language
              },
              preferred: true
            }
          ]
        : undefined,
      contact: emergencyContact,
      managingOrganization: {
        reference: `Organization/${request.facilityId}`
      },
      extension: extensions.length ? extensions : undefined
    };
  }

  private async syncAncillaryResources(request: CreatePatientRequest, patientId: string): Promise<void> {
    const relatedPersons = this.buildRelatedPersonResources(request, patientId);
    for (const related of relatedPersons) {
      await fhirService.create(related);
    }

    const coverage = this.buildCoverageResource(request, patientId);
    if (coverage) {
      await fhirService.create(coverage);
    }

    const consent = this.buildConsentResource(request, patientId);
    if (consent) {
      await fhirService.create(consent);
    }
  }

  private buildRelatedPersonResources(
    request: CreatePatientRequest,
    patientId: string
  ): FHIRRelatedPerson[] {
    return request.emergencyContacts
      .filter(contact => contact.firstName || contact.lastName || contact.mobileNumber)
      .map(contact => ({
        resourceType: 'RelatedPerson',
        patient: { reference: `Patient/${patientId}` },
        relationship: contact.relationship
          ? [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
                    code: contact.relationship,
                    display: contact.relationship
                  }
                ],
                text: contact.relationship
              }
            ]
          : undefined,
        name: {
          family: contact.lastName,
          given: [contact.firstName].filter(Boolean)
        },
        telecom: [
          contact.mobileNumber
            ? { system: 'phone', value: contact.mobileNumber, use: 'mobile' }
            : undefined,
          contact.email ? { system: 'email', value: contact.email, use: 'home' } : undefined
        ].filter(Boolean)
      }));
  }

  private buildCoverageResource(
    request: CreatePatientRequest,
    patientId: string
  ): FHIRCoverage | null {
    const insurance = request.insurance;
    if (!insurance || !insurance.insuranceName || !insurance.memberId) {
      return null;
    }

    const relationshipDisplay = insurance.relationshipToInsured || 'self';
    const relationshipCodeMap: Record<string, string> = {
      self: 'self',
      spouse: 'spouse',
      child: 'child',
      other: 'other'
    };

    const coverage: FHIRCoverage = {
      resourceType: 'Coverage',
      status: 'active',
      type: insurance.insuranceType
        ? {
            text: insurance.insuranceType
          }
        : undefined,
      subscriberId: insurance.memberId,
      subscriber: insurance.insuredFirstName || insurance.insuredLastName
        ? {
            display: `${insurance.insuredFirstName || ''} ${insurance.insuredLastName || ''}`.trim()
          }
        : undefined,
      beneficiary: { reference: `Patient/${patientId}` },
      relationship: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/subscriber-relationship',
            code: relationshipCodeMap[relationshipDisplay] || 'other',
            display: relationshipDisplay
          }
        ],
        text: relationshipDisplay
      },
      period: {
        start: insurance.effectiveStart,
        end: insurance.effectiveEnd
      },
      payor: [
        {
          display: insurance.insuranceName
        }
      ],
      class: [
        insurance.planType
          ? {
              type: { text: 'Plan Type' },
              value: insurance.planType
            }
          : null,
        insurance.planName
          ? {
              type: { text: 'Plan Name' },
              value: insurance.planName
            }
          : null,
        insurance.groupId
          ? {
              type: { text: 'Group' },
              value: insurance.groupId,
              name: insurance.groupName
            }
          : null
      ].filter(Boolean) as FHIRCoverage['class']
    };

    if (insurance.cardImage) {
      coverage.extension = [
        {
          url: 'http://ehrconnect.io/fhir/StructureDefinition/coverage-card-image',
          valueAttachment: {
            contentType: insurance.cardImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
            data: insurance.cardImage.split(',')[1] || insurance.cardImage
          }
        }
      ];
    }

    return coverage;
  }

  private buildConsentResource(
    request: CreatePatientRequest,
    patientId: string
  ): FHIRConsent | null {
    const { consent, facilityId } = request;
    if (!consent) {
      return null;
    }

    const communicationCodes: { code: string; display: string }[] = [];
    if (consent.consentEmail) {
      communicationCodes.push({ code: 'EMAIL', display: 'Email' });
    }
    if (consent.consentCall) {
      communicationCodes.push({ code: 'CALL', display: 'Phone call' });
    }
    if (consent.consentMessage) {
      communicationCodes.push({ code: 'SMS', display: 'Text message' });
    }

    return {
      resourceType: 'Consent',
      status: 'active',
      category: [
        {
          coding: [
            {
              system: 'http://loinc.org',
              code: '59284-0',
              display: 'Patient Consent'
            }
          ]
        }
      ],
      patient: { reference: `Patient/${patientId}` },
      dateTime: consent.dataCaptureDate || new Date().toISOString(),
      performer: facilityId ? [{ reference: `Organization/${facilityId}` }] : undefined,
      provision: communicationCodes.length
        ? {
            type: 'permit',
            code: communicationCodes.map(code => ({
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                  code: code.code,
                  display: code.display
                }
              ]
            }))
          }
        : undefined,
      extension: [
        {
          url: 'http://ehrconnect.io/fhir/StructureDefinition/data-sharing',
          valueBoolean: consent.allowDataSharing
        },
        {
          url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-status',
          valueCode: consent.patientStatus
        }
      ]
    };
  }

  private mapMaritalStatusDisplay(code?: string): string | undefined {
    if (!code) return undefined;
    const displayMap: Record<string, string> = {
      S: 'Never Married',
      M: 'Married',
      D: 'Divorced',
      W: 'Widowed',
      U: 'Unknown'
    };
    return displayMap[code] || code;
  }

  private generateMRN(): string {
    const prefix = 'MRN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Log audit entry
   */
  private logAudit(entry: Omit<AuditLogEntry, 'id'>): void {
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      ...entry
    };
    this.auditLog.push(auditEntry);
    
    // In a real implementation, this would be sent to an audit service
    console.log('AUDIT:', auditEntry);
  }

  /**
   * Get audit logs (for demo purposes)
   */
  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Type guard to check if a resource is an Organization
   */
  private isOrganizationResource(resource: unknown): resource is FHIROrganization {
    return typeof resource === 'object' && resource !== null && 
           'resourceType' in resource && 
           (resource as { resourceType: string }).resourceType === 'Organization';
  }

  /**
   * Type guard to check if a resource is a Patient
   */
  private isPatientResource(resource: unknown): resource is FHIRPatient {
    return typeof resource === 'object' && resource !== null && 
           'resourceType' in resource && 
           (resource as { resourceType: string }).resourceType === 'Patient';
  }
}

// Export singleton instance
export const patientService = new PatientService();
