/**
 * CareCoordinationPanel Component
 * Pediatric specialty component for CareCoordinationPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CareCoordinationPanelProps {
  patientId: string;
  episodeId?: string;
}

export function CareCoordinationPanel({ patientId, episodeId }: CareCoordinationPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>CareCoordinationPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            CareCoordinationPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
