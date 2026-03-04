
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.engineeringHighlight.findMany({
    where: { userId: session.user.id },
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const count = await prisma.engineeringHighlight.count({ where: { userId: session.user.id } });

  const item = await prisma.engineeringHighlight.create({
    data: {
      userId: session.user.id,
      title: body.title,
      slug,
      summary: body.summary || null,
      content: body.content || null,
      techStack: body.techStack || [],
      diagramUrl: body.diagramUrl || null,
      impact: body.impact || null,
      isFeatured: body.isFeatured || false,
      displayOrder: count,
      status: body.status || "published",
    },
  });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (data.title) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const item = await prisma.engineeringHighlight.update({
    where: { id, userId: session.user.id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id")!;
  await prisma.engineeringHighlight.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
