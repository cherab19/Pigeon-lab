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

    // Check caller is super_admin
    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "super_admin");

    if (!roleCheck || roleCheck.length === 0) {
      return new Response(JSON.stringify({ error: "Only super admins can perform this action" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ========== SCHOOL CRUD ==========
    if (action === "create_school") {
      const { name, location, email, phone } = body;
      if (!name) {
        return new Response(JSON.stringify({ error: "School name is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: school, error } = await supabaseAdmin
        .from("schools")
        .insert({ name, location: location || null, email: email || null, phone: phone || null })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, school }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_school") {
      const { school_id, name, location, email, phone } = body;
      if (!school_id) {
        return new Response(JSON.stringify({ error: "school_id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updates: Record<string, any> = {};
      if (name !== undefined) updates.name = name;
      if (location !== undefined) updates.location = location || null;
      if (email !== undefined) updates.email = email || null;
      if (phone !== undefined) updates.phone = phone || null;

      const { error } = await supabaseAdmin
        .from("schools")
        .update(updates)
        .eq("id", school_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "School updated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_school") {
      const { school_id } = body;
      if (!school_id) {
        return new Response(JSON.stringify({ error: "school_id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Remove all members from this school
      const { data: schoolProfiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("school_id", school_id);

      if (schoolProfiles) {
        for (const p of schoolProfiles) {
          await supabaseAdmin.from("user_roles").delete().eq("user_id", p.user_id);
        }
        await supabaseAdmin.from("profiles").update({ school_id: null }).eq("school_id", school_id);
      }

      // Delete subscription
      await supabaseAdmin.from("school_subscriptions").delete().eq("school_id", school_id);

      // Delete school
      const { error } = await supabaseAdmin.from("schools").delete().eq("id", school_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "School deleted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== USER MANAGEMENT ==========
    if (action === "update_user_role") {
      const { user_id, new_role } = body;
      if (!user_id || !new_role) {
        return new Response(JSON.stringify({ error: "user_id and new_role are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!["super_admin", "school_admin", "teacher", "student"].includes(new_role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent self-demotion
      if (user_id === caller.id && new_role !== "super_admin") {
        return new Response(JSON.stringify({ error: "Cannot demote yourself" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from("user_roles")
        .update({ role: new_role })
        .eq("user_id", user_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Role updated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove_user") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot remove yourself" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      await supabaseAdmin.from("profiles").update({ school_id: null }).eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true, message: "User removed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "assign_school") {
      const { user_id, school_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ school_id: school_id || null })
        .eq("user_id", user_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "School assignment updated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
