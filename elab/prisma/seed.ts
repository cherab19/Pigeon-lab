import bcrypt from "bcryptjs";
import { AppRole, PrismaClient, SubscriptionStatus } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash("Pigeonlab123!", 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@pigeonlab.et" }, update: {}, create: { email: "admin@pigeonlab.et", passwordHash } });
  await prisma.profile.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id, fullName: "Pigeonlab Administrator" } });
  await prisma.userRole.upsert({ where: { userId_role: { userId: admin.id, role: AppRole.super_admin } }, update: {}, create: { userId: admin.id, role: AppRole.super_admin } });
  const school = await prisma.school.upsert({ where: { id: "00000000-0000-0000-0000-000000000001" }, update: {}, create: { id: "00000000-0000-0000-0000-000000000001", name: "Pigeonlab Demonstration School", location: "Addis Ababa", email: "demo@pigeonlab.et" } });
  await prisma.schoolSubscription.upsert({ where: { schoolId: school.id }, update: { status: SubscriptionStatus.active, teacherSeats: 5, studentSeats: 100 }, create: { schoolId: school.id, status: SubscriptionStatus.active, teacherSeats: 5, studentSeats: 100 } });
  const members = [
    { email: "school-admin@pigeonlab.et", name: "Demo School Administrator", role: AppRole.school_admin },
    { email: "teacher@pigeonlab.et", name: "Demo Science Teacher", role: AppRole.teacher },
    { email: "student1@pigeonlab.et", name: "Amanuel Demo", role: AppRole.student },
    { email: "student2@pigeonlab.et", name: "Biruk Demo", role: AppRole.student },
    { email: "student3@pigeonlab.et", name: "Hana Demo", role: AppRole.student },
  ];
  for (const member of members) { const user = await prisma.user.upsert({ where: { email: member.email }, update: {}, create: { email: member.email, passwordHash } }); await prisma.profile.upsert({ where: { userId: user.id }, update: { schoolId: school.id }, create: { userId: user.id, schoolId: school.id, fullName: member.name } }); await prisma.userRole.upsert({ where: { userId_role: { userId: user.id, role: member.role } }, update: {}, create: { userId: user.id, role: member.role } }); }
  const teacher = await prisma.user.findUniqueOrThrow({ where: { email: "teacher@pigeonlab.et" } });
  const classroom = await prisma.classroom.upsert({
    where: { schoolId_teacherId_subject_grade_section: { schoolId: school.id, teacherId: teacher.id, subject: "physics", grade: 9, section: "A" } },
    update: {}, create: { schoolId: school.id, teacherId: teacher.id, subject: "physics", grade: 9, section: "A" },
  });
  for (const email of ["student1@pigeonlab.et", "student2@pigeonlab.et", "student3@pigeonlab.et"]) {
    const student = await prisma.user.findUniqueOrThrow({ where: { email } });
    await prisma.classroomStudent.upsert({ where: { classroomId_studentId: { classroomId: classroom.id, studentId: student.id } }, update: {}, create: { classroomId: classroom.id, studentId: student.id } });
    await prisma.studentGamification.upsert({ where: { userId: student.id }, update: {}, create: { userId: student.id } });
  }
  const textbook = await prisma.textbook.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" }, update: {},
    create: { id: "00000000-0000-0000-0000-000000000002", title: "Grade 9 Physics", subject: "physics", grade: 9, language: "en", fileUrl: "/textbooks/grade-9-physics.pdf", totalPages: 1, description: "Pigeonlab demonstration textbook", createdBy: admin.id },
  });
  await prisma.textbookChapter.upsert({ where: { id: "00000000-0000-0000-0000-000000000003" }, update: {}, create: { id: "00000000-0000-0000-0000-000000000003", textbookId: textbook.id, chapterNumber: 1, title: "Introduction to Physics", startPage: 1, endPage: 1 } });
}
main().finally(() => prisma.$disconnect());
