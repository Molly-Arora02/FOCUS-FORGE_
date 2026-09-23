import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const userRewards = Array.from(mockDB.rewards.values()).filter((r) => r.userId === userId);
  const ledgerEntries = Array.from(mockDB.pointsLedger.values())
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPoints = ledgerEntries.reduce((acc, entry) => acc + entry.points, 0);

  return NextResponse.json({
    rewards: userRewards,
    ledger: ledgerEntries,
    totalPoints,
  });
}
