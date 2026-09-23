"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types";
import { createClient } from "./supabase";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoUser: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithDemo: (role?: "molly" | "student" | "professional") => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "focusforge_active_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  // Initialize session
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Check local cached user session
        const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setUser(parsed);
            setIsDemoUser(parsed._id === "demo-user-123" || parsed._id.startsWith("demo-"));
            setIsLoading(false);
            return;
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          }
        }

        // 2. Try Supabase session if configured
        const supabase = createClient();
        if (supabase) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch MongoDB user profile by authUserId
            const res = await fetch(`/api/profile?authUserId=${session.user.id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.user) {
                setUser(data.user);
                setIsDemoUser(false);
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
              }
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) return { error: error.message };
        if (data.user) {
          const res = await fetch(`/api/profile?authUserId=${data.user.id}`);
          if (res.ok) {
            const profileData = await res.json();
            setUser(profileData.user);
            setIsDemoUser(false);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profileData.user));
            return {};
          }
        }
      }

      // Fallback for demo/offline: check if matching seeded user or create profile
      const cleanEmail = email.toLowerCase().trim();
      let targetUserId = "demo-user-123";
      let targetRole: "student" | "professional" = "student";
      let displayName = email.split("@")[0];

      if (cleanEmail.includes("molly")) {
        targetUserId = "molly-user-123";
        displayName = "Molly Arora";
      } else if (cleanEmail.includes("jordan") || cleanEmail.includes("pro")) {
        targetUserId = "pro-user-123";
        targetRole = "professional";
        displayName = "Jordan Vance";
      } else if (cleanEmail.includes("alex")) {
        targetUserId = "demo-user-123";
        displayName = "Alex Rivera";
      }

      const res = await fetch(`/api/profile?userId=${targetUserId}`);
      const data = await res.json();
      const loadedUser = data.user || {
        _id: targetUserId,
        authUserId: targetUserId,
        email,
        displayName,
        role: targetRole,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        onboardingCompleted: true,
        preferences: {
          preferredSessionLength: 25,
          preferredFocusHours: { start: "08:30", end: "20:00" },
          coachingStyle: "empathetic",
          planningPreferences: {
            autoScheduleBreaks: true,
            bufferMinutes: 10,
            maxDailyHours: 6,
            aiGeneratedPlans: true,
          },
          cameraFocusEnabled: true,
          checkInFrequencyMinutes: 30,
          soundEnabled: true,
          dailyFocusTargetMinutes: 180,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(loadedUser);
      setIsDemoUser(true);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loadedUser));
      return {};
    } catch (err: any) {
      return { error: err.message || "Failed to sign in" };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { display_name: name } },
        });
        if (error) return { error: error.message };
        if (data.user) {
          // Register in MongoDB
          const createRes = await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authUserId: data.user.id,
              email,
              displayName: name || email.split("@")[0],
            }),
          });
          const created = await createRes.json();
          if (created.user) {
            setUser(created.user);
            setIsDemoUser(false);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(created.user));
          }
          return {};
        }
      }

      // Offline / Demo Signup
      const newUserId = "user-" + Date.now();
      const newUser: UserProfile = {
        _id: newUserId,
        authUserId: newUserId,
        email,
        displayName: name || email.split("@")[0],
        role: "student",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        onboardingCompleted: false,
        preferences: {
          preferredSessionLength: 25,
          preferredFocusHours: { start: "09:00", end: "18:00" },
          coachingStyle: "empathetic",
          planningPreferences: {
            autoScheduleBreaks: true,
            bufferMinutes: 10,
            maxDailyHours: 6,
            aiGeneratedPlans: true,
          },
          cameraFocusEnabled: false,
          checkInFrequencyMinutes: 30,
          soundEnabled: true,
          dailyFocusTargetMinutes: 180,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newUser);
      setIsDemoUser(true);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      return {};
    } catch (err: any) {
      return { error: err.message || "Failed to create account" };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: "email profile https://www.googleapis.com/auth/drive.readonly",
        },
      });
      if (error) return { error: error.message };
      return {};
    }
    // Demo fallback for instant Google sign-in
    await signInWithDemo("molly");
    return {};
  };

  const signInWithDemo = async (role: "molly" | "student" | "professional" = "molly") => {
    setIsLoading(true);
    try {
      let targetUserId = "molly-user-123";
      if (role === "student") targetUserId = "demo-user-123";
      if (role === "professional") targetUserId = "pro-user-123";

      const res = await fetch(`/api/profile?userId=${targetUserId}`);
      const data = await res.json();
      const demoUser = data.user;
      if (demoUser) {
        setUser(demoUser);
        setIsDemoUser(true);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
      }
    } catch (err) {
      console.error("Demo login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setUser(null);
      setIsDemoUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/profile?userId=${user._id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithDemo,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
