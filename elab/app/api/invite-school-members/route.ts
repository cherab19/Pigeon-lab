import { NextResponse } from "next/server";
import { AppRole } from "@prisma/client";
import { requireSchoolAdmin } from "@/lib/auth";
import { canInvite } from "@/lib/db/rpc";
import { signInvite } from "@/lib/invites";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const user = await requireSchoolAdmin();
    const body = await request.json();
    const members = Array.isArray(body.members) ? body.members : [body];

    if (members.length === 0) {
      throw new Error("Members list is empty");
    }

    // Seat quota enforcement
    const q = await canInvite(user.schoolId!, "student");
    const reqTeachers = members.filter((m: any) => m.role === "teacher").length;
    const reqStudents = members.filter((m: any) => m.role === "student").length;
    const teacherShortfall = Math.max(0, reqTeachers - q.available_teachers);
    const studentShortfall = Math.max(0, reqStudents - q.available_students);

    if (teacherShortfall > 0 || studentShortfall > 0) {
      return NextResponse.json({
        error: "seat_quota_exceeded",
        message: "Not enough seats. Please purchase additional seats to continue.",
        shortfall: { teacher_seats: teacherShortfall, student_seats: studentShortfall },
        quota: q,
        requested: { teacher_seats: reqTeachers, student_seats: reqStudents },
      }, { status: 402 });
    }

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    // Optional email transporter
    let transporter: any = null;
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    for (const member of members) {
      const { email, full_name, role } = member;

      if (!email || !full_name || !role) {
        results.push({ email: email || "unknown", success: false, error: "Missing fields" });
        continue;
      }

      if (!([AppRole.teacher, AppRole.student] as AppRole[]).includes(role as AppRole)) {
        results.push({ email, success: false, error: "Invalid role" });
        continue;
      }

      try {
        const token = await signInvite({
          email: String(email).toLowerCase(),
          fullName: String(full_name || ""),
          schoolId: user.schoolId!,
          role: role as AppRole,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const inviteUrl = `${appUrl}/signup/complete?token=${encodeURIComponent(token)}`;

        if (transporter) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Pigeonlab" <no-reply@pigeon-lab.vercel.app>',
            to: email,
            subject: "You've been invited to Pigeonlab",
            html: `<p>Hello ${full_name},</p>
                   <p>You have been invited to join Pigeonlab as a ${role}.</p>
                   <p><a href="${inviteUrl}">Click here to accept the invitation and set up your account.</a></p>`,
          });
        } else {
          console.log(`[INVITE EMAIL TO ${email}]: ${inviteUrl}`);
        }

        results.push({ email, success: true });
      } catch (err: any) {
        results.push({ email, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: { invited: successCount, failed: failCount, total: results.length }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
