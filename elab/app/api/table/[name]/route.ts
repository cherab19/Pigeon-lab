import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const modelMap: Record<string, keyof typeof prisma> = {
  classrooms: "classroom" as any,
  profiles: "profile" as any,
  classroom_students: "classroomStudent" as any,
  experiment_progress: "experimentProgress" as any,
  assignments: "assignment" as any,
  announcements: "announcement" as any,
  textbooks: "textbook" as any,
  textbook_chapters: "textbookChapter" as any,
  user_roles: "userRole" as any,
  schools: "school" as any,
  school_subscriptions: "schoolSubscription" as any,
  payment_transactions: "paymentTransaction" as any,
};

function isPrivileged(user: Awaited<ReturnType<typeof requireUser>>) {
  return user.roles?.includes("super_admin" as any);
}

function mergeWhere(scope: Record<string, unknown>, requested?: Record<string, unknown>) {
  return requested && Object.keys(requested).length ? { AND: [scope, requested] } : scope;
}

async function classroomIdsFor(user: Awaited<ReturnType<typeof requireUser>>) {
  if (isPrivileged(user)) return null;
  if (user.roles?.includes("school_admin" as any)) {
    return (await prisma.classroom.findMany({ where: { schoolId: user.schoolId! }, select: { id: true } })).map(x => x.id);
  }
  if (user.roles?.includes("teacher" as any)) {
    return (await prisma.classroom.findMany({ where: { teacherId: user.id }, select: { id: true } })).map(x => x.id);
  }
  return (await prisma.classroomStudent.findMany({ where: { studentId: user.id }, select: { classroomId: true } })).map(x => x.classroomId);
}

async function scopedWhere(name: string, user: Awaited<ReturnType<typeof requireUser>>, requested?: Record<string, unknown>) {
  if (isPrivileged(user)) return requested;
  const schoolScope = user.schoolId ? { schoolId: user.schoolId } : { id: "__no_school__" };
  const classroomIds = await classroomIdsFor(user);
  let scope: Record<string, unknown>;
  switch (name) {
    case "profiles":
      scope = user.roles?.some((r: string) => r === "school_admin" || r === "teacher") ? schoolScope : { userId: user.id };
      break;
    case "user_roles": scope = { userId: user.id }; break;
    case "schools": scope = { id: user.schoolId || "__no_school__" }; break;
    case "school_subscriptions": scope = schoolScope; break;
    case "classrooms":
      scope = user.roles?.includes("school_admin" as any) ? schoolScope : user.roles?.includes("teacher" as any) ? { teacherId: user.id } : { id: { in: classroomIds || [] } };
      break;
    case "classroom_students":
      scope = user.roles?.includes("student" as any) ? { studentId: user.id } : { classroomId: { in: classroomIds || [] } };
      break;
    case "assignments":
    case "announcements": scope = { classroomId: { in: classroomIds || [] } }; break;
    case "experiment_progress":
      if (user.roles?.includes("student" as any)) scope = { userId: user.id };
      else {
        const memberIds = (await prisma.profile.findMany({ where: { schoolId: user.schoolId! }, select: { userId: true } })).map(x => x.userId);
        scope = { userId: { in: memberIds } };
      }
      break;
    case "textbooks":
    case "textbook_chapters": scope = {}; break;
    case "payment_transactions": scope = schoolScope; break;
    default: throw new Error("This table is not available through the client API");
  }
  return mergeWhere(scope, requested);
}

function canWrite(name: string, user: Awaited<ReturnType<typeof requireUser>>) {
  if (isPrivileged(user)) return true;
  if (["textbooks", "textbook_chapters", "schools", "school_subscriptions", "payment_transactions", "profiles", "user_roles"].includes(name)) return false;
  if (["assignments", "announcements"].includes(name)) return user.roles?.includes("teacher" as any) || user.roles?.includes("school_admin" as any);
  if (["classrooms", "classroom_students"].includes(name)) return user.roles?.includes("school_admin" as any);
  return name === "experiment_progress";
}

export async function POST(request: Request, { params }: { params: { name: string } }) {
  try {
    const user = await requireUser();
    const modelName = modelMap[params.name];
    if (!modelName) {
      return NextResponse.json({ error: `Unknown model: ${params.name}` }, { status: 400 });
    }

    const body = await request.json();
    const { action, where, data, select, orderBy, take } = body;
    const model = prisma[modelName] as any;
    const scoped = await scopedWhere(params.name, user, where);

    if (["create", "insert", "update", "delete", "upsert"].includes(action) && !canWrite(params.name, user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let result;
    if (action === "findMany") {
      result = await model.findMany({ where: scoped, select, orderBy, take });
    } else if (action === "findFirst" || action === "findUnique") {
      result = await model.findFirst({ where: scoped, select });
    } else if (action === "create" || action === "insert") {
      const owned = params.name === "experiment_progress" ? { ...data, userId: user.id } : data;
      result = await model.create({ data: owned });
    } else if (action === "update") {
      result = await model.updateMany({ where: scoped, data });
    } else if (action === "delete") {
      result = await model.deleteMany({ where: scoped });
    } else if (action === "upsert") {
      return NextResponse.json({ error: "Upsert is not exposed by this API" }, { status: 400 });
    } else {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error(`Table error in ${params.name}:`, error);
    const message = error instanceof Error ? error.message : "Request failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
