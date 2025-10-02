import type { Meta, StoryObj } from '@storybook/react';
import { PatientCard, type Patient } from './PatientCard';
import { Button } from '../../atoms/Button/Button';
import { Grid } from '../../atoms/Grid/Grid';

const meta: Meta<typeof PatientCard> = {
  title: 'Molecules/PatientCard',
  component: PatientCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'PatientCard component for displaying comprehensive patient information in healthcare interfaces. Includes patient demographics, vital signs, alerts, allergies, and status indicators.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'urgent', 'warning', 'stable'],
    },
    size: {
      control: 'select',
      options: ['compact', 'default', 'detailed'],
    },
    interactive: {
      control: 'boolean',
    },
    showVitals: {
      control: 'boolean',
    },
    showAlerts: {
      control: 'boolean',
    },
    showAllergies: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PatientCard>;

const samplePatient: Patient = {
  id: '1',
  name: 'Sarah Johnson',
  age: 45,
  gender: 'female',
  mrn: 'MRN-2024-001234',
  room: '302-A',
  department: 'Cardiology',
  primaryPhysician: 'Smith',
  status: 'stable',
  admissionDate: '2024-01-15',
  vitals: {
    heartRate: 72,
    bloodPressure: '120/80',
    temperature: 98.6,
    oxygenSaturation: 98,
    respiratoryRate: 16,
  },
  allergies: ['Penicillin', 'Shellfish', 'Latex'],
  alerts: [
    { type: 'info', message: 'Medication due at 2:00 PM' },
    { type: 'warning', message: 'Blood pressure elevated' },
  ],
};

const criticalPatient: Patient = {
  id: '2',
  name: 'Robert Davis',
  age: 67,
  gender: 'male',
  mrn: 'MRN-2024-001235',
  room: '204-B',
  department: 'ICU',
  primaryPhysician: 'Anderson',
  status: 'critical',
  admissionDate: '2024-01-20',
  vitals: {
    heartRate: 95,
    bloodPressure: '160/95',
    temperature: 101.2,
    oxygenSaturation: 92,
    respiratoryRate: 22,
  },
  allergies: ['Aspirin'],
  alerts: [
    { type: 'critical', message: 'High blood pressure - requires immediate attention' },
    { type: 'critical', message: 'Elevated temperature' },
    { type: 'warning', message: 'Low oxygen saturation' },
  ],
};

const warningPatient: Patient = {
  id: '3',
  name: 'Maria Garcia',
  age: 34,
  gender: 'female',
  mrn: 'MRN-2024-001236',
  room: '105-C',
  department: 'Emergency',
  primaryPhysician: 'Wilson',
  status: 'warning',
  admissionDate: '2024-01-22',
  vitals: {
    heartRate: 85,
    bloodPressure: '140/85',
    temperature: 99.1,
    oxygenSaturation: 96,
  },
  allergies: ['Iodine', 'Sulfa'],
  alerts: [
    { type: 'warning', message: 'Awaiting lab results' },
  ],
};

const dischargedPatient: Patient = {
  id: '4',
  name: 'James Thompson',
  age: 52,
  gender: 'male',
  mrn: 'MRN-2024-001237',
  department: 'Orthopedics',
  primaryPhysician: 'Brown',
  status: 'discharged',
  admissionDate: '2024-01-18',
  allergies: [],
};

export const Default: Story = {
  args: {
    patient: samplePatient,
  },
};

export const StatusVariants: Story = {
  render: () => (
    <Grid cols={1} gap={4} responsive={{ md: 2, lg: 3 }} className="max-w-6xl">
      <PatientCard patient={samplePatient} />
      <PatientCard patient={criticalPatient} />
      <PatientCard patient={warningPatient} />
      <PatientCard patient={dischargedPatient} />
    </Grid>
  ),
};

export const InteractiveCards: Story = {
  render: () => (
    <Grid cols={1} gap={4} responsive={{ md: 2 }} className="max-w-4xl">
      <PatientCard 
        patient={samplePatient} 
        interactive
        onPatientClick={(patient) => alert(`Clicked on ${patient.name}`)}
      />
      <PatientCard 
        patient={criticalPatient} 
        interactive
        onPatientClick={(patient) => alert(`Clicked on ${patient.name}`)}
      />
    </Grid>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="max-w-md">
      <PatientCard 
        patient={samplePatient}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View
            </Button>
            <Button variant="default" size="sm">
              Edit
            </Button>
          </div>
        }
      />
    </div>
  ),
};

export const CompactSize: Story = {
  render: () => (
    <Grid cols={1} gap={3} responsive={{ sm: 2, lg: 3 }} className="max-w-4xl">
      <PatientCard 
        patient={samplePatient} 
        size="compact"
        showVitals={false}
        showAllergies={false}
      />
      <PatientCard 
        patient={criticalPatient} 
        size="compact"
        showVitals={false}
        showAllergies={false}
      />
      <PatientCard 
        patient={warningPatient} 
        size="compact"
        showVitals={false}
        showAllergies={false}
      />
    </Grid>
  ),
};

export const DetailedSize: Story = {
  render: () => (
    <div className="max-w-lg">
      <PatientCard 
        patient={samplePatient} 
        size="detailed"
        showVitals={true}
        showAllergies={true}
        showAlerts={true}
      />
    </div>
  ),
};

export const CustomizableDisplay: Story = {
  render: () => (
    <Grid cols={1} gap={4} responsive={{ md: 2 }} className="max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-3">No Vitals</h3>
        <PatientCard 
          patient={samplePatient} 
          showVitals={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">No Alerts</h3>
        <PatientCard 
          patient={samplePatient} 
          showAlerts={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">No Allergies</h3>
        <PatientCard 
          patient={samplePatient} 
          showAllergies={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Minimal Info</h3>
        <PatientCard 
          patient={samplePatient} 
          showVitals={false}
          showAlerts={false}
          showAllergies={false}
        />
      </div>
    </Grid>
  ),
};

export const PatientList: Story = {
  render: () => {
    const patients: Patient[] = [
      samplePatient,
      criticalPatient,
      warningPatient,
      {
        id: '5',
        name: 'Emily Chen',
        age: 28,
        gender: 'female',
        mrn: 'MRN-2024-001238',
        room: '501-A',
        department: 'Pediatrics',
        primaryPhysician: 'Lee',
        status: 'stable',
        vitals: {
          heartRate: 68,
          bloodPressure: '110/70',
          temperature: 98.2,
          oxygenSaturation: 99,
        },
        allergies: ['Peanuts'],
        alerts: [],
      },
      {
        id: '6',
        name: 'Michael O\'Connor',
        age: 73,
        gender: 'male',
        mrn: 'MRN-2024-001239',
        room: '308-B',
        department: 'Geriatrics',
        primaryPhysician: 'Taylor',
        status: 'warning',
        vitals: {
          heartRate: 78,
          bloodPressure: '145/88',
          temperature: 98.8,
          oxygenSaturation: 95,
        },
        allergies: ['Codeine', 'Morphine'],
        alerts: [
          { type: 'warning', message: 'Pain medication review needed' },
        ],
      },
      dischargedPatient,
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Patient List</h2>
        <Grid cols={1} gap={3} responsive={{ md: 2, lg: 3 }} className="max-w-6xl">
          {patients.map((patient) => (
            <PatientCard 
              key={patient.id} 
              patient={patient}
              interactive
              onPatientClick={(patient) => console.log('Selected patient:', patient.name)}
            />
          ))}
        </Grid>
      </div>
    );
  },
};

export const EmergencyDashboard: Story = {
  render: () => {
    const emergencyPatients: Patient[] = [
      {
        ...criticalPatient,
        alerts: [
          { type: 'critical', message: 'Code Red - Cardiac arrest risk' },
          { type: 'critical', message: 'Blood pressure dangerously high' },
        ],
      },
      {
        ...warningPatient,
        alerts: [
          { type: 'warning', message: 'Chest pain reported' },
          { type: 'info', message: 'EKG ordered' },
        ],
      },
      {
        id: '7',
        name: 'Alexander Rodriguez',
        age: 31,
        gender: 'male',
        mrn: 'MRN-2024-001240',
        room: 'ER-03',
        department: 'Emergency',
        primaryPhysician: 'Johnson',
        status: 'critical',
        vitals: {
          heartRate: 110,
          bloodPressure: '180/100',
          temperature: 102.5,
          oxygenSaturation: 89,
        },
        allergies: ['Antibiotics'],
        alerts: [
          { type: 'critical', message: 'Severe allergic reaction' },
          { type: 'critical', message: 'Epinephrine administered' },
        ],
      },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-danger-600">Emergency Department</h2>
          <p className="text-gray-600">Critical patients requiring immediate attention</p>
        </div>
        
        <Grid cols={1} gap={4} responsive={{ lg: 2, xl: 3 }} className="max-w-7xl">
          {emergencyPatients.map((patient) => (
            <PatientCard 
              key={patient.id} 
              patient={patient}
              size="detailed"
              interactive
              onPatientClick={(patient) => alert(`Emergency alert: ${patient.name}`)}
              actions={
                <Button variant="destructive" size="sm">
                  URGENT
                </Button>
              }
            />
          ))}
        </Grid>
      </div>
    );
  },
};