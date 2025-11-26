const fs = require('fs');
const path = require('path');

// Report configurations with specific data generators
const reportConfigs = {
  // Clinical Reports
  'clinical/lab-radiology': {
    title: 'Lab & Radiology Results',
    description: 'Laboratory test results, imaging reports, and diagnostic findings',
    dataGenerator: 'generateLabResultsData',
    icon: 'Microscope',
    kpis: [
      { label: 'Total Tests', value: 'totalTests', icon: 'Activity' },
      { label: 'Abnormal Results', value: 'abnormalCount', icon: 'AlertTriangle' },
      { label: 'Pending', value: 'pendingCount', icon: 'Clock' },
      { label: 'Avg Turnaround', value: 'avgTurnaround', unit: 'hours', icon: 'Timer' }
    ],
    columns: [
      { key: 'id', label: 'Test ID', sortable: true, width: '120px', render: 'monospace-blue' },
      { key: 'patientName', label: 'Patient', sortable: true, width: '180px', render: 'bold' },
      { key: 'testName', label: 'Test Name', sortable: true, width: '150px' },
      { key: 'orderDate', label: 'Order Date', sortable: true, width: '120px' },
      { key: 'resultDate', label: 'Result Date', sortable: true, width: '120px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'abnormal', label: 'Result', sortable: true, width: '120px', render: 'status-abnormal' },
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
      { label: 'Reviewed', value: 'reviewedCount', icon: 'CheckCircle' },
      { label: 'Pending Review', value: 'pendingCount', icon: 'Clock' }
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
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' },
      { key: 'refillsRemaining', label: 'Refills', sortable: true, width: '80px', align: 'center' }
    ]
  },
  // Provider/Operational Reports
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
      { key: 'duration', label: 'Duration (min)', sortable: true, width: '120px', align: 'right' },
      { key: 'waitTime', label: 'Wait (min)', sortable: true, width: '100px', align: 'right' },
      { key: 'status', label: 'Status', sortable: true, width: '130px', render: 'status' }
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
      { key: 'admitDate', label: 'Admit Date', sortable: true, width: '120px' },
      { key: 'assignedNurse', label: 'Nurse', sortable: true, width: '180px' },
      { key: 'expectedDischarge', label: 'Expected D/C', sortable: true, width: '130px' },
      { key: 'status', label: 'Status', sortable: true, width: '120px', render: 'status' }
    ]
  },
  // Financial Reports
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
      { key: 'serviceDate', label: 'Service Date', sortable: true, width: '120px' },
      { key: 'submissionDate', label: 'Submitted', sortable: true, width: '120px' },
      { key: 'payer', label: 'Payer', sortable: true, width: '150px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'claimAmount', label: 'Claim Amt', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'paidAmount', label: 'Paid Amt', sortable: true, width: '120px', align: 'right', render: 'currency' },
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
      { key: 'invoiceDate', label: 'Invoice Date', sortable: true, width: '120px' },
      { key: 'payer', label: 'Payer', sortable: true, width: '150px' },
      { key: 'totalAmount', label: 'Total', sortable: true, width: '120px', align: 'right', render: 'currency' },
      { key: 'outstandingAmount', label: 'Outstanding', sortable: true, width: '130px', align: 'right', render: 'currency' },
      { key: 'agingBucket', label: 'Aging', sortable: true, width: '100px', align: 'center' },
      { key: 'lastContact', label: 'Last Contact', sortable: true, width: '120px' }
    ]
  },
  // Regulatory Reports
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
  // Patient Engagement Reports
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
      { key: 'duration', label: 'Duration (min)', sortable: true, width: '120px', align: 'right' },
      { key: 'satisfaction', label: 'Rating', sortable: true, width: '80px', align: 'center', render: 'rating' },
      { key: 'followUpRequired', label: 'Follow-up', sortable: true, width: '100px', align: 'center' },
      { key: 'status', label: 'Status', sortable: true, width: '140px', render: 'status' }
    ]
  },
  // Analytics Reports
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
      { key: 'initialAdmit', label: 'Initial Admit', sortable: true, width: '130px' },
      { key: 'discharge', label: 'Discharge', sortable: true, width: '120px' },
      { key: 'readmitDate', label: 'Readmit', sortable: true, width: '120px' },
      { key: 'daysToReadmit', label: 'Days', sortable: true, width: '80px', align: 'right' },
      { key: 'diagnosis', label: 'Diagnosis', sortable: true, width: '180px' },
      { key: 'provider', label: 'Provider', sortable: true, width: '180px' },
      { key: 'riskScore', label: 'Risk Score', sortable: true, width: '100px', align: 'right' },
      { key: 'preventable', label: 'Preventable', sortable: true, width: '110px', align: 'center' }
    ]
  },
  // Technical Reports
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
  // Administrative Reports
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
      { key: 'avgSessionDuration', label: 'Avg Session (min)', sortable: true, width: '140px', align: 'right' },
      { key: 'recordsAccessed', label: 'Records', sortable: true, width: '90px', align: 'right' },
      { key: 'status', label: 'Status', sortable: true, width: '100px', render: 'status' }
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
        value === 'Active' || value === 'Completed' || value === 'Success' || value === 'Approved' || value === 'Paid' ? 'bg-green-100 text-green-800' :
        value === 'Pending' || value === 'Scheduled' || value === 'Submitted' ? 'bg-blue-100 text-blue-800' :
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
    switch(kpi.value) {
      case 'totalTests':
      case 'totalMeds':
      case 'totalEncounters':
      case 'totalAppts':
      case 'totalBeds':
      case 'totalClaims':
      case 'totalPayments':
      case 'totalAR':
      case 'totalAccess':
      case 'totalVisits':
      case 'totalReadmissions':
      case 'totalRequests':
      case 'totalMessages':
      case 'totalUsers':
        return `const ${kpi.value} = ${dataVar}.length;`;

      case 'activeCount':
        return `const activeCount = ${dataVar}.filter(d => d.status === 'Active').length;`;

      case 'abnormalCount':
        return `const abnormalCount = ${dataVar}.filter(d => d.abnormal === 'Abnormal' || d.abnormal === 'Critical').length;`;

      case 'criticalCount':
        return `const criticalCount = ${dataVar}.filter(d => d.abnormal === 'Critical').length;`;

      case 'pendingCount':
        return `const pendingCount = ${dataVar}.filter(d => d.status === 'Pending' || d.status === 'Pending Review').length;`;

      case 'reviewedCount':
        return `const reviewedCount = ${dataVar}.filter(d => d.status === 'Final' || d.status === 'Reviewed').length;`;

      case 'refillsNeeded':
        return `const refillsNeeded = ${dataVar}.filter(d => d.refillsRemaining === 0).length;`;

      case 'discontinuedCount':
        return `const discontinuedCount = ${dataVar}.filter(d => d.status === 'Discontinued').length;`;

      case 'avgDuration':
        return `const avgDuration = (${dataVar}.reduce((sum, d) => sum + (d.duration || 0), 0) / ${dataVar}.length).toFixed(0);`;

      case 'completionRate':
        return `const completionRate = ((${dataVar}.filter(d => d.status === 'Completed').length / ${dataVar}.length) * 100).toFixed(0);`;

      case 'totalRevenue':
        return `const totalRevenue = '$' + (${dataVar}.reduce((sum, d) => sum + (d.charges || 0), 0) / 1000).toFixed(1) + 'K';`;

      case 'utilizationRate':
        return `const utilizationRate = ((${dataVar}.filter(d => d.status !== 'Cancelled').length / ${dataVar}.length) * 100).toFixed(0);`;

      case 'noShowRate':
        return `const noShowRate = ((${dataVar}.filter(d => d.status === 'No Show').length / ${dataVar}.length) * 100).toFixed(1);`;

      case 'avgWaitTime':
        return `const avgWaitTime = (${dataVar}.reduce((sum, d) => sum + (d.waitTime || 0), 0) / ${dataVar}.length).toFixed(0);`;

      case 'occupiedCount':
        return `const occupiedCount = ${dataVar}.filter(d => d.status === 'Occupied').length;`;

      case 'occupancyRate':
        return `const occupancyRate = ((${dataVar}.filter(d => d.status === 'Occupied').length / ${dataVar}.length) * 100).toFixed(0);`;

      case 'availableCount':
        return `const availableCount = ${dataVar}.filter(d => d.status === 'Available').length;`;

      case 'approvalRate':
        return `const approvalRate = ((${dataVar}.filter(d => d.status === 'Approved' || d.status === 'Paid').length / ${dataVar}.length) * 100).toFixed(0);`;

      case 'totalAmount':
        return `const totalAmount = '$' + (${dataVar}.reduce((sum, d) => sum + (d.claimAmount || d.amount || 0), 0) / 1000).toFixed(1) + 'K';`;

      case 'todayCount':
        const today = new Date().toISOString().split('T')[0];
        return `const todayCount = ${dataVar}.filter(d => d.paymentDate === '${today}').length;`;

      case 'outstandingAmount':
        return `const outstandingAmount = '$' + (${dataVar}.reduce((sum, d) => sum + (d.balance || d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`;

      case 'avgDaysToPay':
        return `const avgDaysToPay = (${dataVar}.reduce((sum, d) => sum + (d.daysOutstanding || 0), 0) / ${dataVar}.length).toFixed(0);`;

      case 'bucket0_30':
        return `const bucket0_30 = '$' + (${dataVar}.filter(d => d.agingBucket === '0-30').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`;

      case 'bucket31_90':
        return `const bucket31_90 = '$' + (${dataVar}.filter(d => d.agingBucket === '31-60' || d.agingBucket === '61-90').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`;

      case 'bucket90Plus':
        return `const bucket90Plus = '$' + (${dataVar}.filter(d => d.agingBucket === '91-120' || d.agingBucket === '120+').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';`;

      case 'uniqueUsers':
        return `const uniqueUsers = new Set(${dataVar}.map(d => d.user)).size;`;

      case 'failedCount':
        return `const failedCount = ${dataVar}.filter(d => d.status === 'Failed' || d.status === 'Unauthorized').length;`;

      case 'unauthorizedCount':
        return `const unauthorizedCount = ${dataVar}.filter(d => d.status === 'Unauthorized').length;`;

      case 'complianceRate':
        return `const complianceRate = ((${dataVar}.filter(d => d.status === 'Compliant').length / ${dataVar}.length) * 100).toFixed(0);`;

      case 'compliantCount':
        return `const compliantCount = ${dataVar}.filter(d => d.status === 'Compliant').length;`;

      case 'nonCompliantCount':
        return `const nonCompliantCount = ${dataVar}.filter(d => d.status === 'Non-Compliant').length;`;

      case 'activeUsers':
        return `const activeUsers = ${dataVar}.filter(d => d.status === 'Active').length;`;

      case 'enrollmentRate':
        return `const enrollmentRate = ((${dataVar}.filter(d => d.status === 'Active').length / ${dataVar}.length) * 100).toFixed(0);`;

      case 'avgLogins':
        return `const avgLogins = (${dataVar}.reduce((sum, d) => sum + (d.loginCount || 0), 0) / ${dataVar}.length).toFixed(1);`;

      case 'totalMessages':
        return `const totalMessages = ${dataVar}.reduce((sum, d) => sum + (d.messagesExchanged || 0), 0);`;

      case 'avgSatisfaction':
        return `const avgSatisfaction = (${dataVar}.reduce((sum, d) => sum + (d.satisfaction || 0), 0) / ${dataVar}.length).toFixed(1);`;

      case 'readmissionRate':
        return `const readmissionRate = (${dataVar}.length * 0.15).toFixed(1);`; // Simplified

      case 'avgDaysToReadmit':
        return `const avgDaysToReadmit = (${dataVar}.reduce((sum, d) => sum + (d.daysToReadmit || 0), 0) / ${dataVar}.length).toFixed(0);`;

      case 'preventableCount':
        return `const preventableCount = ${dataVar}.filter(d => d.preventable === 'Yes').length;`;

      case 'successRate':
        return `const successRate = ((${dataVar}.filter(d => d.status === 'Success' || (d.statusCode >= 200 && d.statusCode < 300)).length / ${dataVar}.length) * 100).toFixed(0);`;

      case 'avgResponseTime':
        return `const avgResponseTime = (${dataVar}.reduce((sum, d) => sum + (d.responseTime || 0), 0) / ${dataVar}.length).toFixed(0);`;

      case 'errorRate':
        return `const errorRate = ((${dataVar}.filter(d => d.statusCode >= 400).length / ${dataVar}.length) * 100).toFixed(1);`;

      case 'avgProcessing':
        return `const avgProcessing = (${dataVar}.reduce((sum, d) => sum + (d.processingTime || 0), 0) / ${dataVar}.length).toFixed(0);`;

      case 'inactiveUsers':
        return `const inactiveUsers = ${dataVar}.filter(d => d.status === 'Inactive').length;`;

      case 'lockedUsers':
        return `const lockedUsers = ${dataVar}.filter(d => d.status === 'Locked').length;`;

      default:
        return `const ${kpi.value} = 0; // TODO: Calculate ${kpi.value}`;
    }
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

  const icons = ['Activity', 'AlertTriangle', 'CheckCircle', 'Clock', 'DollarSign', 'Users', 'TrendingUp',
                 'Calendar', 'Video', 'MessageSquare', 'Star', 'Shield', 'Zap', 'Code', 'Network', 'XCircle',
                 'UserCheck', 'UserX', 'Lock', 'AlertCircle', 'Timer'];
  const allIcons = [config.icon, ...(config.kpis || []).map(k => k.icon), ...icons];
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

export default function ${path.basename(reportPath, '.tsx').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page() {
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

        {/* Additional charts and visualizations can be added here */}
        <Card>
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Charts and visualizations will be displayed here
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
console.log('Updating reports with specific data...\n');

Object.entries(reportConfigs).forEach(([reportPath, config]) => {
  const fullPath = path.join(__dirname, '..', 'src', 'app', 'reports', reportPath, 'page.tsx');

  try {
    const content = generateReportPage(fullPath, config);
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Updated ${reportPath}`);
  } catch (error) {
    console.error(`✗ Failed to update ${reportPath}:`, error.message);
  }
});

console.log('\n✅ Report update complete!');
