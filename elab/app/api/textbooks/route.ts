import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireUser();
    const books = await prisma.textbook.findMany({
      orderBy: [
        { grade: "asc" },
        { subject: "asc" }
      ]
    });
    return NextResponse.json(books.map(b => ({
      id: b.id,
      title: b.title,
      subject: b.subject,
      grade: b.grade,
      language: b.language,
      cover_url: b.coverUrl,
      file_url: b.fileUrl,
      total_pages: b.totalPages,
      description: b.description,
    })));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
