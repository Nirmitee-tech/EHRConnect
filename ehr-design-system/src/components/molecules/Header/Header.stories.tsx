import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Bell, HelpCircle, Calculator, Zap, Search } from "lucide-react";
import { Header, HeaderIconButton, HeaderStatusBadge } from "./Header";

const meta = {
  title: "Molecules/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample search component
const SearchComponent = () => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      type="text"
      placeholder="Search..."
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
    />
  </div>
);

// Sample user profile
const UserProfileComponent = () => (
  <div className="flex items-center space-x-2">
    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
      <span className="text-sm font-medium text-white">JD</span>
    </div>
  </div>
);

// Sample action button
const ActionButton = () => (
  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors">
    <Plus className="h-4 w-4" />
    <span className="font-medium">New Patient</span>
  </button>
);

// Sample icon buttons
const IconButtons = () => (
  <div className="flex items-center space-x-1">
    <HeaderIconButton icon={<Bell className="h-4 w-4" />} badge={true} />
    <HeaderIconButton icon={<HelpCircle className="h-4 w-4" />} />
    <HeaderIconButton icon={<Zap className="h-4 w-4" />} />
    <HeaderIconButton icon={<Calculator className="h-4 w-4" />} />
  </div>
);

export const Default: Story = {
  args: {
    title: "Dashboard",
    subtitle: new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }),
    search: <SearchComponent />,
    actions: <ActionButton />,
    iconButtons: <IconButtons />,
    statusBadge: <HeaderStatusBadge label="1/4 Active" variant="success" animated={true} />,
    userProfile: <UserProfileComponent />,
  },
};

export const Minimal: Story = {
  args: {
    title: "Settings",
    userProfile: <UserProfileComponent />,
  },
};

export const WithoutSearch: Story = {
  args: {
    title: "Patients",
    subtitle: "Manage patient records",
    actions: <ActionButton />,
    iconButtons: <IconButtons />,
    userProfile: <UserProfileComponent />,
  },
};

export const WithoutActions: Story = {
  args: {
    title: "Analytics",
    subtitle: "View reports and metrics",
    search: <SearchComponent />,
    iconButtons: <IconButtons />,
    userProfile: <UserProfileComponent />,
  },
};

export const WithStatusBadges: Story = {
  args: {
    title: "System Status",
    statusBadge: (
      <div className="flex items-center gap-2">
        <HeaderStatusBadge label="Online" variant="success" animated={true} />
        <HeaderStatusBadge label="3 Alerts" variant="warning" />
      </div>
    ),
    userProfile: <UserProfileComponent />,
  },
};

export const NotSticky: Story = {
  args: {
    title: "Reports",
    subtitle: "Monthly summary",
    search: <SearchComponent />,
    sticky: false,
    userProfile: <UserProfileComponent />,
  },
  decorators: [
    (Story) => (
      <div className="h-screen overflow-auto">
        <Story />
        <div className="p-8 space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              Content item {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  ],
};

export const MedicalTheme: Story = {
  args: {
    title: "Patient Management",
    subtitle: new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }),
    search: <SearchComponent />,
    actions: (
      <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
        <Plus className="h-4 w-4" />
        <span className="font-medium">New Appointment</span>
      </button>
    ),
    iconButtons: <IconButtons />,
    statusBadge: <HeaderStatusBadge label="24/7 Online" variant="success" animated={true} />,
    userProfile: (
      <div className="flex items-center space-x-2">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">Dr. Sarah Wilson</p>
          <p className="text-xs text-gray-500">Chief Medical Officer</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
          <span className="text-sm font-medium text-white">DR</span>
        </div>
      </div>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Header
        title="Simple Header"
        userProfile={<UserProfileComponent />}
      />
      
      <Header
        title="With Search"
        search={<SearchComponent />}
        userProfile={<UserProfileComponent />}
      />
      
      <Header
        title="With Actions"
        actions={<ActionButton />}
        iconButtons={<IconButtons />}
        userProfile={<UserProfileComponent />}
      />
      
      <Header
        title="Full Header"
        subtitle="Complete example"
        search={<SearchComponent />}
        actions={<ActionButton />}
        iconButtons={<IconButtons />}
        statusBadge={<HeaderStatusBadge label="Active" variant="success" animated />}
        userProfile={<UserProfileComponent />}
      />
    </div>
  ),
};

// HeaderIconButton stories
const iconButtonMeta = {
  title: "Molecules/Header/HeaderIconButton",
  component: HeaderIconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeaderIconButton>;

export const IconButton: StoryObj<typeof iconButtonMeta> = {
  args: {
    icon: <Bell className="h-4 w-4" />,
    badge: false,
  },
};

export const IconButtonWithBadge: StoryObj<typeof iconButtonMeta> = {
  args: {
    icon: <Bell className="h-4 w-4" />,
    badge: true,
  },
};

export const IconButtonGroup: StoryObj<typeof iconButtonMeta> = {
  render: () => (
    <div className="flex items-center space-x-1">
      <HeaderIconButton icon={<Bell className="h-4 w-4" />} badge={true} />
      <HeaderIconButton icon={<HelpCircle className="h-4 w-4" />} />
      <HeaderIconButton icon={<Zap className="h-4 w-4" />} />
      <HeaderIconButton icon={<Calculator className="h-4 w-4" />} />
    </div>
  ),
  args: {
    icon: <Bell className="h-4 w-4" />,
  },
};

// HeaderStatusBadge stories
const statusBadgeMeta = {
  title: "Molecules/Header/HeaderStatusBadge",
  component: HeaderStatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeaderStatusBadge>;

export const StatusBadgeSuccess: StoryObj<typeof statusBadgeMeta> = {
  args: {
    label: "Online",
    variant: "success",
    animated: true,
  },
};

export const StatusBadgeWarning: StoryObj<typeof statusBadgeMeta> = {
  args: {
    label: "3 Warnings",
    variant: "warning",
  },
};

export const StatusBadgeError: StoryObj<typeof statusBadgeMeta> = {
  args: {
    label: "Offline",
    variant: "error",
  },
};

export const StatusBadgeInfo: StoryObj<typeof statusBadgeMeta> = {
  args: {
    label: "Maintenance",
    variant: "info",
  },
};

export const StatusBadgeGroup: StoryObj<typeof statusBadgeMeta> = {
  render: () => (
    <div className="flex items-center gap-2">
      <HeaderStatusBadge label="Online" variant="success" animated={true} />
      <HeaderStatusBadge label="2 Alerts" variant="warning" />
      <HeaderStatusBadge label="Info" variant="info" />
    </div>
  ),
  args: {
    label: "Online",
    variant: "success",
  },
};
