'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Loader2 } from 'lucide-react';
import { FHIROrganization } from '@/types/fhir';
import { CreateFacilityRequest, UpdateFacilityRequest } from '@/services/facility.service';
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

interface FacilityFormProps {
  facility?: FHIROrganization;
  isEditing?: boolean;
  onSubmit: (data: CreateFacilityRequest | UpdateFacilityRequest) => Promise<void>;
  onCancel: () => void;
}

export function FacilityForm({ facility, isEditing = false, onSubmit, onCancel }: FacilityFormProps) {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'clinic' as 'clinic' | 'hospital' | 'lab' | 'pharmacy',
    email: '',
    phone: '',
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
    if (facility && isEditing) {
      const address = facility.address?.[0];
      const email = facility.telecom?.find(t => t.system === 'email')?.value;
      const phone = facility.telecom?.find(t => t.system === 'phone')?.value;
      const type = facility.type?.[0]?.coding?.[0]?.code as 'clinic' | 'hospital' | 'lab' | 'pharmacy';

      setFormData({
        name: facility.name || '',
        type: type || 'clinic',
        email: email || '',
        phone: phone || '',
        address: {
          line: address?.line || [''],
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postalCode || '',
          country: address?.country || 'US'
        }
      });
    }
  }, [facility, isEditing]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Facility name is required';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        name: formData.name.trim(),
        type: formData.type,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.line[0] || formData.address.city || formData.address.state ? {
          line: formData.address.line.filter(l => l.trim()),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          postalCode: formData.address.postalCode.trim(),
          country: formData.address.country
        } : undefined,
        ...(isEditing && facility ? { id: facility.id! } : {})
      };

      await onSubmit(submitData as CreateFacilityRequest | UpdateFacilityRequest);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save facility. Please try again.' });
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
            {isEditing ? 'Edit Facility' : 'Add New Facility'}
          </h2>
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                  placeholder="e.g., Main Street Clinic"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Facility Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-destructive text-sm mt-1">{errors.type}</p>
                )}
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
                  placeholder="contact@facility.com (Optional)"
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
                  placeholder="(555) 123-4567 (Optional)"
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
                  placeholder="123 Main Street (Optional)"
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
                    placeholder="City (Optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="State (Optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="12345 (Optional)"
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Facility' : 'Create Facility'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
