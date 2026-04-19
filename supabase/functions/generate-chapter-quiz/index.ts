import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { chapter_id, chapter_text, chapter_title } = await req.json();
    if (!chapter_id || !chapter_title) {
      return new Response(JSON.stringify({ error: "chapter_id and chapter_title required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check — only super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supaAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supaAuth.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roles } = await supaAuth.from("user_roles").select("role").eq("user_id", user.id);
    if (!roles?.some((r: any) => r.role === "super_admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sourceText = (chapter_text || `Chapter: ${chapter_title}`).slice(0, 12000);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a curriculum-aligned quiz author for Ethiopian Grade 9-12 science textbooks. Always produce clear, factually accurate multiple choice questions in English." },
          { role: "user", content: `Generate exactly 5 multiple choice questions based on this chapter titled "${chapter_title}". Each question must have 4 options and exactly one correct answer. Include a brief explanation.\n\nChapter content:\n${sourceText}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "save_quiz",
            description: "Save the generated quiz questions",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                      correctIndex: { type: "integer", minimum: 0, maximum: 3 },
                      explanation: { type: "string" },
                    },
                    required: ["question", "options", "correctIndex", "explanation"],
                    additionalProperties: false,
                  },
                  minItems: 5, maxItems: 5,
                },
              },
              required: ["questions"], additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "save_quiz" } },
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return new Response(JSON.stringify({ error: "No quiz generated" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const parsed = JSON.parse(toolCall.function.arguments);
    const questions = parsed.questions;

    // Save with service role (bypass RLS, we already auth-checked)
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { error: upsertErr } = await supa
      .from("chapter_quizzes")
      .upsert({ chapter_id, questions, generated_by_ai: true }, { onConflict: "chapter_id" });
    if (upsertErr) {
      // Fallback: delete + insert if no unique constraint
      await supa.from("chapter_quizzes").delete().eq("chapter_id", chapter_id);
      const { error: insErr } = await supa.from("chapter_quizzes").insert({ chapter_id, questions, generated_by_ai: true });
      if (insErr) {
        console.error("DB error:", insErr);
        return new Response(JSON.stringify({ error: "Failed to save quiz" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ success: true, questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
