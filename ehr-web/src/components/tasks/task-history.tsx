'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Clock, User, FileEdit, CheckCircle2, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HistoryEntry {
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

interface TaskHistoryProps {
  taskId: string;
}

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load history');

      const data = await response.json();
      setHistory(data.data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [taskId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <FileEdit className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'assigned':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'claimed':
        return <User className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-700';
      case 'updated':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'assigned':
      case 'claimed':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getHistoryDescription = (entry: HistoryEntry) => {
    const actor = entry.actorUserName || 'System';

    switch (entry.action) {
      case 'created':
        return `${actor} created this task`;
      case 'updated':
        if (entry.field) {
          return (
            <>
              {actor} changed <strong>{formatFieldName(entry.field)}</strong>
              {entry.oldValue && (
                <>
                  {' '}from <Badge variant="outline" className="mx-1">{formatValue(entry.oldValue)}</Badge>
                </>
              )}
              {' '}to <Badge variant="outline" className="mx-1">{formatValue(entry.newValue)}</Badge>
            </>
          );
        }
        return `${actor} updated this task`;
      case 'completed':
        return `${actor} completed this task`;
      case 'cancelled':
        return `${actor} cancelled this task`;
      case 'assigned':
        return `${actor} assigned this task${entry.newValue ? ` to ${entry.newValue}` : ''}`;
      case 'claimed':
        return `${actor} claimed this task`;
      case 'comment_added':
        return `${actor} added a comment`;
      case 'subtask_added':
        return `${actor} added a subtask`;
      case 'subtask_completed':
        return `${actor} completed a subtask`;
      default:
        return `${actor} performed ${entry.action}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No history available yet.
        </p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {/* History entries */}
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex gap-4 relative">
                {/* Avatar */}
                <div className="relative z-10">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {getInitials(entry.actorUserName || 'System')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getActionBadgeColor(entry.action)}>
                      {entry.action.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getHistoryDescription(entry)}
                  </p>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:underline">
                        Additional details
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  {getActionIcon(entry.action)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
