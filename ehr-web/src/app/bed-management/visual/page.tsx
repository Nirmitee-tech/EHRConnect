'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, RefreshCw, Filter, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as bedManagementService from '@/services/bed-management';
import type { Ward, Bed, Room, Hospitalization } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';
import { RoomBedVisualization } from '@/components/bed-management/room-bed-visualization';
import { OperationsPanel, Operation } from '@/components/bed-management/operations-panel';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function VisualBedManagementPage() {
  const { data: session } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('all');
  const [beds, setBeds] = useState<Bed[]>([]);
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const createTodayAt = (hours: number, minutes: number): Date => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Mock operations data - in production, this would come from your API
  const [operations] = useState<Operation[]>([
    {
      id: '1',
      dateTime: createTodayAt(8, 0),
      patientName: 'Smith, John',
      patientMrn: 'MRN-001234',
      procedureName: 'Appendectomy',
      procedureCode: 'PROC-001',
      surgeon: 'Wilson',
      department: 'General Surgery',
      operatingRoom: 'OR-1',
      estimatedDuration: 90,
      priority: 'urgent',
      status: 'scheduled',
      requiresBed: true,
      assignedWard: 'General Ward',
      assignedBed: 'B-101',
    },
    {
      id: '2',
      dateTime: createTodayAt(10, 30),
      patientName: 'Johnson, Sarah',
      patientMrn: 'MRN-002345',
      procedureName: 'Hip Replacement',
      procedureCode: 'PROC-002',
      surgeon: 'Anderson',
      department: 'Orthopedics',
      operatingRoom: 'OR-2',
      estimatedDuration: 180,
      priority: 'routine',
      status: 'scheduled',
      requiresIcu: true,
      requiresBed: true,
    },
    {
      id: '3',
      dateTime: createTodayAt(13, 0),
      patientName: 'Brown, Michael',
      patientMrn: 'MRN-003456',
      procedureName: 'Cardiac Catheterization',
      procedureCode: 'PROC-003',
      surgeon: 'Martinez',
      department: 'Cardiology',
      operatingRoom: 'Cath Lab',
      estimatedDuration: 60,
      priority: 'emergency',
      status: 'in_progress',
      requiresIcu: true,
      requiresBed: true,
      notes: 'Patient requires ICU bed post-procedure',
    },
    {
      id: '4',
      dateTime: createTodayAt(15, 30),
      patientName: 'Davis, Emily',
      patientMrn: 'MRN-004567',
      procedureName: 'Laparoscopic Cholecystectomy',
      procedureCode: 'PROC-004',
      surgeon: 'Thompson',
      department: 'General Surgery',
      operatingRoom: 'OR-3',
      estimatedDuration: 120,
      priority: 'routine',
      status: 'scheduled',
      requiresBed: true,
      assignedWard: 'Surgical Ward',
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
  }, [orgId, userId, selectedWardId]);

  async function loadData() {
    if (!orgId) return;
    try {
      setLoading(true);
      const filters: any = {
        locationId: currentFacility?.id,
        active: true,
      };
      if (selectedWardId !== 'all') {
        filters.wardId = selectedWardId;
      }

      const [wardsData, bedsData, hospitalizationsData] = await Promise.all([
        bedManagementService.getWards(orgId, userId || undefined, {
          locationId: currentFacility?.id,
          active: true,
        }),
        bedManagementService.getBeds(orgId, userId || undefined, filters),
        bedManagementService.getHospitalizations(orgId, userId || undefined, {
          locationId: currentFacility?.id,
          status: ['admitted', 'pre_admit'],
        }),
      ]);

      setWards(wardsData);
      setBeds(bedsData);
      setHospitalizations(hospitalizationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleBedClick = (bed: Bed) => {
    console.log('Bed clicked:', bed);
    // TODO: Open bed details modal or drawer
  };

  const handlePatientClick = (hospitalization: Hospitalization) => {
    console.log('Patient clicked:', hospitalization);
    // TODO: Open patient details modal or drawer
  };

  const handleOperationClick = (operation: Operation) => {
    console.log('Operation clicked:', operation);
    // TODO: Open operation details modal or drawer
  };

  const goToPreviousEvent = () => {
    // TODO: Navigate to previous time slot
    console.log('Previous event');
  };

  const goToNextEvent = () => {
    // TODO: Navigate to next time slot
    console.log('Next event');
  };

  const jumpToNow = () => {
    setCurrentTime(new Date());
  };

  if (loading && beds.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bed management...</p>
        </div>
      </div>
    );
  }

  // Split wards into two groups for side-by-side display (similar to RWTH system)
  const wardGroups = selectedWardId === 'all' ? wards : wards.filter(w => w.id === selectedWardId);
  const midPoint = Math.ceil(wardGroups.length / 2);
  const leftWards = wardGroups.slice(0, midPoint);
  const rightWards = wardGroups.slice(midPoint);

  const getBedsForWards = (wardsList: Ward[]) => {
    if (selectedWardId === 'all' && wardsList.length > 0) {
      return beds.filter(bed => wardsList.some(w => w.id === bed.wardId));
    }
    return beds;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Visual Bed Management</h1>
              <p className="text-sm text-muted-foreground">
                Real-time bed occupancy and operations overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Display and Navigation */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">
                {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <Button size="sm" variant="outline" onClick={goToPreviousEvent}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={jumpToNow}>
              Now
            </Button>
            <Button size="sm" variant="outline" onClick={goToNextEvent}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Ward:</span>
          </div>
          <Tabs value={selectedWardId} onValueChange={setSelectedWardId} className="w-full">
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">All Wards</TabsTrigger>
              {wards.slice(0, 6).map((ward) => (
                <TabsTrigger key={ward.id} value={ward.id} className="text-xs">
                  {ward.code || ward.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Ward Section */}
        <div className="col-span-12 lg:col-span-4 overflow-y-auto">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{leftWards.map(w => w.code || w.name).join(', ') || 'Ward 1'}</span>
                <Badge variant="outline">
                  {getBedsForWards(leftWards).filter(b => b.status === 'occupied').length}/
                  {getBedsForWards(leftWards).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoomBedVisualization
                beds={getBedsForWards(leftWards)}
                hospitalizations={hospitalizations}
                onBedClick={handleBedClick}
                onPatientClick={handlePatientClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Center/Right Ward Section */}
        <div className="col-span-12 lg:col-span-4 overflow-y-auto">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{rightWards.map(w => w.code || w.name).join(', ') || 'Ward 2'}</span>
                <Badge variant="outline">
                  {getBedsForWards(rightWards).filter(b => b.status === 'occupied').length}/
                  {getBedsForWards(rightWards).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoomBedVisualization
                beds={getBedsForWards(rightWards)}
                hospitalizations={hospitalizations}
                onBedClick={handleBedClick}
                onPatientClick={handlePatientClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Operations and Patients */}
        <div className="col-span-12 lg:col-span-4 space-y-4 overflow-y-auto">
          {/* Operations Panel */}
          <OperationsPanel
            operations={operations}
            onOperationClick={handleOperationClick}
            title="Scheduled Operations"
          />

          {/* Current Patients Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Inpatients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hospitalizations.slice(0, 5).map((hosp) => (
                  <div
                    key={hosp.id}
                    className="p-2 rounded border bg-white hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handlePatientClick(hosp)}
                  >
                    <div className="font-semibold text-sm">{hosp.patientName}</div>
                    <div className="text-xs text-muted-foreground">
                      {hosp.currentBed?.bedNumber || 'No bed'} • {hosp.currentWard?.name}
                    </div>
                  </div>
                ))}
                {hospitalizations.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All ({hospitalizations.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
