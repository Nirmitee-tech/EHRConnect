'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Search,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Tag,
  Edit2,
  CheckSquare,
  ListTodo,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateTaskSidebar } from '@/components/tasks/create-task-sidebar';
import { EditTaskSidebar } from '@/components/tasks/edit-task-sidebar';
import * as taskService from '@/services/task.service';
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
  createdAt: string;
  completedAt?: string;
}

export default function TasksPage() {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load tasks from API
  const loadTasks = async (search: string = '', page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const pagination: taskService.TaskPagination = {
        limit: pageSize,
        offset: (page - 1) * pageSize
      };

      const data = await taskService.getMyTasks(session, {}, pagination);

      setTasks(data.data || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on mount
  useEffect(() => {
    loadTasks(searchQuery, currentPage);
  }, [currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
        loadTasks(searchQuery, 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTaskCreated = async (task: any) => {
    await loadTasks(searchQuery, currentPage);
  };

  const handleTaskUpdated = async (task: any) => {
    await loadTasks(searchQuery, currentPage);
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
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(task =>
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.identifier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    ready: tasks.filter(t => t.status === 'ready').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('tasks.title')}</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {t('tasks.manage_tasks')}
          </p>
        </div>
        <Button
          onClick={() => setIsCreateSidebarOpen(true)}
          className="bg-primary hover:opacity-90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('tasks.new_task')}
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('tasks.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{statusCounts.ready}</div>
              <div className="text-xs text-gray-600">Ready</div>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{statusCounts.inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{statusCounts.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>{t('tasks.error_label')}</strong> {error}
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-gray-600">{t('tasks.loading_tasks')}</span>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <CheckSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">{t('tasks.no_tasks_found')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery ? 'No tasks match your search criteria.' : 'Get started by creating your first task'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateSidebarOpen(true)} className="bg-primary hover:opacity-90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                          {task.description?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{task.description}</div>
                          <div className="text-xs text-gray-500">#{task.identifier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${task.priority === 'stat'
                          ? 'bg-red-500 text-white'
                          : task.priority === 'asap'
                            ? 'bg-red-50 text-red-700'
                            : task.priority === 'urgent'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                      >
                        {task.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {task.assignedToUserName || task.assignedToPatientName || task.assignedToPoolName || '—'}
                      </div>
                      {task.patientName && (
                        <div className="text-xs text-gray-500">Patient: {task.patientName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${isOverdue(task.dueDate, task.status)
                          ? 'text-red-600 font-medium'
                          : 'text-gray-900'
                          }`}
                      >
                        {formatDate(task.dueDate)}
                      </div>
                      {isOverdue(task.dueDate, task.status) && (
                        <div className="text-xs text-red-600">Overdue</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : task.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {task.status.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => handleEditTask(task)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      }

      {/* Create Task Sidebar */}
      <CreateTaskSidebar
        open={isCreateSidebarOpen}
        onOpenChange={setIsCreateSidebarOpen}
        onTaskCreated={handleTaskCreated}
        orgId={session?.org_id || ''}
        userId={session?.user?.id}
      />

      {/* Edit Task Sidebar */}
      {
        selectedTask && (
          <EditTaskSidebar
            open={isEditSidebarOpen}
            onOpenChange={setIsEditSidebarOpen}
            onTaskUpdated={handleTaskUpdated}
            task={selectedTask}
            orgId={session?.org_id || ''}
            userId={session?.user?.id}
          />
        )
      }
    </div >
  );
}
