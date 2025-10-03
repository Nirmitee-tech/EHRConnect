'use client';

import React from 'react';
import { AppointmentStats } from '@/types/appointment';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface AppointmentStatsProps {
  stats: AppointmentStats;
  loading?: boolean;
}

export function AppointmentStatsPanel({ stats, loading }: AppointmentStatsProps) {
  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: Calendar,
      color: 'bg-gray-100 text-gray-700',
      iconColor: 'text-gray-600'
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: Clock,
      color: 'bg-blue-100 text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700',
      iconColor: 'text-green-600'
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'bg-red-100 text-red-700',
      iconColor: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Appointments</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Today</h3>
      <div className="space-y-2">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`flex items-center justify-between rounded-lg p-3 ${stat.color}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
