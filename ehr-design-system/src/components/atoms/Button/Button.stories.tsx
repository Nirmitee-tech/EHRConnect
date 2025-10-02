import type { Meta, StoryObj } from "@storybook/react";
import { Heart, User, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link", "success", "warning", "danger", "info", "medical"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "xl", "icon"],
    },
    loading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

export const Medical: Story = {
  args: {
    children: "Medical Action",
    variant: "medical",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="medical">Medical</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="info">Info</Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="medical">
        <Heart className="mr-2 h-4 w-4" />
        Patient Care
      </Button>
      <Button variant="success">
        <CheckCircle className="mr-2 h-4 w-4" />
        Approve
      </Button>
      <Button variant="danger">
        <AlertCircle className="mr-2 h-4 w-4" />
        Alert
      </Button>
      <Button variant="info">
        <Info className="mr-2 h-4 w-4" />
        Information
      </Button>
    </div>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button size="icon" variant="default">
        <User />
      </Button>
      <Button size="icon" variant="medical">
        <Heart />
      </Button>
      <Button size="icon" variant="success">
        <CheckCircle />
      </Button>
      <Button size="icon" variant="danger">
        <AlertCircle />
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button loading variant="default">
        Loading
      </Button>
      <Button loading variant="medical">
        Saving Patient
      </Button>
      <Button loading variant="success">
        Processing
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button disabled variant="default">
        Disabled
      </Button>
      <Button disabled variant="medical">
        Disabled Medical
      </Button>
      <Button disabled variant="success">
        Disabled Success
      </Button>
    </div>
  ),
};
