import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { Task } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const userTasks = Array.from(mockDB.tasks.values()).filter((t) => t.userId === userId);
  return NextResponse.json({ tasks: userTasks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user-123",
      title,
      subjectId,
      goalId,
      description,
      priority = "medium",
      estimatedDuration = 25,
      scheduledStart,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newTask: Task = {
      _id: taskId,
      userId,
      subjectId,
      goalId,
      title,
      description,
      priority,
      scheduledStart,
      estimatedDuration: Number(estimatedDuration) || 25,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDB.tasks.set(taskId, newTask);
    return NextResponse.json({ task: newTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

    const task = mockDB.tasks.get(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updated = {
      ...task,
      ...updates,
      completedAt: updates.status === "completed" ? new Date().toISOString() : task.completedAt,
      updatedAt: new Date().toISOString(),
    };
    mockDB.tasks.set(id, updated);
    return NextResponse.json({ task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

  mockDB.tasks.delete(id);
  return NextResponse.json({ success: true });
}
