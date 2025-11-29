'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
}

export function CreateTaskModal({ open, onClose, onSubmit }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    priority: 'routine',
    status: 'ready',
    category: '',
    dueDate: '',
    assignedToUserId: '',
    patientId: '',
    notes: '',
    labels: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      const taskData: any = {
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: new Date(formData.dueDate).toISOString(),
        intent: 'order'
      };

      // Add optional fields
      if (formData.category) {
        taskData.category = formData.category;
      }
      if (formData.assignedToUserId) {
        taskData.assignedToUserId = formData.assignedToUserId;
      }
      if (formData.patientId) {
        taskData.patientId = formData.patientId;
      }
      if (formData.notes) {
        taskData.notes = formData.notes;
      }
      if (formData.labels) {
        taskData.labels = formData.labels.split(',').map(l => l.trim()).filter(Boolean);
      }

      await onSubmit(taskData);

      // Reset form
      setFormData({
        description: '',
        priority: 'routine',
        status: 'ready',
        category: '',
        dueDate: '',
        assignedToUserId: '',
        patientId: '',
        notes: '',
        labels: ''
      });
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded">
              {error}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={3}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger id="priority">
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category || undefined} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger id="category">
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

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              required
            />
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedToUserId">Assign to User ID</Label>
              <Input
                id="assignedToUserId"
                placeholder="User UUID (optional)"
                value={formData.assignedToUserId}
                onChange={(e) => handleChange('assignedToUserId', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to assign to a pool
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                placeholder="Patient UUID (optional)"
                value={formData.patientId}
                onChange={(e) => handleChange('patientId', e.target.value)}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label htmlFor="labels">Labels</Label>
            <Input
              id="labels"
              placeholder="urgent, follow-up, lab (comma-separated)"
              value={formData.labels}
              onChange={(e) => handleChange('labels', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
