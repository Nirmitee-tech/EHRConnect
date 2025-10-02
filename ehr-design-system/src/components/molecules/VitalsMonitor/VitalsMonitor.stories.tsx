import type { Meta, StoryObj } from '@storybook/react';
import { VitalsMonitor, type VitalSign } from './VitalsMonitor';
import { Grid } from '../../atoms/Grid/Grid';

const meta: Meta<typeof VitalsMonitor> = {
  title: 'Molecules/VitalsMonitor',
  component: VitalsMonitor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'VitalsMonitor component for displaying real-time patient vital signs in healthcare interfaces. Includes status indicators, trend arrows, and alert states for critical care monitoring.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'dashboard'],
    },
    status: {
      control: 'select',
      options: ['normal', 'warning', 'critical', 'offline'],
    },
    animated: {
      control: 'boolean',
    },
    showTrends: {
      control: 'boolean',
    },
    showTimestamps: {
      control: 'boolean',
    },
    showNormalRanges: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VitalsMonitor>;

// Sample vital signs data
const normalVitals: VitalSign[] = [
  {
    id: 'hr',
    name: 'Heart Rate',
    value: 72,
    unit: 'bpm',
    status: 'normal',
    normalRange: { min: 60, max: 100 },
    trend: 'stable',
    timestamp: '2024-01-22T10:30:00Z',
    color: 'heart-rate',
    icon: '❤️',
  },
  {
    id: 'bp',
    name: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    status: 'normal',
    normalRange: { min: 90, max: 140 },
    trend: 'stable',
    timestamp: '2024-01-22T10:30:00Z',
    color: 'blood-pressure',
    icon: '🩸',
  },
  {
    id: 'temp',
    name: 'Temperature',
    value: 98.6,
    unit: '°F',
    status: 'normal',
    normalRange: { min: 97, max: 99 },
    trend: 'stable',
    timestamp: '2024-01-22T10:30:00Z',
    color: 'temperature',
    icon: '🌡️',
  },
  {
    id: 'spo2',
    name: 'SpO2',
    value: 98,
    unit: '%',
    status: 'normal',
    normalRange: { min: 95, max: 100 },
    trend: 'up',
    timestamp: '2024-01-22T10:30:00Z',
    color: 'oxygen-sat',
    icon: '🫁',
  },
];

const warningVitals: VitalSign[] = [
  {
    id: 'hr',
    name: 'Heart Rate',
    value: 105,
    unit: 'bpm',
    status: 'warning',
    normalRange: { min: 60, max: 100 },
    trend: 'up',
    timestamp: '2024-01-22T10:32:00Z',
    color: 'heart-rate',
    icon: '❤️',
  },
  {
    id: 'bp',
    name: 'Blood Pressure',
    value: '145/92',
    unit: 'mmHg',
    status: 'warning',
    normalRange: { min: 90, max: 140 },
    trend: 'up',
    timestamp: '2024-01-22T10:32:00Z',
    color: 'blood-pressure',
    icon: '🩸',
  },
  {
    id: 'temp',
    name: 'Temperature',
    value: 99.8,
    unit: '°F',
    status: 'warning',
    normalRange: { min: 97, max: 99 },
    trend: 'up',
    timestamp: '2024-01-22T10:32:00Z',
    color: 'temperature',
    icon: '🌡️',
  },
  {
    id: 'spo2',
    name: 'SpO2',
    value: 94,
    unit: '%',
    status: 'warning',
    normalRange: { min: 95, max: 100 },
    trend: 'down',
    timestamp: '2024-01-22T10:32:00Z',
    color: 'oxygen-sat',
    icon: '🫁',
  },
];

const criticalVitals: VitalSign[] = [
  {
    id: 'hr',
    name: 'Heart Rate',
    value: 135,
    unit: 'bpm',
    status: 'critical',
    normalRange: { min: 60, max: 100 },
    trend: 'up',
    timestamp: '2024-01-22T10:35:00Z',
    color: 'heart-rate',
    icon: '❤️',
  },
  {
    id: 'bp',
    name: 'Blood Pressure',
    value: '180/110',
    unit: 'mmHg',
    status: 'critical',
    normalRange: { min: 90, max: 140 },
    trend: 'up',
    timestamp: '2024-01-22T10:35:00Z',
    color: 'blood-pressure',
    icon: '🩸',
  },
  {
    id: 'temp',
    name: 'Temperature',
    value: 103.2,
    unit: '°F',
    status: 'critical',
    normalRange: { min: 97, max: 99 },
    trend: 'up',
    timestamp: '2024-01-22T10:35:00Z',
    color: 'temperature',
    icon: '🌡️',
  },
  {
    id: 'spo2',
    name: 'SpO2',
    value: 88,
    unit: '%',
    status: 'critical',
    normalRange: { min: 95, max: 100 },
    trend: 'down',
    timestamp: '2024-01-22T10:35:00Z',
    color: 'oxygen-sat',
    icon: '🫁',
  },
];

export const Default: Story = {
  args: {
    vitals: normalVitals,
    patientName: 'Sarah Johnson',
    lastUpdated: '2024-01-22T10:30:00Z',
  },
};

export const StatusVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Normal Status</h3>
        <VitalsMonitor
          vitals={normalVitals}
          patientName="Sarah Johnson"
          lastUpdated="2024-01-22T10:30:00Z"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Warning Status</h3>
        <VitalsMonitor
          vitals={warningVitals}
          patientName="Robert Davis"
          lastUpdated="2024-01-22T10:32:00Z"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Critical Status</h3>
        <VitalsMonitor
          vitals={criticalVitals}
          patientName="Michael O'Connor"
          lastUpdated="2024-01-22T10:35:00Z"
          animated
        />
      </div>
    </div>
  ),
};

export const CompactView: Story = {
  render: () => (
    <VitalsMonitor
      vitals={normalVitals}
      patientName="Sarah Johnson"
      variant="compact"
      compact
      showTrends={false}
      showNormalRanges={false}
    />
  ),
};

export const DashboardView: Story = {
  render: () => (
    <VitalsMonitor
      vitals={normalVitals}
      patientName="Sarah Johnson"
      variant="dashboard"
      showTrends={true}
      showTimestamps={true}
      showNormalRanges={true}
    />
  ),
};

export const WithInteraction: Story = {
  render: () => (
    <VitalsMonitor
      vitals={normalVitals}
      patientName="Sarah Johnson"
      onVitalClick={(vital) => alert(`Clicked on ${vital.name}: ${vital.value} ${vital.unit}`)}
      showTrends={true}
      showNormalRanges={true}
    />
  ),
};

export const OfflineStatus: Story = {
  render: () => {
    const offlineVitals: VitalSign[] = normalVitals.map(vital => ({
      ...vital,
      status: 'offline' as const,
      value: '--',
      trend: undefined,
    }));
    
    return (
      <VitalsMonitor
        vitals={offlineVitals}
        patientName="Equipment Offline"
        status="offline"
        lastUpdated="2024-01-22T09:45:00Z"
      />
    );
  },
};

export const ICUDashboard: Story = {
  render: () => {
    const icuPatients = [
      {
        name: 'Sarah Johnson',
        vitals: normalVitals,
      },
      {
        name: 'Robert Davis', 
        vitals: warningVitals,
      },
      {
        name: 'Michael O\'Connor',
        vitals: criticalVitals,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">ICU Patient Monitoring</h2>
          <p className="text-gray-600">Real-time vital signs dashboard</p>
        </div>
        
        <Grid cols={1} gap={6} responsive={{ lg: 2, xl: 3 }}>
          {icuPatients.map((patient, index) => (
            <VitalsMonitor
              key={index}
              vitals={patient.vitals}
              patientName={patient.name}
              variant="dashboard"
              showTrends={true}
              showNormalRanges={false}
              lastUpdated="2024-01-22T10:30:00Z"
              onVitalClick={(vital) => console.log(`Alert: ${patient.name} - ${vital.name}`)}
            />
          ))}
        </Grid>
      </div>
    );
  },
};

export const EmergencyMonitor: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-danger-100 border-l-4 border-danger-500 p-4 rounded">
        <h3 className="text-danger-700 font-semibold">Critical Patient Alert</h3>
        <p className="text-danger-600 text-sm mt-1">
          Multiple vital signs are outside normal ranges. Immediate attention required.
        </p>
      </div>
      
      <VitalsMonitor
        vitals={criticalVitals}
        patientName="Emergency Patient #3417"
        status="critical"
        variant="dashboard"
        animated={true}
        showTrends={true}
        showTimestamps={true}
        showNormalRanges={true}
        onVitalClick={(vital) => alert(`EMERGENCY: ${vital.name} is ${vital.value} ${vital.unit}`)}
      />
    </div>
  ),
};

export const CustomVitals: Story = {
  render: () => {
    const customVitals: VitalSign[] = [
      {
        id: 'glucose',
        name: 'Blood Glucose',
        value: 120,
        unit: 'mg/dL',
        status: 'normal',
        normalRange: { min: 70, max: 140 },
        trend: 'stable',
        timestamp: '2024-01-22T10:30:00Z',
        color: 'blood-glucose',
        icon: '🩸',
      },
      {
        id: 'rr',
        name: 'Respiratory Rate',
        value: 16,
        unit: '/min',
        status: 'normal',
        normalRange: { min: 12, max: 20 },
        trend: 'stable',
        timestamp: '2024-01-22T10:30:00Z',
        icon: '🫁',
      },
      {
        id: 'pain',
        name: 'Pain Scale',
        value: 3,
        unit: '/10',
        status: 'normal',
        normalRange: { min: 0, max: 3 },
        trend: 'down',
        timestamp: '2024-01-22T10:30:00Z',
        icon: '😐',
      },
      {
        id: 'mobility',
        name: 'Mobility Score',
        value: 8,
        unit: '/10',
        status: 'normal',
        normalRange: { min: 6, max: 10 },
        trend: 'up',
        timestamp: '2024-01-22T10:30:00Z',
        icon: '🚶',
      },
    ];

    return (
      <VitalsMonitor
        vitals={customVitals}
        patientName="Extended Monitoring - Room 342"
        variant="dashboard"
        showTrends={true}
        showNormalRanges={true}
        showTimestamps={true}
      />
    );
  },
};