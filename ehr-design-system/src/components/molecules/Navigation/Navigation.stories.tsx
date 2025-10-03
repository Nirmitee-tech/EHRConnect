import type { Meta, StoryObj } from '@storybook/react';
import { Navigation } from './Navigation';
import { 
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  Bell,
  Search,
  User,
  Stethoscope,
  Heart,
  Activity,
  Pill,
  TestTube,
  Hospital,
  Shield,
  CreditCard,
  BarChart3,
  AlertCircle,
  UserCheck,
  Clipboard,
  Phone,
  Mail,
  HelpCircle,
  LogOut,
  Building2,
  Monitor,
  Database,
  Lock
} from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge';

const meta: Meta<typeof Navigation> = {
  title: 'Design System/Molecules/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive primary navigation component with support for branding, navigation items, actions, and user profile. Includes mobile-responsive design and healthcare-specific patterns.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'medical', 'clinical', 'administrative', 'dark', 'transparent'],
      description: 'Visual style variant of the navigation'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the navigation bar'
    },
    position: {
      control: 'select',
      options: ['static', 'fixed', 'sticky'],
      description: 'Positioning of the navigation bar'
    },
    showMenuToggle: {
      control: 'boolean',
      description: 'Show mobile menu toggle button'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200px' }}>
        <Story />
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Page Content</h2>
          <p className="text-muted-foreground">This represents the main page content below the navigation.</p>
        </div>
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof Navigation>;

// Basic Examples
export const Default: Story = {
  args: {
    title: 'EHR Connect',
    logo: <Hospital className="w-6 h-6 text-primary" />,
    showMenuToggle: true,
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
        badge: <Badge variant="secondary" size="sm">24</Badge>
      },
      {
        id: 'appointments',
        label: 'Appointments',
        icon: <Calendar />
      },
      {
        id: 'records',
        label: 'Records',
        icon: <FileText />
      }
    ],
    actions: [
      {
        id: 'search',
        icon: <Search />,
        label: 'Search'
      },
      {
        id: 'notifications',
        icon: <Bell />,
        label: 'Notifications',
        badge: <Badge variant="destructive" size="sm">3</Badge>
      }
    ],
    user: {
      name: 'Dr. Sarah Johnson',
      role: 'Physician',
      avatar: <User className="w-4 h-4" />
    }
  }
};

export const Medical: Story = {
  args: {
    variant: 'medical',
    title: 'Clinical Portal',
    logo: <Stethoscope className="w-6 h-6 text-blue-600" />,
    showMenuToggle: true,
    items: [
      {
        id: 'patients',
        label: 'Patient List',
        icon: <Users />,
        active: true,
        badge: <Badge variant="outline" size="sm">147</Badge>
      },
      {
        id: 'rounds',
        label: 'Daily Rounds',
        icon: <Clipboard />,
        badge: <Badge variant="warning" size="sm">12</Badge>
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: <FileText />,
        badge: <Badge variant="destructive" size="sm">5</Badge>
      },
      {
        id: 'lab-results',
        label: 'Lab Results',
        icon: <TestTube />,
        badge: <Badge variant="success" size="sm">New</Badge>
      },
      {
        id: 'medications',
        label: 'Medications',
        icon: <Pill />
      }
    ],
    actions: [
      {
        id: 'emergency',
        icon: <AlertCircle />,
        label: 'Emergency Alerts',
        badge: <Badge variant="destructive" size="sm">!</Badge>
      },
      {
        id: 'messages',
        icon: <Mail />,
        label: 'Messages',
        badge: <Badge variant="secondary" size="sm">8</Badge>
      }
    ],
    user: {
      name: 'Dr. Michael Chen',
      role: 'Attending Physician',
      avatar: <UserCheck className="w-4 h-4" />
    }
  }
};

export const Clinical: Story = {
  args: {
    variant: 'clinical',
    title: 'Nursing Station',
    logo: <Heart className="w-6 h-6 text-green-600" />,
    size: 'lg',
    showMenuToggle: true,
    items: [
      {
        id: 'my-patients',
        label: 'My Patients',
        icon: <Users />,
        active: true,
        badge: <Badge variant="secondary" size="sm">8</Badge>
      },
      {
        id: 'medications',
        label: 'Medication Admin',
        icon: <Pill />,
        badge: <Badge variant="warning" size="sm">6 Due</Badge>
      },
      {
        id: 'assessments',
        label: 'Assessments',
        icon: <Clipboard />,
        badge: <Badge variant="success" size="sm">Complete</Badge>
      },
      {
        id: 'vitals',
        label: 'Vital Signs',
        icon: <Activity />,
        badge: <Badge variant="outline" size="sm">Live</Badge>
      },
      {
        id: 'handoff',
        label: 'Shift Handoff',
        icon: <UserCheck />
      }
    ],
    actions: [
      {
        id: 'critical-alerts',
        icon: <AlertCircle />,
        label: 'Critical Alerts',
        badge: <Badge variant="destructive" size="sm">2</Badge>
      },
      {
        id: 'call-light',
        icon: <Bell />,
        label: 'Call Lights',
        badge: <Badge variant="warning" size="sm">4</Badge>
      }
    ],
    user: {
      name: 'Sarah Williams, RN',
      role: 'Charge Nurse',
      avatar: <Heart className="w-4 h-4" />
    }
  }
};

export const Administrative: Story = {
  args: {
    variant: 'administrative',
    title: 'Admin Dashboard',
    logo: <Building2 className="w-6 h-6 text-purple-600" />,
    showMenuToggle: true,
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <BarChart3 />,
        active: true
      },
      {
        id: 'billing',
        label: 'Billing & Claims',
        icon: <CreditCard />,
        badge: <Badge variant="warning" size="sm">42 Pending</Badge>
      },
      {
        id: 'staff',
        label: 'Staff Management',
        icon: <Users />,
        badge: <Badge variant="outline" size="sm">1,247</Badge>
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <FileText />
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: <Shield />,
        badge: <Badge variant="success" size="sm">98%</Badge>
      }
    ],
    actions: [
      {
        id: 'system-alerts',
        icon: <Monitor />,
        label: 'System Alerts'
      },
      {
        id: 'security',
        icon: <Lock />,
        label: 'Security Center'
      }
    ],
    user: {
      name: 'Jennifer Adams',
      role: 'System Administrator',
      avatar: <Shield className="w-4 h-4" />
    }
  }
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    title: 'Night Mode Portal',
    logo: <Hospital className="w-6 h-6 text-slate-200" />,
    showMenuToggle: true,
    items: [
      {
        id: 'emergency',
        label: 'Emergency Dept',
        icon: <AlertCircle />,
        active: true,
        badge: <Badge variant="destructive" size="sm">High</Badge>
      },
      {
        id: 'icu',
        label: 'ICU Monitoring',
        icon: <Monitor />,
        badge: <Badge variant="warning" size="sm">16/20</Badge>
      },
      {
        id: 'patients',
        label: 'Active Patients',
        icon: <Users />,
        badge: <Badge variant="outline" size="sm">89</Badge>
      },
      {
        id: 'alerts',
        label: 'Critical Alerts',
        icon: <Bell />
      }
    ],
    actions: [
      {
        id: 'emergency-contacts',
        icon: <Phone />,
        label: 'Emergency Contacts'
      },
      {
        id: 'help',
        icon: <HelpCircle />,
        label: 'Help'
      }
    ],
    user: {
      name: 'Dr. Night Shift',
      role: 'Emergency Physician',
      avatar: <AlertCircle className="w-4 h-4" />
    }
  }
};

// Size Variants
export const SmallSize: Story = {
  args: {
    size: 'sm',
    title: 'Compact EHR',
    logo: <Hospital className="w-5 h-5 text-primary" />,
    showMenuToggle: true,
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
      }
    ],
    actions: [
      {
        id: 'notifications',
        icon: <Bell />,
        label: 'Notifications',
        badge: <Badge variant="destructive" size="sm">2</Badge>
      }
    ],
    user: {
      name: 'Dr. Smith',
      avatar: <User className="w-4 h-4" />
    }
  }
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    title: 'Healthcare Enterprise System',
    logo: <Hospital className="w-8 h-8 text-primary" />,
    showMenuToggle: true,
    items: [
      {
        id: 'dashboard',
        label: 'Executive Dashboard',
        icon: <BarChart3 />,
        active: true
      },
      {
        id: 'operations',
        label: 'Hospital Operations',
        icon: <Building2 />,
        badge: <Badge variant="success" size="sm">Online</Badge>
      },
      {
        id: 'quality',
        label: 'Quality Metrics',
        icon: <Shield />,
        badge: <Badge variant="outline" size="sm">98.5%</Badge>
      },
      {
        id: 'finance',
        label: 'Financial Overview',
        icon: <CreditCard />
      }
    ],
    actions: [
      {
        id: 'alerts',
        icon: <AlertCircle />,
        label: 'System Alerts'
      },
      {
        id: 'settings',
        icon: <Settings />,
        label: 'Settings'
      }
    ],
    user: {
      name: 'Dr. Hospital Administrator',
      role: 'Chief Medical Officer',
      avatar: <Building2 className="w-4 h-4" />
    }
  }
};

// Position Variants
export const StickyNavigation: Story = {
  args: {
    position: 'sticky',
    variant: 'medical',
    title: 'Clinical System',
    logo: <Stethoscope className="w-6 h-6 text-blue-600" />,
    showMenuToggle: true,
    items: [
      {
        id: 'patients',
        label: 'Patients',
        icon: <Users />,
        active: true
      },
      {
        id: 'appointments',
        label: 'Appointments',
        icon: <Calendar />
      },
      {
        id: 'lab-results',
        label: 'Lab Results',
        icon: <TestTube />
      }
    ],
    actions: [
      {
        id: 'notifications',
        icon: <Bell />,
        label: 'Notifications'
      }
    ],
    user: {
      name: 'Dr. Example',
      role: 'Physician'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', overflow: 'auto' }}>
        <Story />
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Scrollable Content</h2>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium">Content Section {i + 1}</h3>
              <p className="text-sm text-muted-foreground">
                This is some example content to demonstrate sticky navigation behavior.
                Scroll down to see the navigation stick to the top of the viewport.
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  ]
};

// Emergency Department Use Case
export const EmergencyDepartment: Story = {
  args: {
    variant: 'medical',
    size: 'lg',
    position: 'sticky',
    title: 'ED Command Center',
    logo: <AlertCircle className="w-8 h-8 text-red-600" />,
    showMenuToggle: true,
    items: [
      {
        id: 'triage',
        label: 'Triage Queue',
        icon: <UserCheck />,
        active: true,
        badge: <Badge variant="destructive" size="sm">Level 1: 2</Badge>
      },
      {
        id: 'trauma',
        label: 'Trauma Bays',
        icon: <AlertCircle />,
        badge: <Badge variant="warning" size="sm">2/4</Badge>
      },
      {
        id: 'main-ed',
        label: 'Main ED',
        icon: <Hospital />,
        badge: <Badge variant="outline" size="sm">18/20</Badge>
      },
      {
        id: 'discharge',
        label: 'Discharge Ready',
        icon: <UserCheck />,
        badge: <Badge variant="success" size="sm">7</Badge>
      }
    ],
    actions: [
      {
        id: 'code-blue',
        icon: <Heart />,
        label: 'Code Blue',
        badge: <Badge variant="destructive" size="sm">!</Badge>
      },
      {
        id: 'bed-control',
        icon: <Building2 />,
        label: 'Bed Control'
      },
      {
        id: 'pharmacy',
        icon: <Pill />,
        label: 'Pharmacy'
      }
    ],
    user: {
      name: 'Dr. Emergency',
      role: 'ED Attending',
      avatar: <AlertCircle className="w-4 h-4" />
    }
  }
};

// ICU Management System
export const ICUManagement: Story = {
  args: {
    variant: 'clinical',
    title: 'ICU Central Monitoring',
    logo: <Monitor className="w-6 h-6 text-green-600" />,
    showMenuToggle: true,
    items: [
      {
        id: 'bed-overview',
        label: 'Bed Overview',
        icon: <Hospital />,
        active: true,
        badge: <Badge variant="success" size="sm">16/20</Badge>
      },
      {
        id: 'ventilators',
        label: 'Ventilator Status',
        icon: <Activity />,
        badge: <Badge variant="warning" size="sm">8 Active</Badge>
      },
      {
        id: 'hemodynamics',
        label: 'Hemodynamics',
        icon: <Heart />,
        badge: <Badge variant="outline" size="sm">Monitoring</Badge>
      },
      {
        id: 'medications',
        label: 'Drips & Infusions',
        icon: <Pill />,
        badge: <Badge variant="secondary" size="sm">12</Badge>
      }
    ],
    actions: [
      {
        id: 'alarms',
        icon: <Bell />,
        label: 'Critical Alarms',
        badge: <Badge variant="destructive" size="sm">3</Badge>
      },
      {
        id: 'rounds',
        icon: <Clipboard />,
        label: 'Rounds Checklist'
      }
    ],
    user: {
      name: 'Dr. Intensive Care',
      role: 'Intensivist',
      avatar: <Monitor className="w-4 h-4" />
    }
  }
};

// Hospital Administrator Dashboard
export const HospitalAdmin: Story = {
  args: {
    variant: 'administrative',
    size: 'lg',
    title: 'Hospital Management System',
    logo: <Building2 className="w-8 h-8 text-purple-600" />,
    showMenuToggle: true,
    items: [
      {
        id: 'executive-dashboard',
        label: 'Executive Dashboard',
        icon: <BarChart3 />,
        active: true
      },
      {
        id: 'financial-overview',
        label: 'Financial Overview',
        icon: <CreditCard />,
        badge: <Badge variant="outline" size="sm">$2.4M</Badge>
      },
      {
        id: 'quality-metrics',
        label: 'Quality & Safety',
        icon: <Shield />,
        badge: <Badge variant="success" size="sm">98.2%</Badge>
      },
      {
        id: 'staff-management',
        label: 'Staff Management',
        icon: <Users />,
        badge: <Badge variant="secondary" size="sm">1,847</Badge>
      },
      {
        id: 'operations',
        label: 'Operations Center',
        icon: <Monitor />
      }
    ],
    actions: [
      {
        id: 'notifications',
        icon: <Bell />,
        label: 'Executive Alerts',
        badge: <Badge variant="warning" size="sm">5</Badge>
      },
      {
        id: 'reports',
        icon: <FileText />,
        label: 'Reports Center'
      },
      {
        id: 'settings',
        icon: <Settings />,
        label: 'System Settings'
      }
    ],
    user: {
      name: 'Jennifer Smith',
      role: 'Chief Executive Officer',
      avatar: <Building2 className="w-4 h-4" />
    }
  }
};