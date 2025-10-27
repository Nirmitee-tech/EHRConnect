// Report Data Generators - Generate realistic dummy data for each report type

// Helper functions
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Names and identifiers
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
const providers = ['Dr. Sarah Chen', 'Dr. Michael Roberts', 'Dr. Emily Johnson', 'Dr. James Wilson', 'Dr. Maria Garcia', 'Dr. David Lee', 'Dr. Lisa Anderson', 'Dr. Robert Taylor'];
const departments = ['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'Emergency', 'Surgery', 'Oncology', 'Internal Medicine'];
const insurers = ['Blue Cross', 'Aetna', 'UnitedHealth', 'Cigna', 'Humana', 'Medicare', 'Medicaid', 'Kaiser'];

// Clinical Report Data Generators
export const generatePatientSummaryData = (count: number = 25) => {
  const conditions = ['Hypertension', 'Diabetes Type 2', 'Asthma', 'COPD', 'CHF', 'Depression', 'Arthritis', 'Hypothyroidism'];
  const statuses = ['Stable', 'Improving', 'Critical', 'Monitoring'];

  return Array.from({ length: count }, (_, i) => ({
    id: `PT-${10000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    age: randomInt(25, 85),
    gender: randomChoice(['Male', 'Female']),
    condition: randomChoice(conditions),
    provider: randomChoice(providers),
    lastVisit: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    status: randomChoice(statuses),
    riskScore: randomInt(1, 10)
  }));
};

export const generateEncounterData = (count: number = 25) => {
  const encounterTypes = ['Office Visit', 'Emergency', 'Inpatient', 'Telehealth', 'Follow-up', 'Consultation'];
  const statuses = ['Completed', 'In Progress', 'Scheduled', 'Cancelled'];

  return Array.from({ length: count }, (_, i) => ({
    id: `ENC-${20000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    encounterType: randomChoice(encounterTypes),
    provider: randomChoice(providers),
    department: randomChoice(departments),
    date: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    duration: randomInt(15, 120),
    status: randomChoice(statuses),
    charges: randomInt(100, 5000)
  }));
};

export const generateLabResultsData = (count: number = 25) => {
  const tests = ['CBC', 'BMP', 'Lipid Panel', 'HbA1c', 'TSH', 'Vitamin D', 'Liver Panel', 'Urinalysis'];
  const statuses = ['Final', 'Pending', 'Corrected', 'Preliminary'];

  return Array.from({ length: count }, (_, i) => ({
    id: `LAB-${30000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    testName: randomChoice(tests),
    orderDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    resultDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    provider: randomChoice(providers),
    status: randomChoice(statuses),
    abnormal: randomChoice(['Normal', 'Abnormal', 'Critical']),
    priority: randomChoice(['Routine', 'Urgent', 'STAT'])
  }));
};

export const generateMedicationData = (count: number = 25) => {
  const medications = ['Lisinopril', 'Metformin', 'Atorvastatin', 'Amlodipine', 'Omeprazole', 'Levothyroxine', 'Albuterol', 'Metoprolol'];
  const statuses = ['Active', 'Completed', 'Discontinued', 'On Hold'];

  return Array.from({ length: count }, (_, i) => ({
    id: `MED-${40000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    medication: randomChoice(medications),
    dosage: `${randomInt(5, 500)}mg`,
    frequency: randomChoice(['Once daily', 'Twice daily', 'Three times daily', 'As needed']),
    prescriber: randomChoice(providers),
    startDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    status: randomChoice(statuses),
    refillsRemaining: randomInt(0, 5)
  }));
};

// Provider/Operational Report Data Generators
export const generateProviderProductivityData = (count: number = 25) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `PRV-${50000 + i}`,
    provider: i < providers.length ? providers[i] : `Dr. ${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    specialty: randomChoice(departments),
    patients: randomInt(150, 400),
    encounters: randomInt(200, 500),
    hours: randomInt(120, 180),
    revenue: randomInt(80000, 200000),
    satisfaction: (Math.random() * 2 + 3).toFixed(1),
    noShowRate: (Math.random() * 10).toFixed(1)
  }));
};

export const generateAppointmentData = (count: number = 25) => {
  const statuses = ['Scheduled', 'Completed', 'No Show', 'Cancelled', 'Rescheduled'];
  const appointmentTypes = ['New Patient', 'Follow-up', 'Annual Physical', 'Sick Visit', 'Procedure', 'Consultation'];

  return Array.from({ length: count }, (_, i) => ({
    id: `APT-${60000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    appointmentType: randomChoice(appointmentTypes),
    provider: randomChoice(providers),
    department: randomChoice(departments),
    scheduledDate: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)).toISOString().split('T')[0],
    duration: randomInt(15, 60),
    status: randomChoice(statuses),
    waitTime: randomInt(0, 45)
  }));
};

export const generateBedOccupancyData = (count: number = 25) => {
  const units = ['ICU', 'Medical-Surgical', 'Pediatrics', 'Maternity', 'Emergency', 'Cardiac Care'];
  const statuses = ['Occupied', 'Available', 'Cleaning', 'Maintenance'];

  return Array.from({ length: count }, (_, i) => ({
    id: `BED-${70000 + i}`,
    bedNumber: `${randomChoice(['A', 'B', 'C', 'D'])}-${randomInt(100, 499)}`,
    unit: randomChoice(units),
    patientName: randomChoice(statuses) === 'Occupied' ? `${randomChoice(firstNames)} ${randomChoice(lastNames)}` : 'N/A',
    admitDate: randomChoice(statuses) === 'Occupied' ? randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0] : 'N/A',
    status: randomChoice(statuses),
    assignedNurse: `Nurse ${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    expectedDischarge: randomChoice(statuses) === 'Occupied' ? randomDate(new Date(), new Date(2024, 11, 31)).toISOString().split('T')[0] : 'N/A'
  }));
};

// Financial Report Data Generators
export const generateClaimsData = (count: number = 25) => {
  const statuses = ['Submitted', 'Pending', 'Approved', 'Denied', 'Resubmitted', 'Paid'];

  return Array.from({ length: count }, (_, i) => ({
    id: `CLM-${80000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    serviceDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    submissionDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    payer: randomChoice(insurers),
    claimAmount: randomInt(500, 25000),
    paidAmount: randomInt(300, 20000),
    status: randomChoice(statuses),
    provider: randomChoice(providers)
  }));
};

export const generatePaymentData = (count: number = 25) => {
  const paymentMethods = ['Insurance', 'Cash', 'Credit Card', 'Check', 'Payment Plan'];

  return Array.from({ length: count }, (_, i) => ({
    id: `PAY-${90000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    invoiceNumber: `INV-${randomInt(10000, 99999)}`,
    paymentDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    paymentMethod: randomChoice(paymentMethods),
    amount: randomInt(50, 5000),
    balance: randomInt(0, 2000),
    status: randomChoice(['Paid', 'Partial', 'Outstanding']),
    daysOutstanding: randomInt(0, 120)
  }));
};

export const generateARAgingData = (count: number = 25) => {
  const agingBuckets = ['0-30', '31-60', '61-90', '91-120', '120+'];

  return Array.from({ length: count }, (_, i) => ({
    id: `AR-${100000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    invoiceDate: randomDate(new Date(2023, 0, 1), new Date()).toISOString().split('T')[0],
    invoiceNumber: `INV-${randomInt(10000, 99999)}`,
    totalAmount: randomInt(500, 15000),
    outstandingAmount: randomInt(100, 10000),
    agingBucket: randomChoice(agingBuckets),
    payer: randomChoice(insurers),
    lastContact: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0]
  }));
};

// Regulatory Report Data Generators
export const generateAuditLogData = (count: number = 25) => {
  const actions = ['View Record', 'Edit Record', 'Create Record', 'Delete Record', 'Print Record', 'Export Data', 'Login', 'Logout'];
  const users = ['john.smith@hospital.com', 'mary.johnson@hospital.com', 'robert.williams@hospital.com', 'patricia.brown@hospital.com'];

  return Array.from({ length: count }, (_, i) => ({
    id: `AUD-${110000 + i}`,
    timestamp: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
    user: randomChoice(users),
    action: randomChoice(actions),
    resourceType: randomChoice(['Patient', 'Encounter', 'Observation', 'Medication', 'Appointment']),
    resourceId: `RES-${randomInt(1000, 9999)}`,
    ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
    status: randomChoice(['Success', 'Failed', 'Unauthorized'])
  }));
};

export const generateComplianceData = (count: number = 25) => {
  const requirements = ['HIPAA Privacy', 'HIPAA Security', 'Meaningful Use', 'Patient Consent', 'Data Encryption', 'Access Control'];
  const statuses = ['Compliant', 'Non-Compliant', 'Pending Review', 'Remediation Required'];

  return Array.from({ length: count }, (_, i) => ({
    id: `CMP-${120000 + i}`,
    requirement: randomChoice(requirements),
    department: randomChoice(departments),
    lastAudit: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    nextAudit: randomDate(new Date(), new Date(2024, 11, 31)).toISOString().split('T')[0],
    status: randomChoice(statuses),
    findings: randomInt(0, 15),
    owner: randomChoice(providers),
    riskLevel: randomChoice(['Low', 'Medium', 'High', 'Critical'])
  }));
};

// Patient Engagement Report Data Generators
export const generatePortalUsageData = (count: number = 25) => {
  const activities = ['View Results', 'Message Provider', 'Schedule Appointment', 'Request Refill', 'Update Profile', 'Pay Bill'];

  return Array.from({ length: count }, (_, i) => ({
    id: `PTL-${130000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    lastLogin: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    loginCount: randomInt(1, 50),
    activity: randomChoice(activities),
    messagesExchanged: randomInt(0, 25),
    appointmentsBooked: randomInt(0, 10),
    enrollmentDate: randomDate(new Date(2023, 0, 1), new Date(2024, 0, 1)).toISOString().split('T')[0],
    status: randomChoice(['Active', 'Inactive', 'Pending Verification'])
  }));
};

export const generateTelehealthData = (count: number = 25) => {
  const platforms = ['Video Call', 'Phone Call', 'Secure Chat'];
  const statuses = ['Completed', 'Scheduled', 'Cancelled', 'No Show', 'Technical Issue'];

  return Array.from({ length: count }, (_, i) => ({
    id: `TEL-${140000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    provider: randomChoice(providers),
    scheduledDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    platform: randomChoice(platforms),
    duration: randomInt(10, 60),
    status: randomChoice(statuses),
    satisfaction: randomInt(1, 5),
    followUpRequired: randomChoice(['Yes', 'No'])
  }));
};

// Analytics/Population Health Report Data Generators
export const generatePopulationHealthData = (count: number = 25) => {
  const conditions = ['Diabetes', 'Hypertension', 'Heart Disease', 'COPD', 'Asthma', 'Depression', 'Obesity'];
  const riskLevels = ['Low', 'Medium', 'High', 'Very High'];

  return Array.from({ length: count }, (_, i) => ({
    id: `POP-${150000 + i}`,
    condition: randomChoice(conditions),
    patientCount: randomInt(50, 500),
    averageAge: randomInt(45, 75),
    malePercent: randomInt(40, 60),
    femalePercent: randomInt(40, 60),
    controlledCount: randomInt(20, 300),
    riskLevel: randomChoice(riskLevels),
    averageCost: randomInt(5000, 50000)
  }));
};

export const generateReadmissionData = (count: number = 25) => {
  const diagnoses = ['Heart Failure', 'Pneumonia', 'COPD', 'Sepsis', 'Stroke', 'MI', 'Diabetes Complications'];

  return Array.from({ length: count }, (_, i) => ({
    id: `READ-${160000 + i}`,
    patientName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    initialAdmit: randomDate(new Date(2024, 0, 1), new Date(2024, 5, 30)).toISOString().split('T')[0],
    discharge: randomDate(new Date(2024, 0, 1), new Date(2024, 6, 30)).toISOString().split('T')[0],
    readmitDate: randomDate(new Date(2024, 6, 1), new Date()).toISOString().split('T')[0],
    daysToReadmit: randomInt(1, 30),
    diagnosis: randomChoice(diagnoses),
    provider: randomChoice(providers),
    riskScore: randomInt(1, 100),
    preventable: randomChoice(['Yes', 'No', 'Possibly'])
  }));
};

// Technical Report Data Generators
export const generateAPIUsageData = (count: number = 25) => {
  const endpoints = ['/api/patients', '/api/encounters', '/api/observations', '/api/medications', '/api/appointments'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const statuses = [200, 201, 400, 401, 404, 500];

  return Array.from({ length: count }, (_, i) => ({
    id: `API-${170000 + i}`,
    timestamp: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
    endpoint: randomChoice(endpoints),
    method: randomChoice(methods),
    statusCode: randomChoice(statuses),
    responseTime: randomInt(50, 2000),
    requestSize: randomInt(100, 10000),
    responseSize: randomInt(500, 50000),
    clientId: `CLIENT-${randomInt(1000, 9999)}`
  }));
};

export const generateInterfaceData = (count: number = 25) => {
  const messageTypes = ['ADT-A01', 'ADT-A03', 'ORM-O01', 'ORU-R01', 'SIU-S12', 'MDM-T02'];
  const statuses = ['Success', 'Failed', 'Retrying', 'Queued'];

  return Array.from({ length: count }, (_, i) => ({
    id: `MSG-${180000 + i}`,
    timestamp: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
    messageType: randomChoice(messageTypes),
    source: randomChoice(['EMR', 'Lab System', 'Pharmacy', 'Radiology', 'Billing']),
    destination: randomChoice(['EMR', 'Lab System', 'Pharmacy', 'Radiology', 'Billing']),
    status: randomChoice(statuses),
    processingTime: randomInt(10, 5000),
    attempts: randomInt(1, 5),
    errorMessage: randomChoice(statuses) === 'Failed' ? 'Connection timeout' : null
  }));
};

// Administrative Report Data Generators
export const generateUserActivityData = (count: number = 25) => {
  const roles = ['Physician', 'Nurse', 'Admin', 'Billing', 'Lab Tech', 'Pharmacist'];
  const users = ['john.smith@hospital.com', 'mary.johnson@hospital.com', 'robert.williams@hospital.com', 'patricia.brown@hospital.com'];

  return Array.from({ length: count }, (_, i) => ({
    id: `USR-${190000 + i}`,
    userName: i < users.length ? users[i] : `user${i}@hospital.com`,
    role: randomChoice(roles),
    department: randomChoice(departments),
    lastLogin: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
    sessionsCount: randomInt(1, 100),
    avgSessionDuration: randomInt(30, 480),
    recordsAccessed: randomInt(10, 1000),
    status: randomChoice(['Active', 'Inactive', 'Locked'])
  }));
};
