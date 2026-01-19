'use client';

import React, { useMemo, useCallback } from 'react';
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

// Memoized status icon component
const StatusIcon = React.memo(({ status }: { status: string }) => {
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
});
StatusIcon.displayName = 'StatusIcon';

// Memoized task card component for better performance
const TaskCard = React.memo(({ 
  task, 
  onEdit,
  formatDate,
  isOverdue
}: { 
  task: Task; 
  onEdit?: (task: Task) => void;
  formatDate: (dateString: string) => string;
  isOverdue: (dueDate: string, status: string) => boolean;
}) => {
  const handleEdit = useCallback(() => {
    onEdit?.(task);
  }, [onEdit, task]);

  const overdueStatus = useMemo(() => 
    isOverdue(task.dueDate, task.status), 
    [task.dueDate, task.status, isOverdue]
  );

  const statusColor = useMemo(() => 
    statusColors[task.status as keyof typeof statusColors] || statusColors.draft,
    [task.status]
  );

  const priorityColor = useMemo(() =>
    priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.routine,
    [task.priority]
  );

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-shadow cursor-pointer",
        overdueStatus && "border-l-4 border-l-red-500"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <StatusIcon status={task.status} />
            <Link href={`/tasks/${task.id}`} className="hover:underline">
              <span className="font-medium">{task.identifier}</span>
            </Link>
            <Badge className={statusColor}>
              {task.status}
            </Badge>
            {task.priority !== 'routine' && (
              <Badge className={priorityColor}>
                {task.priority}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={overdueStatus ? 'text-red-600 font-medium' : ''}>
                  {formatDate(task.dueDate)}
                  {overdueStatus && ' (Overdue)'}
                </span>
              </div>
            )}

            {(task.assignedToUserName || task.assignedToPoolName) && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignedToUserName || task.assignedToPoolName}</span>
              </div>
            )}

            {task.patientName && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Patient: {task.patientName}</span>
              </div>
            )}

            {task.category && (
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            )}
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-gray-400" />
              {task.labels.map((label, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/tasks/${task.id}`} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
});
TaskCard.displayName = 'TaskCard';

// Main component with performance optimizations
export const TaskListView = React.memo(function TaskListView({ 
  tasks, 
  onTaskUpdate, 
  onTaskEdit, 
  loading 
}: TaskListViewProps) {
  // Memoize formatting functions to prevent recreation on each render
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const isOverdue = useCallback((dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  }, []);

  // Sort tasks by due date (memoized)
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Completed and cancelled tasks go to bottom
      if ((a.status === 'completed' || a.status === 'cancelled') && 
          (b.status !== 'completed' && b.status !== 'cancelled')) {
        return 1;
      }
      if ((b.status === 'completed' || b.status === 'cancelled') && 
          (a.status !== 'completed' && a.status !== 'cancelled')) {
        return -1;
      }
      
      // Sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No tasks found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onTaskEdit}
          formatDate={formatDate}
          isOverdue={isOverdue}
        />
      ))}
    </div>
  );
});
