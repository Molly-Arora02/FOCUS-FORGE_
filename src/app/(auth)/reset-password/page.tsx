"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <Logo size="lg" showWordmark href="/" className="justify-center" />

        <Card className="p-8 space-y-6 shadow-glow-card">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-txt-primary">Set New Password</h2>
            <p className="text-xs text-txt-secondary">
              Choose a strong password to secure your Focus Forge account
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-xs text-status-error">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-xl bg-forge/10 border border-forge/30 text-xs text-forge text-center space-y-2">
              <CheckCircle className="w-6 h-6 mx-auto text-forge" />
              <p className="font-semibold">Password updated successfully!</p>
              <p className="text-txt-secondary text-[11px]">Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-txt-secondary">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <Button type="submit" variant="forge" size="md" isLoading={loading} className="w-full font-bold shadow-glow">
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
