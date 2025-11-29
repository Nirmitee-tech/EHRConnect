'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface Subtask {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedByUserId?: string;
  completedByUserName?: string;
  createdAt: string;
}

interface TaskSubtasksProps {
  taskId: string;
}

export function TaskSubtasks({ taskId }: TaskSubtasksProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const loadSubtasks = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}/subtasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load subtasks');

      const data = await response.json();
      setSubtasks(data.data || []);
    } catch (err) {
      console.error('Error loading subtasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubtasks();
  }, [taskId]);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ description: newSubtask })
      });

      if (!response.ok) throw new Error('Failed to add subtask');

      setNewSubtask('');
      await loadSubtasks();
    } catch (err) {
      console.error('Error adding subtask:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update subtask');

      await loadSubtasks();
    } catch (err) {
      console.error('Error updating subtask:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = () => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.isCompleted).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const progress = calculateProgress();
  const completedCount = subtasks.filter(st => st.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedCount} / {subtasks.length} completed ({progress}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <Input
          placeholder="Add a subtask..."
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={submitting || !newSubtask.trim()} size="sm">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </form>

      {/* Subtasks List */}
      <div className="space-y-3">
        {subtasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No subtasks yet. Add one to break down this task.
          </p>
        ) : (
          subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={`subtask-${subtask.id}`}
                checked={subtask.isCompleted}
                onCheckedChange={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`subtask-${subtask.id}`}
                  className={`text-sm cursor-pointer block ${
                    subtask.isCompleted ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {subtask.description}
                </label>
                {subtask.isCompleted && subtask.completedByUserName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed by {subtask.completedByUserName} on {formatDate(subtask.completedAt!)}
                  </p>
                )}
              </div>
              {subtask.isCompleted ? (
                <Check className="h-4 w-4 text-green-600 mt-1" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground mt-1" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
