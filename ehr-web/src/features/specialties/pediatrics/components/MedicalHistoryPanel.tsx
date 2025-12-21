/**
 * MedicalHistoryPanel Component
 * Pediatric specialty component for MedicalHistoryPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MedicalHistoryPanelProps {
  patientId: string;
  episodeId?: string;
}

export function MedicalHistoryPanel({ patientId, episodeId }: MedicalHistoryPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>MedicalHistoryPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            MedicalHistoryPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
