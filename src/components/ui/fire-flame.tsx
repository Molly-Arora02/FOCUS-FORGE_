"use client";

import React from "react";

interface FireFlameProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

export const FireFlame: React.FC<FireFlameProps> = ({
  size = "md",
  className = "",
  animate = true,
}) => {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-10 h-10",
  };

  const id = React.useId();

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeMap[size]} ${animate ? "animate-pulse" : ""} ${className}`}
      style={{
        filter: "drop-shadow(0 0 8px rgba(255, 115, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 42, 0, 0.5))",
      }}
    >
      <defs>
        {/* Outer Flame Gradient: Deep Crimson to Electric Orange */}
        <linearGradient id={`outerFire-${id}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#D60000" />
          <stop offset="35%" stopColor="#FF3D00" />
          <stop offset="70%" stopColor="#FF8500" />
          <stop offset="100%" stopColor="#FFAA00" />
        </linearGradient>

        {/* Mid Fire Gradient: Searing Orange to Bright Gold */}
        <linearGradient id={`midFire-${id}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF2E00" />
          <stop offset="50%" stopColor="#FF9100" />
          <stop offset="100%" stopColor="#FFD000" />
        </linearGradient>

        {/* Inner Core Flame: Hot Blazing Yellow to Pure White Core */}
        <linearGradient id={`coreFire-${id}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF8000" />
          <stop offset="40%" stopColor="#FFEA00" />
          <stop offset="85%" stopColor="#FFFF80" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Outer Wild Fire Layer */}
      <path
        d="M12 2C10.5 4.5 9 6.5 9 9C9 10.1 9.4 11.1 10 11.9C9.4 11.3 9 10.4 9 9.5C7.3 11 6 13.2 6 15.5C6 19.1 8.7 22 12 22C15.3 22 18 19.1 18 15.5C18 11.5 14.5 8 13.5 5.5C13 4.3 12.5 3.1 12 2Z"
        fill={`url(#outerFire-${id})`}
      />

      {/* Mid Blazing Flame Tongue */}
      <path
        d="M12 6.5C11.5 8 10.5 9.5 10.5 11C10.5 12 11 12.8 11.5 13.5C10.8 13 10.5 12.2 10.5 11.5C9.5 12.5 8.5 14 8.5 15.5C8.5 17.7 10.1 19.5 12 19.5C13.9 19.5 15.5 17.7 15.5 15.5C15.5 12.8 13.5 10 12.8 8.5C12.5 7.8 12.2 7.1 12 6.5Z"
        fill={`url(#midFire-${id})`}
      />

      {/* Hot Core Incandescent Heart */}
      <path
        d="M12 11C11.6 12 11 13 11 14C11 14.6 11.3 15.1 11.7 15.5C11.3 15.2 11 14.7 11 14.2C10.5 14.8 10 15.7 10 16.5C10 17.9 10.9 19 12 19C13.1 19 14 17.9 14 16.5C14 14.8 12.8 13 12.4 12C12.2 11.6 12.1 11.3 12 11Z"
        fill={`url(#coreFire-${id})`}
      />
    </svg>
  );
};

export const FireStreakBadge: React.FC<{
  streak?: number;
  className?: string;
  showLabel?: boolean;
}> = ({ streak = 0, className = "", showLabel = true }) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
        streak > 0
          ? "bg-gradient-to-r from-[#FF2A00]/20 via-[#FF7300]/15 to-[#FFD000]/10 border-[#FF7300]/50 shadow-[0_0_15px_rgba(255,115,0,0.35)] text-[#FFAA00]"
          : "bg-surface-card border-surface-border text-txt-muted"
      } ${className}`}
    >
      <FireFlame size="sm" animate={streak > 0} />
      <span className="font-mono font-bold text-xs tracking-tight">
        {streak} {showLabel ? (streak === 1 ? "Day Streak" : "Days Streak") : "d"}
      </span>
    </div>
  );
};
