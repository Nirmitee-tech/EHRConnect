/**
 * WellVisitPanel Component
 * Pediatric specialty component for WellVisitPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WellVisitPanelProps {
  patientId: string;
  episodeId?: string;
}

export function WellVisitPanel({ patientId, episodeId }: WellVisitPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>WellVisitPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            WellVisitPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
