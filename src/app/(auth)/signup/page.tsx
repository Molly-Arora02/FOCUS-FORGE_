"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, signInWithDemo } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setSubmitting(true);
    const result = await signUpWithEmail(email, password, name);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-glow-radial pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" showWordmark href="/" className="justify-center" />
          <p className="text-sm text-txt-secondary">
            Create your account to forge lasting focus habits
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-glow-card">
          {error && (
            <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-xs text-status-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-txt-secondary">Full Name</label>
              <Input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-txt-secondary">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-txt-secondary">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <p className="text-[11px] text-txt-muted">Must be at least 6 characters</p>
            </div>

            <Button
              type="submit"
              variant="forge"
              size="md"
              isLoading={submitting}
              className="w-full font-bold shadow-glow"
            >
              <span>Create Account & Continue</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-surface-border/60">
            <p className="text-xs text-txt-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-forge font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
