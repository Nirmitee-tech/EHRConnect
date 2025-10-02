import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { List, ListItem } from './List';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  Heart,
  Pill,
  Stethoscope,
  Calendar,
  User,
  FileText,
  Activity,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Check,
  X,
  Minus,
  ChevronRight,
  Star
} from 'lucide-react';

const meta: Meta<typeof List> = {
  title: 'Atoms/List',
  component: List,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'List component provides flexible and accessible lists for healthcare applications. Supports ordered and unordered lists with various styling options, custom icons, and interactive states.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'muted'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg'],
    },
    marker: {
      control: 'select',
      options: ['none', 'disc', 'decimal', 'square', 'circle'],
    },
    position: {
      control: 'select',
      options: ['inside', 'outside'],
    },
    ordered: {
      control: 'boolean',
    },
    indent: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: () => (
    <List>
      <ListItem>Patient registration completed</ListItem>
      <ListItem>Medical history documented</ListItem>
      <ListItem>Insurance verification pending</ListItem>
    </List>
  ),
};

export const OrderedList: Story = {
  render: () => (
    <List ordered>
      <ListItem>Complete patient intake form</ListItem>
      <ListItem>Verify insurance coverage</ListItem>
      <ListItem>Schedule initial consultation</ListItem>
      <ListItem>Conduct physical examination</ListItem>
      <ListItem>Develop treatment plan</ListItem>
    </List>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Default</h4>
        <List variant="default">
          <ListItem>Standard patient information</ListItem>
          <ListItem>Regular appointment scheduled</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Primary</h4>
        <List variant="primary">
          <ListItem>Important medical alerts</ListItem>
          <ListItem>Priority patient notifications</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Success</h4>
        <List variant="success">
          <ListItem>Treatment completed successfully</ListItem>
          <ListItem>Lab results within normal range</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Warning</h4>
        <List variant="warning">
          <ListItem>Prescription renewal required</ListItem>
          <ListItem>Follow-up appointment overdue</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Danger</h4>
        <List variant="danger">
          <ListItem>Critical allergy alert</ListItem>
          <ListItem>Emergency contact needed</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Muted</h4>
        <List variant="muted">
          <ListItem>Additional notes</ListItem>
          <ListItem>Supplementary information</ListItem>
        </List>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Extra Small</h4>
        <List size="xs">
          <ListItem>Patient ID: MRN-123456</ListItem>
          <ListItem>Last updated: 2 hours ago</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Small</h4>
        <List size="sm">
          <ListItem>Current medications list</ListItem>
          <ListItem>Known allergies documented</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Medium (Default)</h4>
        <List size="md">
          <ListItem>Standard patient information display</ListItem>
          <ListItem>Medical history and current conditions</ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Large</h4>
        <List size="lg">
          <ListItem>Important announcements and alerts</ListItem>
          <ListItem>Primary navigation and main content areas</ListItem>
        </List>
      </div>
    </div>
  ),
};

export const CustomIcons: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Medical Status Icons</h4>
        <List marker="none">
          <ListItem icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} variant="success">
            Physical examination completed
          </ListItem>
          <ListItem icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />} variant="warning">
            Lab results pending review
          </ListItem>
          <ListItem icon={<XCircle className="w-5 h-5 text-red-500" />} variant="danger">
            Insurance claim denied
          </ListItem>
          <ListItem icon={<Info className="w-5 h-5 text-blue-500" />} variant="primary">
            Additional testing recommended
          </ListItem>
        </List>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Healthcare Categories</h4>
        <List marker="none">
          <ListItem icon={<Heart className="w-4 h-4 text-red-400" />}>
            Cardiology consultation scheduled
          </ListItem>
          <ListItem icon={<Pill className="w-4 h-4 text-blue-400" />}>
            Prescription refill available
          </ListItem>
          <ListItem icon={<Stethoscope className="w-4 h-4 text-green-400" />}>
            Annual physical examination due
          </ListItem>
          <ListItem icon={<Activity className="w-4 h-4 text-purple-400" />}>
            Vital signs monitoring required
          </ListItem>
        </List>
      </div>
    </div>
  ),
};

export const InteractiveList: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    
    const toggleItem = (item: string) => {
      setSelectedItems(prev => 
        prev.includes(item) 
          ? prev.filter(i => i !== item)
          : [...prev, item]
      );
    };
    
    const menuItems = [
      { id: 'patients', label: 'Patient Management', icon: User },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'records', label: 'Medical Records', icon: FileText },
      { id: 'vitals', label: 'Vital Signs', icon: Activity },
      { id: 'medications', label: 'Medications', icon: Pill },
      { id: 'reports', label: 'Reports', icon: FileText },
    ];
    
    return (
      <div>
        <h4 className="font-medium mb-3">Interactive Menu Items</h4>
        <List marker="none" className="border rounded-lg divide-y">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedItems.includes(item.id);
            
            return (
              <ListItem
                key={item.id}
                interactive
                onClick={() => toggleItem(item.id)}
                className={`p-3 ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
                icon={<Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />}
              >
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  },
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Checklist</h3>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3">Pre-Visit Checklist</h4>
          <List marker="none" spacing="sm">
            <ListItem icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} variant="success">
              Insurance verification completed
            </ListItem>
            <ListItem icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} variant="success">
              Medical history updated
            </ListItem>
            <ListItem icon={<Clock className="w-4 h-4 text-yellow-500" />} variant="warning">
              Lab work pending
            </ListItem>
            <ListItem icon={<XCircle className="w-4 h-4 text-red-500" />} variant="danger">
              Consent forms not signed
            </ListItem>
          </List>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Current Medications</h3>
        <div className="p-4 border rounded-lg">
          <List marker="none" spacing="md">
            <ListItem icon={<Pill className="w-4 h-4 text-blue-500" />}>
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="font-medium">Lisinopril 10mg</div>
                  <div className="text-sm text-muted-foreground">Once daily, with food</div>
                  <div className="text-xs text-muted-foreground">For: Hypertension</div>
                </div>
                <div className="text-sm text-green-600 font-medium">Active</div>
              </div>
            </ListItem>
            <ListItem icon={<Pill className="w-4 h-4 text-blue-500" />}>
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="font-medium">Metformin 500mg</div>
                  <div className="text-sm text-muted-foreground">Twice daily, with meals</div>
                  <div className="text-xs text-muted-foreground">For: Type 2 Diabetes</div>
                </div>
                <div className="text-sm text-yellow-600 font-medium">Renewal Due</div>
              </div>
            </ListItem>
            <ListItem icon={<Pill className="w-4 h-4 text-gray-400" />}>
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="font-medium text-muted-foreground">Aspirin 81mg</div>
                  <div className="text-sm text-muted-foreground">Daily (discontinued)</div>
                  <div className="text-xs text-muted-foreground">Reason: GI sensitivity</div>
                </div>
                <div className="text-sm text-red-600 font-medium">Discontinued</div>
              </div>
            </ListItem>
          </List>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Known Allergies</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <List marker="none" spacing="sm" variant="danger">
            <ListItem icon={<AlertCircle className="w-4 h-4 text-red-500" />}>
              <div>
                <div className="font-medium">Penicillin</div>
                <div className="text-sm">Severe - Anaphylaxis</div>
              </div>
            </ListItem>
            <ListItem icon={<AlertTriangle className="w-4 h-4 text-red-500" />}>
              <div>
                <div className="font-medium">Shellfish</div>
                <div className="text-sm">Moderate - Hives, swelling</div>
              </div>
            </ListItem>
          </List>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Treatment Progress</h3>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3">Physical Therapy - Week 4</h4>
          <List ordered spacing="sm">
            <ListItem>
              <div className="flex justify-between items-start w-full">
                <span>Range of motion exercises</span>
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              </div>
            </ListItem>
            <ListItem>
              <div className="flex justify-between items-start w-full">
                <span>Strength building routine</span>
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              </div>
            </ListItem>
            <ListItem>
              <div className="flex justify-between items-start w-full">
                <span>Balance and coordination</span>
                <Clock className="w-4 h-4 text-yellow-500 mt-0.5" />
              </div>
            </ListItem>
            <ListItem>
              <div className="flex justify-between items-start w-full">
                <span>Home exercise program</span>
                <Minus className="w-4 h-4 text-gray-400 mt-0.5" />
              </div>
            </ListItem>
          </List>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3">Emergency Contacts</h4>
          <List marker="none" spacing="sm">
            <ListItem icon={<User className="w-4 h-4 text-blue-500" />}>
              <div>
                <div className="font-medium">Sarah Doe (Spouse)</div>
                <div className="text-sm text-muted-foreground">Primary emergency contact</div>
              </div>
            </ListItem>
            <ListItem icon={<Phone className="w-4 h-4 text-green-500" />}>
              <div>
                <div className="font-medium">(555) 123-4567</div>
                <div className="text-sm text-muted-foreground">Mobile</div>
              </div>
            </ListItem>
            <ListItem icon={<Mail className="w-4 h-4 text-purple-500" />}>
              <div>
                <div className="font-medium">sarah.doe@email.com</div>
                <div className="text-sm text-muted-foreground">Email</div>
              </div>
            </ListItem>
            <ListItem icon={<MapPin className="w-4 h-4 text-red-500" />}>
              <div>
                <div className="font-medium">123 Healthcare Drive</div>
                <div className="text-sm text-muted-foreground">Cityville, ST 12345</div>
              </div>
            </ListItem>
          </List>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Results Summary</h3>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3">January 15, 2024</h4>
          <List marker="none" spacing="sm">
            <ListItem 
              bullet={<div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>}
              variant="success"
            >
              <div>
                <span className="font-medium">Hemoglobin: 14.2 g/dL</span>
                <span className="text-sm text-muted-foreground ml-2">(Normal: 12.0-15.5)</span>
              </div>
            </ListItem>
            <ListItem 
              bullet={<div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>}
              variant="success"
            >
              <div>
                <span className="font-medium">White Blood Cell: 6,800/μL</span>
                <span className="text-sm text-muted-foreground ml-2">(Normal: 4,500-11,000)</span>
              </div>
            </ListItem>
            <ListItem 
              bullet={<div className="w-3 h-3 rounded-full bg-yellow-500 mt-1"></div>}
              variant="warning"
            >
              <div>
                <span className="font-medium">Cholesterol: 205 mg/dL</span>
                <span className="text-sm text-muted-foreground ml-2">(Borderline: 200-239)</span>
              </div>
            </ListItem>
            <ListItem 
              bullet={<div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>}
              variant="danger"
            >
              <div>
                <span className="font-medium">HbA1c: 8.2%</span>
                <span className="text-sm text-muted-foreground ml-2">(Target: &lt;7%)</span>
              </div>
            </ListItem>
          </List>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
        <div className="p-4 border rounded-lg">
          <List marker="none" spacing="md">
            <ListItem icon={<Calendar className="w-4 h-4 text-blue-500" />}>
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="font-medium">Follow-up Visit</div>
                  <div className="text-sm text-muted-foreground">Dr. Sarah Johnson, MD</div>
                  <div className="text-sm text-muted-foreground">March 15, 2024 at 2:00 PM</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </ListItem>
            <ListItem icon={<Activity className="w-4 h-4 text-purple-500" />}>
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="font-medium">Lab Work</div>
                  <div className="text-sm text-muted-foreground">Fasting blood panel</div>
                  <div className="text-sm text-muted-foreground">March 10, 2024 at 8:00 AM</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </ListItem>
          </List>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Care Team</h3>
        <div className="p-4 border rounded-lg">
          <List marker="none" spacing="sm">
            <ListItem icon={<Stethoscope className="w-4 h-4 text-blue-500" />}>
              <div>
                <div className="font-medium">Dr. Sarah Johnson, MD</div>
                <div className="text-sm text-muted-foreground">Primary Care Physician</div>
                <div className="text-xs text-muted-foreground">Internal Medicine</div>
              </div>
            </ListItem>
            <ListItem icon={<Heart className="w-4 h-4 text-red-500" />}>
              <div>
                <div className="font-medium">Dr. Michael Chen, MD</div>
                <div className="text-sm text-muted-foreground">Cardiologist</div>
                <div className="text-xs text-muted-foreground">Cardiovascular Medicine</div>
              </div>
            </ListItem>
            <ListItem icon={<Shield className="w-4 h-4 text-green-500" />}>
              <div>
                <div className="font-medium">Lisa Rodriguez, RN</div>
                <div className="text-sm text-muted-foreground">Diabetes Educator</div>
                <div className="text-xs text-muted-foreground">Certified Diabetes Care Specialist</div>
              </div>
            </ListItem>
          </List>
        </div>
      </div>
    </div>
  ),
};

export const NestedLists: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Treatment Plan Structure</h4>
        <List>
          <ListItem>
            <div>
              <span className="font-medium">Diabetes Management</span>
              <List indent spacing="xs" className="mt-2">
                <ListItem>Monitor blood glucose daily</ListItem>
                <ListItem>Follow prescribed medication regimen</ListItem>
                <ListItem>
                  <span>Dietary modifications</span>
                  <List indent spacing="xs" className="mt-1">
                    <ListItem>Reduce carbohydrate intake</ListItem>
                    <ListItem>Increase fiber-rich foods</ListItem>
                    <ListItem>Limit processed sugars</ListItem>
                  </List>
                </ListItem>
              </List>
            </div>
          </ListItem>
          <ListItem>
            <div>
              <span className="font-medium">Hypertension Control</span>
              <List indent spacing="xs" className="mt-2">
                <ListItem>Daily blood pressure monitoring</ListItem>
                <ListItem>Medication compliance</ListItem>
                <ListItem>Sodium restriction (&lt;2g daily)</ListItem>
                <ListItem>Regular exercise (30 min, 5x/week)</ListItem>
              </List>
            </div>
          </ListItem>
        </List>
      </div>
    </div>
  ),
};