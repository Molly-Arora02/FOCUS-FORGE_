"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Video,
  VideoOff,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CameraTrackerProps {
  isActive: boolean;
  onToggle: () => void;
  onAttentionUpdate?: (score: number, status: "locked_in" | "distracted" | "absent") => void;
}

export const CameraTracker: React.FC<CameraTrackerProps> = ({
  isActive,
  onToggle,
  onAttentionUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [attentionScore, setAttentionScore] = useState<number>(95);
  const [status, setStatus] = useState<"locked_in" | "distracted" | "absent">("locked_in");
  const [fps, setFps] = useState<number>(15);

  const prevFrameData = useRef<Uint8ClampedArray | null>(null);

  // Initialize or stop live webcam stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isActive) {
      setPermissionError(null);
      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        })
        .then((s) => {
          activeStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch((e) => console.warn("Video play error:", e));
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setPermissionError(
            err.name === "NotAllowedError"
              ? "Camera permission denied by browser. Please allow webcam access in browser settings."
              : "Webcam not detected or busy with another application."
          );
        });
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Real-time Frame Analysis Loop (runs in browser memory only)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const analyzeFrame = () => {
      if (isActive && videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (ctx) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = frame.data;
          const length = data.length;

          let totalBrightness = 0;
          let motionDiff = 0;

          // Compute frame brightness and frame-to-frame motion delta
          for (let i = 0; i < length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;

            if (prevFrameData.current) {
              const prevR = prevFrameData.current[i];
              const prevG = prevFrameData.current[i + 1];
              const prevB = prevFrameData.current[i + 2];
              const diff = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
              motionDiff += diff;
            }
          }

          prevFrameData.current = new Uint8ClampedArray(data);

          const pixelCount = length / 4;
          const avgBrightness = totalBrightness / pixelCount;
          const avgMotion = motionDiff / pixelCount;

          // Heuristic classification
          let newStatus: "locked_in" | "distracted" | "absent" = "locked_in";
          let score = 95;

          if (avgBrightness < 15) {
            newStatus = "absent";
            score = 20;
          } else if (avgMotion > 45) {
            newStatus = "distracted";
            score = 65;
          } else {
            newStatus = "locked_in";
            score = Math.min(100, Math.max(80, Math.round(98 - avgMotion * 0.2)));
          }

          setAttentionScore(score);
          setStatus(newStatus);
          onAttentionUpdate?.(score, newStatus);
        }
      }

      // Calculate FPS
      const now = Date.now();
      const delta = now - lastTime;
      if (delta > 0) {
        setFps(Math.round(1000 / delta));
      }
      lastTime = now;

      if (isActive) {
        animationFrameId = requestAnimationFrame(analyzeFrame);
      }
    };

    if (isActive) {
      animationFrameId = requestAnimationFrame(analyzeFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, onAttentionUpdate]);

  return (
    <div className="rounded-2xl bg-surface-card border border-surface-border p-4 space-y-3 shadow-glow-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-forge animate-pulse" />
          <span className="text-xs font-mono font-bold text-txt-primary uppercase tracking-wider">
            Live Camera Attention HUD
          </span>
        </div>

        <Button
          type="button"
          variant={isActive ? "danger" : "forge"}
          size="sm"
          onClick={onToggle}
          className="text-xs h-7 px-2.5 font-bold"
        >
          {isActive ? (
            <>
              <VideoOff className="w-3.5 h-3.5 mr-1" />
              Stop Camera
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5 mr-1" />
              Enable Live Camera
            </>
          )}
        </Button>
      </div>

      {/* Camera Live View & Privacy Banner */}
      {isActive ? (
        <div className="space-y-2">
          {permissionError ? (
            <div className="p-4 rounded-xl bg-status-error/15 border border-status-error/30 text-xs text-status-error flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Webcam Permission Required</p>
                <p className="text-[11px] text-txt-secondary mt-1">{permissionError}</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black border border-forge/40 aspect-video shadow-glow flex items-center justify-center">
              {/* Actual Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Hidden Canvas for local mathematical frame analysis */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Sci-Fi HUD Overlays */}
              {/* Targeting Reticle Corners */}
              <div className="absolute inset-4 border border-forge/30 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[10px] font-mono text-forge">
                  <span>[ HUD ACTIVE ]</span>
                  <span>FPS: {fps}</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-txt-muted">
                  <span>LATENCY: &lt;5MS</span>
                  <span>100% ON-DEVICE</span>
                </div>
              </div>

              {/* Center Target Box */}
              <div
                className={`absolute w-32 h-36 border-2 rounded-xl transition-all duration-300 pointer-events-none ${
                  status === "locked_in"
                    ? "border-forge shadow-[0_0_15px_rgba(255,42,77,0.8)]"
                    : status === "distracted"
                    ? "border-status-warning shadow-[0_0_15px_rgba(255,152,0,0.8)]"
                    : "border-status-error/50"
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-forge border border-forge/40">
                  {status === "locked_in"
                    ? "TARGET LOCKED"
                    : status === "distracted"
                    ? "MOTION DETECTED"
                    : "NO FACE IN FRAME"}
                </div>
              </div>

              {/* Live Attention Score Floating Tag */}
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-forge/40 flex items-center gap-2 text-xs font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === "locked_in" ? "bg-forge" : "bg-status-warning"
                  }`}
                />
                <span className="font-bold text-txt-primary">ATTENTION: {attentionScore}%</span>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center justify-between text-[11px] font-mono text-txt-muted pt-1">
            <span className="flex items-center gap-1 text-forge">
              <ShieldCheck className="w-3.5 h-3.5" />
              Browser Local Video • No Server Upload
            </span>
            <span className="text-txt-secondary capitalize">Status: {status.replace("_", " ")}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-surface border border-surface-border text-center space-y-2">
          <EyeOff className="w-6 h-6 text-txt-muted mx-auto" />
          <p className="text-xs text-txt-secondary">
            Camera Focus Estimation is currently disabled.
          </p>
          <p className="text-[11px] text-txt-muted">
            Enable live webcam tracking to monitor on-screen attention cues during deep work.
          </p>
        </div>
      )}
    </div>
  );
};
