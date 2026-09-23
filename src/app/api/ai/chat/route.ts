import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { AIService } from "@/lib/ai/provider";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const conversation = Array.from(mockDB.aiConversations.values()).find((c) => c.userId === userId);
  return NextResponse.json({ conversation: conversation || null });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user-123", message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const user = mockDB.users.get(userId) || mockDB.users.get("demo-user-123")!;
    const goals = Array.from(mockDB.goals.values()).filter((g) => g.userId === userId);
    const subjects = Array.from(mockDB.subjects.values()).filter((s) => s.userId === userId);
    const recentSessions = Array.from(mockDB.focusSessions.values())
      .filter((s) => s.userId === userId)
      .slice(-5);
    const pendingTasks = Array.from(mockDB.tasks.values())
      .filter((t) => t.userId === userId && t.status !== "completed");

    let conv = Array.from(mockDB.aiConversations.values()).find((c) => c.userId === userId);
    if (!conv) {
      conv = {
        _id: `conv-${userId}`,
        userId,
        title: "Focus Coaching Stream",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDB.aiConversations.set(conv._id, conv);
    }

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: "user" as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    conv.messages.push(userMsg);

    // Call AI Service
    const coachResponse = await AIService.askCoach({
      user,
      goals,
      subjects,
      recentSessions,
      pendingTasks,
      userMessage: message,
      conversationHistory: conv.messages,
    });

    const coachMsg = {
      id: `msg-${Date.now()}-coach`,
      sender: "coach" as const,
      content: coachResponse.message,
      timestamp: new Date().toISOString(),
      suggestedActions: coachResponse.suggestedActions,
    };
    conv.messages.push(coachMsg);
    conv.updatedAt = new Date().toISOString();

    return NextResponse.json({
      reply: coachMsg,
      conversation: conv,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
