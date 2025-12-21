/**
 * InjuryPreventionPanel Component
 * Pediatric specialty component for InjuryPreventionPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InjuryPreventionPanelProps {
  patientId: string;
  episodeId?: string;
}

export function InjuryPreventionPanel({ patientId, episodeId }: InjuryPreventionPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>InjuryPreventionPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            InjuryPreventionPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
