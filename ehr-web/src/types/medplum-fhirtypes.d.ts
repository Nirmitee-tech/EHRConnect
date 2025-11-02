declare module '@medplum/fhirtypes' {
  export type FhirIdentifier = {
    use?: string
    system?: string
    value?: string
    type?: FhirCodeableConcept
  }

  export type FhirCoding = {
    system?: string
    code?: string
    display?: string
  }

  export type FhirCodeableConcept = {
    text?: string
    coding?: FhirCoding[]
  }

  export type FhirHumanName = {
    use?: string
    text?: string
    family?: string
    given?: string[]
  }

  export type FhirContactPoint = {
    system?: string
    value?: string
    use?: string
    rank?: number
  }

  export type FhirAddress = {
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }

  export type FhirReference = {
    reference?: string
    display?: string
    identifier?: FhirIdentifier
  }

  export type FhirPeriod = {
    start?: string
    end?: string
  }

  export type FhirMoney = {
    value?: number
    currency?: string
  }

  export type FhirExtension = {
    url?: string
    valueString?: string
    valueBoolean?: boolean
    valueDateTime?: string
    valueCodeableConcept?: FhirCodeableConcept
    valueReference?: FhirReference
    valueInteger?: number
    valueMoney?: FhirMoney
  }

  export type FhirMeta = {
    tag?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    lastUpdated?: string
  }

  export type FhirAnnotation = {
    authorReference?: FhirReference
    time?: string
    text?: string
  }

  export type FhirResourceBase = {
    resourceType?: string
    id?: string
    meta?: FhirMeta
    extension?: FhirExtension[]
    identifier?: FhirIdentifier[]
    [key: string]: unknown
  }

  export type Patient = FhirResourceBase & {
    name?: FhirHumanName[]
    telecom?: FhirContactPoint[]
    gender?: string
    birthDate?: string
    address?: FhirAddress[]
    managingOrganization?: FhirReference
  }

  export type Address = FhirAddress

  export type AppointmentParticipant = {
    actor?: FhirReference
    status?: string
  }

  export type Appointment = FhirResourceBase & {
    status?: string
    start?: string
    end?: string
    minutesDuration?: number
    serviceType?: FhirCodeableConcept[]
    appointmentType?: FhirCodeableConcept
    reasonCode?: FhirCodeableConcept[]
    participant?: AppointmentParticipant[]
  }

  export type Bundle<T = FhirResourceBase> = FhirResourceBase & {
    entry?: Array<{ resource?: T }>
    total?: number
  }

  export type ObservationComponent = {
    code?: FhirCodeableConcept
    valueQuantity?: {
      value?: number
      unit?: string
    }
  }

  export type Observation = FhirResourceBase & {
    status?: string
    category?: FhirCodeableConcept[]
    code?: FhirCodeableConcept
    effectiveDateTime?: string
    valueQuantity?: {
      value?: number
      unit?: string
    }
    component?: ObservationComponent[]
    note?: FhirAnnotation[]
  }

  export type MedicationRequest = FhirResourceBase & {
    status?: string
    intent?: string
    medicationCodeableConcept?: FhirCodeableConcept
    authoredOn?: string
    requester?: FhirReference
    dosageInstruction?: Array<{
      text?: string
    }>
    dispenseRequest?: {
      validityPeriod?: FhirPeriod
    }
  }

  export type AllergyIntolerance = FhirResourceBase & {
    clinicalStatus?: FhirCodeableConcept
    verificationStatus?: FhirCodeableConcept
    type?: string
    category?: string[]
    criticality?: string
    code?: FhirCodeableConcept
    patient?: FhirReference
    encounter?: FhirReference
    recordedDate?: string
    recorder?: FhirReference
    note?: FhirAnnotation[]
    reaction?: Array<{
      manifestation?: FhirCodeableConcept[]
      severity?: string
    }>
  }

  export type Condition = FhirResourceBase & {
    clinicalStatus?: FhirCodeableConcept
    verificationStatus?: FhirCodeableConcept
    category?: FhirCodeableConcept[]
    severity?: FhirCodeableConcept
    code?: FhirCodeableConcept
    bodySite?: FhirCodeableConcept[]
    subject?: FhirReference
    onsetDateTime?: string
    abatementDateTime?: string
    recordedDate?: string
    asserter?: FhirReference
    note?: FhirAnnotation[]
  }

  export type Encounter = FhirResourceBase

  export type DocumentReference = FhirResourceBase & {
    status?: string
    type?: FhirCodeableConcept
    category?: FhirCodeableConcept[]
    subject?: FhirReference
    description?: string
    date?: string
    created?: string
    content?: Array<{
      attachment?: {
        contentType?: string
        language?: string
        url?: string
        title?: string
        creation?: string
        size?: number
      }
    }>
  }

  export type Communication = FhirResourceBase & {
    status?: string
    category?: FhirCodeableConcept[]
    sender?: FhirReference
    recipient?: FhirReference[]
    payload?: Array<{
      contentString?: string
      contentAttachment?: {
        contentType?: string
        url?: string
        title?: string
      }
    }>
    sent?: string
    received?: string
  }
  export type Consent = FhirResourceBase

  export type Coverage = FhirResourceBase & {
    status?: string
    type?: FhirCodeableConcept
    policyHolder?: FhirReference
    subscriber?: FhirReference
    subscriberId?: string
    beneficiary?: FhirReference
    period?: FhirPeriod
    payor?: FhirReference[]
    class?: Array<{
      type?: FhirCodeableConcept
      value?: string
      name?: string
    }>
  }

  export type RelatedPerson = FhirResourceBase & {
    patient?: FhirReference
    relationship?: FhirCodeableConcept[]
    name?: FhirHumanName[]
    telecom?: FhirContactPoint[]
    address?: FhirAddress
    gender?: string
    birthDate?: string
    active?: boolean
  }

  export type ExplanationOfBenefit = FhirResourceBase & {
    status?: string
    type?: FhirCodeableConcept
    use?: string
    patient?: FhirReference
    created?: string
    provider?: FhirReference
    claim?: FhirReference
    payment?: {
      amount?: FhirMoney
    }
    paymentAmount?: FhirMoney
    total?: Array<{
      category?: FhirCodeableConcept
      amount?: FhirMoney
    }>
  }

  export type Invoice = FhirResourceBase & {
    status?: string
    type?: FhirCodeableConcept
    subject?: FhirReference
    date?: string
    totalGross?: FhirMoney
    totalNet?: FhirMoney
    totalBalance?: FhirMoney
  }

  export type Questionnaire = FhirResourceBase & {
    title?: string
    status?: string
    subjectType?: string[]
  }

  export type QuestionnaireResponse = FhirResourceBase & {
    status?: string
    authored?: string
    questionnaire?: string
    text?: {
      status?: string
      div?: string
    }
  }

  export type Task = FhirResourceBase & {
    status?: string
    intent?: string
    for?: FhirReference
    owner?: FhirReference
    executionPeriod?: FhirPeriod
    restriction?: {
      period?: FhirPeriod
    }
    focus?: FhirReference
    input?: Array<{
      valueReference?: FhirReference
    }>
    description?: string
    note?: FhirAnnotation[]
  }

  export type Practitioner = FhirResourceBase
  export type CareTeam = FhirResourceBase
  export type PractitionerRole = FhirResourceBase
  export type Organization = FhirResourceBase
  export type PatientCommunication = {
    language?: FhirCodeableConcept
    preferred?: boolean
  }
  export type HumanName = FhirHumanName
  export type Identifier = FhirIdentifier
  export type CodeableConcept = FhirCodeableConcept
  export type Reference = FhirReference
  export type Period = FhirPeriod
  export type Money = FhirMoney
}
