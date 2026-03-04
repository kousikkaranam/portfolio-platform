import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sections = await prisma.customSection.findMany({
    where: { userId: session.user.id },
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const count = await prisma.customSection.count({ where: { userId: session.user.id } });
  const section = await prisma.customSection.create({
    data: { userId: session.user.id, title: title.trim(), content: content ?? null, displayOrder: count },
  });
  return NextResponse.json(section);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, content, isVisible, displayOrder } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const section = await prisma.customSection.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content }),
      ...(isVisible !== undefined && { isVisible }),
      ...(displayOrder !== undefined && { displayOrder }),
    },
  });
  return NextResponse.json(section);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.customSection.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
