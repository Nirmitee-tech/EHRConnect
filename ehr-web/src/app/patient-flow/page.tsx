'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PatientFlowService, PatientFlowData, PatientFlowStatus } from '@/services/patient-flow.service';
import { FlowColumn } from '@/components/patient-flow/flow-column';
import { RefreshCw, Filter, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const FLOW_STATUSES: { status: PatientFlowStatus; title: string }[] = [
  { status: 'checked-in', title: 'Checked In' },
  { status: 'waiting-room', title: 'Waiting Room' },
  { status: 'with-provider', title: 'With Provider' },
  { status: 'ready-checkout', title: 'Ready for Checkout' },
  { status: 'checked-out', title: 'Checked Out' }
];

export default function PatientFlowPage() {
  const [patients, setPatients] = useState<PatientFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedPatient, setDraggedPatient] = useState<PatientFlowData | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadFlowData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await PatientFlowService.getTodayFlow();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patient flow:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlowData();
  }, [loadFlowData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadFlowData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadFlowData]);

  const handleDragStart = (e: React.DragEvent, patient: PatientFlowData) => {
    setDraggedPatient(patient);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedPatient(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: PatientFlowStatus) => {
    e.preventDefault();

    if (!draggedPatient || draggedPatient.flowStatus === newStatus) {
      setDraggedPatient(null);
      return;
    }

    try {
      // Optimistic update
      setPatients(prev =>
        prev.map(p =>
          p.id === draggedPatient.id
            ? { ...p, flowStatus: newStatus }
            : p
        )
      );

      // Update backend
      await PatientFlowService.updateFlowStatus(draggedPatient.id, newStatus);

      // Reload to get updated timestamps
      await loadFlowData(true);
    } catch (error) {
      console.error('Error updating flow status:', error);
      // Reload on error to revert optimistic update
      await loadFlowData(true);
    } finally {
      setDraggedPatient(null);
    }
  };

  const getPatientsByStatus = (status: PatientFlowStatus): PatientFlowData[] => {
    return patients
      .filter(p => p.flowStatus === status)
      .filter(p => filterProvider === 'all' || p.practitionerId === filterProvider);
  };

  const uniqueProviders = Array.from(new Set(patients.map(p => p.practitionerId)))
    .map(id => {
      const patient = patients.find(p => p.practitionerId === id);
      return patient ? { id, name: patient.practitionerName, color: patient.practitionerColor || undefined } : null;
    })
    .filter((p): p is { id: string; name: string; color: string | undefined } => p !== null);

  const totalActivePatients = patients.filter(p => p.flowStatus !== 'checked-out').length;
  const avgWaitTime = patients
    .filter(p => p.waitTime !== undefined && p.flowStatus !== 'checked-out')
    .reduce((acc, p) => acc + (p.waitTime || 0), 0) /
    patients.filter(p => p.waitTime !== undefined && p.flowStatus !== 'checked-out').length || 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Flow Board</h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time patient status tracking • Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="flex items-center gap-4 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalActivePatients}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="h-10 w-px bg-blue-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {isNaN(avgWaitTime) ? '0' : Math.round(avgWaitTime)}
                </div>
                <div className="text-xs text-gray-600">Avg Wait (min)</div>
              </div>
            </div>

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                autoRefresh
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-100 border-gray-200 text-gray-700'
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400')} />
                <span>Auto-refresh</span>
              </div>
            </button>

            {/* Manual refresh */}
            <button
              onClick={() => loadFlowData()}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Provider Filter */}
        {uniqueProviders.length > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter by provider:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilterProvider('all')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  filterProvider === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                )}
              >
                <Users className="w-3 h-3 inline mr-1" />
                All Providers
              </button>
              {uniqueProviders.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setFilterProvider(provider.id)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors border',
                    filterProvider === provider.id
                      ? 'text-white border-transparent'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                  style={
                    filterProvider === provider.id
                      ? { backgroundColor: provider.color || '#3B82F6' }
                      : {}
                  }
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flow Board */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-5 gap-4 h-full">
          {FLOW_STATUSES.map(({ status, title }) => (
            <FlowColumn
              key={status}
              status={status}
              title={title}
              patients={getPatientsByStatus(status)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onPatientClick={(patient) => {
                // TODO: Open patient details drawer
                console.log('Patient clicked:', patient);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
