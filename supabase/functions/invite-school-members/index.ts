import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller is a school_admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is school_admin
    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "school_admin");

    if (!roleCheck || roleCheck.length === 0) {
      return new Response(JSON.stringify({ error: "Only school admins can invite members" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get caller's school
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("school_id")
      .eq("user_id", caller.id)
      .single();

    if (!callerProfile?.school_id) {
      return new Response(JSON.stringify({ error: "No school found for caller" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const school_id = callerProfile.school_id;
    const body = await req.json();

    // Support single or bulk invitations
    const members: Array<{ email: string; full_name: string; role: string }> = 
      Array.isArray(body.members) ? body.members : [body];

    // ===== Seat quota enforcement =====
    const { data: quotaData } = await supabaseAdmin.rpc("can_invite_member", { _school_id: school_id, _role: "student" });
    const q = (quotaData as any) || { available_teachers: 0, available_students: 0, teacher_seats: 0, student_seats: 0 };

    const reqTeachers = members.filter(m => m.role === "teacher").length;
    const reqStudents = members.filter(m => m.role === "student").length;
    const teacherShortfall = Math.max(0, reqTeachers - (q.available_teachers || 0));
    const studentShortfall = Math.max(0, reqStudents - (q.available_students || 0));

    if (teacherShortfall > 0 || studentShortfall > 0) {
      return new Response(JSON.stringify({
        error: "seat_quota_exceeded",
        message: "Not enough seats. Please purchase additional seats to continue.",
        shortfall: { teacher_seats: teacherShortfall, student_seats: studentShortfall },
        quota: q,
        requested: { teacher_seats: reqTeachers, student_seats: reqStudents },
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const member of members) {
      const { email, full_name, role } = member;

      if (!email || !full_name || !role) {
        results.push({ email: email || "unknown", success: false, error: "Missing required fields" });
        continue;
      }

      if (!["teacher", "student"].includes(role)) {
        results.push({ email, success: false, error: "Invalid role" });
        continue;
      }

      try {
        // Always redirect invite links to the production app on Vercel
        const appBaseUrl = "https://pigeon-lab.vercel.app";

        const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            full_name,
            invited_school_id: school_id,
            invited_role: role,
          },
          redirectTo: `${appBaseUrl}/signup`,
        });

        if (inviteError) {
          results.push({ email, success: false, error: inviteError.message });
        } else {
          results.push({ email, success: true });
        }
      } catch (e) {
        results.push({ email, success: false, error: e.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      summary: { invited: successCount, failed: failCount, total: results.length }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
