import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  UserCheck,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Banknote,
  Package,
  Cpu,
  FileText,
  HelpCircle,
  Shield,
  ScrollText,
  DollarSign,
  Receipt,
  Send,
  CheckCircle,
  BarChart3,
  Database,
  Building2,
  Code,
  FileCode,
  Settings,
  Activity,
  Plug,
  Bed,
  UserPlus,
  Map,
  BedDouble,
  ArrowRightLeft
} from 'lucide-react';
import { NavSection, PageInfo } from '@/types/navigation';

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
  },
  {
    title: 'CLINIC',
    items: [
      { name: 'Appointments', href: '/appointments', icon: Calendar },
      { name: 'Patient Flow', href: '/patient-flow', icon: ArrowRightLeft },
      { name: 'Encounters', href: '/encounters', icon: Activity },
      { name: 'Patients', href: '/patients', icon: Users },
      {
        name: 'Bed Management',
        href: '/bed-management',
        icon: Bed,
        children: [
          { name: 'Dashboard', href: '/bed-management', icon: LayoutDashboard },
          { name: 'Admit Patient', href: '/bed-management/admit', icon: UserPlus },
          { name: 'Wards', href: '/bed-management/wards', icon: Building2 },
          { name: 'Beds', href: '/bed-management/beds', icon: BedDouble },
          { name: 'Bed Status Map', href: '/bed-management/map', icon: Map },
          { name: 'Reports', href: '/bed-management/reports', icon: BarChart3 }
        ]
      },
      { name: 'Treatments', href: '/treatments', icon: Stethoscope },
      { name: 'Staff List', href: '/staff', icon: UserCheck }
    ]
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Accounts', href: '/accounts', icon: CreditCard },
      { name: 'Sales', href: '/sales', icon: TrendingUp },
      { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
      { name: 'Payment Method', href: '/payment-methods', icon: Banknote }
    ]
  },
  {
    title: 'BILLING & INSURANCE',
    items: [
      {
        name: 'Billing Dashboard',
        href: '/billing',
        icon: DollarSign
      },
      {
        name: 'Superbills',
        href: '/billing/superbills',
        icon: Receipt,
        children: [
          { name: 'All Superbills', href: '/billing/superbills', icon: FileText },
          { name: 'Create Superbill', href: '/billing/superbills/new', icon: Receipt }
        ]
      },
      {
        name: 'Claims',
        href: '/billing/claims',
        icon: Send,
        children: [
          { name: 'All Claims', href: '/billing/claims', icon: FileText },
          { name: 'Create Claim', href: '/billing/claims/new', icon: Send }
        ]
      },
      {
        name: 'Eligibility',
        href: '/billing/eligibility',
        icon: CheckCircle
      },
      {
        name: 'Prior Authorization',
        href: '/billing/prior-auth',
        icon: FileText,
        children: [
          { name: 'All Authorizations', href: '/billing/prior-auth', icon: FileText },
          { name: 'Submit Authorization', href: '/billing/prior-auth/new', icon: Send }
        ]
      },
      {
        name: 'Remittance (ERA)',
        href: '/billing/remittance',
        icon: Receipt
      },
      {
        name: 'Reports & Analytics',
        href: '/billing/reports',
        icon: BarChart3
      },
      {
        name: 'Masters',
        href: '/billing/masters',
        icon: Database,
        children: [
          { name: 'Providers', href: '/billing/masters/providers', icon: UserCheck },
          { name: 'Payers', href: '/billing/masters/payers', icon: Building2 },
          { name: 'Medical Codes', href: '/billing/masters/codes', icon: Code }
        ]
      }
    ]
  },
  {
    title: 'PHYSICAL ASSET',
    items: [
      { name: 'Inventory', href: '/inventory', icon: Package },
      { name: 'Peripherals', href: '/peripherals', icon: Cpu }
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { name: 'User Management', href: '/users', icon: Users },
      { name: 'Roles & Permissions', href: '/settings/roles', icon: Shield },
      { name: 'Integrations', href: '/integrations', icon: Plug },
      { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
      { name: 'Settings', href: '/settings', icon: Settings }
    ]
  },
  {
    title: 'RCM',
    items: [
      { name: 'Code Sets', href: '/rcm/codes', icon: FileCode }
    ]
  },
  {
    title: 'REPORTS & ANALYTICS',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 }
    ]
  },
  {
    items: [
      { name: 'Customer Support', href: '/support', icon: HelpCircle }
    ]
  }
];

const PAGE_CONFIG: Record<string, PageInfo> = {
  dashboard: { title: 'Dashboard' },
  patients: {
    title: 'Patients',
    actionButton: { label: 'Add Patient', href: '/patients/new' }
  },
  staff: {
    title: 'Staff List',
    actionButton: { label: 'Add Doctor' }
  },
  'bed-management': {
    title: 'Bed Management',
    actionButton: { label: 'Admit Patient', href: '/bed-management/admit' }
  },
  treatments: { title: 'Treatments' },
  appointments: {
    title: 'Appointments',
    actionButton: { label: 'New Appointment', href: '/appointments/new' }
  },
  'patient-flow': { title: 'Patient Flow Board' },
  accounts: { title: 'Accounts' },
  sales: { title: 'Sales' },
  purchases: { title: 'Purchases' },
  'payment-methods': { title: 'Payment Methods' },
  inventory: {
    title: 'Inventory',
    actionButton: { label: 'New Item', href: '/inventory' }
  },
  peripherals: { title: 'Peripherals' },
  reports: { title: 'Reports' },
  support: { title: 'Customer Support' },
  admin: { title: 'Administration' },
  rcm: { title: 'Revenue Cycle Management' }
};

const ADMIN_PAGES: Record<string, string> = {
  facilities: 'Facilities Management',
  users: 'User Management'
};

export const getPageInfo = (pathname: string): PageInfo => {
  const segments = pathname.replace(/^\//, '').split('/');
  const [firstSegment, secondSegment, thirdSegment] = segments;

  if (firstSegment === 'patients') {
    if (secondSegment === 'new') {
      return { title: 'Add New Patient' };
    }
    if (secondSegment && thirdSegment === 'edit') {
      return { title: 'Edit Patient' };
    }
    if (secondSegment && !thirdSegment) {
      return { title: 'Patient Details', actionButton: { label: 'Edit Patient' } };
    }
  }

  if (firstSegment === 'admin' && secondSegment) {
    return { title: ADMIN_PAGES[secondSegment] || 'Administration' };
  }

  if (firstSegment === 'rcm') {
    if (secondSegment === 'codes') {
      return { title: 'Code Set Management', actionButton: { label: 'New Code' } };
    }

    return PAGE_CONFIG[firstSegment];
  }

  return PAGE_CONFIG[firstSegment] || { title: 'Dashboard' };
};
