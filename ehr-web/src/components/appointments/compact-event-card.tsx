'use client';

import React from 'react';
import { Appointment } from '@/types/appointment';
import { cn } from '@/lib/utils';

interface CompactEventCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export function CompactEventCard({ appointment, onClick }: CompactEventCardProps) {
  const startTime = new Date(appointment.startTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventStyle = (status: string) => {
    switch (status) {
      case 'scheduled':
        // Dashed border style for scheduled (like in the screenshot)
        return {
          bgColor: 'bg-red-50/50',
          border: 'border-2 border-dashed border-red-400',
          textColor: 'text-red-800'
        };
      case 'in-progress':
        // Solid style for in-progress
        return {
          bgColor: 'bg-rose-400',
          border: 'border-0',
          textColor: 'text-white'
        };
      case 'completed':
        // Solid style for completed
        return {
          bgColor: 'bg-emerald-400',
          border: 'border-0',
          textColor: 'text-white'
        };
      case 'cancelled':
        // Gray style for cancelled
        return {
          bgColor: 'bg-gray-300',
          border: 'border-0',
          textColor: 'text-gray-700'
        };
      case 'no-show':
        // Different style for no-show
        return {
          bgColor: 'bg-orange-300',
          border: 'border-0',
          textColor: 'text-white'
        };
      default:
        // Default solid style
        return {
          bgColor: 'bg-rose-400',
          border: 'border-0',
          textColor: 'text-white'
        };
    }
  };

  const style = getEventStyle(appointment.status);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'px-2 py-1 rounded cursor-pointer hover:shadow-md transition-all',
        'text-[11px] leading-snug overflow-hidden',
        style.bgColor,
        style.border,
        style.textColor
      )}
    >
      <div className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden">
        <span className="font-semibold flex-shrink-0">
          {formatTime(startTime)}
        </span>
        <span className="truncate font-medium">
          {appointment.patientName || 'Untitled'}
        </span>
      </div>
    </div>
  );
}
