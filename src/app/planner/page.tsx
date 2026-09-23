"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  Play,
  ArrowRight,
  Sliders,
  SplitSquareVertical,
  Check,
} from "lucide-react";
import { DailyPlan, Goal, Subject, Task } from "@/types";
import { formatMinutes, getTodayDateString } from "@/lib/utils";
import Link from "next/link";

export default function PlannerPage() {
  const { user } = useAuth();

  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString(user?.timezone));
  const [availableHours, setAvailableHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // Goal Decomposition Modal
  const [decomposeModalOpen, setDecomposeModalOpen] = useState(false);
  const [decomposeTopic, setDecomposeTopic] = useState("");
  const [decomposedTasks, setDecomposedTasks] = useState<any[]>([]);
  const [decomposing, setDecomposing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const userId = user?._id || "demo-user-123";
      try {
        const [goalRes, subRes] = await Promise.all([
          fetch(`/api/goals?userId=${userId}`),
          fetch(`/api/subjects?userId=${userId}`),
        ]);
        if (goalRes.ok) {
          const gData = await goalRes.json();
          setGoals(gData.goals || []);
        }
        if (subRes.ok) {
          const sData = await subRes.json();
          setSubjects(sData.subjects || []);
        }

        // Auto generate/fetch initial plan
        await fetchOrGeneratePlan(selectedDate);
      } catch (err) {
        console.error("Planner load error:", err);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrGeneratePlan = async (targetDate: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          dateStr: targetDate,
          availableHours,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
      }
    } catch (err) {
      console.error("Error generating plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPlan = async () => {
    if (!plan) return;
    setAccepting(true);
    try {
      // Pushes non-break tasks into user's live task agenda
      for (const t of plan.tasks) {
        if (!t.isBreak) {
          await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?._id || "demo-user-123",
              title: t.title,
              subjectId: t.subjectId,
              estimatedDuration: t.durationMinutes,
              priority: t.priority,
            }),
          });
        }
      }
      setAcceptedSuccess(true);
      setTimeout(() => setAcceptedSuccess(false), 3000);
    } catch (err) {
      console.error("Error accepting plan:", err);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecompose = async () => {
    if (!decomposeTopic.trim()) return;
    setDecomposing(true);
    try {
      // Simulate/call goal decomposition
      const len = user?.preferences?.preferredSessionLength || 25;
      setTimeout(() => {
        setDecomposedTasks([
          { title: `Phase 1: Conceptual Foundations for ${decomposeTopic}`, duration: len, priority: "high" },
          { title: `Phase 2: Core Deep Implementation & Exercises`, duration: len * 2, priority: "high" },
          { title: `Phase 3: Active Recall & Edge Case Drills`, duration: len, priority: "medium" },
          { title: `Phase 4: Synthesis & Flashcard Review`, duration: len, priority: "low" },
        ]);
        setDecomposing(false);
      }, 500);
    } catch (err) {
      console.error("Decomposition error:", err);
      setDecomposing(false);
    }
  };

  const addDecomposedTaskToAgenda = async (taskItem: any) => {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          title: taskItem.title,
          estimatedDuration: taskItem.duration,
          priority: taskItem.priority,
        }),
      });
      alert(`Added "${taskItem.title}" to your daily agenda!`);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <CalendarIcon className="w-7 h-7 text-forge" />
              AI Daily Blueprint Planner
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary">
              Sequences your active goals into high-leverage focus blocks calibrated to your available hours.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDecomposeModalOpen(true)}
              className="text-xs"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 mr-1.5 text-forge" />
              Decompose Topic
            </Button>
            <Button
              variant="forge"
              size="sm"
              onClick={() => fetchOrGeneratePlan(selectedDate)}
              isLoading={loading}
              className="font-bold shadow-glow"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Regenerate Plan
            </Button>
          </div>
        </div>

        {/* Controls & Constraints Strip */}
        <Card className="p-5 flex flex-wrap items-center justify-between gap-4 bg-surface-card border-surface-border">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-txt-muted font-mono uppercase">Target Date:</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  fetchOrGeneratePlan(e.target.value);
                }}
                className="w-36 py-1 h-8 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-txt-muted font-mono uppercase">Available Hours Today:</span>
              <select
                value={availableHours}
                onChange={(e) => {
                  const hrs = Number(e.target.value);
                  setAvailableHours(hrs);
                }}
                className="bg-surface-card border border-surface-border rounded-xl px-2.5 py-1 text-xs text-txt-primary outline-none focus:border-forge font-mono h-8"
              >
                <option value={2}>2 Hours</option>
                <option value={3}>3 Hours</option>
                <option value={4}>4 Hours</option>
                <option value={6}>6 Hours</option>
                <option value={8}>8 Hours</option>
              </select>
            </div>
          </div>

          {/* Accept / Sync Button */}
          <div className="flex items-center gap-2">
            {acceptedSuccess && (
              <span className="text-xs text-forge font-mono flex items-center gap-1">
                <Check className="w-4 h-4" />
                Synced to Dashboard Agenda!
              </span>
            )}
            <Button
              variant="forge"
              size="sm"
              onClick={handleAcceptPlan}
              isLoading={accepting}
              className="font-bold shadow-glow"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Accept & Push to Agenda
            </Button>
          </div>
        </Card>

        {/* AI Plan Blueprint View */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-forge border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-forge tracking-wider uppercase">
              Sequencing multi-goal focus blocks with cognitive buffers...
            </p>
          </div>
        ) : plan ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Timeline Schedule */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-forge" />
                      Sequenced Daily Timeline
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Planned Total: {formatMinutes(plan.totalPlannedMinutes)} • {plan.tasks.filter((t) => !t.isBreak).length} Deep Work Blocks
                    </CardDescription>
                  </div>
                  <Badge variant="forge" size="sm" className="font-mono">
                    AI OPTIMIZED
                  </Badge>
                </div>

                {/* Timeline Tasks */}
                <div className="space-y-3">
                  {plan.tasks?.map((t, idx) => {
                    const isBreak = t.isBreak;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isBreak
                            ? "bg-surface-hover/40 border-dashed border-surface-border/70 text-txt-muted"
                            : "bg-surface-card border-surface-border hover:border-forge/50 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Time Badge */}
                          <div className="flex flex-col items-center justify-center w-16 text-center shrink-0">
                            <span className="text-xs font-mono font-bold text-forge">{t.startTime}</span>
                            <span className="text-[10px] font-mono text-txt-muted">{t.endTime}</span>
                          </div>

                          <div className="w-px h-8 bg-surface-border shrink-0" />

                          <div className="space-y-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isBreak ? "text-txt-secondary italic" : "text-txt-primary"}`}>
                              {t.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-txt-muted">
                              {t.subjectName && (
                                <span className="text-txt-secondary font-medium">{t.subjectName}</span>
                              )}
                              <span>•</span>
                              <span className="font-mono">{t.durationMinutes} mins</span>
                              {t.breakActivity && (
                                <span className="text-[10px] text-forge/80 italic">{t.breakActivity}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isBreak && (
                          <Link href={`/focus?duration=${t.durationMinutes}&topic=${encodeURIComponent(t.title)}`}>
                            <Button variant="forge" size="sm" className="h-8 px-3 text-xs font-bold shrink-0">
                              <Play className="w-3 h-3 fill-current mr-1" />
                              Launch
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right 1 Col: Cognitive Rationale & Goals Addressed */}
            <div className="space-y-4">
              <Card className="p-5 space-y-3">
                <span className="text-xs font-mono text-txt-muted uppercase">Plan Rationale & Strategy</span>
                <p className="text-xs text-txt-secondary leading-relaxed bg-surface-hover/60 p-3.5 rounded-xl border border-surface-border">
                  {plan.explanation}
                </p>
              </Card>

              <Card className="p-5 space-y-3">
                <span className="text-xs font-mono text-txt-muted uppercase">Goals Progressed in this Plan</span>
                <div className="space-y-2">
                  {goals.map((g) => (
                    <div
                      key={g._id}
                      className="p-3 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-forge" />
                        <span className="font-medium text-txt-primary truncate">{g.title}</span>
                      </div>
                      <Badge variant="outline" size="sm" className="text-[10px] font-mono">
                        {g.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </div>

      {/* Goal Decomposition Modal */}
      {decomposeModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-5 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                <SplitSquareVertical className="w-4 h-4 text-forge" />
                AI Goal & Topic Decomposition
              </h3>
              <button
                type="button"
                onClick={() => setDecomposeModalOpen(false)}
                className="text-txt-muted hover:text-txt-primary text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-txt-secondary">
                Enter any massive subject or goal. The AI will break it down into atomic 25-50m focus phases.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Master Distributed Consensus & Paxos"
                  value={decomposeTopic}
                  onChange={(e) => setDecomposeTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDecompose()}
                />
                <Button variant="forge" size="md" onClick={handleDecompose} isLoading={decomposing}>
                  Decompose
                </Button>
              </div>
            </div>

            {decomposedTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-surface-border max-h-60 overflow-y-auto">
                <span className="text-xs font-mono text-txt-muted uppercase">Generated Sprints</span>
                {decomposedTasks.map((taskItem, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between text-xs gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-txt-primary truncate">{taskItem.title}</p>
                      <p className="text-[10px] text-txt-muted font-mono">{taskItem.duration}m sprint</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addDecomposedTaskToAgenda(taskItem)}
                      className="text-xs h-7 px-2.5 shrink-0"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add to Plan
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </AppShell>
  );
}
