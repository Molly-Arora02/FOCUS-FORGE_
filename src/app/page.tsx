"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Calendar,
  Bot,
  BarChart3,
  Award,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const { user, signInWithDemo } = useAuth();
  const router = useRouter();

  const handleDemoLaunch = async () => {
    await signInWithDemo("student");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-txt-primary flex flex-col relative overflow-hidden">
      {/* Dark Matter Ambient Radial Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-glow-radial pointer-events-none" />

      {/* Navigation Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Logo size="md" showWordmark />
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="forge" size="sm" className="shadow-glow">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDemoLaunch}
                className="hidden sm:inline-flex"
              >
                Instant Demo
              </Button>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="forge" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card border border-forge/30 text-forge text-xs font-mono tracking-wide shadow-glow animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-POWERED PRODUCTIVITY OPERATING SYSTEM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-txt-primary max-w-4xl mx-auto leading-[1.1]">
          Forge your focus. <br />
          <span className="text-gradient">Build your future.</span>
        </h1>

        <p className="text-lg sm:text-xl text-txt-secondary max-w-2xl mx-auto font-normal leading-relaxed">
          Transform scattered intentions into measurable mastery. Focus Forge combines intelligent daily planning, distraction-shielded deep work sessions, deterministic rewards, and personal AI coaching into a single, cohesive workflow.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="forge"
            size="lg"
            onClick={handleDemoLaunch}
            className="w-full sm:w-auto text-base font-bold shadow-glow hover:shadow-glow-lg px-8"
          >
            <Flame className="w-5 h-5 fill-current mr-2" />
            Launch Live Demo (Zero Setup)
          </Button>

          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base font-semibold px-8">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Product Trust Metrics */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono text-txt-muted border-t border-surface-border/50 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forge" />
            <span>Deterministic Points Ledger</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-forge" />
            <span>Zero Video Storage / Privacy-First</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-forge" />
            <span>Supabase Auth & MongoDB Atlas</span>
          </div>
        </div>
      </section>

      {/* The Core Loop Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-mono text-forge tracking-widest uppercase">The Focus Forge Loop</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-txt-primary">
            A Complete Cognitive Architecture
          </h2>
          <p className="text-sm text-txt-secondary max-w-lg mx-auto">
            Not just a timer. An end-to-end framework designed to engineer sustained deep work and continuous habit growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loop Card 1 */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-forge/40 transition-all space-y-3 shadow-glow-card group">
            <div className="w-10 h-10 rounded-xl bg-forge/10 border border-forge/30 flex items-center justify-center text-forge group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-txt-primary">1. Intelligent AI Planner</h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Dynamically sequences your goals, syllabus milestones, and energy windows into realistic, prioritized daily time blocks with structured rest.
            </p>
          </div>

          {/* Loop Card 2 */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-forge/40 transition-all space-y-3 shadow-glow-card group">
            <div className="w-10 h-10 rounded-xl bg-forge/10 border border-forge/30 flex items-center justify-center text-forge group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-txt-primary">2. Distraction-Shielded Focus</h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Full-screen immersion workspace with server-audited interval tracking, YouTube/note sidepanel attachments, and optional on-device attention cues.
            </p>
          </div>

          {/* Loop Card 3 */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-forge/40 transition-all space-y-3 shadow-glow-card group">
            <div className="w-10 h-10 rounded-xl bg-forge/10 border border-forge/30 flex items-center justify-center text-forge group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-txt-primary">3. Verified Heatmap & Analytics</h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              GitHub-style contribution heatmaps and subject time distribution charts derived strictly from completed, verified deep work records.
            </p>
          </div>

          {/* Loop Card 4 */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-forge/40 transition-all space-y-3 shadow-glow-card group">
            <div className="w-10 h-10 rounded-xl bg-forge/10 border border-forge/30 flex items-center justify-center text-forge group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-txt-primary">4. Contextual AI Focus Coach</h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Conversational assistant that diagnoses friction, decomposes massive topics into 25-minute sprints, and offers empathetic recovery protocols.
            </p>
          </div>

          {/* Loop Card 5 */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-forge/40 transition-all space-y-3 shadow-glow-card group">
            <div className="w-10 h-10 rounded-xl bg-forge/10 border border-forge/30 flex items-center justify-center text-forge group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-txt-primary">5. Deterministic Points & Badges</h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Auditable transaction ledger awarding points per verified focus minute. Unlock 50h, 100h, 200h, and 500h physical/digital forge cards.
            </p>
          </div>

          {/* Loop Card 6 */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-forge/40 transition-all space-y-3 shadow-glow-card group">
            <div className="w-10 h-10 rounded-xl bg-forge/10 border border-forge/30 flex items-center justify-center text-forge group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-txt-primary">6. Google Drive & Timetable OCR</h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Connect Google Drive to select exam syllabi or upload timetable PDFs for automatic schedule parsing and recurring calendar sync.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-surface-card to-[#101613] border border-forge/30 shadow-glow-lg text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-txt-primary">
            Ready to enter the Forge?
          </h2>
          <p className="text-sm sm:text-base text-txt-secondary max-w-xl mx-auto">
            Experience the new standard of intentional productivity. Explore the live platform with instant demo access or connect your own account.
          </p>
          <div className="pt-2">
            <Button
              variant="forge"
              size="lg"
              onClick={handleDemoLaunch}
              className="text-base font-bold shadow-glow"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-border py-8 px-6 text-center text-xs text-txt-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showWordmark />
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-txt-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-txt-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-txt-primary transition-colors">
              Sign In
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Focus Forge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
