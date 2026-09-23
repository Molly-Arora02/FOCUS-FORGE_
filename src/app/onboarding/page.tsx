"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import {
  User,
  Target,
  Clock,
  BookOpen,
  AlertTriangle,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  // Step 1: Personal Details
  const [displayName, setDisplayName] = useState(user?.displayName || "Alex Rivera");
  const [role, setRole] = useState<"student" | "professional" | "self_learner" | "other">(user?.role || "student");
  const [timezone, setTimezone] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York");
  const [ageRange, setAgeRange] = useState("21-25");

  // Step 2: Goals
  const [goals, setGoals] = useState([
    { title: "Master Core Algorithms & System Design", category: "skill", weeklyTargetHours: 8, priority: "high" },
    { title: "Maintain Daily Deep Work Habit", category: "habit", weeklyTargetHours: 12, priority: "high" },
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState("");

  // Step 3: Routine
  const [wakeTime, setWakeTime] = useState("07:30");
  const [sleepTime, setSleepTime] = useState("23:30");
  const [preferredFocusStart, setPreferredFocusStart] = useState("09:00");
  const [preferredFocusEnd, setPreferredFocusEnd] = useState("18:00");
  const [preferredSessionLength, setPreferredSessionLength] = useState(25);

  // Step 4: Subjects & Skills
  const [subjects, setSubjects] = useState([
    { name: "Algorithms & Data Structures", color: "#43F59A", icon: "Code", estimatedWeeklyHours: 8, topics: ["Dynamic Programming", "Graphs"] },
    { name: "System Architecture", color: "#47B5FF", icon: "Server", estimatedWeeklyHours: 6, topics: ["Distributed Logs", "Caching"] },
  ]);
  const [newSubjectName, setNewSubjectName] = useState("");

  // Step 5: Challenges
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([
    "Phone distractions & notifications",
    "Procrastination on complex tasks",
  ]);

  const challengeOptions = [
    "Phone distractions & notifications",
    "Social media & algorithmic feeds",
    "Procrastination on complex tasks",
    "Unclear daily priorities",
    "Fatigue & mental fog",
    "Difficulty returning after interruptions",
  ];

  // Step 6: Personalization & AI Tone
  const [coachingStyle, setCoachingStyle] = useState<"empathetic" | "direct" | "socratic" | "enthusiastic">("empathetic");
  const [cameraConsent, setCameraConsent] = useState(false);
  const [dailyFocusTarget, setDailyFocusTarget] = useState(180); // 3h

  // Step 7: Starter Plan
  const [starterPlan, setStarterPlan] = useState<any>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const toggleChallenge = (item: string) => {
    if (selectedChallenges.includes(item)) {
      setSelectedChallenges(selectedChallenges.filter((c) => c !== item));
    } else {
      setSelectedChallenges([...selectedChallenges, item]);
    }
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    setGoals([...goals, { title: newGoalTitle.trim(), category: "skill", weeklyTargetHours: 6, priority: "high" }]);
    setNewGoalTitle("");
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const colors = ["#43F59A", "#47B5FF", "#FFB547", "#B1FFD0"];
    const randomColor = colors[subjects.length % colors.length];
    setSubjects([
      ...subjects,
      {
        name: newSubjectName.trim(),
        color: randomColor,
        icon: "BookOpen",
        estimatedWeeklyHours: 5,
        topics: ["Core Concepts"],
      },
    ]);
    setNewSubjectName("");
  };

  const generateStarterPlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          availableHours: Math.round(dailyFocusTarget / 60),
        }),
      });
      const data = await res.json();
      setStarterPlan(data.plan);
    } catch (err) {
      console.error("Error generating starter plan:", err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 6) {
      setStep(7);
      await generateStarterPlan();
    } else if (step < 7) {
      setStep(step + 1);
    } else {
      // Step 7: Finish onboarding and save
      setSubmitting(true);
      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authUserId: user?.authUserId || user?._id || "demo-user-123",
            email: user?.email,
            displayName,
            role,
            timezone,
            preferences: {
              preferredSessionLength,
              preferredFocusHours: { start: preferredFocusStart, end: preferredFocusEnd },
              coachingStyle,
              cameraFocusEnabled: cameraConsent,
              dailyFocusTargetMinutes: dailyFocusTarget,
            },
            goals,
            subjects,
          }),
        });

        await refreshProfile();
        router.push("/dashboard");
      } catch (err) {
        console.error("Error completing onboarding:", err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-txt-primary flex flex-col justify-center items-center p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-glow-radial pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl space-y-6">
        {/* Header & Step Indicator */}
        <div className="text-center space-y-3">
          <Logo size="md" showWordmark href="/" className="justify-center" />
          <div className="flex items-center justify-between text-xs font-mono text-txt-muted max-w-xs mx-auto pt-2">
            <span>STEP {step} OF 7</span>
            <span className="text-forge font-bold">{Math.round((step / 7) * 100)}% COMPLETE</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-card h-1.5 rounded-full overflow-hidden border border-surface-border">
            <div
              className="bg-forge h-full transition-all duration-300 shadow-glow"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Body by Step */}
        <Card className="p-6 md:p-8 space-y-6 shadow-glow-card">
          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                  <User className="w-5 h-5 text-forge" />
                  Tell us about yourself
                </h2>
                <p className="text-xs text-txt-secondary">
                  We&apos;ll personalize your daily schedules and coaching pace accordingly.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Rivera"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Primary Focus Role</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: "student", label: "University Student" },
                      { key: "professional", label: "Working Professional" },
                      { key: "self_learner", label: "Self-Learner / Builder" },
                      { key: "other", label: "Researcher / Other" },
                    ].map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setRole(r.key as any)}
                        className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                          role === r.key
                            ? "bg-forge/15 border-forge text-forge shadow-glow"
                            : "bg-surface-card border-surface-border text-txt-secondary hover:border-forge/40"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Time Zone</label>
                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Age Range (Optional)</label>
                    <Input value={ageRange} onChange={(e) => setAgeRange(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GOALS */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                  <Target className="w-5 h-5 text-forge" />
                  What major goals are you forging?
                </h2>
                <p className="text-xs text-txt-secondary">
                  Focus Forge breaks these down into weekly targets and daily focus sessions.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Master Distributed Systems, Prepare for Google Interview"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
                  />
                  <Button type="button" variant="forge" size="md" onClick={addGoal}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {goals.map((g, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-forge" />
                        <span className="font-semibold text-txt-primary">{g.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-txt-muted font-mono">{g.weeklyTargetHours}h/wk</span>
                        <button
                          type="button"
                          onClick={() => removeGoal(i)}
                          className="text-txt-muted hover:text-status-error"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ROUTINE & FOCUS HOURS */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-forge" />
                  Your daily routine & peak focus rhythm
                </h2>
                <p className="text-xs text-txt-secondary">
                  We will never schedule intense work during your sleep or blocked periods.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Typical Wake-Up</label>
                    <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Typical Sleep</label>
                    <Input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Preferred Session Duration</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { len: 25, label: "25m Sprint", desc: "Classic Pomodoro" },
                      { len: 45, label: "45m Deep Work", desc: "Balanced Flow" },
                      { len: 60, label: "60m Immersion", desc: "Extended Focus" },
                    ].map((p) => (
                      <button
                        key={p.len}
                        type="button"
                        onClick={() => setPreferredSessionLength(p.len)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          preferredSessionLength === p.len
                            ? "bg-forge/15 border-forge text-forge shadow-glow"
                            : "bg-surface-card border-surface-border text-txt-secondary hover:border-forge/40"
                        }`}
                      >
                        <p className="text-xs font-bold">{p.label}</p>
                        <p className="text-[10px] text-txt-muted mt-0.5">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUBJECTS & SKILLS */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-forge" />
                  Your Subjects & Learning Areas
                </h2>
                <p className="text-xs text-txt-secondary">
                  Organize your sessions and heatmaps with color-coded subject tags.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Distributed Systems, Machine Learning, UI Design"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                  />
                  <Button type="button" variant="forge" size="md" onClick={addSubject}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {subjects.map((sub, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                        <span className="font-semibold text-txt-primary">{sub.name}</span>
                      </div>
                      <span className="text-txt-muted font-mono">{sub.estimatedWeeklyHours} hrs/wk</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DISTRACTION DIAGNOSIS */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-status-warning" />
                  What makes consistency difficult right now?
                </h2>
                <p className="text-xs text-txt-secondary">
                  Your AI Coach uses this to anticipate obstacles and suggest recovery routines.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {challengeOptions.map((c) => {
                  const isChecked = selectedChallenges.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleChallenge(c)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? "bg-status-warning/10 border-status-warning/40 text-txt-primary shadow-glow"
                          : "bg-surface-card border-surface-border text-txt-secondary hover:border-surface-border"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked ? "bg-status-warning text-surface-DEFAULT border-status-warning" : "border-surface-border"
                      }`}>
                        {isChecked && "✓"}
                      </span>
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: PERSONALIZATION & AI TONE */}
          {step === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-forge" />
                  Personalization & AI Coach Tone
                </h2>
                <p className="text-xs text-txt-secondary">
                  Configure how your AI companion communicates and guides you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Preferred Coaching Style</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: "empathetic", label: "Empathetic & Supportive", desc: "Focuses on encouragement and positive friction recovery." },
                      { key: "direct", label: "Direct & Structured", desc: "Action-oriented, concise, and no-nonsense accountability." },
                      { key: "socratic", label: "Socratic Questioning", desc: "Guides you through thoughtful reflection prompts." },
                      { key: "enthusiastic", label: "High-Energy Hype", desc: "Celebrates every completed block with high intensity." },
                    ].map((style) => (
                      <button
                        key={style.key}
                        type="button"
                        onClick={() => setCoachingStyle(style.key as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          coachingStyle === style.key
                            ? "bg-forge/15 border-forge text-forge shadow-glow"
                            : "bg-surface-card border-surface-border text-txt-secondary hover:border-forge/40"
                        }`}
                      >
                        <p className="text-xs font-bold">{style.label}</p>
                        <p className="text-[10px] text-txt-muted mt-1 leading-snug">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-hover/80 border border-surface-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-txt-primary">On-Device Camera Attention Cue (Optional)</p>
                      <p className="text-[11px] text-txt-muted">Client-side face presence indicator. No video is ever stored or transmitted.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={cameraConsent}
                      onChange={(e) => setCameraConsent(e.target.checked)}
                      className="w-4 h-4 rounded accent-forge cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: GENERATED STARTER PLAN REVIEW */}
          {step === 7 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-forge" />
                  Your AI Starter Daily Plan
                </h2>
                <p className="text-xs text-txt-secondary">
                  Here is your generated day schedule based on your routine and priority goals.
                </p>
              </div>

              {generatingPlan ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-forge border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono text-forge">Synthesizing personalized daily blueprint...</p>
                </div>
              ) : starterPlan ? (
                <div className="space-y-3">
                  <p className="text-xs text-txt-secondary bg-surface-card p-3 rounded-xl border border-surface-border leading-relaxed">
                    {starterPlan.explanation}
                  </p>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {starterPlan.tasks?.map((t: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          t.isBreak
                            ? "bg-surface-hover/40 border-surface-border/50 text-txt-muted"
                            : "bg-surface-card border-surface-border text-txt-primary"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-forge font-bold text-[11px]">{t.startTime}</span>
                          <span className="font-medium">{t.title}</span>
                        </div>
                        <span className="font-mono text-txt-muted">{t.durationMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border/60">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="forge"
              size="md"
              onClick={handleNextStep}
              isLoading={submitting}
              className="font-bold shadow-glow flex items-center gap-1.5"
            >
              <span>{step === 7 ? "Accept Plan & Enter Dashboard" : "Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
