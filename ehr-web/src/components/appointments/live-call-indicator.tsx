'use client';

import React from 'react';
import { Video, Users, PhoneOff } from 'lucide-react';
import { useMeetingStatus } from '@/hooks/useMeetingStatus';

interface LiveCallIndicatorProps {
  meetingCode: string;
  onMeetingEnded?: () => void;
  onJoinCall?: () => void;
}

export function LiveCallIndicator({ meetingCode, onMeetingEnded, onJoinCall }: LiveCallIndicatorProps) {
  const { meetingStatus } = useMeetingStatus(meetingCode, 5000); // Poll every 5 seconds

  // When meeting ends, trigger callback
  React.useEffect(() => {
    if (meetingStatus?.status === 'ended' && onMeetingEnded) {
      onMeetingEnded();
    }
  }, [meetingStatus?.status, onMeetingEnded]);

  if (!meetingStatus) return null;

  // Don't show if not active
  if (meetingStatus.status !== 'active') return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-3 shadow-lg animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <div className="w-3 h-3 bg-white rounded-full animate-ping absolute" />
              <div className="w-3 h-3 bg-white rounded-full relative" />
            </div>
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              Live Call
            </span>
          </div>

          {/* Participant Count */}
          {meetingStatus.participantCount !== undefined && (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">
                {meetingStatus.participantCount}
              </span>
            </div>
          )}
        </div>

        {/* Join Button */}
        {onJoinCall && (
          <button
            onClick={onJoinCall}
            className="px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-all text-sm flex items-center gap-2 shadow-md"
          >
            <Video className="w-4 h-4" />
            Join Call
          </button>
        )}
      </div>

      {/* Duration */}
      {meetingStatus.startedAt && (
        <div className="mt-2 flex items-center gap-2 text-white/90 text-xs">
          <PhoneOff className="w-3 h-3" />
          <span>
            Started {new Date(meetingStatus.startedAt).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
