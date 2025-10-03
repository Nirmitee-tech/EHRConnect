import type { Meta, StoryObj } from '@storybook/react';
import { SideNav } from './SideNav';
import { 
  Home,
  User,
  Users,
  Calendar,
  FileText,
  Settings,
  Stethoscope,
  Heart,
  Activity,
  Pill,
  TestTube,
  Syringe,
  Shield,
  CreditCard,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  Hospital,
  UserCheck,
  Clipboard,
  Search,
  Plus,
  Bell,
  HelpCircle,
  LogOut,
  Building2,
  DollarSign,
  PieChart,
  TrendingUp,
  Archive,
  Folder,
  Eye,
  Lock,
  Database,
  Monitor,
  Printer,
  Wifi,
  Phone,
  Mail
} from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';

const meta: Meta<typeof SideNav> = {
  title: 'Design System/Molecules/SideNav',
  component: SideNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A flexible sidebar navigation component with support for hierarchical navigation, grouping, collapsible sections, and healthcare-specific patterns. Built with accessibility and keyboard navigation in mind.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'medical', 'clinical', 'administrative', 'dark'],
      description: 'Visual style variant of the sidebar'
    },
    width: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Width of the sidebar when expanded'
    },
    collapsed: {
      control: 'boolean',
      description: 'Whether the sidebar is collapsed'
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether the sidebar can be collapsed'
    },
    showToggle: {
      control: 'boolean',
      description: 'Show collapse/expand toggle button'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', display: 'flex' }}>
        <Story />
        <div className="flex-1 p-6 bg-muted/20">
          <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
          <p className="text-muted-foreground">This represents the main application content that would sit alongside the sidebar navigation.</p>
        </div>
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof SideNav>;

// Basic Examples
export const Default: Story = {
  args: {
    title: 'Healthcare Portal',
    collapsible: true,
    showToggle: true,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home />,
        active: true
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: <Users />,
        badge: <Badge variant="secondary" size="sm">247</Badge>
      },
      {
        id: 'appointments',
        label: 'Appointments',
        icon: <Calendar />,
        badge: <Badge variant="destructive" size="sm">3</Badge>
      },
      {
        id: 'records',
        label: 'Medical Records',
        icon: <FileText />
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings />
      }
    ]
  }
};

export const Medical: Story = {
  args: {
    variant: 'medical',
    title: 'Clinical System',
    logo: <Hospital className="w-8 h-8 text-blue-600" />,
    collapsible: true,
    showToggle: true,
    groups: [
      {
        id: 'patient-care',
        label: 'Patient Care',
        icon: <Stethoscope />,
        items: [
          {
            id: 'patient-list',
            label: 'Patient List',
            icon: <Users />,
            active: true,
            badge: <Badge variant="outline" size="sm">124</Badge>
          },
          {
            id: 'admissions',
            label: 'Admissions',
            icon: <UserCheck />,
            badge: <Badge variant="secondary" size="sm">8</Badge>
          },
          {
            id: 'discharge-planning',
            label: 'Discharge Planning',
            icon: <Clipboard />,
            badge: <Badge variant="warning" size="sm">12</Badge>
          },
          {
            id: 'rounds',
            label: 'Daily Rounds',
            icon: <Clock />
          }
        ]
      },
      {
        id: 'clinical-tools',
        label: 'Clinical Tools',
        icon: <Activity />,
        items: [
          {
            id: 'vital-signs',
            label: 'Vital Signs',
            icon: <Heart />,
            badge: <Badge variant="success" size="sm">Live</Badge>
          },
          {
            id: 'lab-results',
            label: 'Lab Results',
            icon: <TestTube />,
            badge: <Badge variant="destructive" size="sm">5 Critical</Badge>
          },
          {
            id: 'medications',
            label: 'Medications',
            icon: <Pill />,
            badge: <Badge variant="warning" size="sm">2 Due</Badge>
          },
          {
            id: 'imaging',
            label: 'Imaging Studies',
            icon: <Eye />
          }
        ]
      },
      {
        id: 'documentation',
        label: 'Documentation',
        icon: <FileText />,
        collapsible: true,
        items: [
          {
            id: 'progress-notes',
            label: 'Progress Notes',
            icon: <FileText />,
            badge: <Badge variant="outline" size="sm">Draft</Badge>
          },
          {
            id: 'care-plans',
            label: 'Care Plans',
            icon: <Clipboard />
          },
          {
            id: 'assessments',
            label: 'Assessments',
            icon: <CheckCircle2 />
          }
        ]
      }
    ]
  }
};

export const Clinical: Story = {
  args: {
    variant: 'clinical',
    title: 'Nursing Station',
    width: 'lg',
    collapsible: true,
    showToggle: true,
    groups: [
      {
        id: 'patient-monitoring',
        label: 'Patient Monitoring',
        icon: <Monitor />,
        items: [
          {
            id: 'current-patients',
            label: 'My Patients',
            icon: <Users />,
            active: true,
            badge: <Badge variant="secondary" size="sm">6</Badge>
          },
          {
            id: 'handoff-report',
            label: 'Shift Handoff',
            icon: <UserCheck />,
            badge: <Badge variant="warning" size="sm">Pending</Badge>
          },
          {
            id: 'critical-alerts',
            label: 'Critical Alerts',
            icon: <AlertCircle />,
            badge: <Badge variant="destructive" size="sm">2</Badge>
          }
        ]
      },
      {
        id: 'nursing-tasks',
        label: 'Nursing Tasks',
        icon: <Clipboard />,
        collapsible: true,
        items: [
          {
            id: 'medication-admin',
            label: 'Medication Administration',
            icon: <Pill />,
            badge: <Badge variant="warning" size="sm">8 Due</Badge>
          },
          {
            id: 'assessments',
            label: 'Patient Assessments',
            icon: <Stethoscope />,
            badge: <Badge variant="success" size="sm">4 Complete</Badge>
          },
          {
            id: 'wound-care',
            label: 'Wound Care',
            icon: <Heart />,
            badge: <Badge variant="outline" size="sm">2</Badge>
          },
          {
            id: 'iv-management',
            label: 'IV Management',
            icon: <Syringe />
          }
        ]
      },
      {
        id: 'quality-safety',
        label: 'Quality & Safety',
        icon: <Shield />,
        items: [
          {
            id: 'incident-reports',
            label: 'Incident Reports',
            icon: <AlertCircle />
          },
          {
            id: 'quality-metrics',
            label: 'Quality Metrics',
            icon: <BarChart3 />
          },
          {
            id: 'safety-checklist',
            label: 'Safety Checklist',
            icon: <CheckCircle2 />
          }
        ]
      }
    ]
  }
};

export const Administrative: Story = {
  args: {
    variant: 'administrative',
    title: 'Admin Portal',
    width: 'xl',
    collapsible: true,
    showToggle: true,
    groups: [
      {
        id: 'operations',
        label: 'Hospital Operations',
        icon: <Building2 />,
        items: [
          {
            id: 'bed-management',
            label: 'Bed Management',
            icon: <Hospital />,
            badge: <Badge variant="warning" size="sm">85% Full</Badge>
          },
          {
            id: 'staff-scheduling',
            label: 'Staff Scheduling',
            icon: <Calendar />,
            badge: <Badge variant="success" size="sm">Complete</Badge>
          },
          {
            id: 'resource-allocation',
            label: 'Resource Allocation',
            icon: <BarChart3 />
          },
          {
            id: 'department-metrics',
            label: 'Department Metrics',
            icon: <TrendingUp />
          }
        ]
      },
      {
        id: 'financial',
        label: 'Financial Management',
        icon: <DollarSign />,
        collapsible: true,
        items: [
          {
            id: 'billing',
            label: 'Patient Billing',
            icon: <CreditCard />,
            badge: <Badge variant="outline" size="sm">$2.4M</Badge>
          },
          {
            id: 'insurance-claims',
            label: 'Insurance Claims',
            icon: <Shield />,
            badge: <Badge variant="warning" size="sm">45 Pending</Badge>
          },
          {
            id: 'budget-analysis',
            label: 'Budget Analysis',
            icon: <PieChart />,
            active: true
          },
          {
            id: 'revenue-cycle',
            label: 'Revenue Cycle',
            icon: <TrendingUp />
          }
        ]
      },
      {
        id: 'compliance',
        label: 'Compliance & Audit',
        icon: <Lock />,
        items: [
          {
            id: 'hipaa-compliance',
            label: 'HIPAA Compliance',
            icon: <Shield />,
            badge: <Badge variant="success" size="sm">98%</Badge>
          },
          {
            id: 'audit-logs',
            label: 'Audit Logs',
            icon: <Archive />
          },
          {
            id: 'policy-management',
            label: 'Policy Management',
            icon: <FileText />
          },
          {
            id: 'risk-assessment',
            label: 'Risk Assessment',
            icon: <AlertCircle />
          }
        ]
      },
      {
        id: 'system-admin',
        label: 'System Administration',
        icon: <Database />,
        collapsible: true,
        defaultCollapsed: true,
        items: [
          {
            id: 'user-management',
            label: 'User Management',
            icon: <Users />,
            badge: <Badge variant="secondary" size="sm">1,247</Badge>
          },
          {
            id: 'system-monitoring',
            label: 'System Monitoring',
            icon: <Monitor />,
            badge: <Badge variant="success" size="sm">Online</Badge>
          },
          {
            id: 'backup-recovery',
            label: 'Backup & Recovery',
            icon: <Archive />
          },
          {
            id: 'integration-management',
            label: 'Integration Management',
            icon: <Wifi />
          }
        ]
      }
    ]
  }
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    title: 'Night Mode',
    collapsible: true,
    showToggle: true,
    groups: [
      {
        id: 'main-nav',
        label: 'Main Navigation',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <Home />,
            active: true
          },
          {
            id: 'patients',
            label: 'Patients',
            icon: <Users />,
            badge: <Badge variant="secondary" size="sm">89</Badge>
          },
          {
            id: 'emergency',
            label: 'Emergency',
            icon: <AlertCircle />,
            badge: <Badge variant="destructive" size="sm">Critical</Badge>
          }
        ]
      },
      {
        id: 'tools',
        label: 'Clinical Tools',
        items: [
          {
            id: 'medications',
            label: 'Medications',
            icon: <Pill />
          },
          {
            id: 'lab-results',
            label: 'Lab Results',
            icon: <TestTube />
          },
          {
            id: 'imaging',
            label: 'Imaging',
            icon: <Eye />
          }
        ]
      }
    ],
    footer: (
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300 hover:text-slate-100">
          <HelpCircle className="w-4 h-4 mr-3" />
          Help & Support
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300 hover:text-slate-100">
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    )
  }
};

// Collapsed Examples
export const Collapsed: Story = {
  args: {
    variant: 'medical',
    collapsed: true,
    title: 'EHR System',
    logo: <Hospital className="w-6 h-6 text-blue-600" />,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home />,
        active: true
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: <Users />
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: <Calendar />
      },
      {
        id: 'records',
        label: 'Records',
        icon: <FileText />
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings />
      }
    ]
  }
};

// Emergency Department Workflow
export const EmergencyDepartment: Story = {
  args: {
    variant: 'medical',
    title: 'ED Command Center',
    width: 'lg',
    collapsible: true,
    showToggle: true,
    logo: <AlertCircle className="w-8 h-8 text-red-600" />,
    groups: [
      {
        id: 'triage',
        label: 'Triage & Intake',
        icon: <UserCheck />,
        items: [
          {
            id: 'waiting-room',
            label: 'Waiting Room',
            icon: <Clock />,
            badge: <Badge variant="warning" size="sm">12</Badge>
          },
          {
            id: 'triage-queue',
            label: 'Triage Queue',
            icon: <Users />,
            badge: <Badge variant="destructive" size="sm">4 Level 1</Badge>,
            active: true
          },
          {
            id: 'fast-track',
            label: 'Fast Track',
            icon: <Activity />,
            badge: <Badge variant="success" size="sm">6</Badge>
          }
        ]
      },
      {
        id: 'treatment-areas',
        label: 'Treatment Areas',
        icon: <Hospital />,
        items: [
          {
            id: 'trauma-bays',
            label: 'Trauma Bays',
            icon: <AlertCircle />,
            badge: <Badge variant="destructive" size="sm">2/4</Badge>
          },
          {
            id: 'resuscitation',
            label: 'Resuscitation',
            icon: <Heart />,
            badge: <Badge variant="success" size="sm">Available</Badge>
          },
          {
            id: 'main-ed',
            label: 'Main ED',
            icon: <Stethoscope />,
            badge: <Badge variant="warning" size="sm">18/20</Badge>
          },
          {
            id: 'observation',
            label: 'Observation',
            icon: <Eye />,
            badge: <Badge variant="outline" size="sm">8/12</Badge>
          }
        ]
      },
      {
        id: 'disposition',
        label: 'Patient Disposition',
        icon: <TrendingUp />,
        collapsible: true,
        items: [
          {
            id: 'discharge-ready',
            label: 'Discharge Ready',
            icon: <CheckCircle2 />,
            badge: <Badge variant="success" size="sm">7</Badge>
          },
          {
            id: 'admission-pending',
            label: 'Admission Pending',
            icon: <Clock />,
            badge: <Badge variant="warning" size="sm">5</Badge>
          },
          {
            id: 'transfer-requests',
            label: 'Transfer Requests',
            icon: <TrendingUp />,
            badge: <Badge variant="outline" size="sm">2</Badge>
          }
        ]
      }
    ],
    footer: (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Capacity:</span>
            <span className="text-red-600 font-medium">92%</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Wait:</span>
            <span className="text-yellow-600 font-medium">28 min</span>
          </div>
        </div>
      </div>
    )
  }
};

// ICU Management System
export const ICUManagement: Story = {
  args: {
    variant: 'clinical',
    title: 'ICU Management',
    width: 'lg',
    collapsible: true,
    showToggle: true,
    logo: <Monitor className="w-8 h-8 text-green-600" />,
    groups: [
      {
        id: 'patient-monitoring',
        label: 'Patient Monitoring',
        icon: <Activity />,
        items: [
          {
            id: 'bed-overview',
            label: 'Bed Overview',
            icon: <Hospital />,
            badge: <Badge variant="success" size="sm">16/20</Badge>,
            active: true
          },
          {
            id: 'ventilator-status',
            label: 'Ventilator Status',
            icon: <Activity />,
            badge: <Badge variant="warning" size="sm">8 Active</Badge>
          },
          {
            id: 'hemodynamics',
            label: 'Hemodynamics',
            icon: <Heart />,
            badge: <Badge variant="outline" size="sm">Live</Badge>
          }
        ]
      },
      {
        id: 'critical-care',
        label: 'Critical Care',
        icon: <Stethoscope />,
        items: [
          {
            id: 'sedation-protocol',
            label: 'Sedation Protocol',
            icon: <Pill />,
            badge: <Badge variant="secondary" size="sm">12 Patients</Badge>
          },
          {
            id: 'infection-control',
            label: 'Infection Control',
            icon: <Shield />,
            badge: <Badge variant="success" size="sm">Compliant</Badge>
          },
          {
            id: 'nutrition-support',
            label: 'Nutrition Support',
            icon: <Plus />,
            badge: <Badge variant="outline" size="sm">6</Badge>
          }
        ]
      },
      {
        id: 'quality-metrics',
        label: 'Quality Metrics',
        icon: <BarChart3 />,
        collapsible: true,
        items: [
          {
            id: 'mortality-index',
            label: 'Mortality Index',
            icon: <TrendingUp />,
            badge: <Badge variant="success" size="sm">0.8</Badge>
          },
          {
            id: 'length-of-stay',
            label: 'Length of Stay',
            icon: <Clock />,
            badge: <Badge variant="outline" size="sm">4.2 days</Badge>
          },
          {
            id: 'readmission-rate',
            label: 'Readmission Rate',
            icon: <PieChart />,
            badge: <Badge variant="success" size="sm">5.1%</Badge>
          }
        ]
      }
    ],
    footer: (
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Staff Ratio:</span>
          <span className="text-green-600 font-medium">1:2</span>
        </div>
        <div className="flex justify-between">
          <span>Acuity Score:</span>
          <span className="text-yellow-600 font-medium">High</span>
        </div>
        <div className="flex justify-between">
          <span>Alert Level:</span>
          <span className="text-green-600 font-medium">Normal</span>
        </div>
      </div>
    )
  }
};

// Interactive Features
export const WithNestedNavigation: Story = {
  args: {
    variant: 'default',
    title: 'Healthcare System',
    collapsible: true,
    showToggle: true,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home />,
        active: true
      },
      {
        id: 'patient-management',
        label: 'Patient Management',
        icon: <Users />,
        children: [
          {
            id: 'patient-list',
            label: 'Patient List',
            icon: <Users />
          },
          {
            id: 'admissions',
            label: 'Admissions',
            icon: <UserCheck />
          },
          {
            id: 'discharges',
            label: 'Discharges',
            icon: <CheckCircle2 />
          }
        ]
      },
      {
        id: 'clinical-tools',
        label: 'Clinical Tools',
        icon: <Stethoscope />,
        children: [
          {
            id: 'order-entry',
            label: 'Order Entry',
            icon: <Plus />
          },
          {
            id: 'results-review',
            label: 'Results Review',
            icon: <TestTube />
          },
          {
            id: 'medication-orders',
            label: 'Medication Orders',
            icon: <Pill />
          }
        ]
      }
    ]
  }
};