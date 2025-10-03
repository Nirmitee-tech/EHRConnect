import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Design System/Atoms/Box',
  component: Box,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Box is the most fundamental layout component. It provides a flexible foundation for building layouts with consistent spacing, sizing, and styling patterns.',
      },
    },
  },
  argTypes: {
    display: {
      control: 'select',
      options: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden'],
      description: 'CSS display property'
    },
    position: {
      control: 'select',
      options: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
      description: 'CSS position property'
    },
    overflow: {
      control: 'select',
      options: ['visible', 'hidden', 'scroll', 'auto', 'x-hidden', 'y-hidden', 'x-scroll', 'y-scroll', 'x-auto', 'y-auto'],
      description: 'CSS overflow property'
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Padding on all sides'
    },
    margin: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'auto'],
      description: 'Margin on all sides'
    },
    background: {
      control: 'select',
      options: ['none', 'background', 'muted', 'card', 'primary', 'secondary', 'accent', 'destructive', 'medical', 'clinical', 'administrative'],
      description: 'Background color variant'
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Border radius'
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Drop shadow'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    children: 'This is a basic Box component',
    padding: 'md',
    background: 'muted',
    borderRadius: 'md',
  },
};

export const Display: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Display Variants</h3>
      <Box display="block" padding="sm" background="muted" borderRadius="md">
        Block display (default)
      </Box>
      <Box display="inline-block" padding="sm" background="card" borderRadius="md" marginX="sm">
        Inline Block
      </Box>
      <Box display="inline-block" padding="sm" background="card" borderRadius="md">
        Inline Block
      </Box>
      <Box display="flex" padding="sm" background="primary" borderRadius="md">
        <div className="text-primary-foreground">Flex Display</div>
      </Box>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Padding Variants</h3>
        <div className="grid grid-cols-3 gap-4">
          <Box padding="sm" background="muted" borderRadius="md" border="default">
            <div className="bg-primary text-primary-foreground text-xs p-1 rounded">Small Padding</div>
          </Box>
          <Box padding="md" background="muted" borderRadius="md" border="default">
            <div className="bg-primary text-primary-foreground text-xs p-1 rounded">Medium Padding</div>
          </Box>
          <Box padding="lg" background="muted" borderRadius="md" border="default">
            <div className="bg-primary text-primary-foreground text-xs p-1 rounded">Large Padding</div>
          </Box>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Margin Variants</h3>
        <div className="bg-accent p-4 rounded-lg">
          <Box margin="sm" padding="sm" background="background" borderRadius="md" border="default">
            Small Margin
          </Box>
          <Box margin="md" padding="sm" background="background" borderRadius="md" border="default">
            Medium Margin
          </Box>
          <Box margin="lg" padding="sm" background="background" borderRadius="md" border="default">
            Large Margin
          </Box>
        </div>
      </div>
    </div>
  ),
};

export const Backgrounds: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Background Variants</h3>
      <div className="grid grid-cols-2 gap-4">
        <Box padding="md" background="background" border="default" borderRadius="md">
          Background
        </Box>
        <Box padding="md" background="muted" borderRadius="md">
          Muted
        </Box>
        <Box padding="md" background="card" border="default" borderRadius="md">
          Card
        </Box>
        <Box padding="md" background="accent" borderRadius="md">
          Accent
        </Box>
        <Box padding="md" background="medical" borderRadius="md">
          Medical (Healthcare)
        </Box>
        <Box padding="md" background="clinical" borderRadius="md">
          Clinical (Healthcare)
        </Box>
        <Box padding="md" background="administrative" borderRadius="md">
          Administrative (Healthcare)
        </Box>
        <Box padding="md" background="primary" borderRadius="md">
          <div className="text-primary-foreground">Primary</div>
        </Box>
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Shadow Variants</h3>
      <div className="grid grid-cols-3 gap-6">
        <Box padding="md" background="background" borderRadius="md" shadow="sm">
          Small Shadow
        </Box>
        <Box padding="md" background="background" borderRadius="md" shadow="md">
          Medium Shadow
        </Box>
        <Box padding="md" background="background" borderRadius="md" shadow="lg">
          Large Shadow
        </Box>
        <Box padding="md" background="background" borderRadius="md" shadow="xl">
          Extra Large Shadow
        </Box>
        <Box padding="md" background="background" borderRadius="md" shadow="2xl">
          2XL Shadow
        </Box>
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Border Radius Variants</h3>
      <div className="grid grid-cols-4 gap-4">
        <Box padding="md" background="muted" borderRadius="none">
          None
        </Box>
        <Box padding="md" background="muted" borderRadius="sm">
          Small
        </Box>
        <Box padding="md" background="muted" borderRadius="md">
          Medium
        </Box>
        <Box padding="md" background="muted" borderRadius="lg">
          Large
        </Box>
        <Box padding="md" background="muted" borderRadius="xl">
          XL
        </Box>
        <Box padding="md" background="muted" borderRadius="2xl">
          2XL
        </Box>
        <Box padding="md" background="muted" borderRadius="full" width="fit" height="fit">
          <div className="w-16 h-16 flex items-center justify-center">Full</div>
        </Box>
      </div>
    </div>
  ),
};

export const Sizing: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Width Variants</h3>
        <div className="space-y-2">
          <Box width="1/4" padding="sm" background="primary" borderRadius="md">
            <div className="text-primary-foreground text-center">25% Width</div>
          </Box>
          <Box width="1/2" padding="sm" background="primary" borderRadius="md">
            <div className="text-primary-foreground text-center">50% Width</div>
          </Box>
          <Box width="3/4" padding="sm" background="primary" borderRadius="md">
            <div className="text-primary-foreground text-center">75% Width</div>
          </Box>
          <Box width="full" padding="sm" background="primary" borderRadius="md">
            <div className="text-primary-foreground text-center">100% Width</div>
          </Box>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Height Variants</h3>
        <div className="flex gap-4 h-32">
          <Box height="1/4" width="1/4" background="secondary" borderRadius="md" display="flex">
            <div className="text-center self-center mx-auto text-xs">25%</div>
          </Box>
          <Box height="1/2" width="1/4" background="secondary" borderRadius="md" display="flex">
            <div className="text-center self-center mx-auto text-xs">50%</div>
          </Box>
          <Box height="3/4" width="1/4" background="secondary" borderRadius="md" display="flex">
            <div className="text-center self-center mx-auto text-xs">75%</div>
          </Box>
          <Box height="full" width="1/4" background="secondary" borderRadius="md" display="flex">
            <div className="text-center self-center mx-auto text-xs">100%</div>
          </Box>
        </div>
      </div>
    </div>
  ),
};

// Healthcare Examples
export const HealthcareCards: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Healthcare Layout Examples</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Patient Card */}
        <Box 
          background="medical" 
          padding="md" 
          borderRadius="lg" 
          shadow="md" 
          border="default"
          className="border-blue-200"
        >
          <div className="text-blue-900">
            <h4 className="font-semibold mb-2">Patient Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> John Doe</p>
              <p><strong>MRN:</strong> 123456</p>
              <p><strong>DOB:</strong> 01/15/1980</p>
            </div>
          </div>
        </Box>

        {/* Clinical Notes Card */}
        <Box 
          background="clinical" 
          padding="md" 
          borderRadius="lg" 
          shadow="md" 
          border="default"
          className="border-green-200"
        >
          <div className="text-green-900">
            <h4 className="font-semibold mb-2">Clinical Notes</h4>
            <div className="text-sm">
              <p>Patient presents with chest pain. Vital signs stable. ECG ordered.</p>
            </div>
          </div>
        </Box>

        {/* Administrative Card */}
        <Box 
          background="administrative" 
          padding="md" 
          borderRadius="lg" 
          shadow="md" 
          border="default"
          className="border-purple-200"
        >
          <div className="text-purple-900">
            <h4 className="font-semibold mb-2">Insurance</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Provider:</strong> Blue Cross</p>
              <p><strong>Policy:</strong> BC123456</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </div>
        </Box>
      </div>
    </div>
  ),
};

export const LayoutComposition: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Layout Composition Examples</h3>
      
      {/* Header */}
      <Box 
        display="flex" 
        padding="md" 
        background="primary" 
        borderRadius="md"
        className="justify-between items-center"
      >
        <div className="text-primary-foreground font-semibold">EHR System</div>
        <div className="text-primary-foreground text-sm">Dr. Sarah Johnson</div>
      </Box>
      
      {/* Main Layout */}
      <Box display="flex" className="gap-4 min-h-[300px]">
        {/* Sidebar */}
        <Box 
          width="1/4" 
          background="muted" 
          padding="md" 
          borderRadius="md"
        >
          <h4 className="font-medium mb-3">Navigation</h4>
          <div className="space-y-2">
            <Box padding="sm" background="background" borderRadius="sm" className="cursor-pointer hover:bg-accent">
              Patients
            </Box>
            <Box padding="sm" background="primary" borderRadius="sm">
              <div className="text-primary-foreground">Dashboard</div>
            </Box>
            <Box padding="sm" background="background" borderRadius="sm" className="cursor-pointer hover:bg-accent">
              Reports
            </Box>
          </div>
        </Box>
        
        {/* Content Area */}
        <Box width="3/4" background="background" padding="md" borderRadius="md" border="default">
          <h4 className="font-semibold mb-4">Patient Dashboard</h4>
          
          <Box display="grid" className="grid-cols-1 md:grid-cols-2 gap-4">
            <Box background="card" padding="md" borderRadius="md" shadow="sm">
              <h5 className="font-medium mb-2">Recent Vitals</h5>
              <div className="text-sm text-muted-foreground">
                Blood Pressure: 120/80<br />
                Heart Rate: 72 bpm<br />
                Temperature: 98.6°F
              </div>
            </Box>
            
            <Box background="card" padding="md" borderRadius="md" shadow="sm">
              <h5 className="font-medium mb-2">Medications</h5>
              <div className="text-sm text-muted-foreground">
                Lisinopril 10mg daily<br />
                Metformin 500mg BID<br />
                Aspirin 81mg daily
              </div>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  ),
};

export const FlexibleAsProperty: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Polymorphic Component (as prop)</h3>
      
      <Box as="section" padding="md" background="muted" borderRadius="md">
        Box rendered as a section element
      </Box>
      
      <Box as="article" padding="md" background="card" borderRadius="md" border="default">
        Box rendered as an article element
      </Box>
      
      <Box as="header" padding="md" background="primary" borderRadius="md">
        <div className="text-primary-foreground">Box rendered as a header element</div>
      </Box>
      
      <Box as="aside" padding="md" background="secondary" borderRadius="md">
        Box rendered as an aside element
      </Box>
    </div>
  ),
};