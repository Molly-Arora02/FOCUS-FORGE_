"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <Logo size="lg" showWordmark href="/" className="justify-center" />

        <Card className="p-8 space-y-6 shadow-glow-card">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-txt-primary">Reset your password</h2>
            <p className="text-xs text-txt-secondary">
              Enter your account email to receive a password reset link
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-forge/10 border border-forge/30 text-xs text-forge space-y-2">
                <CheckCircle className="w-6 h-6 mx-auto text-forge" />
                <p className="font-semibold">Reset instructions dispatched!</p>
                <p className="text-txt-secondary text-[11px]">
                  Check your inbox at <span className="text-txt-primary font-mono">{email}</span> for instructions.
                </p>
              </div>

              <Link href="/login" className="block">
                <Button variant="outline" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">Account Email</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <Button type="submit" variant="forge" size="md" isLoading={loading} className="w-full font-bold shadow-glow">
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center text-xs text-txt-secondary hover:text-txt-primary gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
