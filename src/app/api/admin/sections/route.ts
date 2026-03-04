
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  showSkills: true,
  showExperience: true,
  showProjects: true,
  showEngineering: true,
  showBlog: true,
  showEducation: true,
  showCertifications: true,
  showGithub: true,
  showContact: true,
  sectionOrder: ["hero","skills","experience","projects","engineering","blog","education","certifications","contact"],
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let sv = await prisma.sectionVisibility.findUnique({
    where: { userId: session.user.id },
  });

  if (!sv) {
    sv = await prisma.sectionVisibility.create({
      data: { userId: session.user.id, ...DEFAULTS },
    });
  }

  return NextResponse.json(sv);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const sv = await prisma.sectionVisibility.upsert({
    where: { userId: session.user.id },
    update: body,
    create: { userId: session.user.id, ...DEFAULTS, ...body },
  });

  return NextResponse.json(sv);
}