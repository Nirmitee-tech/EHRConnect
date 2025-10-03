import type { Meta, StoryObj } from '@storybook/react';
import { TopBar } from './TopBar';
import { 
  Hospital,
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Sun,
  Moon,
  Globe,
  Stethoscope,
  Heart,
  Activity,
  AlertCircle,
  Monitor,
  Building2,
  Users,
  Calendar,
  FileText,
  Phone,
  Mail,
  Zap,
  Lock,
  UserCheck,
  Clock,
  Database
} from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge';

const meta: Meta<typeof TopBar> = {
  title: 'Design System/Molecules/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive application header component with branding, navigation, search, actions, and user profile functionality. Supports multiple variants for different healthcare contexts and responsive design.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'medical', 'clinical', 'administrative', 'dark', 'glass', 'emergency'],
      description: 'Visual style variant of the top bar'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the top bar'
    },
    position: {
      control: 'select',
      options: ['static', 'fixed', 'sticky'],
      description: 'Positioning of the top bar'
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Shadow depth'
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search functionality'
    },
    showMenuToggle: {
      control: 'boolean',
      description: 'Show mobile menu toggle'
    },
    emergency: {
      control: 'boolean',
      description: 'Emergency mode styling'
    },
    systemStatus: {
      control: 'select',
      options: ['operational', 'maintenance', 'incident'],
      description: 'System status indicator'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200px' }}>
        <Story />
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Page Content</h2>
          <p className="text-muted-foreground">This represents the main application content below the top bar.</p>
        </div>
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof TopBar>;

// Basic Examples
export const Default: Story = {
  args: {
    logo: <Hospital className="w-6 h-6 text-primary" />,
    title: 'EHR Connect',
    subtitle: 'Healthcare Management System',
    showSearch: true,
    showMenuToggle: true,
    actions: [
      {
        id: 'notifications',
        icon: <Bell />,
        label: 'Notifications',
        badge: <Badge variant="destructive" size="sm">3</Badge>
      },
      {
        id: 'help',
        icon: <HelpCircle />,
        label: 'Help & Support'
      }
    ],
    user: {
      name: 'Dr. Sarah Johnson',
      role: 'Physician',
      status: 'online',
      avatar: <User className="w-5 h-5" />,
      menu: [
        {
          id: 'profile',
          label: 'View Profile',
          icon: <User />
        },
        {
          id: 'settings',
          label: 'Account Settings',
          icon: <Settings />
        },
        {
          id: 'help',
          label: 'Help Center',
          icon: <HelpCircle />
        },
        {
          id: 'logout',
          label: 'Sign Out',
          icon: <LogOut />,
          divider: true
        }
      ]
    }
  }
};

export const Medical: Story = {
  args: {
    variant: 'medical',
    logo: <Stethoscope className="w-6 h-6 text-blue-600" />,
    title: 'Clinical Portal',
    subtitle: 'Patient Care Management',
    showSearch: true,
    showMenuToggle: true,
    breadcrumbs: [
      { id: 'patients', label: 'Patients' },
      { id: 'patient-detail', label: 'John Doe' },
      { id: 'medical-history', label: 'Medical History' }
    ],
    actions: [
      {
        id: 'emergency-alerts',
        icon: <AlertCircle />,
        label: 'Emergency Alerts',
        badge: <Badge variant="destructive" size="sm">2</Badge>
      },
      {
        id: 'messages',
        icon: <Mail />,
        label: 'Messages',
        badge: <Badge variant="secondary" size="sm">8</Badge>
      },
      {
        id: 'quick-actions',
        icon: <Zap />,
        label: 'Quick Actions'
      }
    ],
    user: {
      name: 'Dr. Michael Chen',
      email: 'mchen@hospital.com',
      role: 'Attending Physician',
      status: 'online',
      avatar: <UserCheck className="w-5 h-5" />,
      menu: [
        {
          id: 'schedule',
          label: 'My Schedule',
          icon: <Calendar />
        },
        {
          id: 'patients',
          label: 'My Patients',
          icon: <Users />
        },
        {
          id: 'preferences',
          label: 'Clinical Preferences',
          icon: <Settings />
        },
        {
          id: 'logout',
          label: 'End Shift',
          icon: <LogOut />,
          divider: true
        }
      ]
    }
  }
};

export const Clinical: Story = {
  args: {
    variant: 'clinical',
    logo: <Heart className="w-6 h-6 text-green-600" />,
    title: 'Nursing Station',
    subtitle: 'Patient Care Coordination',
    showSearch: true,
    showMenuToggle: true,
    breadcrumbs: [
      { id: 'ward', label: 'Medical Ward 3A' },
      { id: 'patient', label: 'Room 302' }
    ],
    actions: [
      {
        id: 'critical-alerts',
        icon: <AlertCircle />,
        label: 'Critical Alerts',
        badge: <Badge variant="destructive" size="sm">1</Badge>
      },
      {
        id: 'call-lights',
        icon: <Bell />,
        label: 'Call Lights',
        badge: <Badge variant="warning" size="sm">4</Badge>
      },
      {
        id: 'medication-alerts',
        icon: <Clock />,
        label: 'Medication Due',
        badge: <Badge variant="secondary" size="sm">6</Badge>
      }
    ],
    user: {
      name: 'Sarah Williams, RN',
      role: 'Charge Nurse',
      status: 'online',
      avatar: <Heart className="w-5 h-5" />,
      menu: [
        {
          id: 'my-patients',
          label: 'My Patients (8)',
          icon: <Users />
        },
        {
          id: 'handoff-notes',
          label: 'Handoff Notes',
          icon: <FileText />
        },
        {
          id: 'shift-summary',
          label: 'Shift Summary',
          icon: <Activity />
        },
        {
          id: 'preferences',
          label: 'Nursing Preferences',
          icon: <Settings />
        },
        {
          id: 'logout',
          label: 'End Shift',
          icon: <LogOut />,
          divider: true
        }
      ]
    }
  }
};

export const Administrative: Story = {
  args: {
    variant: 'administrative',
    logo: <Building2 className="w-6 h-6 text-purple-600" />,
    title: 'Hospital Administration',
    subtitle: 'Management Dashboard',
    showSearch: true,
    showMenuToggle: true,
    breadcrumbs: [
      { id: 'dashboard', label: 'Executive Dashboard' },
      { id: 'financial', label: 'Financial Reports' }
    ],
    actions: [
      {
        id: 'system-alerts',
        icon: <Monitor />,
        label: 'System Alerts',
        badge: <Badge variant="warning" size="sm">3</Badge>
      },
      {
        id: 'reports',
        icon: <FileText />,
        label: 'Reports Center'
      },
      {
        id: 'security',
        icon: <Shield />,
        label: 'Security Center'
      }
    ],
    user: {
      name: 'Jennifer Adams',
      role: 'System Administrator',
      status: 'online',
      avatar: <Building2 className="w-5 h-5" />,
      menu: [
        {
          id: 'admin-panel',
          label: 'Admin Panel',
          icon: <Settings />
        },
        {
          id: 'user-management',
          label: 'User Management',
          icon: <Users />
        },
        {
          id: 'system-settings',
          label: 'System Settings',
          icon: <Database />
        },
        {
          id: 'security',
          label: 'Security Settings',
          icon: <Lock />
        },
        {
          id: 'logout',
          label: 'Sign Out',
          icon: <LogOut />,
          divider: true
        }
      ]
    }
  }
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    logo: <Hospital className="w-6 h-6 text-slate-200" />,
    title: 'Night Mode Portal',
    subtitle: 'Emergency Operations',
    showSearch: true,
    showMenuToggle: true,
    actions: [
      {
        id: 'emergency-contacts',
        icon: <Phone />,
        label: 'Emergency Contacts'
      },
      {
        id: 'system-status',
        icon: <Monitor />,
        label: 'System Status',
        badge: <Badge variant="success" size="sm">OK</Badge>
      },
      {
        id: 'theme-toggle',
        icon: <Sun />,
        label: 'Toggle Theme'
      }
    ],
    user: {
      name: 'Dr. Night Shift',
      role: 'Emergency Physician',
      status: 'online',
      avatar: <AlertCircle className="w-5 h-5" />,
      menu: [
        {
          id: 'emergency-protocols',
          label: 'Emergency Protocols',
          icon: <AlertCircle />
        },
        {
          id: 'night-settings',
          label: 'Night Mode Settings',
          icon: <Moon />
        },
        {
          id: 'logout',
          label: 'End Shift',
          icon: <LogOut />,
          divider: true
        }
      ]
    }
  }
};

export const Emergency: Story = {
  args: {
    emergency: true,
    logo: <AlertCircle className="w-6 h-6 text-red-600" />,
    title: 'Emergency Mode Active',
    subtitle: 'Code Blue - Room 314',
    showMenuToggle: true,
    actions: [
      {
        id: 'code-team',
        icon: <Users />,
        label: 'Code Team',
        badge: <Badge variant="destructive" size="sm">Activated</Badge>
      },
      {
        id: 'emergency-contacts',
        icon: <Phone />,
        label: 'Emergency Contacts'
      },
      {
        id: 'protocols',
        icon: <FileText />,
        label: 'Emergency Protocols'
      }
    ],
    user: {
      name: 'Dr. Emergency Response',
      role: 'Code Team Leader',
      status: 'busy',
      avatar: <AlertCircle className="w-5 h-5" />
    }
  }
};

// Size Variants
export const SmallSize: Story = {
  args: {
    size: 'sm',
    logo: <Hospital className="w-5 h-5 text-primary" />,
    title: 'Compact EHR',
    showSearch: true,
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
    logo: <Hospital className="w-8 h-8 text-primary" />,
    title: 'Healthcare Enterprise System',
    subtitle: 'Comprehensive Care Management Platform',
    showSearch: true,
    showMenuToggle: true,
    breadcrumbs: [
      { id: 'system', label: 'Hospital System' },
      { id: 'department', label: 'Cardiology' },
      { id: 'unit', label: 'CCU' }
    ],
    actions: [
      {
        id: 'alerts',
        icon: <Bell />,
        label: 'System Alerts',
        badge: <Badge variant="warning" size="sm">5</Badge>
      },
      {
        id: 'settings',
        icon: <Settings />,
        label: 'System Settings'
      }
    ],
    user: {
      name: 'Dr. Chief Administrator',
      role: 'Chief Medical Officer',
      status: 'online',
      avatar: <Building2 className="w-6 h-6" />
    }
  }
};

// System Status Examples
export const MaintenanceMode: Story = {
  args: {
    variant: 'medical',
    systemStatus: 'maintenance',
    logo: <Hospital className="w-6 h-6 text-blue-600" />,
    title: 'EHR System',
    subtitle: 'Scheduled Maintenance Window',
    actions: [
      {
        id: 'status',
        icon: <Settings />,
        label: 'Maintenance Status'
      }
    ],
    user: {
      name: 'System Admin',
      role: 'IT Operations'
    }
  }
};

export const SystemIncident: Story = {
  args: {
    variant: 'medical',
    systemStatus: 'incident',
    logo: <Hospital className="w-6 h-6 text-blue-600" />,
    title: 'EHR System',
    subtitle: 'Service Degradation Detected',
    actions: [
      {
        id: 'incident-details',
        icon: <AlertCircle />,
        label: 'Incident Details',
        badge: <Badge variant="destructive" size="sm">Active</Badge>
      }
    ],
    user: {
      name: 'Operations Team',
      role: 'Incident Response'
    }
  }
};

// Position Variants
export const StickyTopBar: Story = {
  args: {
    position: 'sticky',
    variant: 'medical',
    logo: <Stethoscope className="w-6 h-6 text-blue-600" />,
    title: 'Clinical System',
    showSearch: true,
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
                This is some example content to demonstrate sticky top bar behavior.
                Scroll down to see the top bar stick to the top of the viewport.
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  ]
};

// Glass Effect
export const GlassEffect: Story = {
  args: {
    variant: 'glass',
    logo: <Hospital className="w-6 h-6 text-primary" />,
    title: 'Modern EHR Interface',
    showSearch: true,
    actions: [
      {
        id: 'notifications',
        icon: <Bell />,
        label: 'Notifications'
      }
    ],
    user: {
      name: 'Dr. Modern UI',
      role: 'Physician'
    }
  },
  decorators: [
    (Story) => (
      <div 
        style={{ 
          minHeight: '400px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0'
        }}
      >
        <Story />
        <div className="p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Glass Effect Demo</h2>
          <p className="opacity-90">
            The glass variant creates a frosted glass effect with backdrop blur,
            perfect for modern interfaces with colorful backgrounds.
          </p>
        </div>
      </div>
    )
  ]
};

// ICU Monitoring System
export const ICUMonitoring: Story = {
  args: {
    variant: 'clinical',
    size: 'lg',
    logo: <Monitor className="w-8 h-8 text-green-600" />,
    title: 'ICU Central Monitoring',
    subtitle: 'Real-time Patient Surveillance',
    breadcrumbs: [
      { id: 'icu', label: 'ICU Unit 4' },
      { id: 'monitoring', label: 'Central Station' }
    ],
    actions: [
      {
        id: 'alarms',
        icon: <AlertCircle />,
        label: 'Critical Alarms',
        badge: <Badge variant="destructive" size="sm">3</Badge>
      },
      {
        id: 'vitals',
        icon: <Activity />,
        label: 'Vital Signs Monitor'
      },
      {
        id: 'ventilator-status',
        icon: <Monitor />,
        label: 'Ventilator Status',
        badge: <Badge variant="warning" size="sm">8</Badge>
      }
    ],
    user: {
      name: 'ICU Monitoring Tech',
      role: 'Critical Care Specialist',
      status: 'online',
      avatar: <Monitor className="w-5 h-5" />
    }
  }
};