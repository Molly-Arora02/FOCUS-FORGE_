import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showWordmark = true,
  className,
  href = "/",
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const content = (
    <div className={cn("flex items-center gap-3 select-none group", className)}>
      {/* Geometric Crimson Forge & Focus Aperture Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0D0D0D] to-[#1A0A0E] border border-[#3A141A] group-hover:border-forge/80 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-forge group-hover:scale-105 transition-transform duration-300"
        >
          {/* Anvil Base */}
          <path
            d="M6 24H26L23 20H9L6 24Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          {/* Crimson Forge Flame Core */}
          <path
            d="M16 6L21 15H11L16 6Z"
            fill="#FFA0AE"
            className="drop-shadow-[0_0_10px_rgba(255,42,77,0.9)]"
          />
          {/* Center Aperture */}
          <circle cx="16" cy="14" r="2.5" fill="#050505" />
          <circle cx="16" cy="14" r="1.2" fill="#FF2A4D" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-bold tracking-tight text-txt-primary flex items-center gap-1.5",
              textSizes[size]
            )}
          >
            FOCUS <span className="text-forge">FORGE</span>
          </span>
          {size === "lg" || size === "xl" ? (
            <span className="text-xs tracking-widest text-forge uppercase font-mono">
              AI Productivity OS
            </span>
          ) : null}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
