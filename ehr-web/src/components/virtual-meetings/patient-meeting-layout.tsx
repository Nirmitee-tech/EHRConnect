'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { HMSPeer } from '@100mslive/react-sdk';
import { VideoTile } from './video-tile';

interface PatientMeetingLayoutProps {
  peers: HMSPeer[];
  localPeer?: HMSPeer;
}

// Get responsive grid classes based on participant count
function getGridClasses(peerCount: number): string {
  if (peerCount === 1) {
    return 'grid-cols-1 grid-rows-1';
  }
  if (peerCount === 2) {
    // Mobile: stack vertically, Desktop: side by side
    return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
  }
  if (peerCount === 3) {
    // Mobile: 2 cols, Desktop: 3 cols
    return 'grid-cols-2 md:grid-cols-3';
  }
  if (peerCount === 4) {
    return 'grid-cols-2 md:grid-cols-2';
  }
  if (peerCount <= 6) {
    return 'grid-cols-2 md:grid-cols-3';
  }
  if (peerCount <= 9) {
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
  }
  // For more participants, use auto-fit
  return '';
}

export function PatientMeetingLayout({
  peers,
  localPeer
}: PatientMeetingLayoutProps) {
  const gridClasses = getGridClasses(peers.length);
  const useAutoFit = peers.length > 9;

  return (
    <div className="flex-1 p-2 md:p-3 bg-gray-100 overflow-hidden">
      {/* Show message if no peers */}
      {peers.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center px-4">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 text-base md:text-lg font-medium">Waiting for the provider to join...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait, the consultation will begin shortly</p>
          </div>
        </div>
      )}

      {/* Unified Responsive Grid Layout - Works on all screen sizes */}
      {peers.length > 0 && (
        <div
          className={`h-full w-full grid gap-2 md:gap-3 ${gridClasses}`}
          style={useAutoFit ? {
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gridAutoRows: 'minmax(0, 1fr)'
          } : {
            gridAutoRows: 'minmax(0, 1fr)'
          }}
        >
          {peers.map((peer) => (
            <VideoTile
              key={peer.id}
              peer={peer}
              isLocal={peer.id === localPeer?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
