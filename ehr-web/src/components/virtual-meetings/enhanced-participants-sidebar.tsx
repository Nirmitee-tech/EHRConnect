'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Clock,
  UserCheck,
  UserX,
  Shield,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HMSPeer, useHMSStore } from '@100mslive/react-sdk';

interface ParticipantHistory {
  id: string;
  displayName: string;
  userType: string;
  joinedAt: Date;
  leftAt?: Date;
  duration?: number;
}

interface EnhancedParticipantsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  peers: HMSPeer[];
  localPeerId?: string;
  participantHistory?: ParticipantHistory[];
  meetingStartTime?: Date;
}

export function EnhancedParticipantsSidebar({
  isOpen,
  onClose,
  peers,
  localPeerId,
  participantHistory = [],
  meetingStartTime
}: EnhancedParticipantsSidebarProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!meetingStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - meetingStartTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [meetingStartTime]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activePeers = peers.filter(p => p);
  const hostPeers = activePeers.filter(p => p.roleName === 'host');
  const guestPeers = activePeers.filter(p => p.roleName !== 'host');

  return (
    <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-l border-white/10 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Participants</h3>
              <p className="text-blue-200 text-xs">
                {activePeers.length} {activePeers.length !== 1 ? 'people' : 'person'} in call
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-blue-200" />
          </button>
        </div>

        {/* Meeting Duration */}
        {meetingStartTime && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-md">
            <Clock className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-white font-semibold">
              {formatDuration(elapsedTime)}
            </span>
            <span className="text-xs text-blue-200 ml-auto">Duration</span>
          </div>
        )}
      </div>

      {/* Active Participants */}
      <div className="flex-1 overflow-y-auto">
        {/* Hosts */}
        {hostPeers.length > 0 && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-yellow-400" />
              <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
                Providers ({hostPeers.length})
              </h4>
            </div>
            <div className="space-y-2">
              {hostPeers.map((peer) => (
                <ParticipantCard
                  key={peer.id}
                  peer={peer}
                  isLocal={peer.id === localPeerId}
                  isHost={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Guests/Patients */}
        {guestPeers.length > 0 && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                Patients & Guests ({guestPeers.length})
              </h4>
            </div>
            <div className="space-y-2">
              {guestPeers.map((peer) => (
                <ParticipantCard
                  key={peer.id}
                  peer={peer}
                  isLocal={peer.id === localPeerId}
                  isHost={false}
                />
              ))}
            </div>
          </div>
        )}

        {activePeers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Users className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm text-center">
              Waiting for participants to join...
            </p>
          </div>
        )}

        {/* Join History */}
        {participantHistory.length > 0 && (
          <div className="px-4 py-3 border-t border-white/10">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-300">
                  Join History ({participantHistory.length})
                </span>
              </div>
              {showHistory ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2">
                {participantHistory.map((history) => (
                  <div
                    key={history.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {history.leftAt ? (
                        <UserX className="w-4 h-4 text-red-400" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {history.displayName}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {history.userType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-0.5 ml-6">
                      <div>Joined: {formatTime(history.joinedAt)}</div>
                      {history.leftAt && (
                        <>
                          <div>Left: {formatTime(history.leftAt)}</div>
                          {history.duration && (
                            <div>Duration: {formatDuration(history.duration)}</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-white/10 px-4 py-3 bg-slate-900/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-white/5 rounded-lg">
            <div className="text-lg font-bold text-white">{activePeers.length}</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="p-2 bg-white/5 rounded-lg">
            <div className="text-lg font-bold text-white">{hostPeers.length}</div>
            <div className="text-xs text-gray-400">Providers</div>
          </div>
          <div className="p-2 bg-white/5 rounded-lg">
            <div className="text-lg font-bold text-white">
              {participantHistory.length}
            </div>
            <div className="text-xs text-gray-400">Total Joins</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ParticipantCardProps {
  peer: HMSPeer;
  isLocal: boolean;
  isHost: boolean;
}

function ParticipantCard({ peer, isLocal, isHost }: ParticipantCardProps) {
  // Get actual track objects from the store (peer.audioTrack and peer.videoTrack are just IDs/strings)
  const audioTrack = useHMSStore((state) =>
    peer.audioTrack ? state.tracks[peer.audioTrack] : undefined
  );
  const videoTrack = useHMSStore((state) =>
    peer.videoTrack ? state.tracks[peer.videoTrack] : undefined
  );

  const isAudioEnabled = audioTrack?.enabled;
  const isVideoEnabled = videoTrack?.enabled;

  return (
    <div className={`p-3 rounded-xl transition-all ${
      isLocal
        ? 'bg-blue-500/20 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
        : 'bg-white/10 border border-white/20 hover:bg-white/15'
    }`}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isHost ? 'bg-yellow-500/20' : 'bg-blue-500/20'
        }`}>
          <span className={`text-sm font-bold ${
            isHost ? 'text-yellow-400' : 'text-blue-400'
          }`}>
            {peer.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">
              {peer.name}
            </p>
            {isLocal && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-500/30 text-blue-300 rounded">
                You
              </span>
            )}
            {isHost && (
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
            )}
          </div>

          {/* Controls & Status */}
          <div className="flex items-center gap-2">
            {/* Audio */}
            {audioTrack ? (
              isAudioEnabled ? (
                <div className="p-1 bg-green-500/20 rounded">
                  <Mic className="w-3 h-3 text-green-400" />
                </div>
              ) : (
                <div className="p-1 bg-red-500/20 rounded">
                  <MicOff className="w-3 h-3 text-red-400" />
                </div>
              )
            ) : null}

            {/* Video */}
            {videoTrack ? (
              isVideoEnabled ? (
                <div className="p-1 bg-green-500/20 rounded">
                  <Video className="w-3 h-3 text-green-400" />
                </div>
              ) : (
                <div className="p-1 bg-gray-500/20 rounded">
                  <VideoOff className="w-3 h-3 text-gray-400" />
                </div>
              )
            ) : null}

            {/* Screen Share */}
            {peer.auxiliaryTracks && peer.auxiliaryTracks.length > 0 && (
              <div className="p-1 bg-blue-500/20 rounded">
                <Monitor className="w-3 h-3 text-blue-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
