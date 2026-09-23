import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/db/mock-store";
import { ResourceItem } from "@/types";
import { AIService } from "@/lib/ai/provider";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user-123";

  const resources = Array.from(mockDB.resources.values()).filter((r) => r.userId === userId);
  return NextResponse.json({ resources });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user-123",
      fileName,
      provider = "upload",
      resourceType = "notes",
      url,
      rawTextContent,
    } = body;

    if (!fileName) {
      return NextResponse.json({ error: "Resource name is required" }, { status: 400 });
    }

    let snippet = rawTextContent ? rawTextContent.substring(0, 150) + "..." : "";
    let extractedSchedule: any[] = [];

    if (resourceType === "timetable" && rawTextContent) {
      extractedSchedule = await AIService.parseTimetableText(rawTextContent);
      snippet = `Parsed ${extractedSchedule.length} timetable schedule blocks.`;
    }

    const resId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newResource: ResourceItem = {
      _id: resId,
      userId,
      provider,
      fileName,
      resourceType,
      url,
      contentSnippet: snippet,
      metadata: {
        extractedSchedule,
      },
      createdAt: new Date().toISOString(),
    };

    mockDB.resources.set(resId, newResource);

    return NextResponse.json({ resource: newResource, extractedSchedule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });

  mockDB.resources.delete(id);
  return NextResponse.json({ success: true });
}
