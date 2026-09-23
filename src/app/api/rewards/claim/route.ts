import { NextRequest, NextResponse } from "next/server";
import { RewardsEngine } from "@/lib/rewards/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user-123", rewardId } = body;

    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 });
    }

    const result = RewardsEngine.claimReward(userId, rewardId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, reward: result.reward });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
