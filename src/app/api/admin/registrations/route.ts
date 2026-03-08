import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OWNER_SLUG = process.env.PORTFOLIO_OWNER_SLUG;

async function isOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  if (!OWNER_SLUG) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { slug: true },
  });
  return user?.slug === OWNER_SLUG;
}

export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requests = await prisma.registrationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function PUT(req: NextRequest) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, action } = await req.json();

  if (action === "approve") {
    const request = await prisma.registrationRequest.update({
      where: { id },
      data: { status: "approved" },
    });

    // The user will be created automatically by NextAuth on their next login
    return NextResponse.json({ success: true, request });
  }

  if (action === "reject") {
    const request = await prisma.registrationRequest.update({
      where: { id },
      data: { status: "rejected" },
    });
    return NextResponse.json({ success: true, request });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
