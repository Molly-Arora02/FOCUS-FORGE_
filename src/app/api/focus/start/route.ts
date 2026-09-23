import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { FocusSession } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user-123",
      subjectId,
      taskId,
      topic,
      plannedDuration = 25,
      resourceAttachment,
    } = body;

    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newSession: FocusSession = {
      _id: sessionId,
      userId,
      subjectId,
      taskId,
      topic: topic || "Deep Focus Sprint",
      plannedDuration: Number(plannedDuration) || 25,
      actualDuration: 0,
      status: "running",
      startedAt: new Date().toISOString(),
      pauseEvents: [],
      completionOutcome: "fully_completed",
      resourceAttachment,
      createdAt: new Date().toISOString(),
    };

    mockDB.focusSessions.set(sessionId, newSession);

    // If attached to a task, mark task as in_progress
    if (taskId) {
      const task = mockDB.tasks.get(taskId);
      if (task) {
        task.status = "in_progress";
        task.updatedAt = new Date().toISOString();
        mockDB.tasks.set(taskId, task);
      }
    }

    return NextResponse.json({ session: newSession });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
