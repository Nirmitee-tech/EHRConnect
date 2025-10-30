'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, Loader, AlertCircle, CheckCircle, User, Mic, MicOff, VideoOff, Settings } from 'lucide-react';
import { getMeetingByCode, joinMeetingByCode, type VirtualMeeting } from '@/lib/api/virtual-meetings';
import { MeetingRoom } from '@/components/virtual-meetings/meeting-room';
import { useSession } from 'next-auth/react';

type ViewState = 'loading' | 'lobby' | 'meeting' | 'error' | 'ended';

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
    } finally {
      setJoining(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <Loader className="w-16 h-16 text-blue-600 animate-spin relative" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Loading Meeting
          </h2>
          <p className="text-gray-600 text-lg">
            Preparing your secure video consultation...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (viewState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Meeting Not Available
          </h2>
          <p className="text-gray-600 mb-2 text-lg">{error}</p>
          <p className="text-gray-500 text-sm mb-8">
            Please check your meeting link or contact support for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Consultation Complete
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for using EHR Connect Telehealth. Your session has ended successfully.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Close Window
          </button>
        </div>
      </div>
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
      />
    );
  }

  // Lobby - Google Meet Style
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">EHR Connect</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span className="font-mono">{meetingCode}</span>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Video Preview */}
          <div className="space-y-4">
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl aspect-video">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}

              {/* Name Badge */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
                <p className="text-white text-sm font-medium">
                  {displayName || 'You'}
                </p>
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-all ${
                    audioEnabled
                      ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {audioEnabled ? (
                    <Mic className="w-5 h-5 text-white" />
                  ) : (
                    <MicOff className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all ${
                    videoEnabled
                      ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {videoEnabled ? (
                    <Video className="w-5 h-5 text-white" />
                  ) : (
                    <VideoOff className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Join Controls */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ready to join?
              </h2>
              <p className="text-gray-600 text-lg">
                {session?.user ? `Welcome back, ${session.user.name}!` : 'Enter your name to get started'}
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {meeting && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">
                    Meeting is <span className="capitalize">{meeting.status}</span>
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleJoinMeeting} className="space-y-6">
              {/* Name Input - Only show if not authenticated */}
              {!session?.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                    autoFocus
                  />
                </div>
              )}

              {/* User Type - Only show if not authenticated */}
              {!session?.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('practitioner')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        userType === 'practitioner'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">Healthcare Provider</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('guest')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        userType === 'guest'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">Patient</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Join Button */}
              <button
                type="submit"
                disabled={joining || !displayName.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join now'
                )}
              </button>

              {/* Info */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By joining, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">terms</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">privacy policy</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
