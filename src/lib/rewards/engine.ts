import { mockDB } from "../db/mock-store";
import { PointsLedgerEntry, Reward } from "@/types";

export class RewardsEngine {
  public static awardSessionPoints(
    userId: string,
    sessionId: string,
    pureFocusedSeconds: number,
    subjectName?: string,
    isEarlyExit?: boolean
  ): { pointsAwarded: number; newMilestoneUnlocked?: Reward } {
    // If early abandonment, deduct -5 points penalty
    if (isEarlyExit) {
      return this.deductEarlyAbandonmentPenalty(userId, sessionId);
    }

    // 1. Calculate deterministic base points (+10 points for completion bonus)
    const basePoints = 10;
    const idempotencyKey = `session-${sessionId}-completion`;

    // 2. Prevent duplicate award using idempotencyKey check
    const existing = Array.from(mockDB.pointsLedger.values()).find(
      (p) => p.idempotencyKey === idempotencyKey
    );
    if (existing) {
      return { pointsAwarded: 0 };
    }

    // 3. Record transaction in Points Ledger
    const ledgerEntry: PointsLedgerEntry = {
      _id: `ledger-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      eventType: "session_completed",
      points: basePoints,
      sessionId,
      idempotencyKey,
      reason: `Completed focus session (+10 pts)${subjectName ? ` on ${subjectName}` : ""}`,
      createdAt: new Date().toISOString(),
    };
    mockDB.pointsLedger.set(ledgerEntry._id, ledgerEntry);

    // 4. Audit total cumulative hours and evaluate milestones
    let totalSeconds = 0;
    Array.from(mockDB.focusSessions.values())
      .filter((s) => s.userId === userId && s.status === "completed")
      .forEach((s) => (totalSeconds += s.actualDuration));

    const totalHours = totalSeconds / 3600;
    let newMilestone: Reward | undefined;

    const milestones = [
      { hours: 50, id: "reward-50h", title: "Novice Blacksmith Digital Card", desc: "50 hours of verified focus", icon: "Shield", type: "digital_card" as const },
      { hours: 100, id: "reward-100h", title: "Focus Adept Tier", desc: "100 hours of deep work", icon: "Award", type: "badge" as const },
      { hours: 200, id: "reward-200h", title: "Master of the Forge Partner Perks", desc: "200 hours of mastery", icon: "Crown", type: "partner_coupon" as const, code: "FORGE-PRO-200" },
      { hours: 500, id: "reward-500h", title: "Grandmaster Forgekeeper Merch Tier", desc: "500 hours legendary milestone", icon: "Zap", type: "merchandise_eligibility" as const },
    ];

    for (const m of milestones) {
      if (totalHours >= m.hours) {
        let reward = mockDB.rewards.get(m.id);
        if (!reward) {
          reward = {
            _id: m.id,
            userId,
            rewardType: m.type,
            milestoneHours: m.hours,
            title: m.title,
            description: m.desc,
            badgeIcon: m.icon,
            code: (m as any).code,
            status: "unlocked",
            createdAt: new Date().toISOString(),
          };
          mockDB.rewards.set(reward._id, reward);
          newMilestone = reward;
        } else if (reward.status === "locked") {
          reward.status = "unlocked";
          mockDB.rewards.set(reward._id, reward);
          newMilestone = reward;
        }
      }
    }

    return { pointsAwarded: basePoints, newMilestoneUnlocked: newMilestone };
  }

  public static deductEarlyAbandonmentPenalty(
    userId: string,
    sessionId: string
  ): { pointsAwarded: number } {
    const idempotencyKey = `session-${sessionId}-early-exit-penalty`;
    const existing = Array.from(mockDB.pointsLedger.values()).find(
      (p) => p.idempotencyKey === idempotencyKey
    );
    if (existing) {
      return { pointsAwarded: -5 };
    }

    const ledgerEntry: PointsLedgerEntry = {
      _id: `ledger-penalty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      eventType: "session_abandoned",
      points: -5,
      sessionId,
      idempotencyKey,
      reason: "Early session exit penalty (-5 pts)",
      createdAt: new Date().toISOString(),
    };
    mockDB.pointsLedger.set(ledgerEntry._id, ledgerEntry);
    return { pointsAwarded: -5 };
  }

  public static claimReward(userId: string, rewardId: string): { success: boolean; reward?: Reward; error?: string } {
    let userKey = `${userId}-${rewardId}`;
    let reward = mockDB.rewards.get(userKey);

    if (!reward) {
      reward = Array.from(mockDB.rewards.values()).find(
        (r) => r.userId === userId && (r._id === rewardId || r._id.includes(rewardId.replace(/^reward-/, "")))
      );
    }
    
    // If not found in user map, check default milestones and create for user
    if (!reward) {
      const defaultMilestones = [
        { hours: 50, id: "reward-50h", title: "Novice Blacksmith Focus Card", desc: "50 hours of verified focus", icon: "Shield", type: "digital_card" as const },
        { hours: 100, id: "reward-100h", title: "Focus Adept Tier", desc: "100 hours of deep work", icon: "Award", type: "badge" as const },
        { hours: 200, id: "reward-200h", title: "Master of the Forge Partner Perks", desc: "200 hours of mastery", icon: "Crown", type: "partner_coupon" as const, code: "FORGE-PRO-200" },
        { hours: 500, id: "reward-500h", title: "Grandmaster Forgekeeper Merch Tier", desc: "500 hours legendary milestone", icon: "Zap", type: "merchandise_eligibility" as const },
      ];
      const match = defaultMilestones.find((m) => m.id === rewardId || rewardId.includes(m.id));
      if (match) {
        reward = {
          _id: `${userId}-${match.id}`,
          userId,
          rewardType: match.type,
          milestoneHours: match.hours,
          title: match.title,
          description: match.desc,
          badgeIcon: match.icon,
          code: (match as any).code,
          status: "unlocked",
          createdAt: new Date().toISOString(),
        };
        mockDB.rewards.set(reward._id, reward);
      }
    }

    if (!reward) {
      return { success: false, error: "Reward not found" };
    }
    if (reward.status === "locked") {
      return { success: false, error: "Milestone hours not yet reached" };
    }
    if (reward.status === "claimed") {
      return { success: false, error: "Reward already claimed" };
    }

    reward.status = "claimed";
    reward.claimedAt = new Date().toISOString();
    mockDB.rewards.set(reward._id, reward);

    return { success: true, reward };
  }
}
