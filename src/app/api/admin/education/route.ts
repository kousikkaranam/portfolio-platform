
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.education.findMany({
    where: { userId: session.user.id },
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const count = await prisma.education.count({ where: { userId: session.user.id } });

  const item = await prisma.education.create({
    data: {
      userId: session.user.id,
      institution: body.institution,
      degree: body.degree || null,
      field: body.field || null,
      startYear: body.startYear ? parseInt(body.startYear) : null,
      endYear: body.endYear ? parseInt(body.endYear) : null,
      description: body.description || null,
      displayOrder: count,
    },
  });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (data.startYear) data.startYear = parseInt(data.startYear);
  if (data.endYear) data.endYear = parseInt(data.endYear);

  const item = await prisma.education.update({
    where: { id, userId: session.user.id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id")!;
  await prisma.education.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
