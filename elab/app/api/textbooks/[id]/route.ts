import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const id = params.id;

    const [book, chapters, progress] = await Promise.all([
      prisma.textbook.findUnique({ where: { id } }),
      prisma.textbookChapter.findMany({ where: { textbookId: id }, orderBy: { chapterNumber: "asc" } }),
      prisma.readingProgress.findUnique({
        where: {
          userId_textbookId: {
            userId: user.id,
            textbookId: id,
          }
        }
      })
    ]);

    if (!book) {
      return NextResponse.json({ error: "Textbook not found" }, { status: 404 });
    }

    return NextResponse.json({
      book: {
        id: book.id,
        title: book.title,
        subject: book.subject,
        grade: book.grade,
        file_url: book.fileUrl,
        total_pages: book.totalPages,
        description: book.description,
      },
      chapters: chapters.map(c => ({
        id: c.id,
        chapter_number: c.chapterNumber,
        title: c.title,
        start_page: c.startPage,
        end_page: c.endPage,
      })),
      progress: progress ? { last_page: progress.lastPage } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const id = params.id;
    const { pageNum } = await request.json();

    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_textbookId: {
          userId: user.id,
          textbookId: id,
        }
      },
      update: {
        lastPage: pageNum,
        lastReadAt: new Date(),
      },
      create: {
        userId: user.id,
        textbookId: id,
        lastPage: pageNum,
      }
    });

    return NextResponse.json({ success: true, progress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
