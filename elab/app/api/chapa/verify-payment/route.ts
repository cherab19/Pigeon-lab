import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applySeatTopup } from "@/lib/chapa";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const tx_ref: string = body.tx_ref;

    if (!tx_ref) {
      return NextResponse.json({ error: "missing tx_ref" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.findUnique({
      where: { txRef: tx_ref }
    });

    if (!tx) {
      return NextResponse.json({ error: "transaction_not_found" }, { status: 404 });
    }

    if (tx.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (tx.status === "success" && tx.appliedAt) {
      return NextResponse.json({ status: "success", already_applied: true });
    }

    const chapaKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaKey) {
      return NextResponse.json({ error: "CHAPA_SECRET_KEY is not configured" }, { status: 500 });
    }

    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${chapaKey}` },
    });
    const verifyJson = await verifyRes.json();
    const ok = verifyJson?.status === "success" && verifyJson?.data?.status === "success";

    if (!ok) {
      return NextResponse.json({ status: "pending", message: verifyJson?.message || null, chapa: verifyJson });
    }

    await prisma.paymentTransaction.update({
      where: { txRef: tx_ref },
      data: { chapaResponse: verifyJson }
    });

    const result = await applySeatTopup(tx_ref);

    return NextResponse.json({ status: "success", applied: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
