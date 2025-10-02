import type { Meta, StoryObj } from "@storybook/react";
import { User, Mail, Phone, Search, Lock } from "lucide-react";
import { Input } from "./Input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Patient Name",
    placeholder: "John Doe",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Email Address",
    placeholder: "email@example.com",
    icon: <Mail className="h-4 w-4" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Patient ID",
    placeholder: "Enter patient ID",
    error: "Patient ID is required",
    icon: <User className="h-4 w-4" />,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input
        label="Text Input"
        type="text"
        placeholder="Enter text"
        icon={<User className="h-4 w-4" />}
      />
      <Input
        label="Email Input"
        type="email"
        placeholder="email@example.com"
        icon={<Mail className="h-4 w-4" />}
      />
      <Input
        label="Password Input"
        type="password"
        placeholder="Enter password"
        icon={<Lock className="h-4 w-4" />}
      />
      <Input
        label="Phone Input"
        type="tel"
        placeholder="(555) 123-4567"
        icon={<Phone className="h-4 w-4" />}
      />
      <Input
        label="Search Input"
        type="search"
        placeholder="Search patients..."
        icon={<Search className="h-4 w-4" />}
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "Cannot edit",
    disabled: true,
    icon: <User className="h-4 w-4" />,
  },
};

export const MedicalForm: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input
        label="Patient MRN"
        placeholder="Medical Record Number"
        icon={<User className="h-4 w-4" />}
      />
      <Input
        label="Date of Birth"
        type="date"
      />
      <Input
        label="Chief Complaint"
        placeholder="Reason for visit"
      />
      <Input
        label="Blood Pressure"
        placeholder="120/80"
        error="Invalid format"
      />
    </div>
  ),
};
