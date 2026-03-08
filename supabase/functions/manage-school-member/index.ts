import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller
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
      return new Response(JSON.stringify({ error: "Only school admins can manage members" }), {
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
      return new Response(JSON.stringify({ error: "No school found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const schoolId = callerProfile.school_id;
    const body = await req.json();
    const { action, member_user_id, new_role } = body;

    // Verify the target member belongs to the same school
    const { data: memberProfile } = await supabaseAdmin
      .from("profiles")
      .select("school_id")
      .eq("user_id", member_user_id)
      .single();

    if (!memberProfile || memberProfile.school_id !== schoolId) {
      return new Response(JSON.stringify({ error: "Member not found in your school" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent self-modification
    if (member_user_id === caller.id) {
      return new Response(JSON.stringify({ error: "Cannot modify your own account" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_role") {
      if (!["teacher", "student"].includes(new_role)) {
        return new Response(JSON.stringify({ error: "Invalid role. Must be teacher or student" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update the role
      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ role: new_role })
        .eq("user_id", member_user_id);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Role updated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "remove") {
      // Remove user role
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", member_user_id);

      // Remove profile (disassociate from school)
      await supabaseAdmin
        .from("profiles")
        .update({ school_id: null })
        .eq("user_id", member_user_id);

      return new Response(JSON.stringify({ success: true, message: "Member removed from school" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'update_role' or 'remove'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
