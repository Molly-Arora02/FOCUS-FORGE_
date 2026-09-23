import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { UserProfile, Goal, Subject } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      authUserId,
      email,
      displayName,
      role,
      timezone,
      preferences,
      goals,
      subjects,
    } = body;

    const userId = authUserId || `user-${Date.now()}`;

    // 1. Create / Update User Profile
    const newUser: UserProfile = {
      _id: userId,
      authUserId: userId,
      email: email || "user@example.com",
      displayName: displayName || "Forge Builder",
      role: role || "student",
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      onboardingCompleted: true,
      preferences: {
        preferredSessionLength: preferences?.preferredSessionLength || 25,
        preferredFocusHours: preferences?.preferredFocusHours || { start: "09:00", end: "18:00" },
        coachingStyle: preferences?.coachingStyle || "empathetic",
        planningPreferences: {
          autoScheduleBreaks: true,
          bufferMinutes: 10,
          maxDailyHours: preferences?.maxDailyHours || 6,
          aiGeneratedPlans: true,
        },
        cameraFocusEnabled: preferences?.cameraFocusEnabled || false,
        checkInFrequencyMinutes: 30,
        soundEnabled: true,
        dailyFocusTargetMinutes: preferences?.dailyFocusTargetMinutes || 180,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDB.users.set(userId, newUser);

    // 2. Persist initial subjects if passed
    if (Array.isArray(subjects)) {
      for (const s of subjects) {
        const subId = `subj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newSub: Subject = {
          _id: subId,
          userId,
          name: s.name,
          color: s.color || "#43F59A",
          icon: s.icon || "BookOpen",
          topics: s.topics || [],
          estimatedWeeklyHours: s.estimatedWeeklyHours || 5,
          createdAt: new Date().toISOString(),
        };
        mockDB.subjects.set(subId, newSub);
      }
    }

    // 3. Persist initial goals if passed
    if (Array.isArray(goals)) {
      for (const g of goals) {
        const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newGoal: Goal = {
          _id: goalId,
          userId,
          title: g.title,
          category: g.category || "skill",
          priority: g.priority || "high",
          targetDate: g.targetDate,
          weeklyTargetHours: g.weeklyTargetHours || 6,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockDB.goals.set(goalId, newGoal);
      }
    }

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
