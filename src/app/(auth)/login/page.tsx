"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Sparkles, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, signInWithDemo, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await signInWithEmail(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitting(true);
    const res = await signInWithGoogle();
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };

  const handleDemoSignIn = async (role: "molly" | "student" | "professional" = "molly") => {
    setSubmitting(true);
    await signInWithDemo(role);
    setSubmitting(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-glow-radial pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" showWordmark href="/" className="justify-center" />
          <p className="text-sm text-txt-secondary">
            Sign in to access your personal focus operating system
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-glow-card">
          {error && (
            <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-xs text-status-error">
              {error}
            </div>
          )}

          {/* Quick 1-Click Demo Login & Credentials */}
          <div className="space-y-3 pb-4 border-b border-surface-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-txt-muted uppercase">Verified Demo Personas</span>
              <span className="text-[10px] text-forge font-mono font-bold">1-Click Access</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-base/80 border border-forge/20 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-txt-muted">Molly (Founder & Scholar):</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("molly@focusforge.io");
                    setPassword("password123");
                  }}
                  className="text-forge font-semibold hover:underline"
                >
                  molly@focusforge.io
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-txt-muted">Alex (Student Persona):</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("alex@focusforge.io");
                    setPassword("password123");
                  }}
                  className="text-txt-primary hover:underline"
                >
                  alex@focusforge.io
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-txt-muted">Password for all:</span>
                <span className="text-forge font-bold">password123</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="forge"
                size="sm"
                onClick={() => handleDemoSignIn("molly")}
                className="w-full text-xs font-semibold shadow-glow px-2"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Molly
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoSignIn("student")}
                className="w-full text-xs font-semibold hover:border-forge/60 px-2"
              >
                <Sparkles className="w-3 h-3 text-forge mr-1" />
                Alex (Student)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoSignIn("professional")}
                className="w-full text-xs font-semibold hover:border-forge/60 px-2"
              >
                <Shield className="w-3 h-3 text-forge mr-1" />
                Jordan (Pro)
              </Button>
            </div>

            <Link href="/verify-phone" className="block w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs font-mono border-forge/30 hover:border-forge/60 text-forge"
              >
                📱 Verify via 6-Digit OTP (Authentic ID)
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-txt-secondary">Password</label>
                <Link href="/forgot-password" className="text-xs text-forge hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="forge"
              size="md"
              isLoading={submitting}
              className="w-full font-bold shadow-glow"
            >
              <span>Sign In with Email</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-surface-border" />
            <span className="absolute bg-surface-card px-3 text-[11px] uppercase font-mono text-txt-muted">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 22.4 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-txt-secondary">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-forge font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
