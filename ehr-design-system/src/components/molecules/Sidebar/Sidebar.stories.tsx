import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Home,
  Users,
  Settings,
  FileText,
  Calendar,
  Activity,
  LogOut,
  Hospital,
  Stethoscope,
  BarChart3
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarNavItem, SidebarNavSubItem } from "./SidebarNavItem";
import { SidebarFooter, SidebarFooterAction } from "./SidebarFooter";

const meta = {
  title: "Molecules/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample navigation content
const basicNavigation = (
  <>
    <SidebarNavItem
      title="Dashboard"
      icon={<Home className="h-5 w-5" />}
      isActive={true}
    />
    <SidebarNavItem
      title="Users"
      icon={<Users className="h-5 w-5" />}
    />
    <SidebarNavItem
      title="Settings"
      icon={<Settings className="h-5 w-5" />}
    />
  </>
);

// Navigation with expandable items
const expandableNavigation = (
  <>
    <SidebarNavItem
      title="Dashboard"
      icon={<Home className="h-5 w-5" />}
      isActive={true}
    />
    <SidebarNavItem
      title="Patients"
      icon={<Hospital className="h-5 w-5" />}
    >
      <SidebarNavSubItem
        title="All Patients"
        icon={<Hospital className="h-4 w-4" />}
      />
      <SidebarNavSubItem
        title="Add Patient"
        icon={<Hospital className="h-4 w-4" />}
      />
    </SidebarNavItem>
    <SidebarNavItem
      title="Practitioners"
      icon={<Stethoscope className="h-5 w-5" />}
    >
      <SidebarNavSubItem
        title="All Practitioners"
        icon={<Stethoscope className="h-4 w-4" />}
      />
      <SidebarNavSubItem
        title="Add Practitioner"
        icon={<Stethoscope className="h-4 w-4" />}
      />
    </SidebarNavItem>
    <SidebarNavItem
      title="Appointments"
      icon={<Calendar className="h-5 w-5" />}
    />
    <SidebarNavItem
      title="Reports"
      icon={<BarChart3 className="h-5 w-5" />}
    />
    <SidebarNavItem
      title="Settings"
      icon={<Settings className="h-5 w-5" />}
    />
  </>
);

// User avatar
const userAvatar = (
  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
    <span className="text-sm font-medium text-white">JD</span>
  </div>
);

// Basic footer
const basicFooter = (
  <SidebarFooter
    avatar={userAvatar}
    userName="John Doe"
    userRole="Administrator"
    actions={
      <SidebarFooterAction
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={() => alert('Sign out clicked')}
      />
    }
  />
);

// Top bar content
const topBarContent = (
  <div className="flex items-center justify-between flex-1">
    <div className="flex items-center space-x-4">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Welcome, John Doe
      </div>
    </div>
  </div>
);

// Sample page content
const sampleContent = (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to the Dashboard
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        This is sample page content that would appear in the main area.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Card {i}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Sample card content
          </p>
        </div>
      ))}
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-3 text-sm">
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Activity item {i}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    logo: <Activity className="h-8 w-8 text-blue-600" />,
    brandName: "EHR Connect",
    navigation: basicNavigation,
    footer: basicFooter,
    topBar: topBarContent,
    children: sampleContent,
  },
};

export const WithExpandableNavigation: Story = {
  args: {
    logo: <Activity className="h-8 w-8 text-blue-600" />,
    brandName: "EHR Connect",
    navigation: expandableNavigation,
    footer: basicFooter,
    topBar: topBarContent,
    children: sampleContent,
  },
};

export const WithoutFooter: Story = {
  args: {
    logo: <Activity className="h-8 w-8 text-blue-600" />,
    brandName: "EHR Connect",
    navigation: basicNavigation,
    topBar: topBarContent,
    children: sampleContent,
  },
};

export const WithoutTopBar: Story = {
  args: {
    logo: <Activity className="h-8 w-8 text-blue-600" />,
    brandName: "EHR Connect",
    navigation: basicNavigation,
    footer: basicFooter,
    children: sampleContent,
  },
};

export const MinimalSetup: Story = {
  args: {
    logo: <Activity className="h-8 w-8 text-blue-600" />,
    brandName: "My App",
    navigation: (
      <>
        <SidebarNavItem
          title="Home"
          icon={<Home className="h-5 w-5" />}
          isActive={true}
        />
        <SidebarNavItem
          title="Documents"
          icon={<FileText className="h-5 w-5" />}
        />
      </>
    ),
    children: (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Minimal Sidebar</h1>
        <p className="mt-4 text-gray-600">
          This shows a minimal sidebar setup without footer or topbar.
        </p>
      </div>
    ),
  },
};

export const MedicalTheme: Story = {
  args: {
    logo: <Activity className="h-8 w-8 text-blue-600" />,
    brandName: "HealthCare System",
    navigation: (
      <>
        <SidebarNavItem
          title="Dashboard"
          icon={<Home className="h-5 w-5" />}
          isActive={true}
        />
        <SidebarNavItem
          title="Patients"
          icon={<Hospital className="h-5 w-5" />}
        >
          <SidebarNavSubItem
            title="All Patients"
            icon={<Hospital className="h-4 w-4" />}
          />
          <SidebarNavSubItem
            title="New Patient"
            icon={<Hospital className="h-4 w-4" />}
          />
          <SidebarNavSubItem
            title="Emergency"
            icon={<Hospital className="h-4 w-4" />}
          />
        </SidebarNavItem>
        <SidebarNavItem
          title="Medical Staff"
          icon={<Stethoscope className="h-5 w-5" />}
        />
        <SidebarNavItem
          title="Appointments"
          icon={<Calendar className="h-5 w-5" />}
        />
        <SidebarNavItem
          title="Medical Records"
          icon={<FileText className="h-5 w-5" />}
        />
        <SidebarNavItem
          title="Analytics"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </>
    ),
    footer: (
      <SidebarFooter
        avatar={
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">DR</span>
          </div>
        }
        userName="Dr. Sarah Wilson"
        userRole="Chief Medical Officer"
        actions={
          <SidebarFooterAction
            icon={<LogOut className="h-4 w-4" />}
            label="Sign out"
            onClick={() => alert('Sign out clicked')}
          />
        }
      />
    ),
    topBar: (
      <div className="flex items-center justify-between flex-1">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Patient Management System
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Online
          </span>
        </div>
      </div>
    ),
    children: (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Medical Dashboard
          </h2>
          <p className="text-blue-700 dark:text-blue-300">
            Welcome to the Healthcare Management System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Patients</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,234</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">45</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Staff</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">89</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Emergency Cases</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">3</div>
          </div>
        </div>
      </div>
    ),
  },
};
