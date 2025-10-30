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
  AlertCircle
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

interface MeetingRoomProps {
  authToken: string;
  meetingId: string;
  displayName: string;
  onLeave: () => void;
  isHost?: boolean;
}

export function MeetingRoom({
  authToken,
  meetingId,
  displayName,
  onLeave,
  isHost = false
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

  // Show loading state while joining
  if (isJoining) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
            <Loader className="w-16 h-16 text-blue-400 animate-spin relative" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Connecting to Meeting
          </h2>
          <p className="text-blue-200 text-lg mb-6">
            {connectionStatus}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-blue-900/90 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Video className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">EHR Connect Telehealth</h1>
            <p className="text-blue-200 text-sm">Secure Video Consultation{meetingId ? ` • ${meetingId.substring(0, 8)}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${
            isConnected
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-yellow-400 animate-pulse'
            }`} />
            <span className="text-sm font-semibold">{connectionStatus}</span>
          </div>
          <button className="p-2.5 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-blue-200" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="h-full grid gap-4 auto-rows-fr" style={{
            gridTemplateColumns: peers.length === 1 ? '1fr' : peers.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(320px, 1fr))'
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
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Waiting for participants to join...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
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

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <h3 className="text-white font-semibold">
                  Participants ({peers.length})
                </h3>
              </div>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {peers.map((peer) => (
                <div
                  key={peer.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">
                      {peer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {peer.name}
                      {peer.isLocal && ' (You)'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {peer.audioEnabled ? (
                        <Mic className="w-3 h-3 text-green-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      {peer.videoEnabled ? (
                        <Video className="w-3 h-3 text-green-400" />
                      ) : (
                        <VideoOff className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gradient-to-r from-slate-800/95 to-blue-900/95 backdrop-blur-xl px-8 py-5 border-t border-white/10 shadow-2xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md">
              <span className="text-blue-100 text-sm font-semibold">
                {peers.length} {peers.length !== 1 ? 'Participants' : 'Participant'}
              </span>
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-xl transition-all shadow-lg ${
                isLocalAudioEnabled
                  ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/50'
              }`}
              title={isLocalAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isLocalAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-xl transition-all shadow-lg ${
                isLocalVideoEnabled
                  ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/50'
              }`}
              title={isLocalVideoEnabled ? 'Stop Video' : 'Start Video'}
            >
              {isLocalVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-xl transition-all shadow-lg ${
                isScreenSharing || isSomeoneScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/50'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
              title="Share Screen"
              disabled={isSomeoneScreenSharing && !isScreenSharing}
            >
              <MonitorUp className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-4 rounded-xl transition-all shadow-lg relative ${
                showChat
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/50'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
              title="Chat"
            >
              <MessageSquare className="w-6 h-6" />
              {messages.length > 0 && !showChat && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1.5 text-xs font-bold shadow-lg shadow-red-500/50">
                  {messages.length}
                </div>
              )}
            </button>

            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-4 rounded-xl transition-all shadow-lg ${
                showParticipants
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/50'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
              title="Participants"
            >
              <Users className="w-6 h-6" />
            </button>

            <div className="w-px h-10 bg-white/20 mx-2" />

            <button
              onClick={handleLeave}
              className="p-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/50 font-semibold"
              title="Leave Meeting"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          <div className="w-[120px]" /> {/* Spacer for centering */}
        </div>
      </div>
    </div>
  );
}
