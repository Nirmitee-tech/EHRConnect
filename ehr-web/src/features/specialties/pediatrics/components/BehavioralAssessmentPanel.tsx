/**
 * BehavioralAssessmentPanel Component
 * Pediatric specialty component for BehavioralAssessmentPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BehavioralAssessmentPanelProps {
  patientId: string;
  episodeId?: string;
}

export function BehavioralAssessmentPanel({ patientId, episodeId }: BehavioralAssessmentPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>BehavioralAssessmentPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            BehavioralAssessmentPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
