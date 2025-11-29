/**
 * Task Service
 * Handles all task-related API calls with proper authentication
 */

import { Session } from 'next-auth';
import { getApiHeaders } from '@/lib/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Task {
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

export interface Comment {
  id: string;
  commentText: string;
  authorUserId?: string;
  authorUserName?: string;
  authorType: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedByUserId?: string;
  completedByUserName?: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  actorUserId?: string;
  actorUserName?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  category?: string;
  labels?: string[];
  dueAfter?: string;
  dueBefore?: string;
  isOverdue?: boolean;
  search?: string;
}

export interface TaskPagination {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Build API headers from session
 */
function buildHeaders(session: Session | null): HeadersInit {
  if (!session) {
    // Fallback to localStorage for legacy support
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(userId && { 'x-user-id': userId }),
      ...(orgId && { 'x-org-id': orgId })
    };
  }

  return getApiHeaders(session);
}

/**
 * Get all tasks with filters
 */
export async function getTasks(
  session: Session | null,
  filters?: TaskFilters,
  pagination?: TaskPagination
) {
  const params = new URLSearchParams();

  if (pagination?.limit) params.append('limit', pagination.limit.toString());
  if (pagination?.offset) params.append('offset', pagination.offset.toString());
  if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
  if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);

  if (filters?.status?.length) params.append('status', filters.status.join(','));
  if (filters?.priority?.length) params.append('priority', filters.priority.join(','));
  if (filters?.category) params.append('category', filters.category);
  if (filters?.labels?.length) params.append('labels', filters.labels.join(','));
  if (filters?.dueAfter) params.append('dueAfter', filters.dueAfter);
  if (filters?.dueBefore) params.append('dueBefore', filters.dueBefore);
  if (filters?.isOverdue) params.append('isOverdue', 'true');
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(
    `${API_URL}/api/tasks?${params.toString()}`,
    {
      headers: buildHeaders(session)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load tasks');
  }

  return response.json();
}

/**
 * Get my tasks (assigned to me)
 */
export async function getMyTasks(
  session: Session | null,
  filters?: TaskFilters,
  pagination?: TaskPagination
) {
  const params = new URLSearchParams();

  if (pagination?.limit) params.append('limit', pagination.limit.toString());
  if (pagination?.offset) params.append('offset', pagination.offset.toString());
  if (filters?.status?.length) params.append('status', filters.status.join(','));
  if (filters?.priority?.length) params.append('priority', filters.priority.join(','));
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(
    `${API_URL}/api/tasks/my-tasks?${params.toString()}`,
    {
      headers: buildHeaders(session)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load my tasks');
  }

  return response.json();
}

/**
 * Get tasks created by me
 */
export async function getCreatedByMeTasks(
  session: Session | null,
  pagination?: TaskPagination
) {
  const params = new URLSearchParams();

  if (pagination?.limit) params.append('limit', pagination.limit.toString());
  if (pagination?.offset) params.append('offset', pagination.offset.toString());

  const response = await fetch(
    `${API_URL}/api/tasks/created-by-me?${params.toString()}`,
    {
      headers: buildHeaders(session)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load created tasks');
  }

  return response.json();
}

/**
 * Get task by ID
 */
export async function getTask(session: Session | null, taskId: string) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}`,
    {
      headers: buildHeaders(session)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load task');
  }

  return response.json();
}

/**
 * Create new task
 */
export async function createTask(session: Session | null, taskData: any) {
  const response = await fetch(
    `${API_URL}/api/tasks`,
    {
      method: 'POST',
      headers: buildHeaders(session),
      body: JSON.stringify(taskData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }

  return response.json();
}

/**
 * Update task
 */
export async function updateTask(
  session: Session | null,
  taskId: string,
  updates: Partial<Task>
) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}`,
    {
      method: 'PUT',
      headers: buildHeaders(session),
      body: JSON.stringify(updates)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }

  return response.json();
}

/**
 * Get task comments
 */
export async function getTaskComments(session: Session | null, taskId: string) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}/comments`,
    {
      headers: buildHeaders(session)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load comments');
  }

  return response.json();
}

/**
 * Add task comment
 */
export async function addTaskComment(
  session: Session | null,
  taskId: string,
  commentText: string
) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}/comments`,
    {
      method: 'POST',
      headers: buildHeaders(session),
      body: JSON.stringify({ commentText })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }

  return response.json();
}

/**
 * Get task subtasks
 */
export async function getTaskSubtasks(session: Session | null, taskId: string) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}/subtasks`,
    {
      headers: buildHeaders(session)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load subtasks');
  }

  return response.json();
}

/**
 * Add task subtask
 */
export async function addTaskSubtask(
  session: Session | null,
  taskId: string,
  description: string
) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}/subtasks`,
    {
      method: 'POST',
      headers: buildHeaders(session),
      body: JSON.stringify({ description })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add subtask');
  }

  return response.json();
}

/**
 * Update subtask
 */
export async function updateSubtask(
  session: Session | null,
  subtaskId: string,
  isCompleted: boolean
) {
  const response = await fetch(
    `${API_URL}/api/tasks/subtasks/${subtaskId}`,
    {
      method: 'PUT',
      headers: buildHeaders(session),
      body: JSON.stringify({ isCompleted })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update subtask');
  }

  return response.json();
}

/**
 * Get task history
 */
export async function getTaskHistory(session: Session | null, taskId: string) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}/history`,
    {
      headers: buildHeaders(session)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load history');
  }

  return response.json();
}
