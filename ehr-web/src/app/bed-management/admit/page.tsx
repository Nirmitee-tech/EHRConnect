'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Bed, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import * as bedManagementService from '@/services/bed-management';
import type { Ward, Bed as BedType, AdmitPatientRequest } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';

export default function AdmitPatientPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [availableBeds, setAvailableBeds] = useState<BedType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AdmitPatientRequest>>({
    patientId: '',
    admissionDate: new Date().toISOString().split('T')[0],
    admissionType: 'emergency',
    priority: 'routine',
    admissionReason: '',
    admissionDiagnosis: '',
    assignBedOnAdmit: false,
  });

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

  async function loadWards() {
    if (!orgId) return;
    try {
      const data = await bedManagementService.getWards(orgId, userId || undefined, {
        locationId: currentFacility?.id,
        active: true,
      });
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  }

  async function loadAvailableBeds(wardId: string) {
    if (!orgId) return;
    try {
      const beds = await bedManagementService.getAvailableBeds(
        orgId,
        userId || undefined,
        wardId
      );
      setAvailableBeds(beds);
    } catch (error) {
      console.error('Error loading beds:', error);
      setAvailableBeds([]);
    }
  }

  function handleWardChange(wardId: string) {
    setFormData({ ...formData, wardId });
    setAvailableBeds([]);
    if (wardId) {
      loadAvailableBeds(wardId);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;

    try {
      setLoading(true);

      const admissionData: AdmitPatientRequest = {
        patientId: formData.patientId!,
        locationId: currentFacility?.id || '',
        admissionDate: formData.admissionDate!,
        admissionType: formData.admissionType as any,
        priority: formData.priority as any,
        admissionReason: formData.admissionReason,
        admissionDiagnosis: formData.admissionDiagnosis,
        wardId: formData.wardId,
        bedId: formData.bedId,
        attendingDoctorId: formData.attendingDoctorId,
        assignBedOnAdmit: formData.assignBedOnAdmit,
      };

      await bedManagementService.admitPatient(orgId, userId || undefined, admissionData);

      alert('Patient admitted successfully!');
      router.push('/bed-management');
    } catch (error) {
      console.error('Error admitting patient:', error);
      alert('Failed to admit patient. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admit Patient</h1>
          <p className="text-muted-foreground">Register a new patient admission</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
              <CardDescription>
                Select or search for the patient to admit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="patientId">Patient ID / MRN *</Label>
                <Input
                  id="patientId"
                  required
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                  placeholder="Enter patient ID or MRN"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the patient's medical record number
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="attendingDoctorId">Attending Doctor</Label>
                <Input
                  id="attendingDoctorId"
                  value={formData.attendingDoctorId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, attendingDoctorId: e.target.value })
                  }
                  placeholder="Doctor ID (optional)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Admission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    required
                    value={formData.admissionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, admissionDate: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admissionType">Admission Type *</Label>
                  <Select
                    value={formData.admissionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, admissionType: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="elective">Elective</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="observation">Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="admissionReason">Reason for Admission</Label>
                <Textarea
                  id="admissionReason"
                  value={formData.admissionReason || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionReason: e.target.value })
                  }
                  placeholder="Brief reason for admission"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="admissionDiagnosis">Admission Diagnosis</Label>
                <Textarea
                  id="admissionDiagnosis"
                  value={formData.admissionDiagnosis || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionDiagnosis: e.target.value })
                  }
                  placeholder="Initial diagnosis"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bed Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Bed Assignment
              </CardTitle>
              <CardDescription>
                Optionally assign a bed during admission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assignBedOnAdmit"
                  checked={formData.assignBedOnAdmit}
                  onChange={(e) =>
                    setFormData({ ...formData, assignBedOnAdmit: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="assignBedOnAdmit" className="font-normal">
                  Assign bed now (can be done later)
                </Label>
              </div>

              {formData.assignBedOnAdmit && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="wardId">Select Ward</Label>
                    <Select
                      value={formData.wardId}
                      onValueChange={handleWardChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((ward) => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name} ({ward.wardType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.wardId && (
                    <div className="grid gap-2">
                      <Label htmlFor="bedId">Select Bed</Label>
                      {availableBeds.length === 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No available beds in this ward
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Select
                          value={formData.bedId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, bedId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a bed" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBeds.map((bed) => (
                              <SelectItem key={bed.id} value={bed.id}>
                                {bed.bedNumber} - {bed.bedType}
                                {bed.room && ` (Room ${bed.room.roomNumber})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Admitting...' : 'Admit Patient'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
