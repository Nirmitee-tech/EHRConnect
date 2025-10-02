import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "danger", "info", "medical"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default",
  },
};

export const Medical: Story = {
  args: {
    children: "Critical",
    variant: "medical",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};

export const HealthcareStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="medical">Critical</Badge>
      <Badge variant="success">Stable</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Emergency</Badge>
      <Badge variant="info">Information</Badge>
    </div>
  ),
};

export const PatientStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Active Patient:</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Discharged:</span>
        <Badge variant="outline">Discharged</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Admitted:</span>
        <Badge variant="info">Admitted</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Critical:</span>
        <Badge variant="medical">ICU</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Emergency:</span>
        <Badge variant="danger">ER</Badge>
      </div>
    </div>
  ),
};

export const AppointmentStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Scheduled:</span>
        <Badge variant="info">Scheduled</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Confirmed:</span>
        <Badge variant="success">Confirmed</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Pending:</span>
        <Badge variant="warning">Pending</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">Cancelled:</span>
        <Badge variant="destructive">Cancelled</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32">No Show:</span>
        <Badge variant="danger">No Show</Badge>
      </div>
    </div>
  ),
};
