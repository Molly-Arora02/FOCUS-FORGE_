import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { Subject } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const userSubjects = Array.from(mockDB.subjects.values()).filter((s) => s.userId === userId);
  return NextResponse.json({ subjects: userSubjects });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user-123", name, color = "#43F59A", icon = "BookOpen", topics = [], estimatedWeeklyHours = 5, goalId } = body;

    if (!name) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    const subId = `subj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newSubject: Subject = {
      _id: subId,
      userId,
      name,
      color,
      icon,
      topics,
      goalId,
      estimatedWeeklyHours: Number(estimatedWeeklyHours) || 5,
      createdAt: new Date().toISOString(),
    };

    mockDB.subjects.set(subId, newSubject);
    return NextResponse.json({ subject: newSubject });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });

    const subject = mockDB.subjects.get(id);
    if (!subject) return NextResponse.json({ error: "Subject not found" }, { status: 404 });

    const updated = { ...subject, ...updates };
    mockDB.subjects.set(id, updated);
    return NextResponse.json({ subject: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });

  mockDB.subjects.delete(id);
  return NextResponse.json({ success: true });
}
