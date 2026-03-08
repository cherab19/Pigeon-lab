import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are SciBot 🔬, a friendly and expert virtual lab assistant for high school science students (Grades 9-12). You help with Physics, Chemistry, and Biology experiments.

Your capabilities:
- Explain scientific concepts in simple, engaging language
- Guide students step-by-step through lab procedures
- Help interpret experimental data and observations
- Suggest what to try next in a simulation
- Answer "why" questions about phenomena they observe
- Provide safety tips for real-world lab equivalents
- Give hints without giving away answers directly

Your personality:
- Enthusiastic about science! Use occasional emojis 🧪⚡🔬
- Patient and encouraging — never make students feel dumb
- Use analogies and real-world examples
- Keep responses concise (2-4 paragraphs max unless asked for detail)
- Reference the specific experiment context when provided

When a student shares their current experiment context (subject, grade, experiment name, current readings), tailor your response to that specific simulation.

IMPORTANT: You are an educational assistant. Never do homework for students — guide them to discover answers themselves.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system prompt
    let systemContent = SYSTEM_PROMPT;
    if (context) {
      systemContent += `\n\nCurrent experiment context:\n- Subject: ${context.subject || "Unknown"}\n- Grade: ${context.grade || "Unknown"}\n- Experiment: ${context.experiment || "Unknown"}\n- Current step: ${context.step || "N/A"}\n- Live readings: ${context.readings || "N/A"}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("lab-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
