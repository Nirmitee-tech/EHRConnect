'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Grid,
  List,
  Plus,
  Search,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFacility } from '@/contexts/facility-context';
import { TaskKanbanView } from '@/components/tasks/task-kanban-view';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskFilters } from '@/components/tasks/task-filters';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import * as taskService from '@/services/task.service';

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

export default function TasksPage() {
  const { data: session } = useSession();
  const { currentFacility } = useFacility();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-tasks' | 'created-by-me'>('my-tasks');

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: '',
    assignee: '',
    labels: [],
    dueAfter: '',
    dueBefore: '',
    isOverdue: false
  });

  // Load tasks from API
  const loadTasks = async (search: string = '', page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const taskFilters: taskService.TaskFilters = {
        search,
        status: filters.status.length > 0 ? filters.status : undefined,
        priority: filters.priority.length > 0 ? filters.priority : undefined,
        category: filters.category || undefined,
        labels: filters.labels.length > 0 ? filters.labels : undefined,
        dueAfter: filters.dueAfter || undefined,
        dueBefore: filters.dueBefore || undefined,
        isOverdue: filters.isOverdue || undefined
      };

      const pagination: taskService.TaskPagination = {
        limit: pageSize,
        offset: (page - 1) * pageSize
      };

      let data;
      if (activeTab === 'my-tasks') {
        data = await taskService.getMyTasks(session, taskFilters, pagination);
      } else if (activeTab === 'created-by-me') {
        data = await taskService.getCreatedByMeTasks(session, pagination);
      } else {
        data = await taskService.getTasks(session, taskFilters, pagination);
      }

      setTasks(data.data || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on mount and when filters/search change
  useEffect(() => {
    loadTasks(searchQuery, currentPage);
  }, [currentPage, filters, activeTab]);

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

  const handleCreateTask = async (taskData: any) => {
    try {
      await taskService.createTask(session, taskData);

      // Refresh tasks list
      await loadTasks(searchQuery, currentPage);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track tasks across your organization
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="my-tasks">
            <User className="h-4 w-4 mr-2" />
            My Tasks
          </TabsTrigger>
          <TabsTrigger value="all">
            <List className="h-4 w-4 mr-2" />
            All Tasks
          </TabsTrigger>
          <TabsTrigger value="created-by-me">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Created by Me
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by description or identifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode('kanban')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <h3 className="text-2xl font-bold">{totalCount}</h3>
            </div>
            <Circle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ready</p>
              <h3 className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'ready').length}
              </h3>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'in-progress').length}
              </h3>
            </div>
            <Loader2 className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'completed').length}
              </h3>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Tasks View */}
      {viewMode === 'list' ? (
        <TaskListView tasks={tasks} onTaskUpdate={loadTasks} loading={loading} />
      ) : (
        <TaskKanbanView tasks={tasks} onTaskUpdate={loadTasks} loading={loading} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} tasks
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
