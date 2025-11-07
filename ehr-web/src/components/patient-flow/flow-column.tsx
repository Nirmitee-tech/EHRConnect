'use client';

import React from 'react';
import { PatientFlowData, PatientFlowStatus } from '@/services/patient-flow.service';
import { FlowCard } from './flow-card';
import { cn } from '@/lib/utils';
import {
  UserCheck,
  Users,
  Stethoscope,
  CheckCircle,
  LogOut
} from 'lucide-react';

interface FlowColumnProps {
  status: PatientFlowStatus;
  title: string;
  patients: PatientFlowData[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: PatientFlowStatus) => void;
  onDragStart: (e: React.DragEvent, patient: PatientFlowData) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onPatientClick?: (patient: PatientFlowData) => void;
}

const STATUS_CONFIG: Record<PatientFlowStatus, { icon: React.ElementType; color: string; bgColor: string }> = {
  'checked-in': {
    icon: UserCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'waiting-room': {
    icon: Users,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'with-provider': {
    icon: Stethoscope,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  'ready-checkout': {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  'checked-out': {
    icon: LogOut,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
};

export function FlowColumn({
  status,
  title,
  patients,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onPatientClick
}: FlowColumnProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={cn('px-3 py-2 rounded-t-lg border-b-2', config.bgColor, `border-${config.color.split('-')[1]}-400`)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg bg-white', config.color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-600">{patients.length} patient{patients.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
            config.bgColor,
            config.color
          )}>
            {patients.length}
          </div>
        </div>
      </div>

      {/* Column Body - Scrollable */}
      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, status)}
        className={cn(
          'flex-1 p-2 space-y-2 overflow-y-auto bg-gray-50 rounded-b-lg',
          'min-h-[200px] border-2 border-dashed border-transparent',
          'transition-colors duration-200'
        )}
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Icon className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No patients</p>
          </div>
        ) : (
          patients.map((patient) => (
            <FlowCard
              key={patient.id}
              patient={patient}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onPatientClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
