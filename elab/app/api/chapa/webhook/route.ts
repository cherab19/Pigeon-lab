import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applySeatTopup } from "@/lib/chapa";

export async function POST(request: Request) {
  try {
    const chapaKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaKey) {
      return NextResponse.json({ error: "CHAPA_SECRET_KEY not configured" }, { status: 500 });
    }

    let payload: any = {};
    try { payload = await request.json(); } catch (_) {}
    const url = new URL(request.url);
    const tx_ref =
      payload?.tx_ref ||
      payload?.trx_ref ||
      payload?.data?.tx_ref ||
      url.searchParams.get("tx_ref") ||
      url.searchParams.get("trx_ref");

    if (!tx_ref) {
      return NextResponse.json({ error: "missing tx_ref" }, { status: 400 });
    }

    // Verify transaction with Chapa
    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${chapaKey}` },
    });
    const verifyJson = await verifyRes.json();
    const ok = verifyJson?.status === "success" && verifyJson?.data?.status === "success";

    if (!ok) {
      await prisma.paymentTransaction.update({
        where: { txRef: tx_ref },
        data: { status: "failed", chapaResponse: verifyJson }
      });
      return NextResponse.json({ ok: false, message: verifyJson?.message || null, verifyJson });
    }

    await prisma.paymentTransaction.update({
      where: { txRef: tx_ref },
      data: { chapaResponse: verifyJson }
    });

    const result = await applySeatTopup(tx_ref);

    return NextResponse.json({ ok: true, applied: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
