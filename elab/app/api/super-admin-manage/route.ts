import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { AppRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const caller = await requireRole(AppRole.super_admin);
    const body = await request.json();
    const { action } = body;

    // ========== SCHOOL CRUD ==========
    if (action === "create_school") {
      const { name, location, email, phone } = body;
      if (!name) {
        return NextResponse.json({ error: "School name is required" }, { status: 400 });
      }

      const school = await prisma.school.create({
        data: {
          name,
          location: location || null,
          email: email || null,
          phone: phone || null,
          subscription: {
            create: {
              status: "trial",
              studentCount: 0,
              teacherSeats: 10,
              studentSeats: 100,
            }
          }
        }
      });

      return NextResponse.json({ success: true, school });
    }

    if (action === "update_school") {
      const { school_id, name, location, email, phone } = body;
      if (!school_id) {
        return NextResponse.json({ error: "school_id is required" }, { status: 400 });
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (location !== undefined) updates.location = location || null;
      if (email !== undefined) updates.email = email || null;
      if (phone !== undefined) updates.phone = phone || null;

      await prisma.school.update({
        where: { id: school_id },
        data: updates
      });

      return NextResponse.json({ success: true, message: "School updated" });
    }

    if (action === "delete_school") {
      const { school_id } = body;
      if (!school_id) {
        return NextResponse.json({ error: "school_id is required" }, { status: 400 });
      }

      // Remove role assignments for all school profiles
      const schoolProfiles = await prisma.profile.findMany({
        where: { schoolId: school_id },
        select: { userId: true }
      });

      await prisma.$transaction([
        prisma.userRole.deleteMany({
          where: { userId: { in: schoolProfiles.map(p => p.userId) } }
        }),
        prisma.profile.updateMany({
          where: { schoolId: school_id },
          data: { schoolId: null }
        }),
        prisma.schoolSubscription.deleteMany({
          where: { schoolId: school_id }
        }),
        prisma.school.delete({
          where: { id: school_id }
        })
      ]);

      return NextResponse.json({ success: true, message: "School deleted" });
    }

    // ========== USER MANAGEMENT ==========
    if (action === "update_user_role") {
      const { user_id, new_role } = body;
      if (!user_id || !new_role) {
        return NextResponse.json({ error: "user_id and new_role are required" }, { status: 400 });
      }

      if (!Object.values(AppRole).includes(new_role as AppRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      // Prevent self-demotion
      if (user_id === caller.id && new_role !== AppRole.super_admin) {
        return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.userRole.deleteMany({ where: { userId: user_id } }),
        prisma.userRole.create({
          data: {
            userId: user_id,
            role: new_role as AppRole,
          }
        })
      ]);

      return NextResponse.json({ success: true, message: "Role updated" });
    }

    if (action === "remove_user") {
      const { user_id } = body;
      if (!user_id) {
        return NextResponse.json({ error: "user_id is required" }, { status: 400 });
      }

      if (user_id === caller.id) {
        return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.userRole.deleteMany({ where: { userId: user_id } }),
        prisma.profile.update({
          where: { userId: user_id },
          data: { schoolId: null }
        })
      ]);

      return NextResponse.json({ success: true, message: "User removed" });
    }

    if (action === "assign_school") {
      const { user_id, school_id } = body;
      if (!user_id) {
        return NextResponse.json({ error: "user_id is required" }, { status: 400 });
      }

      await prisma.profile.update({
        where: { userId: user_id },
        data: { schoolId: school_id || null }
      });

      return NextResponse.json({ success: true, message: "School assignment updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
