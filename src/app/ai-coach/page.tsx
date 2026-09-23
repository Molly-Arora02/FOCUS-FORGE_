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
  Flame,
  Calendar,
  Layers,
  ArrowRight,
  User,
  ShieldCheck,
} from "lucide-react";
import { AIChatMessage, AIConversation } from "@/types";
import Link from "next/link";

export default function AICoachPage() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    "Plan my remaining day based on active goals",
    "Why did I struggle to finish today's tasks?",
    "Break down Graph Dynamic Programming into 30m blocks",
    "How should I structure my exam review sessions?",
    "Summarize my focus streak and weekly progress",
  ];

  useEffect(() => {
    async function loadChat() {
      const userId = user?._id || "demo-user-123";
      try {
        const res = await fetch(`/api/ai/chat?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversation?.messages) {
            setMessages(data.conversation.messages);
          } else {
            // Initial starter welcome message from coach
            setMessages([
              {
                id: "welcome-1",
                sender: "coach",
                content: `Welcome to Focus Forge. I'm your **Personal AI Focus Coach**. I have active context on your goals, today's focus hours, and your preferred **${
                  user?.preferences?.coachingStyle || "empathetic"
                }** coaching rhythm.\n\nHow can I help engineer your momentum today?`,
                timestamp: new Date().toISOString(),
                suggestedActions: [
                  { label: "Plan Remaining Day", action: "plan_day" },
                  { label: "Break Down a Complex Topic", action: "decompose" },
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

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || inputMessage;
    if (!messageContent.trim() || loading) return;

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
        }
      }
    } catch (err) {
      console.error("Error communicating with AI coach:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border/80 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <Bot className="w-6 h-6 text-forge" />
              AI Focus Coach
            </h1>
            <p className="text-xs text-txt-secondary">
              Real-time cognitive guidance, friction recovery, and contextual goal decomposition.
            </p>
          </div>

          <Badge variant="forge" size="sm" className="font-mono">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            CONTEXT-AWARE
          </Badge>
        </div>

        {/* Chat History Container */}
        <Card className="p-4 sm:p-6 h-[550px] flex flex-col justify-between bg-surface-card border-surface-border shadow-glow-card">
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
                    <div className="w-8 h-8 rounded-xl bg-forge/15 border border-forge/30 flex items-center justify-center text-forge shrink-0 shadow-glow">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-xl space-y-2.5 ${
                      isUser
                        ? "bg-forge text-surface-DEFAULT font-medium rounded-tr-sm"
                        : "bg-surface-hover border border-surface-border text-txt-primary rounded-tl-sm shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Suggested Action Chips */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-surface-border/50 flex flex-wrap gap-2">
                        {m.suggestedActions.map((action, i) => (
                          <Link key={i} href="/focus">
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-lg bg-surface border border-forge/40 text-forge font-semibold text-[11px] hover:bg-forge hover:text-surface-DEFAULT transition-all flex items-center gap-1 shadow-glow"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{action.label}</span>
                            </button>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className={`text-[10px] font-mono ${isUser ? "text-surface-DEFAULT/70" : "text-txt-muted"}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-surface-border flex items-center justify-center text-txt-primary shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-8 h-8 rounded-xl bg-forge/15 border border-forge/30 flex items-center justify-center text-forge shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-surface-hover border border-surface-border text-txt-muted rounded-tl-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-forge animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-forge animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-forge animate-bounce delay-200" />
                  <span className="font-mono text-[11px] text-forge ml-1">Analyzing schedule context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Pill Bar */}
          <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 rounded-full bg-surface-hover border border-surface-border hover:border-forge/50 text-txt-secondary hover:text-txt-primary text-[11px] whitespace-nowrap transition-all"
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
            <Input
              placeholder="Ask your coach anything about your study strategy, focus recovery, or daily schedule..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="text-xs"
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
