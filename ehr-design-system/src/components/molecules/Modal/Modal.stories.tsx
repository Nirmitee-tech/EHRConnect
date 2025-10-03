import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ConfirmationModal } from './Modal';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  UserPlus,
  Calendar,
  Pill,
  FileText,
  Heart,
  Stethoscope,
  Activity,
  Shield,
  Clock,
  Phone,
  AlertCircle,
  Trash2,
  Edit,
  Download,
  Upload,
  Settings,
  Bell
} from 'lucide-react';

const meta: Meta<typeof Modal> = {
  title: 'Molecules/Modal',
  component: Modal,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Modal component provides overlay dialogs for confirmations, forms, and detailed information in healthcare applications. Built with accessibility and keyboard navigation in mind.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
    },
    closeButton: {
      control: 'boolean',
    },
    closeOnOutsideClick: {
      control: 'boolean',
    },
    closeOnEscape: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => (
    <Modal
      title="Default Modal"
      description="This is a basic modal dialog."
      trigger={<Button>Open Modal</Button>}
    >
      <p>This is the modal content area where you can place any components or information.</p>
    </Modal>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Modal
        size="xs"
        title="Extra Small Modal"
        description="Compact modal for simple confirmations"
        trigger={<Button size="sm">XS Modal</Button>}
      >
        <p className="text-sm">Minimal content space.</p>
      </Modal>
      
      <Modal
        size="sm"
        title="Small Modal"
        trigger={<Button size="sm">SM Modal</Button>}
      >
        <p>Small modal for brief interactions.</p>
      </Modal>
      
      <Modal
        size="md"
        title="Medium Modal"
        trigger={<Button>MD Modal</Button>}
      >
        <p>Standard modal size for most use cases.</p>
      </Modal>
      
      <Modal
        size="lg"
        title="Large Modal"
        trigger={<Button>LG Modal</Button>}
      >
        <p>Large modal for more complex content and forms.</p>
      </Modal>
      
      <Modal
        size="xl"
        title="Extra Large Modal"
        trigger={<Button>XL Modal</Button>}
      >
        <p>Extra large modal for detailed information and complex interfaces.</p>
      </Modal>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Modal
        variant="default"
        title="Default Modal"
        description="Standard modal appearance"
        trigger={<Button variant="outline">Default</Button>}
      >
        <p>Default styling for general purpose modals.</p>
      </Modal>
      
      <Modal
        variant="primary"
        title="Primary Modal"
        description="Important actions and information"
        trigger={<Button variant="primary">Primary</Button>}
      >
        <p>Primary styling for important actions.</p>
      </Modal>
      
      <Modal
        variant="success"
        title="Success Modal"
        description="Successful operations and confirmations"
        trigger={<Button variant="success">Success</Button>}
      >
        <p>Success styling for positive confirmations.</p>
      </Modal>
      
      <Modal
        variant="warning"
        title="Warning Modal"
        description="Cautions and important notices"
        trigger={<Button variant="warning">Warning</Button>}
      >
        <p>Warning styling for important notices.</p>
      </Modal>
      
      <Modal
        variant="danger"
        title="Danger Modal"
        description="Critical actions and errors"
        trigger={<Button variant="destructive">Danger</Button>}
      >
        <p>Danger styling for critical actions.</p>
      </Modal>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Modal
      title="Modal with Footer"
      description="This modal includes action buttons in the footer"
      trigger={<Button>Open Modal with Footer</Button>}
      footer={
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p>Modal content with custom footer actions.</p>
        <Input placeholder="Enter some information..." />
      </div>
    </Modal>
  ),
};

export const ConfirmationModals: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ConfirmationModal
        title="Delete Patient Record"
        description="Are you sure you want to delete this patient record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => console.log('Patient record deleted')}
        onCancel={() => console.log('Delete cancelled')}
        trigger={<Button variant="destructive">Delete Record</Button>}
      />
      
      <ConfirmationModal
        title="Save Changes"
        description="Do you want to save the changes to the patient information?"
        confirmText="Save"
        cancelText="Discard"
        variant="primary"
        onConfirm={() => console.log('Changes saved')}
        trigger={<Button variant="primary">Save Changes</Button>}
      />
      
      <ConfirmationModal
        title="Send Prescription"
        description="Send this prescription to the patient's preferred pharmacy?"
        confirmText="Send"
        cancelText="Review"
        variant="success"
        onConfirm={() => console.log('Prescription sent')}
        trigger={<Button variant="success">Send Prescription</Button>}
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Management</h3>
        <div className="flex flex-wrap gap-2">
          <Modal
            size="lg"
            title="Add New Patient"
            description="Register a new patient in the system"
            variant="primary"
            trigger={
              <Button variant="primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            }
            footer={
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Register Patient</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="First Name" />
                <Input placeholder="Last Name" />
              </div>
              <Input placeholder="Date of Birth" type="date" />
              <Input placeholder="Medical Record Number" />
              <Input placeholder="Insurance ID" />
              <textarea 
                className="w-full p-3 border rounded-md resize-none" 
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </Modal>
          
          <Modal
            size="xl"
            title="Patient Details - John Doe"
            description="Comprehensive patient information and medical history"
            trigger={
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Patient Details
              </Button>
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Demographics
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> John Michael Doe</p>
                    <p><span className="font-medium">DOB:</span> May 15, 1978</p>
                    <p><span className="font-medium">Age:</span> 45 years</p>
                    <p><span className="font-medium">Gender:</span> Male</p>
                    <p><span className="font-medium">MRN:</span> MRN-123456789</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Information
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Phone:</span> (555) 123-4567</p>
                    <p><span className="font-medium">Email:</span> john.doe@email.com</p>
                    <p><span className="font-medium">Address:</span> 123 Healthcare Dr</p>
                    <p><span className="font-medium">City:</span> Cityville, ST 12345</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Medical Conditions
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Type 2 Diabetes</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">Hypertension</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">High Cholesterol</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Allergies
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">Penicillin - Severe</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">Shellfish - Moderate</span>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Appointment Management</h3>
        <div className="flex flex-wrap gap-2">
          <Modal
            size="lg"
            title="Schedule New Appointment"
            description="Schedule a new appointment for patient"
            variant="primary"
            trigger={
              <Button variant="primary">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            }
            footer={
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Schedule</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Patient Name" />
                <Input placeholder="Provider" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Date" />
                <Input type="time" placeholder="Time" />
              </div>
              <Input placeholder="Appointment Type" />
              <textarea 
                className="w-full p-3 border rounded-md resize-none" 
                placeholder="Reason for visit..."
                rows={3}
              />
            </div>
          </Modal>
          
          <ConfirmationModal
            title="Cancel Appointment"
            description="Are you sure you want to cancel John Doe's appointment scheduled for tomorrow at 2:00 PM?"
            confirmText="Cancel Appointment"
            cancelText="Keep Appointment"
            variant="warning"
            onConfirm={() => console.log('Appointment cancelled')}
            trigger={<Button variant="outline">Cancel Appointment</Button>}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Prescription Management</h3>
        <div className="flex flex-wrap gap-2">
          <Modal
            size="lg"
            title="New Prescription"
            description="Create a new prescription for patient"
            variant="success"
            trigger={
              <Button variant="success">
                <Pill className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            }
            footer={
              <div className="flex gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button variant="success">Send to Pharmacy</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <Input placeholder="Patient Name" />
              <Input placeholder="Medication Name" />
              <div className="grid grid-cols-3 gap-4">
                <Input placeholder="Dosage" />
                <Input placeholder="Frequency" />
                <Input placeholder="Quantity" />
              </div>
              <Input placeholder="Duration" />
              <textarea 
                className="w-full p-3 border rounded-md resize-none" 
                placeholder="Special instructions..."
                rows={3}
              />
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Drug Interaction Check:</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  No significant interactions found with current medications.
                </p>
              </div>
            </div>
          </Modal>
          
          <ConfirmationModal
            title="Delete Prescription"
            description="Are you sure you want to delete this prescription? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            onConfirm={() => console.log('Prescription deleted')}
            trigger={
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Prescription
              </Button>
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Documentation</h3>
        <div className="flex flex-wrap gap-2">
          <Modal
            size="2xl"
            title="Progress Note"
            description="Document patient encounter and clinical findings"
            trigger={
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Add Progress Note
              </Button>
            }
            footer={
              <div className="flex gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button variant="primary">Sign & Submit</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Date of Service" type="date" />
                <Input placeholder="Provider" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Chief Complaint</label>
                <textarea 
                  className="w-full p-3 border rounded-md resize-none" 
                  placeholder="Patient's primary concern..."
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">History of Present Illness</label>
                <textarea 
                  className="w-full p-3 border rounded-md resize-none" 
                  placeholder="Detailed history of current condition..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Assessment</label>
                  <textarea 
                    className="w-full p-3 border rounded-md resize-none" 
                    placeholder="Clinical assessment..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Plan</label>
                  <textarea 
                    className="w-full p-3 border rounded-md resize-none" 
                    placeholder="Treatment plan..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </Modal>
          
          <Modal
            size="xl"
            title="Vital Signs Entry"
            description="Record patient vital signs"
            variant="primary"
            trigger={
              <Button variant="primary">
                <Activity className="w-4 h-4 mr-2" />
                Record Vitals
              </Button>
            }
            footer={
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Save Vitals</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Date & Time" type="datetime-local" />
                <Input placeholder="Recorded by" />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Input placeholder="Systolic BP" />
                <Input placeholder="Diastolic BP" />
                <Input placeholder="Heart Rate" />
                <Input placeholder="Temperature" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Input placeholder="Respiratory Rate" />
                <Input placeholder="O2 Saturation" />
                <Input placeholder="Weight" />
              </div>
              
              <textarea 
                className="w-full p-3 border rounded-md resize-none" 
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </Modal>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">System & Administrative</h3>
        <div className="flex flex-wrap gap-2">
          <Modal
            size="lg"
            title="System Settings"
            description="Configure application preferences"
            trigger={
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            }
            footer={
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Save Settings</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Default Language</label>
                <select className="w-full p-2 border rounded-md">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time Zone</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Enable email notifications
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Auto-save patient notes
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Dark mode
                </label>
              </div>
            </div>
          </Modal>
          
          <ConfirmationModal
            title="System Maintenance"
            description="The system will be unavailable for 2 hours during maintenance. Do you want to proceed?"
            confirmText="Start Maintenance"
            cancelText="Schedule Later"
            variant="warning"
            onConfirm={() => console.log('Maintenance started')}
            trigger={
              <Button variant="warning">
                <Clock className="w-4 h-4 mr-2" />
                Start Maintenance
              </Button>
            }
          />
        </div>
      </div>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    const [patientData, setPatientData] = React.useState({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      medicalRecordNumber: '',
      notes: '',
    });
    
    const [isLoading, setIsLoading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    
    const handleSave = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(true);
        console.log('Patient data saved:', patientData);
      }, 2000);
    };
    
    const resetForm = () => {
      setPatientData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        medicalRecordNumber: '',
        notes: '',
      });
      setShowSuccess(false);
    };

    return (
      <div className="space-y-4">
        <Modal
          size="lg"
          title="Interactive Patient Registration"
          description="Complete form with validation and status updates"
          variant="primary"
          trigger={<Button variant="primary">Interactive Demo</Button>}
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>
                Reset Form
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={isLoading || !patientData.firstName || !patientData.lastName}
              >
                {isLoading ? 'Saving...' : 'Save Patient'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {showSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">Patient registered successfully!</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <Input
                  value={patientData.firstName}
                  onChange={(e) => setPatientData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <Input
                  value={patientData.lastName}
                  onChange={(e) => setPatientData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <Input
                type="date"
                value={patientData.dateOfBirth}
                onChange={(e) => setPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Medical Record Number</label>
              <Input
                value={patientData.medicalRecordNumber}
                onChange={(e) => setPatientData(prev => ({ ...prev, medicalRecordNumber: e.target.value }))}
                placeholder="MRN-XXXXXXXXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
                value={patientData.notes}
                onChange={(e) => setPatientData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional patient information..."
              />
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start text-blue-800 text-sm">
                <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Form Status:</p>
                  <p>
                    {patientData.firstName && patientData.lastName 
                      ? 'Ready to save' 
                      : 'Please complete required fields (marked with *)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};