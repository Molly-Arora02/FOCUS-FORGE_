"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && !user.onboardingCompleted && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-txt-primary">
        <div className="w-12 h-12 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center shadow-glow animate-pulse">
          <div className="w-5 h-5 border-2 border-forge border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-4 font-mono text-xs tracking-widest text-forge uppercase">Initializing Forge Core...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex text-txt-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto pb-16">{children}</main>
      </div>
    </div>
  );
};
