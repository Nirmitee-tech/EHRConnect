'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { LoadingState } from '@nirmitee.io/design-system';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  // Show loading state
  if (status === 'loading') {
    return <LoadingState message="Loading..." />;
  }

  // This layout provides a clean, full-width layout without sidebar for onboarding
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
