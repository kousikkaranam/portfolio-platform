
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { settings, experiences, skills, projects, education, certifications } = body;

  const results: Record<string, number> = {};

  // --- Settings (upsert) ---
  if (settings) {
    const existing = await prisma.portfolioSettings.findUnique({ where: { userId } });
    const socialLinks = settings.socialLinks
      ? Object.fromEntries(Object.entries(settings.socialLinks).filter(([, v]) => v))
      : undefined;

    if (existing) {
      await prisma.portfolioSettings.update({
        where: { userId },
        data: {
          ...(settings.siteTitle && { siteTitle: settings.siteTitle }),
          ...(settings.tagline && { tagline: settings.tagline }),
          ...(settings.bio && { bio: settings.bio }),
          ...(settings.location && { location: settings.location }),
          ...(socialLinks && { socialLinks }),
        },
      });
    } else {
      await prisma.portfolioSettings.create({
        data: {
          userId,
          siteTitle: settings.siteTitle,
          tagline: settings.tagline,
          bio: settings.bio,
          location: settings.location,
          socialLinks: (socialLinks ?? {}) as Record<string, string>,
        },
      });
    }
    results.settings = 1;
  }

  // --- Experiences ---
  if (experiences?.length) {
    const existing = await prisma.experience.findMany({ where: { userId }, select: { displayOrder: true } });
    const baseOrder = existing.length;

    await prisma.experience.createMany({
      data: experiences.map((ex: Record<string, unknown>, i: number) => ({
        userId,
        company: ex.company as string,
        role: ex.role as string,
        description: (ex.description as string) || null,
        location: (ex.location as string) || null,
        startDate: new Date((ex.startDate as string) || "2020-01-01"),
        endDate: ex.endDate ? new Date(ex.endDate as string) : null,
        isCurrent: (ex.isCurrent as boolean) ?? false,
        techStack: (ex.techStack as string[]) ?? [],
        displayOrder: baseOrder + i,
      })),
    });
    results.experiences = experiences.length;
  }

  // --- Skills ---
  if (skills?.length) {
    const existing = await prisma.skill.findMany({ where: { userId }, select: { displayOrder: true } });
    const baseOrder = existing.length;

    await prisma.skill.createMany({
      data: skills.map((s: Record<string, unknown>, i: number) => ({
        userId,
        category: s.category as string,
        name: s.name as string,
        proficiency: (s.proficiency as number) || null,
        displayOrder: baseOrder + i,
      })),
    });
    results.skills = skills.length;
  }

  // --- Projects ---
  if (projects?.length) {
    const existing = await prisma.project.findMany({ where: { userId }, select: { slug: true, displayOrder: true } });
    const existingSlugs = new Set(existing.map((p) => p.slug));
    const baseOrder = existing.length;

    const projectData = projects.map((p: Record<string, unknown>, i: number) => {
      let slug = slugify(p.title as string);
      // Ensure unique slug
      let counter = 0;
      while (existingSlugs.has(slug)) {
        counter++;
        slug = `${slugify(p.title as string)}-${counter}`;
      }
      existingSlugs.add(slug);

      return {
        userId,
        title: p.title as string,
        slug,
        description: (p.description as string) || null,
        techStack: (p.techStack as string[]) ?? [],
        githubUrl: (p.githubUrl as string) || null,
        liveUrl: (p.liveUrl as string) || null,
        category: (p.category as string) || null,
        displayOrder: baseOrder + i,
      };
    });

    await prisma.project.createMany({ data: projectData });
    results.projects = projects.length;
  }

  // --- Education ---
  if (education?.length) {
    const existing = await prisma.education.findMany({ where: { userId }, select: { displayOrder: true } });
    const baseOrder = existing.length;

    await prisma.education.createMany({
      data: education.map((e: Record<string, unknown>, i: number) => ({
        userId,
        institution: e.institution as string,
        degree: (e.degree as string) || null,
        field: (e.field as string) || null,
        startYear: (e.startYear as number) || null,
        endYear: (e.endYear as number) || null,
        description: null,
        displayOrder: baseOrder + i,
      })),
    });
    results.education = education.length;
  }

  // --- Certifications ---
  if (certifications?.length) {
    const existing = await prisma.certification.findMany({ where: { userId }, select: { displayOrder: true } });
    const baseOrder = existing.length;

    await prisma.certification.createMany({
      data: certifications.map((c: Record<string, unknown>, i: number) => ({
        userId,
        name: c.name as string,
        issuer: (c.issuer as string) || null,
        issueDate: c.issueDate ? new Date(c.issueDate as string) : null,
        credentialUrl: (c.credentialUrl as string) || null,
        displayOrder: baseOrder + i,
      })),
    });
    results.certifications = certifications.length;
  }

  return NextResponse.json({ success: true, results });
}
