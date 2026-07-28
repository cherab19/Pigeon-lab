import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const weekOf = searchParams.get("weekOf");

    if (!weekOf) {
      return NextResponse.json({ error: "weekOf parameter is required" }, { status: 400 });
    }

    const [reflection, routine] = await Promise.all([
      prisma.studentReflection.findUnique({
        where: {
          userId_weekOf: {
            userId: user.id,
            weekOf: new Date(weekOf),
          }
        }
      }),
      prisma.studentRoutine.findUnique({
        where: { userId: user.id }
      })
    ]);

    return NextResponse.json({
      reflection: reflection ? {
        what_went_well: reflection.whatWentWell,
        what_to_improve: reflection.whatToImprove,
      } : null,
      routine: routine ? routine.schedule : [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { action, weekOf, wentWell, toImprove, schedule } = await request.json();

    if (action === "reflection") {
      if (!weekOf) {
        return NextResponse.json({ error: "weekOf is required for reflection" }, { status: 400 });
      }
      const ref = await prisma.studentReflection.upsert({
        where: {
          userId_weekOf: {
            userId: user.id,
            weekOf: new Date(weekOf),
          }
        },
        update: {
          whatWentWell: wentWell,
          whatToImprove: toImprove,
        },
        create: {
          userId: user.id,
          weekOf: new Date(weekOf),
          whatWentWell: wentWell,
          whatToImprove: toImprove,
        }
      });
      return NextResponse.json({ success: true, reflection: ref });
    }

    if (action === "routine") {
      const rot = await prisma.studentRoutine.upsert({
        where: { userId: user.id },
        update: { schedule: schedule || [] },
        create: { userId: user.id, schedule: schedule || [] }
      });
      return NextResponse.json({ success: true, routine: rot });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
