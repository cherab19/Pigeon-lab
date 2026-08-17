import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  email: z.string().email(), password: z.string().min(6), full_name: z.string().min(1), school_name: z.string().min(1), school_location: z.string().optional(), school_phone: z.string().optional(), teacher_seats: z.number().int().min(0), student_seats: z.number().int().min(0), return_url: z.string().url(),
});

function errorText(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) return value.map((item) => errorText(item, "")).filter(Boolean).join("; ") || fallback;
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([field, reason]) => `${field}: ${errorText(reason, "Invalid value")}`).join("; ") || fallback;
  return fallback;
}

export async function POST(request: Request) {
  try {
    const data = signupSchema.parse(await request.json());
    const seats = data.teacher_seats + data.student_seats;
    if (!seats) return NextResponse.json({ error: "Select at least one seat." }, { status: 400 });

    const email = data.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });

    // Keep the finalization prefix while keeping the reference compact for Chapa.
    const txRef = `pigeonlab-signup-${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
    const amount = seats * 30;
    await prisma.pendingSchoolSignup.create({ data: { txRef, email, password: await bcrypt.hash(data.password, 12), fullName: data.full_name, schoolName: data.school_name, schoolLocation: data.school_location || null, schoolPhone: data.school_phone || null, teacherSeats: data.teacher_seats, studentSeats: data.student_seats, amount } });

    const chapaKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaKey) return NextResponse.json({ tx_ref: txRef, checkout_url: `${data.return_url}?tx_ref=${encodeURIComponent(txRef)}&development=1` });

    const nameParts = data.full_name.trim().split(/\s+/);
    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${chapaKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: String(amount), currency: "ETB", email, first_name: nameParts[0], last_name: nameParts.slice(1).join(" ") || "School", tx_ref: txRef, return_url: data.return_url, customization: { title: "Pigeonlab", description: `${seats} subscription seats` } }),
    });
    const payload = await response.json().catch(() => null);
    const checkoutUrl = payload?.data?.checkout_url;
    if (!response.ok || typeof checkoutUrl !== "string") {
      const message = errorText(payload?.message ?? payload?.error, "Chapa could not initialize payment.");
      console.warn("Chapa signup initialization rejected", { status: response.status, message });
      return NextResponse.json({ error: message }, { status: 502 });
    }

    await prisma.pendingSchoolSignup.update({ where: { txRef }, data: { chapaResponse: payload } });
    return NextResponse.json({ tx_ref: txRef, checkout_url: checkoutUrl });
  } catch (error) {
    console.error("School signup initialization failed:", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please enter valid registration details." }, { status: 400 });
    return NextResponse.json({ error: "Unable to start registration. Please try again later." }, { status: 500 });
  }
}
