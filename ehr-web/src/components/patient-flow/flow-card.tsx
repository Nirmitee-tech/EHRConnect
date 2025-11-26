'use client';

import React from 'react';
import { Clock, User, FileText, Phone, Video, AlertCircle } from 'lucide-react';
import { PatientFlowData } from '@/services/patient-flow.service';
import { cn } from '@/lib/utils';

interface FlowCardProps {
  patient: PatientFlowData;
  onDragStart: (e: React.DragEvent, patient: PatientFlowData) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onClick?: (patient: PatientFlowData) => void;
}

export function FlowCard({ patient, onDragStart, onDragEnd, onClick }: FlowCardProps) {
  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes < 15) return 'text-green-600';
    if (minutes < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModeIcon = () => {
    switch (patient.mode) {
      case 'video-call':
        return <Video className="w-3 h-3" />;
      case 'voice-call':
        return <Phone className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getModeLabel = () => {
    switch (patient.mode) {
      case 'video-call':
        return 'Video';
      case 'voice-call':
        return 'Phone';
      case 'in-person':
        return 'In-Person';
      default:
        return 'In-Person';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, patient)}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(patient)}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 cursor-move',
        'hover:shadow-md hover:border-blue-300 transition-all duration-200',
        'active:scale-95 active:shadow-sm'
      )}
    >
      {/* Header: Patient Name & Wait Time */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {patient.patientName}
          </h3>
          {patient.room && (
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded mt-1">
              Room {patient.room}
            </span>
          )}
        </div>
        {patient.waitTime !== undefined && patient.flowStatus !== 'checked-out' && (
          <div className={cn('flex items-center gap-1 text-xs font-semibold', getWaitTimeColor(patient.waitTime))}>
            <Clock className="w-3 h-3" />
            <span>{patient.waitTime}m</span>
          </div>
        )}
      </div>

      {/* Appointment Time & Duration */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatTime(patient.startTime)}</span>
        </div>
        <span className="text-gray-400">•</span>
        <span>{patient.duration}min</span>
      </div>

      {/* Provider */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
          style={{ backgroundColor: patient.practitionerColor || '#3B82F6' }}
        >
          {patient.practitionerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <span className="text-xs text-gray-700 truncate flex-1">
          {patient.practitionerName}
        </span>
      </div>

      {/* Appointment Type & Mode */}
      <div className="flex items-center gap-2 flex-wrap">
        {patient.appointmentType && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
            <FileText className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{patient.appointmentType}</span>
          </div>
        )}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
          {getModeIcon()}
          <span>{getModeLabel()}</span>
        </div>
      </div>

      {/* Reason/Chief Complaint */}
      {patient.reason && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-start gap-1">
            <AlertCircle className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-gray-600 line-clamp-2">{patient.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
