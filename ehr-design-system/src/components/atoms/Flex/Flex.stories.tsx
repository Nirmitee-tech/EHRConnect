import type { Meta, StoryObj } from '@storybook/react';
import { Flex, FlexItem } from './Flex';
import { Box } from '../Box/Box';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { 
  User, 
  Heart, 
  Activity, 
  Stethoscope, 
  Calendar, 
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const meta: Meta<typeof Flex> = {
  title: 'Design System/Atoms/Flex',
  component: Flex,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Flex is a powerful layout primitive that provides fine-grained control over flexbox layouts. It includes a FlexItem component for controlling individual flex items.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'col', 'col-reverse'],
      description: 'Flex direction'
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior'
    },
    justify: {
      control: 'select',
      options: ['normal', 'start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'],
      description: 'Justify content (main axis)'
    },
    align: {
      control: 'select',
      options: ['start', 'end', 'center', 'baseline', 'stretch'],
      description: 'Align items (cross axis)'
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Gap between children'
    },
    grow: {
      control: 'select',
      options: [0, 1],
      description: 'Flex grow'
    },
    shrink: {
      control: 'select',
      options: [0, 1],
      description: 'Flex shrink'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Flex>;

const DemoBox: React.FC<{ children: React.ReactNode; bg?: string; className?: string }> = ({ 
  children, 
  bg = 'bg-primary', 
  className = '' 
}) => (
  <div className={`${bg} text-primary-foreground px-4 py-2 rounded-md text-center text-sm ${className}`}>
    {children}
  </div>
);

export const Default: Story = {
  args: {
    gap: 'md',
    children: [
      <DemoBox key="1">Item 1</DemoBox>,
      <DemoBox key="2">Item 2</DemoBox>,
      <DemoBox key="3">Item 3</DemoBox>,
    ],
  },
};

export const Direction: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Row (Default)</h3>
        <Flex direction="row" gap="md">
          <DemoBox>First</DemoBox>
          <DemoBox>Second</DemoBox>
          <DemoBox>Third</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Row Reverse</h3>
        <Flex direction="row-reverse" gap="md">
          <DemoBox>First</DemoBox>
          <DemoBox>Second</DemoBox>
          <DemoBox>Third</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Column</h3>
        <Flex direction="col" gap="md">
          <DemoBox>First</DemoBox>
          <DemoBox>Second</DemoBox>
          <DemoBox>Third</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Column Reverse</h3>
        <Flex direction="col-reverse" gap="md">
          <DemoBox>First</DemoBox>
          <DemoBox>Second</DemoBox>
          <DemoBox>Third</DemoBox>
        </Flex>
      </div>
    </div>
  ),
};

export const Justify: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Start</h3>
        <Flex justify="start" gap="md" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Center</h3>
        <Flex justify="center" gap="md" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify End</h3>
        <Flex justify="end" gap="md" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Between</h3>
        <Flex justify="between" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Around</h3>
        <Flex justify="around" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Evenly</h3>
        <Flex justify="evenly" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
    </div>
  ),
};

export const Align: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Align Start</h3>
        <Flex align="start" gap="md" className="bg-muted rounded-md p-4 h-24">
          <DemoBox className="py-1">Short</DemoBox>
          <DemoBox className="py-4">Medium Height</DemoBox>
          <DemoBox className="py-6">Tall Content</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Align Center</h3>
        <Flex align="center" gap="md" className="bg-muted rounded-md p-4 h-24">
          <DemoBox className="py-1">Short</DemoBox>
          <DemoBox className="py-4">Medium Height</DemoBox>
          <DemoBox className="py-6">Tall Content</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Align End</h3>
        <Flex align="end" gap="md" className="bg-muted rounded-md p-4 h-24">
          <DemoBox className="py-1">Short</DemoBox>
          <DemoBox className="py-4">Medium Height</DemoBox>
          <DemoBox className="py-6">Tall Content</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Align Stretch</h3>
        <Flex align="stretch" gap="md" className="bg-muted rounded-md p-4 h-24">
          <DemoBox className="flex items-center">Stretched</DemoBox>
          <DemoBox className="flex items-center">All Same</DemoBox>
          <DemoBox className="flex items-center">Height</DemoBox>
        </Flex>
      </div>
    </div>
  ),
};

export const Wrap: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">No Wrap (Default)</h3>
        <Flex wrap="nowrap" gap="md" className="bg-muted rounded-md p-4 w-96">
          <DemoBox className="flex-shrink-0">Item 1 with long text</DemoBox>
          <DemoBox className="flex-shrink-0">Item 2 with long text</DemoBox>
          <DemoBox className="flex-shrink-0">Item 3 with long text</DemoBox>
          <DemoBox className="flex-shrink-0">Item 4 with long text</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Wrap</h3>
        <Flex wrap="wrap" gap="md" className="bg-muted rounded-md p-4 w-96">
          <DemoBox>Item 1 with long text</DemoBox>
          <DemoBox>Item 2 with long text</DemoBox>
          <DemoBox>Item 3 with long text</DemoBox>
          <DemoBox>Item 4 with long text</DemoBox>
          <DemoBox>Item 5 with long text</DemoBox>
          <DemoBox>Item 6 with long text</DemoBox>
        </Flex>
      </div>
    </div>
  ),
};

export const Gap: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">No Gap</h3>
        <Flex gap="none" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Gap</h3>
        <Flex gap="sm" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Gap</h3>
        <Flex gap="md" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Gap</h3>
        <Flex gap="lg" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Flex>
      </div>
    </div>
  ),
};

export const FlexItemsDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Flex Grow</h3>
        <Flex gap="md" className="bg-muted rounded-md p-4">
          <FlexItem grow={0}>
            <DemoBox>Fixed Width</DemoBox>
          </FlexItem>
          <FlexItem grow={1}>
            <DemoBox>Grows to Fill Space</DemoBox>
          </FlexItem>
          <FlexItem grow={0}>
            <DemoBox>Fixed Width</DemoBox>
          </FlexItem>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Flex Basis</h3>
        <Flex gap="md" className="bg-muted rounded-md p-4">
          <FlexItem basis="1/4">
            <DemoBox>25%</DemoBox>
          </FlexItem>
          <FlexItem basis="1/2">
            <DemoBox>50%</DemoBox>
          </FlexItem>
          <FlexItem basis="1/4">
            <DemoBox>25%</DemoBox>
          </FlexItem>
        </Flex>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Align Self</h3>
        <Flex align="stretch" gap="md" className="bg-muted rounded-md p-4 h-24">
          <FlexItem alignSelf="start">
            <DemoBox>Align Start</DemoBox>
          </FlexItem>
          <FlexItem alignSelf="center">
            <DemoBox>Align Center</DemoBox>
          </FlexItem>
          <FlexItem alignSelf="end">
            <DemoBox>Align End</DemoBox>
          </FlexItem>
          <FlexItem alignSelf="stretch">
            <DemoBox className="h-full flex items-center">Stretch</DemoBox>
          </FlexItem>
        </Flex>
      </div>
    </div>
  ),
};

// Healthcare Examples
export const PatientDashboard: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Patient Dashboard Layout</h3>
      
      <Box className="bg-background border rounded-lg p-6">
        <Flex direction="col" gap="lg">
          {/* Header */}
          <Flex justify="between" align="center">
            <Flex align="center" gap="md">
              <User className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="text-xl font-semibold">Sarah Johnson</h4>
                <p className="text-sm text-muted-foreground">MRN: 123456789</p>
              </div>
            </Flex>
            <Flex align="center" gap="sm">
              <Badge variant="secondary">Room 302A</Badge>
              <Badge variant="success">Stable</Badge>
            </Flex>
          </Flex>
          
          {/* Content Grid */}
          <Flex gap="lg" wrap="wrap">
            {/* Vital Signs */}
            <FlexItem basis="1/3" className="min-w-[280px]">
              <Box className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Flex direction="col" gap="md">
                  <Flex align="center" gap="sm">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h5 className="font-semibold text-green-900">Vital Signs</h5>
                  </Flex>
                  
                  <Flex direction="col" gap="sm">
                    <Flex justify="between">
                      <span className="text-sm">Heart Rate</span>
                      <span className="font-medium">72 BPM</span>
                    </Flex>
                    <Flex justify="between">
                      <span className="text-sm">Blood Pressure</span>
                      <span className="font-medium">120/80</span>
                    </Flex>
                    <Flex justify="between">
                      <span className="text-sm">Temperature</span>
                      <span className="font-medium">98.6°F</span>
                    </Flex>
                    <Flex justify="between">
                      <span className="text-sm">SpO₂</span>
                      <span className="font-medium">98%</span>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            </FlexItem>
            
            {/* Current Medications */}
            <FlexItem basis="1/3" className="min-w-[280px]">
              <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Flex direction="col" gap="md">
                  <Flex align="center" justify="between">
                    <Flex align="center" gap="sm">
                      <Heart className="w-5 h-5 text-blue-600" />
                      <h5 className="font-semibold text-blue-900">Medications</h5>
                    </Flex>
                    <Badge variant="warning" size="sm">3 Due</Badge>
                  </Flex>
                  
                  <Flex direction="col" gap="xs">
                    <Flex justify="between" align="center">
                      <span className="text-sm">Lisinopril 10mg</span>
                      <Badge size="sm" variant="outline">Daily</Badge>
                    </Flex>
                    <Flex justify="between" align="center">
                      <span className="text-sm">Metformin 500mg</span>
                      <Badge size="sm" variant="warning">Due Now</Badge>
                    </Flex>
                    <Flex justify="between" align="center">
                      <span className="text-sm">Aspirin 81mg</span>
                      <Badge size="sm" variant="outline">Daily</Badge>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            </FlexItem>
            
            {/* Upcoming Events */}
            <FlexItem basis="1/3" className="min-w-[280px]">
              <Box className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Flex direction="col" gap="md">
                  <Flex align="center" gap="sm">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h5 className="font-semibold text-purple-900">Scheduled</h5>
                  </Flex>
                  
                  <Flex direction="col" gap="xs">
                    <Flex justify="between" align="start">
                      <Flex direction="col" gap="xs">
                        <span className="text-sm font-medium">Lab Draw</span>
                        <span className="text-xs text-muted-foreground">Blood work</span>
                      </Flex>
                      <span className="text-xs text-muted-foreground">9:00 AM</span>
                    </Flex>
                    <Flex justify="between" align="start">
                      <Flex direction="col" gap="xs">
                        <span className="text-sm font-medium">PT Session</span>
                        <span className="text-xs text-muted-foreground">Physical therapy</span>
                      </Flex>
                      <span className="text-xs text-muted-foreground">2:30 PM</span>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            </FlexItem>
          </Flex>
          
          {/* Action Bar */}
          <Flex justify="end" gap="sm" className="pt-4 border-t">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              View Chart
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button size="sm">
              <Stethoscope className="w-4 h-4 mr-2" />
              Start Visit
            </Button>
          </Flex>
        </Flex>
      </Box>
    </div>
  ),
};

export const MedicalAlerts: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Medical Alerts & Notifications</h3>
      
      <Flex direction="col" gap="md">
        {/* Critical Alert */}
        <Box className="bg-red-50 border border-red-200 rounded-lg p-4">
          <Flex align="start" gap="sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <FlexItem grow={1}>
              <Flex direction="col" gap="sm">
                <Flex justify="between" align="start">
                  <div>
                    <h5 className="font-semibold text-red-900">Critical Drug Allergy</h5>
                    <p className="text-sm text-red-700 mt-1">
                      Patient is severely allergic to Penicillin. Anaphylactic reaction documented.
                    </p>
                  </div>
                  <Badge variant="destructive" size="sm">Critical</Badge>
                </Flex>
                <Flex justify="between" align="center">
                  <span className="text-xs text-red-600">Last updated: March 10, 2024</span>
                  <Button variant="destructive" size="sm">
                    Acknowledge
                  </Button>
                </Flex>
              </Flex>
            </FlexItem>
          </Flex>
        </Box>
        
        {/* Warning Alert */}
        <Box className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Flex align="start" gap="sm">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <FlexItem grow={1}>
              <Flex direction="col" gap="sm">
                <Flex justify="between" align="start">
                  <div>
                    <h5 className="font-semibold text-yellow-900">Medication Schedule</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Insulin injection due in 15 minutes. Patient last meal: 12:30 PM.
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">Due Soon</Badge>
                </Flex>
                <Flex justify="between" align="center">
                  <span className="text-xs text-yellow-600">Scheduled for: 3:00 PM</span>
                  <Flex gap="sm">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button variant="default" size="sm">Prepare</Button>
                  </Flex>
                </Flex>
              </Flex>
            </FlexItem>
          </Flex>
        </Box>
        
        {/* Info Alert */}
        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Flex align="start" gap="sm">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <FlexItem grow={1}>
              <Flex direction="col" gap="sm">
                <Flex justify="between" align="start">
                  <div>
                    <h5 className="font-semibold text-blue-900">Lab Results Available</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      Complete Blood Count and Basic Metabolic Panel results are ready for review.
                    </p>
                  </div>
                  <Badge variant="secondary" size="sm">New</Badge>
                </Flex>
                <Flex justify="between" align="center">
                  <span className="text-xs text-blue-600">Received: 2:45 PM</span>
                  <Button size="sm">Review Results</Button>
                </Flex>
              </Flex>
            </FlexItem>
          </Flex>
        </Box>
      </Flex>
    </div>
  ),
};

export const StatsCards: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Department Statistics</h3>
      
      <Flex gap="lg" wrap="wrap">
        <FlexItem basis="1/4" className="min-w-[200px]">
          <Box className="bg-card border rounded-lg p-6 text-center">
            <Flex direction="col" gap="md" align="center">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-3xl font-bold text-blue-800">247</div>
                <div className="text-sm text-muted-foreground">Active Patients</div>
              </div>
              <Flex align="center" gap="xs">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">+12% from last week</span>
              </Flex>
            </Flex>
          </Box>
        </FlexItem>
        
        <FlexItem basis="1/4" className="min-w-[200px]">
          <Box className="bg-card border rounded-lg p-6 text-center">
            <Flex direction="col" gap="md" align="center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-3xl font-bold text-green-800">89</div>
                <div className="text-sm text-muted-foreground">Appointments Today</div>
              </div>
              <Flex align="center" gap="xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">73 completed</span>
              </Flex>
            </Flex>
          </Box>
        </FlexItem>
        
        <FlexItem basis="1/4" className="min-w-[200px]">
          <Box className="bg-card border rounded-lg p-6 text-center">
            <Flex direction="col" gap="md" align="center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-3xl font-bold text-yellow-800">12</div>
                <div className="text-sm text-muted-foreground">Pending Alerts</div>
              </div>
              <Flex align="center" gap="xs">
                <Star className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">3 critical</span>
              </Flex>
            </Flex>
          </Box>
        </FlexItem>
        
        <FlexItem basis="1/4" className="min-w-[200px]">
          <Box className="bg-card border rounded-lg p-6 text-center">
            <Flex direction="col" gap="md" align="center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-3xl font-bold text-purple-800">94%</div>
                <div className="text-sm text-muted-foreground">Bed Occupancy</div>
              </div>
              <Flex align="center" gap="xs">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600">Above target</span>
              </Flex>
            </Flex>
          </Box>
        </FlexItem>
      </Flex>
    </div>
  ),
};

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Responsive Healthcare Layout</h3>
      
      <Flex direction="col" gap="lg" className="min-h-[500px]">
        {/* Header */}
        <Flex justify="between" align="center" className="bg-primary text-primary-foreground p-4 rounded-lg">
          <Flex align="center" gap="md">
            <Stethoscope className="w-6 h-6" />
            <h4 className="text-lg font-semibold">Clinical Dashboard</h4>
          </Flex>
          <Flex align="center" gap="sm">
            <Badge variant="secondary">Dr. Smith</Badge>
            <Badge variant="outline">ICU Ward</Badge>
          </Flex>
        </Flex>
        
        {/* Main Layout */}
        <Flex gap="lg" className="flex-1">
          {/* Sidebar */}
          <FlexItem basis="1/4" shrink={0} className="min-w-[200px]">
            <Box className="bg-muted rounded-lg p-4 h-full">
              <Flex direction="col" gap="md">
                <h5 className="font-semibold">Quick Actions</h5>
                <Flex direction="col" gap="sm">
                  <Button variant="outline" size="sm" className="justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Admit Patient
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </FlexItem>
          
          {/* Content Area */}
          <FlexItem grow={1}>
            <Flex direction="col" gap="lg" className="h-full">
              {/* Top Stats */}
              <Flex gap="md" wrap="wrap">
                <FlexItem basis="1/3" className="min-w-[150px]">
                  <Box className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                    <Flex direction="col" gap="xs" align="center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div className="text-2xl font-bold text-green-800">18</div>
                      <div className="text-xs text-green-700">Stable</div>
                    </Flex>
                  </Box>
                </FlexItem>
                
                <FlexItem basis="1/3" className="min-w-[150px]">
                  <Box className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
                    <Flex direction="col" gap="xs" align="center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                      <div className="text-2xl font-bold text-yellow-800">5</div>
                      <div className="text-xs text-yellow-700">Monitoring</div>
                    </Flex>
                  </Box>
                </FlexItem>
                
                <FlexItem basis="1/3" className="min-w-[150px]">
                  <Box className="bg-red-100 border border-red-200 rounded-lg p-4 text-center">
                    <Flex direction="col" gap="xs" align="center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div className="text-2xl font-bold text-red-800">2</div>
                      <div className="text-xs text-red-700">Critical</div>
                    </Flex>
                  </Box>
                </FlexItem>
              </Flex>
              
              {/* Patient List */}
              <FlexItem grow={1}>
                <Box className="bg-background border rounded-lg p-4 h-full">
                  <Flex direction="col" gap="md" className="h-full">
                    <Flex justify="between" align="center">
                      <h5 className="font-semibold">Current Patients</h5>
                      <Button size="sm">View All</Button>
                    </Flex>
                    
                    <Flex direction="col" gap="sm" className="flex-1 overflow-auto">
                      {['Room 301 - Sarah Johnson', 'Room 302 - Michael Chen', 'Room 303 - Emily Davis', 'Room 304 - Robert Smith'].map((patient, index) => (
                        <Flex key={index} justify="between" align="center" className="p-3 bg-muted rounded-md">
                          <Flex align="center" gap="sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{patient}</span>
                          </Flex>
                          <Badge size="sm" variant={index === 0 ? 'destructive' : index === 1 ? 'warning' : 'secondary'}>
                            {index === 0 ? 'Critical' : index === 1 ? 'Monitor' : 'Stable'}
                          </Badge>
                        </Flex>
                      ))}
                    </Flex>
                  </Flex>
                </Box>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </Flex>
    </div>
  ),
};