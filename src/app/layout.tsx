import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";

export const metadata: Metadata = {
  title: "Focus Forge — AI-Powered Focus, Productivity & Habit Operating System",
  description:
    "Forge your focus. Build your future. An AI-powered personal productivity companion for deep work, intelligent planning, deterministic rewards, and habit mastery.",
  keywords: ["productivity", "focus", "deep work", "ai planner", "study routine", "pomodoro alternative"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-txt-primary min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
