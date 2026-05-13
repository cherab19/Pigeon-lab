import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, chapa-signature, x-chapa-signature",
};

// Public webhook — Chapa calls this server-to-server. Must verify via Chapa verify API.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const chapaKey = Deno.env.get("CHAPA_SECRET_KEY");
    if (!chapaKey) {
      console.error("[chapa-webhook] MISSING CHAPA_SECRET_KEY");
      return new Response(JSON.stringify({ error: "CHAPA_SECRET_KEY is not configured. Set CHAPA_SECRET_KEY in your Edge Function Secrets." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!chapaKey.startsWith("CHASECK_")) {
      console.error("[chapa-webhook] CHAPA_SECRET_KEY appears invalid (wrong prefix)");
      return new Response(JSON.stringify({ error: "CHAPA_SECRET_KEY appears invalid. It should start with 'CHASECK_'." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceRoleKey);

    let payload: any = {};
    try { payload = await req.json(); } catch (_) {}
    const url = new URL(req.url);
    const tx_ref =
      payload?.tx_ref ||
      payload?.trx_ref ||
      payload?.data?.tx_ref ||
      url.searchParams.get("tx_ref") ||
      url.searchParams.get("trx_ref");

    if (!tx_ref) {
      return new Response(JSON.stringify({ error: "missing tx_ref" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[chapa-webhook] tx_ref=${tx_ref}`);

    // Verify with Chapa (single source of truth)
    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${chapaKey}` },
    });
    const verifyJson = await verifyRes.json();
    console.log("[chapa-webhook] chapa verify", JSON.stringify(verifyJson));

    const ok = verifyJson?.status === "success" && verifyJson?.data?.status === "success";

    if (!ok) {
      await admin.from("payment_transactions")
        .update({ status: "failed", chapa_response: verifyJson })
        .eq("tx_ref", tx_ref);
      return new Response(JSON.stringify({ ok: false, message: verifyJson?.message || null, verifyJson }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("payment_transactions")
      .update({ chapa_response: verifyJson })
      .eq("tx_ref", tx_ref);

    const { data: applied, error: applyErr } = await admin.rpc("apply_seat_topup", { _tx_ref: tx_ref });
    if (applyErr) {
      return new Response(JSON.stringify({ error: applyErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, applied }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
