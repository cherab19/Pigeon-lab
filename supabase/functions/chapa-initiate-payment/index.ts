import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_PER_SEAT = 30; // ETB / seat / month

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
    const user = userData.user;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Check school_admin
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "school_admin");
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Only school admins can purchase seats" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await admin.from("profiles").select("school_id, full_name").eq("user_id", user.id).single();
    if (!profile?.school_id) {
      return new Response(JSON.stringify({ error: "No school" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const teacher_seats = Math.max(0, parseInt(body.teacher_seats || "0", 10));
    const student_seats = Math.max(0, parseInt(body.student_seats || "0", 10));
    // Frontend should always pass return_url (window.location.origin/subscribe).
    // Fallback used only for server-to-server tests.
    const return_url = body.return_url || `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/subscribe`;

    const total_seats = teacher_seats + student_seats;
    if (total_seats <= 0) {
      return new Response(JSON.stringify({ error: "Select at least 1 seat" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const amount = total_seats * PRICE_PER_SEAT;
    const tx_ref = `dovelab-${profile.school_id.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const callback_url = `${supabaseUrl}/functions/v1/chapa-webhook`;

    // Insert pending transaction
    await admin.from("payment_transactions").insert({
      school_id: profile.school_id,
      user_id: user.id,
      tx_ref,
      amount,
      currency: "ETB",
      teacher_seats,
      student_seats,
      status: "pending",
    });

    // Initialize Chapa checkout
    const [first_name, ...rest] = (profile.full_name || "School Admin").split(" ");
    const last_name = rest.join(" ") || "User";

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
          title: "Dovelab Seats",
          description: `${teacher_seats}T + ${student_seats}S`,
        },
      }),
    });
    const chapaJson = await chapaRes.json();

    if (chapaJson?.status !== "success") {
      await admin.from("payment_transactions").update({ status: "failed", chapa_response: chapaJson }).eq("tx_ref", tx_ref);
      return new Response(JSON.stringify({ error: chapaJson?.message || "Chapa init failed", details: chapaJson }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("payment_transactions").update({ chapa_response: chapaJson }).eq("tx_ref", tx_ref);

    return new Response(JSON.stringify({
      success: true,
      tx_ref,
      checkout_url: chapaJson.data?.checkout_url,
      amount,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
