import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_PER_SEAT = 30;

// PUBLIC endpoint — called from /signup before any account exists.
// Stores signup details in pending_school_signups, then opens a Chapa checkout.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const chapaKey = Deno.env.get("CHAPA_SECRET_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const full_name = String(body.full_name || "").trim();
    const school_name = String(body.school_name || "").trim();
    const school_location = body.school_location ? String(body.school_location) : null;
    const school_phone = body.school_phone ? String(body.school_phone) : null;
    const teacher_seats = Math.max(0, parseInt(body.teacher_seats || "0", 10));
    const student_seats = Math.max(0, parseInt(body.student_seats || "0", 10));
    const return_url: string = body.return_url;

    if (!email || !password || password.length < 6 || !full_name || !school_name) {
      return new Response(JSON.stringify({ error: "Missing or invalid fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const total_seats = teacher_seats + student_seats;
    if (total_seats <= 0) {
      return new Response(JSON.stringify({ error: "Select at least 1 seat" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!return_url) {
      return new Response(JSON.stringify({ error: "Missing return_url" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if email already registered (auth.users)
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    // listUsers doesn't support filter by email directly; use getUserByEmail-like via SQL
    const { data: matchUser } = await admin
      .from("profiles")
      .select("user_id")
      .limit(1);
    void existing; void matchUser;
    // Best signal: try a lookup via auth admin
    try {
      const { data: byEmail } = await (admin.auth.admin as any).getUserByEmail?.(email) || { data: null };
      if (byEmail?.user) {
        return new Response(JSON.stringify({ error: "An account with this email already exists. Please log in." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (_) { /* getUserByEmail may not exist on this client version */ }

    const amount = total_seats * PRICE_PER_SEAT;
    const tx_ref = `dovelab-signup-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const callback_url = `${supabaseUrl}/functions/v1/chapa-webhook`;

    // Clean up any expired pending rows for this email
    await admin.from("pending_school_signups")
      .delete()
      .eq("email", email)
      .in("status", ["pending", "failed"]);

    const { error: insertErr } = await admin.from("pending_school_signups").insert({
      tx_ref, email, password, full_name, school_name, school_location, school_phone,
      teacher_seats, student_seats, amount, status: "pending",
    });
    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [first_name, ...rest] = full_name.split(" ");
    const last_name = rest.join(" ") || "Admin";

    const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${chapaKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ETB",
        email,
        first_name,
        last_name,
        tx_ref,
        callback_url,
        return_url: `${return_url}?tx_ref=${encodeURIComponent(tx_ref)}`,
        customization: {
          title: "Pigeonlab Seats",
          description: `${teacher_seats} teachers ${student_seats} students`,
        },
      }),
    });
    const chapaJson = await chapaRes.json();

    if (chapaJson?.status !== "success") {
      await admin.from("pending_school_signups")
        .update({ status: "failed", chapa_response: chapaJson })
        .eq("tx_ref", tx_ref);
      return new Response(JSON.stringify({ error: chapaJson?.message || "Chapa init failed", details: chapaJson }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("pending_school_signups")
      .update({ chapa_response: chapaJson })
      .eq("tx_ref", tx_ref);

    return new Response(JSON.stringify({
      success: true, tx_ref, checkout_url: chapaJson.data?.checkout_url, amount,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
