import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const [g, b] = await Promise.all([
      prisma.studentGamification.findUnique({ where: { userId: user.id } }),
      prisma.studentBadge.findMany({ where: { userId: user.id } }),
    ]);
    return NextResponse.json({
      xp: g?.xp ?? 0,
      current_streak: g?.currentStreak ?? 0,
      longest_streak: g?.longestStreak ?? 0,
      last_active_date: g?.lastActiveDate ? g.lastActiveDate.toISOString().slice(0, 10) : null,
      badges: b.map(x => x.badgeKey),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { amount, badgeKeys } = await request.json();

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const existing = await prisma.studentGamification.findUnique({
      where: { userId: user.id }
    });

    let newStreak = 1;
    let longestStreak = existing?.longestStreak ?? 0;
    const lastActiveStr = existing?.lastActiveDate ? existing.lastActiveDate.toISOString().slice(0, 10) : null;

    if (lastActiveStr === todayStr) {
      newStreak = existing?.currentStreak ?? 1;
    } else if (lastActiveStr === yesterdayStr) {
      newStreak = (existing?.currentStreak ?? 0) + 1;
    }

    longestStreak = Math.max(longestStreak, newStreak);
    const newXP = (existing?.xp ?? 0) + amount;

    await prisma.studentGamification.upsert({
      where: { userId: user.id },
      update: {
        xp: newXP,
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
      },
      create: {
        userId: user.id,
        xp: newXP,
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
      }
    });

    const earnedBadges: string[] = [];
    const autoBadges: string[] = [...(badgeKeys || [])];
    if (newStreak >= 3) autoBadges.push("streak_3");
    if (newStreak >= 7) autoBadges.push("streak_7");
    if (newXP >= 100) autoBadges.push("xp_100");
    if (newXP >= 500) autoBadges.push("xp_500");

    for (const key of new Set(autoBadges)) {
      try {
        await prisma.studentBadge.create({
          data: { userId: user.id, badgeKey: key }
        });
        earnedBadges.push(key);
      } catch (e) {
        // Badge might already exist (unique constraint error), ignore
      }
    }

    return NextResponse.json({
      xp: newXP,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_active_date: todayStr,
      new_badges: earnedBadges,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
