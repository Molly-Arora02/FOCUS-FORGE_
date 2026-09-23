import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { Integration, ResourceItem } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const integration = Array.from(mockDB.integrations.values()).find(
    (i) => i.userId === userId && i.provider === "google_drive"
  );

  const driveResources = Array.from(mockDB.resources.values()).filter(
    (r) => r.userId === userId && r.provider === "google_drive"
  );

  const isConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      !process.env.GOOGLE_CLIENT_ID.includes("your-google")
  );

  return NextResponse.json({
    connected: integration?.status === "connected",
    integration: integration || null,
    driveResources,
    isRealOAuthConfigured: isConfigured,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user-123", action } = body;

    const intId = `int-drive-${userId}`;

    if (action === "connect_demo" || action === "connect") {
      const integration: Integration = {
        _id: intId,
        userId,
        provider: "google_drive",
        status: "connected",
        externalAccountId: "google-user-drive-auth",
        scopes: ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.file"],
        metadata: {
          connectedAccountEmail: "alex.student@gmail.com",
          totalFilesIndexed: 3,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDB.integrations.set(intId, integration);

      // Seed 2 sample authorized Google Drive files
      const file1: ResourceItem = {
        _id: `res-drive-1`,
        userId,
        provider: "google_drive",
        fileName: "CS_350_Advanced_Algorithms_Syllabus.gdoc",
        mimeType: "application/vnd.google-apps.document",
        resourceType: "syllabus",
        url: "https://docs.google.com/document/d/sample-algorithms-syllabus",
        contentSnippet: "Syllabus containing 14 weeks of study milestones, textbook readings, and project deadlines.",
        createdAt: new Date().toISOString(),
      };
      mockDB.resources.set(file1._id, file1);

      return NextResponse.json({ success: true, integration });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const intId = `int-drive-${userId}`;
  mockDB.integrations.delete(intId);

  return NextResponse.json({ success: true, connected: false });
}
