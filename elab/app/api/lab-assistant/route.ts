import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

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

export async function POST(request: Request) {
  try {
    await requireUser();
    const { messages, context } = await request.json();

    const provider = process.env.AI_PROVIDER || "openai";
    const apiKey = process.env.AI_API_KEY;

    let systemContent = SYSTEM_PROMPT;
    if (context) {
      systemContent += `\n\nCurrent experiment context:\n- Subject: ${context.subject || "Unknown"}\n- Grade: ${context.grade || "Unknown"}\n- Experiment: ${context.experiment || "Unknown"}\n- Current step: ${context.step || "N/A"}\n- Live readings: ${context.readings || "N/A"}`;
    }

    if (!apiKey) {
      // Return a simulated stream if no API key is set
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const text = `Hello! I am SciBot 🔬. You are working on the ${context?.experiment || "science"} simulation. Since the AI API key is not configured, here is a mock response! Let me know if you have questions.`;
          const words = text.split(" ");
          for (const word of words) {
            // Format as SSE chunk matching OpenAI stream response
            const chunk = {
              choices: [{
                delta: { content: word + " " }
              }]
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            await new Promise(r => setTimeout(r, 80));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" }
      });
    }

    let url = "";
    let body: any = {};

    if (provider === "openai") {
      url = "https://api.openai.com/v1/chat/completions";
      body = {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      };
    } else if (provider === "google") {
      // Use Gemini API SSE stream
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`;
      body = {
        contents: [
          { role: "user", parts: [{ text: systemContent }] },
          ...messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }))
        ]
      };
    } else {
      throw new Error("Unsupported AI provider. Use openai or google.");
    }

    const aiRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: provider !== "google" ? `Bearer ${apiKey}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });

    if (!aiRes.ok) {
      throw new Error(`AI Service returned ${aiRes.status}`);
    }

    return new Response(aiRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error: any) {
    console.error("Lab Assistant failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
