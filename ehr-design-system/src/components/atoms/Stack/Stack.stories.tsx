import type { Meta, StoryObj } from '@storybook/react';
import { Stack, VStack, HStack } from './Stack';
import { Box } from '../Box/Box';
import { Button } from '../Button/Button';
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
  CheckCircle2
} from 'lucide-react';

const meta: Meta<typeof Stack> = {
  title: 'Design System/Atoms/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Stack is a layout primitive that arranges its children in a single dimension (vertical or horizontal) with consistent spacing. It includes convenient VStack and HStack variants.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['column', 'column-reverse', 'row', 'row-reverse'],
      description: 'Flex direction'
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Gap between children'
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'baseline', 'stretch'],
      description: 'Align items (cross axis)'
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      description: 'Justify content (main axis)'
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior'
    },
    divider: {
      control: 'boolean',
      description: 'Show dividers between children'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

const DemoBox: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = 'bg-primary' }) => (
  <div className={`${bg} text-primary-foreground px-4 py-2 rounded-md text-center text-sm`}>
    {children}
  </div>
);

export const Default: Story = {
  args: {
    spacing: 'md',
    children: [
      <DemoBox key="1">Item 1</DemoBox>,
      <DemoBox key="2">Item 2</DemoBox>,
      <DemoBox key="3">Item 3</DemoBox>,
    ],
  },
};

export const Directions: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Column (Default)</h3>
        <Stack direction="column" spacing="md">
          <DemoBox>First Item</DemoBox>
          <DemoBox>Second Item</DemoBox>
          <DemoBox>Third Item</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Row</h3>
        <Stack direction="row" spacing="md">
          <DemoBox>First</DemoBox>
          <DemoBox>Second</DemoBox>
          <DemoBox>Third</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Column Reverse</h3>
        <Stack direction="column-reverse" spacing="md">
          <DemoBox>First Item</DemoBox>
          <DemoBox>Second Item</DemoBox>
          <DemoBox>Third Item</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Row Reverse</h3>
        <Stack direction="row-reverse" spacing="md">
          <DemoBox>First</DemoBox>
          <DemoBox>Second</DemoBox>
          <DemoBox>Third</DemoBox>
        </Stack>
      </div>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Extra Small Spacing</h3>
        <Stack spacing="xs">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Spacing</h3>
        <Stack spacing="sm">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Spacing (Default)</h3>
        <Stack spacing="md">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Spacing</h3>
        <Stack spacing="lg">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Align Start</h3>
        <Stack direction="row" align="start" spacing="md" className="h-24 bg-muted rounded-md p-4">
          <DemoBox>Short</DemoBox>
          <DemoBox>Medium Height Content</DemoBox>
          <DemoBox>Tall</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Align Center</h3>
        <Stack direction="row" align="center" spacing="md" className="h-24 bg-muted rounded-md p-4">
          <DemoBox>Short</DemoBox>
          <DemoBox>Medium Height Content</DemoBox>
          <DemoBox>Tall</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Align End</h3>
        <Stack direction="row" align="end" spacing="md" className="h-24 bg-muted rounded-md p-4">
          <DemoBox>Short</DemoBox>
          <DemoBox>Medium Height Content</DemoBox>
          <DemoBox>Tall</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Align Stretch</h3>
        <Stack direction="row" align="stretch" spacing="md" className="h-24 bg-muted rounded-md p-4">
          <DemoBox>Stretched</DemoBox>
          <DemoBox>All Same Height</DemoBox>
          <DemoBox>When Stretched</DemoBox>
        </Stack>
      </div>
    </div>
  ),
};

export const Justification: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Start</h3>
        <Stack direction="row" justify="start" spacing="md" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Center</h3>
        <Stack direction="row" justify="center" spacing="md" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Between</h3>
        <Stack direction="row" justify="between" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Justify Around</h3>
        <Stack direction="row" justify="around" className="bg-muted rounded-md p-4">
          <DemoBox>Item 1</DemoBox>
          <DemoBox>Item 2</DemoBox>
          <DemoBox>Item 3</DemoBox>
        </Stack>
      </div>
    </div>
  ),
};

export const WithDividers: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical Stack with Dividers</h3>
        <Stack divider spacing="md" className="bg-background border rounded-lg p-4">
          <div className="p-2">First Section</div>
          <div className="p-2">Second Section</div>
          <div className="p-2">Third Section</div>
          <div className="p-2">Fourth Section</div>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Horizontal Stack with Dividers</h3>
        <Stack direction="row" divider spacing="md" className="bg-background border rounded-lg p-4">
          <div className="p-2">Section A</div>
          <div className="p-2">Section B</div>
          <div className="p-2">Section C</div>
          <div className="p-2">Section D</div>
        </Stack>
      </div>
    </div>
  ),
};

export const ConvenienceComponents: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">VStack (Vertical Stack)</h3>
        <VStack spacing="md">
          <DemoBox>VStack Item 1</DemoBox>
          <DemoBox>VStack Item 2</DemoBox>
          <DemoBox>VStack Item 3</DemoBox>
        </VStack>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">HStack (Horizontal Stack)</h3>
        <HStack spacing="md">
          <DemoBox>HStack Item 1</DemoBox>
          <DemoBox>HStack Item 2</DemoBox>
          <DemoBox>HStack Item 3</DemoBox>
        </HStack>
      </div>
    </div>
  ),
};

// Healthcare Examples
export const PatientInfoCard: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Healthcare Layout Examples</h3>
      
      <Box className="max-w-md mx-auto bg-white border rounded-lg shadow-md">
        <VStack spacing="none">
          {/* Header */}
          <Box className="bg-blue-50 p-4 border-b">
            <HStack align="center" justify="between">
              <HStack align="center" spacing="sm">
                <User className="w-5 h-5 text-blue-600" />
                <div className="font-semibold text-blue-900">John Doe</div>
              </HStack>
              <div className="text-sm text-blue-600">MRN: 123456</div>
            </HStack>
          </Box>
          
          {/* Patient Details */}
          <VStack divider spacing="md" className="p-4">
            <HStack justify="between">
              <span className="text-muted-foreground">Date of Birth:</span>
              <span className="font-medium">01/15/1980</span>
            </HStack>
            
            <HStack justify="between">
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium">44 years</span>
            </HStack>
            
            <HStack justify="between">
              <span className="text-muted-foreground">Blood Type:</span>
              <span className="font-medium">O+</span>
            </HStack>
            
            <HStack justify="between">
              <span className="text-muted-foreground">Primary Care:</span>
              <span className="font-medium">Dr. Smith</span>
            </HStack>
          </VStack>
          
          {/* Action Buttons */}
          <Box className="border-t p-4">
            <HStack spacing="sm">
              <Button size="sm" className="flex-1">View Chart</Button>
              <Button variant="outline" size="sm" className="flex-1">Schedule</Button>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </div>
  ),
};

export const VitalSignsDisplay: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Vital Signs Layout</h3>
      
      <Box className="bg-green-50 border border-green-200 rounded-lg p-6">
        <VStack spacing="lg">
          <HStack align="center" justify="between">
            <HStack align="center" spacing="sm">
              <Activity className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-semibold text-green-900">Current Vitals</h4>
            </HStack>
            <div className="text-sm text-green-600">Updated 5 min ago</div>
          </HStack>
          
          <Stack direction="row" spacing="lg" wrap="wrap">
            <VStack align="center" spacing="xs" className="min-w-[120px]">
              <Heart className="w-8 h-8 text-red-500" />
              <div className="text-2xl font-bold">72</div>
              <div className="text-sm text-muted-foreground">BPM</div>
            </VStack>
            
            <VStack align="center" spacing="xs" className="min-w-[120px]">
              <Activity className="w-8 h-8 text-blue-500" />
              <div className="text-2xl font-bold">120/80</div>
              <div className="text-sm text-muted-foreground">mmHg</div>
            </VStack>
            
            <VStack align="center" spacing="xs" className="min-w-[120px]">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">°</div>
              <div className="text-2xl font-bold">98.6</div>
              <div className="text-sm text-muted-foreground">°F</div>
            </VStack>
            
            <VStack align="center" spacing="xs" className="min-w-[120px]">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">O₂</div>
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground">SpO₂</div>
            </VStack>
          </Stack>
        </VStack>
      </Box>
    </div>
  ),
};

export const AppointmentSchedule: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Appointment Schedule</h3>
      
      <Box className="bg-background border rounded-lg">
        <VStack spacing="none">
          <Box className="bg-muted p-4 border-b">
            <HStack align="center" justify="between">
              <HStack align="center" spacing="sm">
                <Calendar className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Today's Appointments</h4>
              </HStack>
              <div className="text-sm text-muted-foreground">March 15, 2024</div>
            </HStack>
          </Box>
          
          <VStack spacing="none">
            {[
              { time: '9:00 AM', patient: 'Sarah Johnson', type: 'Routine Checkup', status: 'confirmed' },
              { time: '10:30 AM', patient: 'Michael Chen', type: 'Follow-up', status: 'in-progress' },
              { time: '11:45 AM', patient: 'Emily Davis', type: 'Consultation', status: 'waiting' },
              { time: '2:00 PM', patient: 'Robert Smith', type: 'Physical Exam', status: 'scheduled' },
            ].map((appointment, index) => (
              <Box key={index} className="p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                <HStack justify="between" align="start">
                  <HStack spacing="md" align="start">
                    <VStack align="center" spacing="xs" className="min-w-[80px]">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm font-medium">{appointment.time}</div>
                    </VStack>
                    
                    <VStack spacing="xs" align="start">
                      <div className="font-medium">{appointment.patient}</div>
                      <div className="text-sm text-muted-foreground">{appointment.type}</div>
                    </VStack>
                  </HStack>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </div>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </Box>
    </div>
  ),
};

export const MedicalAlerts: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Medical Alerts & Notifications</h3>
      
      <VStack spacing="md">
        <Box className="bg-red-50 border border-red-200 rounded-lg p-4">
          <HStack align="start" spacing="sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <VStack spacing="xs" align="start">
              <div className="font-semibold text-red-900">Critical Drug Allergy</div>
              <div className="text-sm text-red-700">Patient is allergic to Penicillin. Severe reaction documented.</div>
              <div className="text-xs text-red-600">Last updated: 2 days ago</div>
            </VStack>
          </HStack>
        </Box>
        
        <Box className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <HStack align="start" spacing="sm">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <VStack spacing="xs" align="start">
              <div className="font-semibold text-yellow-900">Medication Due</div>
              <div className="text-sm text-yellow-700">Metformin 500mg scheduled for 2:00 PM</div>
              <div className="text-xs text-yellow-600">Due in 30 minutes</div>
            </VStack>
          </HStack>
        </Box>
        
        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <HStack align="start" spacing="sm">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <VStack spacing="xs" align="start">
              <div className="font-semibold text-blue-900">Lab Results Available</div>
              <div className="text-sm text-blue-700">Complete Blood Count results ready for review</div>
              <div className="text-xs text-blue-600">Received 1 hour ago</div>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </div>
  ),
};

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Responsive Dashboard Layout</h3>
      
      <Stack direction="row" spacing="lg" wrap="wrap" className="min-h-[400px]">
        {/* Sidebar */}
        <VStack spacing="md" className="min-w-[200px] flex-shrink-0">
          <Box className="bg-primary text-primary-foreground p-4 rounded-lg">
            <HStack align="center" spacing="sm">
              <Stethoscope className="w-5 h-5" />
              <span className="font-semibold">Quick Actions</span>
            </HStack>
          </Box>
          
          <VStack spacing="sm">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              New Patient
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Lab Orders
            </Button>
          </VStack>
        </VStack>
        
        {/* Main Content */}
        <VStack spacing="lg" className="flex-1 min-w-[300px]">
          <Box className="bg-card border rounded-lg p-6">
            <VStack spacing="md">
              <h4 className="text-lg font-semibold">Patient Summary</h4>
              <HStack spacing="lg" wrap="wrap">
                <VStack align="center" spacing="xs">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-muted-foreground">Today's Patients</div>
                </VStack>
                <VStack align="center" spacing="xs">
                  <div className="text-2xl font-bold text-green-600">18</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </VStack>
                <VStack align="center" spacing="xs">
                  <div className="text-2xl font-bold text-yellow-600">6</div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </VStack>
              </HStack>
            </VStack>
          </Box>
          
          <HStack spacing="md" wrap="wrap">
            <Box className="bg-medical border border-blue-200 rounded-lg p-4 flex-1 min-w-[200px]">
              <VStack spacing="sm">
                <HStack align="center" spacing="sm">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Critical Care</span>
                </HStack>
                <div className="text-2xl font-bold text-blue-800">3</div>
                <div className="text-sm text-blue-700">Patients requiring immediate attention</div>
              </VStack>
            </Box>
            
            <Box className="bg-clinical border border-green-200 rounded-lg p-4 flex-1 min-w-[200px]">
              <VStack spacing="sm">
                <HStack align="center" spacing="sm">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Stable</span>
                </HStack>
                <div className="text-2xl font-bold text-green-800">21</div>
                <div className="text-sm text-green-700">Patients in stable condition</div>
              </VStack>
            </Box>
          </HStack>
        </VStack>
      </Stack>
    </div>
  ),
};