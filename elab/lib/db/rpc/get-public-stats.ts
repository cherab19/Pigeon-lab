import { prisma } from "@/lib/prisma";
export async function getPublicStats() { const [schools, students] = await Promise.all([prisma.school.count(), prisma.userRole.count({ where: { role: "student" } })]); return { schools, students, experiments: 0 }; }
