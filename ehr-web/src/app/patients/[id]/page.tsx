'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Building2,
  FileText,
  Loader2
} from 'lucide-react';
import { FHIRPatient } from '@/types/fhir';
import { patientService } from '@/services/patient.service';
import { useFacility } from '@/contexts/facility-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ViewPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { currentFacility } = useFacility();

  const [patient, setPatient] = useState<FHIRPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const patientData = await patientService.getPatientById(patientId);
      if (!patientData) {
        setError('Patient not found');
        return;
      }
      
      setPatient(patientData);
    } catch (err) {
      setError('Failed to load patient');
      console.error('Error loading patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/patients/${patientId}/edit`);
  };

  const handleDelete = async () => {
    if (!patient) return;

    const patientName = getPatientName(patient);
    if (!confirm(`Are you sure you want to delete patient "${patientName}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      await patientService.softDeletePatient(patientId, 'current-user-id');
      router.push('/patients');
    } catch (err) {
      alert('Failed to delete patient');
      console.error('Error deleting patient:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    router.push('/patients');
  };

  // Helper functions
  const getPatientName = (patient: FHIRPatient): string => {
    const name = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
    if (!name) return 'Unknown';

    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    
    return `${given} ${family}`.trim() || 'Unknown';
  };

  const getPatientAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getContactInfo = (patient: FHIRPatient) => {
    const email = patient.telecom?.find(t => t.system === 'email')?.value;
    const phone = patient.telecom?.find(t => t.system === 'phone')?.value;
    return { email, phone };
  };

  const getAddress = (patient: FHIRPatient) => {
    return patient.address?.[0];
  };

  const getMRN = (patient: FHIRPatient): string | undefined => {
    return patient.identifier?.find(
      id => id.type?.coding?.some(c => c.code === 'MR')
    )?.value;
  };

  const getFacilityId = (patient: FHIRPatient): string => {
    const ref = patient.managingOrganization?.reference;
    if (ref?.startsWith('Organization/')) {
      return ref.substring('Organization/'.length);
    }
    return patient.managingOrganization?.reference || '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading patient...</p>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'Patient not found'}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </Card>
      </div>
    );
  }

  const contactInfo = getContactInfo(patient);
  const address = getAddress(patient);
  const mrn = getMRN(patient);
  const age = patient.birthDate ? getPatientAge(patient.birthDate) : null;
  const facilityId = getFacilityId(patient);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{getPatientName(patient)}</h1>
            <p className="text-muted-foreground">
              Patient Details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleEdit} disabled={deleting}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Patient
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge variant={patient.active !== false ? 'default' : 'secondary'} className="text-sm">
          {patient.active !== false ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-lg">{getPatientName(patient)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{formatDate(patient.birthDate || '')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p>{age !== null ? `${age} years` : 'Unknown'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="capitalize">{patient.gender || 'Unknown'}</p>
            </div>

            {mrn && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Medical Record Number</label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="font-mono">{mrn}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Contact Information</h2>
          </div>

          <div className="space-y-4">
            {contactInfo.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-primary hover:underline"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            )}

            {contactInfo.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="text-primary hover:underline"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
            )}

            {!contactInfo.email && !contactInfo.phone && (
              <p className="text-muted-foreground text-sm">No contact information available</p>
            )}
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Address</h2>
          </div>

          {address ? (
            <div className="space-y-2">
              {address.line && address.line.length > 0 && (
                <p>{address.line.join(', ')}</p>
              )}
              <div className="flex gap-2">
                {address.city && <span>{address.city}</span>}
                {address.state && <span>{address.state}</span>}
                {address.postalCode && <span>{address.postalCode}</span>}
              </div>
              {address.country && address.country !== 'US' && (
                <p>{address.country}</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No address information available</p>
          )}
        </Card>

        {/* Facility Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Facility</h2>
          </div>

          <div className="space-y-2">
            <p>{currentFacility?.name || 'Unknown Facility'}</p>
            <p className="text-sm text-muted-foreground">
              Facility ID: {facilityId}
            </p>
          </div>
        </Card>
      </div>

      {/* Metadata */}
      <Card className="p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Patient ID:</span> {patient.id}
          </div>
          {patient.meta?.lastUpdated && (
            <div>
              <span className="font-medium">Last Updated:</span> {formatDate(patient.meta.lastUpdated)}
            </div>
          )}
          {patient.meta?.versionId && (
            <div>
              <span className="font-medium">Version:</span> {patient.meta.versionId}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
