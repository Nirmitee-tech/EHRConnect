/**
 * NewbornScreeningPanel Component
 * Pediatric specialty component for NewbornScreeningPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewbornScreeningPanelProps {
  patientId: string;
  episodeId?: string;
}

export function NewbornScreeningPanel({ patientId, episodeId }: NewbornScreeningPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>NewbornScreeningPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            NewbornScreeningPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
