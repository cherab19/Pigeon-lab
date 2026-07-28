import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "confirm") {
      const token = String(body.token || "");
      const password = String(body.password || "");
      if (!token || password.length < 8) throw new Error("Use a password with at least 8 characters.");
      const records = await prisma.$queryRaw<Array<{ id: string; user_id: string }>>`
        SELECT id, user_id FROM password_reset_tokens
        WHERE token_hash = ${hash(token)} AND used_at IS NULL AND expires_at > NOW()
        LIMIT 1`;
      const record = records[0];
      if (!record) throw new Error("This password reset link is invalid or has expired.");
      await prisma.$transaction([
        prisma.user.update({ where: { id: record.user_id }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
        prisma.$executeRaw`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${record.id}::uuid`,
      ]);
      return NextResponse.json({ success: true });
    }

    const email = String(body.email || "").trim().toLowerCase();
    if (!email) throw new Error("Email is required.");
    const user = await prisma.user.findUnique({ where: { email } });
    // Do not disclose whether this address has an account.
    if (!user) return NextResponse.json({ success: true });
    const token = randomBytes(32).toString("base64url");
    await prisma.$executeRaw`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
      VALUES (${randomUUID()}::uuid, ${user.id}::uuid, ${hash(token)}, ${new Date(Date.now() + 60 * 60 * 1000)})`;
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${encodeURIComponent(token)}`;
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transporter.sendMail({ from: process.env.EMAIL_FROM || '"Pigeonlab" <no-reply@pigeon-lab.vercel.app>', to: email, subject: "Reset your Pigeonlab password", html: `<p><a href="${url}">Reset your password</a>. This link expires in one hour.</p>` });
    } else console.log(`[PASSWORD RESET EMAIL TO ${email}]: ${url}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reset password" }, { status: 400 });
  }
}
