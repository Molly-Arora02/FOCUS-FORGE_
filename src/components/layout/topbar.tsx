"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Bell,
  Sparkles,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  X,
  Calendar,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Logo } from "../ui/logo";
import { FireStreakBadge, FireFlame } from "../ui/fire-flame";

export const Topbar: React.FC = () => {
  const { user, isDemoUser, signInWithDemo, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    async function loadStreak() {
      const userId = user?._id || "molly-user-123";
      try {
        const res = await fetch(`/api/analytics/summary?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setStreakCount(data.summary?.currentStreakDays ?? 0);
        }
      } catch {
        setStreakCount(0);
      }
    }
    loadStreak();
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-border px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-surface-card border border-surface-border text-txt-secondary hover:text-txt-primary"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Logo size="sm" showWordmark href="/dashboard" />
      </div>

      {/* Desktop Header Left */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-txt-secondary bg-surface-card px-3 py-1.5 rounded-full border border-surface-border">
          <span className="w-2 h-2 rounded-full bg-forge" />
          <span>TIMEZONE: {user?.timezone || "UTC"}</span>
        </div>
        {isDemoUser && (
          <div className="flex items-center gap-2 text-xs font-medium text-status-warning bg-status-warning/10 px-3 py-1 rounded-full border border-status-warning/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Interactive Demo Mode Active</span>
          </div>
        )}
      </div>

      {/* Header Right / Status / Actions */}
      <div className="flex items-center gap-3">
        {/* Real Fire Active Streak Badge */}
        <Link href="/analytics" className="hover:opacity-90 transition-opacity">
          <FireStreakBadge streak={streakCount} />
        </Link>

        {/* Demo Persona Switcher (Quick Toggle) */}
        {isDemoUser && (
          <div className="hidden md:flex items-center gap-1 bg-surface-card p-1 rounded-xl border border-surface-border text-xs">
            <button
              onClick={() => signInWithDemo("student")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                user?.role === "student" ? "bg-forge text-surface-DEFAULT font-bold" : "text-txt-muted hover:text-txt-primary"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => signInWithDemo("professional")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                user?.role === "professional" ? "bg-forge text-surface-DEFAULT font-bold" : "text-txt-muted hover:text-txt-primary"
              }`}
            >
              Pro
            </button>
          </div>
        )}

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-surface-card border border-surface-border text-txt-secondary hover:text-txt-primary hover:border-forge/40 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-forge" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-card border border-surface-border rounded-2xl shadow-glow-card p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <span className="text-xs font-semibold text-txt-primary">Notifications</span>
                <span className="text-[10px] text-txt-muted font-mono">1 New</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-surface-hover/80 border border-forge/20 text-xs">
                  <p className="font-medium text-txt-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-forge" />
                    Milestone Unlocked!
                  </p>
                  <p className="text-txt-secondary mt-1 text-[11px]">
                    You earned the 50h Novice Blacksmith Digital Badge.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-surface-card border border-surface-border hover:border-forge/40 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-forge/20 border border-forge/40 flex items-center justify-center font-bold text-xs text-forge">
              {user?.displayName?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-xs font-medium text-txt-primary hidden sm:inline-block max-w-[100px] truncate">
              {user?.displayName || "Alex Rivera"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-txt-muted" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-card border border-surface-border rounded-2xl shadow-glow-card p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="px-3 py-2 border-b border-surface-border/60">
                <p className="text-xs font-semibold text-txt-primary truncate">{user?.displayName || "Alex Rivera"}</p>
                <p className="text-[11px] text-txt-muted truncate">{user?.email || "alex.forge@example.com"}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Preferences</span>
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-status-error hover:bg-status-error/15 transition-colors border-t border-surface-border/40 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-surface/98 backdrop-blur-xl z-50 p-6 flex flex-col justify-between lg:hidden animate-in slide-in-from-top duration-200">
          <nav className="space-y-3">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "AI Planner", href: "/planner" },
              { label: "Focus Mode", href: "/focus" },
              { label: "Tracking Sheet", href: "/tracking" },
              { label: "AI Coach", href: "/ai-coach" },
              { label: "Analytics", href: "/analytics" },
              { label: "Rewards", href: "/rewards" },
              { label: "Resources", href: "/resources" },
              { label: "Settings", href: "/settings" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-txt-primary hover:text-forge p-2 rounded-xl border border-transparent hover:border-surface-border"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-6 border-t border-surface-border">
            <Button
              variant="danger"
              size="md"
              className="w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                signOut();
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
