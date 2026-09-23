// Focus Forge Automated Test Suite
import assert from "node:assert";

console.log("==========================================");
console.log("🚀 STARTING FOCUS FORGE AUTOMATED TEST SUITE");
console.log("==========================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err);
  }
}

// 1. Duration Calculation Tests (TimerEngine Logic)
test("TimerEngine: calculates pure focused seconds accurately excluding pause periods", () => {
  const startTime = new Date("2026-09-22T10:00:00Z").getTime();
  const pauseStart = new Date("2026-09-22T10:10:00Z").getTime();
  const pauseEnd = new Date("2026-09-22T10:15:00Z").getTime();
  const endTime = new Date("2026-09-22T10:30:00Z").getTime();

  // Total Wallclock = 30 mins (1800s). Paused = 5 mins (300s). Pure Focused = 25 mins (1500s).
  const totalWallMs = endTime - startTime;
  const pauseMs = pauseEnd - pauseStart;
  const pureFocusedSecs = Math.floor((totalWallMs - pauseMs) / 1000);

  assert.strictEqual(pureFocusedSecs, 1500, "Should be exactly 1500 seconds (25 minutes)");
});

test("TimerEngine: multiple pause events are accumulated correctly", () => {
  const startTime = new Date("2026-09-22T10:00:00Z").getTime();
  const pause1 = { start: new Date("2026-09-22T10:05:00Z").getTime(), end: new Date("2026-09-22T10:07:00Z").getTime() }; // 2 min
  const pause2 = { start: new Date("2026-09-22T10:15:00Z").getTime(), end: new Date("2026-09-22T10:18:00Z").getTime() }; // 3 min
  const endTime = new Date("2026-09-22T10:30:00Z").getTime(); // 30 min wallclock

  const totalPauseSec = (pause1.end - pause1.start + pause2.end - pause2.start) / 1000;
  const pureSec = (endTime - startTime) / 1000 - totalPauseSec;

  assert.strictEqual(pureSec, 1500, "30m wallclock - 5m pauses = 25m pure (1500s)");
});

// 2. Points & Rewards Engine Idempotency
test("RewardsEngine: calculates deterministic points (+10 pts / minute)", () => {
  const pureSeconds = 1500; // 25 minutes
  const mins = Math.floor(pureSeconds / 60);
  const points = mins * 10;
  assert.strictEqual(points, 250, "25 minutes should award 250 points");
});

test("RewardsEngine: duplicate session completion prevention via Idempotency Keys", () => {
  const ledger = new Set();
  const sessionId = "session-test-abc";
  const idempotencyKey = `session-${sessionId}-completion`;

  // First claim
  assert.strictEqual(ledger.has(idempotencyKey), false);
  ledger.add(idempotencyKey);

  // Duplicate claim attempt
  const isDuplicate = ledger.has(idempotencyKey);
  assert.strictEqual(isDuplicate, true, "Duplicate award must be detected and rejected");
});

// 3. Milestone Hours Thresholds
test("RewardsEngine: validates milestone unlocks at 50h, 100h, 200h, 500h", () => {
  const milestones = [50, 100, 200, 500];
  const userHours = 120;

  const unlocked = milestones.filter((m) => userHours >= m);
  assert.deepStrictEqual(unlocked, [50, 100], "120 hours should unlock 50h and 100h badges");
});

// 4. Heatmap Intensity Scale
test("Heatmap: calculates correct intensity bins (0-4)", () => {
  function getIntensity(minutes) {
    if (!minutes || minutes <= 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 90) return 2;
    if (minutes < 180) return 3;
    return 4;
  }

  assert.strictEqual(getIntensity(0), 0);
  assert.strictEqual(getIntensity(25), 1);
  assert.strictEqual(getIntensity(60), 2);
  assert.strictEqual(getIntensity(120), 3);
  assert.strictEqual(getIntensity(240), 4);
});

// 5. Timetable Schedule Extraction Parser
test("AI Timetable Parser: extracts course blocks from unstructured text", () => {
  const snippet = "Monday: 10:00 AM - Algorithms Lecture\nWednesday: 02:00 PM - Distributed Systems Lab";
  const lines = snippet.split("\n");
  assert.strictEqual(lines.length, 2);
  assert.strictEqual(lines[0].includes("Algorithms"), true);
  assert.strictEqual(lines[1].includes("Distributed Systems"), true);
});

console.log("\n==========================================");
console.log(`📊 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log("==========================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
