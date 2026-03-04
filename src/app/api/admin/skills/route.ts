import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skills = await prisma.skill.findMany({
    where: { userId: session.user.id },
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
  });

  return NextResponse.json(skills);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const skill = await prisma.skill.create({
    data: {
      userId: session.user.id,
      category: body.category,
      name: body.name,
      iconUrl: body.iconUrl,
      proficiency: body.proficiency ? parseInt(body.proficiency) : null,
      displayOrder: body.displayOrder ?? 0,
    },
  });

  return NextResponse.json(skill, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const skill = await prisma.skill.updateMany({
    where: { id: body.id, userId: session.user.id },
    data: {
      category: body.category,
      name: body.name,
      iconUrl: body.iconUrl,
      proficiency: body.proficiency ? parseInt(body.proficiency) : null,
      displayOrder: body.displayOrder ?? 0,
    },
  });

  return NextResponse.json(skill);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await prisma.skill.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}