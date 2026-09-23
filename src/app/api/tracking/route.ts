import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { FocusSession } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";
  const subjectId = searchParams.get("subjectId");
  const search = searchParams.get("search")?.toLowerCase();

  let sessions = Array.from(mockDB.focusSessions.values())
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  if (subjectId && subjectId !== "all") {
    sessions = sessions.filter((s) => s.subjectId === subjectId);
  }

  if (search) {
    sessions = sessions.filter(
      (s) =>
        s.topic?.toLowerCase().includes(search) ||
        s.reflectionNotes?.toLowerCase().includes(search)
    );
  }

  const enrichedSessions = sessions.map((sess) => {
    const sub = sess.subjectId ? mockDB.subjects.get(sess.subjectId) : null;
    return {
      ...sess,
      subjectName: sub ? sub.name : "General Focus",
      subjectColor: sub ? sub.color : "#E11D48",
    };
  });

  return NextResponse.json({ sessions: enrichedSessions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user-123",
      subjectId,
      topic,
      actualDurationMinutes,
      durationMinutes,
      duration,
      focusRating = 5,
      notes,
      reflectionNotes,
      date,
    } = body;

    const mins = Number(actualDurationMinutes || durationMinutes || duration);

    if (!topic || !mins) {
      return NextResponse.json(
        { error: "Topic and duration are required" },
        { status: 400 }
      );
    }

    const durationSeconds = mins * 60;
    const sessionDate = date ? new Date(date) : new Date();

    const newSession: FocusSession = {
      _id: `manual-sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      subjectId: subjectId || undefined,
      topic,
      plannedDuration: Number(actualDurationMinutes),
      actualDuration: durationSeconds,
      status: "completed",
      startedAt: sessionDate.toISOString(),
      endedAt: new Date(sessionDate.getTime() + durationSeconds * 1000).toISOString(),
      pauseEvents: [],
      focusRating: Number(focusRating),
      reflectionNotes,
      completionOutcome: "fully_completed",
      createdAt: sessionDate.toISOString(),
    };

    mockDB.focusSessions.set(newSession._id, newSession);

    // Credit points
    const points = Number(actualDurationMinutes) * 10;
    const ledgerId = `ledger-${newSession._id}`;
    mockDB.pointsLedger.set(ledgerId, {
      _id: ledgerId,
      userId,
      eventType: "session_completed",
      points,
      sessionId: newSession._id,
      idempotencyKey: `points-${newSession._id}`,
      reason: `Logged ${actualDurationMinutes}m manual session: ${topic}`,
      createdAt: newSession.endedAt || newSession.startedAt,
    });

    const sub = subjectId ? mockDB.subjects.get(subjectId) : null;

    return NextResponse.json({
      session: {
        ...newSession,
        subjectName: sub ? sub.name : "General Focus",
        subjectColor: sub ? sub.color : "#E11D48",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  mockDB.focusSessions.delete(id);
  return NextResponse.json({ success: true });
}
