import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { AppRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateQuiz } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    await requireRole(AppRole.super_admin);

    const { chapter_id, chapter_text, chapter_title } = await request.json();
    if (!chapter_id || !chapter_title) {
      return NextResponse.json({ error: "chapter_id and chapter_title are required" }, { status: 400 });
    }

    const sourceText = (chapter_text || `Chapter: ${chapter_title}`).slice(0, 12000);

    const questions = await generateQuiz(chapter_title, sourceText);

    const quiz = await prisma.chapterQuiz.upsert({
      where: { chapterId: chapter_id },
      update: {
        questions: questions as any,
        generatedByAi: true,
      },
      create: {
        chapterId: chapter_id,
        questions: questions as any,
        generatedByAi: true,
      }
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Quiz generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
