/**
 * VitalSignsPanel Component
 * Pediatric specialty component for VitalSignsPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VitalSignsPanelProps {
  patientId: string;
  episodeId?: string;
}

export function VitalSignsPanel({ patientId, episodeId }: VitalSignsPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>VitalSignsPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            VitalSignsPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
