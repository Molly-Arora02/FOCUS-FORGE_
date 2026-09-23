import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/provider";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectName, topic, subTopic, notes } = body;

    const flashcards = await AIService.generateSessionFlashcards(
      subjectName || "Core Deep Work",
      topic || "Algorithm Fundamentals",
      subTopic,
      notes
    );

    return NextResponse.json({ flashcards });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
