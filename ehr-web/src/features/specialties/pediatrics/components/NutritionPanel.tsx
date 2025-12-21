/**
 * NutritionPanel Component
 * Pediatric specialty component for NutritionPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NutritionPanelProps {
  patientId: string;
  episodeId?: string;
}

export function NutritionPanel({ patientId, episodeId }: NutritionPanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>NutritionPanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            NutritionPanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
