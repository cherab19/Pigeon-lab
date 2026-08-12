import { NextResponse } from "next/server";
import { completeSchoolSignup } from "@/lib/db/complete-school-signup";

export async function POST(request: Request) {
  try {
    const { tx_ref: txRef } = await request.json();
    if (typeof txRef !== "string" || !txRef.startsWith("pigeonlab-signup-")) {
      return NextResponse.json({ error: "A valid signup transaction is required." }, { status: 400 });
    }

    // A missing key is the intentional local-development checkout shortcut.
    // Production must verify the payment before creating any account.
    const chapaKey = process.env.CHAPA_SECRET_KEY;
    if (chapaKey) {
      const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
        headers: { Authorization: `Bearer ${chapaKey}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      const paid = response.ok && result?.status === "success" && result?.data?.status === "success";
      if (!paid) {
        return NextResponse.json(
          { error: "Your payment has not been confirmed yet. Please complete payment and try again." },
          { status: 402 },
        );
      }
    }

    const userId = await completeSchoolSignup(txRef);
    return NextResponse.json({ success: true, user_id: userId });
  } catch (error) {
    console.error("School signup finalization failed:", error);
    return NextResponse.json({ error: "Unable to complete signup. Please contact support if payment was successful." }, { status: 500 });
  }
}
