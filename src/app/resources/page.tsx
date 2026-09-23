"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Upload,
  Calendar,
  Youtube,
  FileText,
  Trash2,
  Sparkles,
  Plus,
  Play,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { ResourceItem } from "@/types";
import Link from "next/link";

export default function ResourcesPage() {
  const { user } = useAuth();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload / Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [resourceType, setResourceType] = useState<"timetable" | "syllabus" | "lecture" | "notes">("timetable");
  const [rawText, setRawText] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedSchedule, setExtractedSchedule] = useState<any[]>([]);

  useEffect(() => {
    async function loadResources() {
      const userId = user?._id || "demo-user-123";
      try {
        const res = await fetch(`/api/resources?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (err) {
        console.error("Resource load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, [user]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setUploading(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          fileName: fileName.trim(),
          resourceType,
          url: url.trim() || undefined,
          rawTextContent: rawText.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [data.resource, ...prev]);
        if (data.extractedSchedule && data.extractedSchedule.length > 0) {
          setExtractedSchedule(data.extractedSchedule);
        } else {
          setIsAddOpen(false);
          setFileName("");
          setRawText("");
          setUrl("");
        }
      }
    } catch (err) {
      console.error("Error creating resource:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await fetch(`/api/resources?id=${id}`, { method: "DELETE" });
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting resource:", err);
    }
  };

  const handleSyncExtractedSchedule = async () => {
    for (const block of extractedSchedule) {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          title: `${block.day}: ${block.title}`,
          estimatedDuration: 45,
          priority: "medium",
        }),
      });
    }
    alert("Extracted timetable blocks successfully added to your agenda!");
    setExtractedSchedule([]);
    setIsAddOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-forge" />
              Focus Resources & Timetable Parser
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary">
              Upload class schedules, exam syllabi, and attach companion focus media to your sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="forge"
              size="md"
              onClick={() => setIsAddOpen(true)}
              className="font-bold shadow-glow text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Resource / Timetable
            </Button>
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isTimetable = res.resourceType === "timetable";
            const isYouTube = res.provider === "youtube";

            return (
              <Card
                key={res._id}
                className="p-6 space-y-4 bg-surface-card border-surface-border hover:border-forge/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-forge/15 border border-forge/30 flex items-center justify-center text-forge shadow-glow">
                      {isYouTube ? (
                        <Youtube className="w-5 h-5 text-status-error" />
                      ) : isTimetable ? (
                        <Calendar className="w-5 h-5 text-forge" />
                      ) : (
                        <FileText className="w-5 h-5 text-forge" />
                      )}
                    </div>
                    <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
                      {res.resourceType}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-txt-primary truncate">{res.fileName}</h3>
                    <p className="text-xs text-txt-secondary leading-relaxed line-clamp-2">
                      {res.contentSnippet || res.url || "Attached learning asset"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-border/50 flex items-center justify-between text-xs">
                  {res.url ? (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forge hover:underline font-mono inline-flex items-center gap-1"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-txt-muted font-mono">Internal Doc</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteResource(res._id)}
                    className="text-txt-muted hover:text-status-error transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Timetable Parser & Add Resource Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forge" />
                  Add Resource / Parse Timetable
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-txt-muted hover:text-txt-primary text-xs"
                >
                  ✕
                </button>
              </div>

              {extractedSchedule.length > 0 ? (
                /* Extracted Timetable Preview */
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-forge/10 border border-forge/30 text-xs text-forge">
                    <p className="font-bold">Successfully Parsed {extractedSchedule.length} Schedule Blocks!</p>
                    <p className="text-txt-secondary text-[11px] mt-0.5">
                      Review the detected classes and sync them to your daily calendar agenda.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {extractedSchedule.map((b, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-txt-primary">{b.title}</p>
                          <p className="text-[11px] text-txt-muted font-mono">{b.day} • {b.time}</p>
                        </div>
                        <Badge variant="outline" size="sm">
                          {b.subject}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                    <Button variant="ghost" size="sm" onClick={() => setExtractedSchedule([])}>
                      Re-enter Text
                    </Button>
                    <Button variant="forge" size="sm" onClick={handleSyncExtractedSchedule} className="font-bold shadow-glow">
                      Confirm & Sync to Agenda
                    </Button>
                  </div>
                </div>
              ) : (
                /* Resource Input Form */
                <form onSubmit={handleCreateResource} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Resource Title / File Name</label>
                    <Input
                      placeholder="e.g. Spring 2026 CS Timetable or Lofi Focus Beats"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Resource Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["timetable", "syllabus", "lecture", "notes"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setResourceType(t)}
                          className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                            resourceType === t
                              ? "bg-forge/15 border-forge text-forge font-bold"
                              : "bg-surface-card border-surface-border text-txt-muted hover:border-surface-border"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {resourceType === "timetable" ? (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-txt-secondary">
                        Paste Timetable Text or Schedule Snippet
                      </label>
                      <Textarea
                        placeholder="Monday: 10:00 AM - Algorithms Lecture&#10;Wednesday: 02:00 PM - Distributed Systems Lab&#10;Friday: 11:00 AM - Database Systems Recitation"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="h-28 text-xs font-mono"
                      />
                      <p className="text-[11px] text-txt-muted">
                        AI will automatically extract course names, days, and time slots.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-txt-secondary">Resource URL (Optional)</label>
                      <Input
                        placeholder="https://youtube.com/watch?v=... or Google Doc link"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="forge" size="sm" isLoading={uploading} className="font-bold shadow-glow">
                      {resourceType === "timetable" ? "Parse Timetable with AI" : "Save Resource"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
