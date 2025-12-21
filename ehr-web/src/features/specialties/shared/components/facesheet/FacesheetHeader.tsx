'use client';

import React from 'react';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import { calculateAge } from '@/utils/shared';

interface FacesheetHeaderProps {
  patient: {
    id: string;
    name: string;
    dob?: string;
    gender?: string;
    mrn?: string;
    phone?: string;
    email?: string;
    address?: string;
    photoUrl?: string;
  };
  identifiers?: Array<{
    label: string;
    value: string;
  }>;
}

export function FacesheetHeader({ patient, identifiers = [] }: FacesheetHeaderProps) {
  const age = patient.dob ? calculateAge(patient.dob) : null;

  const formattedDOB = patient.dob ? format(new Date(patient.dob), 'MM/dd/yyyy') : '-';

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm">
      {/* Compact single row */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200">
        {/* Photo */}
        <div className="flex-shrink-0">
          {patient.photoUrl ? (
            <img
              src={patient.photoUrl}
              alt={patient.name}
              className="w-12 h-12 rounded border border-gray-300 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Core Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <h1 className="text-base font-semibold text-gray-900">{patient.name}</h1>
            <span className="text-xs text-gray-600">
              {formattedDOB} {age !== null && `(${age}y)`}
            </span>
            <span className="text-xs text-gray-600">{patient.gender || '-'}</span>
            {patient.mrn && (
              <span className="text-xs text-gray-500">MRN: {patient.mrn}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600 mt-0.5">
            {patient.phone && <span>{patient.phone}</span>}
            {patient.email && <span>{patient.email}</span>}
          </div>
        </div>

        {/* Identifiers */}
        {identifiers.length > 0 && (
          <div className="flex gap-2">
            {identifiers.map((id, idx) => (
              <div key={idx} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                <div className="text-gray-500 text-[10px]">{id.label}</div>
                <div className="font-mono text-gray-900">{id.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
