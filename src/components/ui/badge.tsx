import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "forge" | "default" | "warning" | "error" | "info" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}) => {
  const variantStyles = {
    forge: "bg-forge/15 text-forge border-forge/30",
    default: "bg-surface-hover text-txt-secondary border-surface-border",
    warning: "bg-status-warning/15 text-status-warning border-status-warning/30",
    error: "bg-status-error/15 text-status-error border-status-error/30",
    info: "bg-status-info/15 text-status-info border-status-info/30",
    outline: "bg-transparent text-txt-primary border-surface-border",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 font-medium",
    md: "text-sm px-3 py-1 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
