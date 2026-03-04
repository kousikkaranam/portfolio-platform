
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Estimate read time: ~200 words per minute
  const wordCount = (body.content || "").split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const post = await prisma.blogPost.create({
    data: {
      userId: session.user.id,
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content || null,
      coverImageUrl: body.coverImageUrl || null,
      tags: body.tags || [],
      readTimeMin,
      status: body.status || "draft",
      publishedAt: body.status === "published" ? new Date() : null,
    },
  });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (data.title) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  if (data.content) {
    data.readTimeMin = Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200));
  }
  if (data.status === "published" && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  const post = await prisma.blogPost.update({
    where: { id, userId: session.user.id },
    data,
  });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id")!;
  await prisma.blogPost.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
