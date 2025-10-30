'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { HMSPeer } from '@100mslive/react-sdk';
import { VideoTile } from './video-tile';

interface PatientMeetingLayoutProps {
  peers: HMSPeer[];
  localPeer?: HMSPeer;
}

export function PatientMeetingLayout({
  peers,
  localPeer
}: PatientMeetingLayoutProps) {
  return (
    <div className="flex-1 p-3 bg-gray-100">
      {/* Full-screen Video Grid */}
      <div className="h-full grid gap-3 auto-rows-fr" style={{
        gridTemplateColumns: peers.length === 1 ? '1fr' : peers.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(400px, 1fr))'
      }}>
        {peers.map((peer) => (
          <VideoTile
            key={peer.id}
            peer={peer}
            isLocal={peer.id === localPeer?.id}
          />
        ))}

        {/* Show message if no peers */}
        {peers.length === 0 && (
          <div className="col-span-full flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 text-lg font-medium">Waiting for the provider to join...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait, the consultation will begin shortly</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
