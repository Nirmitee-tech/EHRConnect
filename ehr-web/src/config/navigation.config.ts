import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Package as PackageIcon,
  FileText,
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
  MapPin,
  BedDouble,
  ArrowRightLeft,
  ClipboardList,
  Puzzle,
  Globe,
  CheckSquare,
  Zap,
  Variable
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
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
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
      { name: 'Staff List', href: '/staff', icon: UserCheck }
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
      { name: 'Inventory', href: '/inventory', icon: PackageIcon }
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { name: 'Team Management', href: '/team-management', icon: Users },
      { name: 'User Management', href: '/users', icon: UserCheck },
      { name: 'Locations', href: '/settings/locations', icon: MapPin },
      { name: 'Roles & Permissions', href: '/roles', icon: Shield },
      { name: 'Forms Builder', href: '/forms', icon: ClipboardList },
      {
        name: 'Rule Engine',
        href: '/rules',
        icon: Zap,
        children: [
          { name: 'Rules', href: '/rules', icon: Zap },
          { name: 'Variables', href: '/rules/variables', icon: Variable }
        ]
      },
      { name: 'Specialty Packs', href: '/admin/specialties', icon: PackageIcon },
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
    title: 'ADD-ONS & EXTENSIONS',
    items: [
      { name: 'Country Config', href: '/admin/settings/country', icon: Globe },
      { name: 'Integrations', href: '/integrations', icon: Plug }
    ]
  }
];

const PAGE_CONFIG: Record<string, PageInfo> = {
  dashboard: { title: 'Dashboard' },
  patients: {
    title: 'Patients',
    // actionButton: { label: 'Add Patient', href: '/patients/new' }
  },
  'team-management': {
    title: 'Team Management',
    // actionButton: { label: 'Invite Member', href: '/team-management' }
  },
  staff: {
    title: 'Staff List'
  },
  'bed-management': {
    title: 'Bed Management',
    // actionButton: { label: 'Admit Patient', href: '/bed-management/admit' }
  },
  appointments: {
    title: 'Appointments',
    // actionButton: { label: 'New Appointment', href: '/appointments/new' }
  },
  tasks: {
    title: 'Tasks',
    // actionButton: { label: 'Create Task', href: '/tasks' }
  },
  'patient-flow': { title: 'Patient Flow Board' },
  rules: {
    title: 'Rule Engine',
    // actionButton: { label: 'Create Rule', href: '/rules/new' }
  },
  inventory: {
    title: 'Inventory',
    // actionButton: { label: 'New Item', href: '/inventory' }
  },
  locations: {
    title: 'Locations',
    // actionButton: { label: 'Add Location', href: '/settings/locations' }
  },
  reports: { title: 'Reports' },
  admin: { title: 'Administration' },
  rcm: { title: 'Revenue Cycle Management' }
};

const ADMIN_PAGES: Record<string, string> = {
  facilities: 'Facilities Management',
  users: 'User Management',
  'team-management': 'Team Management',
  specialties: 'Specialty Pack Management'
};

interface RouteConfig extends PageInfo {
  pattern?: RegExp;
}

const DYNAMIC_ROUTES: RouteConfig[] = [
  {
    pattern: /^\/patients\/new$/,
    title: 'Add New Patient'
  },
  {
    pattern: /^\/patients\/[^/]+\/edit$/,
    title: 'Edit Patient'
  },
  {
    pattern: /^\/patients\/[^/]+$/,
    title: 'Patient Details',
    actionButton: { label: 'Edit Patient' }
  },
  {
    pattern: /^\/settings\/locations$/,
    title: 'Locations',
    actionButton: { label: 'Add Location', href: '/settings/locations' }
  },
  {
    pattern: /^\/settings\/appearance$/,
    title: 'Appearance Settings',
    features: { save: true, preview: true, reset: true }
  },
  {
    pattern: /^\/admin\/([^/]+)$/,
    title: 'Administration' // Handled dynamically below
  },
  {
    pattern: /^\/rcm\/codes$/,
    title: 'Code Set Management',
    actionButton: { label: 'New Code' }
  }
];

export const getPageInfo = (pathname: string): PageInfo => {
  const cleanPath = pathname.split('?')[0];

  // Try dynamic routes first
  for (const route of DYNAMIC_ROUTES) {
    if (route.pattern && route.pattern.test(cleanPath)) {
      if (cleanPath.startsWith('/admin/')) {
        const adminPage = cleanPath.split('/')[2];
        return { title: ADMIN_PAGES[adminPage] || 'Administration' };
      }
      return route;
    }
  }

  // Fallback to static config
  const segments = cleanPath.replace(/^\//, '').split('/');
  const firstSegment = segments[0];

  return PAGE_CONFIG[firstSegment] || { title: 'Dashboard' };
};

