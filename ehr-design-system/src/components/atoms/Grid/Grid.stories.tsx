import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid, GridItem } from './Grid';
import { Card } from '../../atoms/Card/Card';
import { Button } from '../../atoms/Button/Button';

const meta: Meta<typeof Grid> = {
  title: 'Design System/Atoms/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible grid layout primitive for creating two-dimensional layouts with comprehensive CSS Grid support.'
      }
    }
  },
  argTypes: {
    cols: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'none', 'subgrid'],
      description: 'Number of grid columns'
    },
    rows: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6, 'none', 'subgrid'],
      description: 'Number of grid rows'
    },
    gap: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Gap between grid items'
    },
    gapX: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Horizontal gap between grid items'
    },
    gapY: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Vertical gap between grid items'
    },
    autoFlow: {
      control: { type: 'select' },
      options: ['row', 'col', 'dense', 'row-dense', 'col-dense'],
      description: 'Auto-placement algorithm for grid items'
    },
    justifyItems: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'stretch'],
      description: 'Alignment of items along the inline (row) axis'
    },
    alignItems: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'baseline', 'stretch'],
      description: 'Alignment of items along the block (column) axis'
    },
    justifyContent: {
      control: { type: 'select' },
      options: ['normal', 'start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'],
      description: 'Alignment of grid along the inline (row) axis'
    },
    alignContent: {
      control: { type: 'select' },
      options: ['normal', 'start', 'end', 'center', 'between', 'around', 'evenly', 'baseline', 'stretch'],
      description: 'Alignment of grid along the block (column) axis'
    },
    as: {
      control: { type: 'text' },
      description: 'Polymorphic component type'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  args: {
    cols: 3,
    gap: 'md'
  },
  render: (args) => (
    <Grid {...args}>
      <div className="bg-blue-100 border-2 border-blue-300 rounded p-4 text-center">
        Item 1
      </div>
      <div className="bg-green-100 border-2 border-green-300 rounded p-4 text-center">
        Item 2
      </div>
      <div className="bg-yellow-100 border-2 border-yellow-300 rounded p-4 text-center">
        Item 3
      </div>
      <div className="bg-red-100 border-2 border-red-300 rounded p-4 text-center">
        Item 4
      </div>
      <div className="bg-purple-100 border-2 border-purple-300 rounded p-4 text-center">
        Item 5
      </div>
      <div className="bg-pink-100 border-2 border-pink-300 rounded p-4 text-center">
        Item 6
      </div>
    </Grid>
  )
};

export const ResponsiveColumns: Story = {
  render: () => (
    <Grid cols={1} className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" gap="md">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Responsive</div>
        <div className="font-medium">Item 1</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Grid</div>
        <div className="font-medium">Item 2</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Layout</div>
        <div className="font-medium">Item 3</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">System</div>
        <div className="font-medium">Item 4</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Design</div>
        <div className="font-medium">Item 5</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Component</div>
        <div className="font-medium">Item 6</div>
      </Card>
    </Grid>
  )
};

export const WithGridItems: Story = {
  render: () => (
    <Grid cols={4} gap="md" className="min-h-[300px]">
      <GridItem colSpan={2} className="bg-blue-50 border-2 border-blue-200 rounded p-4">
        <div className="font-medium">Spans 2 Columns</div>
        <div className="text-sm text-muted-foreground">colSpan={2}</div>
      </GridItem>
      <GridItem className="bg-green-50 border-2 border-green-200 rounded p-4">
        <div className="font-medium">Regular</div>
        <div className="text-sm text-muted-foreground">colSpan=1</div>
      </GridItem>
      <GridItem rowSpan={2} className="bg-yellow-50 border-2 border-yellow-200 rounded p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="font-medium">Spans 2 Rows</div>
          <div className="text-sm text-muted-foreground">rowSpan={2}</div>
        </div>
      </GridItem>
      <GridItem className="bg-purple-50 border-2 border-purple-200 rounded p-4">
        <div className="font-medium">Item</div>
        <div className="text-sm text-muted-foreground">Regular</div>
      </GridItem>
      <GridItem colSpan={2} className="bg-red-50 border-2 border-red-200 rounded p-4">
        <div className="font-medium">Another Span 2</div>
        <div className="text-sm text-muted-foreground">colSpan={2}</div>
      </GridItem>
      <GridItem className="bg-pink-50 border-2 border-pink-200 rounded p-4">
        <div className="font-medium">Final</div>
        <div className="text-sm text-muted-foreground">Item</div>
      </GridItem>
    </Grid>
  )
};

export const AutoFitLayout: Story = {
  render: () => (
    <Grid className="grid-cols-[repeat(auto-fit,minmax(200px,1fr))]" gap="md">
      <Card className="p-4">
        <div className="font-medium">Auto Fit</div>
        <div className="text-sm text-muted-foreground">Minimum 200px</div>
      </Card>
      <Card className="p-4">
        <div className="font-medium">Responsive</div>
        <div className="text-sm text-muted-foreground">Grid Layout</div>
      </Card>
      <Card className="p-4">
        <div className="font-medium">Flexible</div>
        <div className="text-sm text-muted-foreground">Auto Sizing</div>
      </Card>
      <Card className="p-4">
        <div className="font-medium">Dynamic</div>
        <div className="text-sm text-muted-foreground">Content</div>
      </Card>
    </Grid>
  )
};

export const DashboardLayout: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-lg font-semibold">Patient Dashboard Layout</div>
      <Grid cols={12} gap="lg" className="min-h-[500px]">
        <GridItem colSpan={3} rowSpan={2} className="bg-card border rounded-lg p-4">
          <div className="font-medium mb-3">Patient Info</div>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> John Doe</div>
            <div><span className="font-medium">MRN:</span> 123456</div>
            <div><span className="font-medium">DOB:</span> 01/01/1980</div>
            <div><span className="font-medium">Age:</span> 43</div>
            <div className="pt-2">
              <Button size="sm" variant="outline" className="w-full">
                View Full Profile
              </Button>
            </div>
          </div>
        </GridItem>
        
        <GridItem colSpan={6} className="bg-card border rounded-lg p-4">
          <div className="font-medium mb-3">Vital Signs</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">120/80</div>
              <div className="text-xs text-muted-foreground">Blood Pressure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">72</div>
              <div className="text-xs text-muted-foreground">Heart Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98.6°F</div>
              <div className="text-xs text-muted-foreground">Temperature</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">98%</div>
              <div className="text-xs text-muted-foreground">O2 Saturation</div>
            </div>
          </div>
        </GridItem>
        
        <GridItem colSpan={3} className="bg-card border rounded-lg p-4">
          <div className="font-medium mb-3">Quick Actions</div>
          <div className="space-y-2">
            <Button size="sm" className="w-full justify-start">
              📝 New Note
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              💊 Medications
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              📊 Lab Results
            </Button>
          </div>
        </GridItem>
        
        <GridItem colSpan={6} className="bg-card border rounded-lg p-4">
          <div className="font-medium mb-3">Recent Activity</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Blood work ordered</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Prescription refill requested</span>
              <span className="text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Appointment scheduled</span>
              <span className="text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </GridItem>
        
        <GridItem colSpan={3} className="bg-card border rounded-lg p-4">
          <div className="font-medium mb-3">Alerts</div>
          <div className="space-y-2">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
              <div className="font-medium">Drug Interaction</div>
              <div className="text-xs">Check new prescription</div>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 p-2 text-sm">
              <div className="font-medium">Allergy Alert</div>
              <div className="text-xs">Penicillin sensitivity</div>
            </div>
          </div>
        </GridItem>
        
        <GridItem colSpan={12} className="bg-card border rounded-lg p-4">
          <div className="font-medium mb-3">Medical History Timeline</div>
          <div className="flex space-x-8 overflow-x-auto pb-2">
            <div className="flex-shrink-0">
              <div className="text-xs text-muted-foreground">2023</div>
              <div className="font-medium">Diabetes Diagnosis</div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-xs text-muted-foreground">2022</div>
              <div className="font-medium">Hypertension</div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-xs text-muted-foreground">2020</div>
              <div className="font-medium">Appendectomy</div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-xs text-muted-foreground">2018</div>
              <div className="font-medium">Cholesterol Treatment</div>
            </div>
          </div>
        </GridItem>
      </Grid>
    </div>
  )
};
