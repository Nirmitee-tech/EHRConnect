'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Loader2 } from 'lucide-react';
import { FHIRPatient } from '@/types/fhir';
import { CreatePatientRequest, UpdatePatientRequest } from '@/services/patient.service';
import { useFacility } from '@/contexts/facility-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PatientFormProps {
  patient?: FHIRPatient;
  isEditing?: boolean;
  onSubmit: (data: CreatePatientRequest | UpdatePatientRequest) => Promise<void>;
  onCancel: () => void;
}

export function PatientForm({ patient, isEditing = false, onSubmit, onCancel }: PatientFormProps) {
  const router = useRouter();
  const { currentFacility } = useFacility();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'unknown' as 'male' | 'female' | 'other' | 'unknown',
    email: '',
    phone: '',
    mrn: '',
    address: {
      line: [''],
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data for editing
  useEffect(() => {
    if (patient && isEditing) {
      const name = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
      const address = patient.address?.[0];
      const email = patient.telecom?.find(t => t.system === 'email')?.value;
      const phone = patient.telecom?.find(t => t.system === 'phone')?.value;
      const mrn = patient.identifier?.find(
        id => id.type?.coding?.some(c => c.code === 'MR')
      )?.value;

      setFormData({
        firstName: name?.given?.[0] || '',
        lastName: name?.family || '',
        dateOfBirth: patient.birthDate || '',
        gender: patient.gender || 'unknown',
        email: email || '',
        phone: phone || '',
        mrn: mrn || '',
        address: {
          line: address?.line || [''],
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postalCode || '',
          country: address?.country || 'US'
        }
      });
    }
  }, [patient, isEditing]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!currentFacility) {
      newErrors.facility = 'No facility selected. Please select a facility to continue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentFacility) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        mrn: formData.mrn.trim() || undefined,
        facilityId: currentFacility.id,
        address: formData.address.line[0] || formData.address.city || formData.address.state ? {
          line: formData.address.line.filter(l => l.trim()),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          postalCode: formData.address.postalCode.trim(),
          country: formData.address.country
        } : undefined,
        ...(isEditing && patient ? { id: patient.id! } : {})
      };

      await onSubmit(submitData as CreatePatientRequest | UpdatePatientRequest);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save patient. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    if (field === 'line') {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          line: [value]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    }

    // Clear address errors
    if (errors.address) {
      setErrors(prev => ({
        ...prev,
        address: ''
      }));
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!currentFacility && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  No facilities available
                </p>
                <p className="text-blue-700 text-sm mb-3">
                  Before you can create patients, you need to set up at least one healthcare facility. 
                  Facilities represent different locations where you provide care (clinics, hospitals, labs, etc.).
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => window.open('/admin/facilities/new', '_blank')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create First Facility
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/admin/facilities', '_blank')}
                  >
                    Manage Facilities
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-destructive text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'border-destructive' : ''}
                />
                {errors.dateOfBirth && (
                  <p className="text-destructive text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-destructive text-sm mt-1">{errors.gender}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mrn">Medical Record Number</Label>
                <Input
                  id="mrn"
                  type="text"
                  value={formData.mrn}
                  onChange={(e) => handleInputChange('mrn', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  placeholder="Optional"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="addressLine">Street Address</Label>
                <Input
                  id="addressLine"
                  type="text"
                  value={formData.address.line[0]}
                  onChange={(e) => handleAddressChange('line', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Errors */}
          {errors.submit && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-destructive text-sm">{errors.submit}</p>
            </div>
          )}

          {errors.facility && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-destructive text-sm">{errors.facility}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !currentFacility}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
