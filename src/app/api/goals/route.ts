import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { Goal } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const userGoals = Array.from(mockDB.goals.values()).filter((g) => g.userId === userId);
  return NextResponse.json({ goals: userGoals });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user-123", title, category = "skill", priority = "medium", targetDate, weeklyTargetHours = 5, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Goal title is required" }, { status: 400 });
    }

    const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newGoal: Goal = {
      _id: goalId,
      userId,
      title,
      description,
      category,
      priority,
      targetDate,
      weeklyTargetHours: Number(weeklyTargetHours) || 5,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDB.goals.set(goalId, newGoal);
    return NextResponse.json({ goal: newGoal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });

    const goal = mockDB.goals.get(id);
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    const updated = { ...goal, ...updates, updatedAt: new Date().toISOString() };
    mockDB.goals.set(id, updated);
    return NextResponse.json({ goal: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });

  mockDB.goals.delete(id);
  return NextResponse.json({ success: true });
}
