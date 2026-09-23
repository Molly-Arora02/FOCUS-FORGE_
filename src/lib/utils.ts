import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(minutes: number): string {
  if (!minutes || minutes < 0) return "0m";
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatSecondsToTimer(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function getTodayDateString(timezone?: string): string {
  const d = new Date();
  if (timezone) {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    } catch {
      // Fallback if timezone string is invalid
    }
  }
  return d.toISOString().split("T")[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function calculateIntensity(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (!minutes || minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 90) return 2;
  if (minutes < 180) return 3;
  return 4;
}

export const CURATED_QUOTES = [
  { text: "Focus is a muscle. The more you shield it from distraction, the stronger it grows.", author: "Focus Forge Philosophy" },
  { text: "Small, relentless daily blocks build unstoppable long-term mastery.", author: "Daily Forge Principle" },
  { text: "Depth over speed. One hour of pure immersion beats four hours of fragmented attention.", author: "The Deep Work Method" },
  { text: "Distraction is an impulse; focus is a deliberate decision you make right now.", author: "Forge Mindset" },
  { text: "Action precedes motivation. Enter the session first; flow will follow.", author: "Habit Architecture" },
];
