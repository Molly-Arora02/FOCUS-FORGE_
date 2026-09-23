// Complete End-to-End API Suite Tester for Focus Forge
const BASE = "http://localhost:3000";

async function testAllApis() {
  console.log("==========================================");
  console.log("⚡ TESTING ALL FOCUS FORGE API ENDPOINTS");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      const res = await fn();
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(`✅ [PASS] ${name}`);
        passed++;
        return data;
      } else {
        const errText = await res.text().catch(() => "");
        console.error(`❌ [FAIL ${res.status}] ${name}:`, errText);
        failed++;
        return null;
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${name}:`, err.message);
      failed++;
      return null;
    }
  }

  // 1. Auth & OTP
  const otpSend = await check("POST /api/auth/otp (Send Code)", () =>
    fetch(`${BASE}/api/auth/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", target: "+919876543210", type: "phone" }),
    })
  );

  await check("POST /api/auth/otp (Verify Code)", () =>
    fetch(`${BASE}/api/auth/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify",
        target: "+919876543210",
        code: otpSend?.devCode || "123456",
        type: "phone",
        name: "Molly Arora",
      }),
    })
  );

  // 2. Profile
  await check("GET /api/profile (Molly Arora Profile)", () =>
    fetch(`${BASE}/api/profile?userId=molly-user-123`)
  );

  await check("GET /api/profile (Alex Rivera Profile)", () =>
    fetch(`${BASE}/api/profile?userId=demo-user-123`)
  );

  await check("PATCH /api/profile (Update Preferences)", () =>
    fetch(`${BASE}/api/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "molly-user-123", preferences: { dailyFocusTargetMinutes: 240 } }),
    })
  );

  // 3. Goals
  await check("GET /api/goals", () => fetch(`${BASE}/api/goals?userId=molly-user-123`));
  const newGoal = await check("POST /api/goals", () =>
    fetch(`${BASE}/api/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "molly-user-123",
        title: "Build Production Hackathon Platform",
        category: "skill",
        priority: "high",
        targetDate: "2026-10-15",
        weeklyTargetHours: 10,
      }),
    })
  );

  // 4. Subjects
  await check("GET /api/subjects", () => fetch(`${BASE}/api/subjects?userId=molly-user-123`));
  await check("POST /api/subjects", () =>
    fetch(`${BASE}/api/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "molly-user-123",
        name: "Operating Systems",
        color: "#FF2A4D",
        icon: "Cpu",
        topics: ["Virtual Memory", "Deadlocks", "Process Scheduling"],
        estimatedWeeklyHours: 6,
      }),
    })
  );

  // 5. Tasks
  await check("GET /api/tasks", () => fetch(`${BASE}/api/tasks?userId=molly-user-123`));
  await check("POST /api/tasks", () =>
    fetch(`${BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "molly-user-123",
        title: "Implement Raft Log Compaction",
        estimatedMinutes: 45,
        priority: "high",
      }),
    })
  );

  // 6. Focus Session Lifecycle
  const startSession = await check("POST /api/focus/start", () =>
    fetch(`${BASE}/api/focus/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "molly-user-123",
        topic: "Graph Algorithms",
        plannedDuration: 25,
      }),
    })
  );

  const sessionId = startSession?.session?._id;
  if (sessionId) {
    await check(`POST /api/focus/${sessionId}/pause`, () =>
      fetch(`${BASE}/api/focus/${sessionId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "molly-user-123" }),
      })
    );

    await check(`POST /api/focus/${sessionId}/resume`, () =>
      fetch(`${BASE}/api/focus/${sessionId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "molly-user-123" }),
      })
    );

    await check(`POST /api/focus/${sessionId}/complete`, () =>
      fetch(`${BASE}/api/focus/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "molly-user-123",
          focusRating: 5,
          reflectionNotes: "Solid uninterrupted focus block.",
        }),
      })
    );
  }

  await check("GET /api/focus (Sessions List)", () => fetch(`${BASE}/api/focus?userId=molly-user-123`));
  await check("GET /api/focus/history", () => fetch(`${BASE}/api/focus/history?userId=molly-user-123`));

  // 7. Tracking Spreadsheet
  await check("GET /api/tracking (Study Spreadsheet)", () =>
    fetch(`${BASE}/api/tracking?userId=molly-user-123`)
  );
  await check("POST /api/tracking (Manual Study Log)", () =>
    fetch(`${BASE}/api/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "molly-user-123",
        subject: "Mathematics",
        topic: "Calculus Integrals",
        durationMinutes: 50,
        focusRating: 5,
        notes: "Completed Chapter 4 practice exercises.",
      }),
    })
  );

  // 8. Rewards & Ledger
  await check("GET /api/rewards (Milestones & Points)", () =>
    fetch(`${BASE}/api/rewards?userId=molly-user-123`)
  );
  await check("POST /api/rewards/claim", () =>
    fetch(`${BASE}/api/rewards/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: `test-user-${Date.now()}`, rewardId: "reward-50h" }),
    })
  );

  // 9. Resources & Integrations
  await check("GET /api/resources", () => fetch(`${BASE}/api/resources?userId=molly-user-123`));
  await check("GET /api/integrations", () => fetch(`${BASE}/api/integrations?userId=molly-user-123`));

  // 10. Analytics
  await check("GET /api/analytics/summary", () => fetch(`${BASE}/api/analytics/summary?userId=molly-user-123`));
  await check("GET /api/analytics/heatmap", () => fetch(`${BASE}/api/analytics/heatmap?userId=molly-user-123`));
  await check("GET /api/analytics/subjects", () => fetch(`${BASE}/api/analytics/subjects?userId=molly-user-123`));

  // 11. AI Modules
  await check("POST /api/ai/plan (Daily Plan Generator)", () =>
    fetch(`${BASE}/api/ai/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "molly-user-123",
        dateStr: new Date().toISOString().split("T")[0],
        availableHours: 6,
      }),
    })
  );

  await check("POST /api/ai/chat (Conversational Coach)", () =>
    fetch(`${BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "molly-user-123",
        message: "How should I structure my study session for dynamic programming?",
      }),
    })
  );

  await check("POST /api/ai/flashcards (Active Recall Generator)", () =>
    fetch(`${BASE}/api/ai/flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Operating Systems Deadlocks",
        count: 4,
      }),
    })
  );

  console.log("==========================================");
  console.log(`📊 FINAL API TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) process.exit(1);
}

testAllApis();
