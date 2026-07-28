export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export async function generateQuiz(chapterTitle: string, sourceText: string): Promise<QuizQuestion[]> {
  const provider = process.env.AI_PROVIDER || "openai";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    // Fallback static quiz for local dev if key is missing
    return getMockQuiz(chapterTitle);
  }

  const prompt = `Generate exactly 5 multiple choice questions based on this chapter titled "${chapterTitle}". Each question must have 4 options and exactly one correct answer. Include a brief explanation. Return the result strictly in JSON format matching this schema: { "questions": [ { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." } ] }`;

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a curriculum-aligned quiz author for Ethiopian secondary school science. Always output valid JSON." },
          { role: "user", content: `${prompt}\n\nChapter content:\n${sourceText}` }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return parsed.questions;
  } else if (provider === "google") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${prompt}\n\nChapter content:\n${sourceText}` }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });
    if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(content);
    return parsed.questions;
  }
  throw new Error("Unsupported AI provider. Use openai or google.");
}

function getMockQuiz(title: string): QuizQuestion[] {
  return [
    {
      question: `Which of the following is a key topic covered in ${title}?`,
      options: ["Basic principles and theories", "Unrelated historical events", "Fictional accounts", "Irrelevant formulas"],
      correctIndex: 0,
      explanation: "Ethiopian Grade 9-12 curriculum textbooks cover the basic principles and theories of their respective sciences."
    },
    {
      question: "Why is virtual lab experimentation beneficial?",
      options: ["No internet is required ever", "It eliminates chemical hazards while allowing infinite repetitions", "It makes students taller", "It replaces the teacher entirely"],
      correctIndex: 1,
      explanation: "Virtual lab simulations allow safe, repetitive science testing."
    },
    {
      question: "Which subject is most relevant to electric circuits?",
      options: ["Biology", "Chemistry", "Physics", "Social Studies"],
      correctIndex: 2,
      explanation: "Physics studies electric currents, resistors, voltage, and circuit laws."
    },
    {
      question: "What does Ohm's Law state?",
      options: ["V = I / R", "V = I * R", "V = R / I", "V = I + R"],
      correctIndex: 1,
      explanation: "Ohm's Law states that Voltage (V) equals Current (I) multiplied by Resistance (R)."
    },
    {
      question: "What is the primary language of secondary science education in Ethiopia?",
      options: ["Spanish", "French", "English", "German"],
      correctIndex: 2,
      explanation: "Secondary school textbooks in Ethiopian Grade 9-12 are authored primarily in English."
    }
  ];
}
