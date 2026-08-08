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

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailFrom = process.env.EMAIL_FROM;
    if (!smtpHost || !smtpUser || !smtpPass || !emailFrom) {
      return NextResponse.json(
        {
          success: false,
          message: "Email delivery is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and EMAIL_FROM before sending invitations.",
        },
        { status: 503 },
      );
    }

    const smtpPort = Number(process.env.SMTP_PORT || 587);
    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
      return NextResponse.json({ success: false, message: "SMTP_PORT is invalid." }, { status: 503 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      await transporter.verify();
    } catch (error) {
      console.error("SMTP verification failed:", error);
      return NextResponse.json(
        { success: false, message: "Email delivery could not connect to the configured SMTP server. Check your SMTP settings." },
        { status: 503 },
      );
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

        await transporter.sendMail({
          from: emailFrom,
          to: email,
          subject: "You've been invited to Pigeonlab",
          html: `<p>Hello ${full_name},</p>
                 <p>You have been invited to join Pigeonlab as a ${role}.</p>
                 <p><a href="${inviteUrl}">Click here to accept the invitation and set up your account.</a></p>`,
        });

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
