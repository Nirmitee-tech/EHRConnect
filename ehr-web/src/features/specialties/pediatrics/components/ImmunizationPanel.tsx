/**
 * ImmunizationPanel Component
 * Pediatric specialty component for ImmunizationPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImmunizationPanelProps {
  patientId: string;
  episodeId?: string;
}

export function ImmunizationPanel({ patientId, episodeId }: ImmunizationPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>ImmunizationPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ImmunizationPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
