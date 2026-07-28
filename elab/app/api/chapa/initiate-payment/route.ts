import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRICE_PER_SEAT = 30; // ETB / seat / month

export async function POST(request: Request) {
  try {
    const user = await requireSchoolAdmin();
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { school: true }
    });

    if (!profile?.schoolId) {
      throw new Error("User has no school associated");
    }

    const body = await request.json();
    const teacher_seats = Math.max(0, parseInt(body.teacher_seats || "0", 10));
    const student_seats = Math.max(0, parseInt(body.student_seats || "0", 10));
    const return_url = body.return_url || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscribe`;

    const total_seats = teacher_seats + student_seats;
    if (total_seats <= 0) {
      return NextResponse.json({ error: "Select at least 1 seat" }, { status: 400 });
    }

    const amount = total_seats * PRICE_PER_SEAT;
    const tx_ref = `pigeonlab-${profile.schoolId.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const callback_url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/chapa/webhook`;

    // Create pending transaction in Prisma
    await prisma.paymentTransaction.create({
      data: {
        schoolId: profile.schoolId,
        userId: user.id,
        txRef: tx_ref,
        amount,
        currency: "ETB",
        teacherSeats: teacher_seats,
        studentSeats: student_seats,
        status: "pending",
      }
    });

    const [first_name, ...rest] = (profile.fullName || "School Admin").split(" ");
    const last_name = rest.join(" ") || "User";

    const chapaKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaKey) {
      throw new Error("CHAPA_SECRET_KEY not configured");
    }

    const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chapaKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ETB",
        email: user.email,
        first_name,
        last_name,
        tx_ref,
        callback_url,
        return_url,
        customization: {
          title: "Pigeonlab Seats",
          description: `${teacher_seats}T + ${student_seats}S`,
        },
      }),
    });

    const chapaJson = await chapaRes.json();

    if (chapaJson?.status !== "success") {
      await prisma.paymentTransaction.update({
        where: { txRef: tx_ref },
        data: { status: "failed", chapaResponse: chapaJson }
      });
      return NextResponse.json({ error: chapaJson?.message || "Chapa initialization failed" }, { status: 400 });
    }

    await prisma.paymentTransaction.update({
      where: { txRef: tx_ref },
      data: { chapaResponse: chapaJson }
    });

    return NextResponse.json({
      success: true,
      tx_ref,
      checkout_url: chapaJson.data?.checkout_url,
      amount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
