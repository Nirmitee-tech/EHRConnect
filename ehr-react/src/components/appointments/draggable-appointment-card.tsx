'use client';

import React from 'react';
import type { Appointment } from '@/types/appointment';
import { AppointmentCard } from './appointment-card';

interface DraggableAppointmentCardProps {
  appointment: Appointment;
  onClick?: (e?: React.MouseEvent) => void;
  onDragStart?: (appointment: Appointment, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  className?: string;
  compact?: boolean;
  spanning?: boolean;
}

export function DraggableAppointmentCard({
  appointment,
  onClick,
  onDragStart,
  onDragEnd,
  className,
  compact = false,
  spanning = false
}: DraggableAppointmentCardProps) {
  // Only allow dragging scheduled appointments
  const isDraggable = appointment.status === 'scheduled';

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(appointment));

    // Create a visual feedback element
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);

    onDragStart?.(appointment, e);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`h-full ${isDraggable ? 'cursor-move' : 'cursor-not-allowed'}`}
    >
      <AppointmentCard
        appointment={appointment}
        onClick={onClick}
        className={className}
        compact={compact}
        spanning={spanning}
      />
    </div>
  );
}
