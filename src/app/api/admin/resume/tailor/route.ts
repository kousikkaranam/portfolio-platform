import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(resume: string, jobDescription: string): string {
  return `You are an expert resume writer. Tailor the following resume specifically for the job description provided.

Rules:
- Keep the same general structure and sections
- Reorder and emphasize bullet points that match the job requirements
- Rewrite descriptions to use keywords from the job description naturally
- Quantify achievements where possible
- Keep all facts accurate — do NOT invent experience or skills not present
- Keep it concise and ATS-friendly
- Return ONLY the tailored resume text, no explanations

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

ORIGINAL RESUME:
${resume.slice(0, 8000)}

TAILORED RESUME:`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { jobDescription, useLatex } = body;

  if (!jobDescription?.trim()) {
    return NextResponse.json({ error: "Job description is required" }, { status: 400 });
  }

  // Load saved resume
  const resume = await prisma.resume.findUnique({ where: { userId: session.user.id } });
  const content = useLatex ? resume?.latexContent : resume?.docContent;

  if (!content?.trim()) {
    return NextResponse.json({
      error: useLatex
        ? "No LaTeX content saved. Go to the LaTeX tab and save your resume first."
        : "No document content saved. Go to the Document tab and save your resume first.",
    }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: buildPrompt(content, jobDescription) }],
  });

  const tailored = (message.content[0] as { type: string; text: string }).text.trim();

  // Save tailored result
  await prisma.resume.update({
    where: { userId: session.user.id },
    data: { tailoredContent: tailored, tailoredForJob: jobDescription.slice(0, 500) },
  });

  return NextResponse.json({ tailored });
}
