import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Atoms/TextArea',
  component: TextArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'TextArea component following Atlassian Design System patterns. Provides a comprehensive multiline text input interface with support for variants, sizes, auto-resize, character counting, validation, and healthcare-specific use cases.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    required: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    autoResize: {
      control: 'boolean',
    },
    showCharCount: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    label: 'Additional comments',
    placeholder: 'Enter your comments here...',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        variant="default"
        label="Default variant"
        placeholder="Enter text"
        defaultValue="This is a default text area with some sample content."
      />
      <TextArea 
        variant="success"
        label="Success variant"
        placeholder="Enter text"
        defaultValue="This input is valid and properly formatted."
      />
      <TextArea 
        variant="warning"
        label="Warning variant"
        placeholder="Enter text"
        defaultValue="This input needs attention or review."
      />
      <TextArea 
        variant="danger"
        label="Danger variant"
        placeholder="Enter text"
        error="This field has validation errors"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        size="sm"
        label="Small text area"
        placeholder="Small input area"
        defaultValue="Small text area with compact sizing."
      />
      <TextArea 
        size="md"
        label="Medium text area (default)"
        placeholder="Medium input area"
        defaultValue="Medium text area with standard sizing."
      />
      <TextArea 
        size="lg"
        label="Large text area"
        placeholder="Large input area"
        defaultValue="Large text area with expanded sizing for more content."
      />
    </div>
  ),
};

export const ResizeOptions: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        resize="none"
        label="No resize"
        placeholder="This text area cannot be resized"
        defaultValue="Fixed size text area."
      />
      <TextArea 
        resize="vertical"
        label="Vertical resize only (default)"
        placeholder="Can resize vertically only"
        defaultValue="This text area can be resized vertically but not horizontally."
      />
      <TextArea 
        resize="horizontal"
        label="Horizontal resize only"
        placeholder="Can resize horizontally only"
        defaultValue="This text area can be resized horizontally but not vertically."
      />
      <TextArea 
        resize="both"
        label="Both directions"
        placeholder="Can resize in both directions"
        defaultValue="This text area can be resized in both horizontal and vertical directions."
      />
    </div>
  ),
};

export const AutoResize: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        label="Auto-resizing text area"
        placeholder="Type here and watch it grow..."
        description="This text area automatically expands as you type"
        autoResize
      />
      <TextArea 
        label="Fixed height text area"
        placeholder="This has a fixed height"
        description="This text area maintains a fixed height"
        resize="none"
      />
    </div>
  ),
};

export const CharacterCounting: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        label="With character count"
        placeholder="Start typing to see character count"
        showCharCount
      />
      <TextArea 
        label="With character limit"
        placeholder="Type up to 100 characters"
        maxLength={100}
        description="Maximum 100 characters allowed"
      />
      <TextArea 
        label="Both count and limit"
        placeholder="Type here..."
        maxLength={150}
        showCharCount
        description="Shows both character count and limit"
      />
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        label="Patient notes"
        description="Detailed notes about the patient's condition and treatment"
        placeholder="Enter detailed patient notes..."
      />
      <TextArea 
        label="Discharge instructions"
        description="Instructions for the patient to follow after discharge"
        placeholder="Provide clear discharge instructions..."
        required
      />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        label="Valid notes"
        variant="success"
        defaultValue="Patient responded well to treatment. No adverse reactions observed. Continue current medication regimen."
        description="Notes are complete and properly formatted"
      />
      <TextArea 
        label="Needs review"
        variant="warning"
        defaultValue="Patient showed mild improvement..."
        description="These notes may need additional detail"
      />
      <TextArea 
        label="Invalid input"
        variant="danger"
        defaultValue="Too short"
        error="Please provide more detailed information (minimum 20 characters)"
        maxLength={500}
      />
      <TextArea 
        label="Required field"
        placeholder="This field is required"
        required
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <TextArea 
        label="Normal state"
        placeholder="Enter your text here"
      />
      <TextArea 
        label="Focused state"
        placeholder="This field is focused"
        autoFocus
      />
      <TextArea 
        label="Disabled state"
        placeholder="This field is disabled"
        defaultValue="This text area is disabled and cannot be edited"
        disabled
      />
      <TextArea 
        label="Read-only state"
        defaultValue="This content is read-only and cannot be modified by the user"
        readOnly
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Medical History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextArea 
            label="Chief Complaint"
            placeholder="What brings the patient in today?"
            description="Patient's primary concern or reason for visit"
            required
            maxLength={200}
            autoResize
          />
          <TextArea 
            label="History of Present Illness"
            placeholder="Detailed description of current symptoms..."
            description="Chronological account of current illness"
            maxLength={1000}
            showCharCount
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Assessment & Plan</h3>
        <div className="grid grid-cols-1 gap-6">
          <TextArea 
            label="Clinical Assessment"
            placeholder="Clinical findings and diagnostic impressions..."
            description="Healthcare provider's assessment of patient condition"
            variant="warning"
            maxLength={800}
            size="lg"
          />
          <TextArea 
            label="Treatment Plan"
            placeholder="Detailed treatment plan and next steps..."
            description="Comprehensive plan for patient care"
            required
            maxLength={600}
            autoResize
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Communication</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextArea 
            label="Patient Education"
            placeholder="Information provided to patient..."
            description="Educational content shared with patient"
            maxLength={400}
            size="sm"
          />
          <TextArea 
            label="Discharge Instructions"
            placeholder="Post-visit instructions for patient..."
            description="Clear instructions for patient to follow at home"
            required
            maxLength={500}
            variant="success"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Notes</h3>
        <div className="grid grid-cols-1 gap-6">
          <TextArea 
            label="Progress Notes"
            placeholder="Patient's progress since last visit..."
            description="Documentation of patient's clinical progress"
            defaultValue="Patient shows significant improvement in mobility. Pain levels have decreased from 8/10 to 4/10. Patient is compliant with medication regimen and physical therapy exercises."
            maxLength={1200}
            showCharCount
            autoResize
          />
          <TextArea 
            label="Procedure Notes"
            placeholder="Detailed procedure documentation..."
            description="Step-by-step documentation of procedures performed"
            maxLength={800}
            resize="vertical"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Quality & Safety</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextArea 
            label="Adverse Events"
            placeholder="Any adverse events or complications..."
            description="Documentation of any negative outcomes"
            variant="danger"
            maxLength={400}
            size="sm"
          />
          <TextArea 
            label="Quality Measures"
            placeholder="Quality indicators and measures met..."
            description="Quality metrics and compliance notes"
            variant="success"
            maxLength={300}
            size="sm"
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [clinicalNote, setClinicalNote] = React.useState('');
    const [assessment, setAssessment] = React.useState('');
    const [plan, setPlan] = React.useState('');
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validateNote = (value: string, field: string) => {
      const newErrors = { ...errors };
      
      if (field === 'clinicalNote') {
        if (value.length < 20) {
          newErrors.clinicalNote = 'Clinical note must be at least 20 characters';
        } else {
          delete newErrors.clinicalNote;
        }
      }
      
      if (field === 'assessment') {
        if (value.length < 10) {
          newErrors.assessment = 'Assessment must be at least 10 characters';
        } else {
          delete newErrors.assessment;
        }
      }
      
      if (field === 'plan') {
        if (value.length < 15) {
          newErrors.plan = 'Treatment plan must be at least 15 characters';
        } else {
          delete newErrors.plan;
        }
      }
      
      setErrors(newErrors);
    };

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setClinicalNote(value);
      validateNote(value, 'clinicalNote');
    };

    const handleAssessmentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setAssessment(value);
      validateNote(value, 'assessment');
    };

    const handlePlanChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setPlan(value);
      validateNote(value, 'plan');
    };

    const getSeverityLevel = () => {
      const totalLength = clinicalNote.length + assessment.length + plan.length;
      if (totalLength < 100) return { level: 'Brief', color: 'warning', description: 'Documentation may need more detail' };
      if (totalLength < 300) return { level: 'Adequate', color: 'success', description: 'Good level of documentation' };
      return { level: 'Comprehensive', color: 'success', description: 'Thorough documentation' };
    };

    const severity = getSeverityLevel();
    const isComplete = clinicalNote.length >= 20 && assessment.length >= 10 && plan.length >= 15;

    return (
      <div className="space-y-6">
        <div className="space-y-6">
          <TextArea 
            label="Clinical Notes"
            placeholder="Document patient encounter, symptoms, and observations..."
            value={clinicalNote}
            onChange={handleNoteChange}
            error={errors.clinicalNote}
            description="Detailed documentation of patient encounter"
            maxLength={500}
            autoResize
            required
          />
          
          <TextArea 
            label="Clinical Assessment"
            placeholder="Provider's assessment and diagnostic impressions..."
            value={assessment}
            onChange={handleAssessmentChange}
            error={errors.assessment}
            description="Healthcare provider's clinical assessment"
            maxLength={300}
            variant={assessment.length > 50 ? 'success' : 'default'}
            required
          />
          
          <TextArea 
            label="Treatment Plan"
            placeholder="Detailed treatment plan, medications, follow-up..."
            value={plan}
            onChange={handlePlanChange}
            error={errors.plan}
            description="Comprehensive care plan for patient"
            maxLength={400}
            autoResize
            required
          />
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-3">Documentation Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <span className="font-medium">Clinical Notes:</span>{' '}
              <span className={clinicalNote.length >= 20 ? 'text-success' : 'text-muted-foreground'}>
                {clinicalNote.length}/500 characters
              </span>
            </div>
            <div>
              <span className="font-medium">Assessment:</span>{' '}
              <span className={assessment.length >= 10 ? 'text-success' : 'text-muted-foreground'}>
                {assessment.length}/300 characters
              </span>
            </div>
            <div>
              <span className="font-medium">Treatment Plan:</span>{' '}
              <span className={plan.length >= 15 ? 'text-success' : 'text-muted-foreground'}>
                {plan.length}/400 characters
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium">Documentation Level:</span>{' '}
              <span className={`font-semibold ${
                severity.color === 'success' ? 'text-success' : 
                severity.color === 'warning' ? 'text-warning' : 'text-muted-foreground'
              }`}>
                {severity.level}
              </span>
              <div className="text-xs text-muted-foreground mt-1">{severity.description}</div>
            </div>
            
            <div className={`mt-3 p-3 rounded border text-sm ${
              isComplete && Object.keys(errors).length === 0
                ? 'bg-success/10 border-success/20 text-success'
                : 'bg-warning/10 border-warning/20 text-warning'
            }`}>
              {isComplete && Object.keys(errors).length === 0 ? (
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  Clinical documentation is complete and meets requirements
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">📝</span>
                  Please complete all required sections with adequate detail
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};