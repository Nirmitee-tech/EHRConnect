/**
 * LeadScreeningPanel Component
 * Pediatric specialty component for LeadScreeningPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeadScreeningPanelProps {
  patientId: string;
  episodeId?: string;
}

export function LeadScreeningPanel({ patientId, episodeId }: LeadScreeningPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>LeadScreeningPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            LeadScreeningPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
