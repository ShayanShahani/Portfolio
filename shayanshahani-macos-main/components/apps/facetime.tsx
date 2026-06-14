"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Download,
  ImageIcon,
  Mic,
  MicOff,
  PhoneOff,
  Trash2,
  Video,
} from "lucide-react";

interface FaceTimeProps {
  isDarkMode?: boolean;
  onClose?: () => void;
}

type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "unsupported";

interface CapturedPhoto {
  id: string;
  url: string;
  createdAt: string;
}

export default function FaceTime({
  isDarkMode = true,
  onClose,
}: FaceTimeProps) {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startRequestIdRef = useRef(0);
  const isMountedRef = useRef(false);

  const isCameraReady = cameraStatus === "ready" && isCameraOn;

  const appBg = isDarkMode
    ? "bg-zinc-950 text-white"
    : "bg-zinc-100 text-zinc-900";

  const galleryBg = isDarkMode ? "bg-zinc-950" : "bg-white";
  const borderColor = isDarkMode ? "border-white/10" : "border-black/10";
  const mutedText = isDarkMode ? "text-zinc-300" : "text-zinc-500";

  const stopCamera = useCallback(() => {
    startRequestIdRef.current += 1;

    const video = videoRef.current;

    if (video) {
      try {
        video.pause();
      } catch {
        // Ignore browser interruption errors.
      }

      try {
        video.srcObject = null;
      } catch {
        // Ignore browser interruption errors.
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      setIsCameraOn(false);
      return;
    }

    const requestId = startRequestIdRef.current + 1;
    startRequestIdRef.current = requestId;

    setCameraStatus("requesting");
    setIsCameraOn(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (!isMountedRef.current || startRequestIdRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;

      if (video) {
        video.muted = true;
        video.playsInline = true;
        video.srcObject = stream;

        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            const message =
              error instanceof Error ? error.message : String(error);

            if (
              message.includes("aborted") ||
              message.includes("interrupted")
            ) {
              return;
            }

            console.error("Could not start video playback:", error);
          });
        }
      }

      setCameraStatus("ready");
    } catch (error) {
      if (!isMountedRef.current || startRequestIdRef.current !== requestId) {
        return;
      }

      console.error("Error accessing camera:", error);
      stopCamera();
      setIsCameraOn(false);
      setCameraStatus("denied");
    }
  }, [stopCamera]);

  useEffect(() => {
    isMountedRef.current = true;

    const timeoutId = window.setTimeout(() => {
      startCamera();
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
      isMountedRef.current = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleCamera = async () => {
    if (cameraStatus === "requesting") return;

    if (isCameraOn) {
      stopCamera();
      setIsCameraOn(false);
      setCameraStatus("idle");
      return;
    }

    await startCamera();
  };

  const endCall = () => {
    stopCamera();

    if (onClose) {
      onClose();
      return;
    }

    setIsCameraOn(false);
    setCameraStatus("idle");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isCameraReady) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    const photoUrl = canvas.toDataURL("image/png");

    setCapturedPhotos((prev) => [
      {
        id: crypto.randomUUID(),
        url: photoUrl,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);

    setIsFlashing(true);

    window.setTimeout(() => {
      setIsFlashing(false);
    }, 140);
  };

  const deletePhoto = (id: string) => {
    setCapturedPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const downloadPhoto = (photo: CapturedPhoto) => {
    const link = document.createElement("a");

    link.href = photo.url;
    link.download = `facetime-photo-${photo.id}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusText = () => {
    if (cameraStatus === "requesting") return "Requesting Camera Access";
    if (cameraStatus === "ready" && isCameraOn) return "Camera Preview";
    if (cameraStatus === "denied") return "Camera Permission Needed";
    if (cameraStatus === "unsupported") return "Camera Not Supported";
    return "Camera Off";
  };

  const getEmptyStateMessage = () => {
    if (cameraStatus === "requesting") {
      return "Waiting for camera permission...";
    }

    if (cameraStatus === "denied") {
      return "Camera access is blocked. Please allow camera permission in your browser settings.";
    }

    if (cameraStatus === "unsupported") {
      return "Your browser does not support camera access.";
    }

    return "Camera is turned off. Use the camera button below to turn it back on.";
  };

  return (
    <div className={`h-full ${appBg} overflow-hidden`}>
      <div className="relative h-full flex flex-col">
        <div className="relative flex-1 min-h-0 bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`
              absolute inset-0 h-full w-full object-cover scale-x-[-1]
              transition-opacity duration-300
              ${isCameraReady ? "opacity-100" : "opacity-0"}
            `}
          />

          {!isCameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-24">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-5">
                {cameraStatus === "requesting" ? (
                  <Video className="w-10 h-10 text-white animate-pulse" />
                ) : (
                  <CameraOff className="w-10 h-10 text-white/80" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-white">
                {getStatusText()}
              </h3>

              <p className="max-w-md mt-2 text-sm text-white/55">
                {getEmptyStateMessage()}
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/80" />

          {isFlashing && <div className="absolute inset-0 bg-white z-20" />}

          <div className="absolute top-5 left-5 right-5 z-10 flex items-start justify-between gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/25 backdrop-blur-xl px-4 py-3 shadow-xl">
              <p className="text-xl font-semibold text-white leading-tight">
                Shayan
              </p>
              <p className="text-sm text-white/65">{getStatusText()}</p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-black/25 backdrop-blur-xl px-3 py-2 text-xs text-white/70">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCameraReady ? "bg-green-400" : "bg-zinc-400"
                }`}
              />
              Preview Mode
            </div>
          </div>

          <div className="absolute left-1/2 bottom-8 z-10 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl px-4 py-3 shadow-2xl">
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition
                  ${
                    isMuted
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }
                `}
                aria-label={isMuted ? "Unmute" : "Mute"}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                disabled={cameraStatus === "requesting"}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition
                  ${
                    isCameraOn
                      ? "bg-white/15 text-white hover:bg-white/25"
                      : "bg-white text-black hover:bg-white/90"
                  }
                  ${
                    cameraStatus === "requesting"
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }
                `}
                aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
                title={isCameraOn ? "Turn camera off" : "Turn camera on"}
              >
                {isCameraOn ? (
                  <Camera className="w-5 h-5" />
                ) : (
                  <CameraOff className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  transition border-4 border-white/80
                  ${
                    isCameraReady
                      ? "bg-white text-black hover:scale-105"
                      : "bg-white/20 text-white/35 cursor-not-allowed"
                  }
                `}
                aria-label="Capture photo"
                title="Capture photo"
              >
                <ImageIcon className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={endCall}
                className="
                  w-14 h-14 rounded-full bg-red-500 text-white
                  flex items-center justify-center hover:bg-red-600 transition
                "
                aria-label="Close FaceTime"
                title="Close FaceTime"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div
          className={`shrink-0 border-t ${borderColor} ${galleryBg} px-4 py-3`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold">Captured Photos</h3>
              <p className={`text-xs ${mutedText}`}>
                {capturedPhotos.length > 0
                  ? `${capturedPhotos.length} photo${
                      capturedPhotos.length === 1 ? "" : "s"
                    }`
                  : "No photos captured yet"}
              </p>
            </div>
          </div>

          {capturedPhotos.length > 0 ? (
            <div className="flex overflow-x-auto gap-3 pb-1">
              {capturedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`
                    group relative shrink-0 overflow-hidden rounded-2xl
                    border ${borderColor}
                    ${isDarkMode ? "bg-zinc-900" : "bg-zinc-100"}
                  `}
                >
                  <img
                    src={photo.url}
                    alt={`Captured photo ${index + 1}`}
                    className="h-24 w-36 object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-1.5 left-2 text-[10px] text-white/85 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.createdAt}
                  </div>

                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => downloadPhoto(photo)}
                      className="w-7 h-7 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white"
                      aria-label="Download photo"
                      title="Download photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePhoto(photo.id)}
                      className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                      aria-label="Delete photo"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`
                rounded-2xl border border-dashed ${borderColor}
                py-4 text-center text-sm ${mutedText}
              `}
            >
              Capture a photo to see it here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
