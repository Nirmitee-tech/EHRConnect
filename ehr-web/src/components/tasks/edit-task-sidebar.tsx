'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface EditTaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: any) => void;
  task: any;
  orgId: string;
  userId?: string | null;
}

interface TaskFormData {
  description: string;
  priority: string;
  status: string;
  category: string;
  dueDate: string;
  assignmentType: 'user' | 'patient' | 'pool' | '';
  assignedToUserId: string;
  assignedToPatientId: string;
  assignedToPoolId: string;
  patientId: string;
  notes: string;
  labels: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function EditTaskSidebar({
  open,
  onOpenChange,
  onTaskUpdated,
  task,
  orgId,
  userId,
}: EditTaskSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState<TaskFormData>({
    description: '',
    priority: 'routine',
    status: 'ready',
    category: '',
    dueDate: '',
    assignmentType: '',
    assignedToUserId: '',
    assignedToPatientId: '',
    assignedToPoolId: '',
    patientId: '',
    notes: '',
    labels: '',
  });

  // Load users, patients, and pools when sidebar opens
  useEffect(() => {
    if (open && orgId) {
      loadAssignmentOptions();
    }
  }, [open, orgId]);

  const loadAssignmentOptions = async () => {
    setLoadingData(true);
    try {
      // Load users from team API
      const usersResponse = await fetch(`${API_URL}/api/orgs/${orgId}/team`, {
        headers: {
          'x-org-id': orgId,
          ...(userId && { 'x-user-id': userId }),
        },
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.members || []);
      }

      // Load patients (simplified - you may need to adjust this endpoint)
      const patientsResponse = await fetch(`${API_URL}/fhir/R4/Patient?_count=100`, {
        headers: {
          'x-org-id': orgId,
          ...(userId && { 'x-user-id': userId }),
        },
      });
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData.entry?.map((e: any) => e.resource) || []);
      }

      // Load pools - you may need to create this endpoint
      // For now, using a placeholder
      setPools([
        { id: 'general', name: 'General Pool' },
        { id: 'nursing', name: 'Nursing Pool' },
        { id: 'admin', name: 'Administrative Pool' },
      ]);
    } catch (err) {
      console.error('Error loading assignment options:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Load task data when task changes
  useEffect(() => {
    if (task) {
      // Determine assignment type based on which field is populated
      let assignmentType: 'user' | 'patient' | 'pool' | '' = '';
      if (task.assignedToUserId) {
        assignmentType = 'user';
      } else if (task.assignedToPatientId) {
        assignmentType = 'patient';
      } else if (task.assignedToPoolId) {
        assignmentType = 'pool';
      }

      setFormData({
        description: task.description || '',
        priority: task.priority || 'routine',
        status: task.status || 'ready',
        category: task.category || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        assignmentType,
        assignedToUserId: task.assignedToUserId || '',
        assignedToPatientId: task.assignedToPatientId || '',
        assignedToPoolId: task.assignedToPoolId || '',
        patientId: task.patientId || '',
        notes: task.notes || '',
        labels: Array.isArray(task.labels) ? task.labels.join(', ') : '',
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.description) {
        throw new Error('Description is required');
      }
      if (!formData.dueDate) {
        throw new Error('Due date is required');
      }

      // Prepare task data
      const payload: any = {
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      // Add assignment based on type - clear all assignment fields first
      payload.assignedToUserId = null;
      payload.assignedToPatientId = null;
      payload.assignedToPoolId = null;

      if (formData.assignmentType === 'user' && formData.assignedToUserId) {
        payload.assignedToUserId = formData.assignedToUserId;
      } else if (formData.assignmentType === 'patient' && formData.assignedToPatientId) {
        payload.assignedToPatientId = formData.assignedToPatientId;
      } else if (formData.assignmentType === 'pool' && formData.assignedToPoolId) {
        payload.assignedToPoolId = formData.assignedToPoolId;
      }

      // Add optional fields
      if (formData.category) {
        payload.category = formData.category;
      }
      if (formData.patientId) {
        payload.patientId = formData.patientId;
      }
      if (formData.notes) {
        payload.notes = formData.notes;
      }
      if (formData.labels) {
        payload.labels = formData.labels.split(',').map((l) => l.trim()).filter(Boolean);
      }

      const response = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
          ...(userId && { 'x-user-id': userId }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const result = await response.json();
      const updatedTask = result.data || result;

      // Notify parent component
      onTaskUpdated(updatedTask);

      // Close sidebar
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
          <SheetDescription>
            Update task details and assignment
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || undefined}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment_prep">Appointment Prep</SelectItem>
                  <SelectItem value="form_completion">Form Completion</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="lab_review">Lab Review</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dueDate"
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Assignment</h3>

            <div className="grid gap-2">
              <Label htmlFor="assignmentType">Assign To</Label>
              <Select
                value={formData.assignmentType}
                onValueChange={(value: any) => setFormData({
                  ...formData,
                  assignmentType: value,
                  assignedToUserId: '',
                  assignedToPatientId: '',
                  assignedToPoolId: '',
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="pool">Pool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.assignmentType === 'user' && (
              <div className="grid gap-2">
                <Label htmlFor="assignedToUserId">Select User</Label>
                <Select
                  value={formData.assignedToUserId}
                  onValueChange={(value) => setFormData({ ...formData, assignedToUserId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Loading users..." : "Select a user"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id || user.user_id} value={user.id || user.user_id}>
                        {user.name || user.email || user.user_email || 'Unknown User'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.assignmentType === 'patient' && (
              <div className="grid gap-2">
                <Label htmlFor="assignedToPatientId">Select Patient</Label>
                <Select
                  value={formData.assignedToPatientId}
                  onValueChange={(value) => setFormData({ ...formData, assignedToPatientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Loading patients..." : "Select a patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name?.[0]?.text || `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}` || 'Unknown Patient'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.assignmentType === 'pool' && (
              <div className="grid gap-2">
                <Label htmlFor="assignedToPoolId">Select Pool</Label>
                <Select
                  value={formData.assignedToPoolId}
                  onValueChange={(value) => setFormData({ ...formData, assignedToPoolId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {pools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="patientId">Related Patient (optional)</Label>
              <Select
                value={formData.patientId || undefined}
                onValueChange={(value) => setFormData({ ...formData, patientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name?.[0]?.text || `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}` || 'Unknown Patient'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Additional Details</h3>

            <div className="grid gap-2">
              <Label htmlFor="labels">Labels</Label>
              <Input
                id="labels"
                value={formData.labels}
                onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                placeholder="urgent, follow-up, lab (comma-separated)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes (optional)"
                rows={2}
              />
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:opacity-90 text-white">
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
