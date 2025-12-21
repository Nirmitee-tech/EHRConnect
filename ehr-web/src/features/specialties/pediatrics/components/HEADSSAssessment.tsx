/**
 * HEADSSAssessment Component
 * Pediatric specialty component for HEADSSAssessment
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HEADSSAssessmentProps {
  patientId: string;
  episodeId?: string;
}

export function HEADSSAssessment({ patientId, episodeId }: HEADSSAssessmentProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>HEADSSAssessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            HEADSSAssessment content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
