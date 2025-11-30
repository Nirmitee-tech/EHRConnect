'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  MoreVertical,
  Eye,
  Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  identifier: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  dueDate: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedToPatientId?: string;
  assignedToPatientName?: string;
  assignedToPoolId?: string;
  assignedToPoolName?: string;
  patientId?: string;
  patientName?: string;
  labels?: string[];
  createdAt: string;
  completedAt?: string;
}

interface TaskListViewProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  onTaskEdit?: (task: Task) => void;
  loading: boolean;
}

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800 border-gray-300',
  'ready': 'bg-blue-100 text-blue-800 border-blue-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'on-hold': 'bg-orange-100 text-orange-800 border-orange-300',
  'completed': 'bg-green-100 text-green-800 border-green-300',
  'cancelled': 'bg-red-100 text-red-800 border-red-300',
  'accepted': 'bg-purple-100 text-purple-800 border-purple-300',
  'rejected': 'bg-red-100 text-red-800 border-red-300'
};

const priorityColors = {
  'routine': 'bg-gray-100 text-gray-700',
  'urgent': 'bg-orange-100 text-orange-700',
  'asap': 'bg-red-100 text-red-700',
  'stat': 'bg-red-500 text-white'
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'in-progress':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'cancelled':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-blue-600" />;
  }
};

export function TaskListView({ tasks, onTaskUpdate, onTaskEdit, loading }: TaskListViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      onTaskUpdate();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or create a new task
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={cn(
            "p-4 hover:shadow-md transition-shadow",
            isOverdue(task.dueDate, task.status) && "border-red-300 bg-red-50"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left Section - Status Icon & Content */}
            <div className="flex gap-3 flex-1">
              <div className="mt-1">
                <StatusIcon status={task.status} />
              </div>

              <div className="flex-1 space-y-2">
                {/* Title & Identifier */}
                <div className="flex items-start gap-2">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium hover:underline text-lg"
                  >
                    {task.description}
                  </Link>
                  <span className="text-xs text-muted-foreground mt-1">
                    #{task.identifier}
                  </span>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {/* Assignee */}
                  {(task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName) && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>
                        {task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName}
                      </span>
                    </div>
                  )}

                  {/* Patient */}
                  {task.patientName && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Patient: {task.patientName}</span>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className={cn(
                    "flex items-center gap-1",
                    isOverdue(task.dueDate, task.status) && "text-red-600 font-medium"
                  )}>
                    <Calendar className="h-3 w-3" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                    {isOverdue(task.dueDate, task.status) && (
                      <Badge variant="destructive" className="ml-1">Overdue</Badge>
                    )}
                  </div>

                  {/* Category */}
                  {task.category && (
                    <Badge variant="outline" className="text-xs">
                      {task.category.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {task.labels.map((label, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Status & Priority Badges + Actions */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-2">
                <Badge
                  className={cn("text-xs", statusColors[task.status as keyof typeof statusColors] || statusColors.draft)}
                  variant="outline"
                >
                  {task.status.replace(/-/g, ' ')}
                </Badge>
                <Badge
                  className={cn("text-xs", priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.routine)}
                >
                  {task.priority}
                </Badge>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/tasks/${task.id}`} className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {onTaskEdit && (
                    <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  )}
                  {task.status !== 'in-progress' && task.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in-progress')}>
                      Start Task
                    </DropdownMenuItem>
                  )}
                  {task.status === 'in-progress' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                      Complete Task
                    </DropdownMenuItem>
                  )}
                  {task.status !== 'cancelled' && task.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'cancelled')}>
                      Cancel Task
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
