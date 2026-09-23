import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { TimerEngine } from "@/lib/timer/engine";
import { RewardsEngine } from "@/lib/rewards/engine";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const session = mockDB.focusSessions.get(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const endedAt = new Date().toISOString();

    // Close any open pause event
    const lastPause = session.pauseEvents[session.pauseEvents.length - 1];
    if (lastPause && !lastPause.resumedAt) {
      lastPause.resumedAt = endedAt;
    }

    // Calculate pure focused duration
    const pureSeconds = TimerEngine.calculatePureFocusedSeconds(
      session.startedAt,
      session.pauseEvents,
      session.status,
      endedAt
    );

    const body = await request.json().catch(() => ({}));
    const isEarlyExit = Boolean(body.isEarlyExit);

    session.actualDuration = pureSeconds;
    session.status = isEarlyExit ? "abandoned" : "completed";
    session.endedAt = endedAt;

    // Retrieve subject name if linked
    const subject = session.subjectId ? mockDB.subjects.get(session.subjectId) : null;

    mockDB.focusSessions.set(sessionId, session);

    // If attached to a task, mark as completed only if full completion
    if (session.taskId && !isEarlyExit) {
      const task = mockDB.tasks.get(session.taskId);
      if (task) {
        task.status = "completed";
        task.completedAt = endedAt;
        task.updatedAt = endedAt;
        mockDB.tasks.set(session.taskId, task);
      }
    }

    // Award deterministic points & check milestone unlocks
    const { pointsAwarded, newMilestoneUnlocked } = RewardsEngine.awardSessionPoints(
      session.userId,
      sessionId,
      pureSeconds,
      subject?.name,
      isEarlyExit
    );

    return NextResponse.json({
      session,
      pointsAwarded,
      newMilestoneUnlocked,
      isEarlyExit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
