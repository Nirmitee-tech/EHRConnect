'use client';

import React from 'react';
import {
  Wrench,
  MessageSquare,
  Plane,
  Phone,
  Coffee,
  Dumbbell,
  Lightbulb,
  Settings,
  HelpCircle,
  FileText,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  duration: string;
  icon?: string;
  color?: string;
}

interface UnassignedTasksPanelProps {
  className?: string;
}

const TASK_ICONS: Record<string, any> = {
  wrench: Wrench,
  message: MessageSquare,
  plane: Plane,
  phone: Phone,
  coffee: Coffee,
  gym: Dumbbell,
  lightbulb: Lightbulb,
  settings: Settings,
  help: HelpCircle,
  file: FileText,
  clock: Clock
};

const defaultTasks: Task[] = [
  { id: '1', title: 'Angular bug fix', icon: 'wrench', duration: '3 h', color: 'bg-purple-100 text-purple-700' },
  { id: '2', title: 'Answer forum question', icon: 'message', duration: '4 h', color: 'bg-blue-100 text-blue-700' },
  { id: '3', title: 'Book flight', icon: 'plane', duration: '7 h', color: 'bg-green-100 text-green-700' },
  { id: '4', title: 'Customer support call', icon: 'phone', duration: '3 h', color: 'bg-orange-100 text-orange-700' },
  { id: '5', title: 'Fun task', icon: 'coffee', duration: '4 h', color: 'bg-yellow-100 text-yellow-700' },
  { id: '6', title: 'Gym', icon: 'gym', duration: '1 h', color: 'bg-red-100 text-red-700' },
  { id: '7', title: 'Inspiring task', icon: 'lightbulb', duration: '2 h', color: 'bg-amber-100 text-amber-700' },
  { id: '8', title: 'Medium fun task', icon: 'settings', duration: '8 h', color: 'bg-indigo-100 text-indigo-700' },
  { id: '9', title: 'Mysterious task', icon: 'help', duration: '2 h', color: 'bg-pink-100 text-pink-700' },
  { id: '10', title: 'Outright boring task', icon: 'file', duration: '2 h', color: 'bg-slate-100 text-slate-700' },
  { id: '11', title: 'React feature fix', icon: 'wrench', duration: '2 h', color: 'bg-cyan-100 text-cyan-700' },
  { id: '12', title: 'Weekly Backup', icon: 'clock', duration: '1 h', color: 'bg-teal-100 text-teal-700' }
];

export function UnassignedTasksPanel({ className }: UnassignedTasksPanelProps) {
  const [tasks] = React.useState<Task[]>(defaultTasks);

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('task', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={cn('flex h-full flex-col bg-white', className)}>
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            UNASSIGNED TASKS
          </h2>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-1 flex items-center justify-end">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            DURATION
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {tasks.map((task) => {
            const IconComponent = TASK_ICONS[task.icon || 'file'];
            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleTaskDragStart(e, task)}
                className={cn(
                  'flex cursor-move items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 transition-all hover:shadow-md',
                  task.color || 'bg-gray-100 text-gray-700'
                )}
              >
                <div className="flex items-center gap-2">
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span className="text-sm font-medium">{task.title}</span>
                </div>
                <span className="text-sm font-semibold">{task.duration}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
