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
      supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles").select("school_id").eq("user_id", caller.id).single();

    if (!callerProfile?.school_id) {
      return new Response(JSON.stringify({ error: "No school found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const schoolId = callerProfile.school_id;
    const body = await req.json();
    const { action } = body;

    // ========== CREATE CLASSROOM (admin only) ==========
    if (action === "create_classroom") {
      const { data: isAdmin } = await supabaseAdmin.from("user_roles")
        .select("role").eq("user_id", caller.id).eq("role", "school_admin");
      if (!isAdmin?.length) {
        return new Response(JSON.stringify({ error: "Only school admins can create classrooms" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { teacher_id, subject, grade, section } = body;
      if (!teacher_id || !subject || !grade) {
        return new Response(JSON.stringify({ error: "teacher_id, subject, and grade are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: classroom, error } = await supabaseAdmin
        .from("classrooms")
        .insert({ school_id: schoolId, teacher_id, subject, grade, section: section || "A" })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, classroom }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== DELETE CLASSROOM (admin only) ==========
    if (action === "delete_classroom") {
      const { data: isAdmin } = await supabaseAdmin.from("user_roles")
        .select("role").eq("user_id", caller.id).eq("role", "school_admin");
      if (!isAdmin?.length) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { classroom_id } = body;
      const { error } = await supabaseAdmin.from("classrooms").delete().eq("id", classroom_id).eq("school_id", schoolId);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== ENROLL STUDENTS (admin only) ==========
    if (action === "enroll_students") {
      const { data: isAdmin } = await supabaseAdmin.from("user_roles")
        .select("role").eq("user_id", caller.id).eq("role", "school_admin");
      if (!isAdmin?.length) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { classroom_id, student_ids } = body;
      if (!classroom_id || !student_ids?.length) {
        return new Response(JSON.stringify({ error: "classroom_id and student_ids required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify classroom belongs to school
      const { data: cls } = await supabaseAdmin.from("classrooms")
        .select("id").eq("id", classroom_id).eq("school_id", schoolId).single();
      if (!cls) {
        return new Response(JSON.stringify({ error: "Classroom not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const rows = student_ids.map((sid: string) => ({ classroom_id, student_id: sid }));
      const { error } = await supabaseAdmin.from("classroom_students")
        .upsert(rows, { onConflict: "classroom_id,student_id" });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, enrolled: student_ids.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== UNENROLL STUDENT (admin only) ==========
    if (action === "unenroll_student") {
      const { data: isAdmin } = await supabaseAdmin.from("user_roles")
        .select("role").eq("user_id", caller.id).eq("role", "school_admin");
      if (!isAdmin?.length) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { classroom_id, student_id } = body;
      await supabaseAdmin.from("classroom_students")
        .delete().eq("classroom_id", classroom_id).eq("student_id", student_id);

      return new Response(JSON.stringify({ success: true }), {
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
