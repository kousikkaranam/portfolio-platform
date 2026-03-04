import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [resume, settings] = await Promise.all([
      prisma.resume.findUnique({ where: { userId: session.user.id } }),
      prisma.portfolioSettings.findUnique({
        where: { userId: session.user.id },
        select: { resumeUrl: true },
      }),
    ]);

    return NextResponse.json({ resume, resumeUrl: settings?.resumeUrl ?? "" });
  } catch (err) {
    console.error("Resume GET error:", err);
    return NextResponse.json({ error: "Failed to load resume data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // If drive URL is being updated, sync it back to PortfolioSettings
  if ("resumeUrl" in body) {
    await prisma.portfolioSettings.upsert({
      where: { userId: session.user.id },
      update: { resumeUrl: body.resumeUrl || null },
      create: { userId: session.user.id, resumeUrl: body.resumeUrl || null },
    });
  }

  const resume = await prisma.resume.upsert({
    where: { userId: session.user.id },
    update: {
      ...(body.docContent !== undefined && { docContent: body.docContent || null }),
      ...(body.latexContent !== undefined && { latexContent: body.latexContent || null }),
      ...(body.tailoredContent !== undefined && { tailoredContent: body.tailoredContent || null }),
      ...(body.tailoredForJob !== undefined && { tailoredForJob: body.tailoredForJob || null }),
    },
    create: {
      userId: session.user.id,
      docContent: body.docContent || null,
      latexContent: body.latexContent || null,
    },
  });

  return NextResponse.json({ resume });
}
