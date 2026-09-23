import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";
  const days = Number(searchParams.get("days")) || 60;

  const heatmap = mockDB.getHeatmapData(userId, days);
  return NextResponse.json({ heatmap });
}
