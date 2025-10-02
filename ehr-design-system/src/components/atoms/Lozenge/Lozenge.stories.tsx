import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Lozenge } from './Lozenge';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Info,
  Heart,
  Pill,
  Stethoscope,
  Calendar,
  User,
  Shield,
  Activity,
  Star,
  Zap,
  Bell,
  Mail,
  Phone,
  MapPin,
  FileText,
  Settings
} from 'lucide-react';

const meta: Meta<typeof Lozenge> = {
  title: 'Atoms/Lozenge',
  component: Lozenge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Lozenge component displays status, categories, or labels in healthcare applications. Supports various styles, sizes, and interactive features including removable tags.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info', 'outline', 'subtle'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['rounded', 'square', 'pill'],
    },
    removable: {
      control: 'boolean',
    },
    dot: {
      control: 'boolean',
    },
    pulse: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Lozenge>;

export const Default: Story = {
  args: {
    children: 'Active Patient',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Lozenge variant="default">Default Status</Lozenge>
      <Lozenge variant="primary">Primary Alert</Lozenge>
      <Lozenge variant="success">Treatment Complete</Lozenge>
      <Lozenge variant="warning">Renewal Required</Lozenge>
      <Lozenge variant="danger">Critical Alert</Lozenge>
      <Lozenge variant="info">Information</Lozenge>
      <Lozenge variant="outline">Outline Style</Lozenge>
      <Lozenge variant="subtle">Subtle Note</Lozenge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Lozenge size="xs">Extra Small</Lozenge>
      <Lozenge size="sm">Small</Lozenge>
      <Lozenge size="md">Medium</Lozenge>
      <Lozenge size="lg">Large</Lozenge>
      <Lozenge size="xl">Extra Large</Lozenge>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Lozenge shape="rounded">Rounded</Lozenge>
      <Lozenge shape="square">Square</Lozenge>
      <Lozenge shape="pill">Pill Shape</Lozenge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Lozenge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
        Completed
      </Lozenge>
      <Lozenge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>
        Attention Required
      </Lozenge>
      <Lozenge variant="danger" icon={<XCircle className="w-3 h-3" />}>
        Failed
      </Lozenge>
      <Lozenge variant="info" icon={<Clock className="w-3 h-3" />}>
        Pending
      </Lozenge>
      <Lozenge variant="primary" icon={<Heart className="w-3 h-3" />}>
        Cardiology
      </Lozenge>
      <Lozenge variant="outline" icon={<Pill className="w-3 h-3" />}>
        Medication
      </Lozenge>
    </div>
  ),
};

export const WithDots: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Lozenge variant="success" dot>
        Active
      </Lozenge>
      <Lozenge variant="warning" dot>
        Pending
      </Lozenge>
      <Lozenge variant="danger" dot>
        Inactive
      </Lozenge>
      <Lozenge variant="info" dot>
        Processing
      </Lozenge>
    </div>
  ),
};

export const RemovableTags: Story = {
  render: () => {
    const [tags, setTags] = React.useState([
      'Type 2 Diabetes',
      'Hypertension',
      'High Cholesterol',
      'Allergies: Penicillin',
    ]);

    const removeTag = (index: number) => {
      setTags(tags.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Lozenge
              key={index}
              variant="primary"
              removable
              onRemove={() => removeTag(index)}
            >
              {tag}
            </Lozenge>
          ))}
        </div>
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">All tags removed</p>
        )}
      </div>
    );
  },
};

export const PulseAnimation: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Lozenge variant="danger" pulse dot>
        Critical Alert
      </Lozenge>
      <Lozenge variant="warning" pulse icon={<Bell className="w-3 h-3" />}>
        New Notification
      </Lozenge>
      <Lozenge variant="success" pulse>
        Live Status
      </Lozenge>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Status Indicators</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Appointment Status</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                Confirmed
              </Lozenge>
              <Lozenge variant="warning" icon={<Clock className="w-3 h-3" />}>
                Pending
              </Lozenge>
              <Lozenge variant="info" icon={<Calendar className="w-3 h-3" />}>
                Scheduled
              </Lozenge>
              <Lozenge variant="danger" icon={<XCircle className="w-3 h-3" />}>
                Cancelled
              </Lozenge>
              <Lozenge variant="subtle" icon={<Clock className="w-3 h-3" />}>
                No Show
              </Lozenge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Patient Registration Status</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="success" dot>
                Active
              </Lozenge>
              <Lozenge variant="warning" dot>
                Inactive
              </Lozenge>
              <Lozenge variant="info" dot>
                Pending Verification
              </Lozenge>
              <Lozenge variant="danger" dot>
                Suspended
              </Lozenge>
              <Lozenge variant="outline" dot>
                Archived
              </Lozenge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Insurance Status</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="success" icon={<Shield className="w-3 h-3" />}>
                Verified
              </Lozenge>
              <Lozenge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>
                Verification Needed
              </Lozenge>
              <Lozenge variant="danger" icon={<XCircle className="w-3 h-3" />}>
                Denied
              </Lozenge>
              <Lozenge variant="info" icon={<Clock className="w-3 h-3" />}>
                Processing
              </Lozenge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Categories & Specialties</h3>
        <div className="flex flex-wrap gap-2">
          <Lozenge variant="primary" icon={<Heart className="w-3 h-3" />}>
            Cardiology
          </Lozenge>
          <Lozenge variant="info" icon={<Stethoscope className="w-3 h-3" />}>
            Primary Care
          </Lozenge>
          <Lozenge variant="success" icon={<Activity className="w-3 h-3" />}>
            Emergency
          </Lozenge>
          <Lozenge variant="warning" icon={<Pill className="w-3 h-3" />}>
            Pharmacy
          </Lozenge>
          <Lozenge variant="outline" icon={<FileText className="w-3 h-3" />}>
            Radiology
          </Lozenge>
          <Lozenge variant="subtle" icon={<User className="w-3 h-3" />}>
            Pediatrics
          </Lozenge>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Prescription Status</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2 text-sm">Current Medications</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="success" size="sm" dot>
                Lisinopril 10mg - Active
              </Lozenge>
              <Lozenge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />}>
                Metformin 500mg - Renewal Due
              </Lozenge>
              <Lozenge variant="danger" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                Aspirin 81mg - Interaction Warning
              </Lozenge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Prescription History</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="outline" size="sm">
                Discontinued - Simvastatin
              </Lozenge>
              <Lozenge variant="subtle" size="sm">
                Completed - Antibiotic Course
              </Lozenge>
              <Lozenge variant="info" size="sm">
                Substituted - Generic Available
              </Lozenge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Results & Vital Signs</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2 text-sm">Blood Work Results</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="success" size="sm">
                Hemoglobin: Normal
              </Lozenge>
              <Lozenge variant="success" size="sm">
                White Blood Cell: Normal
              </Lozenge>
              <Lozenge variant="warning" size="sm">
                Cholesterol: Elevated
              </Lozenge>
              <Lozenge variant="danger" size="sm">
                HbA1c: High
              </Lozenge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Vital Signs Status</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="success" size="sm" dot>
                Blood Pressure: 120/80
              </Lozenge>
              <Lozenge variant="warning" size="sm" dot>
                Temperature: 99.1°F
              </Lozenge>
              <Lozenge variant="success" size="sm" dot>
                Heart Rate: 72 BPM
              </Lozenge>
              <Lozenge variant="info" size="sm" dot>
                O2 Saturation: 98%
              </Lozenge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Alert & Notification Types</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2 text-sm">Critical Alerts</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="danger" pulse icon={<AlertTriangle className="w-3 h-3" />}>
                Drug Allergy Alert
              </Lozenge>
              <Lozenge variant="danger" pulse dot>
                Critical Lab Value
              </Lozenge>
              <Lozenge variant="warning" pulse icon={<Bell className="w-3 h-3" />}>
                Prescription Expiring
              </Lozenge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">System Notifications</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="info" icon={<Mail className="w-3 h-3" />}>
                New Message
              </Lozenge>
              <Lozenge variant="primary" icon={<Calendar className="w-3 h-3" />}>
                Appointment Reminder
              </Lozenge>
              <Lozenge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                Task Completed
              </Lozenge>
              <Lozenge variant="outline" icon={<Settings className="w-3 h-3" />}>
                System Update
              </Lozenge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Conditions & Allergies</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2 text-sm">Current Conditions</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="warning" removable onRemove={() => {}}>
                Type 2 Diabetes
              </Lozenge>
              <Lozenge variant="warning" removable onRemove={() => {}}>
                Hypertension
              </Lozenge>
              <Lozenge variant="info" removable onRemove={() => {}}>
                High Cholesterol
              </Lozenge>
              <Lozenge variant="success" removable onRemove={() => {}}>
                Well-controlled Asthma
              </Lozenge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Known Allergies</h4>
            <div className="flex flex-wrap gap-2">
              <Lozenge variant="danger" removable onRemove={() => {}}>
                Penicillin - Severe
              </Lozenge>
              <Lozenge variant="warning" removable onRemove={() => {}}>
                Shellfish - Moderate
              </Lozenge>
              <Lozenge variant="info" removable onRemove={() => {}}>
                Latex - Mild
              </Lozenge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive Tag Management</h3>
        <InteractiveTagsExample />
      </div>
    </div>
  ),
};

function InteractiveTagsExample() {
  const [availableTags] = React.useState([
    { id: 1, label: 'VIP Patient', variant: 'primary' as const },
    { id: 2, label: 'Complex Case', variant: 'warning' as const },
    { id: 3, label: 'Research Participant', variant: 'info' as const },
    { id: 4, label: 'Frequent Visitor', variant: 'success' as const },
    { id: 5, label: 'Needs Interpreter', variant: 'outline' as const },
  ]);
  
  const [selectedTags, setSelectedTags] = React.useState<number[]>([1, 3]);

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2 text-sm">Available Tags (Click to add)</h4>
        <div className="flex flex-wrap gap-2">
          {availableTags
            .filter(tag => !selectedTags.includes(tag.id))
            .map(tag => (
              <Lozenge
                key={tag.id}
                variant={tag.variant}
                onClick={() => toggleTag(tag.id)}
                className="cursor-pointer"
              >
                {tag.label}
              </Lozenge>
            ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2 text-sm">Applied Tags</h4>
        <div className="flex flex-wrap gap-2">
          {selectedTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags applied</p>
          ) : (
            selectedTags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return tag ? (
                <Lozenge
                  key={tag.id}
                  variant={tag.variant}
                  removable
                  onRemove={() => removeTag(tag.id)}
                >
                  {tag.label}
                </Lozenge>
              ) : null;
            })
          )}
        </div>
      </div>
    </div>
  );
}

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Screen Reader Friendly</h4>
        <div className="flex flex-wrap gap-2">
          <Lozenge 
            variant="success" 
            aria-label="Patient status is active"
            role="status"
          >
            Active
          </Lozenge>
          <Lozenge 
            variant="warning" 
            aria-label="Prescription renewal required within 3 days"
            role="alert"
          >
            Renewal Due
          </Lozenge>
          <Lozenge 
            variant="danger" 
            aria-label="Critical drug allergy alert for penicillin"
            role="alert"
          >
            Allergy Alert
          </Lozenge>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Keyboard Navigation</h4>
        <div className="flex flex-wrap gap-2">
          <Lozenge 
            variant="primary" 
            removable
            onRemove={() => {}}
            tabIndex={0}
            role="button"
            aria-label="Remove diabetes tag"
          >
            Diabetes
          </Lozenge>
          <Lozenge 
            variant="warning" 
            removable
            onRemove={() => {}}
            tabIndex={0}
            role="button"
            aria-label="Remove hypertension tag"
          >
            Hypertension
          </Lozenge>
        </div>
      </div>
    </div>
  ),
};