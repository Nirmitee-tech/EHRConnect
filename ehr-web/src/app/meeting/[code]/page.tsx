'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, Loader, AlertCircle, CheckCircle, User, Mic, MicOff, VideoOff, Settings } from 'lucide-react';
import { getMeetingByCode, joinMeetingByCode, type VirtualMeeting } from '@/lib/api/virtual-meetings';
import { MeetingRoom } from '@/components/virtual-meetings/meeting-room';
import { ConsentDialog } from '@/components/virtual-meetings/consent-dialog';
import { useSession } from 'next-auth/react';

type ViewState = 'loading' | 'lobby' | 'consent' | 'meeting' | 'error' | 'ended';

export default function MeetingJoinPage() {
  const params = useParams();
  const router = useRouter();
  const meetingCode = params.code as string;
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [meeting, setMeeting] = useState<VirtualMeeting | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'practitioner' | 'guest'>('guest');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);

  // Load meeting details and check authentication
  useEffect(() => {
    if (meetingCode) {
      loadMeetingDetails();
    }
  }, [meetingCode]);

  // Auto-populate name for authenticated users
  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || '');
      setUserType('practitioner');
    }
  }, [session]);

  // Setup video preview
  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupVideo = async () => {
      try {
        console.log('[Lobby] 🎥 Starting camera preview...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        console.log('[Lobby] ✅ Camera preview started');
      } catch (err) {
        console.error('[Lobby] ❌ Error accessing media devices:', err);
        setError('Failed to access camera/microphone. Please check permissions.');
      }
    };

    if (viewState === 'lobby') {
      setupVideo();
    }

    // Cleanup only when permanently leaving (error/ended)
    // When joining meeting, handleJoinMeeting() stops the stream
    return () => {
      if (stream && (viewState === 'error' || viewState === 'ended')) {
        console.log('[Lobby] 🧹 Cleaning up camera stream (view state:', viewState, ')');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [viewState]);

  const loadMeetingDetails = async () => {
    try {
      setViewState('loading');
      const meetingData = await getMeetingByCode(meetingCode);
      setMeeting(meetingData);

      if (meetingData.status === 'ended' || meetingData.status === 'cancelled') {
        setViewState('ended');
      } else {
        setViewState('lobby');
      }
    } catch (err: any) {
      setError(err.message || 'Meeting not found');
      setViewState('error');
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleJoinMeeting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    // For patients (guests), show consent first
    if (userType === 'guest' && !consentGiven) {
      setViewState('consent');
      return;
    }

    // If consent already given or is practitioner, join directly
    await proceedToJoinMeeting();
  };

  const proceedToJoinMeeting = async () => {
    try {
      setJoining(true);
      setError('');

      // 🔥 CRITICAL: Stop lobby camera BEFORE getting auth token
      // Browser only allows ONE app to access camera at a time
      // We must release it so 100ms can acquire it
      if (localStream) {
        console.log('[Lobby] 🎥 Stopping lobby camera to release for 100ms...');
        localStream.getTracks().forEach(track => {
          console.log('[Lobby] Stopping track:', track.kind, track.label);
          track.stop();
        });
        setLocalStream(null);
        // Small delay to ensure tracks are fully released
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const response = await joinMeetingByCode(meetingCode, {
        displayName: displayName.trim(),
        userType,
      });

      setAuthToken(response.authToken);
      setMeeting(response);

      // Switch to meeting view - 100ms will now be able to get camera
      setViewState('meeting');

    } catch (err: any) {
      setError(err.message || 'Failed to join meeting');
      // If join fails, restart camera preview
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (restartErr) {
        console.error('[Lobby] Failed to restart camera:', restartErr);
      }
      setViewState('lobby');
    } finally {
      setJoining(false);
    }
  };

  const handleConsent = async (consents: Record<string, boolean>) => {
    try {
      // TODO: Send consent to API
      console.log('Patient consent received:', consents);
      setConsentGiven(true);
      // After consent, proceed to join
      await proceedToJoinMeeting();
    } catch (error) {
      console.error('Failed to save consent:', error);
      throw error;
    }
  };

  const handleLeaveMeeting = () => {
    setViewState('ended');
    // Optionally redirect
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  // Loading State
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full text-center border border-gray-200">
          <Loader className="w-10 h-10 md:w-12 md:h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Loading Meeting
          </h2>
          <p className="text-gray-600 text-sm">
            Preparing your video consultation...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (viewState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
            <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-red-600" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Meeting Not Available
          </h2>
          <p className="text-gray-600 mb-1 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mb-6">
            Please check your meeting link or contact support.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Meeting Ended State
  if (viewState === 'ended') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Consultation Complete
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Thank you for using EHR Connect Telehealth.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // Consent Dialog (for patients before joining)
  if (viewState === 'consent') {
    return (
      <>
        {/* Background with video preview */}
        <div className="h-screen bg-gray-100 flex items-center justify-center">
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Consent Dialog */}
        <ConsentDialog
          isOpen={true}
          onClose={() => setViewState('lobby')}
          onConsent={handleConsent}
          patientName={displayName}
          meetingId={meeting?.id || meetingCode}
        />
      </>
    );
  }

  // Meeting Room
  if (viewState === 'meeting' && authToken && meeting) {
    return (
      <MeetingRoom
        authToken={authToken}
        meetingId={meeting.meetingId}
        displayName={displayName}
        onLeave={handleLeaveMeeting}
        isHost={userType === 'practitioner'}
        patientId={meeting.patientId}
        patientName={(meeting as any).patientName}
        encounterId={(meeting as any).encounterId}
      />
    );
  }

  // Lobby - Responsive Professional Light Theme
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Responsive */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-gray-700 rounded-lg">
              <Video className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-semibold text-gray-900">EHR Connect Telehealth</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Secure Video Consultation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="px-2.5 md:px-3 py-1 md:py-1.5 bg-gray-100 rounded-md text-xs font-mono text-gray-700">
              {meetingCode}
            </span>
            <span className="text-xs md:text-sm text-gray-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row bg-gray-50">
        {/* Left Side: Patient Info & Join Controls - Stacks on top for mobile */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full">
            {/* Patient Details Card */}
            {meeting && (meeting as any).patientName && (
              <div className="mb-4 bg-white rounded-lg border border-gray-200 p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3 mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">{(meeting as any).patientName || 'Patient'}</h3>
                    <p className="text-xs text-gray-500 truncate">ID: {meeting.patientId?.substring(0, 8) || 'N/A'}</p>
                  </div>
                </div>

                {/* Encounter Info */}
                {(meeting as any).encounterId && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Encounter Details</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium text-gray-900 truncate">{(meeting as any).encounterId.substring(0, 12)}...</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-900">Telehealth</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Status:</span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Welcome Section */}
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Ready to join?
              </h2>
              <p className="text-gray-600 text-sm">
                {session?.user
                  ? `Welcome back, ${session.user.name}!`
                  : 'Enter your details to start your consultation'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Meeting Status */}
            {meeting && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-gray-800">
                    Meeting is <span className="capitalize text-green-700">{meeting.status}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Join Form */}
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              {/* Name Input - Only show if not authenticated */}
              {!session?.user && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 md:py-2 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-gray-900"
                    required
                    autoFocus
                  />
                </div>
              )}

              {/* User Type - Only show if not authenticated */}
              {!session?.user && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    I am joining as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserType('practitioner')}
                      className={`p-3 md:p-3 rounded-lg border transition-all text-center ${
                        userType === 'practitioner'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-xs text-gray-900">Provider</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('guest')}
                      className={`p-3 md:p-3 rounded-lg border transition-all text-center ${
                        userType === 'guest'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-xs text-gray-900">Patient</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Join Button */}
              <button
                type="submit"
                disabled={joining || !displayName.trim()}
                className="w-full py-3 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation"
              >
                {joining ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join now'
                )}
              </button>

              {/* Privacy Notice */}
              <div className="text-center pt-1">
                <p className="text-xs text-gray-500">
                  By joining, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">terms</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">privacy policy</a>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Video Preview - Full width on mobile, side panel on desktop */}
        <div className="w-full lg:w-[420px] bg-gray-100 flex items-center justify-center p-4 md:p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="w-full max-w-md lg:max-w-none">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-3 border border-gray-300">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Camera is off</p>
                  </div>
                </div>
              )}

              {/* Name Badge */}
              <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 bg-black/70 backdrop-blur-sm px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg">
                <p className="text-white text-xs font-medium">
                  {displayName || 'You'}
                </p>
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 flex gap-2">
                <button
                  onClick={toggleAudio}
                  className={`p-2 md:p-2.5 rounded-lg transition-all touch-manipulation ${
                    audioEnabled
                      ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {audioEnabled ? (
                    <Mic className="w-4 h-4 text-white" />
                  ) : (
                    <MicOff className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-2 md:p-2.5 rounded-lg transition-all touch-manipulation ${
                    videoEnabled
                      ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {videoEnabled ? (
                    <Video className="w-4 h-4 text-white" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Video Controls Info */}
            <p className="text-center text-gray-500 text-xs">
              Check your audio and video before joining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
