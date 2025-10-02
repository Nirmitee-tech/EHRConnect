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
