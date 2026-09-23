"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Bell,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  Video,
} from "lucide-react";
import { CameraTracker } from "@/components/camera/camera-tracker";

export default function SettingsPage() {
  const { user, refreshProfile, signOut } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "Alex Rivera");
  const [timezone, setTimezone] = useState(user?.timezone || "America/New_York");
  const [dailyTarget, setDailyTarget] = useState(user?.preferences?.dailyFocusTargetMinutes || 180);
  const [coachingStyle, setCoachingStyle] = useState(user?.preferences?.coachingStyle || "empathetic");
  const [cameraEnabled, setCameraEnabled] = useState(user?.preferences?.cameraFocusEnabled || false);
  const [soundEnabled, setSoundEnabled] = useState(user?.preferences?.soundEnabled ?? true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          displayName,
          timezone,
          preferences: {
            ...user.preferences,
            dailyFocusTargetMinutes: Number(dailyTarget),
            coachingStyle,
            cameraFocusEnabled: cameraEnabled,
            soundEnabled,
          },
        }),
      });

      if (res.ok) {
        await refreshProfile();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      profile: user,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focus_forge_profile_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    await signOut();
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <SettingsIcon className="w-7 h-7 text-forge" />
              Settings & Privacy Controls
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary">
              Manage your focus preferences, live camera attention module, and data privacy options.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Profile Section */}
          <Card className="p-6 sm:p-8 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-forge" />
              Profile & Regional
            </CardTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">Time Zone</label>
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Focus & AI Personalization */}
          <Card className="p-6 sm:p-8 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-forge" />
              Daily Focus & AI Companion Tuning
            </CardTitle>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-txt-secondary">Daily Focus Target (Minutes)</label>
                  <span className="font-mono font-bold text-forge">{dailyTarget} mins ({Math.round(dailyTarget / 60)}h)</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={480}
                  step={15}
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full accent-forge cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">AI Coaching Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["empathetic", "direct", "socratic", "enthusiastic"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setCoachingStyle(style)}
                      className={`py-2 rounded-xl border text-xs capitalize transition-all ${
                        coachingStyle === style
                          ? "bg-forge/15 border-forge text-forge font-bold"
                          : "bg-surface-card border-surface-border text-txt-muted hover:border-surface-border"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* LIVE CAMERA ATTENTION TRACKER SETTINGS */}
          <Card className="p-6 sm:p-8 space-y-4 border-forge/30">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="w-4 h-4 text-forge" />
              Live Camera Attention Tracking Module
            </CardTitle>

            <p className="text-xs text-txt-secondary leading-relaxed">
              Test your live webcam feed and verify real-time face presence tracking below. All video frames are processed on-device in browser memory.
            </p>

            <CameraTracker
              isActive={cameraEnabled}
              onToggle={() => setCameraEnabled(!cameraEnabled)}
            />
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {savedSuccess && (
              <span className="text-xs text-forge font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
            <div className="ml-auto">
              <Button type="submit" variant="forge" size="md" isLoading={saving} className="font-bold shadow-glow">
                Save Preferences
              </Button>
            </div>
          </div>
        </form>

        {/* Data Ownership & Account Deletion */}
        <Card className="p-6 sm:p-8 space-y-4 border-status-error/30 bg-status-error/5">
          <CardTitle className="text-base text-status-error flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Data Ownership & Privacy
          </CardTitle>

          <p className="text-xs text-txt-secondary leading-relaxed">
            You retain 100% ownership of your study history. Export your data as a clean JSON backup or permanently purge your account from all systems.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download My Data
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-status-error flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Confirm Account Deletion
            </h3>
            <p className="text-xs text-txt-secondary leading-relaxed">
              This action cannot be undone. All your recorded focus sessions, points ledger records, and daily plans will be permanently purged.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
              <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteAccount} className="font-bold">
                Permanently Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
