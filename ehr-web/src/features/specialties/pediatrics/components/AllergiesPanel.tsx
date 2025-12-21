/**
 * AllergiesPanel Component
 * Pediatric specialty component for AllergiesPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AllergiesPanelProps {
  patientId: string;
  episodeId?: string;
}

export function AllergiesPanel({ patientId, episodeId }: AllergiesPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>AllergiesPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AllergiesPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
