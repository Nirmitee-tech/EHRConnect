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
          <div className="flex flex-col items-center justify-center px-2">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/20 rounded-full flex items-center justify-center mb-2 md:mb-3">
              <span className="text-white text-2xl md:text-3xl font-semibold">
                {peer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white text-sm md:text-lg font-medium text-center">{peer.name}</p>
            {isLocal && <p className="text-gray-400 text-xs md:text-sm mt-1">(You)</p>}
          </div>
        )}
      </div>

      {/* Screen Share Badge */}
      {hasScreenShare && (
        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-blue-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium shadow-lg">
          Screen Sharing
        </div>
      )}

      {/* Participant Info Badge */}
      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-slate-900/80 backdrop-blur-md px-2 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl border border-white/20 shadow-lg">
        <div className="flex items-center gap-1.5 md:gap-3">
          <span className="text-white text-xs md:text-sm font-semibold truncate max-w-[100px] md:max-w-none">
            {peer.name}
            {isLocal && ' (You)'}
          </span>
          {audioTrack && !isAudioEnabled && (
            <div className="p-0.5 md:p-1 bg-red-500/20 rounded-md flex-shrink-0">
              <MicOff className="w-3 h-3 md:w-3.5 md:h-3.5 text-red-400" />
            </div>
          )}
        </div>
      </div>

      {/* Audio Indicator */}
      {isAudioEnabled && (
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </div>
      )}

      {/* Hover Controls - Hidden on mobile touch devices */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={handleFullscreen}
          className="p-1.5 md:p-2.5 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 rounded-lg md:rounded-xl transition-colors border border-white/20 shadow-lg"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
        </button>
      </div>

    </div>
  );
}
