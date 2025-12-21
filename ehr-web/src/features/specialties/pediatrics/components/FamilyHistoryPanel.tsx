/**
 * FamilyHistoryPanel Component
 * Pediatric specialty component for FamilyHistoryPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FamilyHistoryPanelProps {
  patientId: string;
  episodeId?: string;
}

export function FamilyHistoryPanel({ patientId, episodeId }: FamilyHistoryPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>FamilyHistoryPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            FamilyHistoryPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
