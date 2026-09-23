// Comprehensive Route Verification Runner
const routes = [
  // Core Pages
  "/",
  "/login",
  "/signup",
  "/verify-phone",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/dashboard",
  "/planner",
  "/focus",
  "/tracking",
  "/ai-coach",
  "/analytics",
  "/rewards",
  "/resources",
  "/integrations",
  "/settings",
  "/profile",
  "/privacy",
  "/terms",
];

const apiRoutes = [
  "/api/profile?authUserId=demo-user-123",
  "/api/goals?userId=demo-user-123",
  "/api/subjects?userId=demo-user-123",
  "/api/tasks?userId=demo-user-123",
  "/api/focus?userId=demo-user-123",
  "/api/tracking?userId=demo-user-123",
  "/api/rewards?userId=demo-user-123",
  "/api/resources?userId=demo-user-123",
  "/api/integrations?userId=demo-user-123",
];

async function verifyAll() {
  console.log("==========================================");
  console.log("🔍 RUNNING COMPREHENSIVE ROUTE HEALTH CHECK");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      if (res.status === 200) {
        console.log(`✅ [PAGE 200 OK] ${r}`);
        passed++;
      } else {
        console.error(`❌ [PAGE FAILED ${res.status}] ${r}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [PAGE ERROR] ${r}:`, err.message);
      failed++;
    }
  }

  for (const api of apiRoutes) {
    try {
      const res = await fetch(`http://localhost:3000${api}`);
      if (res.status === 200) {
        console.log(`✅ [API 200 OK] ${api}`);
        passed++;
      } else {
        console.error(`❌ [API FAILED ${res.status}] ${api}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [API ERROR] ${api}:`, err.message);
      failed++;
    }
  }

  console.log("==========================================");
  console.log(`📊 HEALTH CHECK SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) process.exit(1);
}

verifyAll();
