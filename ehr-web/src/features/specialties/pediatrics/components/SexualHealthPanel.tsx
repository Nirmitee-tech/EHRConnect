/**
 * SexualHealthPanel Component
 * Pediatric specialty component for SexualHealthPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SexualHealthPanelProps {
  patientId: string;
  episodeId?: string;
}

export function SexualHealthPanel({ patientId, episodeId }: SexualHealthPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>SexualHealthPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            SexualHealthPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
