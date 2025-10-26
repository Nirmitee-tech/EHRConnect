'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, RefreshCw, Clock, Filter, UserPlus, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as bedManagementService from '@/services/bed-management';
import type { Ward, Bed, Hospitalization } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';
import { WardFloorPlan } from '@/components/bed-management/ward-floor-plan';
import { OperationsPanel, Operation } from '@/components/bed-management/operations-panel';
import { BedEventTimeline, BedEvent } from '@/components/bed-management/bed-event-timeline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function FloorPlanBedManagementPage() {
  const { data: session } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [beds, setBeds] = useState<Bed[]>([]);
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  // Patient admission dialog
  const [admitDialogOpen, setAdmitDialogOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [admitting, setAdmitting] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patientId: '',
    patientName: '',
    patientMrn: '',
    admissionReason: '',
    primaryDiagnosis: '',
    primaryDiagnosisCode: '',
    admittingPractitionerId: '',
    admittingPractitionerName: '',
    priority: 'routine' as 'routine' | 'urgent' | 'emergency',
  });

  const createTodayAt = (hours: number, minutes: number): Date => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Mock operations data (TODO: Replace with real API when available)
  const [operations] = useState<Operation[]>([
    {
      id: '1',
      dateTime: createTodayAt(14, 30),
      patientName: 'Scheduled Patient',
      patientMrn: 'PENDING',
      procedureName: 'Example Procedure',
      procedureCode: 'OPS-001',
      surgeon: 'Attending Surgeon',
      department: 'Surgery',
      operatingRoom: 'OR',
      estimatedDuration: 120,
      priority: 'routine',
      status: 'scheduled',
      requiresBed: true,
      notes: 'Replace with real operations data from your API',
    },
  ]);

  // Get auth from session
  useEffect(() => {
    if (!session) return;
    if (session.org_id) {
      setOrgId(session.org_id);
      setUserId((session.user as any)?.id || session.user?.email || null);
    }
  }, [session]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load data
  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId, userId]);

  async function loadData() {
    if (!orgId) return;
    try {
      setLoading(true);
      setError(null);

      const [wardsData, bedsData, hospitalizationsData] = await Promise.all([
        bedManagementService.getWards(orgId, userId || undefined, {
          locationId: currentFacility?.id,
          active: true,
        }),
        bedManagementService.getBeds(orgId, userId || undefined, {
          locationId: currentFacility?.id,
          active: true,
        }),
        bedManagementService.getHospitalizations(orgId, userId || undefined, {
          locationId: currentFacility?.id,
          status: ['admitted', 'pre_admit'],
        }),
      ]);

      setWards(wardsData);
      setBeds(bedsData);
      setHospitalizations(hospitalizationsData);

      // Auto-select first ward
      if (wardsData.length > 0 && !selectedWardId) {
        setSelectedWardId(wardsData[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Generate bed events from hospitalizations
  const generateBedEvents = (): BedEvent[] => {
    const events: BedEvent[] = [];

    hospitalizations.forEach((hosp) => {
      if (hosp.currentBedId && hosp.bedAssignedAt) {
        const bed = beds.find(b => b.id === hosp.currentBedId);
        const ward = wards.find(w => w.id === hosp.currentWardId);

        events.push({
          id: `admission-${hosp.id}`,
          timestamp: hosp.admissionDate,
          eventType: 'admission',
          bedId: hosp.currentBedId,
          bedNumber: bed?.bedNumber || 'Unknown',
          wardName: ward?.name || 'Unknown Ward',
          roomNumber: bed?.room?.roomNumber,
          patientName: hosp.patientName,
          patientMrn: hosp.patientMrn,
          performedBy: hosp.admittingPractitionerName || 'Staff',
          priority: hosp.priority,
          notes: `Admitted: ${hosp.admissionReason}`,
        });
      }

      if (hosp.status === 'discharged' && hosp.dischargeDate) {
        const bed = beds.find(b => b.id === hosp.currentBedId);
        const ward = wards.find(w => w.id === hosp.currentWardId);

        events.push({
          id: `discharge-${hosp.id}`,
          timestamp: hosp.dischargeDate,
          eventType: 'discharge',
          bedId: hosp.currentBedId || '',
          bedNumber: bed?.bedNumber || 'Unknown',
          wardName: ward?.name || 'Unknown Ward',
          roomNumber: bed?.room?.roomNumber,
          patientName: hosp.patientName,
          patientMrn: hosp.patientMrn,
          performedBy: hosp.dischargePractitionerName || 'Staff',
          notes: hosp.dischargeSummary,
        });
      }
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleBedClick = (bed: Bed) => {
    setSelectedBedId(bed.id);
    setSelectedBed(bed);

    if (bed.status === 'available') {
      setAdmitDialogOpen(true);
    }
  };

  const handlePatientClick = (hospitalization: Hospitalization) => {
    console.log('Patient clicked:', hospitalization);
    alert(`Patient: ${hospitalization.patientName}\nMRN: ${hospitalization.patientMrn}\nDiagnosis: ${hospitalization.primaryDiagnosis || 'N/A'}\nDoctor: ${hospitalization.attendingDoctorName || 'N/A'}`);
  };

  const handleOperationClick = (operation: Operation) => {
    console.log('Operation clicked:', operation);
    alert(`Operation: ${operation.procedureName}\nPatient: ${operation.patientName}\nTime: ${new Date(operation.dateTime).toLocaleString()}`);
  };

  const handleEventClick = (event: BedEvent) => {
    setSelectedBedId(event.bedId);
  };

  const handleAdmitPatient = async () => {
    if (!selectedBed || !orgId || !newPatient.patientName) return;

    try {
      setAdmitting(true);

      // Create hospitalization
      const admissionData = {
        patientId: newPatient.patientId || `temp-${Date.now()}`,
        locationId: currentFacility?.id || selectedBed.locationId,
        admissionDate: new Date().toISOString(),
        admissionType: newPatient.priority === 'emergency' ? 'emergency' as const : 'elective' as const,
        admissionReason: newPatient.admissionReason || 'New admission',
        primaryDiagnosis: newPatient.primaryDiagnosis,
        primaryDiagnosisCode: newPatient.primaryDiagnosisCode,
        admittingPractitionerId: newPatient.admittingPractitionerId,
        priority: newPatient.priority,
      };

      // Admit patient
      const hospitalization = await bedManagementService.admitPatient(
        orgId,
        userId || undefined,
        admissionData
      );

      // Assign bed
      await bedManagementService.assignBed(
        orgId,
        userId || undefined,
        {
          hospitalizationId: hospitalization.id,
          bedId: selectedBed.id,
          notes: 'Assigned from floor plan',
        }
      );

      // Reload data
      await loadData();

      // Reset form
      setNewPatient({
        patientId: '',
        patientName: '',
        patientMrn: '',
        admissionReason: '',
        primaryDiagnosis: '',
        primaryDiagnosisCode: '',
        admittingPractitionerId: '',
        admittingPractitionerName: '',
        priority: 'routine',
      });
      setAdmitDialogOpen(false);
      setSelectedBed(null);

      alert('Patient admitted successfully!');
    } catch (err) {
      console.error('Error admitting patient:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to admit patient'}`);
    } finally {
      setAdmitting(false);
    }
  };

  if (loading && beds.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bed management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md p-6">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="h-5 w-5" />
            <h2 className="font-bold text-lg">Error Loading Data</h2>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (wards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md p-6">
          <div className="text-center">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h2 className="font-bold text-lg mb-2">No Wards Found</h2>
            <p className="text-muted-foreground mb-4">
              Please create wards and beds to use the floor plan view.
            </p>
            <Button onClick={() => window.location.href = '/bed-management/wards'}>
              Configure Wards
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedWard = wards.find(w => w.id === selectedWardId);
  const wardBeds = selectedWardId ? beds.filter(b => b.wardId === selectedWardId) : [];
  const bedEvents = generateBedEvents();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">Bed Management - Floor Plan (Real Data)</h1>
              <p className="text-xs text-muted-foreground">
                Click available beds to admit patients • {beds.length} total beds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
              {beds.filter(b => b.status === 'available').length} Available
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-1"></span>
              {beds.filter(b => b.status === 'occupied').length} Occupied
            </Badge>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded text-xs font-mono">
              <Clock className="h-3 w-3" />
              {currentTime.toLocaleTimeString()}
            </div>
            <Button size="sm" variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Ward Tabs */}
        {wards.length > 1 && (
          <div className="mt-3">
            <Tabs value={selectedWardId} onValueChange={setSelectedWardId}>
              <TabsList className="h-9">
                {wards.map((ward) => (
                  <TabsTrigger key={ward.id} value={ward.id} className="text-xs gap-2">
                    {ward.code || ward.name}
                    <Badge variant="secondary" className="text-[10px]">
                      {beds.filter(b => b.wardId === ward.id && b.status === 'occupied').length}/
                      {beds.filter(b => b.wardId === ward.id).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Floor Plan */}
        <div className="flex-1 overflow-auto p-4">
          {selectedWard ? (
            wardBeds.length > 0 ? (
              <WardFloorPlan
                ward={selectedWard}
                beds={wardBeds}
                hospitalizations={hospitalizations}
                onBedClick={handleBedClick}
                onPatientClick={handlePatientClick}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Card className="p-6 text-center">
                  <Filter className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground">No beds found in this ward</p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.href = '/bed-management/beds'}
                  >
                    Add Beds
                  </Button>
                </Card>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="p-6 text-center">
                <Filter className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">Select a ward to view floor plan</p>
              </Card>
            </div>
          )}
        </div>

        {/* Right: Operations Panel */}
        <div className="w-80 border-l bg-white overflow-hidden flex-shrink-0">
          <OperationsPanel
            operations={operations}
            onOperationClick={handleOperationClick}
            title="Scheduled Operations"
            showDate={true}
          />
        </div>
      </div>

      {/* Bottom: Event Timeline */}
      <div className="border-t bg-white p-4 flex-shrink-0">
        <BedEventTimeline
          events={bedEvents}
          selectedBedId={selectedBedId || undefined}
          onEventClick={handleEventClick}
          showDate={true}
        />
      </div>

      {/* Admit Patient Dialog */}
      <Dialog open={admitDialogOpen} onOpenChange={setAdmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Admit Patient to {selectedBed?.bedNumber}
            </DialogTitle>
            <DialogDescription>
              Enter patient details to admit to this bed. This will create a new hospitalization record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                placeholder="Last Name, First Name"
                value={newPatient.patientName}
                onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientMrn">MRN</Label>
              <Input
                id="patientMrn"
                placeholder="Medical Record Number"
                value={newPatient.patientMrn}
                onChange={(e) => setNewPatient({ ...newPatient, patientMrn: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admissionReason">Admission Reason *</Label>
              <Input
                id="admissionReason"
                placeholder="e.g., Post-operative care, Emergency admission"
                value={newPatient.admissionReason}
                onChange={(e) => setNewPatient({ ...newPatient, admissionReason: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="primaryDiagnosis">Primary Diagnosis</Label>
              <Input
                id="primaryDiagnosis"
                placeholder="e.g., Pneumonia, Acute Appendicitis"
                value={newPatient.primaryDiagnosis}
                onChange={(e) => setNewPatient({ ...newPatient, primaryDiagnosis: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="diagnosisCode">Diagnosis Code (ICD-10)</Label>
              <Input
                id="diagnosisCode"
                placeholder="e.g., J18.9, K35.8"
                value={newPatient.primaryDiagnosisCode}
                onChange={(e) => setNewPatient({ ...newPatient, primaryDiagnosisCode: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attendingDoctor">Attending Doctor Name</Label>
              <Input
                id="attendingDoctor"
                placeholder="e.g., Dr. Smith"
                value={newPatient.admittingPractitionerName}
                onChange={(e) => setNewPatient({ ...newPatient, admittingPractitionerName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={newPatient.priority}
                onValueChange={(value: any) => setNewPatient({ ...newPatient, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdmitDialogOpen(false)} disabled={admitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAdmitPatient}
              disabled={!newPatient.patientName || !newPatient.admissionReason || admitting}
            >
              {admitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Admitting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Admit Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
