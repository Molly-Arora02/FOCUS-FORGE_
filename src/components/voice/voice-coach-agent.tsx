"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceCoachAgentProps {
  userId: string;
  currentSubject?: string;
  currentTopic?: string;
  onClose?: () => void;
}

export const VoiceCoachAgent: React.FC<VoiceCoachAgentProps> = ({
  userId,
  currentSubject,
  currentTopic,
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState(
    `I'm your Forge Voice Assistant. Ask me to quiz you on ${currentTopic || "your topic"}, explain a tricky concept, or guide you through a focus check-in.`
  );
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setHasSpeechSupport(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        sendVoiceQuery(transcript);
      }
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn("Recognition already active");
      }
    }
  };

  const sendVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "demo-user-123",
          message: `[Voice Query in Session for ${currentSubject || "Study"} - ${currentTopic || "General"}]: ${queryText}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply?.content || "Understood. Keep pushing through your focus block!";
        setLastResponse(replyText);
        speakText(replyText);
      }
    } catch (err) {
      console.error("Voice coach error:", err);
    }
  };

  return (
    <div className="rounded-2xl bg-surface-card/95 border border-forge/40 p-4 space-y-3 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forge/20 border border-forge/50 flex items-center justify-center text-forge shadow-glow">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-txt-primary">AI Voice Coach Companion</p>
            <p className="text-[10px] text-txt-muted font-mono">Live Spoken Interaction</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-hover text-txt-muted hover:text-txt-primary text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Soundwave / Visual Status */}
      <div className="p-3.5 rounded-xl bg-surface border border-surface-border text-center space-y-2.5">
        <div className="flex items-center justify-center gap-1 h-8">
          {[40, 70, 90, 60, 100, 50, 80, 45, 95, 30].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isSpeaking
                  ? "bg-forge animate-pulse shadow-glow"
                  : isListening
                  ? "bg-ember animate-bounce"
                  : "bg-[#2A1A1D]"
              }`}
              style={{
                height: isSpeaking || isListening ? `${Math.max(15, h)}%` : "20%",
                animationDelay: `${i * 70}ms`,
              }}
            />
          ))}
        </div>

        <p className="text-[11px] font-mono text-txt-secondary leading-snug max-h-24 overflow-y-auto">
          {isListening ? (
            <span className="text-ember font-bold">Listening: &ldquo;{transcript || "Say your question..."}&rdquo;</span>
          ) : isSpeaking ? (
            <span className="text-forge font-semibold">Speaking...</span>
          ) : (
            lastResponse
          )}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant={isListening ? "danger" : "forge"}
          size="sm"
          onClick={handleToggleListen}
          className="flex-1 font-bold text-xs shadow-glow"
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5 mr-1.5" />
              Done Speaking
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 mr-1.5" />
              Ask with Voice
            </>
          )}
        </Button>

        {isSpeaking && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.speechSynthesis?.cancel()}
            className="text-xs h-8 px-2.5 text-txt-muted hover:text-txt-primary"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
