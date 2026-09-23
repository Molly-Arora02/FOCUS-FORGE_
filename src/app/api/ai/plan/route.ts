import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { AIService } from "@/lib/ai/provider";
import { getTodayDateString } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user-123", dateStr, availableHours } = body;

    const user = mockDB.users.get(userId) || mockDB.users.get("demo-user-123")!;
    const goals = Array.from(mockDB.goals.values()).filter((g) => g.userId === userId);
    const subjects = Array.from(mockDB.subjects.values()).filter((s) => s.userId === userId);
    const existingTasks = Array.from(mockDB.tasks.values()).filter((t) => t.userId === userId);

    const targetDate = dateStr || getTodayDateString(user.timezone);

    const generatedPlan = await AIService.generateDailyPlan({
      user,
      goals,
      subjects,
      existingTasks,
      availableHours,
      dateStr: targetDate,
    });

    const planId = `plan-${targetDate}-${userId}`;
    const fullPlan = {
      _id: planId,
      userId,
      ...generatedPlan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDB.dailyPlans.set(planId, fullPlan);

    return NextResponse.json({ plan: fullPlan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
