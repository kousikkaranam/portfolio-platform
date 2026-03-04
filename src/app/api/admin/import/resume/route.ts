import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─── Prompt ──────────────────────────────────────────────

const PROMPT = (text: string) => `You are a professional resume parser. Extract structured data from this resume and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Return this exact shape:
{
  "settings": {
    "siteTitle": "Full name",
    "tagline": "One-line professional headline or null",
    "bio": "2-3 sentence professional summary or null",
    "location": "City, Country or null",
    "socialLinks": {
      "github": "full URL or bare username or null",
      "linkedin": "full URL or null",
      "twitter": "full URL or null",
      "email": "email address or null"
    }
  },
  "experiences": [
    {
      "company": "Company name",
      "role": "Job title",
      "description": "Responsibilities and achievements as a paragraph",
      "location": "City or null",
      "startDate": "YYYY-MM-01",
      "endDate": "YYYY-MM-01 or null if current",
      "isCurrent": false,
      "techStack": ["Tech1", "Tech2"]
    }
  ],
  "skills": [
    { "category": "Languages | Frameworks | Tools | Databases | Cloud | Other", "name": "Skill name", "proficiency": 80 }
  ],
  "projects": [
    { "title": "Project name", "description": "What it does", "techStack": ["Tech1"], "githubUrl": "URL or null", "liveUrl": "URL or null", "category": "web | mobile | backend | data | other" }
  ],
  "education": [
    { "institution": "University name", "degree": "Bachelor's | Master's | PhD | Diploma or null", "field": "Field of study or null", "startYear": 2019, "endYear": 2023 }
  ],
  "certifications": [
    { "name": "Certification name", "issuer": "Issuing org or null", "issueDate": "YYYY-MM-01 or null", "credentialUrl": "URL or null" }
  ]
}

Rules:
- Dates: always "YYYY-MM-01". If only year known, use "YYYY-01-01".
- proficiency: estimate 60–95 from context.
- experiences ordered newest first.
- If a field cannot be determined: null for strings, [] for arrays, null for numbers.
- Output ONLY the JSON. Nothing else.

Resume text:
${text.slice(0, 15000)}`;

// ─── PDF text extraction (no canvas required) ────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
  return text;
}

// ─── AI Providers ─────────────────────────────────────────

async function callGroq(text: string): Promise<string> {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: PROMPT(text) }],
    temperature: 0.1,
    max_tokens: 4096,
  });
  return completion.choices[0].message.content?.trim() ?? "";
}

async function callGemini(text: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const result = await model.generateContent(PROMPT(text));
  return result.response.text().trim();
}

async function callClaude(pdfBase64: string, text: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Use native PDF support if we have the base64, else fall back to text
  if (pdfBase64) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = await (client.beta.messages.create as any)({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      betas: ["pdfs-2024-09-25"],
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
          { type: "text", text: PROMPT("") },
        ],
      }],
    });
    return (msg.content[0] as { type: string; text: string }).text.trim();
  }

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: PROMPT(text) }],
  });
  return (msg.content[0] as { type: string; text: string }).text.trim();
}

// ─── Route ───────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from PDF (used by Groq/Gemini)
    let resumeText = "";
    try {
      resumeText = await extractPdfText(buffer);
    } catch {
      // Text extraction failed — Claude can still use the raw PDF bytes
    }

    const pdfBase64 = buffer.toString("base64");
    const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

    let rawJson: string;

    if (provider === "anthropic" || provider === "claude") {
      rawJson = await callClaude(pdfBase64, resumeText);
    } else if (provider === "gemini") {
      rawJson = await callGemini(resumeText || "Could not extract text from this PDF.");
    } else {
      // Default: Groq (free) → Gemini fallback → Claude fallback
      try {
        if (!resumeText || resumeText.trim().length < 50) {
          throw new Error("Not enough text extracted from PDF");
        }
        rawJson = await callGroq(resumeText);
      } catch (groqErr) {
        console.warn("Groq failed, trying Gemini:", groqErr instanceof Error ? groqErr.message : groqErr);
        try {
          rawJson = await callGemini(resumeText || "Could not extract text.");
        } catch {
          rawJson = await callClaude(pdfBase64, resumeText);
        }
      }
    }

    const cleaned = rawJson
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ data: parsed });
  } catch (err) {
    console.error("Resume import error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
