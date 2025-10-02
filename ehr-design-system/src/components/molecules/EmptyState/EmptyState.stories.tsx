import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { 
  UserPlus, 
  Calendar, 
  FileText, 
  Search, 
  Database, 
  AlertCircle,
  Heart,
  Stethoscope,
  Pill,
  Shield,
  Activity,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Bell
} from 'lucide-react';

const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 
          'EmptyState component displays a message when no data is available, with optional actions to help users get started. Perfect for healthcare applications when patient lists, appointments, or medical records are empty.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Database />,
    title: 'No data found',
    description: 'There is no data to display at this time.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <UserPlus />,
    title: 'No patients found',
    description: 'Add your first patient to get started with the EHR system.',
    action: {
      label: 'Add Patient',
      onClick: () => console.log('Add patient clicked'),
      variant: 'primary',
    },
  },
};

export const WithSecondaryAction: Story = {
  args: {
    icon: <Calendar />,
    title: 'No appointments scheduled',
    description: 'Schedule appointments to manage patient visits effectively.',
    action: {
      label: 'Schedule Appointment',
      onClick: () => console.log('Schedule clicked'),
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Import Calendar',
      onClick: () => console.log('Import clicked'),
      variant: 'outline',
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmptyState
          variant="default"
          icon={<Database />}
          title="Default State"
          description="No data available in the system."
        />
        
        <EmptyState
          variant="primary"
          icon={<Heart />}
          title="Primary State"
          description="Start monitoring patient vitals."
        />
        
        <EmptyState
          variant="success"
          icon={<Shield />}
          title="Success State"
          description="All security checks passed."
        />
        
        <EmptyState
          variant="warning"
          icon={<AlertCircle />}
          title="Warning State"
          description="Action required to proceed."
        />
        
        <EmptyState
          variant="danger"
          icon={<AlertCircle />}
          title="Error State"
          description="Critical system error detected."
        />
        
        <EmptyState
          variant="info"
          icon={<FileText />}
          title="Information State"
          description="Additional setup required."
        />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Size</h3>
        <EmptyState
          size="sm"
          icon={<Search />}
          title="No results found"
          description="Try adjusting your search criteria."
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Size (Default)</h3>
        <EmptyState
          size="md"
          icon={<Calendar />}
          title="No appointments today"
          description="Your schedule is clear for today."
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Size</h3>
        <EmptyState
          size="lg"
          icon={<Users />}
          title="Welcome to EHR Connect"
          description="Start by adding patients and managing their medical records."
          action={{
            label: 'Get Started',
            onClick: () => console.log('Get started'),
            variant: 'primary',
          }}
        />
      </div>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-6">Patient Management</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmptyState
            variant="primary"
            icon={<UserPlus />}
            title="No patients registered"
            description="Add your first patient to start managing medical records and appointments."
            action={{
              label: 'Register Patient',
              onClick: () => console.log('Register patient'),
              variant: 'primary',
            }}
            secondaryAction={{
              label: 'Import Patients',
              onClick: () => console.log('Import patients'),
              variant: 'outline',
            }}
          />
          
          <EmptyState
            variant="info"
            icon={<Search />}
            title="No patients match your search"
            description="Try using different search terms or check patient ID format."
            action={{
              label: 'Clear Filters',
              onClick: () => console.log('Clear filters'),
              variant: 'outline',
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Appointments & Scheduling</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmptyState
            variant="success"
            icon={<Calendar />}
            title="No appointments today"
            description="Your schedule is clear. Perfect time to catch up on patient notes!"
            action={{
              label: 'Schedule Appointment',
              onClick: () => console.log('Schedule appointment'),
              variant: 'primary',
            }}
          />
          
          <EmptyState
            variant="warning"
            icon={<AlertCircle />}
            title="Pending appointments require attention"
            description="Some appointments need confirmation or rescheduling."
            action={{
              label: 'Review Appointments',
              onClick: () => console.log('Review appointments'),
              variant: 'warning',
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Medical Records & Documentation</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmptyState
            variant="default"
            icon={<FileText />}
            title="No medical records found"
            description="Start documenting patient visits, diagnoses, and treatment plans."
            action={{
              label: 'Create Record',
              onClick: () => console.log('Create record'),
              variant: 'primary',
            }}
            secondaryAction={{
              label: 'Upload Files',
              onClick: () => console.log('Upload files'),
              variant: 'outline',
            }}
          />
          
          <EmptyState
            variant="info"
            icon={<ClipboardList />}
            title="No lab results available"
            description="Lab results will appear here once they are processed and validated."
            action={{
              label: 'Order Lab Tests',
              onClick: () => console.log('Order labs'),
              variant: 'primary',
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Medications & Prescriptions</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmptyState
            variant="primary"
            icon={<Pill />}
            title="No active prescriptions"
            description="Patient currently has no active medication prescriptions."
            action={{
              label: 'Prescribe Medication',
              onClick: () => console.log('Prescribe medication'),
              variant: 'primary',
            }}
          />
          
          <EmptyState
            variant="warning"
            icon={<AlertCircle />}
            title="Prescription renewals needed"
            description="Several prescriptions are expiring soon and require renewal."
            action={{
              label: 'Review Prescriptions',
              onClick: () => console.log('Review prescriptions'),
              variant: 'warning',
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Vital Signs & Monitoring</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmptyState
            variant="success"
            icon={<Activity />}
            title="No vital signs recorded"
            description="Record patient vital signs to track health status and trends."
            action={{
              label: 'Record Vitals',
              onClick: () => console.log('Record vitals'),
              variant: 'primary',
            }}
          />
          
          <EmptyState
            variant="info"
            icon={<Stethoscope />}
            title="No clinical observations"
            description="Add clinical observations and assessment notes for this patient."
            action={{
              label: 'Add Observation',
              onClick: () => console.log('Add observation'),
              variant: 'primary',
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Communication & Messages</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmptyState
            variant="default"
            icon={<MessageSquare />}
            title="No messages"
            description="Stay connected with patients and healthcare team members."
            action={{
              label: 'Send Message',
              onClick: () => console.log('Send message'),
              variant: 'primary',
            }}
          />
          
          <EmptyState
            variant="info"
            icon={<Bell />}
            title="No notifications"
            description="You're all caught up! No pending notifications at this time."
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">System & Configuration</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmptyState
            variant="warning"
            icon={<Settings />}
            title="Configuration required"
            description="Complete system setup to start using EHR Connect effectively."
            action={{
              label: 'Configure System',
              onClick: () => console.log('Configure system'),
              variant: 'warning',
            }}
            secondaryAction={{
              label: 'Skip Setup',
              onClick: () => console.log('Skip setup'),
              variant: 'outline',
            }}
          />
          
          <EmptyState
            variant="danger"
            icon={<AlertCircle />}
            title="System maintenance required"
            description="Critical updates are needed to ensure system security and performance."
            action={{
              label: 'Update System',
              onClick: () => console.log('Update system'),
              variant: 'danger',
            }}
          />
        </div>
      </div>
    </div>
  ),
};

export const WithCustomIllustration: Story = {
  render: () => (
    <div className="space-y-8">
      <EmptyState
        variant="primary"
        title="Welcome to Your EHR Dashboard"
        description="Everything you need to manage patient care efficiently is at your fingertips."
        illustration={
          <div className="w-64 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Stethoscope className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700">EHR Connect</p>
            </div>
          </div>
        }
        action={{
          label: 'Start Patient Care',
          onClick: () => console.log('Start patient care'),
          variant: 'primary',
        }}
        secondaryAction={{
          label: 'Take Tour',
          onClick: () => console.log('Take tour'),
          variant: 'outline',
        }}
        maxWidth="max-w-lg"
      />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [currentExample, setCurrentExample] = React.useState('patients');
    const [actionCount, setActionCount] = React.useState(0);

    const examples = {
      patients: {
        icon: <UserPlus />,
        title: 'No patients registered',
        description: 'Add your first patient to start managing medical records.',
        variant: 'primary' as const,
        action: 'Register Patient',
      },
      appointments: {
        icon: <Calendar />,
        title: 'No appointments scheduled',
        description: 'Schedule appointments to manage patient visits effectively.',
        variant: 'success' as const,
        action: 'Schedule Appointment',
      },
      records: {
        icon: <FileText />,
        title: 'No medical records found',
        description: 'Start documenting patient visits and treatment plans.',
        variant: 'info' as const,
        action: 'Create Record',
      },
      medications: {
        icon: <Pill />,
        title: 'No prescriptions active',
        description: 'Manage patient medications and prescription renewals.',
        variant: 'warning' as const,
        action: 'Prescribe Medication',
      },
      vitals: {
        icon: <Activity />,
        title: 'No vital signs recorded',
        description: 'Track patient health metrics and vital signs.',
        variant: 'default' as const,
        action: 'Record Vitals',
      },
    };

    const handleAction = () => {
      setActionCount(prev => prev + 1);
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Interactive Healthcare Empty States</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => setCurrentExample(key)}
                className={`px-3 py-2 text-sm rounded-md transition-colors capitalize ${
                  currentExample === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          
          <EmptyState
            variant={examples[currentExample as keyof typeof examples].variant}
            icon={examples[currentExample as keyof typeof examples].icon}
            title={examples[currentExample as keyof typeof examples].title}
            description={examples[currentExample as keyof typeof examples].description}
            action={{
              label: examples[currentExample as keyof typeof examples].action,
              onClick: handleAction,
              variant: 'primary',
            }}
            secondaryAction={{
              label: 'Learn More',
              onClick: () => console.log('Learn more'),
              variant: 'outline',
            }}
          />
        </div>
        
        {actionCount > 0 && (
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 text-success">
              <Shield className="w-5 h-5" />
              <p className="text-sm font-medium">
                Action performed {actionCount} time{actionCount > 1 ? 's' : ''}! 
                EHR system is ready to help manage patient care.
              </p>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">EmptyState Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">✅ Component Features:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Multiple variants for different contexts</li>
                <li>• Flexible sizing options (sm, md, lg)</li>
                <li>• Primary and secondary action buttons</li>
                <li>• Custom icons and illustrations</li>
                <li>• Responsive design patterns</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">🏥 Healthcare Use Cases:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Empty patient lists and search results</li>
                <li>• No scheduled appointments</li>
                <li>• Missing medical records or lab results</li>
                <li>• System setup and configuration</li>
                <li>• Error states and maintenance modes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};