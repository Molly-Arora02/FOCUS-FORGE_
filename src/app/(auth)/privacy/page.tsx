import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft, Shield, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-txt-primary p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-surface-border">
        <Logo size="md" showWordmark href="/" />
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-forge hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forge/10 border border-forge/30 text-forge text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>PRIVACY ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-txt-primary">Privacy Policy & Data Principles</h1>
        <p className="text-sm text-txt-secondary">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-txt-secondary leading-relaxed bg-surface-card p-6 md:p-8 rounded-2xl border border-surface-border">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-txt-primary flex items-center gap-2">
            <Lock className="w-4 h-4 text-forge" />
            1. Core Data Principles
          </h2>
          <p>
            Focus Forge treats your productivity and study data with strict confidentiality. Supabase Auth provides identity verification while your goals, schedules, focus logs, and points ledgers are securely stored in MongoDB with strict user-level authorization checks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-txt-primary flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-forge" />
            2. Camera Focus Estimation & On-Device Processing
          </h2>
          <p>
            The camera focus estimation module is entirely optional and permission-gated. All frame processing occurs locally inside your browser client via HTML5 video/canvas heuristics. <strong>No video stream, photo, or facial biometric is ever recorded, stored, or transmitted to any server.</strong>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-txt-primary flex items-center gap-2">
            <Shield className="w-4 h-4 text-forge" />
            3. Google Drive Authorization
          </h2>
          <p>
            When connecting Google Drive, we only request narrow scopes to access documents you explicitly choose to attach (such as course syllabi or exam timetables). We store only file identifiers and metadata; full contents remain hosted on your Google Drive.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-txt-primary flex items-center gap-2">
            <Lock className="w-4 h-4 text-forge" />
            4. Data Portability & Deletion
          </h2>
          <p>
            You retain full ownership of your data. You may export your entire productivity history as clean JSON or permanently delete your account and all associated records directly from the Settings panel at any time.
          </p>
        </section>
      </div>
    </div>
  );
}
