/**
 * HearingScreeningPanel Component
 * Pediatric specialty component for HearingScreeningPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HearingScreeningPanelProps {
  patientId: string;
  episodeId?: string;
}

export function HearingScreeningPanel({ patientId, episodeId }: HearingScreeningPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>HearingScreeningPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            HearingScreeningPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
