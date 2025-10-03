import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';
import { 
  Home,
  Users, 
  User, 
  FileText, 
  Calendar,
  Settings,
  Heart,
  Pill,
  Activity,
  Stethoscope,
  Shield,
  Building2,
  UserCircle,
  ClipboardList,
  TestTube,
  Image,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
  Database,
  Lock,
  Clock,
  CheckCircle2,
  UserPlus
} from 'lucide-react';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Design System/Molecules/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Breadcrumb component provides navigation hierarchy for healthcare applications. Shows users their current location and allows easy navigation to parent pages.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'medical', 'clinical', 'administrative'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    separator: {
      control: 'select',
      options: ['chevron', 'slash', 'dot', 'arrow'],
    },
    showHome: {
      control: 'boolean',
    },
    collapseFrom: {
      control: 'select',
      options: ['start', 'middle'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

const basicItems = [
  { id: 'dashboard', label: 'Dashboard', onClick: () => console.log('Dashboard clicked') },
  { id: 'patients', label: 'Patients', onClick: () => console.log('Patients clicked') },
  { id: 'patient', label: 'John Doe', onClick: () => console.log('Patient clicked') },
  { id: 'records', label: 'Medical Records' },
];

export const Default: Story = {
  args: {
    items: basicItems,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Default</h3>
        <Breadcrumb
          variant="default"
          items={[
            { id: 'home', label: 'Dashboard' },
            { id: 'patients', label: 'Patients' },
            { id: 'current', label: 'Patient Details' },
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Primary</h3>
        <Breadcrumb
          variant="primary"
          items={[
            { id: 'home', label: 'EHR System' },
            { id: 'module', label: 'Patient Management' },
            { id: 'current', label: 'Registration' },
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Medical</h3>
        <Breadcrumb
          variant="medical"
          items={[
            { id: 'home', label: 'Clinical Dashboard' },
            { id: 'patient', label: 'John Doe' },
            { id: 'current', label: 'Lab Results' },
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Clinical</h3>
        <Breadcrumb
          variant="clinical"
          items={[
            { id: 'home', label: 'Clinical Workflows' },
            { id: 'protocol', label: 'Treatment Protocols' },
            { id: 'current', label: 'Diabetes Management' },
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Administrative</h3>
        <Breadcrumb
          variant="administrative"
          items={[
            { id: 'home', label: 'Administration' },
            { id: 'settings', label: 'System Settings' },
            { id: 'current', label: 'User Management' },
          ]}
        />
      </div>
    </div>
  ),
};

export const Separators: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Chevron (Default)</h3>
        <Breadcrumb
          separator="chevron"
          items={basicItems}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Slash</h3>
        <Breadcrumb
          separator="slash"
          items={basicItems}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Dot</h3>
        <Breadcrumb
          separator="dot"
          items={basicItems}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Arrow</h3>
        <Breadcrumb
          separator="arrow"
          items={basicItems}
        />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Patient Navigation</h3>
        <Breadcrumb
          items={[
            { id: 'dashboard', label: 'Dashboard', icon: <Home /> },
            { id: 'patients', label: 'Patients', icon: <Users /> },
            { id: 'patient', label: 'John Doe', icon: <User /> },
            { id: 'records', label: 'Medical Records', icon: <FileText /> },
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Clinical Workflow</h3>
        <Breadcrumb
          variant="medical"
          items={[
            { id: 'dashboard', label: 'Clinical Dashboard', icon: <Stethoscope /> },
            { id: 'patient', label: 'Sarah Wilson', icon: <UserCircle /> },
            { id: 'assessment', label: 'Assessment', icon: <ClipboardList /> },
            { id: 'vitals', label: 'Vital Signs', icon: <Activity /> },
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Administrative</h3>
        <Breadcrumb
          variant="administrative"
          separator="slash"
          items={[
            { id: 'admin', label: 'Administration', icon: <Settings /> },
            { id: 'facility', label: 'Facility Management', icon: <Building2 /> },
            { id: 'security', label: 'Security Settings', icon: <Lock /> },
            { id: 'audit', label: 'Audit Logs', icon: <Database /> },
          ]}
        />
      </div>
    </div>
  ),
};

export const WithHomeButton: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Default Home Icon</h3>
        <Breadcrumb
          showHome
          onHomeClick={() => console.log('Home clicked')}
          items={[
            { id: 'patients', label: 'Patients' },
            { id: 'patient', label: 'John Doe' },
            { id: 'appointments', label: 'Appointments' },
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Custom Home Icon</h3>
        <Breadcrumb
          showHome
          homeIcon={<Stethoscope className="w-4 h-4" />}
          onHomeClick={() => console.log('Clinical Dashboard clicked')}
          variant="clinical"
          items={[
            { id: 'patient', label: 'Patient Care' },
            { id: 'treatment', label: 'Treatment Plans' },
            { id: 'current', label: 'Diabetes Protocol' },
          ]}
        />
      </div>
    </div>
  ),
};

export const CollapsedItems: Story = {
  render: () => {
    const longPath = [
      { id: 'dashboard', label: 'Dashboard', icon: <Home /> },
      { id: 'patients', label: 'Patients', icon: <Users /> },
      { id: 'patient', label: 'John Michael Doe', icon: <User /> },
      { id: 'records', label: 'Medical Records', icon: <FileText /> },
      { id: 'history', label: 'Medical History', icon: <ClipboardList /> },
      { id: 'medications', label: 'Current Medications', icon: <Pill /> },
      { id: 'prescriptions', label: 'Active Prescriptions' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Full Path (No Collapse)</h3>
          <Breadcrumb items={longPath} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Collapsed from Middle (Max 4 items)</h3>
          <Breadcrumb
            items={longPath}
            maxItems={4}
            collapseFrom="middle"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Collapsed from Start (Max 4 items)</h3>
          <Breadcrumb
            items={longPath}
            maxItems={4}
            collapseFrom="start"
          />
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Small</h3>
        <Breadcrumb
          size="sm"
          items={basicItems}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Medium (Default)</h3>
        <Breadcrumb
          size="md"
          items={basicItems}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Large</h3>
        <Breadcrumb
          size="lg"
          items={basicItems}
        />
      </div>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Management Workflows</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Patient Registration</h4>
            <Breadcrumb
              variant="primary"
              showHome
              items={[
                { id: 'registration', label: 'Patient Registration', icon: <UserPlus /> },
                { id: 'demographics', label: 'Demographics', icon: <User /> },
                { id: 'insurance', label: 'Insurance Information', icon: <CreditCard /> },
              ]}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Patient Care</h4>
            <Breadcrumb
              variant="medical"
              separator="slash"
              items={[
                { id: 'patients', label: 'Patients', icon: <Users /> },
                { id: 'patient', label: 'Sarah Johnson', icon: <UserCircle /> },
                { id: 'visit', label: 'Current Visit', icon: <Calendar /> },
                { id: 'assessment', label: 'Clinical Assessment', icon: <Stethoscope /> },
              ]}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Emergency Department</h4>
            <Breadcrumb
              variant="medical"
              separator="arrow"
              items={[
                { id: 'emergency', label: 'Emergency Dept', icon: <AlertCircle /> },
                { id: 'triage', label: 'Triage', icon: <Activity /> },
                { id: 'patient', label: 'Michael Chen', icon: <User /> },
                { id: 'treatment', label: 'Treatment Room 3', icon: <Heart /> },
              ]}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Documentation</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Medical Records</h4>
            <Breadcrumb
              variant="clinical"
              items={[
                { id: 'patients', label: 'Patients', icon: <Users /> },
                { id: 'patient', label: 'John Doe', icon: <User /> },
                { id: 'records', label: 'Medical Records', icon: <FileText /> },
                { id: 'history', label: 'Medical History', icon: <ClipboardList /> },
                { id: 'allergies', label: 'Allergies & Reactions', icon: <AlertCircle /> },
              ]}
              maxItems={4}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Lab Results</h4>
            <Breadcrumb
              variant="medical"
              separator="dot"
              items={[
                { id: 'laboratory', label: 'Laboratory', icon: <TestTube /> },
                { id: 'patient', label: 'Lisa Rodriguez', icon: <UserCircle /> },
                { id: 'order', label: 'Lab Order #12345', icon: <ClipboardList /> },
                { id: 'results', label: 'Blood Chemistry Panel', icon: <TestTube /> },
              ]}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Imaging Studies</h4>
            <Breadcrumb
              variant="medical"
              items={[
                { id: 'radiology', label: 'Radiology', icon: <Image /> },
                { id: 'patient', label: 'Robert Smith', icon: <User /> },
                { id: 'study', label: 'Chest X-Ray', icon: <Image /> },
                { id: 'report', label: 'Radiologist Report', icon: <FileText /> },
              ]}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medication Management</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Prescription Management</h4>
            <Breadcrumb
              variant="primary"
              separator="chevron"
              items={[
                { id: 'pharmacy', label: 'Pharmacy', icon: <Pill /> },
                { id: 'patient', label: 'Emily Davis', icon: <UserCircle /> },
                { id: 'medications', label: 'Current Medications', icon: <Pill /> },
                { id: 'prescription', label: 'Lisinopril 10mg', icon: <Pill /> },
              ]}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Drug Interaction Check</h4>
            <Breadcrumb
              variant="clinical"
              items={[
                { id: 'clinical', label: 'Clinical Decision Support', icon: <Shield /> },
                { id: 'interactions', label: 'Drug Interactions', icon: <AlertCircle /> },
                { id: 'patient', label: 'Thomas Wilson', icon: <User /> },
                { id: 'analysis', label: 'Interaction Analysis', icon: <TestTube /> },
              ]}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Administrative Functions</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">System Administration</h4>
            <Breadcrumb
              variant="administrative"
              showHome
              homeIcon={<Settings />}
              separator="slash"
              items={[
                { id: 'admin', label: 'Administration', icon: <Settings /> },
                { id: 'users', label: 'User Management', icon: <Users /> },
                { id: 'roles', label: 'Role Permissions', icon: <Lock /> },
                { id: 'audit', label: 'Access Audit', icon: <Database /> },
              ]}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Facility Management</h4>
            <Breadcrumb
              variant="administrative"
              items={[
                { id: 'facilities', label: 'Facilities', icon: <Building2 /> },
                { id: 'location', label: 'Main Hospital', icon: <Building2 /> },
                { id: 'department', label: 'Cardiology Dept', icon: <Heart /> },
                { id: 'room', label: 'Room 205A', icon: <Building2 /> },
              ]}
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Communication Center</h4>
            <Breadcrumb
              variant="primary"
              separator="arrow"
              items={[
                { id: 'communication', label: 'Communications', icon: <Phone /> },
                { id: 'messages', label: 'Messages', icon: <Mail /> },
                { id: 'patient', label: 'Patient Communications', icon: <UserCircle /> },
                { id: 'thread', label: 'Appointment Reminder', icon: <Calendar /> },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    const [currentPath, setCurrentPath] = React.useState([
      { id: 'dashboard', label: 'Dashboard', icon: <Home /> },
    ]);

    const navigationOptions = {
      dashboard: [
        { id: 'patients', label: 'Patients', icon: <Users /> },
        { id: 'appointments', label: 'Appointments', icon: <Calendar /> },
        { id: 'laboratory', label: 'Laboratory', icon: <TestTube /> },
        { id: 'pharmacy', label: 'Pharmacy', icon: <Pill /> },
      ],
      patients: [
        { id: 'john-doe', label: 'John Doe', icon: <User /> },
        { id: 'jane-smith', label: 'Jane Smith', icon: <User /> },
        { id: 'mike-jones', label: 'Mike Jones', icon: <User /> },
      ],
      'john-doe': [
        { id: 'overview', label: 'Overview', icon: <FileText /> },
        { id: 'medical-history', label: 'Medical History', icon: <ClipboardList /> },
        { id: 'medications', label: 'Medications', icon: <Pill /> },
        { id: 'lab-results', label: 'Lab Results', icon: <TestTube /> },
      ],
      appointments: [
        { id: 'schedule', label: 'Schedule', icon: <Calendar /> },
        { id: 'booking', label: 'New Booking', icon: <UserPlus /> },
      ],
      laboratory: [
        { id: 'pending', label: 'Pending Results', icon: <Clock /> },
        { id: 'completed', label: 'Completed Tests', icon: <CheckCircle2 /> },
      ],
      pharmacy: [
        { id: 'prescriptions', label: 'Prescriptions', icon: <Pill /> },
        { id: 'inventory', label: 'Inventory', icon: <Database /> },
      ],
    };

    const handleBreadcrumbClick = (clickedIndex: number) => {
      setCurrentPath(prev => prev.slice(0, clickedIndex + 1));
    };

    const handleNavigation = (option: any) => {
      setCurrentPath(prev => [...prev, option]);
    };

    const goHome = () => {
      setCurrentPath([{ id: 'dashboard', label: 'Dashboard', icon: <Home /> }]);
    };

    const currentId = currentPath[currentPath.length - 1]?.id;
    const availableOptions = navigationOptions[currentId as keyof typeof navigationOptions] || [];

    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted/20 rounded-lg">
          <h4 className="font-semibold mb-3">Interactive EHR Navigation</h4>
          
          <Breadcrumb
            variant="medical"
            showHome
            onHomeClick={goHome}
            items={currentPath.map((item, index) => ({
              ...item,
              onClick: index < currentPath.length - 1 ? () => handleBreadcrumbClick(index) : undefined
            }))}
            maxItems={5}
          />
          
          {availableOptions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Navigate to:</p>
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleNavigation(option)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-background border rounded-md hover:bg-muted transition-colors"
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 text-sm">
              Current Location: <span className="font-medium">{currentPath[currentPath.length - 1]?.label}</span>
            </p>
            <p className="text-blue-700 text-xs mt-1">
              Click on breadcrumb items to navigate back, or use the navigation buttons above.
            </p>
          </div>
        </div>
      </div>
    );
  },
};