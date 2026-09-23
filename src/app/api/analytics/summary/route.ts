import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const summary = mockDB.getProductivitySummary(userId);
  return NextResponse.json({ summary });
}
