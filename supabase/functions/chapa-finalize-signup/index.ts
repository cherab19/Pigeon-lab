import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PUBLIC endpoint — called from /signup/complete after Chapa redirect.
// Verifies payment with Chapa, creates the auth user (auto-confirmed),
// creates the school + profile + role + subscription with purchased seats,
// and returns the credentials so the client can sign in immediately.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const chapaKey = Deno.env.get("CHAPA_SECRET_KEY");
    if (!chapaKey) {
      console.error("[chapa-finalize-signup] MISSING CHAPA_SECRET_KEY");
      return new Response(JSON.stringify({ error: "CHAPA_SECRET_KEY is not configured. Set CHAPA_SECRET_KEY in your Edge Function Secrets." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!chapaKey.startsWith("CHASECK_")) {
      console.error("[chapa-finalize-signup] CHAPA_SECRET_KEY appears invalid (wrong prefix)");
      return new Response(JSON.stringify({ error: "CHAPA_SECRET_KEY appears invalid. It should start with 'CHASECK_'." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    console.log(`[chapa-finalize-signup] tx_ref=${tx_ref}`);

    const { data: pending } = await admin
      .from("pending_school_signups")
      .select("*")
      .eq("tx_ref", tx_ref)
      .maybeSingle();

    if (!pending) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already finalized — idempotent: return success with email so user can log in.
    if (pending.status === "consumed" && pending.consumed_user_id) {
      return new Response(JSON.stringify({
        status: "success", already: true, email: pending.email,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify with Chapa
    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${chapaKey}` },
    });
    const verifyJson = await verifyRes.json();
    console.log("[chapa-finalize-signup] chapa verify", JSON.stringify(verifyJson));
    const ok = verifyJson?.status === "success" && verifyJson?.data?.status === "success";

    if (!ok) {
      return new Response(JSON.stringify({ status: "pending", message: verifyJson?.message || null, chapa: verifyJson }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Create auth user (email auto-confirmed)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: pending.email,
      password: pending.password,
      email_confirm: true,
      user_metadata: {
        full_name: pending.full_name,
        school_name: pending.school_name,
        school_location: pending.school_location,
        school_phone: pending.school_phone,
      },
    });
    if (createErr || !created?.user) {
      // If user already exists (e.g. concurrent finalize), try to recover
      const msg = createErr?.message || "Failed to create user";
      return new Response(JSON.stringify({ error: msg }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const newUserId = created.user.id;

    // The handle_new_school_signup trigger will create school + profile + role + trial subscription.
    // We then upgrade the subscription with the purchased seats.

    // Fetch the school_id created by the trigger
    let schoolId: string | null = null;
    for (let i = 0; i < 10 && !schoolId; i++) {
      const { data: prof } = await admin.from("profiles").select("school_id").eq("user_id", newUserId).maybeSingle();
      schoolId = prof?.school_id || null;
      if (!schoolId) await new Promise(r => setTimeout(r, 200));
    }
    if (!schoolId) {
      return new Response(JSON.stringify({ error: "school_not_provisioned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upgrade subscription with purchased seats
    await admin.from("school_subscriptions").update({
      teacher_seats: pending.teacher_seats,
      student_seats: pending.student_seats,
      status: "active",
      activated_at: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq("school_id", schoolId);

    // Record a payment_transactions row for audit/history
    await admin.from("payment_transactions").insert({
      school_id: schoolId,
      user_id: newUserId,
      tx_ref,
      amount: pending.amount,
      currency: "ETB",
      teacher_seats: pending.teacher_seats,
      student_seats: pending.student_seats,
      status: "success",
      chapa_response: verifyJson,
      applied_at: new Date().toISOString(),
    });

    // Mark pending row consumed and clear the password
    await admin.from("pending_school_signups").update({
      status: "consumed",
      consumed_user_id: newUserId,
      password: "",
      chapa_response: verifyJson,
    }).eq("tx_ref", tx_ref);

    return new Response(JSON.stringify({
      status: "success", email: pending.email, user_id: newUserId,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
