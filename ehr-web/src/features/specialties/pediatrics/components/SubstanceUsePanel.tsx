/**
 * SubstanceUsePanel Component
 * Pediatric specialty component for SubstanceUsePanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubstanceUsePanelProps {
  patientId: string;
  episodeId?: string;
}

export function SubstanceUsePanel({ patientId, episodeId }: SubstanceUsePanelProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>SubstanceUsePanel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            SubstanceUsePanel content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
