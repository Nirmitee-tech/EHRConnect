/**
 * SportsPhysicalPanel Component
 * Pediatric specialty component for SportsPhysicalPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SportsPhysicalPanelProps {
  patientId: string;
  episodeId?: string;
}

export function SportsPhysicalPanel({ patientId, episodeId }: SportsPhysicalPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>SportsPhysicalPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            SportsPhysicalPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
