import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';
import { 
  Hospital,
  Shield,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  FileText,
  HelpCircle,
  Users,
  Lock,
  Heart,
  Stethoscope,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  BookOpen,
  Award,
  Briefcase,
  UserCheck,
  Database,
  Zap
} from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge';

const meta: Meta<typeof Footer> = {
  title: 'Design System/Molecules/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive footer component with support for branding, navigation links, contact information, social media, compliance information, and system status. Perfect for healthcare applications with HIPAA compliance requirements.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'medical', 'clinical', 'administrative', 'dark', 'muted'],
      description: 'Visual style variant of the footer'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the footer'
    },
    layout: {
      control: 'select',
      options: ['simple', 'expanded', 'comprehensive'],
      description: 'Layout complexity of the footer'
    },
    showSystemStatus: {
      control: 'boolean',
      description: 'Show system status indicator'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 p-6">
          <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
          <p className="text-muted-foreground">This represents the main application content above the footer.</p>
        </div>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof Footer>;

// Basic Examples
export const Simple: Story = {
  args: {
    layout: 'simple',
    logo: <Hospital className="w-6 h-6 text-primary" />,
    brandName: 'EHR Connect',
    tagline: 'Healthcare Management System',
    emergencyContact: {
      phone: '1-800-MEDICAL',
      label: 'Emergency'
    },
    showSystemStatus: true,
    complianceLinks: [
      {
        id: 'privacy',
        label: 'Privacy Policy',
        href: '#',
        icon: <Lock className="w-3 h-3" />
      },
      {
        id: 'hipaa',
        label: 'HIPAA Compliance',
        href: '#',
        icon: <Shield className="w-3 h-3" />
      }
    ]
  }
};

export const Expanded: Story = {
  args: {
    layout: 'expanded',
    logo: <Hospital className="w-8 h-8 text-primary" />,
    brandName: 'Healthcare Enterprise',
    tagline: 'Comprehensive Care Management',
    description: 'Leading healthcare technology solutions designed to improve patient outcomes and streamline clinical workflows.',
    contacts: [
      {
        type: 'phone',
        label: 'Main Office',
        value: '(555) 123-4567',
        href: 'tel:+15551234567'
      },
      {
        type: 'email',
        label: 'Support',
        value: 'support@healthcare.com',
        href: 'mailto:support@healthcare.com'
      },
      {
        type: 'address',
        label: 'Address',
        value: '123 Medical Center Dr, Health City, HC 12345'
      }
    ],
    sections: [
      {
        id: 'products',
        title: 'Products',
        links: [
          { id: 'ehr', label: 'Electronic Health Records', href: '#' },
          { id: 'practice', label: 'Practice Management', href: '#' },
          { id: 'telehealth', label: 'Telehealth Platform', href: '#' },
          { id: 'analytics', label: 'Healthcare Analytics', href: '#' }
        ]
      },
      {
        id: 'resources',
        title: 'Resources',
        links: [
          { id: 'docs', label: 'Documentation', href: '#', icon: <FileText className="w-3 h-3" /> },
          { id: 'support', label: 'Support Center', href: '#', icon: <HelpCircle className="w-3 h-3" /> },
          { id: 'training', label: 'Training', href: '#', icon: <BookOpen className="w-3 h-3" /> },
          { id: 'api', label: 'API Reference', href: '#', external: true }
        ]
      }
    ],
    socialLinks: [
      {
        id: 'linkedin',
        platform: 'LinkedIn',
        href: 'https://linkedin.com',
        icon: <Linkedin className="w-4 h-4" />,
        label: 'Follow us on LinkedIn'
      },
      {
        id: 'twitter',
        platform: 'Twitter',
        href: 'https://twitter.com',
        icon: <Twitter className="w-4 h-4" />,
        label: 'Follow us on Twitter'
      }
    ],
    showSystemStatus: true,
    emergencyContact: {
      phone: '1-800-MEDICAL',
      label: 'Emergency Support'
    },
    complianceLinks: [
      {
        id: 'privacy',
        label: 'Privacy Policy',
        href: '#',
        icon: <Lock className="w-3 h-3" />
      },
      {
        id: 'terms',
        label: 'Terms of Service',
        href: '#'
      },
      {
        id: 'hipaa',
        label: 'HIPAA Compliance',
        href: '#',
        icon: <Shield className="w-3 h-3" />
      }
    ]
  }
};

// Healthcare Variants
export const Medical: Story = {
  args: {
    variant: 'medical',
    layout: 'expanded',
    logo: <Stethoscope className="w-8 h-8 text-blue-600" />,
    brandName: 'Medical Center EHR',
    tagline: 'Advanced Clinical Information System',
    description: 'Comprehensive electronic health records system designed for modern healthcare facilities.',
    contacts: [
      {
        type: 'phone',
        label: 'Clinical Support',
        value: '(555) 234-5678',
        href: 'tel:+15552345678',
        icon: <Stethoscope className="w-4 h-4" />
      },
      {
        type: 'email',
        label: 'IT Help Desk',
        value: 'it-support@medcenter.com',
        href: 'mailto:it-support@medcenter.com'
      }
    ],
    sections: [
      {
        id: 'clinical-modules',
        title: 'Clinical Modules',
        links: [
          { 
            id: 'patient-records', 
            label: 'Patient Records', 
            href: '#',
            icon: <Users className="w-3 h-3" />
          },
          { 
            id: 'order-entry', 
            label: 'Computerized Order Entry', 
            href: '#',
            icon: <FileText className="w-3 h-3" />
          },
          { 
            id: 'lab-results', 
            label: 'Laboratory Interface', 
            href: '#',
            badge: <Badge variant="secondary" size="sm">New</Badge>
          },
          { 
            id: 'imaging', 
            label: 'Medical Imaging', 
            href: '#'
          }
        ]
      },
      {
        id: 'clinical-support',
        title: 'Clinical Support',
        links: [
          { id: 'protocols', label: 'Clinical Protocols', href: '#' },
          { id: 'decision-support', label: 'Decision Support', href: '#' },
          { id: 'drug-database', label: 'Drug Interaction Database', href: '#' },
          { 
            id: 'clinical-training', 
            label: 'Clinical Training', 
            href: '#',
            icon: <BookOpen className="w-3 h-3" />
          }
        ]
      }
    ],
    showSystemStatus: true,
    systemStatus: {
      status: 'operational',
      message: 'All clinical systems operational',
      lastUpdated: '2 minutes ago'
    },
    emergencyContact: {
      phone: '1-800-MED-HELP',
      label: 'Clinical Emergency'
    },
    complianceLinks: [
      {
        id: 'hipaa',
        label: 'HIPAA Compliance',
        href: '#',
        icon: <Shield className="w-3 h-3" />
      },
      {
        id: 'hitech',
        label: 'HITECH Act',
        href: '#',
        icon: <Lock className="w-3 h-3" />
      },
      {
        id: 'security',
        label: 'Security Policies',
        href: '#',
        icon: <Database className="w-3 h-3" />
      }
    ]
  }
};

export const Clinical: Story = {
  args: {
    variant: 'clinical',
    layout: 'expanded',
    logo: <Heart className="w-8 h-8 text-green-600" />,
    brandName: 'ClinicalCare Platform',
    tagline: 'Integrated Nursing & Clinical Workflow',
    description: 'Streamlined clinical documentation and care coordination platform for nursing professionals.',
    contacts: [
      {
        type: 'phone',
        label: 'Nursing Support',
        value: '(555) 345-6789',
        href: 'tel:+15553456789',
        icon: <Heart className="w-4 h-4" />
      },
      {
        type: 'email',
        label: 'Clinical Support',
        value: 'clinical@platform.com',
        href: 'mailto:clinical@platform.com'
      }
    ],
    sections: [
      {
        id: 'nursing-tools',
        title: 'Nursing Tools',
        links: [
          { 
            id: 'care-plans', 
            label: 'Care Plans', 
            href: '#',
            icon: <FileText className="w-3 h-3" />
          },
          { 
            id: 'medication-admin', 
            label: 'Medication Administration', 
            href: '#',
            badge: <Badge variant="warning" size="sm">Due</Badge>
          },
          { 
            id: 'assessments', 
            label: 'Patient Assessments', 
            href: '#'
          },
          { 
            id: 'handoff-reports', 
            label: 'Shift Handoff Reports', 
            href: '#'
          }
        ]
      },
      {
        id: 'quality-safety',
        title: 'Quality & Safety',
        links: [
          { id: 'incident-reporting', label: 'Incident Reporting', href: '#' },
          { id: 'quality-metrics', label: 'Quality Metrics', href: '#' },
          { id: 'safety-protocols', label: 'Safety Protocols', href: '#' },
          { id: 'infection-control', label: 'Infection Control', href: '#' }
        ]
      }
    ],
    showSystemStatus: true,
    systemStatus: {
      status: 'operational',
      message: 'Clinical systems running normally',
      lastUpdated: '5 minutes ago'
    },
    emergencyContact: {
      phone: '1-800-NURSE-HELP',
      label: 'Nursing Emergency Line'
    },
    complianceLinks: [
      {
        id: 'joint-commission',
        label: 'Joint Commission Standards',
        href: '#',
        icon: <Award className="w-3 h-3" />
      },
      {
        id: 'nursing-standards',
        label: 'Nursing Standards',
        href: '#',
        icon: <Heart className="w-3 h-3" />
      }
    ]
  }
};

export const Administrative: Story = {
  args: {
    variant: 'administrative',
    layout: 'expanded',
    logo: <Building2 className="w-8 h-8 text-purple-600" />,
    brandName: 'Hospital Admin Suite',
    tagline: 'Enterprise Healthcare Management',
    description: 'Comprehensive administrative and financial management system for healthcare organizations.',
    contacts: [
      {
        type: 'phone',
        label: 'Admin Support',
        value: '(555) 456-7890',
        href: 'tel:+15554567890',
        icon: <Building2 className="w-4 h-4" />
      },
      {
        type: 'email',
        label: 'Finance Department',
        value: 'finance@hospital.com',
        href: 'mailto:finance@hospital.com'
      }
    ],
    sections: [
      {
        id: 'financial-management',
        title: 'Financial Management',
        links: [
          { 
            id: 'billing', 
            label: 'Patient Billing', 
            href: '#',
            badge: <Badge variant="outline" size="sm">$2.4M</Badge>
          },
          { id: 'insurance-claims', label: 'Insurance Claims', href: '#' },
          { id: 'revenue-cycle', label: 'Revenue Cycle Management', href: '#' },
          { id: 'financial-reports', label: 'Financial Reports', href: '#' }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        links: [
          { id: 'staff-management', label: 'Staff Management', href: '#' },
          { id: 'scheduling', label: 'Staff Scheduling', href: '#' },
          { id: 'resource-planning', label: 'Resource Planning', href: '#' },
          { id: 'quality-improvement', label: 'Quality Improvement', href: '#' }
        ]
      }
    ],
    showSystemStatus: true,
    systemStatus: {
      status: 'maintenance',
      message: 'Scheduled maintenance window: 2:00-4:00 AM',
      lastUpdated: '1 hour ago'
    },
    emergencyContact: {
      phone: '1-800-ADMIN-HELP',
      label: 'Administrative Emergency'
    },
    complianceLinks: [
      {
        id: 'sox',
        label: 'SOX Compliance',
        href: '#',
        icon: <Shield className="w-3 h-3" />
      },
      {
        id: 'financial-policies',
        label: 'Financial Policies',
        href: '#',
        icon: <Briefcase className="w-3 h-3" />
      }
    ]
  }
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    layout: 'expanded',
    logo: <Hospital className="w-8 h-8 text-slate-200" />,
    brandName: 'Night Operations Center',
    tagline: 'Emergency & Critical Care Systems',
    description: 'Specialized systems for emergency departments and critical care units during night shifts.',
    contacts: [
      {
        type: 'phone',
        label: 'Night Shift Supervisor',
        value: '(555) 567-8901',
        href: 'tel:+15555678901'
      }
    ],
    sections: [
      {
        id: 'emergency-systems',
        title: 'Emergency Systems',
        links: [
          { 
            id: 'emergency-dept', 
            label: 'Emergency Department', 
            href: '#',
            icon: <AlertCircle className="w-3 h-3" />
          },
          { 
            id: 'icu-monitoring', 
            label: 'ICU Monitoring', 
            href: '#',
            badge: <Badge variant="destructive" size="sm">Critical</Badge>
          },
          { id: 'trauma-protocols', label: 'Trauma Protocols', href: '#' },
          { id: 'code-team', label: 'Code Team Activation', href: '#' }
        ]
      },
      {
        id: 'night-resources',
        title: 'Night Resources',
        links: [
          { id: 'on-call-directory', label: 'On-Call Directory', href: '#' },
          { id: 'emergency-contacts', label: 'Emergency Contacts', href: '#' },
          { id: 'protocols', label: 'Night Shift Protocols', href: '#' },
          { id: 'backup-systems', label: 'Backup Systems', href: '#' }
        ]
      }
    ],
    socialLinks: [
      {
        id: 'emergency-updates',
        platform: 'Emergency Updates',
        href: '#',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Emergency Updates Channel'
      }
    ],
    showSystemStatus: true,
    systemStatus: {
      status: 'operational',
      message: 'All emergency systems operational',
      lastUpdated: 'Just now'
    },
    emergencyContact: {
      phone: '911',
      label: 'Emergency Services'
    }
  }
};

// System Status Examples
export const MaintenanceMode: Story = {
  args: {
    variant: 'medical',
    layout: 'simple',
    logo: <Hospital className="w-6 h-6 text-blue-600" />,
    brandName: 'EHR System',
    tagline: 'Under Maintenance',
    showSystemStatus: true,
    systemStatus: {
      status: 'maintenance',
      message: 'Scheduled system maintenance in progress',
      lastUpdated: '30 minutes ago'
    },
    emergencyContact: {
      phone: '1-800-SUPPORT',
      label: 'Technical Support'
    },
    complianceLinks: [
      {
        id: 'maintenance-policy',
        label: 'Maintenance Policy',
        href: '#',
        icon: <Clock className="w-3 h-3" />
      }
    ]
  }
};

export const SystemIncident: Story = {
  args: {
    variant: 'medical',
    layout: 'simple',
    logo: <Hospital className="w-6 h-6 text-blue-600" />,
    brandName: 'EHR System',
    tagline: 'Service Alert',
    showSystemStatus: true,
    systemStatus: {
      status: 'incident',
      message: 'Service degradation detected - investigating',
      lastUpdated: '5 minutes ago'
    },
    emergencyContact: {
      phone: '1-800-URGENT',
      label: 'Urgent Support'
    }
  }
};

// Large Healthcare System
export const ComprehensiveHealthcareSystem: Story = {
  args: {
    variant: 'primary',
    layout: 'expanded',
    size: 'lg',
    logo: <Hospital className="w-10 h-10 text-primary-foreground" />,
    brandName: 'Regional Medical Center',
    tagline: 'Excellence in Healthcare Technology',
    description: 'Leading healthcare system serving over 2 million patients across the region with state-of-the-art medical technology and comprehensive care coordination.',
    contacts: [
      {
        type: 'phone',
        label: 'Main Hospital',
        value: '(555) 123-4567',
        href: 'tel:+15551234567'
      },
      {
        type: 'email',
        label: 'Patient Services',
        value: 'patients@regionalmed.com',
        href: 'mailto:patients@regionalmed.com'
      },
      {
        type: 'address',
        label: 'Address',
        value: '1000 Medical Plaza, Healthcare City, HC 54321'
      },
      {
        type: 'website',
        label: 'Patient Portal',
        value: 'portal.regionalmed.com',
        href: 'https://portal.regionalmed.com'
      }
    ],
    sections: [
      {
        id: 'patient-services',
        title: 'Patient Services',
        links: [
          { 
            id: 'patient-portal', 
            label: 'Patient Portal', 
            href: '#',
            icon: <UserCheck className="w-3 h-3" />
          },
          { id: 'appointments', label: 'Schedule Appointment', href: '#' },
          { id: 'medical-records', label: 'Medical Records Request', href: '#' },
          { id: 'billing-support', label: 'Billing Support', href: '#' },
          { id: 'insurance', label: 'Insurance Information', href: '#' }
        ]
      },
      {
        id: 'clinical-departments',
        title: 'Clinical Departments',
        links: [
          { id: 'cardiology', label: 'Cardiology', href: '#' },
          { id: 'oncology', label: 'Oncology', href: '#' },
          { id: 'orthopedics', label: 'Orthopedics', href: '#' },
          { id: 'pediatrics', label: 'Pediatrics', href: '#' },
          { id: 'emergency', label: 'Emergency Medicine', href: '#' }
        ]
      },
      {
        id: 'resources',
        title: 'Resources',
        links: [
          { 
            id: 'health-library', 
            label: 'Health Library', 
            href: '#',
            icon: <BookOpen className="w-3 h-3" />
          },
          { id: 'patient-education', label: 'Patient Education', href: '#' },
          { id: 'support-groups', label: 'Support Groups', href: '#' },
          { id: 'careers', label: 'Careers', href: '#', external: true }
        ]
      },
      {
        id: 'about',
        title: 'About Us',
        links: [
          { id: 'mission', label: 'Mission & Values', href: '#' },
          { id: 'leadership', label: 'Leadership Team', href: '#' },
          { id: 'accreditation', label: 'Accreditation', href: '#' },
          { id: 'quality-awards', label: 'Quality & Awards', href: '#' },
          { id: 'news', label: 'News & Events', href: '#' }
        ]
      }
    ],
    socialLinks: [
      {
        id: 'facebook',
        platform: 'Facebook',
        href: 'https://facebook.com/regionalmed',
        icon: <Facebook className="w-4 h-4" />,
        label: 'Follow us on Facebook'
      },
      {
        id: 'twitter',
        platform: 'Twitter',
        href: 'https://twitter.com/regionalmed',
        icon: <Twitter className="w-4 h-4" />,
        label: 'Follow us on Twitter'
      },
      {
        id: 'linkedin',
        platform: 'LinkedIn',
        href: 'https://linkedin.com/company/regionalmed',
        icon: <Linkedin className="w-4 h-4" />,
        label: 'Follow us on LinkedIn'
      },
      {
        id: 'youtube',
        platform: 'YouTube',
        href: 'https://youtube.com/regionalmed',
        icon: <Youtube className="w-4 h-4" />,
        label: 'Subscribe to our YouTube channel'
      }
    ],
    showSystemStatus: true,
    systemStatus: {
      status: 'operational',
      message: 'All patient services operational',
      lastUpdated: 'Just updated'
    },
    emergencyContact: {
      phone: '911',
      label: 'Medical Emergency'
    },
    complianceLinks: [
      {
        id: 'privacy-policy',
        label: 'Privacy Policy',
        href: '#',
        icon: <Lock className="w-3 h-3" />
      },
      {
        id: 'patient-rights',
        label: 'Patient Rights',
        href: '#',
        icon: <Users className="w-3 h-3" />
      },
      {
        id: 'hipaa-notice',
        label: 'HIPAA Notice',
        href: '#',
        icon: <Shield className="w-3 h-3" />
      },
      {
        id: 'terms-conditions',
        label: 'Terms & Conditions',
        href: '#'
      },
      {
        id: 'accessibility',
        label: 'Accessibility Statement',
        href: '#'
      }
    ]
  }
};