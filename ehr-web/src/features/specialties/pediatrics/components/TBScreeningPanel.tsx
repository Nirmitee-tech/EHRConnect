/**
 * TBScreeningPanel Component
 * Pediatric specialty component for TBScreeningPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TBScreeningPanelProps {
  patientId: string;
  episodeId?: string;
}

export function TBScreeningPanel({ patientId, episodeId }: TBScreeningPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>TBScreeningPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            TBScreeningPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
