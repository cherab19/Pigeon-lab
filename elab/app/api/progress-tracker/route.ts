import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { experimentId, subject, grade, status, completedAt, timeSpentSeconds, action } = await request.json();

    if (action === "start") {
      await prisma.experimentProgress.upsert({
        where: {
          userId_experimentId: {
            userId: user.id,
            experimentId,
          }
        },
        update: {
          status: "started",
          subject,
          grade: Number(grade),
          startedAt: new Date(),
        },
        create: {
          userId: user.id,
          experimentId,
          subject,
          grade: Number(grade),
          status: "started",
        }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "complete") {
      await prisma.experimentProgress.update({
        where: {
          userId_experimentId: {
            userId: user.id,
            experimentId,
          }
        },
        data: {
          status: "completed",
          completedAt: new Date(),
          timeSpentSeconds: Number(timeSpentSeconds || 0),
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
