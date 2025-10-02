import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import { Badge } from '../Badge';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Avatar component following Atlassian Design System patterns. Displays user profile images with fallback initials, status indicators, badges, and healthcare role-specific styling. Supports various sizes and includes accessibility features.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
    },
    role: {
      control: 'select',
      options: ['doctor', 'nurse', 'patient', 'admin', 'therapist', 'technician'],
    },
    showStatus: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    alt: 'Dr. Smith',
    name: 'Dr. Smith',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="xs" name="XS" />
      <Avatar size="sm" name="SM" />
      <Avatar size="md" name="MD" />
      <Avatar size="lg" name="LG" />
      <Avatar size="xl" name="XL" />
      <Avatar size="2xl" name="2XL" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar variant="default" name="Default" />
      <Avatar variant="primary" name="Primary" />
      <Avatar variant="success" name="Success" />
      <Avatar variant="warning" name="Warning" />
      <Avatar variant="danger" name="Danger" />
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Avatar 
        name="Dr. Smith"
        status="online"
        showStatus
        size="lg"
      />
      <Avatar 
        name="Nurse Johnson"
        status="busy"
        showStatus
        size="lg"
      />
      <Avatar 
        name="Dr. Wilson"
        status="away"
        showStatus
        size="lg"
      />
      <Avatar 
        name="Dr. Brown"
        status="offline"
        showStatus
        size="lg"
      />
    </div>
  ),
};

export const HealthcareRoles: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Healthcare Professional Roles</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Avatar 
              name="Dr. Sarah Smith"
              role="doctor"
              size="xl"
              showStatus
              status="online"
            />
            <p className="text-sm mt-2 font-medium">Doctor</p>
            <p className="text-xs text-muted-foreground">Primary variant</p>
          </div>
          <div className="text-center">
            <Avatar 
              name="Emily Johnson"
              role="nurse"
              size="xl"
              showStatus
              status="busy"
            />
            <p className="text-sm mt-2 font-medium">Nurse</p>
            <p className="text-xs text-muted-foreground">Success variant</p>
          </div>
          <div className="text-center">
            <Avatar 
              name="Mike Wilson"
              role="therapist"
              size="xl"
              showStatus
              status="online"
            />
            <p className="text-sm mt-2 font-medium">Therapist</p>
            <p className="text-xs text-muted-foreground">Primary variant</p>
          </div>
          <div className="text-center">
            <Avatar 
              name="Lisa Brown"
              role="admin"
              size="xl"
              showStatus
              status="away"
            />
            <p className="text-sm mt-2 font-medium">Administrator</p>
            <p className="text-xs text-muted-foreground">Warning variant</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Support Staff</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Avatar 
              name="Tom Davis"
              role="technician"
              size="lg"
              showStatus
              status="online"
            />
            <p className="text-sm mt-2 font-medium">Lab Technician</p>
          </div>
          <div className="text-center">
            <Avatar 
              name="John Patient"
              role="patient"
              size="lg"
            />
            <p className="text-sm mt-2 font-medium">Patient</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Avatar 
        name="Dr. Smith"
        role="doctor"
        size="xl"
        showStatus
        status="online"
        badge={
          <Badge variant="danger" size="sm" className="text-xs px-1">
            5
          </Badge>
        }
      />
      <Avatar 
        name="Nurse Johnson"
        role="nurse"
        size="xl"
        showStatus
        status="busy"
        badge={
          <Badge variant="warning" size="sm" className="text-xs px-1">
            2
          </Badge>
        }
      />
      <Avatar 
        name="Dr. Wilson"
        role="doctor"
        size="xl"
        showStatus
        status="online"
        badge={
          <div className="h-3 w-3 bg-success rounded-full border-2 border-background">
            <span className="sr-only">New messages</span>
          </div>
        }
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Care Team</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <Avatar 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"
              name="Dr. Sarah Chen"
              role="doctor"
              size="xl"
              showStatus
              status="online"
            />
            <div>
              <p className="font-medium text-sm">Dr. Sarah Chen</p>
              <p className="text-xs text-muted-foreground">Cardiologist</p>
              <p className="text-xs text-success">Available</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar 
              src="https://images.unsplash.com/photo-1594824804732-ca8db7ad9a86?w=100&h=100&fit=crop&crop=face"
              name="Emily Rodriguez"
              role="nurse"
              size="xl"
              showStatus
              status="busy"
              badge={
                <Badge variant="warning" size="sm" className="text-xs px-1">
                  3
                </Badge>
              }
            />
            <div>
              <p className="font-medium text-sm">Emily Rodriguez</p>
              <p className="text-xs text-muted-foreground">RN, ICU</p>
              <p className="text-xs text-warning">With Patients</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar 
              name="Michael Thompson"
              role="therapist"
              size="xl"
              showStatus
              status="away"
            />
            <div>
              <p className="font-medium text-sm">Michael Thompson</p>
              <p className="text-xs text-muted-foreground">Physical Therapist</p>
              <p className="text-xs text-warning">In Session</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar 
              name="Lisa Park"
              role="admin"
              size="xl"
              showStatus
              status="online"
            />
            <div>
              <p className="font-medium text-sm">Lisa Park</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
              <p className="text-xs text-success">Available</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Patient List</h3>
        <div className="space-y-3">
          {[
            { name: 'John Smith', age: '45', condition: 'Hypertension', priority: 'routine' },
            { name: 'Maria Garcia', age: '32', condition: 'Diabetes', priority: 'follow-up' },
            { name: 'Robert Johnson', age: '67', condition: 'Post-op', priority: 'urgent' },
            { name: 'Emma Wilson', age: '28', condition: 'Pregnancy', priority: 'routine' },
          ].map((patient, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <Avatar 
                name={patient.name}
                role="patient"
                size="md"
                badge={
                  patient.priority === 'urgent' ? (
                    <Badge variant="danger" size="sm" className="text-xs px-1">
                      !
                    </Badge>
                  ) : patient.priority === 'follow-up' ? (
                    <Badge variant="warning" size="sm" className="text-xs px-1">
                      F
                    </Badge>
                  ) : null
                }
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{patient.name}</p>
                <p className="text-xs text-muted-foreground">
                  Age {patient.age} • {patient.condition}
                </p>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                patient.priority === 'urgent' 
                  ? 'bg-danger/10 text-danger'
                  : patient.priority === 'follow-up'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-success/10 text-success'
              }`}>
                {patient.priority}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Department Heads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
              name="Dr. James Wilson"
              role="doctor"
              size="lg"
              showStatus
              status="online"
            />
            <div>
              <p className="font-medium">Dr. James Wilson</p>
              <p className="text-sm text-muted-foreground">Head of Cardiology</p>
              <p className="text-xs text-success">Available for consultation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar 
              name="Dr. Amanda Foster"
              role="doctor"
              size="lg"
              showStatus
              status="busy"
            />
            <div>
              <p className="font-medium">Dr. Amanda Foster</p>
              <p className="text-sm text-muted-foreground">Head of Emergency</p>
              <p className="text-xs text-danger">In Emergency Surgery</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar 
              name="Patricia Myers"
              role="nurse"
              size="lg"
              showStatus
              status="online"
            />
            <div>
              <p className="font-medium">Patricia Myers</p>
              <p className="text-sm text-muted-foreground">Chief Nursing Officer</p>
              <p className="text-xs text-success">Available</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
        <div className="space-y-3">
          {[
            { name: 'Dr. Sarah Chen', role: 'doctor', message: 'Patient in Room 302 needs immediate attention', time: '2 min ago', priority: true },
            { name: 'Emily Rodriguez', role: 'nurse', message: 'Medication administration complete for all patients', time: '5 min ago', priority: false },
            { name: 'Michael Thompson', role: 'therapist', message: 'PT session completed successfully', time: '10 min ago', priority: false },
            { name: 'Lab Department', role: 'technician', message: 'Lab results ready for review', time: '15 min ago', priority: true },
          ].map((message, index) => (
            <div key={index} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg">
              <Avatar 
                name={message.name}
                role={message.role as any}
                size="sm"
                showStatus
                status="online"
                badge={
                  message.priority ? (
                    <div className="h-2 w-2 bg-danger rounded-full border border-background">
                      <span className="sr-only">Priority message</span>
                    </div>
                  ) : null
                }
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{message.name}</p>
                  <p className="text-xs text-muted-foreground">{message.time}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{message.message}</p>
              </div>
              {message.priority && (
                <Badge variant="danger" size="sm" className="text-xs">
                  Priority
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [selectedStaff, setSelectedStaff] = React.useState<string | null>(null);
    
    const staffMembers = [
      { 
        id: '1', 
        name: 'Dr. Sarah Chen', 
        role: 'doctor' as const, 
        status: 'online' as const, 
        department: 'Cardiology',
        patients: 8,
        experience: '15 years',
        specialization: 'Interventional Cardiology'
      },
      { 
        id: '2', 
        name: 'Emily Rodriguez', 
        role: 'nurse' as const, 
        status: 'busy' as const, 
        department: 'ICU',
        patients: 5,
        experience: '8 years',
        specialization: 'Critical Care'
      },
      { 
        id: '3', 
        name: 'Michael Thompson', 
        role: 'therapist' as const, 
        status: 'away' as const, 
        department: 'Rehabilitation',
        patients: 12,
        experience: '6 years',
        specialization: 'Physical Therapy'
      },
      { 
        id: '4', 
        name: 'Lisa Park', 
        role: 'admin' as const, 
        status: 'online' as const, 
        department: 'Administration',
        patients: 0,
        experience: '10 years',
        specialization: 'Healthcare Operations'
      },
    ];

    const selectedStaffMember = staffMembers.find(staff => staff.id === selectedStaff);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Interactive Staff Directory</h3>
          <p className="text-sm text-muted-foreground mb-6">Click on any staff member to view their details</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaff(staff.id === selectedStaff ? null : staff.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${
                  selectedStaff === staff.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Avatar 
                  name={staff.name}
                  role={staff.role}
                  size="xl"
                  showStatus
                  status={staff.status}
                  badge={
                    staff.patients > 0 ? (
                      <Badge 
                        variant={staff.patients > 10 ? 'danger' : staff.patients > 5 ? 'warning' : 'success'} 
                        size="sm" 
                        className="text-xs px-1"
                      >
                        {staff.patients}
                      </Badge>
                    ) : null
                  }
                />
                <div className="mt-3">
                  <p className="font-medium text-sm">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.department}</p>
                  <p className={`text-xs mt-1 ${
                    staff.status === 'online' ? 'text-success' :
                    staff.status === 'busy' ? 'text-warning' :
                    staff.status === 'away' ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedStaffMember && (
          <div className="p-6 border rounded-lg bg-muted/30">
            <div className="flex items-start gap-4">
              <Avatar 
                name={selectedStaffMember.name}
                role={selectedStaffMember.role}
                size="2xl"
                showStatus
                status={selectedStaffMember.status}
              />
              <div className="flex-1">
                <h4 className="text-lg font-semibold">{selectedStaffMember.name}</h4>
                <p className="text-muted-foreground mb-4">{selectedStaffMember.specialization}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Department:</span>
                    <p className="text-muted-foreground">{selectedStaffMember.department}</p>
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span>
                    <p className="text-muted-foreground">{selectedStaffMember.experience}</p>
                  </div>
                  <div>
                    <span className="font-medium">Current Patients:</span>
                    <p className={`${
                      selectedStaffMember.patients === 0 ? 'text-muted-foreground' :
                      selectedStaffMember.patients > 10 ? 'text-danger' :
                      selectedStaffMember.patients > 5 ? 'text-warning' : 'text-success'
                    }`}>
                      {selectedStaffMember.patients === 0 ? 'Administrative role' : `${selectedStaffMember.patients} patients`}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Send Message
                  </button>
                  <button className="px-3 py-1 text-xs border rounded-md hover:bg-muted">
                    View Schedule
                  </button>
                  <button className="px-3 py-1 text-xs border rounded-md hover:bg-muted">
                    Contact Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>💡 Staff avatars show role-based colors and status indicators for quick identification</p>
        </div>
      </div>
    );
  },
};