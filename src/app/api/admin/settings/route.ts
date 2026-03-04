import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.portfolioSettings.findUnique({
    where: { userId: session.user.id },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { slug: true, name: true, image: true },
  });

  return NextResponse.json({ settings, user });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Update user slug/name if provided
  if (body.slug || body.name) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(body.slug && { slug: body.slug }),
        ...(body.name && { name: body.name }),
      },
    });
  }

  // Update portfolio settings
  const settings = await prisma.portfolioSettings.upsert({
    where: { userId: session.user.id },
    update: {
      siteTitle: body.siteTitle,
      tagline: body.tagline,
      bio: body.bio,
      heroImageUrl: body.heroImageUrl,
      resumeUrl: body.resumeUrl,
      location: body.location,
      availableForHire: body.availableForHire ?? false,
      socialLinks: body.socialLinks,
      theme: body.theme,
      accentColor: body.accentColor,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
    },
    create: {
      userId: session.user.id,
      siteTitle: body.siteTitle,
      tagline: body.tagline,
      bio: body.bio,
      theme: body.theme ?? "dark",
      accentColor: body.accentColor ?? "#5eead4",
    },
  });

  return NextResponse.json({ settings });
}