import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

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

    if (session.status !== "paused") {
      return NextResponse.json({ session });
    }

    session.status = "running";
    const lastPause = session.pauseEvents[session.pauseEvents.length - 1];
    if (lastPause && !lastPause.resumedAt) {
      lastPause.resumedAt = new Date().toISOString();
    }

    mockDB.focusSessions.set(sessionId, session);
    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
