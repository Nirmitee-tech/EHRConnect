'use client';

import { useState } from 'react';
import { ArrowLeft, RefreshCw, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WardFloorPlan } from '@/components/bed-management/ward-floor-plan';
import { OperationsPanel, Operation } from '@/components/bed-management/operations-panel';
import { BedEventTimeline, BedEvent } from '@/components/bed-management/bed-event-timeline';
import type { Ward, Bed, Hospitalization } from '@/types/bed-management';
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

export default function BedManagementDemoPage() {
  // Mock Ward Data
  const [ward] = useState<Ward>({
    id: 'ward-1',
    orgId: 'org-1',
    locationId: 'loc-1',
    name: 'OIM2 - General Ward',
    code: 'OIM2',
    wardType: 'general',
    floorNumber: '2',
    building: 'Main Building',
    totalCapacity: 12,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Mock Beds Data
  const [beds, setBeds] = useState<Bed[]>([
    {
      id: 'bed-1',
      orgId: 'org-1',
      locationId: 'loc-1',
      wardId: 'ward-1',
      roomId: 'room-1',
      bedNumber: 'OIM1-10',
      bedType: 'standard',
      status: 'occupied',
      statusUpdatedAt: new Date(),
      hasOxygen: true,
      hasSuction: false,
      hasMonitor: true,
      hasIvPole: true,
      isElectric: true,
      currentPatientId: 'patient-1',
      currentPatientName: 'Weib, O.',
      currentAdmissionId: 'adm-1',
      occupiedSince: new Date(Date.now() - 2 * 60 * 60 * 1000),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bed-2',
      orgId: 'org-1',
      locationId: 'loc-1',
      wardId: 'ward-1',
      roomId: 'room-1',
      bedNumber: 'OIM1-05',
      bedType: 'standard',
      status: 'available',
      statusUpdatedAt: new Date(),
      hasOxygen: true,
      hasSuction: true,
      hasMonitor: false,
      hasIvPole: true,
      isElectric: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bed-3',
      orgId: 'org-1',
      locationId: 'loc-1',
      wardId: 'ward-1',
      roomId: 'room-2',
      bedNumber: 'OIM2-01',
      bedType: 'icu',
      status: 'occupied',
      statusUpdatedAt: new Date(),
      hasOxygen: true,
      hasSuction: true,
      hasMonitor: true,
      hasIvPole: true,
      isElectric: true,
      currentPatientId: 'patient-2',
      currentPatientName: 'Schmidt, M.',
      currentAdmissionId: 'adm-2',
      occupiedSince: new Date(Date.now() - 6 * 60 * 60 * 1000),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bed-4',
      orgId: 'org-1',
      locationId: 'loc-1',
      wardId: 'ward-1',
      roomId: 'room-2',
      bedNumber: 'OIM2-02',
      bedType: 'standard',
      status: 'available',
      statusUpdatedAt: new Date(),
      hasOxygen: false,
      hasSuction: false,
      hasMonitor: false,
      hasIvPole: true,
      isElectric: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bed-5',
      orgId: 'org-1',
      locationId: 'loc-1',
      wardId: 'ward-1',
      roomId: 'room-3',
      bedNumber: 'OIM2-03',
      bedType: 'standard',
      status: 'reserved',
      statusUpdatedAt: new Date(),
      hasOxygen: true,
      hasSuction: false,
      hasMonitor: false,
      hasIvPole: true,
      isElectric: true,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bed-6',
      orgId: 'org-1',
      locationId: 'loc-1',
      wardId: 'ward-1',
      roomId: 'room-3',
      bedNumber: 'OIM2-04',
      bedType: 'standard',
      status: 'cleaning',
      statusUpdatedAt: new Date(),
      hasOxygen: false,
      hasSuction: false,
      hasMonitor: false,
      hasIvPole: false,
      isElectric: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Mock Hospitalizations
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([
    {
      id: 'adm-1',
      orgId: 'org-1',
      locationId: 'loc-1',
      patientId: 'patient-1',
      patientName: 'Weib, O.',
      patientMrn: '1978',
      encounterId: 'enc-1',
      admissionEncounterType: 'inpatient',
      admissionDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      admissionType: 'urgent',
      admissionReason: 'Post-operative care',
      primaryDiagnosis: 'Acute Appendicitis',
      primaryDiagnosisCode: 'K35.8',
      currentBedId: 'bed-1',
      currentWardId: 'ward-1',
      bedAssignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      attendingDoctorName: 'Dr. Wilson',
      status: 'admitted',
      priority: 'urgent',
      isolationRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'adm-2',
      orgId: 'org-1',
      locationId: 'loc-1',
      patientId: 'patient-2',
      patientName: 'Schmidt, M.',
      patientMrn: '2154',
      encounterId: 'enc-2',
      admissionEncounterType: 'inpatient',
      admissionDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
      admissionType: 'elective',
      admissionReason: 'Hip replacement surgery',
      primaryDiagnosis: 'Osteoarthritis of hip',
      primaryDiagnosisCode: 'M16.1',
      currentBedId: 'bed-3',
      currentWardId: 'ward-1',
      bedAssignedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      attendingDoctorName: 'Dr. Anderson',
      status: 'admitted',
      priority: 'routine',
      isolationRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const createTodayAt = (hours: number, minutes: number): Date => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Mock Operations
  const [operations] = useState<Operation[]>([
    {
      id: '1',
      dateTime: createTodayAt(14, 30),
      patientName: 'Mueller, K.',
      patientMrn: '3421',
      procedureName: 'Cardiac Catheterization',
      procedureCode: 'OPS-003',
      surgeon: 'Martinez',
      department: 'Cardiology',
      operatingRoom: 'Cath Lab',
      estimatedDuration: 90,
      priority: 'emergency',
      status: 'scheduled',
      requiresIcu: false,
      requiresBed: true,
      notes: 'Needs bed assignment after procedure',
    },
    {
      id: '2',
      dateTime: createTodayAt(16, 0),
      patientName: 'Johnson, L.',
      patientMrn: '4567',
      procedureName: 'Laparoscopic Cholecystectomy',
      procedureCode: 'OPS-004',
      surgeon: 'Thompson',
      department: 'General Surgery',
      operatingRoom: 'OR-3',
      estimatedDuration: 120,
      priority: 'routine',
      status: 'scheduled',
      requiresBed: true,
    },
  ]);

  // Mock Events
  const [bedEvents, setBedEvents] = useState<BedEvent[]>([
    {
      id: 'e1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      eventType: 'admission',
      bedId: 'bed-1',
      bedNumber: 'OIM1-10',
      wardName: 'OIM2',
      roomNumber: '101',
      patientName: 'Weib, O.',
      patientMrn: '1978',
      performedBy: 'Dr. Wilson',
      priority: 'urgent',
      notes: 'Beginn Belegung durch Patient Weib, O., 1978 (ACVJB) (Zugang aus OP)',
    },
    {
      id: 'e2',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      eventType: 'discharge',
      bedId: 'bed-2',
      bedNumber: 'OIM1-05',
      wardName: 'OIM2',
      roomNumber: '101',
      patientName: 'Brown, A.',
      patientMrn: '1654',
      performedBy: 'Dr. Thompson',
      notes: 'Patient discharged in stable condition',
    },
    {
      id: 'e3',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      eventType: 'admission',
      bedId: 'bed-3',
      bedNumber: 'OIM2-01',
      wardName: 'OIM2',
      roomNumber: '102',
      patientName: 'Schmidt, M.',
      patientMrn: '2154',
      performedBy: 'Dr. Anderson',
      priority: 'routine',
    },
  ]);

  // Dialog state for admitting patients
  const [admitDialogOpen, setAdmitDialogOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: '',
    mrn: '',
    diagnosis: '',
    priority: 'routine' as 'routine' | 'urgent' | 'emergency',
  });

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
    if (bed.status === 'available') {
      setAdmitDialogOpen(true);
    }
  };

  const handleAdmitPatient = () => {
    if (!selectedBed || !newPatient.name) return;

    const newAdmissionId = `adm-${Date.now()}`;
    const newPatientId = `patient-${Date.now()}`;

    // Update bed
    setBeds(beds.map(bed =>
      bed.id === selectedBed.id
        ? {
            ...bed,
            status: 'occupied' as const,
            currentPatientId: newPatientId,
            currentPatientName: newPatient.name,
            currentAdmissionId: newAdmissionId,
            occupiedSince: new Date(),
          }
        : bed
    ));

    // Add hospitalization
    const newHospitalization: Hospitalization = {
      id: newAdmissionId,
      orgId: 'org-1',
      locationId: 'loc-1',
      patientId: newPatientId,
      patientName: newPatient.name,
      patientMrn: newPatient.mrn,
      encounterId: `enc-${Date.now()}`,
      admissionEncounterType: 'inpatient',
      admissionDate: new Date(),
      admissionType: newPatient.priority === 'emergency' ? 'emergency' : 'elective',
      admissionReason: 'New admission',
      primaryDiagnosis: newPatient.diagnosis,
      currentBedId: selectedBed.id,
      currentWardId: selectedBed.wardId,
      bedAssignedAt: new Date(),
      status: 'admitted',
      priority: newPatient.priority,
      isolationRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setHospitalizations([...hospitalizations, newHospitalization]);

    // Add event
    const newEvent: BedEvent = {
      id: `e-${Date.now()}`,
      timestamp: new Date(),
      eventType: 'admission',
      bedId: selectedBed.id,
      bedNumber: selectedBed.bedNumber,
      wardName: ward.name,
      roomNumber: selectedBed.room?.roomNumber,
      patientName: newPatient.name,
      patientMrn: newPatient.mrn,
      performedBy: 'Current User',
      priority: newPatient.priority,
      notes: `Patient ${newPatient.name} admitted to ${selectedBed.bedNumber}`,
    };
    setBedEvents([newEvent, ...bedEvents]);

    // Reset form
    setNewPatient({ name: '', mrn: '', diagnosis: '', priority: 'routine' });
    setAdmitDialogOpen(false);
    setSelectedBed(null);
  };

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
              <h1 className="text-xl font-bold">Bed Management - Demo (With Mock Data)</h1>
              <p className="text-xs text-muted-foreground">
                Click on available (green) beds to admit patients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {beds.filter(b => b.status === 'occupied').length}/{beds.length} Occupied
            </Badge>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Floor Plan */}
        <div className="flex-1 overflow-auto p-4">
          <WardFloorPlan
            ward={ward}
            beds={beds}
            hospitalizations={hospitalizations}
            onBedClick={handleBedClick}
            onPatientClick={(hosp) => alert(`Patient: ${hosp.patientName}\nDiagnosis: ${hosp.primaryDiagnosis}`)}
          />
        </div>

        {/* Right: Operations Panel */}
        <div className="w-80 border-l bg-white overflow-hidden flex-shrink-0">
          <OperationsPanel
            operations={operations}
            onOperationClick={(op) => alert(`Operation: ${op.procedureName}\nPatient: ${op.patientName}`)}
            title="Scheduled Operations"
            showDate={true}
          />
        </div>
      </div>

      {/* Bottom: Event Timeline */}
      <div className="border-t bg-white p-4 flex-shrink-0">
        <BedEventTimeline
          events={bedEvents}
          onEventClick={(event) => console.log('Event clicked:', event)}
          showDate={true}
        />
      </div>

      {/* Admit Patient Dialog */}
      <Dialog open={admitDialogOpen} onOpenChange={setAdmitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Admit Patient to {selectedBed?.bedNumber}
            </DialogTitle>
            <DialogDescription>
              Enter patient details to admit to this bed. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Patient Name *</Label>
              <Input
                id="name"
                placeholder="Last Name, First Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mrn">MRN *</Label>
              <Input
                id="mrn"
                placeholder="Medical Record Number"
                value={newPatient.mrn}
                onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
              <Input
                id="diagnosis"
                placeholder="e.g., Pneumonia, CHF, etc."
                value={newPatient.diagnosis}
                onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
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
            <Button variant="outline" onClick={() => setAdmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdmitPatient}
              disabled={!newPatient.name || !newPatient.mrn || !newPatient.diagnosis}
            >
              <Plus className="h-4 w-4 mr-2" />
              Admit Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
