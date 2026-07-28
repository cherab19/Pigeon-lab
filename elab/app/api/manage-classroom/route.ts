import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const caller = await requireSchoolAdmin();
    const profile = await prisma.profile.findUnique({
      where: { userId: caller.id }
    });

    if (!profile?.schoolId) {
      return NextResponse.json({ error: "No school found for user" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    // ========== CREATE CLASSROOM ==========
    if (action === "create_classroom") {
      const { teacher_id, subject, grade, section } = body;
      if (!teacher_id || !subject || !grade) {
        return NextResponse.json({ error: "teacher_id, subject, and grade are required" }, { status: 400 });
      }

      const classroom = await prisma.classroom.create({
        data: {
          schoolId: profile.schoolId,
          teacherId: teacher_id,
          subject,
          grade: Number(grade),
          section: section || "A",
        }
      });

      return NextResponse.json({ success: true, classroom });
    }

    // ========== DELETE CLASSROOM ==========
    if (action === "delete_classroom") {
      const { classroom_id } = body;
      await prisma.classroom.delete({
        where: {
          id: classroom_id,
          schoolId: profile.schoolId
        }
      });
      return NextResponse.json({ success: true });
    }

    // ========== ENROLL STUDENTS ==========
    if (action === "enroll_students") {
      const { classroom_id, student_ids } = body;
      if (!classroom_id || !student_ids?.length) {
        return NextResponse.json({ error: "classroom_id and student_ids required" }, { status: 400 });
      }

      // Verify classroom belongs to school
      const cls = await prisma.classroom.findFirst({
        where: { id: classroom_id, schoolId: profile.schoolId }
      });
      if (!cls) {
        return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
      }

      const operations = student_ids.map((sid: string) =>
        prisma.classroomStudent.upsert({
          where: {
            classroomId_studentId: {
              classroomId: classroom_id,
              studentId: sid,
            }
          },
          update: {},
          create: {
            classroomId: classroom_id,
            studentId: sid,
          }
        })
      );
      await prisma.$transaction(operations);

      return NextResponse.json({ success: true, enrolled: student_ids.length });
    }

    // ========== UNENROLL STUDENT ==========
    if (action === "unenroll_student") {
      const { classroom_id, student_id } = body;
      await prisma.classroomStudent.deleteMany({
        where: { classroomId: classroom_id, studentId: student_id }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
