import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-txt-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl bg-surface-card border border-surface-border px-4 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted transition-all duration-200 outline-none focus:border-forge focus:ring-1 focus:ring-forge/50 focus:shadow-glow disabled:opacity-50",
              icon && "pl-10",
              error && "border-status-error focus:border-status-error focus:ring-status-error/40",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-surface-card border border-surface-border px-4 py-3 text-sm text-txt-primary placeholder:text-txt-muted transition-all duration-200 outline-none focus:border-forge focus:ring-1 focus:ring-forge/50 focus:shadow-glow disabled:opacity-50 resize-y",
            error && "border-status-error focus:border-status-error focus:ring-status-error/40",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
