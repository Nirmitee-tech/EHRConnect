'use client';

import { useState, useEffect } from 'react';
import { getMeetingByCode } from '@/lib/api/virtual-meetings';

export interface MeetingStatus {
  isActive: boolean;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  participantCount?: number;
  startedAt?: string;
  endedAt?: string;
}

export function useMeetingStatus(meetingCode?: string, pollInterval = 5000) {
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingCode) return;

    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchMeetingStatus = async () => {
      try {
        setLoading(true);
        const meeting = await getMeetingByCode(meetingCode);

        if (isMounted) {
          setMeetingStatus({
            isActive: meeting.status === 'active',
            status: meeting.status as any,
            participantCount: meeting.participantCount,
            startedAt: meeting.startedAt,
            endedAt: meeting.endedAt
          });
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch meeting status');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchMeetingStatus();

    // Poll for updates
    intervalId = setInterval(fetchMeetingStatus, pollInterval);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [meetingCode, pollInterval]);

  return { meetingStatus, loading, error };
}
