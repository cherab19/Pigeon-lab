import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { school: true }
    });

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id }
    });

    const priority = ["super_admin", "school_admin", "teacher", "student"];
    let role = "student";
    for (const p of priority) {
      if (userRoles.some(r => r.role === p)) {
        role = p;
        break;
      }
    }

    return NextResponse.json({
      full_name: profile?.fullName || "",
      school_id: profile?.schoolId || null,
      school_name: profile?.school?.name || "",
      role,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
