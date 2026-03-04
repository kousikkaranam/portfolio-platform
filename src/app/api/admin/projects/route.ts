
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const count = await prisma.project.count({ where: { userId: session.user.id } });

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title: body.title,
      slug,
      description: body.description || null,
      longDescription: body.longDescription || null,
      techStack: body.techStack || [],
      githubUrl: body.githubUrl || null,
      liveUrl: body.liveUrl || null,
      thumbnailUrl: body.thumbnailUrl || null,
      screenshots: body.screenshots || [],
      architectureUrl: body.architectureUrl || null,
      category: body.category || null,
      isFeatured: body.isFeatured || false,
      displayOrder: count,
      status: body.status || "published",
    },
  });
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (data.title) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const project = await prisma.project.update({
    where: { id, userId: session.user.id },
    data,
  });
  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id")!;
  await prisma.project.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}