"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Play,
  Pause,
  Square,
  Sparkles,
  Youtube,
  FileText,
  Video,
  VideoOff,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  AlertTriangle,
  Mic,
  Monitor,
  CheckSquare,
  Plus,
  RotateCw,
  BookOpen,
  ArrowRight,
  Bell,
  Headphones,
  Code,
  Check,
} from "lucide-react";
import { formatSecondsToTimer, formatMinutes } from "@/lib/utils";
import { Subject, FocusSession, Reward } from "@/types";
import { ScreenAndCameraTracker } from "@/components/camera/screen-and-camera";
import { VoiceCoachAgent } from "@/components/voice/voice-coach-agent";
import { FlashcardModal } from "@/components/flashcards/flashcard-modal";
import {
  playRealBellChime,
  playTabSwitchWarningAlert,
  playMilestoneUnlockChime,
  playPenaltyBuzzer,
  speakCoachAlert,
} from "@/lib/audio/sound-engine";

const FOCUS_ATMOSPHERES = [
  { id: "lofi", name: "Lofi Girl Chill", url: "https://www.youtube.com/watch?v=5qap5aO4i9A", icon: "🎧" },
  { id: "rain", name: "Rain & Thunder", url: "https://www.youtube.com/watch?v=mPZkdNFkNps", icon: "🌧️" },
  { id: "synth", name: "Synthwave Flow", url: "https://www.youtube.com/watch?v=4xDzrJKXOOY", icon: "🌌" },
  { id: "binaural", name: "40Hz Gamma Waves", url: "https://www.youtube.com/watch?v=WPni755-Krg", icon: "🧠" },
  { id: "cafe", name: "Cozy Study Cafe", url: "https://www.youtube.com/watch?v=lTRiuFIWV54", icon: "☕" },
];

function FocusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams?.get("subjectId") || "");
  const [topic, setTopic] = useState(searchParams?.get("topic") || "");
  const [subTopic, setSubTopic] = useState("");
  const [duration, setDuration] = useState(Number(searchParams?.get("duration")) || 25);
  const [taskId, setTaskId] = useState(searchParams?.get("taskId") || "");

  // Micro-objectives checklist during session
  const [microObjectives, setMicroObjectives] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "1", text: "Read core problem statement & invariants", done: false },
    { id: "2", text: "Draft initial code solution / notes", done: false },
  ]);
  const [newObjectiveText, setNewObjectiveText] = useState("");

  // Resource Attachment State
  const [resourceType, setResourceType] = useState<"none" | "youtube" | "notes">("none");
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=5qap5aO4i9A");
  const [scratchNotes, setScratchNotes] = useState("");
  const [workspaceTab, setWorkspaceTab] = useState<"atmosphere" | "scratchpad" | "code">("atmosphere");
  const [codeSnippet, setCodeSnippet] = useState("// Write your study code, algorithms, or proof steps here:\nfunction solve() {\n  // Focus state active\n}");

  // Camera & Screen Stream State
  const [cameraActive, setCameraActive] = useState(user?.preferences?.cameraFocusEnabled || false);

  // Tab Switch Restriction & Infraction Monitor
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Voice Coach Modal State
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);

  // Active Session State Machine: "idle" | "running" | "paused" | "completed"
  const [sessionState, setSessionState] = useState<"idle" | "running" | "paused" | "completed">("idle");
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Early Exit 3-Alert Sequence Modal State
  const [isEarlyExitModalOpen, setIsEarlyExitModalOpen] = useState(false);
  const [earlyExitStep, setEarlyExitStep] = useState<1 | 2 | 3>(1);

  // Post-Session Flashcard & Reflection Modal State
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [reflectionRating, setReflectionRating] = useState(5);
  const [reflectionNotes, setReflectionNotes] = useState("");
  const [reportedDistractions, setReportedDistractions] = useState<string[]>([]);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [unlockedMilestone, setUnlockedMilestone] = useState<Reward | null>(null);
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  // Automatic Flashcards State
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [sessionFlashcards, setSessionFlashcards] = useState<any[]>([]);

  // Sound Chime State
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Helper to extract YouTube video ID
  const getYouTubeEmbedUrl = (rawUrl: string) => {
    try {
      if (rawUrl.includes("embed/")) return rawUrl;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = rawUrl.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : "jfKfPfyJRdk";
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0`;
    } catch {
      return "https://www.youtube-nocookie.com/embed/jfKfPfyJRdk";
    }
  };

  useEffect(() => {
    async function loadSubjects() {
      const userId = user?._id || "demo-user-123";
      try {
        const res = await fetch(`/api/subjects?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
          if (!selectedSubjectId && data.subjects?.length > 0) {
            setSelectedSubjectId(data.subjects[0]._id);
          }
        }
      } catch (err) {
        console.error("Subject load error:", err);
      }
    }
    loadSubjects();
  }, [user, selectedSubjectId]);

  // Timer Tick Hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sessionState === "running") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState]);

  // Trigger Native OS System Notification and Tab Title Blink
  const triggerSystemTabSwitchAlert = (userName: string, count: number) => {
    if (typeof window === "undefined") return;

    // 1. Native OS / Browser System Notification
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification("⚠️ Focus Forge — Tab Switch Detected!", {
            body: `You are detected switching away from your Focus Chamber (Infraction #${count}). Return immediately to maintain your flow!`,
            icon: "/favicon.ico",
            tag: "focus-tab-switch-alert",
          });
        } catch (e) {
          console.warn("Notification error:", e);
        }
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            try {
              new Notification("⚠️ Focus Forge — Tab Switch Detected!", {
                body: `You are detected switching away from your Focus Chamber (Infraction #${count}). Return immediately!`,
                icon: "/favicon.ico",
                tag: "focus-tab-switch-alert",
              });
            } catch (e) {
              console.warn("Notification error:", e);
            }
          }
        });
      }
    }

    // 2. Dynamic Browser Tab Title Flasher
    const originalTitle = "Focus Forge — AI-Powered Focus Chamber";
    let isWarning = true;
    const titleInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        clearInterval(titleInterval);
        document.title = originalTitle;
      } else {
        document.title = isWarning ? "⚠️ TAB SWITCH DETECTED!" : "🛑 RETURN TO FOCUS FORGE";
        isWarning = !isWarning;
      }
    }, 1000);
  };

  // Tab Switch Restriction Detection Hook (uses visibilitychange only to avoid false alarms from iframes/window blur)
  useEffect(() => {
    let warningTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (sessionState === "running" && document.visibilityState === "hidden") {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          triggerSystemTabSwitchAlert(user?.displayName || "Molly", next);
          return next;
        });
        setShowTabWarning(true);
        if (soundEnabled) {
          playTabSwitchWarningAlert(0.6);
          speakCoachAlert(`Warning: Tab switch detected, ${user?.displayName || "Molly"}! Return to your focus workspace.`);
        }
      } else if (document.visibilityState === "visible") {
        // Automatically hide the warning banner after returning to focus page after 8 seconds
        if (warningTimeout) clearTimeout(warningTimeout);
        warningTimeout = setTimeout(() => {
          setShowTabWarning(false);
        }, 8000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (warningTimeout) clearTimeout(warningTimeout);
    };
  }, [sessionState, soundEnabled, user?.displayName]);

  // Session State Actions
  const handleStartSession = async () => {
    // Request notification permission if not yet requested
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    try {
      const res = await fetch("/api/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          subjectId: selectedSubjectId || undefined,
          taskId: taskId || undefined,
          topic: topic || "Deep Focus Sprint",
          plannedDuration: duration,
          resourceAttachment:
            resourceType !== "none"
              ? {
                  type: resourceType,
                  title: resourceType === "youtube" ? "Focus Video Stream" : "Scratchpad Notes",
                  url: resourceType === "youtube" ? youtubeUrl : undefined,
                }
              : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.session);
        setSessionState("running");
        setElapsedSeconds(0);
        setTabSwitchCount(0);
        if (soundEnabled) {
          playRealBellChime(0.7);
        }
      }
    } catch (err) {
      console.error("Error starting focus session:", err);
    }
  };

  const handlePauseSession = async () => {
    if (!activeSession) return;
    try {
      await fetch(`/api/focus/${activeSession._id}/pause`, { method: "POST" });
      setSessionState("paused");
    } catch (err) {
      console.error("Error pausing session:", err);
    }
  };

  const handleResumeSession = async () => {
    if (!activeSession) return;
    try {
      await fetch(`/api/focus/${activeSession._id}/resume`, { method: "POST" });
      setSessionState("running");
    } catch (err) {
      console.error("Error resuming session:", err);
    }
  };

  const handleRequestEndSession = () => {
    const totalPlannedSeconds = duration * 60;
    // If ending before planned time has completed
    if (elapsedSeconds < totalPlannedSeconds) {
      setEarlyExitStep(1);
      setIsEarlyExitModalOpen(true);
    } else {
      executeSessionComplete(false);
    }
  };

  const handleConfirmEarlyExit = async () => {
    setIsEarlyExitModalOpen(false);
    await executeSessionComplete(true);
  };

  const executeSessionComplete = async (isEarlyExit: boolean = false) => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/focus/${activeSession._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEarlyExit }),
      });

      if (res.ok) {
        const data = await res.json();
        const pts = isEarlyExit ? -5 : (data.pointsAwarded || 10);
        setPointsEarned(pts);
        setUnlockedMilestone(data.newMilestoneUnlocked || null);
        setSessionState("completed");

        if (isEarlyExit) {
          if (soundEnabled) playPenaltyBuzzer(0.8);
          speakCoachAlert(`Session ended early. Five points penalty applied.`);
        } else {
          if (soundEnabled) {
            playRealBellChime(0.8);
            playMilestoneUnlockChime(0.6);
          }
          speakCoachAlert(`Session completed! Ten Forge Points awarded.`);
        }

        // Fetch AI Flashcards
        const sub = subjects.find((s) => s._id === activeSession.subjectId);
        const flashRes = await fetch("/api/ai/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectName: sub?.name || "Deep Work",
            topic: activeSession.topic,
            subTopic,
            notes: scratchNotes,
          }),
        });

        if (flashRes.ok) {
          const flashData = await flashRes.json();
          setSessionFlashcards(flashData.flashcards || []);
        }

        setIsReflectionOpen(true);
      }
    } catch (err) {
      console.error("Error completing session:", err);
    }
  };

  const handleSaveReflection = async () => {
    if (!activeSession) return;
    setIsSavingReflection(true);
    try {
      await fetch(`/api/focus/${activeSession._id}/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusRating: reflectionRating,
          reflectionNotes,
          distractionsReported: reportedDistractions,
        }),
      });

      setIsReflectionOpen(false);
      // Launch flashcards modal immediately if generated!
      if (sessionFlashcards.length > 0) {
        setFlashcardModalOpen(true);
      } else {
        setSessionState("idle");
        setActiveSession(null);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error saving reflection:", err);
    } finally {
      setIsSavingReflection(false);
    }
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectiveText.trim()) return;
    setMicroObjectives((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newObjectiveText.trim(), done: false },
    ]);
    setNewObjectiveText("");
  };

  const toggleObjective = (id: string) => {
    setMicroObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, done: !obj.done } : obj))
    );
  };

  const totalPlannedSeconds = duration * 60;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalPlannedSeconds) * 100));
  const remainingSeconds = Math.max(0, totalPlannedSeconds - elapsedSeconds);
  const activeSubject = subjects.find((s) => s._id === selectedSubjectId);

  return (
    <AppShell>
      {/* IMMERSIVE FULL-SCREEN FOCUS MODE WHEN ACTIVE */}
      {sessionState === "running" || sessionState === "paused" ? (
        <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
          {/* Top Bar: Subject, Sub-Topic Prompt, Tab Warning & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border/60 pb-3 max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-3.5 h-3.5 rounded-full shadow-glow bg-forge shrink-0" />
              <div className="truncate">
                <p className="text-xs font-mono uppercase text-txt-muted">
                  {activeSubject?.name || "General Deep Work"}
                </p>
                <h2 className="text-sm sm:text-base font-bold text-txt-primary truncate">
                  {topic || "Deep Focus Sprint"}
                </h2>
              </div>
            </div>

            {/* In-Session Sub-Topic Ingestion Prompt */}
            <div className="flex items-center gap-2 bg-surface-card border border-forge/40 px-3 py-1.5 rounded-xl shadow-glow">
              <span className="text-[11px] font-mono text-txt-muted shrink-0">Sub-Topic:</span>
              <input
                type="text"
                placeholder="What sub-topic are you solving right now?"
                value={subTopic}
                onChange={(e) => setSubTopic(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold text-forge placeholder:text-txt-muted w-48 sm:w-64"
              />
            </div>

            {/* Actions: Tab Switch Warning Counter, Voice Coach, Sound, Complete */}
            <div className="flex items-center gap-2.5">
              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-status-error/15 border border-status-error/40 text-[11px] font-mono text-status-error animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{tabSwitchCount} Tab Switches</span>
                </div>
              )}

              {/* Real Acoustic Focus Bell Button */}
              <button
                type="button"
                onClick={() => playRealBellChime(0.8)}
                title="Ring Acoustic Focus Bell"
                className="p-2 rounded-xl bg-surface-card border border-surface-border text-amber-400 hover:text-amber-300 hover:border-amber-400/40 transition-colors flex items-center gap-1.5 text-xs font-mono"
              >
                <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline font-semibold">Ring Bell</span>
              </button>

              {/* Voice Agent Toggle */}
              <button
                type="button"
                onClick={() => setVoiceAgentOpen(!voiceAgentOpen)}
                className={`p-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                  voiceAgentOpen
                    ? "bg-forge text-white border-forge shadow-glow"
                    : "bg-surface-card border-surface-border text-txt-secondary hover:text-txt-primary"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Voice Agent</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-surface-card border border-surface-border text-txt-secondary hover:text-txt-primary"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-forge" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tab Switch Infraction Floating Warning Banner */}
          {showTabWarning && (
            <div className="max-w-xl mx-auto w-full p-3 rounded-2xl bg-status-error/20 border-2 border-status-error shadow-glow flex items-center justify-between text-xs text-status-error animate-in slide-in-from-top-4 duration-150 my-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Tab Switch Detected!</strong> Focus Forge encourages single-task flow. Return to your workspace immediately.
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowTabWarning(false)}
                className="text-[10px] h-6 px-2 shrink-0 font-bold"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Central Workspace: Timer + Multi-Resource Center */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start py-6 max-w-7xl w-full mx-auto">
            {/* Left 5 Cols: Timer Ring & Micro-Objectives */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 text-center">
              {/* Circular Progress Display */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" className="stroke-surface-card fill-none" strokeWidth="10" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className="stroke-forge fill-none transition-all duration-300"
                    strokeWidth="10"
                    strokeDasharray="264%"
                    strokeDashoffset={`${264 - (264 * progressPercent) / 100}%`}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 16px rgba(255, 42, 77, 0.7))" }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center space-y-1">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-txt-primary">
                    {formatSecondsToTimer(remainingSeconds)}
                  </span>
                  <span className="text-[11px] font-mono uppercase text-txt-muted tracking-widest">
                    {sessionState === "paused" ? "SESSION PAUSED" : `${progressPercent}% COMPLETED`}
                  </span>
                  <span className="text-xs font-mono text-forge font-bold">
                    {formatSecondsToTimer(elapsedSeconds)} elapsed
                  </span>
                </div>
              </div>

              {/* In-Session Dynamic Duration Adjuster */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono">
                <span className="text-[10px] text-txt-muted px-2 uppercase font-semibold">Adjust Target:</span>
                <button
                  type="button"
                  onClick={() => setDuration((prev) => Math.max(1, prev - 5))}
                  className="px-2 py-0.5 rounded-lg bg-surface border border-surface-border text-txt-secondary hover:text-txt-primary hover:border-forge/40 text-[11px]"
                >
                  -5m
                </button>
                <button
                  type="button"
                  onClick={() => setDuration((prev) => prev + 5)}
                  className="px-2 py-0.5 rounded-lg bg-surface border border-surface-border text-forge hover:border-forge text-[11px] font-semibold"
                >
                  +5m
                </button>
                <button
                  type="button"
                  onClick={() => setDuration((prev) => prev + 15)}
                  className="px-2 py-0.5 rounded-lg bg-forge/15 border border-forge/40 text-forge hover:border-forge text-[11px] font-bold"
                >
                  +15m
                </button>
              </div>

              {/* Action Buttons: Pause / Resume / End */}
              <div className="flex items-center gap-3">
                {sessionState === "running" ? (
                  <Button variant="secondary" size="md" onClick={handlePauseSession} className="font-bold px-5">
                    <Pause className="w-4 h-4 mr-1.5" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="forge" size="md" onClick={handleResumeSession} className="font-bold shadow-glow px-5">
                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                    Resume
                  </Button>
                )}

                <Button variant="danger" size="md" onClick={handleRequestEndSession} className="font-bold px-5 shadow-sm">
                  <Square className="w-4 h-4 mr-1.5 fill-current" />
                  {remainingSeconds > 0 ? "End Early / Complete" : "Complete Session"}
                </Button>
              </div>

              {/* In-Session Micro Objectives Checklist */}
              <div className="w-full max-w-sm bg-surface-card border border-surface-border rounded-2xl p-4 text-left space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-txt-primary">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-forge" />
                    Session Micro-Objectives
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {microObjectives.map((obj) => (
                    <div
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className="flex items-center gap-2 text-xs text-txt-secondary hover:text-txt-primary cursor-pointer p-1 rounded-lg hover:bg-surface"
                    >
                      <input
                        type="checkbox"
                        checked={obj.done}
                        readOnly
                        className="accent-forge cursor-pointer"
                      />
                      <span className={obj.done ? "line-through text-txt-muted" : ""}>{obj.text}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddObjective} className="flex gap-1.5 pt-1">
                  <Input
                    placeholder="Add step..."
                    value={newObjectiveText}
                    onChange={(e) => setNewObjectiveText(e.target.value)}
                    className="text-xs h-7 py-0"
                  />
                  <Button type="submit" variant="forge" size="sm" className="h-7 px-2 text-xs">
                    <Plus className="w-3 h-3" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Right 7 Cols: Camera HUD + Screen Share + YouTube/Notes + Voice Agent */}
            <div className="lg:col-span-7 space-y-4">
              {/* Voice Agent Floating Panel */}
              {voiceAgentOpen && (
                <VoiceCoachAgent
                  userId={user?._id || "demo-user-123"}
                  currentSubject={activeSubject?.name}
                  currentTopic={subTopic || topic}
                  onClose={() => setVoiceAgentOpen(false)}
                />
              )}

              {/* LIVE SCREEN SHARE & CAMERA TRACKER */}
              <ScreenAndCameraTracker
                isCameraActive={cameraActive}
                onToggleCamera={() => setCameraActive(!cameraActive)}
                userName={user?.displayName || "Molly"}
              />

              {/* Multi-Tab Focus Workspace: Atmosphere Video / Notes / Code */}
              <div className="rounded-2xl forge-glass-card border border-surface-border p-4 space-y-3.5 shadow-glow-card transition-all">
                {/* Header Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/60 pb-2.5">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-surface-border text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setWorkspaceTab("atmosphere")}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
                        workspaceTab === "atmosphere"
                          ? "bg-forge text-white shadow-glow"
                          : "text-txt-secondary hover:text-txt-primary"
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Atmosphere</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkspaceTab("scratchpad")}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
                        workspaceTab === "scratchpad"
                          ? "bg-forge text-white shadow-glow"
                          : "text-txt-secondary hover:text-txt-primary"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Notes</span>
                      {scratchNotes.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkspaceTab("code")}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
                        workspaceTab === "code"
                          ? "bg-forge text-white shadow-glow"
                          : "text-txt-secondary hover:text-txt-primary"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </button>
                  </div>

                  {workspaceTab === "atmosphere" && (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Custom YouTube stream..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="bg-surface border border-surface-border rounded-lg px-2.5 py-1 text-xs text-txt-primary outline-none focus:border-forge w-36 sm:w-56 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Tab Content 1: Atmosphere Video & Preset Stream Selector */}
                {workspaceTab === "atmosphere" && (
                  <div className="space-y-3">
                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {FOCUS_ATMOSPHERES.map((atm) => (
                        <button
                          key={atm.id}
                          type="button"
                          onClick={() => setYoutubeUrl(atm.url)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                            youtubeUrl === atm.url
                              ? "bg-forge/20 border-forge text-forge font-bold shadow-sm"
                              : "bg-surface border-surface-border text-txt-muted hover:text-txt-primary hover:border-surface-border/80"
                          }`}
                        >
                          <span>{atm.icon}</span>
                          <span>{atm.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="aspect-video rounded-xl overflow-hidden border border-surface-border/80 bg-black shadow-inner">
                      <iframe
                        src={getYouTubeEmbedUrl(youtubeUrl)}
                        title="Focus Atmosphere Stream"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Live Scratchpad */}
                {workspaceTab === "scratchpad" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-txt-muted">
                      <span>MARKDOWN & SCRATCHPAD ACTIVE</span>
                      <span>{scratchNotes.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                    <textarea
                      placeholder="Type formulas, concept breakdowns, reflection points, or key takeaways here. Auto-saves to your session log..."
                      value={scratchNotes}
                      onChange={(e) => setScratchNotes(e.target.value)}
                      className="w-full h-56 bg-surface/90 border border-surface-border rounded-xl p-3.5 text-xs text-txt-primary outline-none focus:border-forge resize-none font-mono leading-relaxed"
                    />
                  </div>
                )}

                {/* Tab Content 3: Code Draftpad */}
                {workspaceTab === "code" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-txt-muted">
                      <span>CODE DRAFTING CONSOLE (SYNTAX HIGHLIGHTING)</span>
                      <span className="text-forge font-bold">JavaScript / TypeScript</span>
                    </div>
                    <textarea
                      placeholder="// Write algorithmic logic, proofs, or pseudo-code..."
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      className="w-full h-56 bg-black/90 border border-surface-border rounded-xl p-3.5 text-xs text-forge font-mono outline-none focus:border-forge resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Status Tip */}
          <div className="text-center text-xs font-mono text-txt-muted border-t border-surface-border/40 pt-3">
            <span>🛡️ CRIMSON FORGE ACTIVE • TAB RESTRICTIONS & SCREEN SHARE MONITOR ENGAGED</span>
          </div>
        </div>
      ) : (
        /* FOCUS LAUNCHER CONFIGURATION VIEW (IDLE) */
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
                <Flame className="w-7 h-7 text-forge" />
                Focus Mode Launcher
              </h1>
              <p className="text-xs sm:text-sm text-txt-secondary">
                Configure your deep work block, enable live webcam/screen sharing, and attach study lectures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Setup Controls */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 md:p-8 space-y-6 shadow-glow-card">
                {/* 1. Pick Subject */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-txt-muted">1. Select Subject / Skill</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map((sub) => (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => setSelectedSubjectId(sub._id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          selectedSubjectId === sub._id
                            ? "bg-forge/15 border-forge text-txt-primary shadow-glow"
                            : "bg-surface-card border-surface-border text-txt-secondary hover:border-forge/40"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full shrink-0 bg-forge" />
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{sub.name}</p>
                          <p className="text-[10px] text-txt-muted">{sub.estimatedWeeklyHours}h weekly goal</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Specific Topic & Sub-Topic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-txt-muted">2. Main Topic</label>
                    <Input
                      placeholder="e.g. Graph Algorithms"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-txt-muted">Sub-Topic / Objective</label>
                    <Input
                      placeholder="e.g. Dijkstra with Priority Queue"
                      value={subTopic}
                      onChange={(e) => setSubTopic(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* 3. Fully Customizable Session Duration */}
                <div className="space-y-3 p-4 rounded-xl bg-surface-base/60 border border-surface-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-txt-muted flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-forge" />
                      3. Customizable Duration
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-txt-muted font-mono">Target:</span>
                      <span className="text-sm font-mono font-black text-forge bg-forge/15 px-2.5 py-0.5 rounded-lg border border-forge/30">
                        {duration} Minutes
                      </span>
                    </div>
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {[
                      { m: 5, label: "5m" },
                      { m: 15, label: "15m" },
                      { m: 25, label: "25m" },
                      { m: 45, label: "45m" },
                      { m: 50, label: "50m" },
                      { m: 60, label: "60m" },
                      { m: 90, label: "90m" },
                      { m: 120, label: "120m" },
                    ].map(({ m, label }) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDuration(m)}
                        className={`py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                          duration === m
                            ? "bg-forge text-white border-forge shadow-glow"
                            : "bg-surface-card border-surface-border text-txt-secondary hover:border-forge/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Number Input & Slider */}
                  <div className="pt-2 border-t border-surface-border/60 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-txt-muted shrink-0">Custom Exact Minutes:</span>
                      <div className="flex items-center gap-1.5 flex-1">
                        <Input
                          type="number"
                          min={1}
                          max={360}
                          value={duration}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setDuration(isNaN(val) ? 1 : Math.max(1, Math.min(360, val)));
                          }}
                          className="font-mono text-center font-bold text-sm h-8 w-24 bg-surface-card text-forge"
                        />
                        <span className="text-xs font-mono text-txt-muted">mins</span>

                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => setDuration((prev) => Math.max(1, prev - 5))}
                            className="px-2 py-1 rounded-md bg-surface-card border border-surface-border text-[11px] font-mono text-txt-secondary hover:text-txt-primary hover:border-forge/40"
                          >
                            -5m
                          </button>
                          <button
                            type="button"
                            onClick={() => setDuration((prev) => Math.min(360, prev + 5))}
                            className="px-2 py-1 rounded-md bg-surface-card border border-surface-border text-[11px] font-mono text-txt-secondary hover:text-txt-primary hover:border-forge/40"
                          >
                            +5m
                          </button>
                          <button
                            type="button"
                            onClick={() => setDuration((prev) => Math.min(360, prev + 15))}
                            className="px-2 py-1 rounded-md bg-surface-card border border-surface-border text-[11px] font-mono text-forge hover:border-forge font-semibold"
                          >
                            +15m
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fine-Tuning Slider */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] font-mono text-txt-muted">1m</span>
                      <input
                        type="range"
                        min={1}
                        max={180}
                        step={1}
                        value={Math.min(180, duration)}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full accent-forge h-1.5 bg-surface-card rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-txt-muted">180m</span>
                    </div>
                  </div>
                </div>

                {/* 4. YouTube Lecture / Stream Attachment */}
                <div className="space-y-2 pt-2 border-t border-surface-border/60">
                  <label className="text-xs font-mono uppercase text-txt-muted">4. YouTube Study Lecture URL (Optional)</label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Launch CTA */}
                <Button
                  variant="forge"
                  size="lg"
                  onClick={handleStartSession}
                  className="w-full text-base font-bold shadow-glow hover:shadow-glow-lg py-6"
                >
                  <Flame className="w-5 h-5 fill-current mr-2" />
                  Enter Distraction-Shielded Environment
                </Button>
              </Card>
            </div>

            {/* Right 1 Col: Camera & Screen Tracker Preview */}
            <div className="space-y-4">
              <ScreenAndCameraTracker
                isCameraActive={cameraActive}
                onToggleCamera={() => setCameraActive(!cameraActive)}
              />

              <Card className="p-6 space-y-4 bg-surface-card border-surface-border">
                <span className="text-xs font-mono text-txt-muted uppercase">Forge Focus Armor</span>
                <ul className="space-y-2 text-xs text-txt-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-forge font-bold">•</span>
                    <span><strong>Tab Switch Detection:</strong> Leaving this window logs infractions and alerts you immediately.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-forge font-bold">•</span>
                    <span><strong>Live Voice Coach:</strong> Ask questions hands-free via voice during study.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-forge font-bold">•</span>
                    <span><strong>Auto Active Recall Flashcards:</strong> Generates interactive quiz flashcards upon completion.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* 3-ALERT EARLY EXIT WARNING SEQUENCE MODAL */}
      {isEarlyExitModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface-card border-2 border-forge/60 shadow-[0_0_50px_rgba(255,42,77,0.35)] space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Step 1 of 3: Focus Friction Alert */}
            {earlyExitStep === 1 && (
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-500 mx-auto shadow-glow animate-bounce">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase font-bold">
                    Alert 1 of 3 • Focus Friction Warning
                  </span>
                  <h3 className="text-xl font-black text-txt-primary">Stop Before Time Completes?</h3>
                  <p className="text-xs text-txt-secondary leading-relaxed">
                    You still have <strong className="text-forge font-mono">{formatSecondsToTimer(remainingSeconds)}</strong> left in your planned <span className="font-mono font-bold text-txt-primary">{duration}m</span> sprint. Quitting now disrupts deep neural flow state.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="forge"
                    size="md"
                    onClick={() => setIsEarlyExitModalOpen(false)}
                    className="w-full font-bold shadow-glow"
                  >
                    🛡️ Stay in Flow (Recommended)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEarlyExitStep(2)}
                    className="text-xs text-txt-muted hover:text-txt-primary border-surface-border"
                  >
                    Proceed to Penalty Check (Alert 2) →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 of 3: -5 Points Penalty Warning */}
            {earlyExitStep === 2 && (
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-forge/20 border-2 border-forge flex items-center justify-center text-forge mx-auto shadow-glow animate-pulse">
                  <Flame className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-forge/20 text-forge border border-forge/40 uppercase font-bold">
                    Alert 2 of 3 • -5 Points Penalty
                  </span>
                  <h3 className="text-xl font-black text-txt-primary">Early Exit Penalty Warning</h3>
                  <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/40 text-xs text-status-error font-mono space-y-1">
                    <p className="font-bold text-sm">⚠️ Penalty: -5 Forge Points</p>
                    <p className="text-[11px] text-txt-secondary font-sans">
                      Finishing full sessions awards <strong className="text-forge">+10 Points</strong>. Quitting now deducts <strong>-5 Points</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="forge"
                    size="md"
                    onClick={() => setIsEarlyExitModalOpen(false)}
                    className="w-full font-bold shadow-glow"
                  >
                    🛡️ Keep Focusing & Earn +10 Pts
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setEarlyExitStep(3)}
                    className="text-xs font-bold"
                  >
                    I Accept Penalty, Go to Final Alert (Alert 3) →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 of 3: Final Confirmation */}
            {earlyExitStep === 3 && (
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-status-error/25 border-2 border-status-error flex items-center justify-center text-status-error mx-auto shadow-glow">
                  <Square className="w-7 h-7 fill-current" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-status-error/20 text-status-error border border-status-error/40 uppercase font-bold">
                    Alert 3 of 3 • Final Confirmation
                  </span>
                  <h3 className="text-xl font-black text-txt-primary">Confirm Early Termination?</h3>
                  <p className="text-xs text-status-error font-mono font-bold">
                    -5 Points will be deducted immediately from your balance.
                  </p>
                  <p className="text-[11px] text-txt-muted">
                    This action is logged in your session history as an early exit.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsEarlyExitModalOpen(false)}
                    className="w-full font-bold"
                  >
                    🛡️ Cancel & Return to Session
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleConfirmEarlyExit}
                    className="w-full font-extrabold shadow-[0_0_20px_rgba(255,42,77,0.8)]"
                  >
                    ⚠️ Confirm Early Exit (-5 Points)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST-SESSION REFLECTION MODAL */}
      {isReflectionOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-glow ${
                pointsEarned < 0 ? "bg-status-error/20 border-status-error text-status-error" : "bg-forge/15 border-forge/30 text-forge"
              }`}>
                {pointsEarned < 0 ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-black text-txt-primary">
                {pointsEarned < 0 ? "Session Ended Early" : "Session Completed!"}
              </h2>
              <p className="text-xs text-txt-secondary">
                You logged <span className="text-forge font-mono font-bold">{formatMinutes(Math.round(elapsedSeconds / 60))}</span> of focus time.
              </p>
            </div>

            {/* Points & Milestone Card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              pointsEarned < 0
                ? "bg-status-error/15 border-status-error/40 text-status-error"
                : "bg-surface-hover/80 border-forge/30 text-txt-primary"
            }`}>
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-5 h-5 ${pointsEarned < 0 ? "text-status-error" : "text-forge"}`} />
                <div>
                  <p className="font-bold text-txt-primary">
                    {pointsEarned < 0 ? "-5 Forge Points Deducted" : `+${pointsEarned} Forge Points Awarded`}
                  </p>
                  <p className="text-[11px] text-txt-muted">
                    {pointsEarned < 0 ? "Early exit penalty applied" : "Full completion bonus (+10 pts)"}
                  </p>
                </div>
              </div>
              <Badge variant={pointsEarned < 0 ? "error" : "forge"} size="md" className="font-mono font-bold">
                {pointsEarned < 0 ? "-5 PTS" : "+10 PTS"}
              </Badge>
            </div>

            {/* Focus Rating */}
            <div className="space-y-2 text-center">
              <label className="text-xs font-mono uppercase text-txt-muted">How focused did you feel?</label>
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReflectionRating(rating)}
                    className={`w-10 h-10 rounded-xl border text-sm font-bold font-mono transition-all ${
                      reflectionRating === rating
                        ? "bg-forge text-white border-forge shadow-glow scale-110"
                        : "bg-surface-card border-surface-border text-txt-muted hover:border-surface-border"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Notes */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-txt-muted">Accomplishment Notes</label>
              <Textarea
                placeholder="What did you complete or discover during this session?"
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                className="h-20 text-xs"
              />
            </div>

            <Button
              variant="forge"
              size="md"
              onClick={handleSaveReflection}
              isLoading={isSavingReflection}
              className="w-full font-bold shadow-glow"
            >
              <span>Save & Launch AI Flashcards</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Card>
        </div>
      )}

      {/* INTERACTIVE FLASHCARDS MODAL */}
      <FlashcardModal
        isOpen={flashcardModalOpen}
        topic={subTopic || topic || "Deep Work"}
        subjectName={activeSubject?.name}
        flashcards={sessionFlashcards}
        onClose={() => {
          setFlashcardModalOpen(false);
          setSessionState("idle");
          setActiveSession(null);
          router.push("/dashboard");
        }}
      />
    </AppShell>
  );
}

export default function FocusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-txt-primary">
          <div className="w-10 h-10 border-2 border-forge border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 font-mono text-xs text-forge uppercase tracking-wider">Loading Focus Mode...</p>
        </div>
      }
    >
      <FocusContent />
    </Suspense>
  );
}
