import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Dropdown,
  type SelectOption,
} from './Select';
import { Label } from '../Label/Label';

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A select component for choosing from a list of options. Built on top of Radix UI Select primitive with healthcare-optimized styling.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="w-[300px]">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
            <SelectItem value="option4">Option 4</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Choose an option</Label>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const Gender: Story = {
  render: () => {
    const [gender, setGender] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Gender</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="unknown">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const Practitioner: Story = {
  render: () => {
    const [practitioner, setPractitioner] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Assigned Practitioner</Label>
        <Select value={practitioner} onValueChange={setPractitioner}>
          <SelectTrigger>
            <SelectValue placeholder="Select practitioner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dr-smith">Dr. Sarah Smith</SelectItem>
            <SelectItem value="dr-johnson">Dr. Michael Johnson</SelectItem>
            <SelectItem value="dr-williams">Dr. Emily Williams</SelectItem>
            <SelectItem value="dr-brown">Dr. James Brown</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const EncounterType: Story = {
  render: () => {
    const [encounterType, setEncounterType] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Encounter Type</Label>
        <Select value={encounterType} onValueChange={setEncounterType}>
          <SelectTrigger>
            <SelectValue placeholder="Select encounter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ambulatory">Ambulatory - Outpatient visit</SelectItem>
            <SelectItem value="emergency">Emergency - Emergency visit</SelectItem>
            <SelectItem value="inpatient">Inpatient - Hospital admission</SelectItem>
            <SelectItem value="home">Home - Home health visit</SelectItem>
            <SelectItem value="virtual">Virtual - Telemedicine</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const WithGroups: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Medical Department</Label>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Outpatient</SelectLabel>
              <SelectItem value="general">General Medicine</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Specialty</SelectLabel>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="oncology">Oncology</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Emergency</SelectLabel>
              <SelectItem value="er">Emergency Room</SelectItem>
              <SelectItem value="icu">Intensive Care Unit</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label>Disabled Select</Label>
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="This is disabled" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const DisabledOption: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Select with Disabled Option</Label>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select a priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="critical" disabled>
              Critical (Disabled)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const AllergyCriticality: Story = {
  render: () => {
    const [criticality, setCriticality] = useState('low');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Allergy Criticality</Label>
        <Select value={criticality} onValueChange={setCriticality}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="unable-to-assess">Unable to Assess</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const MedicationFrequency: Story = {
  render: () => {
    const [frequency, setFrequency] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Medication Frequency</Label>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue placeholder="How often?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once-daily">Once daily</SelectItem>
            <SelectItem value="twice-daily">Twice daily (BID)</SelectItem>
            <SelectItem value="three-times">Three times daily (TID)</SelectItem>
            <SelectItem value="four-times">Four times daily (QID)</SelectItem>
            <SelectItem value="every-4-hours">Every 4 hours</SelectItem>
            <SelectItem value="every-6-hours">Every 6 hours</SelectItem>
            <SelectItem value="as-needed">As needed (PRN)</SelectItem>
            <SelectItem value="at-bedtime">At bedtime (HS)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const MultipleSelects: Story = {
  render: () => {
    const [gender, setGender] = useState('');
    const [bloodType, setBloodType] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');

    return (
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Blood Type</Label>
          <Select value={bloodType} onValueChange={setBloodType}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a-positive">A+</SelectItem>
              <SelectItem value="a-negative">A-</SelectItem>
              <SelectItem value="b-positive">B+</SelectItem>
              <SelectItem value="b-negative">B-</SelectItem>
              <SelectItem value="o-positive">O+</SelectItem>
              <SelectItem value="o-negative">O-</SelectItem>
              <SelectItem value="ab-positive">AB+</SelectItem>
              <SelectItem value="ab-negative">AB-</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Marital Status</Label>
          <Select value={maritalStatus} onValueChange={setMaritalStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
};

export const ScrollableList: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="w-[300px] space-y-2">
        <Label>Select from Many Options</Label>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {[
              'United States',
              'United Kingdom',
              'Canada',
              'Australia',
              'Germany',
              'France',
              'India',
              'Japan',
              'China',
              'Brazil',
              'Mexico',
              'Italy',
              'Spain',
              'Netherlands',
              'Sweden',
              'Switzerland',
              'Singapore',
              'South Korea',
              'Thailand',
              'Malaysia',
            ].map((country) => (
              <SelectItem key={country.toLowerCase().replace(/\s/g, '-')} value={country.toLowerCase().replace(/\s/g, '-')}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
};

// Dropdown Component Stories
export const DropdownBasic: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    const basicOptions: SelectOption[] = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    return (
      <div className="w-[400px]">
        <Dropdown
          options={basicOptions}
          value={value}
          onValueChange={setValue}
          label="Basic Dropdown"
          placeholder="Select an option"
        />
      </div>
    );
  },
};

export const DropdownVariants: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');
    const [value4, setValue4] = useState('');
    
    const options: SelectOption[] = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    return (
      <div className="w-[400px] space-y-6">
        <Dropdown
          options={options}
          value={value1}
          onValueChange={setValue1}
          variant="default"
          label="Default variant"
          defaultValue="option1"
        />
        <Dropdown
          options={options}
          value={value2}
          onValueChange={setValue2}
          variant="success"
          label="Success variant"
          defaultValue="option2"
        />
        <Dropdown
          options={options}
          value={value3}
          onValueChange={setValue3}
          variant="warning"
          label="Warning variant"
          defaultValue="option3"
        />
        <Dropdown
          options={options}
          value={value4}
          onValueChange={setValue4}
          variant="danger"
          label="Danger variant"
          error="This field has an error"
        />
      </div>
    );
  },
};

export const DropdownSizes: Story = {
  render: () => {
    const [value1, setValue1] = useState('sm-value');
    const [value2, setValue2] = useState('md-value');
    const [value3, setValue3] = useState('lg-value');
    
    const options: SelectOption[] = [
      { value: 'sm-value', label: 'Small value' },
      { value: 'md-value', label: 'Medium value' },
      { value: 'lg-value', label: 'Large value' },
    ];

    return (
      <div className="w-[400px] space-y-6">
        <Dropdown
          options={options}
          value={value1}
          onValueChange={setValue1}
          size="sm"
          label="Small dropdown"
        />
        <Dropdown
          options={options}
          value={value2}
          onValueChange={setValue2}
          size="md"
          label="Medium dropdown (default)"
        />
        <Dropdown
          options={options}
          value={value3}
          onValueChange={setValue3}
          size="lg"
          label="Large dropdown"
        />
      </div>
    );
  },
};

export const DropdownSearchable: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    const medications: SelectOption[] = [
      { value: 'acetaminophen', label: 'Acetaminophen', description: 'Pain reliever and fever reducer' },
      { value: 'ibuprofen', label: 'Ibuprofen', description: 'Anti-inflammatory pain reliever' },
      { value: 'aspirin', label: 'Aspirin', description: 'Blood thinner and pain reliever' },
      { value: 'lisinopril', label: 'Lisinopril', description: 'ACE inhibitor for blood pressure' },
      { value: 'metformin', label: 'Metformin', description: 'Diabetes medication' },
      { value: 'atorvastatin', label: 'Atorvastatin', description: 'Cholesterol-lowering statin' },
      { value: 'omeprazole', label: 'Omeprazole', description: 'Proton pump inhibitor for acid reflux' },
      { value: 'amlodipine', label: 'Amlodipine', description: 'Calcium channel blocker' },
    ];

    return (
      <div className="w-[400px]">
        <Dropdown
          options={medications}
          value={value}
          onValueChange={setValue}
          label="Search medications"
          description="Start typing to search through medications"
          placeholder="Search for a medication..."
          searchable
          clearable
        />
      </div>
    );
  },
};

export const DropdownWithVariantOptions: Story = {
  render: () => {
    const [severity, setSeverity] = useState('');
    
    const severityOptions: SelectOption[] = [
      { 
        value: 'mild', 
        label: 'Mild', 
        description: 'Low severity symptoms',
        variant: 'success' 
      },
      { 
        value: 'moderate', 
        label: 'Moderate', 
        description: 'Moderate severity symptoms',
        variant: 'warning' 
      },
      { 
        value: 'severe', 
        label: 'Severe', 
        description: 'High severity symptoms',
        variant: 'danger' 
      },
      { 
        value: 'critical', 
        label: 'Critical', 
        description: 'Life-threatening symptoms',
        variant: 'danger',
        disabled: true
      },
    ];

    return (
      <div className="w-[400px]">
        <Dropdown
          options={severityOptions}
          value={severity}
          onValueChange={setSeverity}
          label="Symptom severity"
          description="Select the severity level of symptoms"
          placeholder="Choose severity level"
          required
        />
      </div>
    );
  },
};

export const DropdownHealthcareExamples: Story = {
  render: () => {
    const [bloodType, setBloodType] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');
    
    const bloodTypeOptions: SelectOption[] = [
      { value: 'o-positive', label: 'O+', description: 'O Positive (Universal donor for Rh+)' },
      { value: 'o-negative', label: 'O-', description: 'O Negative (Universal donor)', variant: 'success' },
      { value: 'a-positive', label: 'A+', description: 'A Positive' },
      { value: 'a-negative', label: 'A-', description: 'A Negative' },
      { value: 'b-positive', label: 'B+', description: 'B Positive' },
      { value: 'b-negative', label: 'B-', description: 'B Negative' },
      { value: 'ab-positive', label: 'AB+', description: 'AB Positive (Universal plasma donor)' },
      { value: 'ab-negative', label: 'AB-', description: 'AB Negative' },
    ];

    const specialtyOptions: SelectOption[] = [
      { value: 'cardiology', label: 'Cardiology', description: 'Heart and cardiovascular system' },
      { value: 'neurology', label: 'Neurology', description: 'Brain and nervous system' },
      { value: 'orthopedics', label: 'Orthopedics', description: 'Bones, joints, and muscles' },
      { value: 'oncology', label: 'Oncology', description: 'Cancer treatment and care', variant: 'warning' },
      { value: 'emergency', label: 'Emergency Medicine', description: 'Emergency and critical care', variant: 'danger' },
      { value: 'pediatrics', label: 'Pediatrics', description: 'Children healthcare' },
      { value: 'psychiatry', label: 'Psychiatry', description: 'Mental health care' },
    ];

    const priorityOptions: SelectOption[] = [
      { value: 'routine', label: 'Routine', description: 'Standard priority', variant: 'default' },
      { value: 'urgent', label: 'Urgent', description: 'Needs attention soon', variant: 'warning' },
      { value: 'stat', label: 'STAT', description: 'Immediate attention required', variant: 'danger' },
      { value: 'emergent', label: 'Emergent', description: 'Life-threatening emergency', variant: 'danger' },
    ];

    const statusOptions: SelectOption[] = [
      { value: 'active', label: 'Active', variant: 'success' },
      { value: 'inactive', label: 'Inactive', variant: 'default' },
      { value: 'pending', label: 'Pending', variant: 'warning' },
      { value: 'cancelled', label: 'Cancelled', variant: 'danger' },
      { value: 'completed', label: 'Completed', variant: 'success' },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              options={bloodTypeOptions}
              value={bloodType}
              onValueChange={setBloodType}
              label="Blood Type"
              description="Patient's blood type for transfusion compatibility"
              placeholder="Select blood type"
              searchable
              clearable
              required
            />
            <Dropdown
              options={specialtyOptions}
              value={specialty}
              onValueChange={setSpecialty}
              label="Medical Specialty"
              description="Primary medical specialty for referral"
              placeholder="Select specialty"
              searchable
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Case Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              options={priorityOptions}
              value={priority}
              onValueChange={setPriority}
              label="Case Priority"
              description="Urgency level for case handling"
              placeholder="Select priority level"
              required
            />
            <Dropdown
              options={statusOptions}
              value={status}
              onValueChange={setStatus}
              label="Case Status"
              description="Current status of the case"
              placeholder="Select status"
              clearable
            />
          </div>
        </div>
      </div>
    );
  },
};

export const DropdownInteractive: Story = {
  render: () => {
    const [diagnosis, setDiagnosis] = useState('');
    const [medication, setMedication] = useState('');
    const [dosage, setDosage] = useState('');
    
    const diagnosisOptions: SelectOption[] = [
      { value: 'hypertension', label: 'Essential Hypertension', description: 'I10 - High blood pressure' },
      { value: 'diabetes', label: 'Type 2 Diabetes', description: 'E11 - Non-insulin dependent diabetes', variant: 'warning' },
      { value: 'asthma', label: 'Bronchial Asthma', description: 'J45 - Chronic respiratory condition' },
      { value: 'depression', label: 'Major Depressive Disorder', description: 'F32 - Clinical depression' },
      { value: 'arthritis', label: 'Osteoarthritis', description: 'M19 - Joint degenerative disease' },
    ];

    const medicationOptions: SelectOption[] = diagnosis === 'hypertension' 
      ? [
          { value: 'lisinopril', label: 'Lisinopril', description: 'ACE inhibitor - 10mg daily' },
          { value: 'amlodipine', label: 'Amlodipine', description: 'Calcium channel blocker - 5mg daily' },
          { value: 'hydrochlorothiazide', label: 'Hydrochlorothiazide', description: 'Diuretic - 25mg daily' },
        ]
      : diagnosis === 'diabetes'
      ? [
          { value: 'metformin', label: 'Metformin', description: 'Biguanide - 500mg twice daily' },
          { value: 'glipizide', label: 'Glipizide', description: 'Sulfonylurea - 5mg daily' },
          { value: 'insulin', label: 'Insulin Glargine', description: 'Long-acting insulin - 10 units daily' },
        ]
      : [
          { value: 'generic1', label: 'Generic Medication 1', description: 'Standard treatment option' },
          { value: 'generic2', label: 'Generic Medication 2', description: 'Alternative treatment option' },
        ];

    const dosageOptions: SelectOption[] = [
      { value: 'low', label: 'Low Dose', description: 'Starting or maintenance dose', variant: 'success' },
      { value: 'standard', label: 'Standard Dose', description: 'Recommended therapeutic dose' },
      { value: 'high', label: 'High Dose', description: 'Maximum therapeutic dose', variant: 'warning' },
    ];

    // Reset dependent fields when diagnosis changes
    React.useEffect(() => {
      if (diagnosis) {
        setMedication('');
        setDosage('');
      }
    }, [diagnosis]);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Dropdown
            options={diagnosisOptions}
            value={diagnosis}
            onValueChange={setDiagnosis}
            label="Primary Diagnosis"
            description="Select primary diagnosis code"
            placeholder="Search diagnoses..."
            searchable
            clearable
            required
          />
          
          <Dropdown
            options={medicationOptions}
            value={medication}
            onValueChange={setMedication}
            label="Prescribed Medication"
            description="Select appropriate medication"
            placeholder={diagnosis ? "Choose medication..." : "Select diagnosis first"}
            disabled={!diagnosis}
            searchable
          />
          
          <Dropdown
            options={dosageOptions}
            value={dosage}
            onValueChange={setDosage}
            label="Dosage Level"
            description="Select dosage strength"
            placeholder={medication ? "Choose dosage..." : "Select medication first"}
            disabled={!medication}
          />
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Treatment Plan Summary:</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Diagnosis:</span>{' '}
              {diagnosis ? diagnosisOptions.find(d => d.value === diagnosis)?.label : 'Not selected'}
            </div>
            <div>
              <span className="font-medium">Medication:</span>{' '}
              {medication ? medicationOptions.find(m => m.value === medication)?.label : 'Not selected'}
            </div>
            <div>
              <span className="font-medium">Dosage:</span>{' '}
              {dosage ? dosageOptions.find(d => d.value === dosage)?.label : 'Not selected'}
            </div>
            {diagnosis && medication && dosage && (
              <div className="mt-2 p-2 bg-success/10 rounded border border-success/20 text-success text-sm">
                ✓ Treatment plan is complete and ready for review
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};
