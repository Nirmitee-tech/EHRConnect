/**
 * AutismScreeningPanel Component
 * Pediatric specialty component for AutismScreeningPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AutismScreeningPanelProps {
  patientId: string;
  episodeId?: string;
}

export function AutismScreeningPanel({ patientId, episodeId }: AutismScreeningPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>AutismScreeningPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AutismScreeningPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
