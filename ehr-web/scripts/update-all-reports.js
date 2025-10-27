const fs = require('fs');
const path = require('path');

// Complete report configurations for ALL 61 reports
const allReportConfigs = {
  // ========== CLINICAL REPORTS (10) ==========
  'clinical/patient-summary': {
    title: 'Patient Summary Reports',
    description: 'Comprehensive patient demographics, medical history, and current status',
    dataGenerator: 'generatePatientSummaryData',
    icon: 'User',
    kpis: [
      { label: 'Total Patients', value: 'totalPatients', icon: 'Users' },
      { label: 'High Risk', value: 'highRiskCount', icon: 'AlertTriangle' },
      { label: 'Avg Age', value: 'avgAge', unit: 'years', icon: 'Calendar' },
      { label: 'Active Cases', value: 'activeCount', icon: 'Activity' }
    ],
    columns: [
      { key: 'id', label: 'Patient ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient Name', sortable: true, width: '200px', render: 'bold' },
      { key: 'age', label: 'Age', sortable: true, width: '80px', align: 'center' },
      { key: 'gender', label: 'Gender', sortable: true, width: '100px' },
      { key: 'condition', label: 'Primary Condition', sortable: true, width: '180px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'lastVisit', label: 'Last Visit', sortable: true, width: '120px' },
      { key: 'riskScore', label: 'Risk', sortable: true, width: '80px', align: 'center', render: 'riskScore' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'clinical/encounter': {
    title: 'Encounter Reports',
    description: 'Visit summaries, admission/discharge details, and progress notes',
    dataGenerator: 'generateEncounterData',
    icon: 'Calendar',
    kpis: [
      { label: 'Total Encounters', value: 'totalEncounters', icon: 'Calendar' },
      { label: 'Completed', value: 'completedCount', icon: 'CheckCircle' },
      { label: 'Avg Duration', value: 'avgDuration', unit: 'min', icon: 'Clock' },
      { label: 'Total Charges', value: 'totalCharges', icon: 'DollarSign' }
    ],
    columns: [
      { key: 'id', label: 'Encounter ID', sortable: true, width: '130px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'encounterType', label: 'Type', sortable: true, width: '140px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'department', label: 'Department', sortable: true, width: '150px' },
      { key: 'date', label: 'Date', sortable: true, width: '120px' },
      { key: 'duration', label: 'Duration', sortable: true, width: '100px', align: 'right' },
      { key: 'charges', label: 'Charges', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'status', label: 'Status', sortable: true, width: '130px', render: 'status' }
    ]
  },
  'clinical/timeline': {
    title: 'Clinical Timeline',
    description: 'Chronological patient care history and event tracking',
    dataGenerator: 'generateEncounterData',
    icon: 'Clock',
    kpis: [
      { label: 'Total Events', value: 'totalEncounters', icon: 'Activity' },
      { label: 'This Month', value: 'thisMonthCount', icon: 'Calendar' },
      { label: 'Avg Events/Patient', value: 'avgEventsPerPatient', icon: 'TrendingUp' },
      { label: 'Active Patients', value: 'activePatients', icon: 'Users' }
    ]
  },
  'clinical/referral': {
    title: 'Referral Tracking',
    description: 'Specialist referrals, consultation requests, and follow-up status',
    dataGenerator: 'generateEncounterData',
    icon: 'ArrowRightCircle',
    kpis: [
      { label: 'Total Referrals', value: 'totalEncounters', icon: 'ArrowRightCircle' },
      { label: 'Pending', value: 'pendingCount', icon: 'Clock' },
      { label: 'Completed', value: 'completedCount', icon: 'CheckCircle' },
      { label: 'Avg Wait Time', value: 'avgDuration', unit: 'days', icon: 'Timer' }
    ]
  },
  'clinical/lab-radiology': {
    title: 'Lab & Radiology Results',
    description: 'Laboratory test results, imaging reports, and diagnostic findings',
    dataGenerator: 'generateLabResultsData',
    icon: 'Microscope',
    kpis: [
      { label: 'Total Tests', value: 'totalTests', icon: 'Activity' },
      { label: 'Abnormal Results', value: 'abnormalCount', icon: 'AlertTriangle' },
      { label: 'Pending', value: 'pendingCount', icon: 'Clock' },
      { label: 'Critical', value: 'criticalCount', icon: 'AlertCircle' }
    ],
    columns: [
      { key: 'id', label: 'Test ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'testName', label: 'Test Name', sortable: true, width: '150px' },
      { key: 'orderDate', label: 'Ordered', sortable: true, width: '120px' },
      { key: 'resultDate', label: 'Resulted', sortable: true, width: '120px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'abnormal', label: 'Result', sortable: true, width: '120px', render: 'status-abnormal' },
      { key: 'priority', label: 'Priority', sortable: true, width: '100px' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'clinical/results': {
    title: 'Clinical Results',
    description: 'Consolidated view of all clinical test results and observations',
    dataGenerator: 'generateLabResultsData',
    icon: 'FileText',
    kpis: [
      { label: 'Total Results', value: 'totalTests', icon: 'FileText' },
      { label: 'Critical', value: 'criticalCount', icon: 'AlertCircle' },
      { label: 'Abnormal', value: 'abnormalCount', icon: 'AlertTriangle' },
      { label: 'Pending', value: 'pendingCount', icon: 'Clock' }
    ]
  },
  'clinical/medication-orders': {
    title: 'Medication Orders',
    description: 'Prescriptions, medication administration records, and pharmacy orders',
    dataGenerator: 'generateMedicationData',
    icon: 'Pill',
    kpis: [
      { label: 'Active Medications', value: 'activeCount', icon: 'Pill' },
      { label: 'Total Orders', value: 'totalMeds', icon: 'FileText' },
      { label: 'Refills Needed', value: 'refillsNeeded', icon: 'AlertTriangle' },
      { label: 'Discontinued', value: 'discontinuedCount', icon: 'XCircle' }
    ],
    columns: [
      { key: 'id', label: 'Order ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'medication', label: 'Medication', sortable: true, width: '180px' },
      { key: 'dosage', label: 'Dosage', sortable: true, width: '100px' },
      { key: 'frequency', label: 'Frequency', sortable: true, width: '140px' },
      { key: 'prescriber', label: 'Prescriber', sortable: true, width: '180px' },
      { key: 'startDate', label: 'Start Date', sortable: true, width: '120px' },
      { key: 'refillsRemaining', label: 'Refills', sortable: true, width: '80px', align: 'center' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'clinical/care-pathway': {
    title: 'Care Pathway Compliance',
    description: 'Clinical pathway adherence and guideline compliance tracking',
    dataGenerator: 'generateComplianceData',
    icon: 'GitBranch',
    kpis: [
      { label: 'Total Pathways', value: 'totalCompliance', icon: 'GitBranch' },
      { label: 'Compliant', value: 'compliantCount', icon: 'CheckCircle' },
      { label: 'Compliance Rate', value: 'complianceRate', unit: '%', icon: 'TrendingUp' },
      { label: 'Deviations', value: 'nonCompliantCount', icon: 'AlertTriangle' }
    ]
  },
  'clinical/vitals': {
    title: 'Vital Signs Tracking',
    description: 'Patient vital signs monitoring and trend analysis',
    dataGenerator: 'generateLabResultsData',
    icon: 'HeartPulse',
    kpis: [
      { label: 'Measurements', value: 'totalTests', icon: 'Activity' },
      { label: 'Abnormal', value: 'abnormalCount', icon: 'AlertTriangle' },
      { label: 'Critical', value: 'criticalCount', icon: 'AlertCircle' },
      { label: 'Patients Monitored', value: 'uniquePatients', icon: 'Users' }
    ]
  },
  'clinical/chronic-disease': {
    title: 'Chronic Disease Management',
    description: 'Long-term condition monitoring and care plan adherence',
    dataGenerator: 'generatePopulationHealthData',
    icon: 'Stethoscope',
    kpis: [
      { label: 'Total Patients', value: 'totalPatients', icon: 'Users' },
      { label: 'Controlled', value: 'controlledCount', icon: 'CheckCircle' },
      { label: 'High Risk', value: 'highRiskCount', icon: 'AlertTriangle' },
      { label: 'Avg Cost', value: 'avgCost', icon: 'DollarSign' }
    ]
  },

  // ========== PROVIDER/OPERATIONAL REPORTS (8) ==========
  'provider/productivity': {
    title: 'Provider Productivity',
    description: 'Provider performance metrics, patient encounters, and revenue generation',
    dataGenerator: 'generateProviderProductivityData',
    icon: 'TrendingUp',
    kpis: [
      { label: 'Total Providers', value: 'totalProviders', icon: 'Users' },
      { label: 'Total Patients', value: 'totalPatients', icon: 'UserCheck' },
      { label: 'Avg Patients/Provider', value: 'avgPatients', icon: 'TrendingUp' },
      { label: 'Total Revenue', value: 'totalRevenue', icon: 'DollarSign' }
    ],
    columns: [
      { key: 'id', label: 'Provider ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'provider', label: 'Provider', sortable: true, width: '200px', render: 'bold' },
      { key: 'specialty', label: 'Specialty', sortable: true, width: '150px' },
      { key: 'patients', label: 'Patients', sortable: true, width: '100px', align: 'right' },
      { key: 'encounters', label: 'Encounters', sortable: true, width: '110px', align: 'right' },
      { key: 'hours', label: 'Hours', sortable: true, width: '90px', align: 'right' },
      { key: 'revenue', label: 'Revenue', sortable: true, width: '130px', align: 'right', render: 'currency' },
      { key: 'satisfaction', label: 'Rating', sortable: true, width: '90px', align: 'center', render: 'rating' },
      { key: 'noShowRate', label: 'No-Show %', sortable: true, width: '110px', align: 'right' }
    ]
  },
  'provider/encounter-summary': {
    title: 'Encounter Summary',
    description: 'Provider encounter statistics and patient interaction metrics',
    dataGenerator: 'generateEncounterData',
    icon: 'UserCheck',
    kpis: [
      { label: 'Total Encounters', value: 'totalEncounters', icon: 'Calendar' },
      { label: 'Avg Duration', value: 'avgDuration', unit: 'min', icon: 'Clock' },
      { label: 'Completion Rate', value: 'completionRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Revenue', value: 'totalRevenue', icon: 'DollarSign' }
    ]
  },
  'provider/specialty-workload': {
    title: 'Specialty Workload Analysis',
    description: 'Department and specialty-specific patient volume and case complexity',
    dataGenerator: 'generateProviderProductivityData',
    icon: 'BarChart3',
    kpis: [
      { label: 'Total Specialties', value: 'totalSpecialties', icon: 'Layers' },
      { label: 'Total Cases', value: 'totalEncounters', icon: 'FileText' },
      { label: 'Avg Case Load', value: 'avgPatients', icon: 'TrendingUp' },
      { label: 'Capacity Utilization', value: 'utilizationRate', unit: '%', icon: 'PieChart' }
    ]
  },
  'provider/appointment-utilization': {
    title: 'Appointment Utilization',
    description: 'Appointment slot usage, no-show rates, and scheduling efficiency',
    dataGenerator: 'generateAppointmentData',
    icon: 'CalendarCheck',
    kpis: [
      { label: 'Total Appointments', value: 'totalAppts', icon: 'Calendar' },
      { label: 'Utilization Rate', value: 'utilizationRate', unit: '%', icon: 'TrendingUp' },
      { label: 'No-Show Rate', value: 'noShowRate', unit: '%', icon: 'AlertTriangle' },
      { label: 'Avg Wait Time', value: 'avgWaitTime', unit: 'min', icon: 'Clock' }
    ],
    columns: [
      { key: 'id', label: 'Appt ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'appointmentType', label: 'Type', sortable: true, width: '150px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'department', label: 'Department', sortable: true, width: '150px' },
      { key: 'scheduledDate', label: 'Date', sortable: true, width: '120px' },
      { key: 'duration', label: 'Duration', sortable: true, width: '100px', align: 'right' },
      { key: 'waitTime', label: 'Wait', sortable: true, width: '90px', align: 'right' },
      { key: 'status', label: 'Status', sortable: true, width: '130px', render: 'status' }
    ]
  },
  'provider/wait-time': {
    title: 'Patient Wait Time Analysis',
    description: 'Average wait times, queue management, and service efficiency',
    dataGenerator: 'generateAppointmentData',
    icon: 'Clock',
    kpis: [
      { label: 'Avg Wait Time', value: 'avgWaitTime', unit: 'min', icon: 'Clock' },
      { label: 'On-Time %', value: 'onTimeRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Max Wait', value: 'maxWaitTime', unit: 'min', icon: 'AlertTriangle' },
      { label: 'Appts Analyzed', value: 'totalAppts', icon: 'Calendar' }
    ]
  },
  'provider/clinic-slot': {
    title: 'Clinic Slot Management',
    description: 'Available slots, booking patterns, and capacity optimization',
    dataGenerator: 'generateAppointmentData',
    icon: 'Grid3x3',
    kpis: [
      { label: 'Total Slots', value: 'totalAppts', icon: 'Grid3x3' },
      { label: 'Booked', value: 'bookedCount', icon: 'CheckCircle' },
      { label: 'Available', value: 'availableCount', icon: 'Calendar' },
      { label: 'Utilization', value: 'utilizationRate', unit: '%', icon: 'TrendingUp' }
    ]
  },
  'provider/bed-occupancy': {
    title: 'Bed Occupancy',
    description: 'Hospital bed utilization, patient placement, and capacity management',
    dataGenerator: 'generateBedOccupancyData',
    icon: 'Bed',
    kpis: [
      { label: 'Total Beds', value: 'totalBeds', icon: 'Bed' },
      { label: 'Occupied', value: 'occupiedCount', icon: 'User' },
      { label: 'Occupancy Rate', value: 'occupancyRate', unit: '%', icon: 'TrendingUp' },
      { label: 'Available', value: 'availableCount', icon: 'CheckCircle' }
    ],
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '100px', render: 'monospace-blue' },
      { key: 'bedNumber', label: 'Bed', sortable: true, width: '100px' },
      { key: 'unit', label: 'Unit', sortable: true, width: '150px' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'admitDate', label: 'Admitted', sortable: true, width: '120px' },
      { key: 'assignedNurse', label: 'Nurse', sortable: true, width: '180px' },
      { key: 'expectedDischarge', label: 'Expected D/C', sortable: true, width: '130px' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'provider/equipment': {
    title: 'Equipment Utilization',
    description: 'Medical equipment usage, maintenance schedules, and availability',
    dataGenerator: 'generateBedOccupancyData',
    icon: 'Cpu',
    kpis: [
      { label: 'Total Equipment', value: 'totalBeds', icon: 'Cpu' },
      { label: 'In Use', value: 'occupiedCount', icon: 'Activity' },
      { label: 'Utilization', value: 'occupancyRate', unit: '%', icon: 'TrendingUp' },
      { label: 'Maintenance Due', value: 'maintenanceCount', icon: 'AlertTriangle' }
    ]
  },
  'provider/ot-schedule': {
    title: 'Operating Theater Schedule',
    description: 'OR scheduling, procedure tracking, and surgical suite utilization',
    dataGenerator: 'generateAppointmentData',
    icon: 'Hospital',
    kpis: [
      { label: 'Total Procedures', value: 'totalAppts', icon: 'Hospital' },
      { label: 'Completed', value: 'completedCount', icon: 'CheckCircle' },
      { label: 'OR Utilization', value: 'utilizationRate', unit: '%', icon: 'TrendingUp' },
      { label: 'Avg Procedure Time', value: 'avgDuration', unit: 'min', icon: 'Clock' }
    ]
  },

  // ========== FINANCIAL/BILLING REPORTS (9) ==========
  'financial/claims-submission': {
    title: 'Claims Submission',
    description: 'Insurance claim submissions, status tracking, and processing metrics',
    dataGenerator: 'generateClaimsData',
    icon: 'FileCheck',
    kpis: [
      { label: 'Total Claims', value: 'totalClaims', icon: 'FileText' },
      { label: 'Approval Rate', value: 'approvalRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Pending', value: 'pendingCount', icon: 'Clock' },
      { label: 'Total Amount', value: 'totalAmount', icon: 'DollarSign' }
    ],
    columns: [
      { key: 'id', label: 'Claim ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'serviceDate', label: 'Service', sortable: true, width: '120px' },
      { key: 'submissionDate', label: 'Submitted', sortable: true, width: '120px' },
      { key: 'payer', label: 'Payer', sortable: true, width: '150px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'claimAmount', label: 'Claim', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'paidAmount', label: 'Paid', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'financial/payment-posting': {
    title: 'Payment Posting',
    description: 'Payment tracking, posting accuracy, and reconciliation status',
    dataGenerator: 'generatePaymentData',
    icon: 'CreditCard',
    kpis: [
      { label: 'Total Payments', value: 'totalPayments', icon: 'DollarSign' },
      { label: 'Posted Today', value: 'todayCount', icon: 'Calendar' },
      { label: 'Outstanding', value: 'outstandingAmount', icon: 'AlertTriangle' },
      { label: 'Avg Days to Pay', value: 'avgDaysToPay', unit: 'days', icon: 'Clock' }
    ],
    columns: [
      { key: 'id', label: 'Payment ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'invoiceNumber', label: 'Invoice', sortable: true, width: '130px' },
      { key: 'paymentDate', label: 'Date', sortable: true, width: '120px' },
      { key: 'paymentMethod', label: 'Method', sortable: true, width: '130px' },
      { key: 'amount', label: 'Amount', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'balance', label: 'Balance', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'financial/denial-management': {
    title: 'Denial Management',
    description: 'Claim denials, appeal tracking, and denial reason analysis',
    dataGenerator: 'generateClaimsData',
    icon: 'XCircle',
    kpis: [
      { label: 'Denied Claims', value: 'deniedCount', icon: 'XCircle' },
      { label: 'Denial Rate', value: 'denialRate', unit: '%', icon: 'TrendingDown' },
      { label: 'Appeals Filed', value: 'appealCount', icon: 'FileText' },
      { label: 'Overturned', value: 'overturnedCount', icon: 'CheckCircle' }
    ]
  },
  'financial/ar-aging': {
    title: 'A/R Aging Report',
    description: 'Accounts receivable aging analysis and collection tracking',
    dataGenerator: 'generateARAgingData',
    icon: 'Clock',
    kpis: [
      { label: 'Total A/R', value: 'totalAR', icon: 'DollarSign' },
      { label: '0-30 Days', value: 'bucket0_30', icon: 'TrendingUp' },
      { label: '31-90 Days', value: 'bucket31_90', icon: 'AlertTriangle' },
      { label: '90+ Days', value: 'bucket90Plus', icon: 'AlertCircle' }
    ],
    columns: [
      { key: 'id', label: 'AR ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'invoiceNumber', label: 'Invoice', sortable: true, width: '130px' },
      { key: 'invoiceDate', label: 'Date', sortable: true, width: '120px' },
      { key: 'payer', label: 'Payer', sortable: true, width: '150px' },
      { key: 'totalAmount', label: 'Total', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'outstandingAmount', label: 'Outstanding', sortable: true, width: '130px', align: 'right', render: 'currency' },
      { key: 'agingBucket', label: 'Aging', sortable: true, width: '100px', align: 'center' },
      { key: 'lastContact', label: 'Last Contact', sortable: true, width: '120px' }
    ]
  },
  'financial/charge-lag': {
    title: 'Charge Lag Analysis',
    description: 'Time between service and charge posting, billing delays',
    dataGenerator: 'generateClaimsData',
    icon: 'Timer',
    kpis: [
      { label: 'Avg Lag Time', value: 'avgLagTime', unit: 'days', icon: 'Timer' },
      { label: 'Posted Today', value: 'postedToday', icon: 'Calendar' },
      { label: 'Overdue', value: 'overdueCount', icon: 'AlertTriangle' },
      { label: 'Total Charges', value: 'totalAmount', icon: 'DollarSign' }
    ]
  },
  'financial/patient-balance': {
    title: 'Patient Balance Report',
    description: 'Outstanding patient balances and payment collections',
    dataGenerator: 'generateARAgingData',
    icon: 'Wallet',
    kpis: [
      { label: 'Total Balances', value: 'totalAR', icon: 'Wallet' },
      { label: 'Patients w/ Balance', value: 'patientsWithBalance', icon: 'Users' },
      { label: 'Avg Balance', value: 'avgBalance', icon: 'DollarSign' },
      { label: 'Collection Rate', value: 'collectionRate', unit: '%', icon: 'TrendingUp' }
    ]
  },
  'financial/department-revenue': {
    title: 'Department Revenue Analysis',
    description: 'Revenue by department, service line profitability',
    dataGenerator: 'generateProviderProductivityData',
    icon: 'Building',
    kpis: [
      { label: 'Total Revenue', value: 'totalRevenue', icon: 'DollarSign' },
      { label: 'Top Department', value: 'topDepartment', icon: 'Building' },
      { label: 'Avg Revenue/Dept', value: 'avgRevenue', icon: 'TrendingUp' },
      { label: 'Growth Rate', value: 'growthRate', unit: '%', icon: 'ArrowUpCircle' }
    ]
  },
  'financial/service-profitability': {
    title: 'Service Profitability',
    description: 'Revenue and cost analysis by service type and procedure',
    dataGenerator: 'generateClaimsData',
    icon: 'PieChart',
    kpis: [
      { label: 'Total Revenue', value: 'totalRevenue', icon: 'DollarSign' },
      { label: 'Gross Margin', value: 'grossMargin', unit: '%', icon: 'TrendingUp' },
      { label: 'Most Profitable', value: 'topService', icon: 'Award' },
      { label: 'Services Analyzed', value: 'totalClaims', icon: 'FileText' }
    ]
  },
  'financial/payer-mix': {
    title: 'Payer Mix Analysis',
    description: 'Insurance payer distribution and reimbursement rates',
    dataGenerator: 'generateClaimsData',
    icon: 'Users',
    kpis: [
      { label: 'Total Payers', value: 'totalPayers', icon: 'Building2' },
      { label: 'Top Payer', value: 'topPayer', icon: 'Award' },
      { label: 'Avg Reimbursement', value: 'avgReimbursement', unit: '%', icon: 'TrendingUp' },
      { label: 'Claims Processed', value: 'totalClaims', icon: 'FileText' }
    ]
  },

  // ========== REGULATORY/COMPLIANCE REPORTS (8) ==========
  'regulatory/meaningful-use': {
    title: 'Meaningful Use Compliance',
    description: 'EHR meaningful use measures and attestation readiness',
    dataGenerator: 'generateComplianceData',
    icon: 'Award',
    kpis: [
      { label: 'Compliance Rate', value: 'complianceRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Compliant', value: 'compliantCount', icon: 'CheckCircle' },
      { label: 'Non-Compliant', value: 'nonCompliantCount', icon: 'XCircle' },
      { label: 'Pending Review', value: 'pendingCount', icon: 'Clock' }
    ],
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'requirement', label: 'Requirement', sortable: true, width: '200px' },
      { key: 'department', label: 'Department', sortable: true, width: '150px' },
      { key: 'lastAudit', label: 'Last Audit', sortable: true, width: '120px' },
      { key: 'nextAudit', label: 'Next Audit', sortable: true, width: '120px' },
      { key: 'owner', label: 'Owner', sortable: true, width: '180px' },
      { key: 'findings', label: 'Findings', sortable: true, width: '100px', align: 'center' },
      { key: 'riskLevel', label: 'Risk', sortable: true, width: '100px', render: 'risk' },
      { key: 'status', label: 'Status', sortable: true, width: '140px', render: 'status' }
    ]
  },
  'regulatory/interface-logs': {
    title: 'Interface Transaction Logs',
    description: 'System integration logs and data exchange monitoring',
    dataGenerator: 'generateInterfaceData',
    icon: 'Network',
    kpis: [
      { label: 'Total Messages', value: 'totalMessages', icon: 'MessageSquare' },
      { label: 'Success Rate', value: 'successRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Failed', value: 'failedCount', icon: 'XCircle' },
      { label: 'Avg Processing', value: 'avgProcessing', unit: 'ms', icon: 'Zap' }
    ]
  },
  'regulatory/immunization': {
    title: 'Immunization Registry',
    description: 'Vaccine administration tracking and registry reporting',
    dataGenerator: 'generateMedicationData',
    icon: 'Syringe',
    kpis: [
      { label: 'Vaccines Given', value: 'totalMeds', icon: 'Syringe' },
      { label: 'Registry Submissions', value: 'submissionCount', icon: 'Send' },
      { label: 'Compliance Rate', value: 'complianceRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Patients Immunized', value: 'uniquePatients', icon: 'Users' }
    ]
  },
  'regulatory/user-access': {
    title: 'User Access Logs',
    description: 'User access patterns, login history, and security audit trails',
    dataGenerator: 'generateAuditLogData',
    icon: 'Shield',
    kpis: [
      { label: 'Total Access', value: 'totalAccess', icon: 'Activity' },
      { label: 'Unique Users', value: 'uniqueUsers', icon: 'Users' },
      { label: 'Failed Attempts', value: 'failedCount', icon: 'AlertTriangle' },
      { label: 'Unauthorized', value: 'unauthorizedCount', icon: 'XCircle' }
    ],
    columns: [
      { key: 'id', label: 'Log ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'timestamp', label: 'Timestamp', sortable: true, width: '180px' },
      { key: 'user', label: 'User', sortable: true, width: '200px', render: 'bold' },
      { key: 'action', label: 'Action', sortable: true, width: '150px' },
      { key: 'resourceType', label: 'Resource', sortable: true, width: '120px' },
      { key: 'resourceId', label: 'Resource ID', sortable: true, width: '120px' },
      { key: 'ipAddress', label: 'IP Address', sortable: true, width: '150px' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'regulatory/break-glass': {
    title: 'Break-the-Glass Access',
    description: 'Emergency access events and override tracking',
    dataGenerator: 'generateAuditLogData',
    icon: 'ShieldAlert',
    kpis: [
      { label: 'Break-Glass Events', value: 'totalAccess', icon: 'ShieldAlert' },
      { label: 'Justified', value: 'successCount', icon: 'CheckCircle' },
      { label: 'Under Review', value: 'failedCount', icon: 'AlertTriangle' },
      { label: 'Unique Users', value: 'uniqueUsers', icon: 'Users' }
    ]
  },
  'regulatory/failed-login': {
    title: 'Failed Login Attempts',
    description: 'Failed authentication tracking and security monitoring',
    dataGenerator: 'generateAuditLogData',
    icon: 'AlertTriangle',
    kpis: [
      { label: 'Failed Logins', value: 'failedCount', icon: 'AlertTriangle' },
      { label: 'Unique IPs', value: 'uniqueIPs', icon: 'Globe' },
      { label: 'Locked Accounts', value: 'lockedAccounts', icon: 'Lock' },
      { label: 'Suspicious Activity', value: 'suspiciousCount', icon: 'ShieldAlert' }
    ]
  },
  'regulatory/consent': {
    title: 'Patient Consent Tracking',
    description: 'Consent forms, authorization status, and HIPAA compliance',
    dataGenerator: 'generateComplianceData',
    icon: 'FileCheck',
    kpis: [
      { label: 'Total Consents', value: 'totalCompliance', icon: 'FileCheck' },
      { label: 'Active', value: 'compliantCount', icon: 'CheckCircle' },
      { label: 'Expired', value: 'nonCompliantCount', icon: 'XCircle' },
      { label: 'Pending', value: 'pendingCount', icon: 'Clock' }
    ]
  },
  'regulatory/advance-directive': {
    title: 'Advance Directives',
    description: 'Living wills, healthcare proxies, and end-of-life preferences',
    dataGenerator: 'generateComplianceData',
    icon: 'ScrollText',
    kpis: [
      { label: 'Total Directives', value: 'totalCompliance', icon: 'ScrollText' },
      { label: 'On File', value: 'compliantCount', icon: 'CheckCircle' },
      { label: 'Missing', value: 'nonCompliantCount', icon: 'AlertTriangle' },
      { label: 'Under Review', value: 'pendingCount', icon: 'Clock' }
    ]
  },

  // ========== PATIENT ENGAGEMENT REPORTS (6) ==========
  'patient-engagement/portal-usage': {
    title: 'Patient Portal Usage',
    description: 'Portal adoption rates, feature usage, and patient engagement metrics',
    dataGenerator: 'generatePortalUsageData',
    icon: 'Globe',
    kpis: [
      { label: 'Active Users', value: 'activeUsers', icon: 'Users' },
      { label: 'Enrollment Rate', value: 'enrollmentRate', unit: '%', icon: 'TrendingUp' },
      { label: 'Avg Logins/User', value: 'avgLogins', icon: 'Activity' },
      { label: 'Messages Sent', value: 'totalMessages', icon: 'MessageSquare' }
    ],
    columns: [
      { key: 'id', label: 'User ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'enrollmentDate', label: 'Enrolled', sortable: true, width: '120px' },
      { key: 'lastLogin', label: 'Last Login', sortable: true, width: '120px' },
      { key: 'loginCount', label: 'Logins', sortable: true, width: '80px', align: 'right' },
      { key: 'messagesExchanged', label: 'Messages', sortable: true, width: '100px', align: 'right' },
      { key: 'appointmentsBooked', label: 'Appts', sortable: true, width: '80px', align: 'right' },
      { key: 'activity', label: 'Last Activity', sortable: true, width: '160px' },
      { key: 'status', label: 'Status', sortable: true, width: '130px', render: 'status' }
    ]
  },
  'patient-engagement/message-volume': {
    title: 'Message Volume Analysis',
    description: 'Patient-provider messaging statistics and response times',
    dataGenerator: 'generatePortalUsageData',
    icon: 'MessageSquare',
    kpis: [
      { label: 'Total Messages', value: 'totalMessages', icon: 'MessageSquare' },
      { label: 'Avg Response Time', value: 'avgResponseTime', unit: 'hours', icon: 'Clock' },
      { label: 'Unread', value: 'unreadCount', icon: 'AlertCircle' },
      { label: 'Active Threads', value: 'activeThreads', icon: 'Activity' }
    ]
  },
  'patient-engagement/telehealth': {
    title: 'Telehealth Visits',
    description: 'Virtual visit statistics, platform usage, and patient satisfaction',
    dataGenerator: 'generateTelehealthData',
    icon: 'Video',
    kpis: [
      { label: 'Total Visits', value: 'totalVisits', icon: 'Video' },
      { label: 'Completion Rate', value: 'completionRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Avg Duration', value: 'avgDuration', unit: 'min', icon: 'Clock' },
      { label: 'Avg Satisfaction', value: 'avgSatisfaction', unit: '/5', icon: 'Star' }
    ],
    columns: [
      { key: 'id', label: 'Visit ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'scheduledDate', label: 'Date', sortable: true, width: '120px' },
      { key: 'platform', label: 'Platform', sortable: true, width: '120px' },
      { key: 'duration', label: 'Duration', sortable: true, width: '100px', align: 'right' },
      { key: 'satisfaction', label: 'Rating', sortable: true, width: '80px', align: 'center', render: 'rating' },
      { key: 'followUpRequired', label: 'Follow-up', sortable: true, width: '100px', align: 'center' },
      { key: 'status', label: 'Status', sortable: true, width: '140px', render: 'status' }
    ]
  },
  'patient-engagement/feedback': {
    title: 'Patient Feedback & Complaints',
    description: 'Patient satisfaction surveys, complaints, and grievance tracking',
    dataGenerator: 'generateTelehealthData',
    icon: 'MessageCircle',
    kpis: [
      { label: 'Total Feedback', value: 'totalVisits', icon: 'MessageCircle' },
      { label: 'Avg Rating', value: 'avgSatisfaction', unit: '/5', icon: 'Star' },
      { label: 'Complaints', value: 'complaintsCount', icon: 'AlertTriangle' },
      { label: 'Response Rate', value: 'responseRate', unit: '%', icon: 'TrendingUp' }
    ]
  },
  'patient-engagement/survey-results': {
    title: 'Patient Survey Results',
    description: 'Survey responses, satisfaction scores, and trend analysis',
    dataGenerator: 'generateTelehealthData',
    icon: 'ClipboardCheck',
    kpis: [
      { label: 'Surveys Completed', value: 'totalVisits', icon: 'ClipboardCheck' },
      { label: 'Avg Score', value: 'avgSatisfaction', unit: '/5', icon: 'Star' },
      { label: 'Response Rate', value: 'completionRate', unit: '%', icon: 'TrendingUp' },
      { label: 'Promoters', value: 'promoterCount', icon: 'ThumbsUp' }
    ]
  },
  'patient-engagement/response-time': {
    title: 'Provider Response Time',
    description: 'Average response times to patient inquiries and messages',
    dataGenerator: 'generatePortalUsageData',
    icon: 'Clock',
    kpis: [
      { label: 'Avg Response Time', value: 'avgResponseTime', unit: 'hours', icon: 'Clock' },
      { label: 'Within SLA', value: 'withinSLACount', unit: '%', icon: 'CheckCircle' },
      { label: 'Overdue', value: 'overdueCount', icon: 'AlertTriangle' },
      { label: 'Messages', value: 'totalMessages', icon: 'MessageSquare' }
    ]
  },

  // ========== ANALYTICS/POPULATION HEALTH REPORTS (9) ==========
  'analytics/disease-registry': {
    title: 'Disease Registry',
    description: 'Chronic disease tracking and population health management',
    dataGenerator: 'generatePopulationHealthData',
    icon: 'Database',
    kpis: [
      { label: 'Registered Patients', value: 'totalPopulation', icon: 'Users' },
      { label: 'Conditions Tracked', value: 'conditionsCount', icon: 'FileText' },
      { label: 'High Risk', value: 'highRiskPopulation', icon: 'AlertTriangle' },
      { label: 'Avg Cost/Patient', value: 'avgCostPerPatient', icon: 'DollarSign' }
    ]
  },
  'analytics/outbreak': {
    title: 'Outbreak Detection',
    description: 'Disease surveillance, outbreak alerts, and public health reporting',
    dataGenerator: 'generatePopulationHealthData',
    icon: 'TrendingUp',
    kpis: [
      { label: 'Cases This Week', value: 'casesThisWeek', icon: 'Activity' },
      { label: 'Active Alerts', value: 'activeAlerts', icon: 'AlertTriangle' },
      { label: 'Trending Conditions', value: 'trendingCount', icon: 'TrendingUp' },
      { label: 'Notifications Sent', value: 'notificationsSent', icon: 'Bell' }
    ]
  },
  'analytics/risk-stratification': {
    title: 'Patient Risk Stratification',
    description: 'Risk scoring, predictive analytics, and care prioritization',
    dataGenerator: 'generatePatientSummaryData',
    icon: 'Layers',
    kpis: [
      { label: 'Total Patients', value: 'totalPatients', icon: 'Users' },
      { label: 'High Risk', value: 'highRiskCount', icon: 'AlertCircle' },
      { label: 'Medium Risk', value: 'mediumRiskCount', icon: 'AlertTriangle' },
      { label: 'Low Risk', value: 'lowRiskCount', icon: 'CheckCircle' }
    ]
  },
  'analytics/readmission-risk': {
    title: 'Readmission Risk Analysis',
    description: '30-day readmission tracking and risk prediction',
    dataGenerator: 'generateReadmissionData',
    icon: 'AlertCircle',
    kpis: [
      { label: 'Readmissions', value: 'totalReadmissions', icon: 'AlertCircle' },
      { label: 'Readmission Rate', value: 'readmissionRate', unit: '%', icon: 'TrendingDown' },
      { label: 'Avg Days to Readmit', value: 'avgDaysToReadmit', unit: 'days', icon: 'Clock' },
      { label: 'Preventable', value: 'preventableCount', icon: 'Shield' }
    ],
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'initialAdmit', label: 'Initial', sortable: true, width: '120px' },
      { key: 'discharge', label: 'Discharge', sortable: true, width: '120px' },
      { key: 'readmitDate', label: 'Readmit', sortable: true, width: '120px' },
      { key: 'daysToReadmit', label: 'Days', sortable: true, width: '80px', align: 'right' },
      { key: 'diagnosis', label: 'Diagnosis', sortable: true, width: '180px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'riskScore', label: 'Risk', sortable: true, width: '90px', align: 'right' },
      { key: 'preventable', label: 'Preventable', sortable: true, width: '110px', align: 'center' }
    ]
  },
  'analytics/length-of-stay': {
    title: 'Length of Stay Analysis',
    description: 'Average LOS, outliers, and efficiency benchmarks',
    dataGenerator: 'generateReadmissionData',
    icon: 'BarChart3',
    kpis: [
      { label: 'Avg LOS', value: 'avgLOS', unit: 'days', icon: 'Calendar' },
      { label: 'Median LOS', value: 'medianLOS', unit: 'days', icon: 'BarChart3' },
      { label: 'Outliers', value: 'outlierCount', icon: 'AlertTriangle' },
      { label: 'Discharges', value: 'totalReadmissions', icon: 'Activity' }
    ]
  },
  'analytics/high-risk': {
    title: 'High-Risk Patient List',
    description: 'Patients requiring intensive care management and monitoring',
    dataGenerator: 'generatePatientSummaryData',
    icon: 'AlertCircle',
    kpis: [
      { label: 'High-Risk Patients', value: 'highRiskCount', icon: 'AlertCircle' },
      { label: 'ER Visits (30d)', value: 'erVisitsCount', icon: 'Ambulance' },
      { label: 'Hospitalizations', value: 'hospitalizationCount', icon: 'Hospital' },
      { label: 'Care Plans Active', value: 'carePlansCount', icon: 'FileText' }
    ]
  },
  'analytics/hedis': {
    title: 'HEDIS Quality Measures',
    description: 'Healthcare effectiveness data and quality metric reporting',
    dataGenerator: 'generateComplianceData',
    icon: 'Target',
    kpis: [
      { label: 'Measures Tracked', value: 'totalCompliance', icon: 'Target' },
      { label: 'Above Benchmark', value: 'compliantCount', icon: 'TrendingUp' },
      { label: 'Below Benchmark', value: 'nonCompliantCount', icon: 'TrendingDown' },
      { label: 'Overall Score', value: 'overallScore', unit: '%', icon: 'Award' }
    ]
  },
  'analytics/care-gap': {
    title: 'Care Gap Analysis',
    description: 'Preventive care gaps and quality improvement opportunities',
    dataGenerator: 'generateComplianceData',
    icon: 'GitBranch',
    kpis: [
      { label: 'Open Gaps', value: 'nonCompliantCount', icon: 'AlertTriangle' },
      { label: 'Closed This Month', value: 'compliantCount', icon: 'CheckCircle' },
      { label: 'Closure Rate', value: 'complianceRate', unit: '%', icon: 'TrendingUp' },
      { label: 'Patients Affected', value: 'patientsAffected', icon: 'Users' }
    ]
  },
  'analytics/benchmarking': {
    title: 'Performance Benchmarking',
    description: 'Comparison to national standards and peer organizations',
    dataGenerator: 'generateProviderProductivityData',
    icon: 'BarChart2',
    kpis: [
      { label: 'Above Benchmark', value: 'aboveBenchmark', unit: '%', icon: 'TrendingUp' },
      { label: 'At Benchmark', value: 'atBenchmark', unit: '%', icon: 'Minus' },
      { label: 'Below Benchmark', value: 'belowBenchmark', unit: '%', icon: 'TrendingDown' },
      { label: 'Metrics Tracked', value: 'totalProviders', icon: 'BarChart2' }
    ]
  },
  'clinical/population-health': {
    title: 'Population Health Analytics',
    description: 'Community health trends, demographics, and outcome analysis',
    dataGenerator: 'generatePopulationHealthData',
    icon: 'Users',
    kpis: [
      { label: 'Population Size', value: 'totalPopulation', icon: 'Users' },
      { label: 'Avg Risk Score', value: 'avgRiskScore', icon: 'Activity' },
      { label: 'Chronic Conditions', value: 'chronicCount', icon: 'FileText' },
      { label: 'Total Cost', value: 'totalPopulationCost', icon: 'DollarSign' }
    ]
  },

  // ========== TECHNICAL/INTEGRATION REPORTS (6) ==========
  'technical/fhir-api': {
    title: 'FHIR API Usage',
    description: 'API endpoint performance, usage patterns, and error rates',
    dataGenerator: 'generateAPIUsageData',
    icon: 'Code',
    kpis: [
      { label: 'Total Requests', value: 'totalRequests', icon: 'Activity' },
      { label: 'Success Rate', value: 'successRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Avg Response Time', value: 'avgResponseTime', unit: 'ms', icon: 'Zap' },
      { label: 'Error Rate', value: 'errorRate', unit: '%', icon: 'AlertTriangle' }
    ],
    columns: [
      { key: 'id', label: 'Request ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'timestamp', label: 'Timestamp', sortable: true, width: '180px' },
      { key: 'endpoint', label: 'Endpoint', sortable: true, width: '200px' },
      { key: 'method', label: 'Method', sortable: true, width: '80px' },
      { key: 'statusCode', label: 'Status', sortable: true, width: '80px', align: 'center', render: 'statusCode' },
      { key: 'responseTime', label: 'Time (ms)', sortable: true, width: '100px', align: 'right' },
      { key: 'requestSize', label: 'Req Size', sortable: true, width: '100px', align: 'right' },
      { key: 'responseSize', label: 'Res Size', sortable: true, width: '100px', align: 'right' },
      { key: 'clientId', label: 'Client', sortable: true, width: '120px' }
    ]
  },
  'technical/adt-messages': {
    title: 'ADT Interface Messages',
    description: 'HL7 ADT message processing, errors, and system integration health',
    dataGenerator: 'generateInterfaceData',
    icon: 'Network',
    kpis: [
      { label: 'Total Messages', value: 'totalMessages', icon: 'MessageSquare' },
      { label: 'Success Rate', value: 'successRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Failed', value: 'failedCount', icon: 'XCircle' },
      { label: 'Avg Processing', value: 'avgProcessing', unit: 'ms', icon: 'Zap' }
    ],
    columns: [
      { key: 'id', label: 'Message ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'timestamp', label: 'Timestamp', sortable: true, width: '180px' },
      { key: 'messageType', label: 'Type', sortable: true, width: '100px' },
      { key: 'source', label: 'Source', sortable: true, width: '140px' },
      { key: 'destination', label: 'Destination', sortable: true, width: '140px' },
      { key: 'processingTime', label: 'Time (ms)', sortable: true, width: '100px', align: 'right' },
      { key: 'attempts', label: 'Attempts', sortable: true, width: '90px', align: 'center' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  'technical/interface-uptime': {
    title: 'Interface Uptime & Reliability',
    description: 'System integration availability and connection monitoring',
    dataGenerator: 'generateInterfaceData',
    icon: 'Activity',
    kpis: [
      { label: 'Overall Uptime', value: 'uptimePercentage', unit: '%', icon: 'Activity' },
      { label: 'Active Interfaces', value: 'activeInterfaces', icon: 'Network' },
      { label: 'Downtime Events', value: 'failedCount', icon: 'AlertTriangle' },
      { label: 'Avg Uptime', value: 'avgUptime', unit: 'hours', icon: 'Clock' }
    ]
  },
  'technical/data-validation': {
    title: 'Data Quality & Validation',
    description: 'Data integrity checks, validation errors, and quality scores',
    dataGenerator: 'generateInterfaceData',
    icon: 'CheckSquare',
    kpis: [
      { label: 'Records Validated', value: 'totalMessages', icon: 'CheckSquare' },
      { label: 'Pass Rate', value: 'successRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Validation Errors', value: 'failedCount', icon: 'XCircle' },
      { label: 'Data Quality Score', value: 'qualityScore', unit: '%', icon: 'Award' }
    ]
  },
  'technical/sync-failure': {
    title: 'Synchronization Failures',
    description: 'Failed data sync operations and retry status',
    dataGenerator: 'generateInterfaceData',
    icon: 'RefreshCcw',
    kpis: [
      { label: 'Failed Syncs', value: 'failedCount', icon: 'XCircle' },
      { label: 'Retry Queue', value: 'retryingCount', icon: 'RefreshCcw' },
      { label: 'Success Rate', value: 'successRate', unit: '%', icon: 'CheckCircle' },
      { label: 'Avg Retry Time', value: 'avgProcessing', unit: 'ms', icon: 'Clock' }
    ]
  },
  'technical/batch-jobs': {
    title: 'Batch Job Monitoring',
    description: 'Scheduled job execution, performance, and error tracking',
    dataGenerator: 'generateInterfaceData',
    icon: 'Server',
    kpis: [
      { label: 'Total Jobs', value: 'totalMessages', icon: 'Server' },
      { label: 'Successful', value: 'successCount', icon: 'CheckCircle' },
      { label: 'Failed', value: 'failedCount', icon: 'XCircle' },
      { label: 'Avg Execution', value: 'avgProcessing', unit: 'ms', icon: 'Zap' }
    ]
  },

  // ========== ADMINISTRATIVE/CUSTOM REPORTS (5) ==========
  'administrative/user-roles': {
    title: 'User Roles & Permissions',
    description: 'User account management, role assignments, and access control',
    dataGenerator: 'generateUserActivityData',
    icon: 'Users',
    kpis: [
      { label: 'Total Users', value: 'totalUsers', icon: 'Users' },
      { label: 'Active Users', value: 'activeUsers', icon: 'UserCheck' },
      { label: 'Inactive', value: 'inactiveUsers', icon: 'UserX' },
      { label: 'Locked Accounts', value: 'lockedUsers', icon: 'Lock' }
    ],
    columns: [
      { key: 'id', label: 'User ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'userName', label: 'Username', sortable: true, width: '220px', render: 'bold' },
      { key: 'role', label: 'Role', sortable: true, width: '130px' },
      { key: 'department', label: 'Department', sortable: true, width: '150px' },
      { key: 'lastLogin', label: 'Last Login', sortable: true, width: '120px' },
      { key: 'sessionsCount', label: 'Sessions', sortable: true, width: '90px', align: 'right' },
      { key: 'avgSessionDuration', label: 'Avg Session', sortable: true, width: '120px', align: 'right' },
      { key: 'recordsAccessed', label: 'Records', sortable: true, width: '90px', align: 'right' },
      { key: 'status', label: 'Status', sortable: true, width: '100px', render: 'status' }
    ]
  },
  'administrative/access-usage': {
    title: 'System Access Usage',
    description: 'Login patterns, session duration, and feature utilization',
    dataGenerator: 'generateUserActivityData',
    icon: 'Activity',
    kpis: [
      { label: 'Total Sessions', value: 'totalSessions', icon: 'Activity' },
      { label: 'Unique Users', value: 'totalUsers', icon: 'Users' },
      { label: 'Avg Session Duration', value: 'avgSessionTime', unit: 'min', icon: 'Clock' },
      { label: 'Peak Usage Time', value: 'peakUsageTime', icon: 'TrendingUp' }
    ]
  },
  'administrative/master-data': {
    title: 'Master Data Management',
    description: 'Reference data, code sets, and master file maintenance',
    dataGenerator: 'generateComplianceData',
    icon: 'Database',
    kpis: [
      { label: 'Total Records', value: 'totalCompliance', icon: 'Database' },
      { label: 'Active', value: 'compliantCount', icon: 'CheckCircle' },
      { label: 'Inactive', value: 'nonCompliantCount', icon: 'XCircle' },
      { label: 'Pending Review', value: 'pendingCount', icon: 'Clock' }
    ]
  },
  'administrative/insurance-master': {
    title: 'Insurance Master File',
    description: 'Payer information, coverage details, and contract terms',
    dataGenerator: 'generateClaimsData',
    icon: 'Shield',
    kpis: [
      { label: 'Total Payers', value: 'totalPayers', icon: 'Building2' },
      { label: 'Active Contracts', value: 'activeContracts', icon: 'FileCheck' },
      { label: 'Expiring Soon', value: 'expiringSoon', icon: 'AlertTriangle' },
      { label: 'Avg Reimbursement', value: 'avgReimbursement', unit: '%', icon: 'TrendingUp' }
    ]
  },
  'administrative/report-builder': {
    title: 'Custom Report Builder',
    description: 'User-defined reports and ad-hoc query interface',
    dataGenerator: 'generateUserActivityData',
    icon: 'FileSpreadsheet',
    kpis: [
      { label: 'Custom Reports', value: 'totalUsers', icon: 'FileSpreadsheet' },
      { label: 'Run This Month', value: 'reportsRun', icon: 'Play' },
      { label: 'Scheduled', value: 'scheduledReports', icon: 'Calendar' },
      { label: 'Most Popular', value: 'mostPopular', icon: 'TrendingUp' }
    ]
  }
};

// Generate render function based on type
function generateRenderFunction(renderType) {
  if (!renderType) return null;

  const renders = {
    'monospace-blue': '(value) => <span className="font-mono text-blue-600 font-medium">{value}</span>',
    'bold': '(value) => <span className="font-medium text-gray-900">{value}</span>',
    'currency': '(value) => <span className="font-semibold text-green-600">${value.toLocaleString()}</span>',
    'status': `(value) => (
      <span className={\`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${
        value === 'Active' || value === 'Completed' || value === 'Success' || value === 'Approved' || value === 'Paid' || value === 'Final' ? 'bg-green-100 text-green-800' :
        value === 'Pending' || value === 'Scheduled' || value === 'Submitted' || value === 'Preliminary' ? 'bg-blue-100 text-blue-800' :
        value === 'Failed' || value === 'Denied' || value === 'Cancelled' ? 'bg-red-100 text-red-800' :
        'bg-orange-100 text-orange-800'
      }\`}>
        {value}
      </span>
    )`,
    'status-abnormal': `(value) => (
      <span className={\`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${
        value === 'Normal' ? 'bg-green-100 text-green-800' :
        value === 'Abnormal' ? 'bg-orange-100 text-orange-800' :
        'bg-red-100 text-red-800'
      }\`}>
        {value}
      </span>
    )`,
    'risk': `(value) => (
      <span className={\`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${
        value === 'Low' ? 'bg-green-100 text-green-800' :
        value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
        value === 'High' ? 'bg-orange-100 text-orange-800' :
        'bg-red-100 text-red-800'
      }\`}>
        {value}
      </span>
    )`,
    'riskScore': '(value) => <span className={`font-semibold ${value >= 7 ? \'text-red-600\' : value >= 4 ? \'text-orange-600\' : \'text-green-600\'}`}>{value}/10</span>',
    'rating': '(value) => <span className="text-gray-900">{value}/5 ⭐</span>',
    'statusCode': `(value) => (
      <span className={\`font-mono text-xs \${
        value >= 200 && value < 300 ? 'text-green-600' :
        value >= 400 && value < 500 ? 'text-orange-600' :
        value >= 500 ? 'text-red-600' :
        'text-gray-600'
      }\`}>
        {value}
      </span>
    )`
  };

  return renders[renderType] || null;
}

// Generate column definition
function generateColumns(columns) {
  return columns.map(col => {
    const render = generateRenderFunction(col.render);
    return `  {
    key: '${col.key}',
    label: '${col.label}',
    sortable: ${col.sortable !== false},${col.width ? `\n    width: '${col.width}',` : ''}${col.align ? `\n    align: '${col.align}',` : ''}${render ? `\n    render: ${render}` : ''}
  }`;
  }).join(',\n');
}

// Generate KPI calculations
function generateKPICalculations(config, dataVar) {
  if (!config.kpis) return '';

  const calculations = config.kpis.map(kpi => {
    const value = kpi.value;

    // Add all calculation logic here
    const calcMap = {
      'totalPatients': `const totalPatients = ${dataVar}.length;`,
      'totalProviders': `const totalProviders = ${dataVar}.length;`,
      'totalEncounters': `const totalEncounters = ${dataVar}.length;`,
      'totalAppts': `const totalAppts = ${dataVar}.length;`,
      'totalBeds': `const totalBeds = ${dataVar}.length;`,
      'totalTests': `const totalTests = ${dataVar}.length;`,
      'totalMeds': `const totalMeds = ${dataVar}.length;`,
      'totalClaims': `const totalClaims = ${dataVar}.length;`,
      'totalPayments': `const totalPayments = ${dataVar}.length;`,
      'totalAR': `const totalAR = '$' + (${dataVar}.reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`,
      'totalCompliance': `const totalCompliance = ${dataVar}.length;`,
      'totalAccess': `const totalAccess = ${dataVar}.length;`,
      'totalVisits': `const totalVisits = ${dataVar}.length;`,
      'totalReadmissions': `const totalReadmissions = ${dataVar}.length;`,
      'totalRequests': `const totalRequests = ${dataVar}.length;`,
      'totalMessages': `const totalMessages = ${dataVar}.length;`,
      'totalUsers': `const totalUsers = ${dataVar}.length;`,
      'totalPopulation': `const totalPopulation = ${dataVar}.reduce((sum, d) => sum + (d.patientCount || 1), 0);`,

      'highRiskCount': `const highRiskCount = ${dataVar}.filter(d => d.riskScore >= 7 || d.riskLevel === 'High' || d.riskLevel === 'Very High').length;`,
      'avgAge': `const avgAge = (${dataVar}.reduce((sum, d) => sum + (d.age || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'activeCount': `const activeCount = ${dataVar}.filter(d => d.status === 'Active' || d.status === 'Stable').length;`,
      'completedCount': `const completedCount = ${dataVar}.filter(d => d.status === 'Completed').length;`,
      'avgDuration': `const avgDuration = (${dataVar}.reduce((sum, d) => sum + (d.duration || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'totalCharges': `const totalCharges = '$' + (${dataVar}.reduce((sum, d) => sum + (d.charges || 0), 0) / 1000).toFixed(1) + 'K';`,
      'pendingCount': `const pendingCount = ${dataVar}.filter(d => d.status === 'Pending' || d.status === 'Pending Review' || d.status === 'Scheduled').length;`,
      'abnormalCount': `const abnormalCount = ${dataVar}.filter(d => d.abnormal === 'Abnormal' || d.abnormal === 'Critical').length;`,
      'criticalCount': `const criticalCount = ${dataVar}.filter(d => d.abnormal === 'Critical' || d.priority === 'STAT').length;`,
      'refillsNeeded': `const refillsNeeded = ${dataVar}.filter(d => d.refillsRemaining === 0).length;`,
      'discontinuedCount': `const discontinuedCount = ${dataVar}.filter(d => d.status === 'Discontinued' || d.status === 'Inactive').length;`,
      'completionRate': `const completionRate = ((${dataVar}.filter(d => d.status === 'Completed').length / ${dataVar}.length) * 100).toFixed(0);`,
      'totalRevenue': `const totalRevenue = '$' + (${dataVar}.reduce((sum, d) => sum + (d.revenue || d.charges || 0), 0) / 1000).toFixed(1) + 'K';`,

      'avgPatients': `const avgPatients = (${dataVar}.reduce((sum, d) => sum + (d.patients || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'utilizationRate': `const utilizationRate = ((${dataVar}.filter(d => d.status !== 'Cancelled' && d.status !== 'Available').length / ${dataVar}.length) * 100).toFixed(0);`,
      'noShowRate': `const noShowRate = ((${dataVar}.filter(d => d.status === 'No Show').length / ${dataVar}.length) * 100).toFixed(1);`,
      'avgWaitTime': `const avgWaitTime = (${dataVar}.reduce((sum, d) => sum + (d.waitTime || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'occupiedCount': `const occupiedCount = ${dataVar}.filter(d => d.status === 'Occupied').length;`,
      'occupancyRate': `const occupancyRate = ((${dataVar}.filter(d => d.status === 'Occupied').length / ${dataVar}.length) * 100).toFixed(0);`,
      'availableCount': `const availableCount = ${dataVar}.filter(d => d.status === 'Available').length;`,

      'approvalRate': `const approvalRate = ((${dataVar}.filter(d => d.status === 'Approved' || d.status === 'Paid').length / ${dataVar}.length) * 100).toFixed(0);`,
      'totalAmount': `const totalAmount = '$' + (${dataVar}.reduce((sum, d) => sum + (d.claimAmount || d.amount || d.totalAmount || 0), 0) / 1000).toFixed(1) + 'K';`,
      'todayCount': `const todayCount = ${dataVar}.filter(d => d.paymentDate === new Date().toISOString().split('T')[0]).length;`,
      'outstandingAmount': `const outstandingAmount = '$' + (${dataVar}.reduce((sum, d) => sum + (d.balance || d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`,
      'avgDaysToPay': `const avgDaysToPay = (${dataVar}.reduce((sum, d) => sum + (d.daysOutstanding || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'bucket0_30': `const bucket0_30 = '$' + (${dataVar}.filter(d => d.agingBucket === '0-30').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`,
      'bucket31_90': `const bucket31_90 = '$' + (${dataVar}.filter(d => d.agingBucket === '31-60' || d.agingBucket === '61-90').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`,
      'bucket90Plus': `const bucket90Plus = '$' + (${dataVar}.filter(d => d.agingBucket === '91-120' || d.agingBucket === '120+').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`,

      'complianceRate': `const complianceRate = ((${dataVar}.filter(d => d.status === 'Compliant').length / ${dataVar}.length) * 100).toFixed(0);`,
      'compliantCount': `const compliantCount = ${dataVar}.filter(d => d.status === 'Compliant').length;`,
      'nonCompliantCount': `const nonCompliantCount = ${dataVar}.filter(d => d.status === 'Non-Compliant' || d.status === 'Inactive').length;`,
      'uniqueUsers': `const uniqueUsers = new Set(${dataVar}.map(d => d.user || d.userName)).size;`,
      'failedCount': `const failedCount = ${dataVar}.filter(d => d.status === 'Failed' || d.status === 'Unauthorized' || d.status === 'Denied').length;`,
      'unauthorizedCount': `const unauthorizedCount = ${dataVar}.filter(d => d.status === 'Unauthorized').length;`,

      'activeUsers': `const activeUsers = ${dataVar}.filter(d => d.status === 'Active').length;`,
      'enrollmentRate': `const enrollmentRate = ((${dataVar}.filter(d => d.status === 'Active').length / ${dataVar}.length) * 100).toFixed(0);`,
      'avgLogins': `const avgLogins = (${dataVar}.reduce((sum, d) => sum + (d.loginCount || 0), 0) / ${dataVar}.length).toFixed(1);`,
      'avgSatisfaction': `const avgSatisfaction = (${dataVar}.reduce((sum, d) => sum + (d.satisfaction || 0), 0) / ${dataVar}.length).toFixed(1);`,

      'readmissionRate': `const readmissionRate = ((${dataVar}.length / 200) * 100).toFixed(1);`,
      'avgDaysToReadmit': `const avgDaysToReadmit = (${dataVar}.reduce((sum, d) => sum + (d.daysToReadmit || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'preventableCount': `const preventableCount = ${dataVar}.filter(d => d.preventable === 'Yes').length;`,

      'successRate': `const successRate = ((${dataVar}.filter(d => d.status === 'Success' || (d.statusCode >= 200 && d.statusCode < 300)).length / ${dataVar}.length) * 100).toFixed(0);`,
      'avgResponseTime': `const avgResponseTime = (${dataVar}.reduce((sum, d) => sum + (d.responseTime || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'errorRate': `const errorRate = ((${dataVar}.filter(d => (d.statusCode >= 400) || d.status === 'Failed').length / ${dataVar}.length) * 100).toFixed(1);`,
      'avgProcessing': `const avgProcessing = (${dataVar}.reduce((sum, d) => sum + (d.processingTime || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'successCount': `const successCount = ${dataVar}.filter(d => d.status === 'Success' || d.status === 'Completed').length;`,

      'inactiveUsers': `const inactiveUsers = ${dataVar}.filter(d => d.status === 'Inactive').length;`,
      'lockedUsers': `const lockedUsers = ${dataVar}.filter(d => d.status === 'Locked').length;`,

      // Additional calculations for specific metrics
      'thisMonthCount': `const thisMonthCount = ${dataVar}.filter(d => new Date(d.date).getMonth() === new Date().getMonth()).length;`,
      'avgEventsPerPatient': `const avgEventsPerPatient = (${dataVar}.length / new Set(${dataVar}.map(d => d.patientName)).size).toFixed(1);`,
      'activePatients': `const activePatients = new Set(${dataVar}.map(d => d.patientName)).size;`,
      'uniquePatients': `const uniquePatients = new Set(${dataVar}.map(d => d.patientName)).size;`,
      'bookedCount': `const bookedCount = ${dataVar}.filter(d => d.status === 'Scheduled' || d.status === 'Completed').length;`,
      'maintenanceCount': `const maintenanceCount = Math.floor(${dataVar}.length * 0.1);`,
      'deniedCount': `const deniedCount = ${dataVar}.filter(d => d.status === 'Denied').length;`,
      'denialRate': `const denialRate = ((${dataVar}.filter(d => d.status === 'Denied').length / ${dataVar}.length) * 100).toFixed(1);`,
      'appealCount': `const appealCount = Math.floor(${dataVar}.filter(d => d.status === 'Denied').length * 0.6);`,
      'overturnedCount': `const overturnedCount = Math.floor(${dataVar}.filter(d => d.status === 'Denied').length * 0.3);`,

      // More specific calculations
      'controlledCount': `const controlledCount = ${dataVar}.reduce((sum, d) => sum + (d.controlledCount || Math.floor((d.patientCount || 0) * 0.6)), 0);`,
      'avgCost': `const avgCost = '$' + (${dataVar}.reduce((sum, d) => sum + (d.averageCost || 0), 0) / ${dataVar}.length / 1000).toFixed(1) + 'K';`,
      'totalSpecialties': `const totalSpecialties = new Set(${dataVar}.map(d => d.specialty)).size;`,
      'onTimeRate': `const onTimeRate = ((${dataVar}.filter(d => d.waitTime <= 15).length / ${dataVar}.length) * 100).toFixed(0);`,
      'maxWaitTime': `const maxWaitTime = Math.max(...${dataVar}.map(d => d.waitTime || 0));`,
      'avgLagTime': `const avgLagTime = Math.floor(Math.random() * 5) + 2;`,
      'postedToday': `const postedToday = Math.floor(${dataVar}.length * 0.2);`,
      'overdueCount': `const overdueCount = Math.floor(${dataVar}.length * 0.15);`,
      'patientsWithBalance': `const patientsWithBalance = new Set(${dataVar}.map(d => d.patientName)).size;`,
      'avgBalance': `const avgBalance = '$' + ((${dataVar}.reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / ${dataVar}.length) / 1000).toFixed(1) + 'K';`,
      'collectionRate': `const collectionRate = '75';`,
      'topDepartment': `const topDepartment = '${['Cardiology', 'Surgery', 'Emergency'][Math.floor(Math.random() * 3)]}';`,
      'avgRevenue': `const avgRevenue = '$' + ((${dataVar}.reduce((sum, d) => sum + (d.revenue || 0), 0) / ${dataVar}.length) / 1000).toFixed(1) + 'K';`,
      'growthRate': `const growthRate = (Math.random() * 20 - 5).toFixed(1);`,
      'grossMargin': `const grossMargin = (60 + Math.random() * 15).toFixed(1);`,
      'topService': `const topService = 'Diagnostic Imaging';`,
      'totalPayers': `const totalPayers = new Set(${dataVar}.map(d => d.payer)).size;`,
      'topPayer': `const topPayer = ${dataVar}[0]?.payer || 'Blue Cross';`,
      'avgReimbursement': `const avgReimbursement = (75 + Math.random() * 15).toFixed(0);`,

      // Analytics and population health
      'mediumRiskCount': `const mediumRiskCount = ${dataVar}.filter(d => d.riskScore >= 4 && d.riskScore < 7).length;`,
      'lowRiskCount': `const lowRiskCount = ${dataVar}.filter(d => d.riskScore < 4).length;`,
      'conditionsCount': `const conditionsCount = new Set(${dataVar}.map(d => d.condition)).size;`,
      'highRiskPopulation': `const highRiskPopulation = ${dataVar}.filter(d => d.riskLevel === 'High' || d.riskLevel === 'Very High').reduce((sum, d) => sum + (d.patientCount || 0), 0);`,
      'avgCostPerPatient': `const avgCostPerPatient = '$' + (${dataVar}.reduce((sum, d) => sum + (d.averageCost || 0), 0) / ${dataVar}.reduce((sum, d) => sum + (d.patientCount || 1), 0) / 1000).toFixed(1) + 'K';`,
      'casesThisWeek': `const casesThisWeek = Math.floor(${dataVar}.reduce((sum, d) => sum + (d.patientCount || 0), 0) * 0.2);`,
      'activeAlerts': `const activeAlerts = Math.floor(${dataVar}.length * 0.1);`,
      'trendingCount': `const trendingCount = Math.floor(${dataVar}.length * 0.3);`,
      'notificationsSent': `const notificationsSent = Math.floor(${dataVar}.length * 5);`,
      'avgLOS': `const avgLOS = (${dataVar}.reduce((sum, d) => sum + (d.daysToReadmit || 0), 0) / ${dataVar}.length).toFixed(1);`,
      'medianLOS': `const medianLOS = '4.5';`,
      'outlierCount': `const outlierCount = Math.floor(${dataVar}.length * 0.1);`,
      'erVisitsCount': `const erVisitsCount = Math.floor(${dataVar}.filter(d => d.riskScore >= 7).length * 2);`,
      'hospitalizationCount': `const hospitalizationCount = Math.floor(${dataVar}.filter(d => d.riskScore >= 7).length * 1.5);`,
      'carePlansCount': `const carePlansCount = ${dataVar}.filter(d => d.riskScore >= 7).length;`,
      'overallScore': `const overallScore = (70 + Math.random() * 20).toFixed(0);`,
      'patientsAffected': `const patientsAffected = Math.floor(${dataVar}.length * 2.5);`,
      'aboveBenchmark': `const aboveBenchmark = (40 + Math.random() * 20).toFixed(0);`,
      'atBenchmark': `const atBenchmark = (20 + Math.random() * 10).toFixed(0);`,
      'belowBenchmark': `const belowBenchmark = (30 + Math.random() * 15).toFixed(0);`,
      'avgRiskScore': `const avgRiskScore = (${dataVar}.reduce((sum, d) => sum + ((d.riskScore || 5) * (d.patientCount || 1)), 0) / ${dataVar}.reduce((sum, d) => sum + (d.patientCount || 1), 0)).toFixed(1);`,
      'chronicCount': `const chronicCount = ${dataVar}.reduce((sum, d) => sum + (d.patientCount || 1), 0);`,
      'totalPopulationCost': `const totalPopulationCost = '$' + (${dataVar}.reduce((sum, d) => sum + (d.averageCost || 0) * (d.patientCount || 1), 0) / 1000000).toFixed(1) + 'M';`,

      // Technical metrics
      'activeInterfaces': `const activeInterfaces = Math.floor(${dataVar}.length / 10);`,
      'uptimePercentage': `const uptimePercentage = (95 + Math.random() * 4).toFixed(2);`,
      'avgUptime': `const avgUptime = (${dataVar}.length * 0.02).toFixed(1);`,
      'qualityScore': `const qualityScore = ((${dataVar}.filter(d => d.status === 'Success').length / ${dataVar}.length) * 100).toFixed(0);`,
      'retryingCount': `const retryingCount = ${dataVar}.filter(d => d.attempts > 1 && d.status !== 'Success').length;`,

      // Administrative metrics
      'totalSessions': `const totalSessions = ${dataVar}.reduce((sum, d) => sum + (d.sessionsCount || 0), 0);`,
      'avgSessionTime': `const avgSessionTime = (${dataVar}.reduce((sum, d) => sum + (d.avgSessionDuration || 0), 0) / ${dataVar}.length).toFixed(0);`,
      'peakUsageTime': `const peakUsageTime = ['9:00 AM', '2:00 PM', '11:00 AM'][Math.floor(Math.random() * 3)];`,
      'activeContracts': `const activeContracts = Math.floor(${dataVar}.length * 0.8);`,
      'expiringSoon': `const expiringSoon = Math.floor(${dataVar}.length * 0.15);`,
      'reportsRun': `const reportsRun = Math.floor(${dataVar}.length * 3);`,
      'scheduledReports': `const scheduledReports = Math.floor(${dataVar}.length * 0.4);`,
      'mostPopular': `const mostPopular = 'Patient Summary';`,

      // Patient engagement
      'avgResponseTime': `const avgResponseTime = (${dataVar}.reduce((sum, d) => sum + (d.messagesExchanged || 0), 0) / ${dataVar}.length * 2).toFixed(1);`,
      'withinSLACount': `const withinSLACount = ((${dataVar}.filter(d => d.loginCount > 5).length / ${dataVar}.length) * 100).toFixed(0);`,
      'unreadCount': `const unreadCount = Math.floor(${dataVar}.length * 0.2);`,
      'activeThreads': `const activeThreads = Math.floor(${dataVar}.length * 0.4);`,
      'complaintsCount': `const complaintsCount = Math.floor(${dataVar}.length * 0.1);`,
      'responseRate': `const responseRate = (70 + Math.random() * 20).toFixed(0);`,
      'promoterCount': `const promoterCount = Math.floor(${dataVar}.filter(d => d.satisfaction >= 4).length);`,
      'submissionCount': `const submissionCount = Math.floor(${dataVar}.length * 0.85);`,
      'uniqueIPs': `const uniqueIPs = new Set(${dataVar}.map(d => d.ipAddress || '')).size;`,
      'lockedAccounts': `const lockedAccounts = Math.floor(${dataVar}.length * 0.05);`,
      'suspiciousCount': `const suspiciousCount = Math.floor(${dataVar}.length * 0.15);`,
    };

    return calcMap[value] || `const ${value} = 0; // TODO: Calculate ${value}`;
  });

  return calculations.join('\n  ');
}

// Generate KPI cards
function generateKPICards(kpis, calculations) {
  return kpis.map((kpi, index) => {
    const value = kpi.unit ? `{${kpi.value}}${kpi.unit}` : `{${kpi.value}}`;
    return `          <Card key="${index}">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">${kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">${value}</div>
                </div>
                <${kpi.icon} className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>`;
  }).join('\n');
}

// Generate report page
function generateReportPage(reportPath, config) {
  const dataVar = 'reportData';
  const kpiCalculations = generateKPICalculations(config, dataVar);
  const columns = config.columns || [];
  const columnsCode = columns.length > 0 ? generateColumns(columns) : '';

  // Get unique icons
  const icons = ['Activity', 'AlertTriangle', 'CheckCircle', 'Clock', 'DollarSign', 'Users', 'TrendingUp',
                 'Calendar', 'Video', 'MessageSquare', 'Star', 'Shield', 'Zap', 'Code', 'Network', 'XCircle',
                 'UserCheck', 'UserX', 'Lock', 'AlertCircle', 'Timer', 'FileText', 'Award', 'Building',
                 'Building2', 'Send', 'Syringe', 'ShieldAlert', 'Globe', 'ScrollText', 'FileCheck',
                 'MessageCircle', 'ClipboardCheck', 'ThumbsUp', 'Database', 'GitBranch', 'Layers',
                 'TrendingDown', 'Ambulance', 'Hospital', 'Target', 'BarChart2', 'Minus', 'ArrowUpCircle',
                 'PieChart', 'RefreshCcw', 'Server', 'FileSpreadsheet', 'Play', 'ArrowRightCircle',
                 'HeartPulse', 'Stethoscope', 'User', 'Bed', 'Cpu', 'CreditCard', 'Wallet', 'Pill',
                 'Microscope', 'Truck', 'Barcode', 'CheckSquare', 'BellRing', 'TrendingUpDown'];
  const allIcons = [config.icon, ...(config.kpis || []).map(k => k.icon)];
  const uniqueIcons = [...new Set(allIcons)].filter(Boolean);

  return `'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ${uniqueIcons.join(', ')} } from 'lucide-react';
import { ${config.dataGenerator} } from '@/lib/report-data-generators';

const ${dataVar} = ${config.dataGenerator}(30);

${columnsCode.length > 0 ? `// Table columns
const tableColumns: TableColumn[] = [
${columnsCode}
];` : ''}

export default function ReportPage() {
  ${kpiCalculations}

  return (
    <ReportTemplate
      title="${config.title}"
      description="${config.description}"
      icon={<${config.icon} className="h-6 w-6 text-blue-600" />}
      onExport={() => console.log('Exporting...')}
      onRefresh={() => console.log('Refreshing...')}${columnsCode.length > 0 ? '\n      tableColumns={tableColumns}\n      tableData={' + dataVar + '}' : ''}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
${config.kpis ? generateKPICards(config.kpis, kpiCalculations) : ''}
        </div>

        {/* Visualization placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <div className="text-sm">Data visualizations and trend analysis will be displayed here</div>
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for ${config.title}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
`;
}

// Update all configured reports
console.log('Updating ALL reports with specific data...\n');

let successCount = 0;
let failCount = 0;

Object.entries(allReportConfigs).forEach(([reportPath, config]) => {
  const fullPath = path.join(__dirname, '..', 'src', 'app', 'reports', reportPath, 'page.tsx');

  try {
    const content = generateReportPage(fullPath, config);
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Updated ${reportPath}`);
    successCount++;
  } catch (error) {
    console.error(`✗ Failed to update ${reportPath}:`, error.message);
    failCount++;
  }
});

console.log(`\n✅ Report update complete! ${successCount} reports updated successfully.`);
if (failCount > 0) {
  console.log(`⚠️  ${failCount} reports failed to update.`);
}
