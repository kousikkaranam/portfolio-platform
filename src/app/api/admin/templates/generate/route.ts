import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SYSTEM_PROMPT = `You are an expert web designer. Generate a beautiful portfolio page as HTML body content.

RULES:
1. Return ONLY raw HTML body content — no <!DOCTYPE>, no <html>, no <head>, no <body> tags.
2. You MAY include a <style> block at the top of your output for custom CSS.
3. You MAY use Tailwind via inline classes (Tailwind CDN is already loaded on the page).
4. The output will be injected directly into a div, so treat it as body content.
5. Make it visually stunning: professional, modern, with sections for hero, experience, skills, projects.
6. Use CSS animations and transitions for polish.
7. MUST use these Mustache placeholders for real data — do not hard-code any names or content.

AVAILABLE MUSTACHE VARIABLES:
Single values (use as {{variableName}}):
  {{name}}        — full name
  {{tagline}}     — professional headline
  {{bio}}         — bio paragraph
  {{location}}    — city/country
  {{accentColor}} — user's accent color hex (e.g. #5eead4) — use in styles
  {{avatar}}      — profile image URL
  {{github}}      {{linkedin}}  {{twitter}}  {{email}}  {{resumeUrl}}

Loops — wrap content between section tags:
  {{#experiences}} {{role}} {{company}} {{startDate}} {{endDate}} {{description}} {{techStackStr}} {{/experiences}}
  {{#skills}}      {{name}} {{category}} {{proficiency}} {{/skills}}
  {{#projects}}    {{title}} {{description}} {{techStackStr}} {{githubUrl}} {{liveUrl}} {{thumbnail}} {{/projects}}
  {{#education}}   {{institution}} {{degreeField}} {{startYear}} {{endYear}} {{/education}}
  {{#certifications}} {{name}} {{issuer}} {{issueDate}} {{/certifications}}
  {{#blogPosts}}   {{title}} {{excerpt}} {{url}} {{publishedAt}} {{readTime}} {{/blogPosts}}

Conditional sections (only renders if data exists):
  {{#hasExperiences}}...{{/hasExperiences}}
  {{#hasProjects}}...{{/hasProjects}}
  {{#hasSkills}}...{{/hasSkills}}
  {{#hasEducation}}...{{/hasEducation}}
  {{#hasCertifications}}...{{/hasCertifications}}
  {{#hasBlogPosts}}...{{/hasBlogPosts}}

IMPORTANT: Use style="color: {{accentColor}}" or style="background-color: {{accentColor}}" where accent color should appear. Never hard-code the color.`;

async function callGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nDesign description: ${prompt}`);
  return result.response.text().trim();
}

async function callClaude(prompt: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: `${SYSTEM_PROMPT}\n\nDesign description: ${prompt}` }],
  });
  return (msg.content[0] as { type: string; text: string }).text.trim();
}

async function callGroq(prompt: string): Promise<string> {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `${SYSTEM_PROMPT}\n\nDesign description: ${prompt}` }],
    temperature: 0.7,
    max_tokens: 8192,
  });
  return completion.choices[0].message.content?.trim() ?? "";
}

function clean(raw: string): string {
  return raw
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

async function generate(prompt: string): Promise<string> {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (provider === "anthropic" || provider === "claude") return await callClaude(prompt);
  if (provider === "gemini") return await callGemini(prompt);
  // Default: Groq → Gemini → Claude
  try { return await callGroq(prompt); } catch { /* fall through */ }
  try { return await callGemini(prompt); } catch { /* fall through */ }
  return await callClaude(prompt);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt } = await request.json();
  if (!prompt?.trim()) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  try {
    const raw = await generate(prompt);
    const html = clean(raw);

    if (html.length < 200) {
      return NextResponse.json({ error: "AI returned too little content. Try a more detailed description." }, { status: 502 });
    }

    return NextResponse.json({ html });
  } catch (err) {
    console.error("Template generate error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
