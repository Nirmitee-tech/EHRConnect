/**
 * DevelopmentalScreening Component
 * Pediatric specialty component for DevelopmentalScreening
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DevelopmentalScreeningProps {
  patientId: string;
  episodeId?: string;
}

export function DevelopmentalScreening({ patientId, episodeId }: DevelopmentalScreeningProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>DevelopmentalScreening</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            DevelopmentalScreening content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
