"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table as TableIcon,
  Download,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  Star,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { formatMinutes } from "@/lib/utils";
import { Subject } from "@/types";

interface EnrichedSession {
  _id: string;
  userId: string;
  subjectId?: string;
  subjectName: string;
  subjectColor: string;
  topic?: string;
  plannedDuration: number;
  actualDuration: number;
  status: string;
  startedAt: string;
  endedAt?: string;
  pauseEvents: any[];
  focusRating?: number;
  reflectionNotes?: string;
  distractionsReported?: string[];
  createdAt: string;
}

export default function TrackingSheetPage() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<EnrichedSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "duration" | "rating">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Manual Session Entry Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualTopic, setManualTopic] = useState("");
  const [manualSubjectId, setManualSubjectId] = useState("");
  const [manualDuration, setManualDuration] = useState(45);
  const [manualRating, setManualRating] = useState(5);
  const [manualNotes, setManualNotes] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [savingManual, setSavingManual] = useState(false);

  useEffect(() => {
    async function loadData() {
      const userId = user?._id || "demo-user-123";
      try {
        const [sessRes, subRes] = await Promise.all([
          fetch(`/api/tracking?userId=${userId}`),
          fetch(`/api/subjects?userId=${userId}`),
        ]);

        if (sessRes.ok) {
          const sData = await sessRes.json();
          setSessions(sData.sessions || []);
        }
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubjects(subData.subjects || []);
          if (subData.subjects?.length > 0) {
            setManualSubjectId(subData.subjects[0]._id);
          }
        }
      } catch (err) {
        console.error("Tracking sheet load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Filter & Sort Logic
  const filteredSessions = sessions
    .filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.reflectionNotes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subjectName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubjectFilter === "all" || s.subjectId === selectedSubjectFilter;

      const matchesRating =
        ratingFilter === "all" || (s.focusRating && s.focusRating >= Number(ratingFilter));

      return matchesSearch && matchesSubject && matchesRating;
    })
    .sort((a, b) => {
      if (sortField === "date") {
        const timeA = new Date(a.startedAt).getTime();
        const timeB = new Date(b.startedAt).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
      if (sortField === "duration") {
        return sortOrder === "asc"
          ? a.actualDuration - b.actualDuration
          : b.actualDuration - a.actualDuration;
      }
      if (sortField === "rating") {
        const rA = a.focusRating || 0;
        const rB = b.focusRating || 0;
        return sortOrder === "asc" ? rA - rB : rB - rA;
      }
      return 0;
    });

  // Aggregates
  const totalFilteredMinutes = filteredSessions.reduce(
    (acc, s) => acc + Math.round(s.actualDuration / 60),
    0
  );
  const avgRating =
    filteredSessions.length > 0
      ? (
          filteredSessions.reduce((acc, s) => acc + (s.focusRating || 5), 0) /
          filteredSessions.length
        ).toFixed(1)
      : "0.0";

  const handleSort = (field: "date" | "duration" | "rating") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to remove this logged session?")) return;
    try {
      await fetch(`/api/tracking?id=${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting session entry:", err);
    }
  };

  const handleCreateManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTopic.trim()) return;

    setSavingManual(true);
    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          subjectId: manualSubjectId || undefined,
          topic: manualTopic.trim(),
          actualDurationMinutes: Number(manualDuration),
          focusRating: Number(manualRating),
          reflectionNotes: manualNotes.trim(),
          date: manualDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessions((prev) => [data.session, ...prev]);
        setIsAddModalOpen(false);
        setManualTopic("");
        setManualNotes("");
      }
    } catch (err) {
      console.error("Error logging manual session:", err);
    } finally {
      setSavingManual(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Session ID",
      "Date",
      "Time",
      "Subject",
      "Topic / Task",
      "Focused Duration (Minutes)",
      "Rating (1-5)",
      "Pauses Count",
      "Reflection Notes",
      "Status",
    ];

    const rows = filteredSessions.map((s) => [
      s._id,
      new Date(s.startedAt).toISOString().split("T")[0],
      new Date(s.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      `"${s.subjectName.replace(/"/g, '""')}"`,
      `"${(s.topic || "Deep Work").replace(/"/g, '""')}"`,
      Math.round(s.actualDuration / 60),
      s.focusRating || 5,
      s.pauseEvents?.length || 0,
      `"${(s.reflectionNotes || "").replace(/"/g, '""')}"`,
      s.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `focus_forge_study_tracking_sheet_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <FileSpreadsheet className="w-7 h-7 text-forge" />
              Productivity Tracking Sheet
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary">
              Master study log spreadsheet with multi-column filtering, manual logging, and Excel/CSV export.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs font-mono"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>

            <Button
              variant="forge"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold shadow-glow"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Log Study Entry
            </Button>
          </div>
        </div>

        {/* Aggregates Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Card className="p-4 space-y-1 bg-surface-card border-surface-border">
            <span className="text-[11px] font-mono text-txt-muted uppercase">Filtered Volume</span>
            <p className="text-2xl font-extrabold font-mono text-txt-primary">
              {formatMinutes(totalFilteredMinutes)}
            </p>
          </Card>

          <Card className="p-4 space-y-1 bg-surface-card border-surface-border">
            <span className="text-[11px] font-mono text-txt-muted uppercase">Total Sessions</span>
            <p className="text-2xl font-extrabold font-mono text-txt-primary">
              {filteredSessions.length}
            </p>
          </Card>

          <Card className="p-4 space-y-1 bg-surface-card border-surface-border">
            <span className="text-[11px] font-mono text-txt-muted uppercase">Avg Focus Rating</span>
            <p className="text-2xl font-extrabold font-mono text-forge">
              {avgRating} <span className="text-xs text-txt-muted font-normal">/ 5.0</span>
            </p>
          </Card>

          <Card className="p-4 space-y-1 bg-surface-card border-surface-border">
            <span className="text-[11px] font-mono text-txt-muted uppercase">Points Generated</span>
            <p className="text-2xl font-extrabold font-mono text-forge">
              +{totalFilteredMinutes * 10}
            </p>
          </Card>
        </div>

        {/* Filter Controls Bar */}
        <Card className="p-4 bg-surface-card border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="flex-1 min-w-[220px] max-w-sm relative">
            <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic, notes, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-txt-primary outline-none focus:border-forge"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-txt-muted font-mono uppercase text-[11px]">Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-surface border border-surface-border rounded-xl px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-forge"
            >
              <option value="all">All Subjects ({sessions.length})</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="text-txt-muted font-mono uppercase text-[11px]">Min Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-surface border border-surface-border rounded-xl px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-forge"
            >
              <option value="all">All Ratings</option>
              <option value="4">4+ Stars Only</option>
              <option value="5">5 Stars Only</option>
            </select>
          </div>
        </Card>

        {/* Interactive Spreadsheet Grid */}
        <Card className="border-surface-border bg-surface-card overflow-hidden shadow-glow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface border-b border-surface-border text-txt-muted font-mono uppercase text-[11px] select-none">
                <tr>
                  <th
                    onClick={() => handleSort("date")}
                    className="py-3 px-4 cursor-pointer hover:text-txt-primary transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date & Start</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Topic / Specific Objective</th>
                  <th
                    onClick={() => handleSort("duration")}
                    className="py-3 px-4 cursor-pointer hover:text-txt-primary transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Duration</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("rating")}
                    className="py-3 px-4 cursor-pointer hover:text-txt-primary transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Rating</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Reflection & Accomplishment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-border/50 text-txt-secondary">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-txt-muted text-xs">
                      No study logs match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((sess) => (
                    <tr
                      key={sess._id}
                      className="hover:bg-surface-hover/60 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-txt-primary whitespace-nowrap">
                        <span>
                          {new Date(sess.startedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>{" "}
                        <span className="text-[10px] text-txt-muted">
                          {new Date(sess.startedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-surface border-surface-border">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: sess.subjectColor }}
                          />
                          <span className="text-txt-primary">{sess.subjectName}</span>
                        </span>
                      </td>

                      {/* Topic */}
                      <td className="py-3 px-4 font-semibold text-txt-primary max-w-xs truncate">
                        {sess.topic || "Deep Focus Sprint"}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono font-bold text-forge whitespace-nowrap">
                        {formatMinutes(Math.round(sess.actualDuration / 60))}
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4 font-mono text-txt-primary whitespace-nowrap">
                        {sess.focusRating ? (
                          <div className="flex items-center gap-1 text-forge font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{sess.focusRating}.0</span>
                          </div>
                        ) : (
                          <span className="text-txt-muted">-</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 max-w-md truncate text-[11px] text-txt-secondary">
                        {sess.reflectionNotes || (
                          <span className="text-txt-muted/60 italic">No notes logged</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(sess._id)}
                          className="p-1 rounded-lg text-txt-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Log Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Manual Log Entry Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 bg-surface-card border-forge/40 shadow-glow-lg animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                  <Plus className="w-4 h-4 text-forge" />
                  Log Manual Study Session
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-txt-muted hover:text-txt-primary text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualEntry} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Topic / Task</label>
                  <Input
                    placeholder="e.g. Mastered Dynamic Programming Knapsack Variations"
                    value={manualTopic}
                    onChange={(e) => setManualTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Subject</label>
                    <select
                      value={manualSubjectId}
                      onChange={(e) => setManualSubjectId(e.target.value)}
                      className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-txt-primary outline-none focus:border-forge"
                    >
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Date</label>
                    <Input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Duration (Minutes)</label>
                    <Input
                      type="number"
                      min={5}
                      max={480}
                      value={manualDuration}
                      onChange={(e) => setManualDuration(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Focus Quality (1-5)</label>
                    <select
                      value={manualRating}
                      onChange={(e) => setManualRating(Number(e.target.value))}
                      className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-txt-primary outline-none focus:border-forge"
                    >
                      <option value={5}>5 - Uninterrupted Flow</option>
                      <option value={4}>4 - High Focus</option>
                      <option value={3}>3 - Moderate Focus</option>
                      <option value={2}>2 - Interrupted</option>
                      <option value={1}>1 - Low Focus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Reflection Notes</label>
                  <Textarea
                    placeholder="Key concepts covered, breakthroughs, or remaining questions..."
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="h-20 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="forge"
                    size="sm"
                    isLoading={savingManual}
                    className="font-bold shadow-glow"
                  >
                    Save Study Log
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
