"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Shield,
  Crown,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  History,
  Copy,
  Check,
} from "lucide-react";
import { PointsLedgerEntry, Reward } from "@/types";

export default function RewardsPage() {
  const { user } = useAuth();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [ledger, setLedger] = useState<PointsLedgerEntry[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRewards() {
      const userId = user?._id || "demo-user-123";
      try {
        const res = await fetch(`/api/rewards?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setRewards(data.rewards || []);
          setLedger(data.ledger || []);
          setTotalPoints(data.totalPoints || 0);
        }
      } catch (err) {
        console.error("Rewards load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRewards();
  }, [user]);

  const handleClaim = async (rewardId: string) => {
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          rewardId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRewards((prev) =>
          prev.map((r) => (r._id === rewardId ? { ...r, status: "claimed" } : r))
        );
      }
    } catch (err) {
      console.error("Error claiming reward:", err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header & Balance Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-surface-card via-[#151D19] to-[#101613] border border-forge/30 shadow-glow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forge/15 border border-forge/30 text-forge text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DETERMINISTIC REWARDS ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-txt-primary">
              Forge Milestones & Ledger
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary max-w-lg">
              Every verified focus minute contributes to an auditable points ledger. Unlock digital collector cards, partner coupons, and custom hardware eligibility.
            </p>
          </div>

          {/* Points Stat Box */}
          <div className="bg-surface/80 backdrop-blur-md border border-forge/40 rounded-2xl p-6 text-center shadow-glow shrink-0">
            <span className="text-xs font-mono text-txt-muted uppercase">Active Points Balance</span>
            <p className="text-4xl sm:text-5xl font-black font-mono text-forge mt-1">
              {totalPoints}
            </p>
            <p className="text-[11px] text-txt-muted mt-1">+10 pts per focus minute</p>
          </div>
        </div>

        {/* Milestone Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
            <div>
              <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2">
                <Award className="w-5 h-5 text-forge" />
                Cumulative Focus Milestones
              </h2>
              <p className="text-xs text-txt-secondary">
                Milestones unlocked by genuine lifetime deep work hours.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {rewards.map((r) => {
              const isUnlocked = r.status === "unlocked" || r.status === "claimed";
              const isClaimed = r.status === "claimed";

              return (
                <Card
                  key={r._id}
                  className={`p-6 space-y-4 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? "border-forge/40 bg-gradient-to-b from-surface-card to-[#101613] shadow-glow"
                      : "opacity-75 bg-surface-card border-surface-border"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isUnlocked
                            ? "bg-forge/15 border-forge text-forge shadow-glow"
                            : "bg-surface-border text-txt-muted border-surface-border"
                        }`}
                      >
                        {r.milestoneHours === 50 && <Shield className="w-5 h-5" />}
                        {r.milestoneHours === 100 && <Award className="w-5 h-5" />}
                        {r.milestoneHours === 200 && <Crown className="w-5 h-5" />}
                        {r.milestoneHours === 500 && <Zap className="w-5 h-5" />}
                      </div>

                      <Badge
                        variant={isClaimed ? "default" : isUnlocked ? "forge" : "outline"}
                        size="sm"
                        className="font-mono text-[10px]"
                      >
                        {r.milestoneHours} HOURS
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-txt-primary">{r.title}</h3>
                      <p className="text-xs text-txt-secondary leading-relaxed">{r.description}</p>
                    </div>

                    {r.code && isUnlocked && (
                      <div className="p-2.5 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs font-mono">
                        <span className="text-forge font-bold">{r.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(r.code!)}
                          className="text-txt-muted hover:text-txt-primary"
                        >
                          {copiedCode === r.code ? <Check className="w-3.5 h-3.5 text-forge" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {isClaimed ? (
                      <div className="p-2 rounded-xl bg-surface-hover text-center text-xs text-txt-muted flex items-center justify-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forge" />
                        <span>Claimed</span>
                      </div>
                    ) : isUnlocked ? (
                      <Button
                        variant="forge"
                        size="sm"
                        onClick={() => handleClaim(r._id)}
                        className="w-full font-bold shadow-glow text-xs"
                      >
                        Claim Reward
                      </Button>
                    ) : (
                      <div className="p-2 rounded-xl bg-surface-card border border-surface-border text-center text-xs text-txt-muted flex items-center justify-center gap-1.5 font-mono">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked Milestone</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Auditable Points Transaction Ledger */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-forge" />
                Auditable Points Ledger
              </CardTitle>
              <CardDescription className="text-xs">
                Deterministic transactions recorded with idempotency keys to guarantee fairness and prevent duplicate credits.
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-txt-muted">{ledger.length} Logged Transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-border font-mono uppercase text-txt-muted text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Reason / Context</th>
                  <th className="py-2.5 px-3">Points</th>
                  <th className="py-2.5 px-3">Idempotency Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 text-txt-secondary">
                {ledger.slice(0, 12).map((entry) => (
                  <tr key={entry._id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-txt-primary whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                      <span className="text-txt-muted">
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-txt-primary">
                      <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                        {entry.eventType.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 max-w-sm truncate text-txt-primary font-medium">
                      {entry.reason}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-forge">
                      +{entry.points}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-txt-muted truncate max-w-[150px]">
                      {entry.idempotencyKey}
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
