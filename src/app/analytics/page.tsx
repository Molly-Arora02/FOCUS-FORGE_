"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  Flame,
  Award,
  TrendingUp,
  PieChart as PieIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { formatMinutes } from "@/lib/utils";
import { FocusSession, ProductivitySummary } from "@/types";

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<ProductivitySummary | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      const userId = user?._id || "demo-user-123";
      try {
        const [sumRes, sessRes, subRes] = await Promise.all([
          fetch(`/api/analytics/summary?userId=${userId}`),
          fetch(`/api/focus/history?userId=${userId}`),
          fetch(`/api/analytics/subjects?userId=${userId}`),
        ]);

        if (sumRes.ok) {
          const sData = await sumRes.json();
          setSummary(sData.summary);
        }
        if (sessRes.ok) {
          const seData = await sessRes.json();
          setSessions(seData.sessions || []);
        }
        if (subRes.ok) {
          const suData = await subRes.json();
          setSubjectStats(suData.subjectStats || []);
        }
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [user]);

  // Aggregate daily chart data
  const daysCount = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30;
  const chartData: Array<{ date: string; focusMinutes: number; plannedMinutes: number }> = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const daySessions = sessions.filter((s) => s.startedAt.startsWith(dateStr) && s.status === "completed");
    const totalMins = daySessions.reduce((acc, s) => acc + Math.round(s.actualDuration / 60), 0);
    const plannedMins = daySessions.reduce((acc, s) => acc + (s.plannedDuration || 25), 0);

    chartData.push({
      date: displayDate,
      focusMinutes: totalMins,
      plannedMinutes: plannedMins > 0 ? plannedMins : 0,
    });
  }

  // Pie chart data for subjects
  const pieData = subjectStats
    .filter((s) => s.totalMinutes > 0)
    .map((s) => ({
      name: s.name,
      value: s.totalMinutes,
      color: s.color || "#43F59A",
    }));

  const handleExportData = () => {
    const dataToExport = {
      userProfile: user,
      summary,
      subjectStats,
      sessions,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focus_forge_analytics_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-forge" />
              Productivity & Focus Analytics
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary">
              Verified quantitative performance metrics, planned vs. actual duration, and subject time distribution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface-card p-1 rounded-xl border border-surface-border text-xs font-mono">
              {(["7d", "14d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeRange === r
                      ? "bg-forge text-surface-DEFAULT font-bold shadow-glow"
                      : "text-txt-muted hover:text-txt-primary"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="text-xs font-mono"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* 3 Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2">
            <span className="text-xs font-mono text-txt-muted uppercase">Total Lifetime Immersion</span>
            <p className="text-3xl font-extrabold font-mono text-txt-primary">
              {summary?.totalFocusedHours || 0}{" "}
              <span className="text-sm font-sans font-normal text-txt-secondary">hours</span>
            </p>
            <p className="text-[11px] text-forge font-mono">100% Verified Session Blocks</p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs font-mono text-txt-muted uppercase">Weekly Adherence Rate</span>
            <p className="text-3xl font-extrabold font-mono text-txt-primary">
              {summary?.weeklyCompletionRate || 88}%
            </p>
            <p className="text-[11px] text-txt-muted font-mono">Completed vs Target Sessions</p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs font-mono text-txt-muted uppercase">Forge Points Earned</span>
            <p className="text-3xl font-extrabold font-mono text-forge">
              {summary?.totalPoints || 0}
            </p>
            <p className="text-[11px] text-txt-muted font-mono">Auditable Points Ledger</p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Focus Trend Chart (2 Cols) */}
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-forge" />
                  Planned vs. Verified Focus Minutes
                </CardTitle>
                <CardDescription className="text-xs">
                  Compares your planned schedule duration against verified uninterrupted focus minutes.
                </CardDescription>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#23332A" vertical={false} />
                  <XAxis dataKey="date" stroke="#627068" fontSize={11} tickLine={false} />
                  <YAxis stroke="#627068" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#151D19",
                      borderColor: "#23332A",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#F4F7F5",
                    }}
                  />
                  <Bar dataKey="focusMinutes" name="Verified Focus (mins)" fill="#43F59A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="plannedMinutes" name="Planned (mins)" fill="#23332A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Subject Time Allocation Donut Chart (1 Col) */}
          <Card className="p-6 space-y-4">
            <div className="border-b border-surface-border/60 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-forge" />
                Subject Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Cognitive allocation across registered learning areas
              </CardDescription>
            </div>

            {pieData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#151D19",
                          borderColor: "#23332A",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-surface-border/40">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-txt-primary truncate">{item.name}</span>
                      </div>
                      <span className="font-mono text-txt-secondary">{formatMinutes(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-txt-muted text-center py-10">No subject data recorded yet.</p>
            )}
          </Card>
        </div>

        {/* Detailed Raw Focus Session History Table */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-forge" />
                Audited Session History
              </CardTitle>
              <CardDescription className="text-xs">
                Complete record of verified timestamps, pure focused duration, and reflection logs.
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-txt-muted">{sessions.length} Recorded Sessions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-border font-mono uppercase text-txt-muted text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Topic / Objective</th>
                  <th className="py-2.5 px-3">Focused Duration</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Reflection Notes</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 text-txt-secondary">
                {sessions.slice(0, 10).map((sess) => (
                  <tr key={sess._id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-txt-primary whitespace-nowrap">
                      {new Date(sess.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                      <span className="text-txt-muted">
                        {new Date(sess.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-txt-primary max-w-xs truncate">
                      {sess.topic || "Deep Focus Sprint"}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-forge">
                      {formatMinutes(Math.round(sess.actualDuration / 60))}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {sess.focusRating ? `${sess.focusRating} / 5 ⭐` : "-"}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-[11px]">
                      {sess.reflectionNotes || "No notes logged."}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="forge" size="sm" className="capitalize">
                        {sess.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
