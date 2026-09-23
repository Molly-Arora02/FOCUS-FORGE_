"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Building,
  UserCheck,
} from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { isDemoUser } = useAuth();

  const [verifyType, setVerifyType] = useState<"phone" | "email">("phone");
  const [target, setTarget] = useState("+91 98765 43210");
  const [name, setName] = useState("Molly Arora");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "verified">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [devCode, setDevCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [verifiedProfile, setVerifiedProfile] = useState<any>(null);

  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) {
      setError("Please provide a valid phone number or email.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          target,
          type: verifyType,
          name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch OTP");

      setDevCode(data.devCode || "123456");
      setServerMessage(data.message || `OTP sent to ${target}`);
      setCountdown(60);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError("Please enter the 6-digit OTP passcode.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          target,
          code: otpCode,
          type: verifyType,
          name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");

      setVerifiedProfile(data.user);
      // Cache session
      if (typeof window !== "undefined") {
        localStorage.setItem("focusforge_active_user", JSON.stringify(data.user));
      }
      setStep("verified");
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-glow-radial pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" showWordmark href="/" className="justify-center" />
          <p className="text-xs font-mono text-txt-secondary uppercase tracking-widest">
            Identity & Academic Verification Protocol
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-glow-card">
          {error && (
            <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-xs text-status-error font-mono">
              {error}
            </div>
          )}

          {/* STEP 1: Enter details & choose verification channel */}
          {step === "input" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-forge/15 border border-forge/30 flex items-center justify-center text-forge mx-auto shadow-glow">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-txt-primary">Verify Authentic Details via OTP</h2>
                <p className="text-xs text-txt-secondary">
                  Retrieve verified student/academic records & protect your focus history
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-base border border-surface-border rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setVerifyType("phone");
                    setTarget("+91 98765 43210");
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    verifyType === "phone"
                      ? "bg-forge text-white font-semibold shadow-glow"
                      : "text-txt-muted hover:text-txt-primary"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  SMS OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerifyType("email");
                    setTarget("molly.arora@univ.edu");
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    verifyType === "email"
                      ? "bg-forge text-white font-semibold shadow-glow"
                      : "text-txt-muted hover:text-txt-primary"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email OTP
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Full Name / Student Name</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Molly Arora"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">
                    {verifyType === "phone" ? "Mobile Number (SMS)" : "Academic / Personal Email"}
                  </label>
                  <Input
                    type={verifyType === "phone" ? "tel" : "email"}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={verifyType === "phone" ? "+91 98765 43210" : "molly@university.edu"}
                    icon={verifyType === "phone" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="forge"
                size="md"
                isLoading={loading}
                className="w-full font-bold shadow-glow"
              >
                <span>Generate & Dispatch 6-Digit OTP</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          )}

          {/* STEP 2: Input OTP & Dev Autocomplete */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-forge/15 border border-forge/30 flex items-center justify-center text-forge mx-auto shadow-glow">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-txt-primary">Enter Verification Code</h2>
                <p className="text-xs text-txt-secondary">
                  Passcode dispatched to <span className="text-forge font-mono font-semibold">{target}</span>
                </p>
              </div>

              {serverMessage && (
                <div className="p-3.5 rounded-xl bg-surface-base border border-forge/30 text-xs text-txt-primary space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-txt-muted">Security Challenge:</span>
                    <span className="text-forge font-mono font-bold">Expires in {countdown}s</span>
                  </div>

                  <p className="text-[11px] text-txt-secondary leading-relaxed">
                    {serverMessage}
                  </p>

                  {devCode && (
                    <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-txt-muted">Sandbox Passcode:</span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devCode)}
                        className="text-xs font-mono text-forge underline hover:text-forge-glow font-bold"
                      >
                        Auto-fill ({devCode})
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-txt-secondary">6-Digit Passcode</label>
                <Input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="font-mono text-center tracking-[0.5em] text-xl font-bold bg-surface-base"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="forge"
                size="md"
                isLoading={loading}
                className="w-full font-bold shadow-glow"
              >
                <span>Verify & Fetch Authentic Profile</span>
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="text-txt-muted hover:text-txt-primary"
                >
                  ← Change Number/Email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={countdown > 0}
                  className={`flex items-center gap-1 font-mono ${
                    countdown > 0 ? "text-txt-muted cursor-not-allowed" : "text-forge hover:underline"
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP {countdown > 0 ? `(${countdown}s)` : ""}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Verified Authentic Profile Card */}
          {step === "verified" && verifiedProfile && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-status-success/20 border border-status-success/40 flex items-center justify-center text-status-success mx-auto shadow-glow">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-txt-primary">Identity Verified Successfully</h2>
                <p className="text-xs text-txt-secondary">
                  Authentic academic & profile credentials securely fetched
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-base border border-forge/30 space-y-3 shadow-glow-card">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-forge" />
                    <span className="text-xs font-semibold text-txt-primary">{verifiedProfile.displayName}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-success/15 text-status-success border border-status-success/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-surface-card border border-surface-border/60">
                    <span className="text-[10px] text-txt-muted block">Student ID</span>
                    <span className="text-txt-primary font-bold">{verifiedProfile.academicDetails?.studentId}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-card border border-surface-border/60">
                    <span className="text-[10px] text-txt-muted block">Current Term</span>
                    <span className="text-txt-primary font-bold">{verifiedProfile.academicDetails?.semester}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-txt-secondary">
                    <Building className="w-3.5 h-3.5 text-forge" />
                    <span className="text-txt-muted">Degree:</span>
                    <span className="text-txt-primary font-medium">{verifiedProfile.academicDetails?.degree}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-txt-secondary">
                    <Sparkles className="w-3.5 h-3.5 text-forge" />
                    <span className="text-txt-muted">Specialization:</span>
                    <span className="text-txt-primary font-medium">{verifiedProfile.academicDetails?.specialization}</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="forge"
                size="md"
                onClick={() => router.push("/dashboard")}
                className="w-full font-bold shadow-glow text-sm py-3"
              >
                <span>Launch Verified Focus Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
