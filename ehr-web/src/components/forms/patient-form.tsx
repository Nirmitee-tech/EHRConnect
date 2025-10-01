'use client';

import { Camera, Loader2, Sparkles, User, Mail, MapPin, IdCard, Search } from 'lucide-react';
import { FHIRPatient, PatientSummary } from '@/types/fhir';
import { CreatePatientRequest, UpdatePatientRequest } from '@/services/patient.service';
import { useFacility } from '@/contexts/facility-context';
import { usePatientForm } from '@/hooks/use-patient-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef, useState, useEffect } from 'react';
import { patientService } from '@/services/patient.service';

interface PatientFormProps {
  patient?: FHIRPatient;
  isEditing?: boolean;
  onSubmit: (data: CreatePatientRequest | UpdatePatientRequest, isUpdate?: boolean, patientId?: string) => Promise<void>;
  onCancel: () => void;
}

const NoFacilityNotice = () => (
  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-blue-900 text-xs font-bold mb-1">No facilities available</p>
        <p className="text-blue-700 text-xs mb-2">
          Before you can create patients, you need to set up at least one healthcare facility.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => window.open('/admin/facilities/new', '_blank')}
            className="bg-primary hover:bg-primary/90"
          >
            Create First Facility
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open('/admin/facilities', '_blank')}
            className="border-blue-200 hover:bg-blue-50"
          >
            Manage Facilities
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const FormSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
      <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className="text-sm font-bold text-gray-900">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const ErrorMessage = ({ error }: { error?: string }) => 
  error ? (
    <p className="text-red-600 text-xs mt-0.5 flex items-center gap-1 font-medium">
      <span className="w-1 h-1 bg-red-600 rounded-full" />
      {error}
    </p>
  ) : null;

export function PatientForm({ patient, isEditing = false, onSubmit, onCancel }: PatientFormProps) {
  const { currentFacility } = useFacility();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
  
  const {
    formData,
    errors,
    loading,
    setLoading,
    setErrors,
    updateField,
    updateAddress,
    validate,
    prepareSubmitData
  } = usePatientForm(patient, currentFacility?.id);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        updateField('photo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: false
      });
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
      // Set video source after state update
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoPreview(imageData);
        updateField('photo', imageData);
        stopCamera();
      }
    }
  };

  // Search patients
  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await patientService.searchPatients({ name: searchQuery });
        setSearchResults(results.patients);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectPatient = (selectedPatient: PatientSummary) => {
    // Populate form with selected patient data
    updateField('firstName', selectedPatient.name);
    
    if (selectedPatient.gender && ['male', 'female', 'other', 'unknown'].includes(selectedPatient.gender)) {
      updateField('gender', selectedPatient.gender as 'male' | 'female' | 'other' | 'unknown');
    }
    
    if (selectedPatient.dateOfBirth) {
      updateField('dateOfBirth', selectedPatient.dateOfBirth);
    }
    
    if (selectedPatient.phone) {
      updateField('phone', selectedPatient.phone);
    }
    
    if (selectedPatient.email) {
      updateField('email', selectedPatient.email);
    }
    
    // Mark as updating existing patient
    setSelectedPatientId(selectedPatient.id);
    setIsUpdatingExisting(true);
    
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !currentFacility) return;

    setLoading(true);
    setErrors({});

    try {
      const submitData = prepareSubmitData();
      
      // Check if we're updating an existing patient from search
      if (isUpdatingExisting && selectedPatientId) {
        await onSubmit({
          ...submitData,
          id: selectedPatientId
        } as UpdatePatientRequest, true, selectedPatientId);
      } else if (isEditing && patient) {
        await onSubmit({
          ...submitData,
          id: patient.id!
        } as UpdatePatientRequest, true, patient.id);
      } else {
        // Creating new patient
        await onSubmit(submitData as CreatePatientRequest, false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save patient. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!currentFacility && <NoFacilityNotice />}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Search Bar for Existing Patient */}
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for existing patient"
              className="w-full h-9 pl-10 pr-3 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              autoComplete="off"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map((result) => {
                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelectPatient(result)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                        <p className="text-xs text-gray-500">
                          {result.age && `${result.age}y, `}{result.gender || 'Unknown'} {result.phone && `• ${result.phone}`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Personal Details Section with Photo */}
        <FormSection title="Personal Details" icon={User}>
          {/* Photo Section - Centered */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {isCameraOn ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      REC
                    </div>
                  </div>
                ) : photoPreview || formData.photo ? (
                  <img 
                    src={photoPreview || formData.photo} 
                    alt="Patient" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera Button Overlay */}
              <button
                type="button"
                onClick={isCameraOn ? capturePhoto : startCamera}
                className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 shadow-sm"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
              
              {isCameraOn && (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
                >
                  Stop
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <Label htmlFor="prefix" className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                <Select 
                  value={formData.prefix} 
                  onValueChange={(value) => updateField('prefix', value)}
                >
                  <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={`col-span-3 h-9 text-sm rounded-lg border transition-all ${
                    errors.firstName 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-primary'
                  }`}
                  placeholder="Full name"
                />
              </div>
              <ErrorMessage error={errors.firstName} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Gender
              </Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => updateField('gender', value as typeof formData.gender)}
              >
                <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                Date of birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className={`h-9 text-sm rounded-lg border transition-all ${
                  errors.dateOfBirth 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-primary'
                }`}
                placeholder="dd/mm/yyyy"
              />
              <ErrorMessage error={errors.dateOfBirth} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="relation" className="text-sm font-medium text-gray-700">
                Relation
              </Label>
              <Select 
                value={formData.relation} 
                onValueChange={(value) => updateField('relation', value)}
              >
                <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S/o">S/o</SelectItem>
                  <SelectItem value="D/o">D/o</SelectItem>
                  <SelectItem value="W/o">W/o</SelectItem>
                  <SelectItem value="H/o">H/o</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
                Hospital Id
              </Label>
              <Input
                id="hospitalId"
                value={formData.hospitalId}
                onChange={(e) => updateField('hospitalId', e.target.value)}
                className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
                placeholder="Hospital ID"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="healthId" className="text-sm font-medium text-gray-700">
                Health Id
              </Label>
              <Input
                id="healthId"
                value={formData.healthId}
                onChange={(e) => updateField('healthId', e.target.value)}
                className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
                placeholder="Health ID"
              />
            </div>
          </div>
        </FormSection>

        {/* Contact Details Section */}
        <FormSection title="Contact Details" icon={Mail}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
                placeholder="Phone number"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`h-9 text-sm rounded-lg border transition-all ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-primary'
                }`}
                placeholder="Email"
              />
              <ErrorMessage error={errors.email} />
            </div>
          </div>

          <div className="space-y-1 mb-3">
            <Label htmlFor="addressLine" className="text-sm font-medium text-gray-700">
              Address
            </Label>
            <Input
              id="addressLine"
              value={formData.address.line[0]}
              onChange={(e) => updateAddress('line', e.target.value)}
              className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
              placeholder="Address"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
              Pincode
            </Label>
            <Input
              id="postalCode"
              value={formData.address.postalCode}
              onChange={(e) => updateAddress('postalCode', e.target.value)}
              className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
              placeholder="Pincode"
            />
          </div>
        </FormSection>

        {(errors.submit || errors.facility) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{errors.submit || errors.facility}</p>
          </div>
        )}

      </form>
      
      {/* Sticky Footer Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-4">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={loading}
            className="flex-1 h-10 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Discard
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !currentFacility}
            className="flex-1 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 text-sm font-medium"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUpdatingExisting || isEditing ? 'Update' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
