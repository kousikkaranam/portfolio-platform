import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { fetchPortfolioData } from "@/lib/portfolio";
import type { PortfolioData } from "@/templates/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory rate limiter: username:ip → { count, resetAt }
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isAllowed(key: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + 86_400_000 });
    return true;
  }
  if (entry.count >= 50) return false;
  entry.count++;
  return true;
}

function buildSystemPrompt(data: PortfolioData): string {
  const { user, settings, skills, experiences, projects, education, certifications, blogPosts, engineering, customSections } = data;
  const lines: string[] = [];

  lines.push(`You are an AI assistant embedded in ${user.name}'s portfolio website. Your sole purpose is to answer questions about ${user.name} — their work, projects, skills, background, and anything visible on this portfolio. Be concise, friendly, and professional. If something isn't covered below, say you don't have that detail and suggest the visitor explore the portfolio or reach out directly. Never make things up.`);
  lines.push("");

  lines.push(`## Identity`);
  lines.push(`Name: ${user.name}`);
  if (settings.tagline) lines.push(`Tagline: ${settings.tagline}`);
  if (settings.bio) lines.push(`Bio: ${settings.bio}`);
  if (settings.location) lines.push(`Location: ${settings.location}`);
  lines.push(`Available for hire: ${settings.availableForHire ? "Yes" : "Not currently"}`);
  lines.push("");

  if (skills.length > 0) {
    lines.push(`## Skills`);
    const grouped: Record<string, string[]> = {};
    for (const sk of skills) {
      (grouped[sk.category] ??= []).push(sk.name);
    }
    for (const [cat, names] of Object.entries(grouped)) {
      lines.push(`${cat}: ${names.join(", ")}`);
    }
    lines.push("");
  }

  if (experiences.length > 0) {
    lines.push(`## Work Experience`);
    for (const ex of experiences) {
      const start = new Date(ex.startDate).getFullYear();
      const end = ex.isCurrent ? "Present" : ex.endDate ? new Date(ex.endDate).getFullYear() : "?";
      lines.push(`- ${ex.role} at ${ex.company} (${start}–${end})${ex.location ? `, ${ex.location}` : ""}`);
      if (ex.description) lines.push(`  ${ex.description}`);
      if (ex.techStack.length > 0) lines.push(`  Tech: ${ex.techStack.join(", ")}`);
    }
    lines.push("");
  }

  if (projects.length > 0) {
    lines.push(`## Projects`);
    for (const p of projects) {
      lines.push(`- ${p.title}${p.isFeatured ? " ★" : ""}`);
      if (p.description) lines.push(`  ${p.description}`);
      if (p.techStack.length > 0) lines.push(`  Tech: ${p.techStack.join(", ")}`);
      if (p.liveUrl) lines.push(`  Live: ${p.liveUrl}`);
      if (p.githubUrl) lines.push(`  GitHub: ${p.githubUrl}`);
    }
    lines.push("");
  }

  if (engineering.length > 0) {
    lines.push(`## Engineering Highlights`);
    for (const e of engineering) {
      lines.push(`- ${e.title}`);
      if (e.summary) lines.push(`  ${e.summary}`);
      if (e.impact) lines.push(`  Impact: ${e.impact}`);
      if (e.techStack.length > 0) lines.push(`  Tech: ${e.techStack.join(", ")}`);
    }
    lines.push("");
  }

  if (education.length > 0) {
    lines.push(`## Education`);
    for (const ed of education) {
      const degree = [ed.degree, ed.field].filter(Boolean).join(" in ");
      const years = [ed.startYear, ed.endYear].filter(Boolean).join("–");
      lines.push(`- ${degree ? degree + " at " : ""}${ed.institution}${years ? ` (${years})` : ""}`);
      if (ed.description) lines.push(`  ${ed.description}`);
    }
    lines.push("");
  }

  if (certifications.length > 0) {
    lines.push(`## Certifications`);
    for (const c of certifications) {
      lines.push(`- ${c.name}${c.issuer ? ` by ${c.issuer}` : ""}`);
    }
    lines.push("");
  }

  if (blogPosts.length > 0) {
    lines.push(`## Blog Posts`);
    for (const b of blogPosts) {
      lines.push(`- "${b.title}"${b.tags.length > 0 ? ` [${b.tags.join(", ")}]` : ""}`);
      if (b.excerpt) lines.push(`  ${b.excerpt}`);
    }
    lines.push("");
  }

  if (customSections.filter((cs) => cs.isVisible).length > 0) {
    for (const cs of customSections.filter((cs) => cs.isVisible)) {
      lines.push(`## ${cs.title}`);
      if (cs.content) lines.push(cs.content.slice(0, 500));
      lines.push("");
    }
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = `${username}:${ip}`;
  if (!isAllowed(rateLimitKey)) {
    return NextResponse.json({ error: "Daily message limit reached. Please try again tomorrow." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const messages: { role: "user" | "assistant"; content: string }[] = body?.messages ?? [];

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const data = await fetchPortfolioData(username);
  if (!data) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(data);

  // Keep only last 10 messages to stay within context limits
  const trimmed = messages.slice(-10);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...trimmed.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 512,
    temperature: 0.6,
  });

  const content = completion.choices[0]?.message?.content ?? "I'm not sure how to answer that.";
  return NextResponse.json({ content });
}
