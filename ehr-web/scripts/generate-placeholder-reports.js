const fs = require('fs');
const path = require('path');

const reports = {
  clinical: [
    { id: 'encounter', name: 'Encounter Reports', icon: 'Calendar', description: 'Visit summaries, admission/discharge details, and progress notes' },
    { id: 'timeline', name: 'Clinical Timeline Reports', icon: 'Activity', description: 'Chronological events for patients across specialties' },
    { id: 'referral', name: 'Referral Reports', icon: 'Users', description: 'Incoming/outgoing referrals with status tracking' },
    { id: 'lab-radiology', name: 'Lab & Radiology Orders Report', icon: 'TestTube', description: 'Ordered vs completed tests with TAT analysis' },
    { id: 'results', name: 'Results Dashboard', icon: 'FileSpreadsheet', description: 'Critical results, abnormal trends, and pending results' },
    { id: 'medication-orders', name: 'Medication Orders', icon: 'Pill', description: 'Prescriptions, fulfillment status, and controlled substances logs' },
    { id: 'care-pathway', name: 'Care Pathway Adherence Report', icon: 'TrendingUp', description: 'Protocol adherence and missed steps analysis' },
    { id: 'vitals', name: 'Vitals & Observations Trend Report', icon: 'Activity', description: 'BP, SPO2, pulse, and temperature graphs' },
    { id: 'chronic-disease', name: 'Chronic Disease Management Report', icon: 'Heart', description: 'Diabetes, hypertension, and COPD indicators' },
    { id: 'population-health', name: 'Population Health Reports', icon: 'Users', description: 'Immunization coverage and chronic disease cohorts' }
  ],
  provider: [
    { id: 'encounter-summary', name: 'Provider Encounter Summary', icon: 'UserCheck', description: 'Patients seen per day/week/month by provider' },
    { id: 'specialty-workload', name: 'Specialty Workload Report', icon: 'BarChart3', description: 'Distribution by specialty and unit' },
    { id: 'appointment-utilization', name: 'Appointment Utilization Report', icon: 'Calendar', description: 'Booked vs no-show vs canceled appointments' },
    { id: 'wait-time', name: 'Wait Time Reports', icon: 'Clock', description: 'Scheduled vs actual visit time analysis' },
    { id: 'clinic-slot', name: 'Clinic Slot Utilization', icon: 'Calendar', description: 'Capacity planning and slot usage' },
    { id: 'bed-occupancy', name: 'Bed Occupancy Report', icon: 'Activity', description: 'Bed utilization and occupancy trends' },
    { id: 'equipment', name: 'Equipment Utilization Report', icon: 'Cpu', description: 'Medical equipment usage and availability' },
    { id: 'ot-schedule', name: 'Operation Theater Schedule Report', icon: 'Calendar', description: 'OT utilization and scheduling efficiency' }
  ],
  financial: [
    { id: 'payment-posting', name: 'Payment Posting Report', icon: 'DollarSign', description: 'Collections, adjustments, and write-offs' },
    { id: 'denial-management', name: 'Denial Management Report', icon: 'AlertTriangle', description: 'Top denial reasons and payer-wise breakdown' },
    { id: 'ar-aging', name: 'A/R Aging Report', icon: 'TrendingUp', description: 'Accounts receivable aging analysis' },
    { id: 'charge-lag', name: 'Charge Lag Report', icon: 'Clock', description: 'Encounter to claim submission time' },
    { id: 'patient-balance', name: 'Patient Balance Report', icon: 'Users', description: 'Outstanding patient balances' },
    { id: 'department-revenue', name: 'Department-wise Revenue Report', icon: 'BarChart3', description: 'Revenue by department and service line' },
    { id: 'service-profitability', name: 'Service Line Profitability Report', icon: 'TrendingUp', description: 'Profit analysis by service line' },
    { id: 'payer-mix', name: 'Payer Mix Analysis', icon: 'BarChart3', description: 'Revenue distribution by payer' }
  ],
  regulatory: [
    { id: 'meaningful-use', name: 'Meaningful Use / MIPS Reports', icon: 'Shield', description: 'Compliance with meaningful use requirements' },
    { id: 'interface-logs', name: 'FHIR/HL7 Interface Activity Logs', icon: 'Database', description: 'Integration activity and message logs' },
    { id: 'immunization', name: 'Immunization & Public Health Reporting', icon: 'Activity', description: 'Immunization reporting status' },
    { id: 'user-access', name: 'User Access Audit Report', icon: 'Eye', description: 'Who accessed what and when' },
    { id: 'break-glass', name: 'Break-the-Glass Event Logs', icon: 'AlertTriangle', description: 'Emergency access events' },
    { id: 'failed-login', name: 'Failed Login Attempts Report', icon: 'Lock', description: 'Security monitoring for failed logins' },
    { id: 'consent', name: 'Consent Form Report', icon: 'FileText', description: 'Signed, pending, and revoked consents' },
    { id: 'advance-directive', name: 'Advance Directive Report', icon: 'ClipboardList', description: 'Advanced directive documentation status' }
  ],
  'patient-engagement': [
    { id: 'portal-usage', name: 'Patient Portal Usage', icon: 'Globe', description: 'Login and feature usage statistics' },
    { id: 'message-volume', name: 'Message Volume Report', icon: 'MessageSquare', description: 'Secure messages sent and received' },
    { id: 'telehealth', name: 'Telehealth Usage Report', icon: 'Activity', description: 'Virtual visit statistics and trends' },
    { id: 'feedback', name: 'Patient Feedback Report', icon: 'MessageSquare', description: 'Patient feedback and comments' },
    { id: 'survey-results', name: 'Survey Results', icon: 'ClipboardList', description: 'Patient satisfaction survey results' },
    { id: 'response-time', name: 'Response Time Metrics', icon: 'Clock', description: 'Staff response time to patient messages' }
  ],
  analytics: [
    { id: 'disease-registry', name: 'Disease Registry Reports', icon: 'Database', description: 'Diabetes, oncology, and other registries' },
    { id: 'outbreak', name: 'Outbreak & Surveillance Reports', icon: 'AlertTriangle', description: 'Disease outbreak monitoring' },
    { id: 'risk-stratification', name: 'Risk Stratification Report', icon: 'TrendingUp', description: 'Patient risk scoring and stratification' },
    { id: 'readmission-risk', name: 'Readmission Risk Report', icon: 'Activity', description: 'Predictive readmission analysis' },
    { id: 'length-of-stay', name: 'Length of Stay Prediction Reports', icon: 'Calendar', description: 'Expected vs actual LOS' },
    { id: 'high-risk', name: 'High-Risk Patient Cohorts', icon: 'AlertTriangle', description: 'Identification of high-risk patients' },
    { id: 'hedis', name: 'HEDIS/NCQA Quality Reports', icon: 'Shield', description: 'Quality measure reporting' },
    { id: 'care-gap', name: 'Care Gap Analysis Report', icon: 'Brain', description: 'Identified gaps in patient care' },
    { id: 'benchmarking', name: 'Performance Benchmarking', icon: 'BarChart3', description: 'Performance vs targets' }
  ],
  technical: [
    { id: 'fhir-api', name: 'FHIR API Transaction Logs', icon: 'Database', description: 'API transaction monitoring and logs' },
    { id: 'adt-messages', name: 'ADT (HL7 v2) Message Success/Failure Logs', icon: 'FileText', description: 'HL7 message processing status' },
    { id: 'interface-uptime', name: 'External Interface Uptime Reports', icon: 'Zap', description: 'Integration uptime monitoring' },
    { id: 'data-validation', name: 'Data Validation Report', icon: 'Shield', description: 'Missing fields and duplicates' },
    { id: 'sync-failure', name: 'Sync Failure Report', icon: 'AlertTriangle', description: 'Integration failures with LIS, RIS, PACS' },
    { id: 'batch-jobs', name: 'Batch Job Execution Logs', icon: 'Settings', description: 'Scheduled job execution status' }
  ],
  administrative: [
    { id: 'user-roles', name: 'User & Role Reports', icon: 'Users', description: 'Active users, roles, and privileges' },
    { id: 'access-usage', name: 'Department-level Access Usage', icon: 'Eye', description: 'Access patterns by department' },
    { id: 'master-data', name: 'Master Data Consistency', icon: 'Database', description: 'CPT, ICD, SNOMED mapping consistency' },
    { id: 'insurance-master', name: 'Insurance Master Updates', icon: 'Shield', description: 'Insurance master data changes' },
    { id: 'report-builder', name: 'Report Builder / Ad-hoc Reporting', icon: 'Settings', description: 'Custom report generation tool' }
  ]
};

const iconImports = [
  'FileText', 'Calendar', 'Activity', 'Users', 'TestTube', 'FileSpreadsheet',
  'Pill', 'TrendingUp', 'Heart', 'UserCheck', 'BarChart3', 'Clock',
  'Cpu', 'DollarSign', 'AlertTriangle', 'Shield', 'Database', 'Eye',
  'Lock', 'ClipboardList', 'Globe', 'MessageSquare', 'Brain', 'Zap', 'Settings'
].join(', ');

function generateReportPage(category, report) {
  return `'use client';

import { GenericReportPage } from '@/components/reports/GenericReportPage';
import { ${report.icon} } from 'lucide-react';

export default function ${report.id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}Page() {
  return (
    <GenericReportPage
      title="${report.name}"
      description="${report.description}"
      icon={<${report.icon} className="h-6 w-6 text-blue-600" />}
      kpis={[
        { label: 'Total Records', value: '1,234', change: '+12.5%', icon: <${report.icon} className="h-8 w-8 text-blue-600" /> },
        { label: 'Active', value: '987', change: '+8.3%', icon: <${report.icon} className="h-8 w-8 text-green-600" /> },
        { label: 'Pending', value: '156', icon: <${report.icon} className="h-8 w-8 text-orange-600" /> },
        { label: 'Completed', value: '891', change: '+15.2%', icon: <${report.icon} className="h-8 w-8 text-purple-600" /> }
      ]}
    />
  );
}
`;
}

// Generate all report pages
Object.entries(reports).forEach(([category, categoryReports]) => {
  categoryReports.forEach(report => {
    const dir = path.join(__dirname, '..', 'src', 'app', 'reports', category, report.id);
    const filePath = path.join(dir, 'page.tsx');

    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${category}/${report.id} (already exists)`);
      return;
    }

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, generateReportPage(category, report));
    console.log(`Created ${category}/${report.id}`);
  });
});

console.log('\nAll report pages generated successfully!');
