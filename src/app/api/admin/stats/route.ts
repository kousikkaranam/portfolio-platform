import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [skills, experiences, projects, engineering, blogs] = await Promise.all([
    prisma.skill.count({ where: { userId } }),
    prisma.experience.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.engineeringHighlight.count({ where: { userId } }),
    prisma.blogPost.count({ where: { userId } }),
  ]);

  return NextResponse.json({ skills, experiences, projects, engineering, blogs });
}