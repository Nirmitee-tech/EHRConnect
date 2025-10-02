import type { Meta, StoryObj } from '@storybook/react';
import { Container, Grid, GridItem, Flex } from './Grid';
import { Card } from '../Card/Card';

const meta: Meta<typeof Grid> = {
  title: 'Atoms/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Comprehensive grid system for healthcare interfaces, including Container, Grid, GridItem, and Flex components. Based on CSS Grid and Flexbox for responsive layouts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

// Helper component for demo purposes
const DemoCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <Card className={`p-4 text-center bg-primary-50 border-primary-200 ${className}`}>
    <div className="text-primary-600 font-medium">{children}</div>
  </Card>
);

export const BasicGrid: Story = {
  render: () => (
    <Grid cols={3} gap={4}>
      <DemoCard>Item 1</DemoCard>
      <DemoCard>Item 2</DemoCard>
      <DemoCard>Item 3</DemoCard>
      <DemoCard>Item 4</DemoCard>
      <DemoCard>Item 5</DemoCard>
      <DemoCard>Item 6</DemoCard>
    </Grid>
  ),
};

export const ResponsiveGrid: Story = {
  render: () => (
    <Grid 
      cols={1}
      gap={4}
      responsive={{
        sm: 2,
        md: 3,
        lg: 4,
        xl: 6
      }}
    >
      <DemoCard>Responsive 1</DemoCard>
      <DemoCard>Responsive 2</DemoCard>
      <DemoCard>Responsive 3</DemoCard>
      <DemoCard>Responsive 4</DemoCard>
      <DemoCard>Responsive 5</DemoCard>
      <DemoCard>Responsive 6</DemoCard>
    </Grid>
  ),
};

export const AutoFitGrid: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Auto-fit Grid (items stretch to fill space)</h3>
        <Grid autoFit gap={4}>
          <DemoCard>Auto Fit 1</DemoCard>
          <DemoCard>Auto Fit 2</DemoCard>
          <DemoCard>Auto Fit 3</DemoCard>
        </Grid>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Auto-fill Grid (creates empty columns)</h3>
        <Grid autoFill gap={4}>
          <DemoCard>Auto Fill 1</DemoCard>
          <DemoCard>Auto Fill 2</DemoCard>
          <DemoCard>Auto Fill 3</DemoCard>
        </Grid>
      </div>
    </div>
  ),
};

export const GridWithSpanning: Story = {
  render: () => (
    <Grid cols={4} gap={4}>
      <GridItem colSpan={2}>
        <DemoCard>Spans 2 columns</DemoCard>
      </GridItem>
      <GridItem>
        <DemoCard>Normal</DemoCard>
      </GridItem>
      <GridItem>
        <DemoCard>Normal</DemoCard>
      </GridItem>
      <GridItem>
        <DemoCard>Normal</DemoCard>
      </GridItem>
      <GridItem colSpan={3}>
        <DemoCard>Spans 3 columns</DemoCard>
      </GridItem>
      <GridItem colSpan={full}>
        <DemoCard>Spans full width</DemoCard>
      </GridItem>
    </Grid>
  ),
};

export const HealthcareDashboard: Story = {
  render: () => (
    <Container size="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive patient overview and vital signs monitoring</p>
        </div>
        
        {/* Vital Signs - Auto-fit for responsiveness */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Vital Signs</h2>
          <Grid autoFit gap={4} className="min-h-[120px]">
            <Card className="p-6 text-center bg-success-50 border-success-200">
              <div className="text-success-600 text-2xl font-bold">72</div>
              <div className="text-success-700 text-sm font-medium mt-1">Heart Rate</div>
              <div className="text-gray-500 text-xs">bpm</div>
            </Card>
            <Card className="p-6 text-center bg-info-50 border-info-200">
              <div className="text-info-600 text-2xl font-bold">120/80</div>
              <div className="text-info-700 text-sm font-medium mt-1">Blood Pressure</div>
              <div className="text-gray-500 text-xs">mmHg</div>
            </Card>
            <Card className="p-6 text-center bg-warning-50 border-warning-200">
              <div className="text-warning-600 text-2xl font-bold">98.6</div>
              <div className="text-warning-700 text-sm font-medium mt-1">Temperature</div>
              <div className="text-gray-500 text-xs">°F</div>
            </Card>
            <Card className="p-6 text-center bg-primary-50 border-primary-200">
              <div className="text-primary-600 text-2xl font-bold">98</div>
              <div className="text-primary-700 text-sm font-medium mt-1">O2 Saturation</div>
              <div className="text-gray-500 text-xs">%</div>
            </Card>
          </Grid>
        </div>
        
        {/* Main Content Grid */}
        <Grid cols={1} gap={6} responsive={{ lg: 3 }}>
          <GridItem colSpan={2} responsive={{ lg: 2 }}>
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
              <div className="space-y-3">
                <Flex justify="between">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-mono">MRN-2024-001234</span>
                </Flex>
                <Flex justify="between">
                  <span className="text-gray-600">Age:</span>
                  <span>45 years</span>
                </Flex>
                <Flex justify="between">
                  <span className="text-gray-600">Gender:</span>
                  <span>Female</span>
                </Flex>
                <Flex justify="between">
                  <span className="text-gray-600">Last Visit:</span>
                  <span>2024-01-15</span>
                </Flex>
              </div>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4">Alerts</h3>
              <div className="space-y-2">
                <div className="p-3 bg-danger-50 border-l-4 border-danger-500 rounded">
                  <div className="text-danger-700 font-medium text-sm">High Blood Pressure</div>
                </div>
                <div className="p-3 bg-warning-50 border-l-4 border-warning-500 rounded">
                  <div className="text-warning-700 font-medium text-sm">Medication Due</div>
                </div>
              </div>
            </Card>
          </GridItem>
        </Grid>
        
        {/* Labs and Medications */}
        <Grid cols={1} gap={6} responsive={{ md: 2 }}>
          <GridItem>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Labs</h3>
              <div className="space-y-2">
                <Flex justify="between" className="py-2 border-b">
                  <span>Hemoglobin</span>
                  <span className="font-medium">12.5 g/dL</span>
                </Flex>
                <Flex justify="between" className="py-2 border-b">
                  <span>White Blood Cell</span>
                  <span className="font-medium">7.2 K/μL</span>
                </Flex>
                <Flex justify="between" className="py-2 border-b">
                  <span>Glucose</span>
                  <span className="font-medium">95 mg/dL</span>
                </Flex>
              </div>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Current Medications</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">Lisinopril</div>
                  <div className="text-sm text-gray-600">10mg daily</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">Metformin</div>
                  <div className="text-sm text-gray-600">500mg twice daily</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">Simvastatin</div>
                  <div className="text-sm text-gray-600">20mg at bedtime</div>
                </div>
              </div>
            </Card>
          </GridItem>
        </Grid>
      </div>
    </Container>
  ),
};

export const FlexLayouts: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Flex Direction Examples</h3>
        <div className="space-y-4">
          <Flex direction="row" gap={4}>
            <DemoCard>Row 1</DemoCard>
            <DemoCard>Row 2</DemoCard>
            <DemoCard>Row 3</DemoCard>
          </Flex>
          
          <Flex direction="col" gap={4} className="max-w-xs">
            <DemoCard>Col 1</DemoCard>
            <DemoCard>Col 2</DemoCard>
            <DemoCard>Col 3</DemoCard>
          </Flex>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Flex Justify Examples</h3>
        <div className="space-y-4">
          <Flex justify="start" gap={4} className="bg-gray-100 p-4 rounded">
            <DemoCard>Start</DemoCard>
            <DemoCard>Items</DemoCard>
          </Flex>
          
          <Flex justify="center" gap={4} className="bg-gray-100 p-4 rounded">
            <DemoCard>Center</DemoCard>
            <DemoCard>Items</DemoCard>
          </Flex>
          
          <Flex justify="between" gap={4} className="bg-gray-100 p-4 rounded">
            <DemoCard>Between</DemoCard>
            <DemoCard>Items</DemoCard>
          </Flex>
          
          <Flex justify="evenly" gap={4} className="bg-gray-100 p-4 rounded">
            <DemoCard>Evenly</DemoCard>
            <DemoCard>Spaced</DemoCard>
            <DemoCard>Items</DemoCard>
          </Flex>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Flex Align Examples</h3>
        <div className="space-y-4">
          <Flex align="start" gap={4} className="bg-gray-100 p-4 rounded h-24">
            <DemoCard>Align</DemoCard>
            <DemoCard className="py-8">Start</DemoCard>
          </Flex>
          
          <Flex align="center" gap={4} className="bg-gray-100 p-4 rounded h-24">
            <DemoCard>Align</DemoCard>
            <DemoCard className="py-8">Center</DemoCard>
          </Flex>
          
          <Flex align="end" gap={4} className="bg-gray-100 p-4 rounded h-24">
            <DemoCard>Align</DemoCard>
            <DemoCard className="py-8">End</DemoCard>
          </Flex>
          
          <Flex align="stretch" gap={4} className="bg-gray-100 p-4 rounded h-24">
            <DemoCard>Stretch</DemoCard>
            <DemoCard>Items</DemoCard>
          </Flex>
        </div>
      </div>
    </div>
  ),
};

export const ContainerSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <Container size="sm" className="bg-primary-50 p-6 rounded">
        <h3 className="font-semibold">Small Container (640px)</h3>
        <p className="text-gray-600 mt-2">Perfect for forms and focused content.</p>
      </Container>
      
      <Container size="md" className="bg-secondary-50 p-6 rounded">
        <h3 className="font-semibold">Medium Container (768px)</h3>
        <p className="text-gray-600 mt-2">Good for tablet-sized content and medical forms.</p>
      </Container>
      
      <Container size="lg" className="bg-success-50 p-6 rounded">
        <h3 className="font-semibold">Large Container (1024px)</h3>
        <p className="text-gray-600 mt-2">Ideal for desktop dashboards and data tables.</p>
      </Container>
      
      <Container size="xl" className="bg-info-50 p-6 rounded">
        <h3 className="font-semibold">Extra Large Container (1280px)</h3>
        <p className="text-gray-600 mt-2">Perfect for workstation displays and comprehensive dashboards.</p>
      </Container>
      
      <Container size="2xl" className="bg-warning-50 p-6 rounded">
        <h3 className="font-semibold">2XL Container (1536px)</h3>
        <p className="text-gray-600 mt-2">For large displays and multi-panel healthcare interfaces.</p>
      </Container>
    </div>
  ),
};