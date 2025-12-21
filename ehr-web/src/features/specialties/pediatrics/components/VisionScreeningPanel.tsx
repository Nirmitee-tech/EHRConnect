/**
 * VisionScreeningPanel Component
 * Pediatric specialty component for VisionScreeningPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VisionScreeningPanelProps {
  patientId: string;
  episodeId?: string;
}

export function VisionScreeningPanel({ patientId, episodeId }: VisionScreeningPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>VisionScreeningPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            VisionScreeningPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
