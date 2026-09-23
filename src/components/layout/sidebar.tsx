"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Flame,
  Bot,
  BarChart3,
  Award,
  BookOpen,
  FolderSync,
  Settings,
  User,
  FileSpreadsheet,
} from "lucide-react";
import { Logo } from "../ui/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Planner", href: "/planner", icon: Calendar, badge: "AI" },
  { label: "Focus Mode", href: "/focus", icon: Flame },
  { label: "Tracking Sheet", href: "/tracking", icon: FileSpreadsheet },
  { label: "AI Coach", href: "/ai-coach", icon: Bot, badge: "Live" },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Rewards", href: "/rewards", icon: Award },
  { label: "Resources", href: "/resources", icon: BookOpen },
  { label: "Integrations", href: "/integrations", icon: FolderSync },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-surface-border p-4 sticky top-0 h-screen justify-between select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 py-1">
          <Logo size="md" showWordmark href="/dashboard" />
        </div>

        {/* Global Quick Action */}
        <div className="px-2">
          <Link href="/focus">
            <Button
              variant="forge"
              size="md"
              className="w-full flex items-center justify-center gap-2 font-semibold shadow-glow hover:shadow-glow-lg"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Enter Focus Mode</span>
            </Button>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-surface-card text-forge border border-forge/30 shadow-glow"
                    : "text-txt-secondary hover:text-txt-primary hover:bg-surface-card/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-forge" : "text-txt-muted group-hover:text-txt-primary"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded-full border",
                      item.badge === "AI"
                        ? "bg-forge/15 text-forge border-forge/30"
                        : "bg-surface-border text-txt-muted border-surface-border"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status */}
      <div className="p-3 rounded-xl bg-surface-card/60 border border-surface-border/60 text-xs text-txt-muted space-y-1">
        <div className="flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forge animate-pulse" />
            Forge Engine Active
          </span>
          <span className="text-[10px] text-forge">v1.0</span>
        </div>
        <p className="text-[11px] text-txt-muted/80">Plan → Focus → Reflect</p>
      </div>
    </aside>
  );
};
