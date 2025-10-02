import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Home, Users, Settings, Hospital, ChevronDown } from "lucide-react";
import { SidebarNavItem, SidebarNavSubItem } from "./SidebarNavItem";

const meta = {
  title: "Molecules/Sidebar/SidebarNavItem",
  component: SidebarNavItem,
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
  argTypes: {
    isActive: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SidebarNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    title: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    isActive: true,
  },
};

export const WithIcon: Story = {
  args: {
    title: "Users",
    icon: <Users className="h-5 w-5" />,
    isActive: false,
  },
};

export const WithoutIcon: Story = {
  args: {
    title: "Settings",
    isActive: false,
  },
};

export const WithChildren: Story = {
  args: {
    title: "Patients",
    icon: <Hospital className="h-5 w-5" />,
    isActive: false,
    children: (
      <>
        <SidebarNavSubItem
          title="All Patients"
          icon={<Hospital className="h-4 w-4" />}
          isActive={false}
        />
        <SidebarNavSubItem
          title="Add Patient"
          icon={<Hospital className="h-4 w-4" />}
          isActive={false}
        />
        <SidebarNavSubItem
          title="Emergency"
          icon={<Hospital className="h-4 w-4" />}
          isActive={true}
        />
      </>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    return (
      <div className="space-y-2 w-64">
        <SidebarNavItem
          title={`Clicked ${count} times`}
          icon={<Home className="h-5 w-5" />}
          onClick={() => setCount(count + 1)}
        />
        <SidebarNavItem
          title="With Children"
          icon={<Hospital className="h-5 w-5" />}
        >
          <SidebarNavSubItem
            title="Sub Item 1"
            icon={<Hospital className="h-4 w-4" />}
          />
          <SidebarNavSubItem
            title="Sub Item 2"
            icon={<Hospital className="h-4 w-4" />}
          />
        </SidebarNavItem>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-2 w-64">
      <SidebarNavItem
        title="Active Item"
        icon={<Home className="h-5 w-5" />}
        isActive={true}
      />
      <SidebarNavItem
        title="Inactive Item"
        icon={<Users className="h-5 w-5" />}
        isActive={false}
      />
      <SidebarNavItem
        title="With Children"
        icon={<Hospital className="h-5 w-5" />}
      >
        <SidebarNavSubItem
          title="Active Sub Item"
          icon={<Hospital className="h-4 w-4" />}
          isActive={true}
        />
        <SidebarNavSubItem
          title="Inactive Sub Item"
          icon={<Hospital className="h-4 w-4" />}
          isActive={false}
        />
      </SidebarNavItem>
      <SidebarNavItem
        title="No Icon"
        isActive={false}
      />
    </div>
  ),
};

// SidebarNavSubItem stories
const subItemMeta = {
  title: "Molecules/Sidebar/SidebarNavSubItem",
  component: SidebarNavSubItem,
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
  argTypes: {
    isActive: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SidebarNavSubItem>;

export const SubItemDefault: StoryObj<typeof subItemMeta> = {
  args: {
    title: "All Patients",
    icon: <Hospital className="h-4 w-4" />,
    isActive: false,
  },
};

export const SubItemActive: StoryObj<typeof subItemMeta> = {
  args: {
    title: "All Patients",
    icon: <Hospital className="h-4 w-4" />,
    isActive: true,
  },
};

export const SubItemWithoutIcon: StoryObj<typeof subItemMeta> = {
  args: {
    title: "Settings",
    isActive: false,
  },
};

export const SubItemList: StoryObj<typeof subItemMeta> = {
  render: () => (
    <div className="space-y-1 w-64 ml-6">
      <SidebarNavSubItem
        title="All Items"
        icon={<Hospital className="h-4 w-4" />}
        isActive={false}
      />
      <SidebarNavSubItem
        title="Add Item"
        icon={<Hospital className="h-4 w-4" />}
        isActive={true}
      />
      <SidebarNavSubItem
        title="Settings"
        icon={<Settings className="h-4 w-4" />}
        isActive={false}
      />
    </div>
  ),
};
