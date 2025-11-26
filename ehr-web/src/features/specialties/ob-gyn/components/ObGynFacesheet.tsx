'use client';

import React from 'react';
import { PrenatalFacesheetTab } from '@/features/patient-detail/components/tabs/prenatal-facesheet-tab';

interface ObGynFacesheetProps {
  patientId: string;
}

export function ObGynFacesheet({ patientId }: ObGynFacesheetProps) {
  // Use the comprehensive prenatal facesheet
  return <PrenatalFacesheetTab patientId={patientId} />;
}
