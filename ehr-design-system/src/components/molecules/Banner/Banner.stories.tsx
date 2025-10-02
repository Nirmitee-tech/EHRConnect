import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Banner } from './Banner';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Shield,
  Heart,
  Pill,
  Calendar,
  Clock,
  Bell,
  Settings,
  Download,
  Upload,
  Database,
  Wifi,
  WifiOff,
  UserPlus,
  FileText,
  Activity,
  Stethoscope,
  Phone
} from 'lucide-react';

const meta: Meta<typeof Banner> = {
  title: 'Molecules/Banner',
  component: Banner,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Banner component displays important messages, alerts, and system notifications in healthcare applications. Supports various variants, actions, and dismissible functionality.',
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
    appearance: {
      control: 'select',
      options: ['filled', 'outlined', 'subtle'],
    },
    dismissible: {
      control: 'boolean',
    },
    persistent: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  args: {
    title: 'Information',
    description: 'This is a default banner message for general information.',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Banner
        variant="default"
        title="System Information"
        description="General system message or notification."
      />
      
      <Banner
        variant="primary"
        title="Important Update"
        description="New features are now available in your EHR system."
      />
      
      <Banner
        variant="success"
        title="Operation Successful"
        description="Patient record has been updated successfully."
      />
      
      <Banner
        variant="warning"
        title="Action Required"
        description="Some patient records require your immediate attention."
      />
      
      <Banner
        variant="danger"
        title="Critical Alert"
        description="System maintenance is required to ensure data security."
      />
      
      <Banner
        variant="info"
        title="Helpful Information"
        description="Tips and guidance for using the healthcare management system."
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Banner
        size="sm"
        variant="info"
        title="Small Banner"
        description="Compact size for minimal space usage"
      />
      
      <Banner
        size="md"
        variant="primary"
        title="Medium Banner"
        description="Standard size for most use cases in the application"
      />
      
      <Banner
        size="lg"
        variant="success"
        title="Large Banner"
        description="Larger size for prominent announcements and important messages"
      />
    </div>
  ),
};

export const Appearances: Story = {
  render: () => (
    <div className="space-y-4">
      <Banner
        appearance="filled"
        variant="primary"
        title="Filled Appearance"
        description="Default filled background style"
      />
      
      <Banner
        appearance="outlined"
        variant="warning"
        title="Outlined Appearance"
        description="Outlined style with background"
      />
      
      <Banner
        appearance="subtle"
        variant="success"
        title="Subtle Appearance"
        description="Minimal style without border"
      />
    </div>
  ),
};

export const CustomIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <Banner
        variant="success"
        icon={<Heart className="w-5 h-5 text-red-500" />}
        title="Health Monitor Active"
        description="Patient vital signs are being monitored continuously."
      />
      
      <Banner
        variant="warning"
        icon={<Pill className="w-5 h-5 text-blue-500" />}
        title="Medication Reminder"
        description="Patient has prescriptions that expire within 7 days."
      />
      
      <Banner
        variant="info"
        icon={<Calendar className="w-5 h-5 text-green-500" />}
        title="Appointment Scheduled"
        description="New appointment has been added to the patient's calendar."
      />
      
      <Banner
        variant="danger"
        icon={<Shield className="w-5 h-5 text-red-600" />}
        title="Security Alert"
        description="Multiple failed login attempts detected for this account."
      />
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="space-y-4">
      <Banner
        variant="primary"
        title="System Update Available"
        description="A new version of the EHR system is ready for installation."
        actions={[
          {
            label: 'Update Now',
            onClick: () => console.log('Update clicked'),
            variant: 'primary',
          },
          {
            label: 'Schedule Later',
            onClick: () => console.log('Schedule clicked'),
            variant: 'outline',
          },
        ]}
      />
      
      <Banner
        variant="warning"
        title="Backup Recommended"
        description="It's been 7 days since your last data backup."
        actions={[
          {
            label: 'Backup Now',
            onClick: () => console.log('Backup clicked'),
            variant: 'warning',
          },
          {
            label: 'Remind Later',
            onClick: () => console.log('Remind clicked'),
            variant: 'outline',
          },
        ]}
      />
      
      <Banner
        variant="success"
        title="Integration Complete"
        description="Lab results are now automatically synced with patient records."
        actions={[
          {
            label: 'View Details',
            onClick: () => console.log('View details clicked'),
            variant: 'outline',
          },
        ]}
      />
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <div className="space-y-4">
      <Banner
        variant="info"
        title="Welcome to EHR Connect"
        description="Take a tour of the new features and improvements."
        dismissible
        onDismiss={() => console.log('Banner dismissed')}
      />
      
      <Banner
        variant="warning"
        title="Temporary Service Disruption"
        description="Lab result integration may be delayed by up to 2 hours."
        dismissible
        actions={[
          {
            label: 'Learn More',
            onClick: () => console.log('Learn more clicked'),
            variant: 'outline',
          },
        ]}
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Care Alerts</h3>
        <div className="space-y-4">
          <Banner
            variant="danger"
            icon={<AlertCircle className="w-5 h-5" />}
            title="Critical Drug Allergy Alert"
            description="Patient John Doe has a severe penicillin allergy. Verify all prescriptions before administration."
            actions={[
              {
                label: 'View Allergy Details',
                onClick: () => console.log('View allergy details'),
                variant: 'outline',
              },
              {
                label: 'Acknowledge',
                onClick: () => console.log('Acknowledged'),
                variant: 'danger',
              },
            ]}
          />
          
          <Banner
            variant="warning"
            icon={<Clock className="w-5 h-5" />}
            title="Medication Renewal Due"
            description="Patient has 3 prescriptions expiring within the next 7 days."
            actions={[
              {
                label: 'Review Prescriptions',
                onClick: () => console.log('Review prescriptions'),
                variant: 'warning',
              },
              {
                label: 'Schedule Renewal',
                onClick: () => console.log('Schedule renewal'),
                variant: 'outline',
              },
            ]}
            dismissible
          />
          
          <Banner
            variant="success"
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="Lab Results Available"
            description="New lab results for 5 patients are ready for review."
            actions={[
              {
                label: 'Review Results',
                onClick: () => console.log('Review results'),
                variant: 'success',
              },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">System & Administrative Notifications</h3>
        <div className="space-y-4">
          <Banner
            variant="primary"
            icon={<Settings className="w-5 h-5" />}
            title="Scheduled Maintenance"
            description="System maintenance will occur tonight from 2:00 AM - 4:00 AM EST. Plan accordingly."
            actions={[
              {
                label: 'View Details',
                onClick: () => console.log('View maintenance details'),
                variant: 'outline',
              },
              {
                label: 'Set Reminder',
                onClick: () => console.log('Set reminder'),
                variant: 'primary',
              },
            ]}
          />
          
          <Banner
            variant="info"
            icon={<Upload className="w-5 h-5" />}
            title="Data Backup Complete"
            description="Daily backup completed successfully at 3:00 AM. All patient data is secure."
            size="sm"
            dismissible
          />
          
          <Banner
            variant="warning"
            icon={<WifiOff className="w-5 h-5" />}
            title="Network Connectivity Issues"
            description="Intermittent connection issues may affect real-time data synchronization."
            actions={[
              {
                label: 'Check Status',
                onClick: () => console.log('Check network status'),
                variant: 'outline',
              },
              {
                label: 'Report Issue',
                onClick: () => console.log('Report network issue'),
                variant: 'warning',
              },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Appointment & Scheduling</h3>
        <div className="space-y-4">
          <Banner
            variant="success"
            icon={<Calendar className="w-5 h-5" />}
            title="Appointment Confirmed"
            description="Patient Sarah Wilson's appointment for tomorrow at 2:00 PM has been confirmed."
            size="sm"
            dismissible
          />
          
          <Banner
            variant="warning"
            icon={<Clock className="w-5 h-5" />}
            title="Schedule Conflicts Detected"
            description="3 appointment conflicts found in next week's schedule. Review and reschedule as needed."
            actions={[
              {
                label: 'Resolve Conflicts',
                onClick: () => console.log('Resolve conflicts'),
                variant: 'warning',
              },
              {
                label: 'View Schedule',
                onClick: () => console.log('View schedule'),
                variant: 'outline',
              },
            ]}
          />
          
          <Banner
            variant="info"
            icon={<UserPlus className="w-5 h-5" />}
            title="New Patient Registration"
            description="5 new patients registered today. Insurance verification pending."
            actions={[
              {
                label: 'Process Registrations',
                onClick: () => console.log('Process registrations'),
                variant: 'primary',
              },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Workflow</h3>
        <div className="space-y-4">
          <Banner
            variant="primary"
            icon={<Stethoscope className="w-5 h-5" />}
            title="New Clinical Guidelines Available"
            description="Updated treatment protocols for diabetes management are now available in the knowledge base."
            actions={[
              {
                label: 'Review Guidelines',
                onClick: () => console.log('Review guidelines'),
                variant: 'primary',
              },
              {
                label: 'Schedule Training',
                onClick: () => console.log('Schedule training'),
                variant: 'outline',
              },
            ]}
            dismissible
          />
          
          <Banner
            variant="warning"
            icon={<FileText className="w-5 h-5" />}
            title="Incomplete Documentation"
            description="12 patient encounters from yesterday require completion of clinical notes."
            actions={[
              {
                label: 'Complete Notes',
                onClick: () => console.log('Complete notes'),
                variant: 'warning',
              },
              {
                label: 'View List',
                onClick: () => console.log('View incomplete list'),
                variant: 'outline',
              },
            ]}
          />
          
          <Banner
            variant="success"
            icon={<Activity className="w-5 h-5" />}
            title="Quality Metrics Improved"
            description="Patient satisfaction scores increased by 15% this quarter. Keep up the excellent work!"
            size="sm"
            actions={[
              {
                label: 'View Report',
                onClick: () => console.log('View quality report'),
                variant: 'outline',
              },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency & Critical Alerts</h3>
        <div className="space-y-4">
          <Banner
            variant="danger"
            icon={<AlertTriangle className="w-5 h-5" />}
            title="Emergency Department Alert"
            description="Emergency department is at 95% capacity. Consider alternative care options for non-critical cases."
            actions={[
              {
                label: 'View ED Status',
                onClick: () => console.log('View ED status'),
                variant: 'danger',
              },
              {
                label: 'Contact ED',
                onClick: () => console.log('Contact ED'),
                variant: 'outline',
              },
            ]}
            persistent
          />
          
          <Banner
            variant="warning"
            icon={<Phone className="w-5 h-5" />}
            title="Critical Lab Value"
            description="Patient Michael Chen has a critical potassium level (6.2 mEq/L). Immediate physician notification required."
            actions={[
              {
                label: 'Notify Physician',
                onClick: () => console.log('Notify physician'),
                variant: 'danger',
              },
              {
                label: 'View Full Results',
                onClick: () => console.log('View lab results'),
                variant: 'outline',
              },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Integration & Data Sync</h3>
        <div className="space-y-4">
          <Banner
            variant="success"
            icon={<Database className="w-5 h-5" />}
            title="Lab Integration Active"
            description="Real-time lab result integration with Quest Diagnostics is now active."
            size="sm"
            dismissible
          />
          
          <Banner
            variant="warning"
            icon={<Wifi className="w-5 h-5" />}
            title="Sync Delay Detected"
            description="Patient record synchronization with external systems is experiencing delays up to 30 minutes."
            actions={[
              {
                label: 'Check Status',
                onClick: () => console.log('Check sync status'),
                variant: 'outline',
              },
              {
                label: 'Manual Sync',
                onClick: () => console.log('Manual sync'),
                variant: 'warning',
              },
            ]}
          />
          
          <Banner
            variant="info"
            icon={<Download className="w-5 h-5" />}
            title="Data Export Complete"
            description="Monthly patient data export for reporting has completed successfully."
            actions={[
              {
                label: 'Download Report',
                onClick: () => console.log('Download report'),
                variant: 'primary',
              },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};

export const InteractiveBannerDemo: Story = {
  render: () => {
    const [banners, setBanners] = React.useState([
      {
        id: 1,
        variant: 'warning' as const,
        title: 'Prescription Renewals Needed',
        description: '3 patients have prescriptions expiring this week.',
        icon: <Pill className="w-5 h-5" />,
      },
      {
        id: 2,
        variant: 'info' as const,
        title: 'New Patient Registered',
        description: 'Sarah Johnson has been added to your patient list.',
        icon: <UserPlus className="w-5 h-5" />,
      },
      {
        id: 3,
        variant: 'success' as const,
        title: 'Lab Results Available',
        description: 'Blood work results for John Doe are ready for review.',
        icon: <CheckCircle2 className="w-5 h-5" />,
      },
    ]);

    const dismissBanner = (id: number) => {
      setBanners(banners.filter(banner => banner.id !== id));
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Interactive Banner Management</h4>
          <button
            onClick={() => setBanners([
              {
                id: Date.now(),
                variant: 'primary' as const,
                title: 'New Banner Added',
                description: 'This banner was added dynamically.',
                icon: <Bell className="w-5 h-5" />,
              },
              ...banners,
            ])}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded"
          >
            Add Banner
          </button>
        </div>
        
        {banners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active banners. Click "Add Banner" to create one.
          </div>
        ) : (
          banners.map((banner) => (
            <Banner
              key={banner.id}
              variant={banner.variant}
              title={banner.title}
              description={banner.description}
              icon={banner.icon}
              dismissible
              onDismiss={() => dismissBanner(banner.id)}
              actions={[
                {
                  label: 'Take Action',
                  onClick: () => console.log(`Action taken for banner ${banner.id}`),
                  variant: 'outline',
                },
              ]}
            />
          ))
        )}
      </div>
    );
  },
};