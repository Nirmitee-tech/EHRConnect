'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FacilityForm } from '@/components/forms/facility-form';
import { facilityService, CreateFacilityRequest, UpdateFacilityRequest } from '@/services/facility.service';
import { useFacility } from '@/contexts/facility-context';

export default function NewFacilityPage() {
  const router = useRouter();
  const { refreshFacilities } = useFacility();

  const handleSubmit = async (data: CreateFacilityRequest | UpdateFacilityRequest) => {
    try {
      const facility = await facilityService.createFacility(data as CreateFacilityRequest, 'current-user-id');
      await refreshFacilities(); // Refresh the facility list in context
      // Redirect to the facilities list
      router.push('/admin/facilities');
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleCancel = () => {
    router.push('/admin/facilities');
  };

  return (
    <FacilityForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
