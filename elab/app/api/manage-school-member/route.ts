import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const caller = await requireSchoolAdmin();
    const body = await request.json();
    const { action, member_user_id, new_role } = body;

    if (!member_user_id) {
      throw new Error("member_user_id is required");
    }

    // Verify the target member belongs to the same school
    const memberProfile = await prisma.profile.findUnique({
      where: { userId: member_user_id }
    });

    if (!memberProfile || memberProfile.schoolId !== caller.schoolId) {
      return NextResponse.json({ error: "Member not found in your school" }, { status: 404 });
    }

    // Prevent self-modification
    if (member_user_id === caller.id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    if (action === "update_role") {
      if (!([AppRole.teacher, AppRole.student] as AppRole[]).includes(new_role as AppRole)) {
        return NextResponse.json({ error: "Invalid role. Must be teacher or student" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.userRole.deleteMany({ where: { userId: member_user_id } }),
        prisma.userRole.create({
          data: {
            userId: member_user_id,
            role: new_role as AppRole,
          }
        })
      ]);

      return NextResponse.json({ success: true, message: "Role updated" });

    } else if (action === "remove") {
      await prisma.$transaction([
        prisma.userRole.deleteMany({ where: { userId: member_user_id } }),
        prisma.profile.update({
          where: { userId: member_user_id },
          data: { schoolId: null }
        })
      ]);

      return NextResponse.json({ success: true, message: "Member removed from school" });

    } else {
      return NextResponse.json({ error: "Invalid action. Use 'update_role' or 'remove'" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
