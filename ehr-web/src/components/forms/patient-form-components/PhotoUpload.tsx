import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, User, Upload } from 'lucide-react';

interface PhotoUploadProps {
  photoPreview: string;
  onPhotoChange: (photo: string) => void;
}

export function PhotoUpload({ photoPreview, onPhotoChange }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isEnumerating, setIsEnumerating] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        console.log('Photo captured, size:', photoData.length, 'bytes');
        onPhotoChange(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadAvailableCameras = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    try {
      setIsEnumerating(true);
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      setSelectedDeviceId(prev => {
        if (prev && videoDevices.some(device => device.deviceId === prev)) {
          return prev;
        }
        return videoDevices[0]?.deviceId ?? null;
      });
    } catch (error) {
      console.error('Error listing cameras:', error);
    } finally {
      setIsEnumerating(false);
    }
  }, []);

  useEffect(() => {
    loadAvailableCameras();
  }, [loadAvailableCameras]);

  const startCamera = async (deviceId?: string) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      alert('Camera is not supported in this browser.');
      return;
    }

    try {
      setIsVideoReady(false);
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: 1280, height: 720 }
          : selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: 1280, height: 720 }
          : { facingMode: 'user', width: 1280, height: 720 },
        audio: false
      };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.warn('Primary camera request failed, trying default camera.', error);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 },
          audio: false
        });
        setSelectedDeviceId(null);
      }

      setIsCameraOn(true);
      setStream(mediaStream);
      loadAvailableCameras();
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCameraOn(false);
    setIsVideoReady(false);
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!stream || !videoEl || !isCameraOn) {
      return;
    }

    videoEl.srcObject = stream;

    const handleReadyState = () => {
      if (!videoEl) {
        return;
      }

      videoEl
        .play()
        .then(() => setIsVideoReady(true))
        .catch(err => {
          console.error('Error playing video:', err);
          setIsVideoReady(false);
        });
    };

    if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      handleReadyState();
    } else {
      videoEl.onloadeddata = handleReadyState;
      videoEl.onloadedmetadata = handleReadyState;
    }

    return () => {
      if (videoEl) {
        videoEl.onloadeddata = null;
        videoEl.onloadedmetadata = null;
      }
    };
  }, [stream, isCameraOn]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    if (!isVideoReady) {
      alert('Camera is still initializing. Please try again in a moment.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;

    if (!width || !height) {
      console.warn('Camera frame not ready yet — unable to capture.');
      alert('Unable to capture photo. Please try again.');
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Photo captured from camera, size:', imageData.length, 'bytes');
      onPhotoChange(imageData);
      stopCamera();
    }
  };

  const handleCameraSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value || null;
    setSelectedDeviceId(deviceId);

    if (isCameraOn) {
      stopCamera();
      await startCamera(deviceId || undefined);
    }
  };

  const handleStartOrCapture = () => {
    if (isCameraOn) {
      capturePhoto();
    } else {
      startCamera();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52">
          <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
            {photoPreview && !isCameraOn ? (
              <img
                src={photoPreview}
                alt="Patient"
                className="w-full h-full object-cover"
              />
            ) : isCameraOn ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-sm">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
                {!isVideoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">
                    Initializing camera…
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <User className="h-14 w-14" />
                <span className="text-xs font-medium">
                  Start camera or upload photo
                </span>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-center">
        <div className="flex flex-col gap-1 text-xs text-gray-600">
          <label htmlFor="camera-select" className="font-medium uppercase tracking-wide">
            Camera
          </label>
          <select
            id="camera-select"
            value={selectedDeviceId ?? ''}
            onChange={handleCameraSelection}
            disabled={isEnumerating || availableCameras.length === 0}
            className="h-9 min-w-[12rem] rounded-lg border border-gray-300 bg-white px-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {availableCameras.length === 0 ? (
              <option value="">
                {isEnumerating ? 'Detecting cameras…' : 'No camera found'}
              </option>
            ) : (
              availableCameras.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(-4)}`}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleStartOrCapture}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
            disabled={isCameraOn && !isVideoReady}
            title={isCameraOn ? 'Capture photo' : 'Start camera'}
          >
            <Camera className="h-4 w-4" />
            {isCameraOn ? 'Capture Photo' : 'Start Camera'}
          </button>

          <button
            type="button"
            onClick={handleUploadClick}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>

          {isCameraOn && (
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="hidden"
      />
    </div>
  );
}
