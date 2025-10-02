import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioGroup } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Atoms/Radio',
  component: Radio,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Radio button component following Atlassian Design System patterns. Provides an accessible radio button interface with support for variants, sizes, labels, and descriptions. Best used within RadioGroup for multiple options.',
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
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <Radio value="option1" label="Default radio button" />
    </RadioGroup>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default</h3>
        <RadioGroup defaultValue="default">
          <Radio value="default" variant="default" label="Default variant" />
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Success</h3>
        <RadioGroup defaultValue="success">
          <Radio value="success" variant="success" label="Success variant" />
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Warning</h3>
        <RadioGroup defaultValue="warning">
          <Radio value="warning" variant="warning" label="Warning variant" />
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Danger</h3>
        <RadioGroup defaultValue="danger">
          <Radio value="danger" variant="danger" label="Danger variant" />
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Small</h3>
        <RadioGroup defaultValue="small">
          <Radio value="small" size="sm" label="Small radio button" />
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium (Default)</h3>
        <RadioGroup defaultValue="medium">
          <Radio value="medium" size="md" label="Medium radio button" />
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large</h3>
        <RadioGroup defaultValue="large">
          <Radio value="large" size="lg" label="Large radio button" />
        </RadioGroup>
      </div>
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-6">
      <RadioGroup defaultValue="option1">
        <Radio 
          value="option1" 
          label="Radio with description"
          description="This is a helpful description that explains the option"
        />
        <Radio 
          value="option2" 
          label="Another option"
          description="This option has different implications"
        />
        <Radio 
          value="option3" 
          label="Third option"
          description="Consider this option for specific use cases"
        />
      </RadioGroup>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default State</h3>
        <RadioGroup>
          <Radio value="unchecked" label="Unchecked radio button" />
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Checked State</h3>
        <RadioGroup defaultValue="checked">
          <Radio value="checked" label="Checked radio button" />
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Disabled States</h3>
        <div className="space-y-3">
          <RadioGroup>
            <Radio value="disabled-unchecked" label="Disabled unchecked" disabled />
          </RadioGroup>
          <RadioGroup defaultValue="disabled-checked">
            <Radio value="disabled-checked" label="Disabled checked" disabled />
          </RadioGroup>
        </div>
      </div>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Status</h3>
        <RadioGroup defaultValue="stable">
          <Radio 
            value="stable" 
            variant="success"
            label="Stable"
            description="Patient condition is stable and improving"
          />
          <Radio 
            value="monitoring" 
            variant="warning"
            label="Under Monitoring"
            description="Patient requires close observation"
          />
          <Radio 
            value="critical" 
            variant="danger"
            label="Critical"
            description="Patient in critical condition requiring immediate attention"
          />
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Pain Level Assessment</h3>
        <RadioGroup>
          <Radio 
            value="no-pain" 
            variant="success"
            label="No Pain (0)"
            description="No pain experienced"
          />
          <Radio 
            value="mild-pain" 
            label="Mild Pain (1-3)"
            description="Minor discomfort, able to function normally"
          />
          <Radio 
            value="moderate-pain" 
            variant="warning"
            label="Moderate Pain (4-6)"
            description="Noticeable pain that interferes with activities"
          />
          <Radio 
            value="severe-pain" 
            variant="danger"
            label="Severe Pain (7-10)"
            description="Intense pain that prevents normal activities"
          />
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Consent Status</h3>
        <RadioGroup defaultValue="given">
          <Radio 
            value="given" 
            variant="success"
            label="Consent Given"
            description="Patient has provided informed consent"
          />
          <Radio 
            value="refused" 
            variant="danger"
            label="Consent Refused"
            description="Patient has refused the procedure/treatment"
          />
          <Radio 
            value="pending" 
            variant="warning"
            label="Consent Pending"
            description="Waiting for patient decision"
          />
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Appointment Type</h3>
        <RadioGroup>
          <Radio 
            value="routine" 
            label="Routine Check-up"
            description="Standard preventive care appointment"
          />
          <Radio 
            value="follow-up" 
            variant="warning"
            label="Follow-up Visit"
            description="Post-treatment or diagnostic follow-up"
          />
          <Radio 
            value="urgent" 
            variant="danger"
            label="Urgent Care"
            description="Non-emergency urgent medical care"
          />
          <Radio 
            value="consultation" 
            label="Specialist Consultation"
            description="Consultation with medical specialist"
          />
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medication Adherence</h3>
        <RadioGroup>
          <Radio 
            value="excellent" 
            variant="success"
            label="Excellent (90-100%)"
            description="Takes medication as prescribed consistently"
          />
          <Radio 
            value="good" 
            label="Good (75-89%)"
            description="Takes medication most of the time"
          />
          <Radio 
            value="fair" 
            variant="warning"
            label="Fair (50-74%)"
            description="Sometimes misses medication doses"
          />
          <Radio 
            value="poor" 
            variant="danger"
            label="Poor (<50%)"
            description="Frequently misses medication doses"
          />
        </RadioGroup>
      </div>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    const [riskLevel, setRiskLevel] = React.useState('');
    const [treatmentPlan, setTreatmentPlan] = React.useState('');
    
    const getRiskDescription = (risk: string) => {
      const descriptions = {
        low: 'Patient presents minimal risk factors. Standard monitoring protocols apply.',
        moderate: 'Patient has some risk factors. Increased monitoring recommended.',
        high: 'Patient has significant risk factors. Intensive monitoring and preventive measures required.',
        critical: 'Patient at immediate risk. Emergency protocols should be activated.'
      };
      return descriptions[risk as keyof typeof descriptions] || '';
    };

    const getTreatmentDescription = (treatment: string) => {
      const descriptions = {
        conservative: 'Non-invasive treatment approach with lifestyle modifications and medications.',
        moderate: 'Combination therapy including medications and minor procedures.',
        aggressive: 'Intensive treatment protocol including major interventions.',
        palliative: 'Comfort-focused care to improve quality of life.'
      };
      return descriptions[treatment as keyof typeof descriptions] || '';
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
            <RadioGroup value={riskLevel} onValueChange={setRiskLevel}>
              <Radio 
                value="low" 
                variant="success"
                label="Low Risk"
                description="Minimal risk factors present"
              />
              <Radio 
                value="moderate" 
                variant="warning"
                label="Moderate Risk"
                description="Some risk factors identified"
              />
              <Radio 
                value="high" 
                variant="danger"
                label="High Risk"
                description="Multiple risk factors present"
              />
              <Radio 
                value="critical" 
                variant="danger"
                label="Critical Risk"
                description="Immediate intervention required"
              />
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Treatment Approach</h3>
            <RadioGroup value={treatmentPlan} onValueChange={setTreatmentPlan}>
              <Radio 
                value="conservative" 
                variant="success"
                label="Conservative Treatment"
                description="Minimal intervention approach"
              />
              <Radio 
                value="moderate" 
                label="Moderate Treatment"
                description="Standard intervention protocol"
              />
              <Radio 
                value="aggressive" 
                variant="warning"
                label="Aggressive Treatment"
                description="Intensive intervention required"
              />
              <Radio 
                value="palliative" 
                label="Palliative Care"
                description="Comfort and quality of life focus"
              />
            </RadioGroup>
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-3">Assessment Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Risk Level:</span>{' '}
              {riskLevel ? (
                <>
                  <span className={`capitalize ${
                    riskLevel === 'low' ? 'text-success' :
                    riskLevel === 'moderate' ? 'text-warning' :
                    'text-danger'
                  }`}>
                    {riskLevel}
                  </span>
                  <div className="text-muted-foreground mt-1">
                    {getRiskDescription(riskLevel)}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">Not assessed</span>
              )}
            </div>
            
            <div>
              <span className="font-medium">Treatment Plan:</span>{' '}
              {treatmentPlan ? (
                <>
                  <span className="capitalize text-primary">{treatmentPlan}</span>
                  <div className="text-muted-foreground mt-1">
                    {getTreatmentDescription(treatmentPlan)}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">Not selected</span>
              )}
            </div>
            
            {riskLevel && treatmentPlan && (
              <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
                <div className="flex items-center text-primary text-sm">
                  <span className="mr-2">📋</span>
                  Assessment complete. Treatment plan aligned with risk level.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};