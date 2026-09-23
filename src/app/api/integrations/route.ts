import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo-user-123";

    const allIntegrations = Array.from(mockDB.integrations.values());
    const userIntegrations = allIntegrations.filter((i) => i.userId === userId);

    return NextResponse.json({
      success: true,
      integrations: userIntegrations.length > 0 ? userIntegrations : [
        {
          _id: "int-google-drive",
          userId,
          provider: "google_drive",
          status: "connected",
          metadata: { accountEmail: "alex.forge@example.com", syncedResourcesCount: 8 },
          connectedAt: new Date().toISOString(),
          lastSyncAt: new Date().toISOString(),
        },
        {
          _id: "int-google-calendar",
          userId,
          provider: "google_calendar",
          status: "connected",
          metadata: { calendarName: "Academic & Study Blocks" },
          connectedAt: new Date().toISOString(),
          lastSyncAt: new Date().toISOString(),
        },
        {
          _id: "int-notion",
          userId,
          provider: "notion",
          status: "available",
          connectedAt: null,
          lastSyncAt: null,
        }
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch integrations" }, { status: 500 });
  }
}
