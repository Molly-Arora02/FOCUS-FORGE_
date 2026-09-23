import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { connectToDatabase } from "@/lib/db/mongodb";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  mockDB.seedDemoData();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const authUserId = searchParams.get("authUserId");

  if (!userId && !authUserId) {
    const demo = mockDB.users.get("molly-user-123") || mockDB.users.get("demo-user-123");
    return NextResponse.json({ user: demo });
  }

  let user = userId ? mockDB.users.get(userId) : null;
  if (!user && authUserId) {
    user = Array.from(mockDB.users.values()).find((u) => u.authUserId === authUserId) || null;
  }

  return NextResponse.json({ user: user || null });
}

export async function PATCH(request: NextRequest) {
  await connectToDatabase();
  mockDB.seedDemoData();
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let user = mockDB.users.get(userId);
    if (!user) {
      user = {
        _id: userId,
        authUserId: userId,
        email: `${userId}@focusforge.io`,
        displayName: userId.replace("-user-123", ""),
        role: "student",
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
    }

    const updatedUser = {
      ...user,
      ...updates,
      preferences: {
        ...user.preferences,
        ...(updates.preferences || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    mockDB.users.set(userId, updatedUser);
    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
