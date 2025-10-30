'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Users,
  PhoneOff,
  Settings,
  Maximize2,
  Loader,
  AlertCircle,
  Activity,
  FileText,
  Circle,
  Square
} from 'lucide-react';
import {
  selectIsConnectedToRoom,
  selectPeers,
  selectLocalPeer,
  useHMSStore,
  useHMSActions,
  selectIsSomeoneScreenSharing,
  selectHMSMessages,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  HMSPeer
} from '@100mslive/react-sdk';
import { VideoTile } from './video-tile';
import { ConsentDialog } from './consent-dialog';
import { VitalsDrawer } from '@/app/patients/[id]/components/drawers/VitalsDrawer';
import type { VitalsFormData } from '@/app/patients/[id]/components/types';
import { EnhancedParticipantsSidebar } from './enhanced-participants-sidebar';
import { ClinicalNotesPanel } from './clinical-notes-panel';
import { ProviderMeetingLayout } from './provider-meeting-layout';
import { PatientMeetingLayout } from './patient-meeting-layout';

interface MeetingRoomProps {
  authToken: string;
  meetingId: string;
  displayName: string;
  onLeave: () => void;
  isHost?: boolean;
  patientId?: string;
  patientName?: string;
  encounterId?: string;
}

export function MeetingRoom({
  authToken,
  meetingId,
  displayName,
  onLeave,
  isHost = false,
  patientId,
  patientName,
  encounterId
}: MeetingRoomProps) {
  const hmsActions = useHMSActions();

  // Safety check
  if (!authToken || !meetingId) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Invalid Meeting Configuration
          </h2>
          <p className="text-blue-200">
            Missing authentication token or meeting ID
          </p>
        </div>
      </div>
    );
  }

  // HMS Store selectors
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const isSomeoneScreenSharing = useHMSStore(selectIsSomeoneScreenSharing);
  const messages = useHMSStore(selectHMSMessages);

  // ✅ Use proper HMS selectors for track state (NOT peer.videoTrack.enabled - that's a string!)
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);

  // Local state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isJoining, setIsJoining] = useState(true);

  // New feature states
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showVitalsPanel, setShowVitalsPanel] = useState(false);
  const [showClinicalNotes, setShowClinicalNotes] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [meetingStartTime] = useState(new Date());

  // Join room on mount
  useEffect(() => {
    const joinRoom = async () => {
      try {
        setIsJoining(true);
        setConnectionStatus('Connecting to room...');

        console.log('Joining 100ms room with auth token...');

        await hmsActions.join({
          userName: displayName,
          authToken: authToken,
          settings: {
            isAudioMuted: false,
            isVideoMuted: false,
          },
          rememberDeviceSelection: true,
        });

        console.log('Successfully joined 100ms room!');
        setConnectionStatus('Connected');
        setIsJoining(false);
      } catch (error: any) {
        console.error('Failed to join room:', error);
        setConnectionStatus('Connection failed');
        setIsJoining(false);

        const errorMsg = error?.message || 'Failed to join meeting';
        if (errorMsg.includes('permission') || errorMsg.includes('Permission')) {
          alert('Camera/Microphone permission denied. Please allow access and try again.');
        } else {
          alert(`Failed to join meeting: ${errorMsg}`);
        }
      }
    };

    if (authToken) {
      joinRoom();
    }

    // Cleanup: leave room on unmount
    return () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [authToken, displayName, hmsActions]);

  // Force enable camera/mic after connection and log state
  useEffect(() => {
    if (isConnected && localPeer) {
      setConnectionStatus('Connected');
      setIsJoining(false);
      console.log('[MeetingRoom] ✅ Connected! Local peer:', localPeer);
      console.log('[MeetingRoom] 🎥 Video enabled (from selector):', isLocalVideoEnabled);
      console.log('[MeetingRoom] 🔊 Audio enabled (from selector):', isLocalAudioEnabled);
      console.log('[MeetingRoom] Local video track ID:', localPeer.videoTrack);
      console.log('[MeetingRoom] Local audio track ID:', localPeer.audioTrack);

      // Force enable camera and mic after tracks are acquired
      // Shorter delay now that we properly release lobby camera
      const forceEnableTimer = setTimeout(async () => {
        console.log('[MeetingRoom] 🚀 FORCE ENABLING camera and mic...');
        try {
          await hmsActions.setLocalAudioEnabled(true);
          console.log('[MeetingRoom] ✅ Audio force-enabled');
          await hmsActions.setLocalVideoEnabled(true);
          console.log('[MeetingRoom] ✅ Video force-enabled');
        } catch (err) {
          console.error('[MeetingRoom] ❌ Failed to force enable:', err);
        }
      }, 500);

      return () => clearTimeout(forceEnableTimer);
    }
  }, [isConnected, localPeer, hmsActions, isLocalVideoEnabled, isLocalAudioEnabled]);

  // Toggle functions with aggressive logging
  const toggleAudio = async () => {
    console.log('[MeetingRoom] 🔊 AUDIO BUTTON CLICKED! Current state:', isLocalAudioEnabled);
    try {
      const newState = !isLocalAudioEnabled;
      console.log('[MeetingRoom] Toggling audio from', isLocalAudioEnabled, 'to', newState);
      await hmsActions.setLocalAudioEnabled(newState);
      console.log('[MeetingRoom] ✅ Audio toggled successfully');
    } catch (error) {
      console.error('[MeetingRoom] ❌ Failed to toggle audio:', error);
      alert(`Failed to toggle microphone: ${error}`);
    }
  };

  const toggleVideo = async () => {
    console.log('[MeetingRoom] 🎥 VIDEO BUTTON CLICKED! Current state:', isLocalVideoEnabled);
    try {
      const newState = !isLocalVideoEnabled;
      console.log('[MeetingRoom] Toggling video from', isLocalVideoEnabled, 'to', newState);
      await hmsActions.setLocalVideoEnabled(newState);
      console.log('[MeetingRoom] ✅ Video toggled successfully');
    } catch (error) {
      console.error('[MeetingRoom] ❌ Failed to toggle video:', error);
      alert(`Failed to toggle camera: ${error}`);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        await hmsActions.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      } else {
        await hmsActions.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share error:', error);
      alert('Failed to toggle screen share');
    }
  };

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      try {
        await hmsActions.sendBroadcastMessage(chatInput.trim());
        setChatInput('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleLeave = async () => {
    try {
      await hmsActions.leave();
      onLeave();
    } catch (error) {
      console.error('Error leaving room:', error);
      onLeave();
    }
  };

  // Recording duration timer
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Consent handler
  const handleConsent = async (consents: Record<string, boolean>) => {
    try {
      // TODO: Send consent to API
      console.log('Consent received:', consents);
      setConsentGiven(true);
      setShowConsentDialog(false);

      // If recording consent given, can start recording
      if (consents.recording) {
        // Can now enable recording
      }
    } catch (error) {
      console.error('Failed to save consent:', error);
      throw error;
    }
  };

  // Vitals save handler
  const handleSaveVitals = async (data: VitalsFormData) => {
    try {
      // TODO: Send vitals to API
      console.log('Vitals captured:', data);
      // The drawer will close automatically on success
      setShowVitalsPanel(false);
    } catch (error) {
      console.error('Failed to save vitals:', error);
      throw error;
    }
  };

  // Clinical notes save handler
  const handleSaveClinicalNotes = async (note: any) => {
    try {
      // TODO: Send clinical notes to API
      console.log('Clinical notes saved:', note);
    } catch (error) {
      console.error('Failed to save clinical notes:', error);
      throw error;
    }
  };

  // Start/stop recording
  const toggleRecording = async () => {
    if (!consentGiven && !isRecording) {
      setShowConsentDialog(true);
      return;
    }

    try {
      if (isRecording) {
        // TODO: Stop recording via API
        setIsRecording(false);
        setRecordingDuration(0);
      } else {
        // TODO: Start recording via API
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Recording toggle error:', error);
      alert('Failed to toggle recording');
    }
  };

  const formatRecordingDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state while joining
  if (isJoining) {
    return (
      <div className="h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connecting to Meeting
          </h2>
          <p className="text-gray-600 text-sm">
            {connectionStatus}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-700 rounded-lg">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-base">EHR Connect Telehealth</h1>
            <p className="text-gray-500 text-xs">
              {patientName || 'Secure Video Consultation'}
              {meetingId ? ` • ${meetingId.substring(0, 8)}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <Circle className="w-2 h-2 fill-red-500 text-red-500" />
              <span className="text-xs font-medium">{formatRecordingDuration(recordingDuration)}</span>
              <span className="text-xs">REC</span>
            </div>
          )}

          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isConnected
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-xs font-medium">{connectionStatus}</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Conditional Layout */}
      {isHost && patientId ? (
        /* Provider View: Patient details left, video right */
        <ProviderMeetingLayout
          peers={peers}
          localPeer={localPeer}
          patientId={patientId}
          patientName={patientName || 'Patient'}
          encounterId={encounterId}
          onSaveClinicalNotes={handleSaveClinicalNotes}
          showClinicalNotes={showClinicalNotes}
          setShowClinicalNotes={setShowClinicalNotes}
          showVitalsPanel={showVitalsPanel}
          setShowVitalsPanel={setShowVitalsPanel}
        />
      ) : (
        /* Patient View: Full-screen video */
        <PatientMeetingLayout
          peers={peers}
          localPeer={localPeer}
        />
      )}

      {/* Chat Sidebar (Available for both) */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-16 w-80 bg-gray-800 border-l border-gray-700 flex flex-col z-30">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-primary text-sm font-medium">
                    {msg.senderName}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-white text-sm">{msg.message}</p>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No messages yet</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Participants Sidebar (Available for both) */}
      <EnhancedParticipantsSidebar
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        peers={peers}
        localPeerId={localPeer?.id}
        meetingStartTime={meetingStartTime}
      />

      {/* Control Bar */}
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-gray-700 text-xs font-medium">
                {peers.length} {peers.length !== 1 ? 'Participants' : 'Participant'}
              </span>
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-lg transition-all ${
                isLocalAudioEnabled
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isLocalAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isLocalAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-lg transition-all ${
                isLocalVideoEnabled
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isLocalVideoEnabled ? 'Stop Video' : 'Start Video'}
            >
              {isLocalVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-lg transition-all ${
                isScreenSharing || isSomeoneScreenSharing
                  ? 'bg-gray-700 hover:bg-gray-800 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
              title="Share Screen"
              disabled={isSomeoneScreenSharing && !isScreenSharing}
            >
              <MonitorUp className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-lg transition-all relative ${
                showChat
                  ? 'bg-gray-700 hover:bg-gray-800 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
              title="Chat"
            >
              <MessageSquare className="w-5 h-5" />
              {messages.length > 0 && !showChat && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-4 bg-red-500 rounded-full flex items-center justify-center px-1 text-xs font-bold text-white">
                  {messages.length}
                </div>
              )}
            </button>

            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-3 rounded-lg transition-all ${
                showParticipants
                  ? 'bg-gray-700 hover:bg-gray-800 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
              title="Participants"
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Provider Controls - Only show for hosts */}
            {isHost && (
              <>
                {/* Vitals Capture */}
                {patientId && (
                  <button
                    onClick={() => setShowVitalsPanel(!showVitalsPanel)}
                    className={`p-3 rounded-lg transition-all ${
                      showVitalsPanel
                        ? 'bg-gray-700 hover:bg-gray-800 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                    }`}
                    title="Capture Vitals"
                  >
                    <Activity className="w-5 h-5" />
                  </button>
                )}

                {/* Clinical Notes */}
                {patientId && (
                  <button
                    onClick={() => setShowClinicalNotes(!showClinicalNotes)}
                    className={`p-3 rounded-lg transition-all ${
                      showClinicalNotes
                        ? 'bg-gray-700 hover:bg-gray-800 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                    }`}
                    title="Clinical Notes"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                )}

                {/* Consent Dialog */}
                <button
                  onClick={() => setShowConsentDialog(true)}
                  className={`p-3 rounded-lg transition-all ${
                    consentGiven
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  }`}
                  title="Manage Consent"
                >
                  <FileText className="w-5 h-5" />
                </button>

                {/* Recording Toggle */}
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                  {isRecording ? (
                    <Square className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              </>
            )}

            <div className="w-px h-8 bg-gray-200 mx-2" />

            <button
              onClick={handleLeave}
              className="p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
              title="Leave Meeting"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          <div className="w-[100px]" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Consent Dialog */}
      <ConsentDialog
        isOpen={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        onConsent={handleConsent}
        patientName={patientName}
        meetingId={meetingId}
      />

      {/* Vitals Capture Drawer */}
      {patientId && (
        <VitalsDrawer
          open={showVitalsPanel}
          onOpenChange={setShowVitalsPanel}
          onSave={handleSaveVitals}
          mode="create"
        />
      )}

      {/* Clinical Notes Panel */}
      {patientId && (
        <ClinicalNotesPanel
          isOpen={showClinicalNotes}
          onClose={() => setShowClinicalNotes(false)}
          onSave={handleSaveClinicalNotes}
          patientName={patientName}
          patientId={patientId}
          encounterId={encounterId}
        />
      )}
    </div>
  );
}
