import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "./LoadingState";

const meta = {
  title: "Atoms/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    fullScreen: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "Loading...",
    size: "md",
    fullScreen: true,
  },
};

export const Small: Story = {
  args: {
    message: "Loading...",
    size: "sm",
    fullScreen: true,
  },
};

export const Large: Story = {
  args: {
    message: "Processing your request...",
    size: "lg",
    fullScreen: true,
  },
};

export const CustomMessage: Story = {
  args: {
    message: "Fetching patient data...",
    size: "md",
    fullScreen: true,
  },
};

export const NotFullScreen: Story = {
  args: {
    message: "Loading content...",
    size: "md",
    fullScreen: false,
  },
  decorators: [
    (Story) => (
      <div className="h-64 bg-gray-100 dark:bg-gray-900">
        <Story />
      </div>
    ),
  ],
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-gray-50 dark:bg-gray-900">
      <div>
        <h3 className="text-sm font-medium mb-4">Small</h3>
        <div className="h-32 bg-white dark:bg-gray-800 rounded-lg">
          <LoadingState message="Small spinner" size="sm" fullScreen={false} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-4">Medium (Default)</h3>
        <div className="h-48 bg-white dark:bg-gray-800 rounded-lg">
          <LoadingState message="Medium spinner" size="md" fullScreen={false} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-4">Large</h3>
        <div className="h-64 bg-white dark:bg-gray-800 rounded-lg">
          <LoadingState message="Large spinner" size="lg" fullScreen={false} />
        </div>
      </div>
    </div>
  ),
};

export const DifferentMessages: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-8 bg-gray-50 dark:bg-gray-900">
      {[
        "Loading...",
        "Please wait...",
        "Fetching data...",
        "Processing...",
        "Initializing...",
        "Saving changes...",
      ].map((msg, index) => (
        <div key={index} className="h-48 bg-white dark:bg-gray-800 rounded-lg">
          <LoadingState message={msg} fullScreen={false} />
        </div>
      ))}
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <LoadingState
          message="Loading patient records..."
          size="md"
          fullScreen={false}
        />
      </div>
    </div>
  ),
};
