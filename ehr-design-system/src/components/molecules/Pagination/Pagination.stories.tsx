import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';
import { useState } from 'react';
import { Card } from '../../atoms/Card/Card';

const meta: Meta<typeof Pagination> = {
  title: 'Design System/Molecules/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive pagination component with support for different variants, sizes, and healthcare-specific use cases. Includes accessibility features and customizable display options.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'medical', 'clinical', 'administrative'],
      description: 'Visual style variant of the pagination'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the pagination components'
    },
    shape: {
      control: 'select',
      options: ['default', 'circle', 'square'],
      description: 'Shape of the pagination buttons'
    },
    spacing: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spacing between pagination elements'
    },
    showInfo: {
      control: 'boolean',
      description: 'Show pagination information'
    },
    showFirstLast: {
      control: 'boolean',
      description: 'Show first and last page buttons'
    },
    showPrevNext: {
      control: 'boolean',
      description: 'Show previous and next buttons'
    },
    maxVisiblePages: {
      control: 'number',
      description: 'Maximum number of visible page buttons'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all pagination controls'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// Interactive wrapper for stories
const PaginationWrapper = ({ children, ...props }: any) => {
  const [currentPage, setCurrentPage] = useState(props.currentPage || 1);
  
  return React.cloneElement(children, {
    ...props,
    currentPage,
    onPageChange: setCurrentPage,
  });
};

// Basic Examples
export const Default: Story = {
  render: (args) => (
    <PaginationWrapper {...args}>
      <Pagination {...args} />
    </PaginationWrapper>
  ),
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
  }
};

export const WithInfo: Story = {
  render: (args) => (
    <PaginationWrapper {...args}>
      <Pagination {...args} />
    </PaginationWrapper>
  ),
  args: {
    currentPage: 3,
    totalPages: 15,
    totalItems: 150,
    itemsPerPage: 10,
    showInfo: true,
    onPageChange: () => {},
  }
};

export const WithFirstLast: Story = {
  render: (args) => (
    <PaginationWrapper {...args}>
      <Pagination {...args} />
    </PaginationWrapper>
  ),
  args: {
    currentPage: 8,
    totalPages: 20,
    showFirstLast: true,
    onPageChange: () => {},
  }
};

// Size Variants
export const SmallSize: Story = {
  render: (args) => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Small Size</h3>
      <PaginationWrapper {...args}>
        <Pagination {...args} />
      </PaginationWrapper>
    </div>
  ),
  args: {
    size: 'sm',
    currentPage: 5,
    totalPages: 12,
    showInfo: true,
    totalItems: 120,
    itemsPerPage: 10,
    onPageChange: () => {},
  }
};

export const LargeSize: Story = {
  render: (args) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Large Size</h3>
      <PaginationWrapper {...args}>
        <Pagination {...args} />
      </PaginationWrapper>
    </div>
  ),
  args: {
    size: 'lg',
    currentPage: 5,
    totalPages: 12,
    showInfo: true,
    showFirstLast: true,
    totalItems: 120,
    itemsPerPage: 10,
    onPageChange: () => {},
  }
};

// Shape Variants
export const CircleShape: Story = {
  render: (args) => (
    <PaginationWrapper {...args}>
      <Pagination {...args} />
    </PaginationWrapper>
  ),
  args: {
    shape: 'circle',
    currentPage: 4,
    totalPages: 8,
    showFirstLast: true,
    onPageChange: () => {},
  }
};

export const SquareShape: Story = {
  render: (args) => (
    <PaginationWrapper {...args}>
      <Pagination {...args} />
    </PaginationWrapper>
  ),
  args: {
    shape: 'square',
    currentPage: 4,
    totalPages: 8,
    showFirstLast: true,
    onPageChange: () => {},
  }
};

// Healthcare Variants
export const Medical: Story = {
  render: (args) => (
    <div className="space-y-6 p-6 bg-blue-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Patient Records Database</h3>
        <p className="text-sm text-blue-600">Browse through patient medical records</p>
      </div>
      <PaginationWrapper {...args}>
        <Pagination {...args} />
      </PaginationWrapper>
    </div>
  ),
  args: {
    variant: 'medical',
    currentPage: 3,
    totalPages: 25,
    totalItems: 2847,
    itemsPerPage: 25,
    showInfo: true,
    showFirstLast: true,
    infoTemplate: (start, end, total) => `Viewing patients ${start}-${end} of ${total} total records`,
    onPageChange: () => {},
  }
};

export const Clinical: Story = {
  render: (args) => (
    <div className="space-y-6 p-6 bg-green-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Lab Results Archive</h3>
        <p className="text-sm text-green-600">Review laboratory test results and reports</p>
      </div>
      <PaginationWrapper {...args}>
        <Pagination {...args} />
      </PaginationWrapper>
    </div>
  ),
  args: {
    variant: 'clinical',
    size: 'lg',
    currentPage: 12,
    totalPages: 45,
    totalItems: 8934,
    itemsPerPage: 200,
    showInfo: true,
    showFirstLast: true,
    infoTemplate: (start, end, total) => `Lab results ${start}-${end} of ${total} available`,
    onPageChange: () => {},
  }
};

export const Administrative: Story = {
  render: (args) => (
    <div className="space-y-6 p-6 bg-purple-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">Billing & Claims Management</h3>
        <p className="text-sm text-purple-600">Process insurance claims and patient billing</p>
      </div>
      <PaginationWrapper {...args}>
        <Pagination {...args} />
      </PaginationWrapper>
    </div>
  ),
  args: {
    variant: 'administrative',
    currentPage: 7,
    totalPages: 18,
    totalItems: 1756,
    itemsPerPage: 100,
    showInfo: true,
    showFirstLast: true,
    shape: 'circle',
    infoTemplate: (start, end, total) => `Claims ${start}-${end} of ${total} pending review`,
    onPageChange: () => {},
  }
};

// Healthcare Use Cases
export const PatientListPagination: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-800">Active Patients</h3>
          <div className="text-sm text-muted-foreground">
            Updated 5 minutes ago
          </div>
        </div>
        
        {/* Mock patient list */}
        <div className="space-y-3 mb-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                  {String.fromCharCode(65 + i)}
                </div>
                <div>
                  <div className="font-medium">Patient {i + 1}</div>
                  <div className="text-sm text-gray-500">MRN: {1000000 + i}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Last visit: {new Date(Date.now() - i * 86400000).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <PaginationWrapper {...args}>
            <Pagination {...args} />
          </PaginationWrapper>
        </div>
      </Card>
    </div>
  ),
  args: {
    variant: 'medical',
    currentPage: 4,
    totalPages: 28,
    totalItems: 1397,
    itemsPerPage: 50,
    showInfo: true,
    showFirstLast: true,
    infoTemplate: (start, end, total) => `Showing ${start}-${end} of ${total} active patients`,
    onPageChange: () => {},
  }
};

export const MedicationListPagination: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-800">Medication Database</h3>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
              Formulary Updated
            </div>
          </div>
        </div>
        
        {/* Mock medication list */}
        <div className="space-y-3 mb-6">
          {[
            { name: 'Lisinopril 10mg', generic: 'ACE Inhibitor', stock: 'In Stock' },
            { name: 'Metformin 500mg', generic: 'Antidiabetic', stock: 'Low Stock' },
            { name: 'Atorvastatin 20mg', generic: 'Statin', stock: 'In Stock' },
            { name: 'Amlodipine 5mg', generic: 'Calcium Channel Blocker', stock: 'In Stock' },
            { name: 'Omeprazole 20mg', generic: 'Proton Pump Inhibitor', stock: 'Out of Stock' }
          ].map((med, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">
                  Rx
                </div>
                <div>
                  <div className="font-medium">{med.name}</div>
                  <div className="text-sm text-gray-500">{med.generic}</div>
                </div>
              </div>
              <div className={`text-sm px-2 py-1 rounded ${
                med.stock === 'In Stock' ? 'bg-green-100 text-green-800' :
                med.stock === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {med.stock}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <PaginationWrapper {...args}>
            <Pagination {...args} />
          </PaginationWrapper>
        </div>
      </Card>
    </div>
  ),
  args: {
    variant: 'clinical',
    size: 'md',
    currentPage: 15,
    totalPages: 67,
    totalItems: 6652,
    itemsPerPage: 100,
    showInfo: true,
    showFirstLast: true,
    infoTemplate: (start, end, total) => `Medications ${start}-${end} of ${total} in formulary`,
    onPageChange: () => {},
  }
};

export const BillingRecordsPagination: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-800">Insurance Claims</h3>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
              Pending Review: 23
            </div>
            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Approved: 145
            </div>
          </div>
        </div>
        
        {/* Mock claims list */}
        <div className="space-y-3 mb-6">
          {[
            { id: 'CLM-2024-001', patient: 'John Doe', amount: '$1,245.50', status: 'Approved', date: '2024-01-15' },
            { id: 'CLM-2024-002', patient: 'Jane Smith', amount: '$867.25', status: 'Pending', date: '2024-01-14' },
            { id: 'CLM-2024-003', patient: 'Bob Johnson', amount: '$2,156.75', status: 'Under Review', date: '2024-01-14' },
            { id: 'CLM-2024-004', patient: 'Sarah Davis', amount: '$456.00', status: 'Approved', date: '2024-01-13' },
            { id: 'CLM-2024-005', patient: 'Mike Wilson', amount: '$3,289.90', status: 'Rejected', date: '2024-01-13' }
          ].map((claim, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium text-xs">
                  $
                </div>
                <div>
                  <div className="font-medium">{claim.id}</div>
                  <div className="text-sm text-gray-500">{claim.patient}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{claim.amount}</div>
                  <div className="text-sm text-gray-500">{claim.date}</div>
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                claim.status === 'Approved' ? 'bg-green-100 text-green-800' :
                claim.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                claim.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {claim.status}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <PaginationWrapper {...args}>
            <Pagination {...args} />
          </PaginationWrapper>
        </div>
      </Card>
    </div>
  ),
  args: {
    variant: 'administrative',
    currentPage: 8,
    totalPages: 32,
    totalItems: 3156,
    itemsPerPage: 100,
    showInfo: true,
    showFirstLast: true,
    shape: 'default',
    spacing: 'lg',
    infoTemplate: (start, end, total) => `Claims ${start}-${end} of ${total} total submissions`,
    onPageChange: () => {},
  }
};

// Edge Cases
export const SinglePage: Story = {
  render: (args) => (
    <PaginationWrapper {...args}>
      <Pagination {...args} />
    </PaginationWrapper>
  ),
  args: {
    currentPage: 1,
    totalPages: 1,
    showInfo: true,
    totalItems: 15,
    itemsPerPage: 25,
    onPageChange: () => {},
  }
};

export const ManyPages: Story = {
  render: (args) => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Large Dataset (500+ pages)</h3>
      <PaginationWrapper {...args}>
        <Pagination {...args} />
      </PaginationWrapper>
    </div>
  ),
  args: {
    currentPage: 247,
    totalPages: 523,
    totalItems: 52300,
    itemsPerPage: 100,
    showInfo: true,
    showFirstLast: true,
    maxVisiblePages: 5,
    infoTemplate: (start, end, total) => `Records ${start.toLocaleString()}-${end.toLocaleString()} of ${total.toLocaleString()}`,
    onPageChange: () => {},
  }
};

export const DisabledState: Story = {
  render: (args) => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Disabled Pagination</h3>
      <PaginationWrapper {...args}>
        <Pagination {...args} />
      </PaginationWrapper>
    </div>
  ),
  args: {
    currentPage: 3,
    totalPages: 10,
    disabled: true,
    showInfo: true,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: () => {},
  }
};

export const CustomLabels: Story = {
  render: (args) => (
    <PaginationWrapper {...args}>
      <Pagination {...args} />
    </PaginationWrapper>
  ),
  args: {
    currentPage: 5,
    totalPages: 15,
    showFirstLast: true,
    showInfo: true,
    totalItems: 150,
    itemsPerPage: 10,
    prevLabel: 'Back',
    nextLabel: 'Forward', 
    firstLabel: 'Beginning',
    lastLabel: 'End',
    infoTemplate: (start, end, total) => `Displaying items ${start} through ${end} (total: ${total})`,
    onPageChange: () => {},
  }
};