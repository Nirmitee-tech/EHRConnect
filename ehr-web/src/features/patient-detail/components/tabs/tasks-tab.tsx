'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  User,
  Calendar,
  Tag,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CreateTaskSidebar } from '@/components/tasks/create-task-sidebar';
import { EditTaskSidebar } from '@/components/tasks/edit-task-sidebar';
import * as taskService from '@/services/task.service';
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

interface TasksTabProps {
  patientId: string;
}

const priorityColors = {
  'routine': 'bg-gray-100 text-gray-700',
  'urgent': 'bg-orange-100 text-orange-700',
  'asap': 'bg-red-100 text-red-700',
  'stat': 'bg-red-500 text-white'
};

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'ready': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'on-hold': 'bg-orange-100 text-orange-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

export function TasksTab({ patientId }: TasksTabProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await taskService.getMyTasks(
        session,
        { patientId, status: ['ready', 'in-progress', 'on-hold'] },
        { limit: 50, offset: 0 }
      );

      setTasks(data.data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadTasks();
    }
  }, [patientId]);

  const handleTaskCreated = async (task: any) => {
    await loadTasks();
  };

  const handleTaskUpdated = async (task: any) => {
    await loadTasks();
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditSidebarOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Patient Tasks</h3>
        <Button
          onClick={() => setIsCreateSidebarOpen(true)}
          size="sm"
          className="bg-primary hover:opacity-90 text-primary-foreground h-7 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          New Task
        </Button>
      </div>

      {/* Tasks List - Compact Format */}
      {tasks.length === 0 ? (
        <Card className="p-6 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">No active tasks for this patient</p>
          <Button
            onClick={() => setIsCreateSidebarOpen(true)}
            size="sm"
            className="bg-primary hover:opacity-90 text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create First Task
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "p-3 hover:shadow-md transition-shadow cursor-pointer",
                isOverdue(task.dueDate, task.status) && "border-red-300 bg-red-50"
              )}
              onClick={() => handleEditTask(task)}
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-0.5">
                  <StatusIcon status={task.status} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title & Identifier */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">
                      {task.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
                      }}
                    >
                      <Edit2 className="h-3 w-3 text-gray-600" />
                    </Button>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                    {/* Priority & Status Badges */}
                    <Badge
                      className={cn("text-xs px-1.5 py-0", priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.routine)}
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-xs px-1.5 py-0", statusColors[task.status as keyof typeof statusColors] || statusColors.draft)}
                    >
                      {task.status.replace(/-/g, ' ')}
                    </Badge>

                    {/* Due Date */}
                    <div className={cn(
                      "flex items-center gap-1",
                      isOverdue(task.dueDate, task.status) && "text-red-600 font-medium"
                    )}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(task.dueDate)}</span>
                      {isOverdue(task.dueDate, task.status) && (
                        <Badge variant="destructive" className="ml-1 text-xs px-1 py-0">Overdue</Badge>
                      )}
                    </div>

                    {/* Assignee */}
                    {(task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName) && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">
                          {task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  {task.labels && task.labels.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <Tag className="h-3 w-3 text-gray-400" />
                      {task.labels.slice(0, 3).map((label, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0">
                          {label}
                        </Badge>
                      ))}
                      {task.labels.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          +{task.labels.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Sidebar */}
      <CreateTaskSidebar
        open={isCreateSidebarOpen}
        onOpenChange={setIsCreateSidebarOpen}
        onTaskCreated={handleTaskCreated}
        orgId={session?.org_id || ''}
        userId={session?.user?.id}
      />

      {/* Edit Task Sidebar */}
      {selectedTask && (
        <EditTaskSidebar
          open={isEditSidebarOpen}
          onOpenChange={setIsEditSidebarOpen}
          onTaskUpdated={handleTaskUpdated}
          task={selectedTask}
          orgId={session?.org_id || ''}
          userId={session?.user?.id}
        />
      )}
    </div>
  );
}
