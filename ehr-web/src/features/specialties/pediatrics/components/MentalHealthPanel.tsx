/**
 * MentalHealthPanel Component
 * Pediatric specialty component for MentalHealthPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MentalHealthPanelProps {
  patientId: string;
  episodeId?: string;
}

export function MentalHealthPanel({ patientId, episodeId }: MentalHealthPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>MentalHealthPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            MentalHealthPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
