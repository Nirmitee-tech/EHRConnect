'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  History,
  MoreVertical,
  Loader2,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskComments } from '@/components/tasks/task-comments';
import { TaskSubtasks } from '@/components/tasks/task-subtasks';
import { TaskHistory } from '@/components/tasks/task-history';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

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
  notes?: string;
  createdAt: string;
  completedAt?: string;
  createdByUserId?: string;
  createdByUserName?: string;
}

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'ready': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'on-hold': 'bg-orange-100 text-orange-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'routine': 'bg-gray-100 text-gray-700',
  'urgent': 'bg-orange-100 text-orange-700',
  'asap': 'bg-red-100 text-red-700',
  'stat': 'bg-red-500 text-white'
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadTask = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load task');
      }

      const data = await response.json();
      setTask(data.data);
    } catch (err) {
      console.error('Error loading task:', err);
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
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

      await loadTask();
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Task</h3>
          <p className="text-muted-foreground">{error || 'Task not found'}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{task.description}</h1>
              {isOverdue(task.dueDate, task.status) && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">#{task.identifier}</p>
          </div>
        </div>

        {/* Status Change Dropdown */}
        <div className="flex items-center gap-2">
          <Select value={task.status} onValueChange={handleStatusChange} disabled={updating}>
            <SelectTrigger className="w-[180px]">
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

      {/* Task Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Status</span>
          </div>
          <Badge className={cn(statusColors[task.status as keyof typeof statusColors] || statusColors.draft)}>
            {task.status.replace(/-/g, ' ')}
          </Badge>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Priority</span>
          </div>
          <Badge className={cn(priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.routine)}>
            {task.priority}
          </Badge>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Due Date</span>
          </div>
          <p className={cn(
            "text-sm font-medium",
            isOverdue(task.dueDate, task.status) && "text-red-600"
          )}>
            {formatDate(task.dueDate)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
          </div>
          <p className="text-sm font-medium">
            {task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName || 'Unassigned'}
          </p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {task.notes && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.notes}
              </p>
            </Card>
          )}

          {/* Tabs */}
          <Card className="p-6">
            <Tabs defaultValue="comments">
              <TabsList>
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="subtasks">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Subtasks
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-4">
                <TaskComments taskId={taskId} />
              </TabsContent>

              <TabsContent value="subtasks" className="mt-4">
                <TaskSubtasks taskId={taskId} />
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <TaskHistory taskId={taskId} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Details</h3>
            <div className="space-y-4 text-sm">
              {task.category && (
                <div>
                  <p className="text-muted-foreground mb-1">Category</p>
                  <Badge variant="outline">{task.category.replace(/_/g, ' ')}</Badge>
                </div>
              )}

              {task.patientName && (
                <div>
                  <p className="text-muted-foreground mb-1">Patient</p>
                  <p className="font-medium">{task.patientName}</p>
                </div>
              )}

              {task.createdByUserName && (
                <div>
                  <p className="text-muted-foreground mb-1">Created By</p>
                  <p className="font-medium">{task.createdByUserName}</p>
                </div>
              )}

              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="font-medium">{formatDate(task.createdAt)}</p>
              </div>

              {task.completedAt && (
                <div>
                  <p className="text-muted-foreground mb-1">Completed</p>
                  <p className="font-medium">{formatDate(task.completedAt)}</p>
                </div>
              )}
            </div>
          </Card>

          {task.labels && task.labels.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label, idx) => (
                  <Badge key={idx} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
