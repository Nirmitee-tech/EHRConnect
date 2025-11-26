'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Calendar, Clock, AlertCircle, ChevronRight, Bed, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as bedManagementService from '@/services/bed-management';
import type { Hospitalization } from '@/types/bed-management';

interface AdmissionsDashboardProps {
  orgId: string;
  userId?: string;
}

export default function AdmissionsDashboard({ orgId, userId }: AdmissionsDashboardProps) {
  const router = useRouter();
  const [currentInpatients, setCurrentInpatients] = useState<Hospitalization[]>([]);
  const [scheduledAdmissions, setScheduledAdmissions] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId, userId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const inpatients = await bedManagementService.getCurrentInpatients(orgId, userId);
      setCurrentInpatients(inpatients.filter(p => p.status === 'admitted'));
      setScheduledAdmissions(inpatients.filter(p => p.status === 'pre_admit'));
    } catch (err) {
      console.error('Error loading admissions data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admissions data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Admissions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage current and scheduled patient admissions
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => router.push('/bed-management/admit')}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          New Admission
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Admissions</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{currentInpatients.length}</div>
            <p className="text-xs text-gray-600">Currently in-facility</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Scheduled Admissions</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{scheduledAdmissions.length}</div>
            <p className="text-xs text-gray-600">Upcoming pre-admits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Managed</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {currentInpatients.length + scheduledAdmissions.length}
            </div>
            <p className="text-xs text-gray-600">Active + scheduled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Inpatients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5" />
              Current Inpatients
            </CardTitle>
            <CardDescription className="text-gray-600">
              {currentInpatients.length} patient{currentInpatients.length !== 1 ? 's' : ''} currently admitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentInpatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No current inpatients</p>
                <p className="text-sm text-gray-600 mb-4">
                  Admit your first patient to get started
                </p>
                <Button
                  onClick={() => router.push('/bed-management/admit')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Admit Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {currentInpatients.map((admission) => (
                  <div
                    key={admission.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push(`/patients/${admission.patientId}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{admission.patientName}</h4>
                        {admission.patientMrn && (
                          <Badge variant="outline" className="text-xs">
                            MRN: {admission.patientMrn}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            admission.priority === 'emergency' ? 'destructive' :
                            admission.priority === 'urgent' ? 'default' :
                            'secondary'
                          }
                        >
                          {admission.priority}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Bed className="h-3 w-3" />
                          <span>
                            {admission.currentBed?.bedNumber || 'No bed assigned'}
                            {admission.currentWard && ` • ${admission.currentWard.name}`}
                          </span>
                        </div>
                        {admission.attendingDoctorName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-3 w-3" />
                            <span>Dr. {admission.attendingDoctorName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            Admitted: {new Date(admission.admissionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Admissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5" />
              Scheduled Admissions
            </CardTitle>
            <CardDescription className="text-gray-600">
              {scheduledAdmissions.length} scheduled admission{scheduledAdmissions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledAdmissions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No scheduled admissions</p>
                <p className="text-sm text-gray-600 mb-4">
                  Schedule future admissions in advance
                </p>
                <Button
                  onClick={() => router.push('/bed-management/admit')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Admission
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {scheduledAdmissions.map((admission) => (
                  <div
                    key={admission.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors border-blue-200 bg-blue-50"
                    onClick={() => router.push(`/patients/${admission.patientId}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{admission.patientName}</h4>
                        {admission.patientMrn && (
                          <Badge variant="outline" className="text-xs">
                            MRN: {admission.patientMrn}
                          </Badge>
                        )}
                        <Badge variant="default" className="bg-blue-600 text-white">
                          Scheduled
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {admission.currentWard && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bed className="h-3 w-3" />
                            <span>{admission.currentWard.name}</span>
                          </div>
                        )}
                        {admission.attendingDoctorName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-3 w-3" />
                            <span>Dr. {admission.attendingDoctorName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Scheduled: {new Date(admission.admissionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
