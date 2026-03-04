
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.customTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, description: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const template = await prisma.customTemplate.create({
    data: {
      userId: session.user.id,
      name: body.name || "Custom Template",
      description: body.description || null,
      html: body.html,
      isActive: false,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const userId = session.user.id;

  // Activate a template — deactivate all others first
  if (body.action === "activate") {
    await prisma.customTemplate.updateMany({
      where: { userId },
      data: { isActive: false },
    });
    if (body.id) {
      await prisma.customTemplate.updateMany({
        where: { id: body.id, userId },
        data: { isActive: true },
      });
    }
    return NextResponse.json({ success: true });
  }

  // Deactivate all (use default template)
  if (body.action === "deactivate") {
    await prisma.customTemplate.updateMany({
      where: { userId },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  }

  // Update name/description
  await prisma.customTemplate.updateMany({
    where: { id: body.id, userId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.html && { html: body.html }),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.customTemplate.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
