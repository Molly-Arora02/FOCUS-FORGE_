"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FocusHeatmap } from "@/components/ui/heatmap";
import { FireFlame } from "@/components/ui/fire-flame";
import {
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Bot,
} from "lucide-react";
import { formatMinutes, getGreeting, CURATED_QUOTES } from "@/lib/utils";
import { ProductivitySummary, HeatmapDayData, Task, Subject } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<ProductivitySummary | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapDayData[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // New Task Modal State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubjectId, setNewTaskSubjectId] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(25);
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("high");

  useEffect(() => {
    // Pick a deterministic quote based on day
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setQuoteIndex(dayOfYear % CURATED_QUOTES.length);

    async function loadDashboardData() {
      try {
        const userId = user?._id || "demo-user-123";
        const [sumRes, heatRes, taskRes, subRes] = await Promise.all([
          fetch(`/api/analytics/summary?userId=${userId}`),
          fetch(`/api/analytics/heatmap?userId=${userId}&days=60`),
          fetch(`/api/tasks?userId=${userId}`),
          fetch(`/api/subjects?userId=${userId}`),
        ]);

        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData.summary);
        }
        if (heatRes.ok) {
          const heatData = await heatRes.json();
          setHeatmap(heatData.heatmap || []);
        }
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          setTasks(taskData.tasks || []);
        }
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubjects(subData.subjects || []);
          if (subData.subjects?.length > 0) {
            setNewTaskSubjectId(subData.subjects[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          title: newTaskTitle.trim(),
          subjectId: newTaskSubjectId || undefined,
          estimatedDuration: Number(newTaskDuration) || 25,
          priority: newTaskPriority,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        setNewTaskTitle("");
        setIsAddTaskOpen(false);
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const activeQuote = CURATED_QUOTES[quoteIndex] || CURATED_QUOTES[0];

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header Greeting & Daily Principle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary">
              {getGreeting()},{" "}
              <span className="text-forge">{user?.displayName || "Molly"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary flex items-center gap-2">
              <span className="font-mono text-txt-muted">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="italic text-txt-secondary font-sans truncate max-w-md">
                &ldquo;{activeQuote.text}&rdquo;
              </span>
            </p>
          </div>

          {/* Quick Focus Mode Launcher Button */}
          <div className="flex items-center gap-3">
            <Link href="/focus">
              <Button variant="forge" size="md" className="font-bold shadow-glow hover:shadow-glow-lg">
                <Flame className="w-4 h-4 fill-current mr-1.5" />
                <span>Start Focus Session</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Focus Duration Today */}
          <div className="forge-glass-card p-5 rounded-2xl space-y-3 transition-all">
            <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
              <span>Today&apos;s Focus</span>
              <Clock className="w-4 h-4 text-forge" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-txt-primary">
                {formatMinutes(summary?.todayFocusedMinutes || 0)}
              </span>
              <span className="text-xs font-mono text-txt-muted">
                / {formatMinutes(summary?.todayTargetMinutes || 180)}
              </span>
            </div>
            {/* Target Progress Bar */}
            <div className="w-full bg-surface-card h-1.5 rounded-full overflow-hidden border border-surface-border">
              <div
                className="bg-forge h-full transition-all duration-300 shadow-glow"
                style={{ width: `${summary?.completionRatePercent || 0}%` }}
              />
            </div>
          </div>

          {/* Card 2: Completed Sessions */}
          <div className="forge-glass-card p-5 rounded-2xl space-y-3 transition-all">
            <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
              <span>Sessions Completed</span>
              <CheckCircle2 className="w-4 h-4 text-forge" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-txt-primary">
                {summary?.todaySessionsCount || 0}
              </span>
              <span className="text-xs text-forge font-mono font-medium">100% Verified</span>
            </div>
            <p className="text-[11px] text-txt-muted">Audited pure immersion blocks</p>
          </div>

          {/* Card 3: Active Streak */}
          <div className="forge-glass-card p-5 rounded-2xl space-y-3 transition-all">
            <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
              <span>Current Streak</span>
              <FireFlame size="sm" animate={(summary?.currentStreakDays ?? 0) > 0} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-txt-primary">
                {summary?.currentStreakDays ?? 0}{" "}
                <span className="text-sm font-sans font-normal text-txt-secondary">days</span>
              </span>
              <span className="text-xs font-mono text-txt-muted">
                Best: {summary?.longestStreakDays ?? 0}d
              </span>
            </div>
            <p className="text-[11px] text-txt-muted">Daily momentum sustained</p>
          </div>

          {/* Card 4: Total Points & Rank */}
          <div className="forge-glass-card p-5 rounded-2xl space-y-3 transition-all">
            <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
              <span>Forge Points</span>
              <Award className="w-4 h-4 text-forge" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-forge">
                {summary?.totalPoints || 0}
              </span>
              <span className="text-xs font-mono text-txt-muted">Novice Tier</span>
            </div>
            <p className="text-[11px] text-txt-muted">Auditable deterministic points</p>
          </div>
        </div>

        {/* Verified Activity Heatmap Section */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/60 pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-forge" />
                Verified Deep Work Activity Heatmap
              </CardTitle>
              <CardDescription className="text-xs">
                Each tile represents genuine, recorded focus duration. Intensity scales with completed session minutes.
              </CardDescription>
            </div>
            <Link href="/analytics" className="text-xs text-forge hover:underline font-mono">
              View Analytics →
            </Link>
          </div>

          <FocusHeatmap data={heatmap} />
        </Card>

        {/* Grid: Today's Actionable Plan + Focus Insights & Quick Triggers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Today's Action Agenda */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-forge" />
                    Today&apos;s Actionable Agenda
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Prioritized tasks and focus blocks for today
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddTaskOpen(true)}
                    className="text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Task
                  </Button>
                  <Link href="/planner">
                    <Button variant="secondary" size="sm" className="text-xs">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-forge" />
                      AI Plan
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center text-txt-muted text-xs border border-dashed border-surface-border rounded-xl space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-txt-muted/50" />
                    <p>No tasks scheduled for today.</p>
                    <Button
                      variant="forge"
                      size="sm"
                      onClick={() => setIsAddTaskOpen(true)}
                      className="mt-2"
                    >
                      Create First Task
                    </Button>
                  </div>
                ) : (
                  tasks.slice(0, 6).map((task) => {
                    const sub = subjects.find((s) => s._id === task.subjectId);
                    const isCompleted = task.status === "completed";

                    return (
                      <div
                        key={task._id}
                        className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                          isCompleted
                            ? "bg-surface-card/40 border-surface-border/40 opacity-70"
                            : "bg-surface-card border-surface-border hover:border-forge/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task._id, task.status)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isCompleted
                                ? "bg-forge text-surface-DEFAULT border-forge"
                                : "border-surface-border hover:border-forge/60 text-transparent"
                            }`}
                          >
                            ✓
                          </button>

                          <div className="space-y-1 min-w-0">
                            <p
                              className={`text-xs font-semibold truncate ${
                                isCompleted
                                  ? "line-through text-txt-muted"
                                  : "text-txt-primary"
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-txt-muted">
                              {sub && (
                                <span className="flex items-center gap-1 font-medium text-txt-secondary">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: sub.color }}
                                  />
                                  {sub.name}
                                </span>
                              )}
                              <span>•</span>
                              <span className="font-mono">{task.estimatedDuration}m</span>
                              {task.priority === "high" && (
                                <Badge variant="warning" size="sm" className="text-[9px] py-0 px-1.5">
                                  High
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isCompleted && (
                          <Link href={`/focus?taskId=${task._id}&subjectId=${task.subjectId || ""}&duration=${task.estimatedDuration}`}>
                            <Button variant="forge" size="sm" className="text-xs h-7 px-2.5 font-bold">
                              <Play className="w-3 h-3 fill-current mr-1" />
                              Focus
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Right 1 Col: Focus Insights & Quick Tools */}
          <div className="space-y-4">
            {/* Top Subject Card */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
                <span>Top Subject Velocity</span>
                <TrendingUp className="w-4 h-4 text-forge" />
              </div>

              {summary?.topSubject ? (
                <div className="p-3 rounded-xl bg-surface-hover/80 border border-surface-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: summary.topSubject.color }}
                      />
                      {summary.topSubject.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-forge">
                      {formatMinutes(summary.topSubject.minutes)}
                    </span>
                  </div>
                  <p className="text-[11px] text-txt-muted">Leading cognitive allocation this week</p>
                </div>
              ) : (
                <p className="text-xs text-txt-muted">No recorded subject sessions yet.</p>
              )}
            </Card>

            {/* AI Coach Quick Assist Card */}
            <Card className="p-5 space-y-3 border-forge/20 bg-gradient-to-b from-surface-card to-[#101613]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-txt-primary flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-forge" />
                  AI Focus Coach
                </span>
                <span className="text-[10px] font-mono text-forge bg-forge/15 px-2 py-0.5 rounded-full border border-forge/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-txt-secondary leading-relaxed">
                &ldquo;Ready to conquer your next block? I can break down heavy topics or optimize your remaining study hours.&rdquo;
              </p>
              <Link href="/ai-coach" className="block pt-1">
                <Button variant="secondary" size="sm" className="w-full text-xs font-semibold hover:border-forge/50">
                  <span>Chat with Coach</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 text-forge" />
                </Button>
              </Link>
            </Card>

            {/* Quick Actions Shortcuts */}
            <Card className="p-5 space-y-3">
              <span className="text-xs font-mono text-txt-muted uppercase">Productivity Hub</span>
              <div className="space-y-1.5">
                <Link
                  href="/resources"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-card border border-surface-border hover:border-forge/40 text-xs text-txt-secondary hover:text-txt-primary transition-all"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-forge" />
                    <span>Upload Timetable / Syllabus</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-txt-muted" />
                </Link>

                <Link
                  href="/rewards"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-card border border-surface-border hover:border-forge/40 text-xs text-txt-secondary hover:text-txt-primary transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-status-warning" />
                    <span>View Milestone Rewards</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-txt-muted" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                <Plus className="w-4 h-4 text-forge" />
                Add New Task to Agenda
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                className="text-txt-muted hover:text-txt-primary text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Implement Graph BFS in TypeScript"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-xl bg-surface-card border border-surface-border px-3 py-2 text-xs text-txt-primary outline-none focus:border-forge"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Subject</label>
                  <select
                    value={newTaskSubjectId}
                    onChange={(e) => setNewTaskSubjectId(e.target.value)}
                    className="w-full rounded-xl bg-surface-card border border-surface-border px-3 py-2 text-xs text-txt-primary outline-none focus:border-forge"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className="w-full rounded-xl bg-surface-card border border-surface-border px-3 py-2 text-xs text-txt-primary outline-none focus:border-forge"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                        newTaskPriority === p
                          ? "bg-forge/15 border-forge text-forge"
                          : "bg-surface-card border-surface-border text-txt-muted hover:border-surface-border"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="forge" size="sm" className="font-bold">
                  Save Task
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
