"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Clock,
  Flame,
  Award,
  BookOpen,
  Target,
  Settings,
} from "lucide-react";
import { Goal, Subject, ProductivitySummary } from "@/types";
import { formatMinutes } from "@/lib/utils";
import { FireFlame } from "@/components/ui/fire-flame";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<ProductivitySummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    async function loadProfileData() {
      const userId = user?._id || "demo-user-123";
      try {
        const [sumRes, goalRes, subRes] = await Promise.all([
          fetch(`/api/analytics/summary?userId=${userId}`),
          fetch(`/api/goals?userId=${userId}`),
          fetch(`/api/subjects?userId=${userId}`),
        ]);

        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData.summary);
        }
        if (goalRes.ok) {
          const gData = await goalRes.json();
          setGoals(gData.goals || []);
        }
        if (subRes.ok) {
          const sData = await subRes.json();
          setSubjects(sData.subjects || []);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }
    loadProfileData();
  }, [user]);

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
        {/* Profile Card Header */}
        <Card className="p-6 md:p-8 bg-gradient-to-r from-surface-card via-[#151D19] to-[#101613] border-forge/30 shadow-glow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-forge/20 border-2 border-forge/50 flex items-center justify-center font-black text-2xl text-forge shadow-glow">
              {user?.displayName?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-txt-primary">{user?.displayName || "Alex Rivera"}</h1>
                <Badge variant="forge" size="sm" className="font-mono capitalize">
                  {user?.role || "student"}
                </Badge>
              </div>
              <p className="text-xs text-txt-secondary flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || "alex.forge@example.com"}</span>
              </p>
              <p className="text-[11px] font-mono text-txt-muted">
                Timezone: {user?.timezone || "America/New_York"}
              </p>
            </div>
          </div>

          <Link href="/settings">
            <Button variant="outline" size="sm" className="text-xs">
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Edit Settings
            </Button>
          </Link>
        </Card>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
              <span>Lifetime Focus</span>
              <Clock className="w-4 h-4 text-forge" />
            </div>
            <p className="text-2xl font-extrabold font-mono text-txt-primary">
              {summary?.totalFocusedHours || 0} Hours
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
              <span>Active Streak</span>
              <FireFlame size="sm" animate={(summary?.currentStreakDays ?? 0) > 0} />
            </div>
            <p className="text-2xl font-extrabold font-mono text-txt-primary">
              {summary?.currentStreakDays ?? 0} Days
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
              <span>Reward Points</span>
              <Award className="w-4 h-4 text-forge" />
            </div>
            <p className="text-2xl font-extrabold font-mono text-forge">
              {summary?.totalPoints || 0} Pts
            </p>
          </Card>
        </div>

        {/* Active Goals & Registered Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Goals */}
          <Card className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-forge" />
              Active Goals ({goals.length})
            </CardTitle>

            <div className="space-y-2.5">
              {goals.map((g) => (
                <div
                  key={g._id}
                  className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-txt-primary">{g.title}</p>
                    <p className="text-[10px] text-txt-muted font-mono">{g.weeklyTargetHours} hrs / week</p>
                  </div>
                  <Badge variant="outline" size="sm">
                    {g.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Registered Subjects */}
          <Card className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-forge" />
              Learning Areas & Subjects ({subjects.length})
            </CardTitle>

            <div className="space-y-2.5">
              {subjects.map((sub) => (
                <div
                  key={sub._id}
                  className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                    <span className="font-semibold text-txt-primary">{sub.name}</span>
                  </div>
                  <span className="text-txt-muted font-mono">{sub.estimatedWeeklyHours}h/wk</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
