import React, { useRef, useState, useEffect } from 'react';
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => console.error('Error playing video:', err));
        };
      }
      
      setStream(mediaStream);
      setIsCameraOn(true);
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
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Photo captured from camera, size:', imageData.length, 'bytes');
        onPhotoChange(imageData);
        stopCamera();
      }
    }
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-32 h-32">
        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
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
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                REC
              </div>
            </div>
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        <button
          type="button"
          onClick={isCameraOn ? capturePhoto : startCamera}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 shadow-sm"
          title={isCameraOn ? "Capture photo" : "Start camera"}
        >
          <Camera className="h-4 w-4 text-gray-600" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2 left-2 w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 shadow-sm"
          title="Upload photo"
        >
          <Upload className="h-4 w-4 text-gray-600" />
        </button>

        {isCameraOn && (
          <button
            type="button"
            onClick={stopCamera}
            className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Stop
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
