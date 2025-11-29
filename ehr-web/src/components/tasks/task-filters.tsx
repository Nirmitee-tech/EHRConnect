'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterState {
  status: string[];
  priority: string[];
  category: string;
  assignee: string;
  labels: string[];
  dueAfter: string;
  dueBefore: string;
  isOverdue: boolean;
}

interface TaskFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' }
];

const priorityOptions = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'asap', label: 'ASAP' },
  { value: 'stat', label: 'STAT' }
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'appointment_prep', label: 'Appointment Prep' },
  { value: 'form_completion', label: 'Form Completion' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'lab_review', label: 'Lab Review' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'billing', label: 'Billing' },
  { value: 'administrative', label: 'Administrative' }
];

export function TaskFilters({ filters, onFiltersChange, onClose }: TaskFiltersProps) {
  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];

    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];

    onFiltersChange({ ...filters, priority: newPriority });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const handleDateChange = (field: 'dueAfter' | 'dueBefore', value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleOverdueToggle = (checked: boolean) => {
    onFiltersChange({ ...filters, isOverdue: checked });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      category: '',
      assignee: '',
      labels: [],
      dueAfter: '',
      dueBefore: '',
      isOverdue: false
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.category ||
    filters.dueAfter ||
    filters.dueBefore ||
    filters.isOverdue;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={() => handleStatusToggle(option.value)}
                />
                <label
                  htmlFor={`status-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Priority</Label>
          <div className="space-y-2">
            {priorityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${option.value}`}
                  checked={filters.priority.includes(option.value)}
                  onCheckedChange={() => handlePriorityToggle(option.value)}
                />
                <label
                  htmlFor={`priority-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Due Date Range</Label>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={filters.dueAfter}
                onChange={(e) => handleDateChange('dueAfter', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={filters.dueBefore}
                onChange={(e) => handleDateChange('dueBefore', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Overdue Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="overdue"
            checked={filters.isOverdue}
            onCheckedChange={handleOverdueToggle}
          />
          <label
            htmlFor="overdue"
            className="text-sm font-medium cursor-pointer"
          >
            Show overdue tasks only
          </label>
        </div>
      </div>
    </Card>
  );
}
