import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo-user-123";

    const allSessions = Array.from(mockDB.focusSessions.values());
    const userSessions = allSessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return NextResponse.json({
      success: true,
      sessions: userSessions,
      count: userSessions.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch focus sessions" }, { status: 500 });
  }
}
