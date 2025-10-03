import type { Meta, StoryObj } from '@storybook/react';
import { 
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuLabel,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent
} from './Menu';
import { 
  User,
  Users,
  Settings,
  LogOut,
  FileText,
  Calendar,
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
  Mail,
  Download,
  Upload,
  Share,
  Copy,
  Edit,
  Trash2,
  Star,
  Bookmark,
  Filter,
  Sort,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';

const meta: Meta<typeof Menu> = {
  title: 'Design System/Molecules/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive dropdown menu component built on Radix UI primitives with support for nested menus, checkboxes, radio groups, and healthcare-specific patterns. Includes keyboard navigation and accessibility features.',
      },
    },
  },
  argTypes: {
    // Note: These are for MenuContent
    variant: {
      control: 'select',
      options: ['default', 'medical', 'clinical', 'administrative', 'destructive'],
      description: 'Visual style variant of the menu'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the menu'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

// Basic Examples
export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem icon={<User />}>
          Profile
        </MenuItem>
        <MenuItem icon={<Settings />} shortcut="⌘,">
          Settings
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon={<LogOut />} variant="destructive">
          Sign Out
        </MenuItem>
      </MenuContent>
    </Menu>
  )
};

export const WithLabels: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Actions Menu</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>My Account</MenuLabel>
        <MenuItem icon={<User />}>Profile</MenuItem>
        <MenuItem icon={<Settings />}>Account Settings</MenuItem>
        <MenuSeparator />
        <MenuLabel>Quick Actions</MenuLabel>
        <MenuItem icon={<FileText />}>New Document</MenuItem>
        <MenuItem icon={<Calendar />}>Schedule Appointment</MenuItem>
        <MenuSeparator />
        <MenuItem icon={<LogOut />} variant="destructive">
          Sign Out
        </MenuItem>
      </MenuContent>
    </Menu>
  )
};

export const WithCheckboxes: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">View Options</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Display Settings</MenuLabel>
        <MenuCheckboxItem checked>
          Show Notifications
        </MenuCheckboxItem>
        <MenuCheckboxItem>
          Enable Dark Mode
        </MenuCheckboxItem>
        <MenuCheckboxItem checked>
          Auto-save Changes
        </MenuCheckboxItem>
        <MenuSeparator />
        <MenuLabel>Data Columns</MenuLabel>
        <MenuCheckboxItem checked icon={<User />}>
          Patient Name
        </MenuCheckboxItem>
        <MenuCheckboxItem checked icon={<Calendar />}>
          Date of Birth
        </MenuCheckboxItem>
        <MenuCheckboxItem icon={<Phone />}>
          Contact Info
        </MenuCheckboxItem>
      </MenuContent>
    </Menu>
  )
};

export const WithRadioGroup: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Sort By</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Sort Options</MenuLabel>
        <MenuRadioGroup defaultValue="name">
          <MenuRadioItem value="name" icon={<User />}>
            Patient Name
          </MenuRadioItem>
          <MenuRadioItem value="date" icon={<Calendar />}>
            Date Added
          </MenuRadioItem>
          <MenuRadioItem value="priority" icon={<AlertCircle />}>
            Priority Level
          </MenuRadioItem>
        </MenuRadioGroup>
        <MenuSeparator />
        <MenuLabel>Order</MenuLabel>
        <MenuRadioGroup defaultValue="asc">
          <MenuRadioItem value="asc">
            Ascending
          </MenuRadioItem>
          <MenuRadioItem value="desc">
            Descending
          </MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
};

export const WithSubmenus: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">File Menu</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem icon={<FileText />} shortcut="⌘N">
          New File
        </MenuItem>
        <MenuItem icon={<Folder />} shortcut="⌘O">
          Open File
        </MenuItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger icon={<Download />}>
            Export
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem icon={<FileText />}>Export as PDF</MenuItem>
            <MenuItem icon={<Share />}>Export as CSV</MenuItem>
            <MenuItem icon={<Database />}>Export as JSON</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<Mail />}>Email Report</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger icon={<Upload />}>
            Import
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem icon={<FileText />}>Import CSV</MenuItem>
            <MenuItem icon={<Database />}>Import JSON</MenuItem>
            <MenuItem icon={<Archive />}>Import Backup</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem icon={<Printer />} shortcut="⌘P">
          Print
        </MenuItem>
      </MenuContent>
    </Menu>
  )
};

// Healthcare Variants
export const Medical: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline" className="text-blue-600 border-blue-200">
          <Stethoscope className="w-4 h-4 mr-2" />
          Patient Actions
        </Button>
      </MenuTrigger>
      <MenuContent variant="medical">
        <MenuLabel variant="medical">Clinical Actions</MenuLabel>
        <MenuItem variant="medical" icon={<UserCheck />}>
          Admit Patient
        </MenuItem>
        <MenuItem variant="medical" icon={<Clipboard />}>
          Update Care Plan
        </MenuItem>
        <MenuItem variant="medical" icon={<TestTube />}>
          Order Lab Tests
        </MenuItem>
        <MenuItem variant="medical" icon={<Pill />}>
          Prescribe Medication
        </MenuItem>
        <MenuSeparator variant="medical" />
        <MenuLabel variant="medical">Documentation</MenuLabel>
        <MenuItem variant="medical" icon={<FileText />}>
          Progress Notes
        </MenuItem>
        <MenuItem variant="medical" icon={<Activity />}>
          Vital Signs
        </MenuItem>
        <MenuSeparator variant="medical" />
        <MenuItem variant="medical" icon={<CheckCircle2 />}>
          Discharge Patient
        </MenuItem>
      </MenuContent>
    </Menu>
  )
};

export const Clinical: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline" className="text-green-600 border-green-200">
          <Heart className="w-4 h-4 mr-2" />
          Nursing Tasks
        </Button>
      </MenuTrigger>
      <MenuContent variant="clinical">
        <MenuLabel variant="clinical">Patient Care</MenuLabel>
        <MenuItem variant="clinical" icon={<Pill />}>
          Medication Administration
          <Badge variant="warning" size="sm" className="ml-2">3 Due</Badge>
        </MenuItem>
        <MenuItem variant="clinical" icon={<Activity />}>
          Vital Signs Check
        </MenuItem>
        <MenuItem variant="clinical" icon={<Heart />}>
          Assessment & Monitoring
        </MenuItem>
        <MenuSeparator variant="clinical" />
        <MenuLabel variant="clinical">Care Protocols</MenuLabel>
        <MenuSub>
          <MenuSubTrigger variant="clinical" icon={<Syringe />}>
            IV Management
          </MenuSubTrigger>
          <MenuSubContent variant="clinical">
            <MenuItem variant="clinical">IV Site Assessment</MenuItem>
            <MenuItem variant="clinical">Fluid Balance</MenuItem>
            <MenuItem variant="clinical">Line Maintenance</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger variant="clinical" icon={<Shield />}>
            Infection Control
          </MenuSubTrigger>
          <MenuSubContent variant="clinical">
            <MenuItem variant="clinical">Hand Hygiene</MenuItem>
            <MenuItem variant="clinical">PPE Protocols</MenuItem>
            <MenuItem variant="clinical">Isolation Precautions</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator variant="clinical" />
        <MenuItem variant="clinical" icon={<AlertCircle />}>
          Report Incident
        </MenuItem>
      </MenuContent>
    </Menu>
  )
};

export const Administrative: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline" className="text-purple-600 border-purple-200">
          <Building2 className="w-4 h-4 mr-2" />
          Admin Panel
        </Button>
      </MenuTrigger>
      <MenuContent variant="administrative">
        <MenuLabel variant="administrative">Financial Management</MenuLabel>
        <MenuItem variant="administrative" icon={<CreditCard />}>
          Patient Billing
        </MenuItem>
        <MenuItem variant="administrative" icon={<Shield />}>
          Insurance Claims
          <Badge variant="outline" size="sm" className="ml-2">24 Pending</Badge>
        </MenuItem>
        <MenuItem variant="administrative" icon={<PieChart />}>
          Revenue Reports
        </MenuItem>
        <MenuSeparator variant="administrative" />
        <MenuLabel variant="administrative">Operations</MenuLabel>
        <MenuItem variant="administrative" icon={<Calendar />}>
          Staff Scheduling
        </MenuItem>
        <MenuItem variant="administrative" icon={<Hospital />}>
          Bed Management
        </MenuItem>
        <MenuItem variant="administrative" icon={<BarChart3 />}>
          Department Metrics
        </MenuItem>
        <MenuSeparator variant="administrative" />
        <MenuLabel variant="administrative">System Administration</MenuLabel>
        <MenuSub>
          <MenuSubTrigger variant="administrative" icon={<Users />}>
            User Management
          </MenuSubTrigger>
          <MenuSubContent variant="administrative">
            <MenuItem variant="administrative">Add New User</MenuItem>
            <MenuItem variant="administrative">Manage Roles</MenuItem>
            <MenuItem variant="administrative">Access Permissions</MenuItem>
            <MenuSeparator variant="administrative" />
            <MenuItem variant="administrative">Audit Logs</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem variant="administrative" icon={<Lock />}>
          Security Settings
        </MenuItem>
      </MenuContent>
    </Menu>
  )
};

// Size Variants
export const SmallSize: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </MenuTrigger>
      <MenuContent size="sm">
        <MenuItem icon={<Eye />}>View</MenuItem>
        <MenuItem icon={<Edit />}>Edit</MenuItem>
        <MenuItem icon={<Copy />}>Copy</MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive" icon={<Trash2 />}>Delete</MenuItem>
      </MenuContent>
    </Menu>
  )
};

export const LargeSize: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline" size="lg">
          Dashboard Options
        </Button>
      </MenuTrigger>
      <MenuContent size="lg">
        <MenuLabel>Dashboard Configuration</MenuLabel>
        <MenuItem icon={<BarChart3 />}>
          Analytics Overview
        </MenuItem>
        <MenuItem icon={<TrendingUp />}>
          Performance Metrics
        </MenuItem>
        <MenuItem icon={<Users />}>
          Patient Statistics
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon={<Settings />}>
          Customize Layout
        </MenuItem>
        <MenuItem icon={<RefreshCw />}>
          Refresh Data
        </MenuItem>
      </MenuContent>
    </Menu>
  )
};

// Healthcare Use Cases
export const PatientContextMenu: Story = {
  render: () => (
    <div className="p-6 bg-blue-50 rounded-lg">
      <div className="bg-white p-4 rounded border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">John Doe</h4>
              <p className="text-sm text-gray-500">MRN: 1234567</p>
            </div>
          </div>
          <Menu>
            <MenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </MenuTrigger>
            <MenuContent variant="medical">
              <MenuLabel variant="medical">Patient: John Doe</MenuLabel>
              <MenuItem variant="medical" icon={<Eye />}>
                View Full Record
              </MenuItem>
              <MenuItem variant="medical" icon={<Edit />}>
                Edit Demographics
              </MenuItem>
              <MenuSeparator variant="medical" />
              <MenuLabel variant="medical">Clinical Actions</MenuLabel>
              <MenuItem variant="medical" icon={<Calendar />}>
                Schedule Appointment
              </MenuItem>
              <MenuItem variant="medical" icon={<FileText />}>
                Add Progress Note
              </MenuItem>
              <MenuItem variant="medical" icon={<TestTube />}>
                Order Lab Work
              </MenuItem>
              <MenuItem variant="medical" icon={<Pill />}>
                Prescribe Medication
              </MenuItem>
              <MenuSeparator variant="medical" />
              <MenuLabel variant="medical">Communication</MenuLabel>
              <MenuItem variant="medical" icon={<Phone />}>
                Call Patient
              </MenuItem>
              <MenuItem variant="medical" icon={<Mail />}>
                Send Message
              </MenuItem>
              <MenuSeparator variant="medical" />
              <MenuItem variant="medical" icon={<Share />}>
                Share Record
              </MenuItem>
              <MenuItem variant="medical" icon={<Archive />}>
                Archive Patient
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>
    </div>
  )
};

export const EmergencyDepartmentMenu: Story = {
  render: () => (
    <div className="p-6 bg-red-50 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-red-800">Emergency Department</h3>
        <p className="text-sm text-red-600">Quick access to emergency protocols</p>
      </div>
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline" className="text-red-600 border-red-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            Emergency Protocols
          </Button>
        </MenuTrigger>
        <MenuContent variant="destructive" size="lg">
          <MenuLabel variant="destructive">Immediate Actions</MenuLabel>
          <MenuItem variant="destructive" icon={<Heart />}>
            Cardiac Arrest Protocol
          </MenuItem>
          <MenuItem variant="destructive" icon={<Activity />}>
            Stroke Alert
          </MenuItem>
          <MenuItem variant="destructive" icon={<AlertCircle />}>
            Trauma Team Activation
          </MenuItem>
          <MenuSeparator variant="destructive" />
          <MenuLabel variant="destructive">Triage Levels</MenuLabel>
          <MenuRadioGroup defaultValue="level2">
            <MenuRadioItem value="level1" variant="destructive">
              Level 1 - Resuscitation
            </MenuRadioItem>
            <MenuRadioItem value="level2" variant="destructive">
              Level 2 - Emergent
            </MenuRadioItem>
            <MenuRadioItem value="level3" variant="destructive">
              Level 3 - Urgent
            </MenuRadioItem>
            <MenuRadioItem value="level4" variant="destructive">
              Level 4 - Less Urgent
            </MenuRadioItem>
            <MenuRadioItem value="level5" variant="destructive">
              Level 5 - Non-urgent
            </MenuRadioItem>
          </MenuRadioGroup>
          <MenuSeparator variant="destructive" />
          <MenuLabel variant="destructive">Resources</MenuLabel>
          <MenuItem variant="destructive" icon={<Users />}>
            Call Additional Staff
          </MenuItem>
          <MenuItem variant="destructive" icon={<Phone />}>
            Contact Specialist
          </MenuItem>
          <MenuItem variant="destructive" icon={<Hospital />}>
            Request ICU Bed
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
};

export const MedicationManagementMenu: Story = {
  render: () => (
    <div className="p-6 bg-green-50 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-green-800">Medication Management</h3>
        <p className="text-sm text-green-600">Comprehensive medication tools</p>
      </div>
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline" className="text-green-600 border-green-200">
            <Pill className="w-4 h-4 mr-2" />
            Medication Tools
          </Button>
        </MenuTrigger>
        <MenuContent variant="clinical">
          <MenuLabel variant="clinical">Medication Orders</MenuLabel>
          <MenuItem variant="clinical" icon={<Plus />}>
            New Prescription
          </MenuItem>
          <MenuItem variant="clinical" icon={<RefreshCw />}>
            Refill Request
          </MenuItem>
          <MenuItem variant="clinical" icon={<Edit />}>
            Modify Dosage
          </MenuItem>
          <MenuItem variant="clinical" icon={<AlertCircle />}>
            Discontinue Medication
          </MenuItem>
          <MenuSeparator variant="clinical" />
          <MenuLabel variant="clinical">Administration</MenuLabel>
          <MenuItem variant="clinical" icon={<CheckCircle2 />}>
            Mark as Given
          </MenuItem>
          <MenuItem variant="clinical" icon={<Clock />}>
            Schedule Dose
          </MenuItem>
          <MenuItem variant="clinical" icon={<AlertCircle />}>
            Document Refusal
          </MenuItem>
          <MenuSeparator variant="clinical" />
          <MenuLabel variant="clinical">Safety Checks</MenuLabel>
          <MenuItem variant="clinical" icon={<Shield />}>
            Drug Interactions
          </MenuItem>
          <MenuItem variant="clinical" icon={<Eye />}>
            Allergy Alerts
          </MenuItem>
          <MenuSub>
            <MenuSubTrigger variant="clinical" icon={<Database />}>
              Medication History
            </MenuSubTrigger>
            <MenuSubContent variant="clinical">
              <MenuItem variant="clinical">Current Medications</MenuItem>
              <MenuItem variant="clinical">Previous Prescriptions</MenuItem>
              <MenuItem variant="clinical">Adherence History</MenuItem>
              <MenuSeparator variant="clinical" />
              <MenuItem variant="clinical">Pharmacy Records</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    </div>
  )
};

export const BillingAndClaimsMenu: Story = {
  render: () => (
    <div className="p-6 bg-purple-50 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-purple-800">Billing & Claims</h3>
        <p className="text-sm text-purple-600">Financial management tools</p>
      </div>
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline" className="text-purple-600 border-purple-200">
            <DollarSign className="w-4 h-4 mr-2" />
            Financial Actions
          </Button>
        </MenuTrigger>
        <MenuContent variant="administrative" size="lg">
          <MenuLabel variant="administrative">Claims Management</MenuLabel>
          <MenuItem variant="administrative" icon={<Plus />}>
            Submit New Claim
          </MenuItem>
          <MenuItem variant="administrative" icon={<Eye />}>
            Review Pending Claims
            <Badge variant="warning" size="sm" className="ml-2">42</Badge>
          </MenuItem>
          <MenuItem variant="administrative" icon={<RefreshCw />}>
            Resubmit Denied Claims
            <Badge variant="destructive" size="sm" className="ml-2">8</Badge>
          </MenuItem>
          <MenuSeparator variant="administrative" />
          <MenuLabel variant="administrative">Patient Billing</MenuLabel>
          <MenuItem variant="administrative" icon={<CreditCard />}>
            Generate Invoice
          </MenuItem>
          <MenuItem variant="administrative" icon={<DollarSign />}>
            Process Payment
          </MenuItem>
          <MenuItem variant="administrative" icon={<PieChart />}>
            Payment Plans
          </MenuItem>
          <MenuSeparator variant="administrative" />
          <MenuLabel variant="administrative">Reports</MenuLabel>
          <MenuSub>
            <MenuSubTrigger variant="administrative" icon={<BarChart3 />}>
              Financial Reports
            </MenuSubTrigger>
            <MenuSubContent variant="administrative">
              <MenuItem variant="administrative">Daily Revenue</MenuItem>
              <MenuItem variant="administrative">Monthly Summary</MenuItem>
              <MenuItem variant="administrative">Outstanding Balances</MenuItem>
              <MenuSeparator variant="administrative" />
              <MenuItem variant="administrative">Insurance Analysis</MenuItem>
              <MenuItem variant="administrative">Denial Trends</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem variant="administrative" icon={<TrendingUp />}>
            Performance Metrics
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
};