'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  MicOff,
  Maximize2
} from 'lucide-react';
import {
  useVideo,
  HMSPeer,
  selectCameraStreamByPeerID,
  selectScreenShareByPeerID,
  useHMSStore
} from '@100mslive/react-sdk';

interface VideoTileProps {
  peer: HMSPeer;
  isLocal?: boolean;
}

export function VideoTile({ peer, isLocal = false }: VideoTileProps) {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Track selectors
  const videoTrack = useHMSStore(selectCameraStreamByPeerID(peer.id));
  const { videoRef: hmsVideoRef } = useVideo({
    trackId: videoTrack?.id,
    attach: Boolean(videoTrack?.enabled),
  });
  const audioTrack = useHMSStore((state) =>
    peer.audioTrack ? state.tracks[peer.audioTrack] : undefined
  );

  // Get screen share track if available
  const screenShareTrack = useHMSStore(selectScreenShareByPeerID(peer.id));

  const hasVideo = Boolean(videoTrack?.enabled);
  const hasScreenShare = Boolean(screenShareTrack?.enabled);
  const isAudioEnabled = audioTrack?.enabled;

  // Keep local copy of the DOM element for logging/diagnostics while still letting HMS manage the stream
  const combinedVideoRef = useCallback(
    (element: HTMLVideoElement | null) => {
      videoElementRef.current = element;
      hmsVideoRef(element);
    },
    [hmsVideoRef]
  );

  // Handle fullscreen
  const handleFullscreen = () => {
    const element = videoElementRef.current?.parentElement;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen?.() ||
      (element as any).webkitRequestFullscreen?.() ||
      (element as any).mozRequestFullScreen?.() ||
      (element as any).msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
      (document as any).webkitExitFullscreen?.() ||
      (document as any).mozCancelFullScreen?.() ||
      (document as any).msExitFullscreen?.();
    }
  };

  // Aggressive debug logging
  useEffect(() => {
    console.log(`[VideoTile] 🎬 Rendering ${peer.name} ${isLocal ? '(You)' : ''}`);
    console.log(`[VideoTile]   videoTrack?.id:`, videoTrack?.id);
    console.log(`[VideoTile]   videoTrack?.enabled:`, videoTrack?.enabled);
    console.log(`[VideoTile]   hasVideo:`, hasVideo);
    console.log(`[VideoTile]   screenShareTrack?.id:`, screenShareTrack?.id);
    console.log(`[VideoTile]   screenShareTrack?.enabled:`, screenShareTrack?.enabled);
    console.log(`[VideoTile]   hasScreenShare:`, hasScreenShare);
    console.log(`[VideoTile]   audioTrack?.enabled:`, isAudioEnabled);
    console.log(
      `[VideoTile]   video element mounted:`,
      Boolean(videoElementRef.current)
    );
  }, [
    peer.name,
    isLocal,
    videoTrack?.id,
    videoTrack?.enabled,
    screenShareTrack?.id,
    screenShareTrack?.enabled,
    hasVideo,
    hasScreenShare,
    isAudioEnabled,
  ]);

  // Render screen share using useVideo hook
  const { videoRef: screenShareRef } = useVideo({
    trackId: screenShareTrack?.id,
    attach: hasScreenShare,
  });

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden relative group shadow-xl border border-white/10">
      {/* Video Container */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
        {hasScreenShare ? (
          // Show screen share
          <video
            ref={screenShareRef}
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-contain"
          />
        ) : hasVideo ? (
          // Show camera video
          <video
            ref={combinedVideoRef}
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          // Show avatar when video is off
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-white text-3xl font-semibold">
                {peer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white text-lg font-medium">{peer.name}</p>
            {isLocal && <p className="text-gray-400 text-sm mt-1">(You)</p>}
          </div>
        )}
      </div>

      {/* Screen Share Badge */}
      {hasScreenShare && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
          Screen Sharing
        </div>
      )}

      {/* Participant Info Badge */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-semibold">
            {peer.name}
            {isLocal && ' (You)'}
          </span>
          {audioTrack && !isAudioEnabled && (
            <div className="p-1 bg-red-500/20 rounded-md">
              <MicOff className="w-3.5 h-3.5 text-red-400" />
            </div>
          )}
        </div>
      </div>

      {/* Audio Indicator */}
      {isAudioEnabled && (
        <div className="absolute bottom-4 right-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </div>
      )}

      {/* Hover Controls */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={handleFullscreen}
          className="p-2.5 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 rounded-xl transition-colors border border-white/20 shadow-lg"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Network Quality Indicator */}
      {peer.networkQuality !== undefined && (
        <div className="absolute top-4 left-4 flex gap-1 bg-slate-900/60 backdrop-blur-md px-2 py-1.5 rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-colors ${
                i < peer.networkQuality
                  ? 'bg-green-400'
                  : 'bg-gray-600'
              }`}
              style={{ height: `${(i + 1) * 4}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
