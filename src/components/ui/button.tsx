import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "forge" | "secondary" | "outline" | "danger" | "ghost" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "forge",
      size = "md",
      isLoading = false,
      glow = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-3 gap-2.5 h-12",
      icon: "w-10 h-10 p-0 items-center justify-center",
    };

    const variantStyles = {
      forge:
        "bg-forge text-surface-DEFAULT font-semibold hover:bg-forge-hover shadow-glow hover:shadow-glow-lg border border-[#5AFFAC]/40",
      secondary:
        "bg-surface-card text-txt-primary border border-surface-border hover:border-forge/40 hover:bg-surface-hover",
      outline:
        "border border-surface-border text-txt-primary hover:border-forge/60 hover:text-forge bg-transparent",
      danger:
        "bg-status-error/15 text-status-error border border-status-error/30 hover:bg-status-error/25",
      ghost:
        "text-txt-secondary hover:text-txt-primary hover:bg-surface-hover/60",
      glass:
        "bg-surface-glass backdrop-blur-md text-txt-primary border border-surface-border/80 hover:border-forge/50 shadow-glass",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          glow && "shadow-glow",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
