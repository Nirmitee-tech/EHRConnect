/**
 * Mental Health Overview Component
 * Main dashboard for mental health patient summary
 */

import React from 'react';

interface MentalHealthOverviewProps {
  patientId: string;
  episodeId?: string;
}

export function MentalHealthOverview({ patientId, episodeId }: MentalHealthOverviewProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mental Health Overview</h2>
      <p className="text-muted-foreground">Mental Health module - Coming soon</p>
    </div>
  );
}
