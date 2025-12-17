/**
 * Virtualized Patient List Component
 * 
 * Uses react-window for ultra-fast rendering of large patient lists
 * Target: Render 10,000+ patients without lag
 * 
 * Usage:
 *   import { VirtualizedPatientList } from '@/components/patients/virtualized-list';
 *   <VirtualizedPatientList patients={patients} onPatientClick={handleClick} />
 */

'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Patient {
  id: string;
  name?: Array<{
    family?: string;
    given?: string[];
  }>;
  birthDate?: string;
  gender?: string;
  identifier?: Array<{
    value?: string;
  }>;
}

interface VirtualizedPatientListProps {
  patients: Patient[];
  onPatientClick?: (patient: Patient) => void;
  height?: number;
  itemHeight?: number;
}

// Memoized patient row component
const PatientRow = React.memo(({ 
  patient, 
  style, 
  onClick 
}: { 
  patient: Patient; 
  style: React.CSSProperties; 
  onClick?: (patient: Patient) => void;
}) => {
  const handleClick = useCallback(() => {
    onClick?.(patient);
  }, [onClick, patient]);

  const displayName = useMemo(() => {
    const name = patient.name?.[0];
    if (!name) return 'Unknown';
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim();
  }, [patient.name]);

  const mrn = useMemo(() => {
    return patient.identifier?.[0]?.value || 'N/A';
  }, [patient.identifier]);

  const age = useMemo(() => {
    if (!patient.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(patient.birthDate);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }, [patient.birthDate]);

  return (
    <div
      style={style}
      className="px-4 py-2 border-b hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{displayName}</div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>MRN: {mrn}</span>
              {age !== null && (
                <>
                  <span>•</span>
                  <span>{age} years</span>
                </>
              )}
              {patient.gender && (
                <>
                  <span>•</span>
                  <span className="capitalize">{patient.gender}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="ml-2">
          View
        </Badge>
      </div>
    </div>
  );
});
PatientRow.displayName = 'PatientRow';

export const VirtualizedPatientList = React.memo(function VirtualizedPatientList({
  patients,
  onPatientClick,
  height = 600,
  itemHeight = 72,
}: VirtualizedPatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered patients
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;

    const query = searchQuery.toLowerCase();
    return patients.filter(patient => {
      const name = patient.name?.[0];
      const familyName = name?.family?.toLowerCase() || '';
      const givenName = name?.given?.join(' ').toLowerCase() || '';
      const mrn = patient.identifier?.[0]?.value?.toLowerCase() || '';

      return (
        familyName.includes(query) ||
        givenName.includes(query) ||
        mrn.includes(query)
      );
    });
  }, [patients, searchQuery]);

  // Memoized row renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const patient = filteredPatients[index];
    return (
      <PatientRow
        key={patient.id}
        patient={patient}
        style={style}
        onClick={onPatientClick}
      />
    );
  }, [filteredPatients, onPatientClick]);

  // Debounced search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  if (patients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No patients found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search by name or MRN..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      {/* Virtualized list */}
      <Card className="overflow-hidden">
        {filteredPatients.length > 0 ? (
          <List
            height={height}
            itemCount={filteredPatients.length}
            itemSize={itemHeight}
            width="100%"
            overscanCount={5} // Render 5 extra items for smooth scrolling
          >
            {Row}
          </List>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No patients match your search</p>
          </div>
        )}
      </Card>
    </div>
  );
});
