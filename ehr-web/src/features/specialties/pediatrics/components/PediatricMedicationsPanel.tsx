/**
 * PediatricMedicationsPanel Component
 * Pediatric specialty component for PediatricMedicationsPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PediatricMedicationsPanelProps {
  patientId: string;
  episodeId?: string;
}

export function PediatricMedicationsPanel({ patientId, episodeId }: PediatricMedicationsPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>PediatricMedicationsPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            PediatricMedicationsPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
