'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Bed as BedIcon,
  AlertCircle,
  Search,
  Plus,
  Check,
  Building2,
  X,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import * as bedManagementService from '@/services/bed-management';
import type { Ward, Bed as BedType, AdmitPatientRequest } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';
import { medplum } from '@/lib/medplum';

interface Patient {
  id: string;
  name: string;
  mrn?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

export default function AdmitPatientPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Patient search & selection
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDrawerOpen, setIsPatientDrawerOpen] = useState(false);

  // Ward & Bed selection
  const [wards, setWards] = useState<Ward[]>([]);
  const [filteredWards, setFilteredWards] = useState<Ward[]>([]);
  const [wardSearchQuery, setWardSearchQuery] = useState('');
  const [wardTypeFilter, setWardTypeFilter] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const [availableBeds, setAvailableBeds] = useState<BedType[]>([]);
  const [bedSearchQuery, setBedSearchQuery] = useState('');
  const [selectedBed, setSelectedBed] = useState<BedType | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    admissionDate: new Date().toISOString().split('T')[0],
    admissionTime: new Date().toTimeString().slice(0, 5),
    admissionType: 'emergency' as const,
    priority: 'routine' as const,
    admissionReason: '',
    chiefComplaint: '',
    primaryDiagnosis: '',
    attendingDoctorId: '',
    specialRequirements: '',
  });

  // New patient form
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth from session
  useEffect(() => {
    if (!session) return;
    if (session.org_id) {
      setOrgId(session.org_id);
      setUserId((session.user as any)?.id || session.user?.email || null);
    }
  }, [session]);

  // Load wards
  useEffect(() => {
    if (orgId) loadWards();
  }, [orgId, userId]);

  // Filter wards based on search and type
  useEffect(() => {
    let filtered = wards;

    // Filter by ward type
    if (wardTypeFilter !== 'all') {
      filtered = filtered.filter((ward) => ward.wardType === wardTypeFilter);
    }

    // Filter by search query
    if (wardSearchQuery) {
      const query = wardSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (ward) =>
          ward.name.toLowerCase().includes(query) ||
          ward.code.toLowerCase().includes(query)
      );
    }

    setFilteredWards(filtered);
  }, [wards, wardSearchQuery, wardTypeFilter]);

  // Filter beds based on search
  const filteredBeds = availableBeds.filter((bed) => {
    if (!bedSearchQuery) return true;
    const query = bedSearchQuery.toLowerCase();
    return (
      bed.bedNumber.toLowerCase().includes(query) ||
      bed.bedType.toLowerCase().includes(query)
    );
  });

  async function loadWards() {
    if (!orgId) return;
    try {
      const data = await bedManagementService.getWards(orgId, userId || undefined, {});
      setWards(data);
      setFilteredWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  }

  async function searchPatients(query: string) {
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    try {
      const bundle = await medplum.searchResources('Patient', {
        name: query,
        _count: 10,
        _sort: '-_lastUpdated',
      });

      const patientList: Patient[] = bundle.map((p: any) => {
        const mrn = p.identifier?.find((id: any) =>
          id.type?.coding?.some((c: any) => c.code === 'MR')
        )?.value;

        const phone = p.telecom?.find((t: any) => t.system === 'phone')?.value;

        return {
          id: p.id!,
          name: p.name?.[0]
            ? `${p.name[0].given?.join(' ')} ${p.name[0].family}`
            : 'Unknown',
          mrn,
          dateOfBirth: p.birthDate,
          gender: p.gender,
          phone,
        };
      });

      setPatients(patientList);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (patientSearch) {
        searchPatients(patientSearch);
      } else {
        setPatients([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [patientSearch]);

  function selectPatient(patient: Patient) {
    setSelectedPatient(patient);
    setPatients([]);
    setPatientSearch('');
  }

  async function loadAvailableBeds(wardId: string) {
    if (!orgId) return;
    try {
      const allBeds = await bedManagementService.getBeds(orgId, userId || undefined, {
        wardId,
      });
      // Filter for available beds
      const available = allBeds.filter((bed) => bed.status === 'available' && bed.active);
      setAvailableBeds(available);
      setBedSearchQuery(''); // Reset bed search when changing ward
    } catch (error) {
      console.error('Error loading beds:', error);
      setAvailableBeds([]);
    }
  }

  function selectWard(ward: Ward) {
    setSelectedWard(ward);
    setSelectedBed(null);
    loadAvailableBeds(ward.id);
  }

  async function handleCreatePatient() {
    try {
      setLoading(true);

      const nameParts = newPatientData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const patientResource: any = {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'official',
            family: lastName || firstName,
            given: lastName ? [firstName] : [],
          },
        ],
        gender: newPatientData.gender,
        birthDate: newPatientData.dateOfBirth,
        telecom: newPatientData.phone
          ? [
              {
                system: 'phone',
                value: newPatientData.phone,
                use: 'home',
              },
            ]
          : undefined,
        managingOrganization: currentFacility?.id
          ? {
              reference: `Organization/${currentFacility.id}`,
            }
          : undefined,
      };

      const createdPatient = await medplum.createResource(patientResource);

      const newPatient: Patient = {
        id: createdPatient.id!,
        name: newPatientData.name,
        dateOfBirth: newPatientData.dateOfBirth,
        gender: newPatientData.gender,
        phone: newPatientData.phone,
      };

      selectPatient(newPatient);
      setIsPatientDrawerOpen(false);
      setNewPatientData({ name: '', dateOfBirth: '', gender: 'male', phone: '' });
    } catch (error) {
      console.error('Error creating patient:', error);
      setError('Failed to create patient');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdmit() {
    if (!orgId || !selectedPatient) return;

    try {
      setLoading(true);
      setError(null);

      const locationId = selectedWard?.locationId || currentFacility?.id || '';

      const admitRequest: Partial<AdmitPatientRequest> = {
        patientId: selectedPatient.id,
        locationId: locationId,
        admissionDate: `${formData.admissionDate}T${formData.admissionTime}`,
        admissionType: formData.admissionType,
        admissionReason: formData.admissionReason,
        chiefComplaint: formData.chiefComplaint,
        primaryDiagnosis: formData.primaryDiagnosis,
        priority: formData.priority,
        specialRequirements: formData.specialRequirements,
      };

      const result = await bedManagementService.admitPatient(
        orgId,
        userId || undefined,
        admitRequest as AdmitPatientRequest
      );

      // Assign bed if selected
      if (selectedBed && result.id) {
        await bedManagementService.assignBed(orgId, userId || undefined, {
          hospitalizationId: result.id,
          bedId: selectedBed.id,
        });
      }

      // Success! Redirect to bed management
      router.push('/bed-management');
    } catch (err: any) {
      console.error('Error admitting patient:', err);
      setError(err.message || 'Failed to admit patient');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admit Patient</h1>
              <p className="text-muted-foreground">Register a new patient admission</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPatientDrawerOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedPatient ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search by name, MRN, or phone number..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="pl-10"
                    />
                    {patients.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 border rounded-lg bg-white shadow-lg divide-y max-h-60 overflow-y-auto">
                        {patients.map((patient) => (
                          <div
                            key={patient.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => selectPatient(patient)}
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              MRN: {patient.mrn} • {patient.gender} • DOB: {patient.dateOfBirth}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start justify-between p-4 border rounded-lg bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{selectedPatient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          MRN: {selectedPatient.mrn} • {selectedPatient.gender} • DOB:{' '}
                          {selectedPatient.dateOfBirth}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admission Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Admission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="admissionDate">Admission Date *</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="admissionTime">Admission Time *</Label>
                    <Input
                      id="admissionTime"
                      type="time"
                      value={formData.admissionTime}
                      onChange={(e) => setFormData({ ...formData, admissionTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="admissionType">Admission Type *</Label>
                    <Select
                      value={formData.admissionType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, admissionType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="elective">Elective</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="newborn">Newborn</SelectItem>
                        <SelectItem value="transfer_in">Transfer In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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

                <div className="grid gap-2">
                  <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                  <Textarea
                    id="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                    placeholder="Primary reason for admission"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admissionReason">Admission Reason *</Label>
                  <Textarea
                    id="admissionReason"
                    value={formData.admissionReason}
                    onChange={(e) => setFormData({ ...formData, admissionReason: e.target.value })}
                    placeholder="Detailed reason for admission"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="primaryDiagnosis">Primary Diagnosis</Label>
                  <Input
                    id="primaryDiagnosis"
                    value={formData.primaryDiagnosis}
                    onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })}
                    placeholder="Initial diagnosis or working diagnosis"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialRequirements: e.target.value,
                      })
                    }
                    placeholder="Isolation, oxygen, monitoring, etc."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ward & Bed Selection */}
          <div className="space-y-6">
            {/* Ward Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Select Ward *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ward Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search wards..."
                      value={wardSearchQuery}
                      onChange={(e) => setWardSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Select value={wardTypeFilter} onValueChange={setWardTypeFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="pediatric">Pediatric</SelectItem>
                      <SelectItem value="maternity">Maternity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Ward Display */}
                {selectedWard && (
                  <div className="p-3 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{selectedWard.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedWard.code}
                        </div>
                        <Badge variant="outline" className="text-xs mt-2">
                          {selectedWard.wardType}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedWard(null);
                          setSelectedBed(null);
                          setAvailableBeds([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Ward List - Scrollable */}
                {!selectedWard && (
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filteredWards.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No wards found
                      </div>
                    ) : (
                      filteredWards.map((ward) => (
                        <div
                          key={ward.id}
                          className="p-3 border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                          onClick={() => selectWard(ward)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{ward.name}</div>
                              <div className="text-xs text-muted-foreground">{ward.code}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {ward.wardType}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {ward.availableBeds || 0} available
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bed Selection Card - Only show when ward is selected */}
            {selectedWard && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BedIcon className="h-5 w-5" />
                    Select Bed (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bed Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search bed number..."
                      value={bedSearchQuery}
                      onChange={(e) => setBedSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>

                  {/* Bed List - Scrollable, Compact */}
                  {availableBeds.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No available beds in this ward
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredBeds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedBed?.id === bed.id
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedBed(bed)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <BedIcon
                                className={`h-5 w-5 ${
                                  selectedBed?.id === bed.id ? 'text-primary' : 'text-green-600'
                                }`}
                              />
                              <div>
                                <div className="font-semibold">{bed.bedNumber}</div>
                                <div className="text-xs text-muted-foreground">{bed.bedType}</div>
                              </div>
                            </div>
                            {selectedBed?.id === bed.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleAdmit}
                disabled={
                  loading ||
                  !selectedPatient ||
                  !selectedWard ||
                  !formData.chiefComplaint ||
                  !formData.admissionReason
                }
                className="w-full gap-2 text-white"
              >
                {loading ? 'Admitting...' : selectedBed ? 'Admit with Bed' : 'Admit Patient'}
                <Check className="h-5 w-5" />
              </Button>
              {selectedWard && (
                <div className="text-center text-sm text-muted-foreground">
                  Ward: {selectedWard.name}
                  {selectedBed && ` - Bed ${selectedBed.bedNumber}`}
                </div>
              )}
              {!selectedWard && (
                <div className="text-center text-sm text-orange-600">
                  Please select a ward to continue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Creation Drawer */}
      <Sheet open={isPatientDrawerOpen} onOpenChange={setIsPatientDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create New Patient</SheetTitle>
            <SheetDescription>
              Add a new patient to the system. Fill in the required information below.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="patientName">Full Name *</Label>
              <Input
                id="patientName"
                placeholder="John Doe"
                value={newPatientData.name}
                onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={newPatientData.dateOfBirth}
                onChange={(e) =>
                  setNewPatientData({ ...newPatientData, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={newPatientData.gender}
                onValueChange={(value) => setNewPatientData({ ...newPatientData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1-555-0000"
                value={newPatientData.phone}
                onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsPatientDrawerOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePatient}
              disabled={!newPatientData.name || !newPatientData.dateOfBirth}
              className="flex-1 text-white"
            >
              Create Patient
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
