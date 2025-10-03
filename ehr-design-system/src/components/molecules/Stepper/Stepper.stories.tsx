import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, StepperProgress } from './Stepper';
import { Button } from '../../atoms/Button/Button';
import { 
  UserPlus, 
  Shield, 
  FileText, 
  Calendar,
  CheckCircle2,
  Heart,
  Pill,
  Stethoscope,
  Activity,
  Phone,
  CreditCard,
  MapPin,
  Clock,
  Upload,
  Send,
  AlertCircle,
  Settings,
  Database,
  Lock
} from 'lucide-react';

const meta: Meta<typeof Stepper> = {
  title: 'Molecules/Stepper',
  component: Stepper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Stepper component guides users through multi-step processes in healthcare applications. Perfect for patient registration, treatment protocols, and complex workflows with clear progress indication.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    allowClickNavigation: {
      control: 'boolean',
    },
    showStepNumbers: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const basicSteps = [
  { id: 'step1', title: 'Personal Info', description: 'Basic patient information' },
  { id: 'step2', title: 'Insurance', description: 'Insurance verification' },
  { id: 'step3', title: 'Medical History', description: 'Past medical records' },
  { id: 'step4', title: 'Review', description: 'Confirm all details' },
];

export const Default: Story = {
  args: {
    steps: basicSteps,
    currentStep: 1,
    completedSteps: [0],
  },
};

export const Orientations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Horizontal Stepper</h3>
        <Stepper
          steps={basicSteps}
          currentStep={2}
          completedSteps={[0, 1]}
          orientation="horizontal"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical Stepper</h3>
        <div className="max-w-md">
          <Stepper
            steps={basicSteps}
            currentStep={1}
            completedSteps={[0]}
            orientation="vertical"
          />
        </div>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Stepper</h3>
        <Stepper
          steps={basicSteps}
          currentStep={2}
          completedSteps={[0, 1]}
          variant="default"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Pills Variant</h3>
        <Stepper
          steps={basicSteps}
          currentStep={2}
          completedSteps={[0, 1]}
          variant="pills"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Dots Variant</h3>
        <Stepper
          steps={basicSteps}
          currentStep={2}
          completedSteps={[0, 1]}
          variant="dots"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Arrows Variant</h3>
        <Stepper
          steps={basicSteps}
          currentStep={2}
          completedSteps={[0, 1]}
          variant="arrows"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Progress Variant</h3>
        <Stepper
          steps={basicSteps}
          currentStep={2}
          completedSteps={[0, 1]}
          variant="progress"
          showProgress
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Cards Variant</h3>
        <Stepper
          steps={basicSteps}
          currentStep={1}
          completedSteps={[0]}
          variant="cards"
          orientation="horizontal"
        />
      </div>
      
      <div className="max-w-md">
        <h3 className="text-lg font-semibold mb-4">Timeline Variant (Vertical)</h3>
        <Stepper
          steps={basicSteps}
          currentStep={2}
          completedSteps={[0, 1]}
          variant="timeline"
          orientation="vertical"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Minimal Variant</h3>
        <Stepper
          steps={basicSteps}
          currentStep={1}
          completedSteps={[0]}
          variant="minimal"
        />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Extra Small</h3>
        <Stepper
          steps={basicSteps}
          currentStep={1}
          completedSteps={[0]}
          size="xs"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Small</h3>
        <Stepper
          steps={basicSteps}
          currentStep={1}
          completedSteps={[0]}
          size="sm"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium (Default)</h3>
        <Stepper
          steps={basicSteps}
          currentStep={1}
          completedSteps={[0]}
          size="md"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large</h3>
        <Stepper
          steps={basicSteps}
          currentStep={1}
          completedSteps={[0]}
          size="lg"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Extra Large</h3>
        <Stepper
          steps={basicSteps}
          currentStep={1}
          completedSteps={[0]}
          size="xl"
        />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => {
    const iconSteps = [
      { 
        id: 'personal', 
        title: 'Personal Info', 
        description: 'Basic patient details',
        icon: <UserPlus className="w-4 h-4" />
      },
      { 
        id: 'insurance', 
        title: 'Insurance', 
        description: 'Verify coverage',
        icon: <Shield className="w-4 h-4" />
      },
      { 
        id: 'medical', 
        title: 'Medical History', 
        description: 'Past conditions',
        icon: <FileText className="w-4 h-4" />
      },
      { 
        id: 'appointment', 
        title: 'Schedule', 
        description: 'Book appointment',
        icon: <Calendar className="w-4 h-4" />
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Horizontal with Icons</h3>
          <Stepper
            steps={iconSteps}
            currentStep={2}
            completedSteps={[0, 1]}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Vertical with Icons</h3>
          <div className="max-w-md">
            <Stepper
              steps={iconSteps}
              currentStep={2}
              completedSteps={[0, 1]}
              orientation="vertical"
            />
          </div>
        </div>
      </div>
    );
  },
};

export const StepStates: Story = {
  render: () => {
    const stateSteps = [
      { id: 'completed', title: 'Completed Step', description: 'This step is done' },
      { id: 'current', title: 'Current Step', description: 'Currently active' },
      { id: 'error', title: 'Error Step', description: 'Something went wrong' },
      { id: 'pending', title: 'Pending Step', description: 'Not yet started' },
      { id: 'skipped', title: 'Skipped Step', description: 'This step was skipped', optional: true },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Different Step States</h3>
          <Stepper
            steps={stateSteps}
            currentStep={1}
            completedSteps={[0]}
            errorSteps={[2]}
            skippedSteps={[4]}
          />
        </div>
        
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-4">Vertical States</h3>
          <Stepper
            steps={stateSteps}
            currentStep={1}
            completedSteps={[0]}
            errorSteps={[2]}
            skippedSteps={[4]}
            orientation="vertical"
          />
        </div>
      </div>
    );
  },
};

export const WithProgress: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = React.useState(1);
    const [completedSteps, setCompletedSteps] = React.useState([0]);

    const steps = [
      { id: 'info', title: 'Patient Info', description: 'Basic information' },
      { id: 'insurance', title: 'Insurance', description: 'Coverage details' },
      { id: 'history', title: 'History', description: 'Medical background' },
      { id: 'review', title: 'Review', description: 'Confirm details' },
      { id: 'complete', title: 'Complete', description: 'Registration done' },
    ];

    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        setCompletedSteps([...completedSteps, currentStep]);
        setCurrentStep(currentStep + 1);
      }
    };

    const handlePrev = () => {
      if (currentStep > 0) {
        setCompletedSteps(completedSteps.filter(step => step !== currentStep - 1));
        setCurrentStep(currentStep - 1);
      }
    };

    return (
      <div className="space-y-6">
        <StepperProgress
          totalSteps={steps.length}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
        
        <Stepper
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button 
            variant="primary" 
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    );
  },
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Registration - Cards Variant</h3>
        <Stepper
          variant="cards"
          steps={[
            { 
              id: 'demographics', 
              title: 'Demographics', 
              description: 'Basic patient information',
              icon: <UserPlus className="w-4 h-4" />,
              estimatedTime: '3 min'
            },
            { 
              id: 'insurance', 
              title: 'Insurance', 
              description: 'Coverage verification',
              icon: <Shield className="w-4 h-4" />,
              estimatedTime: '2 min'
            },
            { 
              id: 'medical-history', 
              title: 'Medical History', 
              description: 'Past conditions & allergies',
              icon: <FileText className="w-4 h-4" />,
              estimatedTime: '5 min'
            },
            { 
              id: 'consent', 
              title: 'Consent', 
              description: 'Legal agreements',
              icon: <CheckCircle2 className="w-4 h-4" />,
              estimatedTime: '2 min'
            },
          ]}
          currentStep={1}
          completedSteps={[0]}
          showEstimatedTime
          showProgress
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Assessment - Timeline Variant</h3>
        <div className="max-w-2xl">
          <Stepper
            variant="timeline"
            orientation="vertical"
            steps={[
              { 
                id: 'vitals', 
                title: 'Vital Signs', 
                description: 'Blood pressure, temperature, pulse, respiratory rate',
                icon: <Activity className="w-4 h-4" />,
                estimatedTime: '5 min',
                requirement: 'Required for all visits'
              },
              { 
                id: 'chief-complaint', 
                title: 'Chief Complaint', 
                description: 'Primary reason for today\'s visit',
                icon: <Stethoscope className="w-4 h-4" />,
                estimatedTime: '3 min'
              },
              { 
                id: 'history', 
                title: 'History Taking', 
                description: 'History of present illness, review of systems',
                icon: <FileText className="w-4 h-4" />,
                estimatedTime: '10 min'
              },
              { 
                id: 'examination', 
                title: 'Physical Exam', 
                description: 'Systematic physical examination',
                icon: <Heart className="w-4 h-4" />,
                estimatedTime: '15 min'
              },
              { 
                id: 'assessment', 
                title: 'Assessment', 
                description: 'Clinical diagnosis and treatment plan',
                icon: <CheckCircle2 className="w-4 h-4" />,
                estimatedTime: '8 min'
              },
            ]}
            currentStep={2}
            completedSteps={[0, 1]}
            warningSteps={[]}
            showEstimatedTime
            size="lg"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Surgery Protocol - Arrows Variant</h3>
        <Stepper
          variant="arrows"
          steps={[
            { 
              id: 'pre-op', 
              title: 'Pre-Operative', 
              description: 'Patient preparation and consent',
              icon: <FileText className="w-4 h-4" />
            },
            { 
              id: 'anesthesia', 
              title: 'Anesthesia', 
              description: 'Anesthesia administration',
              icon: <Pill className="w-4 h-4" />
            },
            { 
              id: 'procedure', 
              title: 'Procedure', 
              description: 'Surgical intervention',
              icon: <Settings className="w-4 h-4" />
            },
            { 
              id: 'recovery', 
              title: 'Recovery', 
              description: 'Post-operative monitoring',
              icon: <Activity className="w-4 h-4" />
            },
            { 
              id: 'discharge', 
              title: 'Discharge', 
              description: 'Patient discharge planning',
              icon: <CheckCircle2 className="w-4 h-4" />
            },
          ]}
          currentStep={2}
          completedSteps={[0, 1]}
          size="md"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Processing - Progress Variant</h3>
        <Stepper
          variant="progress"
          steps={[
            { 
              id: 'collection', 
              title: 'Collection', 
              description: 'Sample collection'
            },
            { 
              id: 'processing', 
              title: 'Processing', 
              description: 'Lab processing'
            },
            { 
              id: 'analysis', 
              title: 'Analysis', 
              description: 'Result analysis'
            },
            { 
              id: 'review', 
              title: 'Review', 
              description: 'Provider review'
            },
            { 
              id: 'results', 
              title: 'Results', 
              description: 'Patient notification'
            },
          ]}
          currentStep={3}
          completedSteps={[0, 1, 2]}
          showProgress
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medication Management - Pills Variant</h3>
        <Stepper
          variant="pills"
          steps={[
            { 
              id: 'review-history', 
              title: 'Review History', 
              description: 'Check current medications',
              icon: <FileText className="w-4 h-4" />
            },
            { 
              id: 'allergy-check', 
              title: 'Allergy Check', 
              description: 'Verify no allergies',
              icon: <AlertCircle className="w-4 h-4" />
            },
            { 
              id: 'select-medication', 
              title: 'Select Medication', 
              description: 'Choose appropriate drug',
              icon: <Pill className="w-4 h-4" />
            },
            { 
              id: 'interaction-check', 
              title: 'Interaction Check', 
              description: 'Drug interaction screening',
              icon: <Shield className="w-4 h-4" />
            },
            { 
              id: 'prescribe', 
              title: 'Prescribe', 
              description: 'Send to pharmacy',
              icon: <Send className="w-4 h-4" />
            },
          ]}
          currentStep={3}
          completedSteps={[0, 1, 2]}
          errorSteps={[]}
          orientation="horizontal"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Triage - Dots Variant with States</h3>
        <Stepper
          variant="dots"
          steps={[
            { 
              id: 'arrival', 
              title: 'Patient Arrival', 
              description: 'Initial registration'
            },
            { 
              id: 'triage', 
              title: 'Triage Assessment', 
              description: 'Priority evaluation'
            },
            { 
              id: 'waiting', 
              title: 'Waiting Room', 
              description: 'Awaiting treatment',
              optional: true
            },
            { 
              id: 'treatment', 
              title: 'Treatment', 
              description: 'Medical intervention'
            },
            { 
              id: 'disposition', 
              title: 'Disposition', 
              description: 'Discharge or admit'
            },
          ]}
          currentStep={3}
          completedSteps={[0, 1]}
          skippedSteps={[2]}
          warningSteps={[]}
          size="lg"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Assessment Workflow</h3>
        <div className="max-w-lg">
          <Stepper
            orientation="vertical"
            steps={[
              { 
                id: 'vitals', 
                title: 'Vital Signs', 
                description: 'Blood pressure, temperature, pulse',
                icon: <Activity className="w-4 h-4" />
              },
              { 
                id: 'chief-complaint', 
                title: 'Chief Complaint', 
                description: 'Primary reason for visit',
                icon: <Stethoscope className="w-4 h-4" />
              },
              { 
                id: 'history', 
                title: 'History of Present Illness', 
                description: 'Detailed symptom history',
                icon: <FileText className="w-4 h-4" />
              },
              { 
                id: 'examination', 
                title: 'Physical Examination', 
                description: 'Clinical examination findings',
                icon: <Heart className="w-4 h-4" />
              },
              { 
                id: 'assessment', 
                title: 'Assessment & Plan', 
                description: 'Diagnosis and treatment plan',
                icon: <CheckCircle2 className="w-4 h-4" />
              },
            ]}
            currentStep={3}
            completedSteps={[0, 1, 2]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Prescription Management Flow</h3>
        <Stepper
          steps={[
            { 
              id: 'review-patient', 
              title: 'Patient Review', 
              description: 'Review patient history & allergies',
              icon: <UserPlus className="w-4 h-4" />
            },
            { 
              id: 'medication-select', 
              title: 'Medication Selection', 
              description: 'Choose appropriate medication',
              icon: <Pill className="w-4 h-4" />
            },
            { 
              id: 'interaction-check', 
              title: 'Interaction Check', 
              description: 'Check for drug interactions',
              icon: <AlertCircle className="w-4 h-4" />
            },
            { 
              id: 'dosage-instructions', 
              title: 'Dosage & Instructions', 
              description: 'Set dosage and patient instructions',
              icon: <FileText className="w-4 h-4" />
            },
            { 
              id: 'send-pharmacy', 
              title: 'Send to Pharmacy', 
              description: 'Transmit to patient pharmacy',
              icon: <Send className="w-4 h-4" />
            },
          ]}
          currentStep={2}
          completedSteps={[0, 1]}
          errorSteps={[]}
          size="lg"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">System Setup & Configuration</h3>
        <div className="max-w-md">
          <Stepper
            orientation="vertical"
            steps={[
              { 
                id: 'system-check', 
                title: 'System Requirements', 
                description: 'Verify system compatibility',
                icon: <Settings className="w-4 h-4" />
              },
              { 
                id: 'database-setup', 
                title: 'Database Configuration', 
                description: 'Configure database connection',
                icon: <Database className="w-4 h-4" />
              },
              { 
                id: 'security-setup', 
                title: 'Security Settings', 
                description: 'Configure authentication & encryption',
                icon: <Lock className="w-4 h-4" />
              },
              { 
                id: 'user-accounts', 
                title: 'User Accounts', 
                description: 'Create admin and user accounts',
                icon: <UserPlus className="w-4 h-4" />
              },
              { 
                id: 'data-migration', 
                title: 'Data Migration', 
                description: 'Import existing patient data',
                icon: <Upload className="w-4 h-4" />,
                optional: true
              },
              { 
                id: 'testing', 
                title: 'System Testing', 
                description: 'Validate all functionality',
                icon: <CheckCircle2 className="w-4 h-4" />
              },
            ]}
            currentStep={3}
            completedSteps={[0, 1, 2]}
            skippedSteps={[4]}
            allowClickNavigation
            onStepClick={(step) => console.log(`Clicked step ${step}`)}
          />
        </div>
      </div>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    const [currentWorkflow, setCurrentWorkflow] = React.useState('registration');
    const [currentStep, setCurrentStep] = React.useState(0);
    const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
    const [errorSteps, setErrorSteps] = React.useState<number[]>([]);

    const workflows = {
      registration: {
        title: 'Patient Registration',
        steps: [
          { id: 'info', title: 'Basic Info', description: 'Name, DOB, contact', icon: <UserPlus className="w-4 h-4" /> },
          { id: 'address', title: 'Address', description: 'Home address details', icon: <MapPin className="w-4 h-4" /> },
          { id: 'insurance', title: 'Insurance', description: 'Coverage information', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'emergency', title: 'Emergency Contact', description: 'Emergency contact info', icon: <Phone className="w-4 h-4" /> },
          { id: 'complete', title: 'Complete', description: 'Registration finished', icon: <CheckCircle2 className="w-4 h-4" /> },
        ]
      },
      appointment: {
        title: 'Appointment Scheduling',
        steps: [
          { id: 'select-provider', title: 'Select Provider', description: 'Choose healthcare provider', icon: <UserPlus className="w-4 h-4" /> },
          { id: 'select-date', title: 'Date & Time', description: 'Choose appointment time', icon: <Calendar className="w-4 h-4" /> },
          { id: 'visit-type', title: 'Visit Type', description: 'Reason for visit', icon: <Stethoscope className="w-4 h-4" /> },
          { id: 'confirm', title: 'Confirm', description: 'Review appointment details', icon: <CheckCircle2 className="w-4 h-4" /> },
        ]
      },
      treatment: {
        title: 'Treatment Protocol',
        steps: [
          { id: 'assessment', title: 'Initial Assessment', description: 'Patient evaluation', icon: <Stethoscope className="w-4 h-4" /> },
          { id: 'diagnosis', title: 'Diagnosis', description: 'Clinical diagnosis', icon: <FileText className="w-4 h-4" /> },
          { id: 'plan', title: 'Treatment Plan', description: 'Develop treatment strategy', icon: <Heart className="w-4 h-4" /> },
          { id: 'medication', title: 'Prescriptions', description: 'Prescribe medications', icon: <Pill className="w-4 h-4" /> },
          { id: 'follow-up', title: 'Follow-up', description: 'Schedule follow-up care', icon: <Calendar className="w-4 h-4" /> },
        ]
      }
    };

    const currentWorkflowData = workflows[currentWorkflow as keyof typeof workflows];

    const handleNext = () => {
      if (currentStep < currentWorkflowData.steps.length - 1) {
        // Simulate possible error on step 2
        if (currentStep === 1 && Math.random() > 0.7) {
          setErrorSteps([...errorSteps, currentStep]);
          return;
        }

        setCompletedSteps([...completedSteps, currentStep]);
        setErrorSteps(errorSteps.filter(step => step !== currentStep));
        setCurrentStep(currentStep + 1);
      }
    };

    const handlePrev = () => {
      if (currentStep > 0) {
        setCompletedSteps(completedSteps.filter(step => step !== currentStep - 1));
        setCurrentStep(currentStep - 1);
      }
    };

    const handleStepClick = (stepIndex: number) => {
      if (stepIndex <= Math.max(...completedSteps, currentStep)) {
        setCurrentStep(stepIndex);
      }
    };

    const resetWorkflow = () => {
      setCurrentStep(0);
      setCompletedSteps([]);
      setErrorSteps([]);
    };

    const switchWorkflow = (workflow: string) => {
      setCurrentWorkflow(workflow);
      resetWorkflow();
    };

    const progress = ((completedSteps.length + (currentStep > completedSteps.length ? 1 : 0)) / currentWorkflowData.steps.length) * 100;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Interactive Healthcare Workflows</h3>
          <div className="flex gap-2 mb-6">
            {Object.entries(workflows).map(([key, workflow]) => (
              <Button
                key={key}
                variant={currentWorkflow === key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => switchWorkflow(key)}
              >
                {workflow.title}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/20 rounded-lg">
          <h4 className="font-semibold mb-3">{currentWorkflowData.title}</h4>
          
          <div className="mb-4">
            <StepperProgress
              totalSteps={currentWorkflowData.steps.length}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          <Stepper
            steps={currentWorkflowData.steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            errorSteps={errorSteps}
            allowClickNavigation
            onStepClick={handleStepClick}
            className="mb-6"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="sm"
              >
                Previous
              </Button>
              <Button 
                variant="primary" 
                onClick={handleNext}
                disabled={currentStep === currentWorkflowData.steps.length - 1}
                size="sm"
              >
                {currentStep === currentWorkflowData.steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={resetWorkflow}
              size="sm"
            >
              Reset
            </Button>
          </div>
          
          {errorSteps.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="font-medium">Error occurred on step {errorSteps[0] + 1}</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Please review the information and try again.
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-semibold text-blue-900 text-sm mb-1">Current Step Details</h5>
            <p className="text-blue-800 text-sm">
              <span className="font-medium">{currentWorkflowData.steps[currentStep].title}:</span>{' '}
              {currentWorkflowData.steps[currentStep].description}
            </p>
            <div className="text-blue-700 text-xs mt-2">
              Progress: {Math.round(progress)}% complete ({completedSteps.length + 1} of {currentWorkflowData.steps.length} steps)
            </div>
          </div>
        </div>
      </div>
    );
  },
};