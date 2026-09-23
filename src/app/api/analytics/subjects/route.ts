import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const subjects = Array.from(mockDB.subjects.values()).filter((s) => s.userId === userId);
  const sessions = Array.from(mockDB.focusSessions.values()).filter(
    (s) => s.userId === userId && s.status === "completed"
  );

  const subjectStats = subjects.map((sub) => {
    const subSessions = sessions.filter((sess) => sess.subjectId === sub._id);
    const totalMinutes = subSessions.reduce((acc, sess) => acc + Math.round(sess.actualDuration / 60), 0);
    const targetMinutes = (sub.estimatedWeeklyHours || 5) * 60;
    const progressPercent = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));

    return {
      id: sub._id,
      name: sub.name,
      color: sub.color,
      icon: sub.icon,
      totalMinutes,
      targetMinutes,
      sessionsCount: subSessions.length,
      progressPercent,
    };
  });

  return NextResponse.json({ subjectStats });
}
