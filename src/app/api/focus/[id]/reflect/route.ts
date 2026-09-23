import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const { focusRating, reflectionNotes, distractionsReported, completionOutcome } = body;

    const session = mockDB.focusSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    session.focusRating = focusRating ? Number(focusRating) : session.focusRating;
    session.reflectionNotes = reflectionNotes || session.reflectionNotes;
    session.distractionsReported = distractionsReported || session.distractionsReported;
    session.completionOutcome = completionOutcome || session.completionOutcome;

    mockDB.focusSessions.set(sessionId, session);

    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
