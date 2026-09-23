import {
  UserProfile,
  Goal,
  Subject,
  Task,
  FocusSession,
  DailyPlan,
  PointsLedgerEntry,
  Reward,
  Integration,
  ResourceItem,
  AIConversation,
  HeatmapDayData,
  ProductivitySummary,
} from "@/types";
import { calculateIntensity, getTodayDateString } from "../utils";

// In-Memory Database Store for robust zero-config and offline demo capabilities
class MockDatabaseStore {
  public users: Map<string, UserProfile> = new Map();
  public goals: Map<string, Goal> = new Map();
  public subjects: Map<string, Subject> = new Map();
  public tasks: Map<string, Task> = new Map();
  public focusSessions: Map<string, FocusSession> = new Map();
  public dailyPlans: Map<string, DailyPlan> = new Map();
  public pointsLedger: Map<string, PointsLedgerEntry> = new Map();
  public rewards: Map<string, Reward> = new Map();
  public integrations: Map<string, Integration> = new Map();
  public resources: Map<string, ResourceItem> = new Map();
  public aiConversations: Map<string, AIConversation> = new Map();

  private initialized = false;

  constructor() {
    this.seedDemoData();
  }

  public seedDemoData() {
    if (this.initialized) return;
    this.initialized = true;

    const demoUserId = "demo-user-123";
    const mollyUserId = "molly-user-123";
    const proUserId = "pro-user-123";
    const now = new Date();

    // 1. Molly Arora Profile (Founder & Scholar)
    const mollyUser: UserProfile = {
      _id: mollyUserId,
      authUserId: mollyUserId,
      email: "molly@focusforge.io",
      displayName: "Molly Arora",
      role: "student",
      timezone: "Asia/Kolkata",
      ageRange: "20-24",
      onboardingCompleted: true,
      preferences: {
        preferredSessionLength: 25,
        preferredFocusHours: { start: "08:30", end: "22:00" },
        coachingStyle: "empathetic",
        planningPreferences: {
          autoScheduleBreaks: true,
          bufferMinutes: 10,
          maxDailyHours: 7,
          aiGeneratedPlans: true,
        },
        cameraFocusEnabled: true,
        checkInFrequencyMinutes: 25,
        soundEnabled: true,
        dailyFocusTargetMinutes: 240, // 4 hours
      },
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    };
    this.users.set(mollyUserId, mollyUser);

    // 2. Alex Rivera (Student Persona)
    const demoUser: UserProfile = {
      _id: demoUserId,
      authUserId: demoUserId,
      email: "alex@focusforge.io",
      displayName: "Alex Rivera",
      role: "student",
      timezone: "America/New_York",
      ageRange: "21-25",
      onboardingCompleted: true,
      preferences: {
        preferredSessionLength: 25,
        preferredFocusHours: { start: "09:00", end: "20:00" },
        coachingStyle: "empathetic",
        planningPreferences: {
          autoScheduleBreaks: true,
          bufferMinutes: 10,
          maxDailyHours: 6,
          aiGeneratedPlans: true,
        },
        cameraFocusEnabled: false,
        checkInFrequencyMinutes: 30,
        soundEnabled: true,
        dailyFocusTargetMinutes: 180, // 3 hours
      },
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    };
    this.users.set(demoUserId, demoUser);

    // 3. Jordan Vance (Pro Persona)
    const proUser: UserProfile = {
      _id: proUserId,
      authUserId: proUserId,
      email: "jordan@focusforge.io",
      displayName: "Jordan Vance",
      role: "professional",
      timezone: "America/Los_Angeles",
      ageRange: "25-30",
      onboardingCompleted: true,
      preferences: {
        preferredSessionLength: 50,
        preferredFocusHours: { start: "09:00", end: "19:00" },
        coachingStyle: "direct",
        planningPreferences: {
          autoScheduleBreaks: true,
          bufferMinutes: 15,
          maxDailyHours: 8,
          aiGeneratedPlans: true,
        },
        cameraFocusEnabled: true,
        checkInFrequencyMinutes: 45,
        soundEnabled: true,
        dailyFocusTargetMinutes: 300, // 5 hours
      },
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    };
    this.users.set(proUserId, proUser);

    // 2. Subjects
    const subj1: Subject = {
      _id: "subj-1",
      userId: demoUserId,
      name: "Data Structures & Algorithms",
      color: "#43F59A",
      icon: "Code",
      topics: ["Graph Traversals", "Dynamic Programming", "Trie Implementations"],
      estimatedWeeklyHours: 8,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    };
    const subj2: Subject = {
      _id: "subj-2",
      userId: demoUserId,
      name: "Distributed Systems",
      color: "#47B5FF",
      icon: "Server",
      topics: ["Raft Consensus", "MapReduce Architecture", "Vector Clocks"],
      estimatedWeeklyHours: 6,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    };
    const subj3: Subject = {
      _id: "subj-3",
      userId: demoUserId,
      name: "Technical Interview Prep",
      color: "#FFB547",
      icon: "Sparkles",
      topics: ["System Design Mock", "Behavioral Frameworks"],
      estimatedWeeklyHours: 4,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    };
    this.subjects.set(subj1._id, subj1);
    this.subjects.set(subj2._id, subj2);
    this.subjects.set(subj3._id, subj3);

    // 3. Goals
    const goal1: Goal = {
      _id: "goal-1",
      userId: demoUserId,
      title: "Master Hard Graph & DP Algorithms",
      category: "skill",
      priority: "high",
      targetDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
      weeklyTargetHours: 8,
      status: "active",
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    };
    const goal2: Goal = {
      _id: "goal-2",
      userId: demoUserId,
      title: "Build Distributed Key-Value Store",
      category: "academic",
      priority: "medium",
      targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
      weeklyTargetHours: 6,
      status: "active",
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    };
    this.goals.set(goal1._id, goal1);
    this.goals.set(goal2._id, goal2);

    // 4. Tasks for Today (Starting fresh pending)
    const todayStr = getTodayDateString(demoUser.timezone);
    const task1: Task = {
      _id: "task-1",
      userId: demoUserId,
      subjectId: subj1._id,
      goalId: goal1._id,
      title: "Implement Dijkstra's Algorithm with Min-Heap",
      description: "Code and verify Dijkstra with edge weights and custom comparator in TypeScript.",
      priority: "high",
      scheduledStart: `${todayStr}T09:30:00Z`,
      estimatedDuration: 45,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: now.toISOString(),
    };
    const task2: Task = {
      _id: "task-2",
      userId: demoUserId,
      subjectId: subj2._id,
      goalId: goal2._id,
      title: "Read Raft Paper: Leader Election & Log Replication",
      description: "Annotate Section 5 of the Ongaro paper.",
      priority: "high",
      scheduledStart: `${todayStr}T14:00:00Z`,
      estimatedDuration: 50,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: now.toISOString(),
    };
    const task3: Task = {
      _id: "task-3",
      userId: demoUserId,
      subjectId: subj1._id,
      goalId: goal1._id,
      title: "Solve 2 Graph Problems on LeetCode",
      description: "Network Delay Time & Cheapest Flights Within K Stops",
      priority: "medium",
      scheduledStart: `${todayStr}T16:30:00Z`,
      estimatedDuration: 40,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: now.toISOString(),
    };
    this.tasks.set(task1._id, task1);
    this.tasks.set(task2._id, task2);
    this.tasks.set(task3._id, task3);

    // 5. Seed Clean Starting Rewards (All initial milestones locked until earned)
    const r1: Reward = {
      _id: "reward-50h",
      userId: demoUserId,
      rewardType: "digital_card",
      milestoneHours: 50,
      title: "Novice Blacksmith Focus Card",
      description: "Forged over 50 hours of verified pure focus. Digital badge unlock.",
      badgeIcon: "Shield",
      status: "locked",
      createdAt: new Date().toISOString(),
    };
    const r2: Reward = {
      _id: "reward-100h",
      userId: demoUserId,
      rewardType: "badge",
      milestoneHours: 100,
      title: "Focus Adept Tier",
      description: "100 hours of deep work logged in the forge.",
      badgeIcon: "Award",
      status: "locked",
      createdAt: new Date().toISOString(),
    };
    const r3: Reward = {
      _id: "reward-200h",
      userId: demoUserId,
      rewardType: "partner_coupon",
      milestoneHours: 200,
      title: "Master of the Forge Partner Perks",
      description: "200 hours of dedicated focus. 3 months free partner platform perks.",
      badgeIcon: "Crown",
      code: "FORGE-PRO-200",
      status: "locked",
      createdAt: new Date().toISOString(),
    };
    const r4: Reward = {
      _id: "reward-500h",
      userId: demoUserId,
      rewardType: "merchandise_eligibility",
      milestoneHours: 500,
      title: "Grandmaster Forgekeeper Merch Tier",
      description: "Legendary milestone. Exclusive physical Focus Forge Founder Jacket eligibility.",
      badgeIcon: "Zap",
      status: "locked",
      createdAt: new Date().toISOString(),
    };
    this.rewards.set(r1._id, r1);
    this.rewards.set(r2._id, r2);
    this.rewards.set(r3._id, r3);
    this.rewards.set(r4._id, r4);

    // 7. Seed Resources & Integrations
    const res1: ResourceItem = {
      _id: "res-1",
      userId: demoUserId,
      provider: "youtube",
      fileName: "Synthwave Dark Ambient Study Beats",
      mimeType: "video/mp4",
      resourceType: "lecture",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      contentSnippet: "Lofi girl focus music stream for uninterrupted programming blocks.",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    };
    const res2: ResourceItem = {
      _id: "res-2",
      userId: demoUserId,
      provider: "upload",
      fileName: "Spring_2026_Exam_Timetable.pdf",
      mimeType: "application/pdf",
      resourceType: "timetable",
      contentSnippet: "Extracted 4 examination periods: Algorithms (May 12), OS (May 18), Networks (May 24).",
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    };
    this.resources.set(res1._id, res1);
    this.resources.set(res2._id, res2);

    // 8. Seed AI Conversation
    const conv1: AIConversation = {
      _id: "conv-1",
      userId: demoUserId,
      title: "Graph Traversal Study Plan",
      messages: [
        {
          id: "m-1",
          sender: "user",
          content: "I have 90 minutes today. Should I practice Dijkstra or read the Raft paper?",
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: "m-2",
          sender: "coach",
          content: "Looking at your active goals, your **Data Structures & Algorithms** weekly target is at 65% while **Distributed Systems** is at 40%. Given your high focus rating in your last morning coding session, I recommend doing a **45-minute coding sprint on Dijkstra** followed by a **10-minute break**, then 35 minutes reading the first two sections of the Raft paper.",
          timestamp: new Date(Date.now() - 2 * 3600000 + 5000).toISOString(),
          suggestedActions: [
            { label: "Start 45m Dijkstra Session", action: "start_focus", payload: { subjectId: "subj-1", duration: 45 } },
            { label: "Add to Daily Agenda", action: "schedule_task", payload: { title: "Dijkstra Sprint", duration: 45 } },
          ],
        },
      ],
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: now.toISOString(),
    };
    this.aiConversations.set(conv1._id, conv1);
  }

  // Aggregation Helpers
  public getProductivitySummary(userId: string): ProductivitySummary {
    const today = getTodayDateString();
    let todayMinutes = 0;
    let todaySessionsCount = 0;
    let totalSeconds = 0;
    let weeklyMinutes = 0;
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;

    const subjectMinutesMap: { [subId: string]: number } = {};

    Array.from(this.focusSessions.values())
      .filter((s) => s.userId === userId && s.status === "completed")
      .forEach((s) => {
        const sessionMins = Math.round(s.actualDuration / 60);
        totalSeconds += s.actualDuration;

        const sessionDate = s.startedAt.split("T")[0];
        if (sessionDate === today) {
          todayMinutes += sessionMins;
          todaySessionsCount++;
        }

        const sessionTime = new Date(s.startedAt).getTime();
        if (sessionTime >= sevenDaysAgo) {
          weeklyMinutes += sessionMins;
        }

        if (s.subjectId) {
          subjectMinutesMap[s.subjectId] = (subjectMinutesMap[s.subjectId] || 0) + sessionMins;
        }
      });

    // Find top subject
    let topSubject: { name: string; color: string; minutes: number } | undefined;
    let maxSubjectMins = -1;
    for (const [subId, mins] of Object.entries(subjectMinutesMap)) {
      const subject = this.subjects.get(subId);
      if (subject && mins > maxSubjectMins) {
        maxSubjectMins = mins;
        topSubject = { name: subject.name, color: subject.color, minutes: mins };
      }
    }

    // Calculate real dynamic streak from actual completed focus dates
    const completedSessionDates = Array.from(
      new Set(
        Array.from(this.focusSessions.values())
          .filter((s) => s.userId === userId && s.status === "completed")
          .map((s) => s.startedAt.split("T")[0])
      )
    ).sort().reverse();

    let currentStreak = 0;
    if (completedSessionDates.length > 0) {
      let checkDate = new Date();
      let todayString = checkDate.toISOString().split("T")[0];
      
      // If studied today, start streak counting from today; if not today, check if yesterday was studied
      let dateIndex = completedSessionDates.indexOf(todayString);
      if (dateIndex === -1) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayString = checkDate.toISOString().split("T")[0];
        dateIndex = completedSessionDates.indexOf(yesterdayString);
      }

      if (dateIndex !== -1) {
        currentStreak = 1;
        let currentDate = new Date(completedSessionDates[dateIndex]);
        for (let i = dateIndex + 1; i < completedSessionDates.length; i++) {
          const prevDay = new Date(currentDate);
          prevDay.setDate(prevDay.getDate() - 1);
          const expectedPrevStr = prevDay.toISOString().split("T")[0];
          if (completedSessionDates[i] === expectedPrevStr) {
            currentStreak++;
            currentDate = prevDay;
          } else {
            break;
          }
        }
      }
    }

    // Calculate total points from ledger
    let totalPoints = 0;
    Array.from(this.pointsLedger.values())
      .filter((p) => p.userId === userId)
      .forEach((p) => (totalPoints += p.points));

    const user = this.users.get(userId);
    const targetMins = user?.preferences?.dailyFocusTargetMinutes || 180;
    const weeklyTargetMins = targetMins * 7;
    const weeklyRate = weeklyTargetMins > 0 ? Math.min(100, Math.round((weeklyMinutes / weeklyTargetMins) * 100)) : 0;

    return {
      todayFocusedMinutes: todayMinutes,
      todayTargetMinutes: targetMins,
      todaySessionsCount,
      currentStreakDays: currentStreak,
      longestStreakDays: currentStreak,
      totalFocusedHours: Math.round((totalSeconds / 3600) * 10) / 10,
      weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
      weeklyCompletionRate: weeklyRate,
      totalPoints,
      topSubject,
      completionRatePercent: Math.min(100, Math.round((todayMinutes / targetMins) * 100)),
    };
  }

  public getHeatmapData(userId: string, days = 60): HeatmapDayData[] {
    const result: HeatmapDayData[] = [];
    const now = new Date();

    const userSessions = Array.from(this.focusSessions.values()).filter(
      (s) => s.userId === userId && s.status === "completed"
    );

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];

      const daySessions = userSessions.filter((s) => s.startedAt.startsWith(dateStr));
      let totalMins = 0;
      const subjectsMap: { [name: string]: { color: string; minutes: number } } = {};

      daySessions.forEach((s) => {
        const mins = Math.round(s.actualDuration / 60);
        totalMins += mins;
        const sub = s.subjectId ? this.subjects.get(s.subjectId) : null;
        const subName = sub ? sub.name : "General Focus";
        const subColor = sub ? sub.color : "#43F59A";

        if (!subjectsMap[subName]) {
          subjectsMap[subName] = { color: subColor, minutes: 0 };
        }
        subjectsMap[subName].minutes += mins;
      });

      const subjects = Object.entries(subjectsMap).map(([name, data]) => ({
        name,
        color: data.color,
        minutes: data.minutes,
      }));

      result.push({
        date: dateStr,
        minutes: totalMins,
        sessionsCount: daySessions.length,
        intensity: calculateIntensity(totalMins),
        subjects,
      });
    }

    return result;
  }
}

// Singleton Global Instance for server runtime
declare global {
  var __focusForgeMockDB: MockDatabaseStore | undefined;
}

export const mockDB: MockDatabaseStore =
  globalThis.__focusForgeMockDB || (globalThis.__focusForgeMockDB = new MockDatabaseStore());
