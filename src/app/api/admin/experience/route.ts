import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const experiences = await prisma.experience.findMany({
    where: { userId: session.user.id },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(experiences);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const experience = await prisma.experience.create({
    data: {
      userId: session.user.id,
      company: body.company,
      role: body.role,
      description: body.description,
      location: body.location,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      isCurrent: body.isCurrent ?? false,
      techStack: body.techStack ?? [],
      displayOrder: body.displayOrder ?? 0,
    },
  });

  return NextResponse.json(experience, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  await prisma.experience.updateMany({
    where: { id: body.id, userId: session.user.id },
    data: {
      company: body.company,
      role: body.role,
      description: body.description,
      location: body.location,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      isCurrent: body.isCurrent ?? false,
      techStack: body.techStack ?? [],
      displayOrder: body.displayOrder ?? 0,
    },
  });

  return NextResponse.json({ success: true });
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

  await prisma.experience.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}