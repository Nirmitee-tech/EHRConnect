/**
 * Growth Chart Component
 * Displays WHO/CDC growth charts with percentiles
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthChartProps {
  patientId: string;
  episodeId?: string;
}

export function GrowthChart({ patientId, episodeId }: GrowthChartProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Growth Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Growth chart visualization with WHO/CDC percentiles will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
