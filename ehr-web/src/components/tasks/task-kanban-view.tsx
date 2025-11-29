'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  User,
  Calendar,
  Tag,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  loading: boolean;
}

const columns = [
  { id: 'ready', title: 'Ready', color: 'border-blue-300' },
  { id: 'in-progress', title: 'In Progress', color: 'border-yellow-300' },
  { id: 'on-hold', title: 'On Hold', color: 'border-orange-300' },
  { id: 'completed', title: 'Completed', color: 'border-green-300' }
];

const priorityColors = {
  'routine': 'border-l-4 border-l-gray-400',
  'urgent': 'border-l-4 border-l-orange-400',
  'asap': 'border-l-4 border-l-red-400',
  'stat': 'border-l-4 border-l-red-600'
};

export function TaskKanbanView({ tasks, onTaskUpdate, loading }: TaskKanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedTask) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/${draggedTask.id}`, {
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
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks.filter(task => task.status === columnId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((col) => (
          <Card key={col.id} className="p-4">
            <h3 className="font-semibold mb-4">{col.title}</h3>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksForColumn(column.id);

        return (
          <Card
            key={column.id}
            className={cn("p-4", column.color)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <Badge variant="secondary">{columnTasks.length}</Badge>
            </div>

            {/* Column Tasks */}
            <div className="space-y-3">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "p-3 cursor-move hover:shadow-md transition-shadow",
                      priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.routine,
                      isOverdue(task.dueDate, task.status) && "bg-red-50 border-red-200"
                    )}
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="font-medium text-sm hover:underline flex-1"
                      >
                        {task.description}
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/tasks/${task.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Task ID */}
                    <p className="text-xs text-muted-foreground mb-2">
                      #{task.identifier}
                    </p>

                    {/* Priority Badge */}
                    <Badge
                      className={cn(
                        "text-xs mb-2",
                        task.priority === 'urgent' && "bg-orange-100 text-orange-700",
                        task.priority === 'stat' && "bg-red-500 text-white",
                        task.priority === 'asap' && "bg-red-100 text-red-700",
                        task.priority === 'routine' && "bg-gray-100 text-gray-700"
                      )}
                    >
                      {task.priority}
                    </Badge>

                    {/* Assignee */}
                    {(task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        <span className="truncate">
                          {task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName}
                        </span>
                      </div>
                    )}

                    {/* Due Date */}
                    <div className={cn(
                      "flex items-center gap-1 text-xs mb-2",
                      isOverdue(task.dueDate, task.status) ? "text-red-600 font-medium" : "text-muted-foreground"
                    )}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(task.dueDate)}</span>
                      {isOverdue(task.dueDate, task.status) && (
                        <AlertCircle className="h-3 w-3 ml-1" />
                      )}
                    </div>

                    {/* Labels */}
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.labels.slice(0, 2).map((label, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {task.labels.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{task.labels.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
