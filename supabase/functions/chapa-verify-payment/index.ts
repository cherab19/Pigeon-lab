import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Frontend polls this to confirm a tx after the user returns from Chapa.
// Verifies with Chapa, then applies seats if successful.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const chapaKey = Deno.env.get("CHAPA_SECRET_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const tx_ref: string = body.tx_ref;
    if (!tx_ref) {
      return new Response(JSON.stringify({ error: "missing tx_ref" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tx } = await admin.from("payment_transactions").select("*").eq("tx_ref", tx_ref).maybeSingle();
    if (!tx) {
      return new Response(JSON.stringify({ error: "transaction_not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tx.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (tx.status === "success" && tx.applied_at) {
      return new Response(JSON.stringify({ status: "success", already_applied: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${chapaKey}` },
    });
    const verifyJson = await verifyRes.json();
    const ok = verifyJson?.status === "success" && verifyJson?.data?.status === "success";

    if (!ok) {
      return new Response(JSON.stringify({ status: "pending", chapa: verifyJson }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("payment_transactions").update({ chapa_response: verifyJson }).eq("tx_ref", tx_ref);
    const { data: applied } = await admin.rpc("apply_seat_topup", { _tx_ref: tx_ref });

    return new Response(JSON.stringify({ status: "success", applied }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
