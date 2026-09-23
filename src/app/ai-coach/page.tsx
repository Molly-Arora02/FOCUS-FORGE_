"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Play,
  Calendar,
  Layers,
  Flame,
  User,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { AIChatMessage } from "@/types";
import { soundEngine } from "@/lib/audio/sound-engine";
import { useRouter } from "next/navigation";

export default function AICoachPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoiceMode, setActiveVoiceMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedPrompts = [
    "Plan my remaining day based on active goals",
    "I'm feeling distracted and procrastinating",
    "How should I structure my exam review sessions?",
    "Break down a complex programming task into sprints",
    "What binaural sound frequency is best for focus?",
  ];

  // Speak coach message using SpeechSynthesis
  const speakText = React.useCallback((text: string) => {
    if (!speechSynthesisEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown asterisks and hash tags for natural speech
    const cleanSpeech = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/- /g, ". ")
      .replace(/\[.*?\]\(.*?\)/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose high quality English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Karen")) && v.lang.startsWith("en")
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speechSynthesisEnabled]);

  const handleSendMessage = React.useCallback(async (textToSend?: string) => {
    const messageContent = textToSend || inputMessage;
    if (!messageContent.trim() || loading) return;

    soundEngine.playChime("click");

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          message: messageContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [...prev, data.reply]);
          soundEngine.playChime("reward");
          if (speechSynthesisEnabled) {
            speakText(data.reply.content);
          }
        }
      }
    } catch (err) {
      console.error("Error communicating with AI coach:", err);
    } finally {
      setLoading(false);
    }
  }, [inputMessage, loading, user, speechSynthesisEnabled, speakText]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          soundEngine.playChime("click");
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [handleSendMessage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (isSpeaking && typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech recognition start failed", err);
      }
    }
  };

  const toggleSpeechOutput = () => {
    if (isSpeaking && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSpeechSynthesisEnabled(!speechSynthesisEnabled);
  };

  useEffect(() => {
    async function loadChat() {
      const userId = user?._id || "demo-user-123";
      try {
        const res = await fetch(`/api/ai/chat?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversation?.messages && data.conversation.messages.length > 0) {
            setMessages(data.conversation.messages);
          } else {
            setMessages([
              {
                id: "welcome-1",
                sender: "coach",
                content: `👋 Greetings! I'm your **Real-Time AI Focus Coach**.\n\nI have live telemetry on your daily sessions, goals, and energy rhythm. You can talk to me directly using your **Microphone** or select quick action prompts below.\n\nHow can we maximize your momentum right now?`,
                timestamp: new Date().toISOString(),
                suggestedActions: [
                  { label: "⚡ Start 25m Focus Block", action: "start_focus", payload: { duration: 25 } },
                  { label: "📅 Plan Today's Schedule", action: "open_planner" },
                  { label: "🗂️ Interactive Study Decks", action: "open_resources" },
                ],
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Chat load error:", err);
      }
    }
    loadChat();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleActionClick = (actionObj: { label: string; action: string; payload?: any }) => {
    soundEngine.playChime("click");

    if (actionObj.action === "start_focus") {
      const duration = actionObj.payload?.duration || 25;
      router.push(`/focus?duration=${duration}`);
    } else if (actionObj.action === "open_planner") {
      router.push("/planner");
    } else if (actionObj.action === "open_resources") {
      router.push("/resources");
    } else if (actionObj.action === "open_analytics") {
      router.push("/analytics");
    } else if (actionObj.action === "play_audio") {
      const type = actionObj.payload?.type || "binaural-gamma";
      soundEngine.startAmbient(type as any, 0.4);
      router.push(`/focus?ambient=${type}`);
    } else {
      handleSendMessage(actionObj.label);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Header with Live Voice Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/80 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forge opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-forge"></span>
              </span>
              <Bot className="w-6 h-6 text-forge" />
              Real-Time AI Focus Coach
            </h1>
            <p className="text-xs text-txt-secondary">
              Voice-interactive cognitive coach, intelligent goal decomposition, and instant focus launcher.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice Output Toggle */}
            <button
              type="button"
              onClick={toggleSpeechOutput}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                speechSynthesisEnabled
                  ? "bg-forge/15 border-forge text-forge shadow-glow"
                  : "bg-surface border-surface-border text-txt-muted hover:text-txt-primary"
              }`}
              title={speechSynthesisEnabled ? "AI Voice is Enabled (Click to mute)" : "AI Voice is Muted (Click to enable)"}
            >
              {speechSynthesisEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>{speechSynthesisEnabled ? "Voice On" : "Voice Off"}</span>
            </button>

            <Badge variant="forge" size="sm" className="font-mono">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              LIVE TELEMETRY
            </Badge>
          </div>
        </div>

        {/* Voice Orb & Audio Waveform Visualizer Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-forge/10 via-surface-card to-accent-blue/10 border border-surface-border backdrop-blur-md flex items-center justify-between shadow-glow-card">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-red-500/50 scale-105"
                  : "bg-forge text-surface-DEFAULT hover:scale-105 shadow-forge/40"
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <div>
              <div className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                {isListening ? (
                  <span className="text-red-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    Listening to your voice...
                  </span>
                ) : isSpeaking ? (
                  <span className="text-forge font-mono flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    Coach is speaking...
                  </span>
                ) : (
                  <span className="text-txt-secondary">Voice Input Available (Click mic or type)</span>
                )}
              </div>
              <p className="text-[11px] text-txt-muted">
                Hands-free voice coaching & instant schedule generation
              </p>
            </div>
          </div>

          {/* Animated Waveform Visualizer Bars */}
          <div className="flex items-center gap-1 h-8 px-3">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening
                    ? "bg-red-400 animate-bounce"
                    : isSpeaking
                    ? "bg-forge animate-pulse"
                    : "bg-surface-border"
                }`}
                style={{
                  height: isListening || isSpeaking ? `${height}%` : "20%",
                  animationDelay: `${i * 70}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Chat History Card */}
        <Card className="p-4 sm:p-6 h-[560px] flex flex-col justify-between bg-surface-card/90 backdrop-blur-xl border-surface-border shadow-glow-card">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-forge/20 to-forge/5 border border-forge/40 flex items-center justify-center text-forge shrink-0 shadow-glow">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`p-4 sm:p-5 rounded-2xl max-w-2xl space-y-3 ${
                      isUser
                        ? "bg-gradient-to-r from-forge to-emerald-400 text-surface-DEFAULT font-medium rounded-tr-sm shadow-md"
                        : "bg-surface-hover/90 border border-surface-border text-txt-primary rounded-tl-sm shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content.split("\n").map((line, idx) => {
                        // Highlight markdown headers or bullet points cleanly
                        if (line.startsWith("- ") || line.startsWith("* ")) {
                          return (
                            <div key={idx} className="flex items-start gap-1.5 my-1">
                              <span className="text-forge font-bold">•</span>
                              <span>{line.substring(2)}</span>
                            </div>
                          );
                        }
                        return <div key={idx} className="min-h-[1rem]">{line}</div>;
                      })}
                    </div>

                    {/* Interactive Action Chips */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="pt-3 border-t border-surface-border/60 flex flex-wrap gap-2">
                        {m.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleActionClick(action)}
                            className="px-3 py-1.5 rounded-xl bg-surface/90 border border-forge/40 text-forge font-bold text-[11px] hover:bg-forge hover:text-surface-DEFAULT transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className={isUser ? "text-surface-DEFAULT/80" : "text-txt-muted"}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => speakText(m.content)}
                          className="text-txt-muted hover:text-forge flex items-center gap-1 transition-colors"
                          title="Read message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Speak</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-surface-border/80 flex items-center justify-center text-txt-primary shrink-0 border border-surface-border">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-9 h-9 rounded-2xl bg-forge/20 border border-forge/40 flex items-center justify-center text-forge shrink-0 animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-surface-hover border border-surface-border text-txt-muted rounded-tl-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-forge animate-bounce" />
                  <div className="w-2.5 h-2.5 rounded-full bg-forge animate-bounce delay-100" />
                  <div className="w-2.5 h-2.5 rounded-full bg-forge animate-bounce delay-200" />
                  <span className="font-mono text-[11px] text-forge ml-1">Synthesizing personalized study strategy...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Quick Bar */}
          <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-3.5 py-1.5 rounded-full bg-surface-hover/80 border border-surface-border hover:border-forge/60 text-txt-secondary hover:text-txt-primary text-[11px] whitespace-nowrap transition-all shadow-sm active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-2 border-t border-surface-border/60"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                  : "bg-surface-hover border-surface-border text-txt-secondary hover:text-forge hover:border-forge"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak to AI Coach"}
            >
              <Mic className="w-5 h-5" />
            </button>

            <Input
              placeholder="Ask your coach anything about study strategy, friction recovery, or schedule..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="text-xs bg-surface/80 focus:ring-forge/50"
            />

            <Button
              type="submit"
              variant="forge"
              size="md"
              disabled={!inputMessage.trim() || loading}
              className="font-bold shadow-glow"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
