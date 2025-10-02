import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Avatar } from '../../atoms/Avatar';

const meta: Meta<typeof Table> = {
  title: 'Molecules/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible table component for displaying tabular data with support for headers, footers, and custom styling.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const samplePatients = [
  { id: 1, name: 'John Doe', age: 45, gender: 'Male', mrn: 'MRN-001', status: 'Active' },
  { id: 2, name: 'Jane Smith', age: 32, gender: 'Female', mrn: 'MRN-002', status: 'Active' },
  { id: 3, name: 'Bob Johnson', age: 58, gender: 'Male', mrn: 'MRN-003', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', age: 28, gender: 'Female', mrn: 'MRN-004', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', age: 67, gender: 'Male', mrn: 'MRN-005', status: 'Active' },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>MRN</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {samplePatients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{patient.gender}</TableCell>
            <TableCell>{patient.mrn}</TableCell>
            <TableCell>
              <Badge variant={patient.status === 'Active' ? 'success' : 'secondary'}>
                {patient.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithContainer: Story = {
  render: () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>MRN</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samplePatients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.mrn}</TableCell>
              <TableCell>
                <Badge variant={patient.status === 'Active' ? 'success' : 'secondary'}>
                  {patient.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of recent patients in the system.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>MRN</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {samplePatients.slice(0, 3).map((patient) => (
          <TableRow key={patient.id}>
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{patient.gender}</TableCell>
            <TableCell>{patient.mrn}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>45</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>32</TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob Johnson</TableCell>
          <TableCell>58</TableCell>
          <TableCell className="text-right">$350.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right font-medium">$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const WithActions: Story = {
  render: () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>MRN</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samplePatients.slice(0, 3).map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>{patient.mrn}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
};

export const MedicalRecords: Story = {
  render: () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>2025-02-01</TableCell>
            <TableCell>Consultation</TableCell>
            <TableCell>Dr. Smith</TableCell>
            <TableCell>Routine Checkup</TableCell>
            <TableCell>
              <Badge variant="success">Completed</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2025-01-28</TableCell>
            <TableCell>Lab Test</TableCell>
            <TableCell>Dr. Johnson</TableCell>
            <TableCell>Blood Work</TableCell>
            <TableCell>
              <Badge variant="warning">Pending</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2025-01-15</TableCell>
            <TableCell>Follow-up</TableCell>
            <TableCell>Dr. Brown</TableCell>
            <TableCell>Hypertension</TableCell>
            <TableCell>
              <Badge variant="success">Completed</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  ),
};

export const ResponsiveTable: Story = {
  render: () => (
    <TableContainer className="max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead className="hidden sm:table-cell">Age</TableHead>
            <TableHead className="hidden md:table-cell">MRN</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samplePatients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell className="hidden sm:table-cell">{patient.age}</TableCell>
              <TableCell className="hidden md:table-cell">{patient.mrn}</TableCell>
              <TableCell>
                <Badge variant={patient.status === 'Active' ? 'success' : 'secondary'}>
                  {patient.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Table</h3>
        <Table variant="default">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samplePatients.slice(0, 3).map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>
                  <Badge variant={patient.status === 'Active' ? 'success' : 'secondary'}>
                    {patient.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Bordered Table</h3>
        <Table variant="bordered">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samplePatients.slice(0, 3).map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>
                  <Badge variant={patient.status === 'Active' ? 'success' : 'secondary'}>
                    {patient.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Striped Table</h3>
        <Table variant="striped">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samplePatients.slice(0, 3).map((patient, index) => (
              <TableRow
                key={patient.id}
                className={index % 2 === 0 ? 'bg-muted/20' : ''}
              >
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>
                  <Badge variant={patient.status === 'Active' ? 'success' : 'secondary'}>
                    {patient.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Table</h3>
        <TableContainer>
          <Table size="sm">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>MRN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samplePatients.slice(0, 2).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.mrn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Table (Default)</h3>
        <TableContainer>
          <Table size="md">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>MRN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samplePatients.slice(0, 2).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.mrn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Large Table</h3>
        <TableContainer>
          <Table size="lg">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>MRN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samplePatients.slice(0, 2).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.mrn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  ),
};

export const StripedRows: Story = {
  render: () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>MRN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samplePatients.map((patient, index) => (
            <TableRow
              key={patient.id}
              className={index % 2 === 0 ? 'bg-muted/20' : ''}
            >
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.mrn}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
};

export const Empty: Story = {
  render: () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>MRN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              <p className="text-gray-500">No patients found.</p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  ),
};

export const CompactSize: Story = {
  render: () => (
    <TableContainer>
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="h-8 px-2">Name</TableHead>
            <TableHead className="h-8 px-2">Age</TableHead>
            <TableHead className="h-8 px-2">MRN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samplePatients.slice(0, 3).map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="p-2">{patient.name}</TableCell>
              <TableCell className="p-2">{patient.age}</TableCell>
              <TableCell className="p-2">{patient.mrn}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
};
