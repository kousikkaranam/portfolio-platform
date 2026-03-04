
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.certification.findMany({
    where: { userId: session.user.id },
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const count = await prisma.certification.count({ where: { userId: session.user.id } });

  const item = await prisma.certification.create({
    data: {
      userId: session.user.id,
      name: body.name,
      issuer: body.issuer || null,
      issueDate: body.issueDate ? new Date(body.issueDate) : null,
      credentialUrl: body.credentialUrl || null,
      displayOrder: count,
    },
  });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (data.issueDate) data.issueDate = new Date(data.issueDate);

  const item = await prisma.certification.update({
    where: { id, userId: session.user.id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id")!;
  await prisma.certification.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
