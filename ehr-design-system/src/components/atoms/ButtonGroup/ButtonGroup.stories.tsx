import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button/Button';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Atoms/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ButtonGroup component for grouping related buttons together, following Atlassian Design System patterns. Supports horizontal/vertical orientation and connected/separated styles.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg'],
    },
    connected: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">First</Button>
      <Button variant="outline">Second</Button>
      <Button variant="outline">Third</Button>
    </ButtonGroup>
  ),
};

export const Orientations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Horizontal (Default)</h3>
        <ButtonGroup orientation="horizontal">
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical</h3>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const ConnectedVsSeparated: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Connected (Default)</h3>
        <ButtonGroup connected={true}>
          <Button variant="outline">Connected</Button>
          <Button variant="outline">Buttons</Button>
          <Button variant="outline">Group</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Separated</h3>
        <ButtonGroup connected={false} spacing="sm">
          <Button variant="outline">Separated</Button>
          <Button variant="outline">Buttons</Button>
          <Button variant="outline">Group</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const DifferentVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Primary Group</h3>
        <ButtonGroup>
          <Button variant="default">Save</Button>
          <Button variant="outline">Cancel</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Mixed Variants</h3>
        <ButtonGroup>
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Action Group</h3>
        <ButtonGroup>
          <Button variant="outline">Edit</Button>
          <Button variant="outline">Delete</Button>
          <Button variant="destructive">Remove</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Actions</h3>
        <ButtonGroup>
          <Button variant="default">View Chart</Button>
          <Button variant="outline">Edit Info</Button>
          <Button variant="outline">Lab Results</Button>
          <Button variant="secondary">Discharge</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Vital Signs Controls</h3>
        <ButtonGroup orientation="vertical">
          <Button variant="outline" className="justify-start">Heart Rate</Button>
          <Button variant="outline" className="justify-start">Blood Pressure</Button>
          <Button variant="outline" className="justify-start">Temperature</Button>
          <Button variant="outline" className="justify-start">O2 Saturation</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Time Range Selector</h3>
        <ButtonGroup>
          <Button variant="outline" size="sm">1H</Button>
          <Button variant="default" size="sm">6H</Button>
          <Button variant="outline" size="sm">12H</Button>
          <Button variant="outline" size="sm">24H</Button>
          <Button variant="outline" size="sm">7D</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Actions</h3>
        <ButtonGroup connected={false} spacing="sm">
          <Button variant="destructive">Code Red</Button>
          <Button variant="secondary">Code Blue</Button>
          <Button variant="outline">Call Doctor</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Icon + Text</h3>
        <ButtonGroup>
          <Button variant="outline">
            <span className="mr-2">📄</span>
            View
          </Button>
          <Button variant="outline">
            <span className="mr-2">✏️</span>
            Edit
          </Button>
          <Button variant="destructive">
            <span className="mr-2">🗑️</span>
            Delete
          </Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Icon Only</h3>
        <ButtonGroup>
          <Button variant="outline" size="sm">❤️</Button>
          <Button variant="outline" size="sm">🩸</Button>
          <Button variant="outline" size="sm">🌡️</Button>
          <Button variant="outline" size="sm">🫁</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">No Spacing (Connected)</h3>
        <ButtonGroup connected={false} spacing="none">
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
          <Button variant="outline">Three</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Extra Small Spacing</h3>
        <ButtonGroup connected={false} spacing="xs">
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
          <Button variant="outline">Three</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Spacing</h3>
        <ButtonGroup connected={false} spacing="sm">
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
          <Button variant="outline">Three</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Spacing</h3>
        <ButtonGroup connected={false} spacing="md">
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
          <Button variant="outline">Three</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Spacing</h3>
        <ButtonGroup connected={false} spacing="lg">
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
          <Button variant="outline">Three</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};