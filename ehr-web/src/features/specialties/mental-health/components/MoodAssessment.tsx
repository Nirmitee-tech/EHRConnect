/**
 * Mood Assessment Component
 * Track and assess patient mood and mental state
 */

import React from 'react';

interface MoodAssessmentProps {
  patientId: string;
  episodeId?: string;
}

export function MoodAssessment({ patientId, episodeId }: MoodAssessmentProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mood Assessment</h2>
      <p className="text-muted-foreground">Mood assessment tools - Coming soon</p>
    </div>
  );
}
