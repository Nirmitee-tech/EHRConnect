import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';
import { 
  User, 
  FileText, 
  Calendar, 
  Stethoscope, 
  Pill, 
  Heart, 
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  Settings,
  Shield,
  Users,
  Hospital,
  UserCheck,
  Clipboard,
  TestTube,
  Syringe,
  Eye,
  Brain
} from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';

const meta: Meta<typeof Tabs> = {
  title: 'Design System/Molecules/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible tabs component with multiple variants and healthcare-specific patterns. Built on Radix UI primitives with comprehensive accessibility support.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'underline', 'pills', 'cards', 'medical', 'clinical', 'administrative'],
      description: 'Visual style variant of the tabs'
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation of the tabs'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the tab triggers'
    },
    defaultValue: {
      control: 'text',
      description: 'Default active tab value'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Basic Examples
export const Default: Story = {
  args: {
    defaultValue: 'overview',
    tabs: [
      {
        value: 'overview',
        label: 'Overview',
        content: <div className="p-4">Patient overview and summary information.</div>
      },
      {
        value: 'vitals',
        label: 'Vitals',
        content: <div className="p-4">Current vital signs and measurements.</div>
      },
      {
        value: 'history',
        label: 'History',
        content: <div className="p-4">Medical history and previous visits.</div>
      }
    ]
  }
};

export const Underline: Story = {
  args: {
    variant: 'underline',
    defaultValue: 'demographics',
    tabs: [
      {
        value: 'demographics',
        label: 'Demographics',
        icon: <User />,
        content: <div className="p-4">Patient demographic information and contact details.</div>
      },
      {
        value: 'insurance',
        label: 'Insurance',
        icon: <Shield />,
        content: <div className="p-4">Insurance coverage and billing information.</div>
      },
      {
        value: 'contacts',
        label: 'Emergency Contacts',
        icon: <Users />,
        content: <div className="p-4">Emergency contact information and next of kin.</div>
      }
    ]
  }
};

export const Pills: Story = {
  args: {
    variant: 'pills',
    defaultValue: 'medications',
    tabs: [
      {
        value: 'medications',
        label: 'Current Medications',
        icon: <Pill />,
        badge: <Badge variant="secondary" size="sm">12</Badge>,
        content: <div className="p-4">List of current medications and prescriptions.</div>
      },
      {
        value: 'allergies',
        label: 'Allergies',
        icon: <AlertCircle />,
        badge: <Badge variant="destructive" size="sm">3</Badge>,
        content: <div className="p-4">Known allergies and adverse reactions.</div>
      },
      {
        value: 'immunizations',
        label: 'Immunizations',
        icon: <Syringe />,
        badge: <Badge variant="success" size="sm">8</Badge>,
        content: <div className="p-4">Vaccination history and immunization records.</div>
      }
    ]
  }
};

export const Cards: Story = {
  args: {
    variant: 'cards',
    defaultValue: 'clinical-notes',
    tabs: [
      {
        value: 'clinical-notes',
        label: 'Clinical Notes',
        description: 'Provider notes and observations',
        icon: <FileText />,
        badge: <Badge variant="outline" size="sm">24</Badge>,
        content: (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Latest Progress Note</h4>
              <p className="text-sm text-muted-foreground">Patient continues to show improvement following treatment protocol...</p>
            </div>
          </div>
        )
      },
      {
        value: 'lab-results',
        label: 'Lab Results',
        description: 'Laboratory tests and findings',
        icon: <TestTube />,
        badge: <Badge variant="secondary" size="sm">8</Badge>,
        content: (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Recent Blood Panel</h4>
              <p className="text-sm text-muted-foreground">Complete blood count and metabolic panel results...</p>
            </div>
          </div>
        )
      },
      {
        value: 'imaging',
        label: 'Imaging Studies',
        description: 'X-rays, CT scans, MRI results',
        icon: <Eye />,
        badge: <Badge variant="outline" size="sm">5</Badge>,
        content: (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Chest X-Ray</h4>
              <p className="text-sm text-muted-foreground">No acute findings. Clear lung fields bilaterally...</p>
            </div>
          </div>
        )
      }
    ]
  }
};

// Healthcare-Specific Variants
export const Medical: Story = {
  args: {
    variant: 'medical',
    defaultValue: 'diagnosis',
    tabs: [
      {
        value: 'diagnosis',
        label: 'Primary Diagnosis',
        icon: <Stethoscope />,
        content: (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" size="sm">ICD-10: J44.1</Badge>
              <span className="font-medium">Chronic obstructive pulmonary disease with acute exacerbation</span>
            </div>
            <p className="text-sm text-muted-foreground">Patient presents with increased dyspnea and productive cough consistent with COPD exacerbation.</p>
          </div>
        )
      },
      {
        value: 'treatment',
        label: 'Treatment Plan',
        icon: <Clipboard />,
        content: (
          <div className="p-4 space-y-3">
            <h4 className="font-medium">Current Treatment Protocol</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Nebulizer treatments q4h</li>
              <li>Corticosteroids as prescribed</li>
              <li>Oxygen therapy to maintain SpO2 &gt;90%</li>
            </ul>
          </div>
        )
      },
      {
        value: 'monitoring',
        label: 'Monitoring',
        icon: <Activity />,
        content: (
          <div className="p-4 space-y-3">
            <h4 className="font-medium">Vital Sign Monitoring</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>SpO2: 94% (Room Air)</div>
              <div>RR: 24/min</div>
              <div>HR: 88 BPM</div>
              <div>BP: 142/86 mmHg</div>
            </div>
          </div>
        )
      }
    ]
  }
};

export const Clinical: Story = {
  args: {
    variant: 'clinical',
    defaultValue: 'assessment',
    tabs: [
      {
        value: 'assessment',
        label: 'Clinical Assessment',
        icon: <Brain />,
        content: (
          <div className="p-4 space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-green-700">Mental Status Exam</h4>
              <p className="text-sm text-muted-foreground mt-1">Alert and oriented x3. Mood appears stable. No acute distress noted.</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-green-700">Neurological Findings</h4>
              <p className="text-sm text-muted-foreground mt-1">Cranial nerves II-XII intact. Motor strength 5/5 bilaterally.</p>
            </div>
          </div>
        )
      },
      {
        value: 'interventions',
        label: 'Care Interventions',
        icon: <Heart />,
        content: (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium">Completed Interventions</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Pain assessment completed (0/10)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Fall risk evaluation performed
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Discharge planning initiated
              </li>
            </ul>
          </div>
        )
      },
      {
        value: 'outcomes',
        label: 'Patient Outcomes',
        icon: <CheckCircle2 />,
        content: (
          <div className="p-4 space-y-3">
            <h4 className="font-medium">Measurable Outcomes</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm font-medium text-green-800">Pain Level Reduced</div>
                <div className="text-xs text-green-600">From 7/10 to 2/10</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm font-medium text-blue-800">Mobility Improved</div>
                <div className="text-xs text-blue-600">Independent ambulation achieved</div>
              </div>
            </div>
          </div>
        )
      }
    ]
  }
};

export const Administrative: Story = {
  args: {
    variant: 'administrative',
    defaultValue: 'scheduling',
    tabs: [
      {
        value: 'scheduling',
        label: 'Appointment Scheduling',
        icon: <Calendar />,
        content: (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Next Available Slots</h4>
              <Button size="sm">Schedule New</Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="border rounded p-3 text-sm">
                <div className="font-medium">Tomorrow 10:00 AM</div>
                <div className="text-muted-foreground">Follow-up appointment</div>
              </div>
              <div className="border rounded p-3 text-sm">
                <div className="font-medium">Friday 2:30 PM</div>
                <div className="text-muted-foreground">Routine check-up</div>
              </div>
            </div>
          </div>
        )
      },
      {
        value: 'billing',
        label: 'Billing & Claims',
        icon: <FileText />,
        badge: <Badge variant="warning" size="sm">2 Pending</Badge>,
        content: (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Recent Claims</h4>
              <Badge variant="success" size="sm">Processed</Badge>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Office Visit (99213)</span>
                <span className="text-green-600">$180.00</span>
              </div>
              <div className="flex justify-between">
                <span>Lab Work (80053)</span>
                <span className="text-yellow-600">Pending</span>
              </div>
            </div>
          </div>
        )
      },
      {
        value: 'reports',
        label: 'Administrative Reports',
        icon: <Settings />,
        content: (
          <div className="p-4 space-y-3">
            <h4 className="font-medium">Available Reports</h4>
            <div className="space-y-2 text-sm">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Patient Demographics Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Hospital className="w-4 h-4 mr-2" />
                Department Utilization
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Wait Time Analysis
              </Button>
            </div>
          </div>
        )
      }
    ]
  }
};

// Size Variants
export const SmallSize: Story = {
  args: {
    variant: 'underline',
    size: 'sm',
    defaultValue: 'quick-notes',
    tabs: [
      {
        value: 'quick-notes',
        label: 'Quick Notes',
        icon: <FileText />,
        content: <div className="p-3 text-sm">Compact view for quick note taking.</div>
      },
      {
        value: 'vitals',
        label: 'Vitals',
        icon: <Activity />,
        content: <div className="p-3 text-sm">Essential vital signs in compact format.</div>
      },
      {
        value: 'alerts',
        label: 'Alerts',
        icon: <AlertCircle />,
        badge: <Badge variant="destructive" size="sm">!</Badge>,
        content: <div className="p-3 text-sm">Critical alerts and notifications.</div>
      }
    ]
  }
};

export const LargeSize: Story = {
  args: {
    variant: 'pills',
    size: 'lg',
    defaultValue: 'patient-care',
    tabs: [
      {
        value: 'patient-care',
        label: 'Patient Care Dashboard',
        icon: <UserCheck />,
        content: <div className="p-6">Comprehensive patient care management interface with detailed information.</div>
      },
      {
        value: 'clinical-workflow',
        label: 'Clinical Workflow',
        icon: <Clipboard />,
        content: <div className="p-6">Advanced clinical workflow management and protocol tracking.</div>
      }
    ]
  }
};

// Interactive Features
export const ClosableTabs: Story = {
  args: {
    variant: 'default',
    defaultValue: 'patient-1',
    tabs: [
      {
        value: 'patient-1',
        label: 'John Doe',
        icon: <User />,
        closable: true,
        content: <div className="p-4">Patient record for John Doe</div>
      },
      {
        value: 'patient-2',
        label: 'Jane Smith',
        icon: <User />,
        closable: true,
        content: <div className="p-4">Patient record for Jane Smith</div>
      },
      {
        value: 'patient-3',
        label: 'Bob Johnson',
        icon: <User />,
        closable: true,
        content: <div className="p-4">Patient record for Bob Johnson</div>
      }
    ],
    onTabClose: (value) => console.log(`Closing tab: ${value}`),
    onAddTab: () => console.log('Adding new tab')
  }
};

export const VerticalOrientation: Story = {
  args: {
    variant: 'underline',
    orientation: 'vertical',
    defaultValue: 'patient-info',
    tabs: [
      {
        value: 'patient-info',
        label: 'Patient Information',
        icon: <User />,
        content: (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Patient Demographics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> Sarah Johnson</div>
              <div><strong>DOB:</strong> 05/15/1975</div>
              <div><strong>MRN:</strong> 123456789</div>
              <div><strong>Phone:</strong> (555) 123-4567</div>
            </div>
          </div>
        )
      },
      {
        value: 'medical-history',
        label: 'Medical History',
        icon: <FileText />,
        content: (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Past Medical History</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Hypertension (2018)</li>
              <li>Type 2 Diabetes (2020)</li>
              <li>Hyperlipidemia (2019)</li>
            </ul>
          </div>
        )
      },
      {
        value: 'current-visit',
        label: 'Current Visit',
        icon: <Stethoscope />,
        content: (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Today's Visit</h3>
            <p className="text-sm text-muted-foreground">
              Patient presents for routine diabetes follow-up. Blood glucose levels stable on current medication regimen.
            </p>
          </div>
        )
      },
      {
        value: 'care-plan',
        label: 'Care Plan',
        icon: <Clipboard />,
        content: (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Treatment Plan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Continue Metformin 1000mg BID</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span>Schedule HbA1c in 3 months</span>
              </div>
            </div>
          </div>
        )
      }
    ]
  }
};

// Emergency Department Workflow
export const EmergencyWorkflow: Story = {
  args: {
    variant: 'medical',
    defaultValue: 'triage',
    tabs: [
      {
        value: 'triage',
        label: 'Triage Assessment',
        icon: <AlertCircle />,
        badge: <Badge variant="destructive" size="sm">Level 2</Badge>,
        content: (
          <div className="p-4 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h4 className="font-semibold text-red-800">High Priority</h4>
              <p className="text-sm text-red-700">Chest pain with radiation to left arm. Requires immediate evaluation.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Chief Complaint:</strong> Chest Pain</div>
              <div><strong>Onset:</strong> 30 minutes ago</div>
              <div><strong>Pain Scale:</strong> 8/10</div>
              <div><strong>Vitals Stable:</strong> No</div>
            </div>
          </div>
        )
      },
      {
        value: 'diagnostic',
        label: 'Diagnostic Orders',
        icon: <TestTube />,
        content: (
          <div className="p-4 space-y-3">
            <h4 className="font-semibold">STAT Orders</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="destructive" size="sm">STAT</Badge>
                <span>12-Lead EKG</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="destructive" size="sm">STAT</Badge>
                <span>Chest X-Ray</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="warning" size="sm">Priority</Badge>
                <span>Cardiac Enzymes</span>
              </div>
            </div>
          </div>
        )
      },
      {
        value: 'treatment',
        label: 'Treatment Protocol',
        icon: <Heart />,
        content: (
          <div className="p-4 space-y-3">
            <h4 className="font-semibold">ACS Protocol Initiated</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Aspirin 325mg chewed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>IV access established</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span>Cardiology consult pending</span>
              </div>
            </div>
          </div>
        )
      }
    ]
  }
};
