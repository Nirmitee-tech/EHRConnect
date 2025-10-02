import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LogOut, Settings, HelpCircle, User } from "lucide-react";
import { SidebarFooter, SidebarFooterAction } from "./SidebarFooter";

const meta = {
  title: "Molecules/Sidebar/SidebarFooter",
  component: SidebarFooter,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "sidebar",
      values: [
        { name: "sidebar", value: "#ffffff" },
        { name: "dark", value: "#1f2937" },
      ],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SidebarFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultAvatar = (
  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
    <span className="text-sm font-medium text-white">JD</span>
  </div>
);

export const Default: Story = {
  args: {
    avatar: defaultAvatar,
    userName: "John Doe",
    userRole: "Administrator",
    actions: (
      <SidebarFooterAction
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={() => alert('Sign out clicked')}
      />
    ),
  },
};

export const WithoutRole: Story = {
  args: {
    avatar: defaultAvatar,
    userName: "John Doe",
    actions: (
      <SidebarFooterAction
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={() => alert('Sign out clicked')}
      />
    ),
  },
};

export const WithoutActions: Story = {
  args: {
    avatar: defaultAvatar,
    userName: "John Doe",
    userRole: "Administrator",
  },
};

export const WithMultipleActions: Story = {
  args: {
    avatar: defaultAvatar,
    userName: "John Doe",
    userRole: "Administrator",
    actions: (
      <div className="space-y-1">
        <SidebarFooterAction
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          onClick={() => alert('Settings clicked')}
        />
        <SidebarFooterAction
          icon={<HelpCircle className="h-4 w-4" />}
          label="Help"
          onClick={() => alert('Help clicked')}
        />
        <SidebarFooterAction
          icon={<LogOut className="h-4 w-4" />}
          label="Sign out"
          onClick={() => alert('Sign out clicked')}
        />
      </div>
    ),
  },
};

export const MedicalUser: Story = {
  args: {
    avatar: (
      <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
        <span className="text-sm font-medium text-white">DR</span>
      </div>
    ),
    userName: "Dr. Sarah Wilson",
    userRole: "Chief Medical Officer",
    actions: (
      <SidebarFooterAction
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={() => alert('Sign out clicked')}
      />
    ),
  },
};

export const WithImageAvatar: Story = {
  args: {
    avatar: (
      <img
        src="https://i.pravatar.cc/150?img=1"
        alt="User"
        className="h-8 w-8 rounded-full"
      />
    ),
    userName: "Jane Smith",
    userRole: "Senior Developer",
    actions: (
      <SidebarFooterAction
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={() => alert('Sign out clicked')}
      />
    ),
  },
};

export const LongUserName: Story = {
  args: {
    avatar: defaultAvatar,
    userName: "Dr. Christopher Alexander Johnson III",
    userRole: "Chief of Emergency Medicine and Critical Care",
    actions: (
      <SidebarFooterAction
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={() => alert('Sign out clicked')}
      />
    ),
  },
};

// SidebarFooterAction stories
const actionMeta = {
  title: "Molecules/Sidebar/SidebarFooterAction",
  component: SidebarFooterAction,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "sidebar",
      values: [
        { name: "sidebar", value: "#ffffff" },
        { name: "dark", value: "#1f2937" },
      ],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SidebarFooterAction>;

export const ActionDefault: StoryObj<typeof actionMeta> = {
  args: {
    icon: <LogOut className="h-4 w-4" />,
    label: "Sign out",
    onClick: () => alert('Clicked!'),
  },
};

export const ActionWithoutIcon: StoryObj<typeof actionMeta> = {
  args: {
    label: "Settings",
    onClick: () => alert('Clicked!'),
  },
};

export const ActionList: StoryObj<typeof actionMeta> = {
  render: () => (
    <div className="space-y-1 w-64">
      <SidebarFooterAction
        icon={<User className="h-4 w-4" />}
        label="Profile"
        onClick={() => alert('Profile clicked')}
      />
      <SidebarFooterAction
        icon={<Settings className="h-4 w-4" />}
        label="Settings"
        onClick={() => alert('Settings clicked')}
      />
      <SidebarFooterAction
        icon={<HelpCircle className="h-4 w-4" />}
        label="Help & Support"
        onClick={() => alert('Help clicked')}
      />
      <SidebarFooterAction
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={() => alert('Sign out clicked')}
      />
    </div>
  ),
  args: {
    icon: <LogOut className="h-4 w-4" />,
    label: "Sign out",
    onClick: () => {},
  },
};
