'use client';

import React, { useState } from 'react';
import { Video, Loader, Copy, CheckCircle, ExternalLink, X, Calendar } from 'lucide-react';
import { createInstantMeeting, createMeetingForAppointment, type VirtualMeeting } from '@/lib/api/virtual-meetings';
import { useOrganization } from '@/hooks/useOrganization';

interface InstantMeetingButtonProps {
  appointmentId?: string;
  patientId?: string;
  practitionerId?: string;
  displayName?: string;
  variant?: 'instant' | 'appointment';
  onMeetingCreated?: (meeting: VirtualMeeting) => void;
}

export function InstantMeetingButton({
  appointmentId,
  patientId,
  practitionerId,
  displayName,
  variant = 'instant',
  onMeetingCreated
}: InstantMeetingButtonProps) {
  const { orgId } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [meeting, setMeeting] = useState<VirtualMeeting | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const handleCreateMeeting = async () => {
    if (!orgId) {
      alert('Organization ID not found');
      return;
    }

    try {
      setLoading(true);

      let newMeeting: VirtualMeeting;

      if (variant === 'appointment' && appointmentId) {
        newMeeting = await createMeetingForAppointment(appointmentId, {
          orgId,
          recordingEnabled: true,
        });
      } else {
        newMeeting = await createInstantMeeting({
          orgId,
          practitionerId,
          patientId,
          displayName,
          recordingEnabled: true,
        });
      }

      setMeeting(newMeeting);
      setShowDetails(true);

      if (onMeetingCreated) {
        onMeetingCreated(newMeeting);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  };

  const handleJoinMeeting = () => {
    if (meeting) {
      const meetingUrl = `/meeting/${meeting.meetingCode}`;
      window.open(meetingUrl, '_blank');
    }
  };

  if (showDetails && meeting) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Meeting Created!</h3>
                  <p className="text-blue-100 text-sm">Your telehealth meeting is ready</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Meeting Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-2xl font-bold text-primary text-center tracking-wider">
                  {meeting.meetingCode}
                </div>
                <button
                  onClick={() => copyToClipboard(meeting.meetingCode, 'code')}
                  className="px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  title="Copy code"
                >
                  {copied === 'code' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={meeting.publicLink}
                  readOnly
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 font-mono"
                />
                <button
                  onClick={() => copyToClipboard(meeting.publicLink, 'link')}
                  className="px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  title="Copy link"
                >
                  {copied === 'link' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this link with participants
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Status: <span className="capitalize">{meeting.status}</span>
                </p>
                <p className="text-xs text-green-700">
                  {variant === 'appointment' ? 'Linked to appointment' : 'Instant meeting'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleJoinMeeting}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-lg hover:from-primary/90 hover:to-indigo-600/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Video className="w-5 h-5" />
                Join Meeting
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>Important:</strong> This meeting is HIPAA-compliant and secure.
                {meeting.recordingEnabled && ' Recording is enabled for this session.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreateMeeting}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        variant === 'appointment'
          ? 'bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow'
          : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-md hover:shadow-lg'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={variant === 'appointment' ? 'Start Video Call' : 'Create Instant Meeting'}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Creating...</span>
        </>
      ) : (
        <>
          {variant === 'appointment' ? (
            <>
              <Video className="w-4 h-4" />
              <span>Start Video Call</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              <span>Instant Meeting</span>
            </>
          )}
        </>
      )}
    </button>
  );
}
