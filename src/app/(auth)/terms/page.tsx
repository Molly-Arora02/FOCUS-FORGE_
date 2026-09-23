import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
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
          <FileText className="w-3.5 h-3.5" />
          <span>TERMS OF SERVICE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-txt-primary">Terms of Service & Usage Agreement</h1>
        <p className="text-sm text-txt-secondary">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-txt-secondary leading-relaxed bg-surface-card p-6 md:p-8 rounded-2xl border border-surface-border">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-txt-primary">1. Acceptance of Terms</h2>
          <p>
            By using Focus Forge, you agree to these terms. Focus Forge is designed as a personal habit building and deep work platform to assist with study planning and productivity optimization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-txt-primary">2. Medical & Psychological Disclaimer</h2>
          <p>
            Focus Forge is a productivity tool, not a medical, psychiatric, or diagnostic service. Focus metrics and AI recommendations do not constitute clinical evaluations of attention disorders, ADHD, or cognitive impairments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-txt-primary">3. Deterministic Points & Rewards Rules</h2>
          <p>
            Points awarded in the Rewards Ledger represent product engagement milestones. Unlocked physical merchandise or partner discounts are subject to verification and partner availability.
          </p>
        </section>
      </div>
    </div>
  );
}
