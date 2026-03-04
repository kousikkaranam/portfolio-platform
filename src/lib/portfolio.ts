
import { prisma } from "@/lib/prisma";
import type { PortfolioData } from "@/templates/types";

const DEFAULT_ORDER = ["hero","skills","experience","projects","engineering","blog","education","certifications","github","contact"];

export async function fetchPortfolioData(slug: string): Promise<PortfolioData | null> {
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      portfolioSettings: true,
      skills: { orderBy: { displayOrder: "asc" } },
      experiences: { orderBy: { displayOrder: "asc" } },
      projects: {
        where: { status: "published" },
        orderBy: { displayOrder: "asc" },
      },
      engineeringHighlights: {
        where: { status: "published" },
        orderBy: { displayOrder: "asc" },
      },
      blogPosts: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
      },
      education: { orderBy: { displayOrder: "asc" } },
      certifications: { orderBy: { displayOrder: "asc" } },
      sectionVisibility: true,
    },
  });

  if (!user) return null;

  const s = user.portfolioSettings;
  const sv = user.sectionVisibility;

  return {
    user: {
      name: user.name || "Developer",
      image: user.image,
      slug: user.slug || "",
      githubUsername: user.githubUsername,
    },
    settings: {
      siteTitle: s?.siteTitle || null,
      tagline: s?.tagline || null,
      bio: s?.bio || null,
      heroImageUrl: s?.heroImageUrl || null,
      resumeUrl: s?.resumeUrl || null,
      location: s?.location || null,
      availableForHire: s?.availableForHire || false,
      socialLinks: (s?.socialLinks as any) || null,
      theme: s?.theme || "dark",
      accentColor: s?.accentColor || "#5eead4",
      metaTitle: s?.metaTitle || null,
      metaDescription: s?.metaDescription || null,
    },
    skills: user.skills.map((sk) => ({
      id: sk.id,
      category: sk.category,
      name: sk.name,
      iconUrl: sk.iconUrl,
      proficiency: sk.proficiency,
      displayOrder: sk.displayOrder,
    })),
    experiences: user.experiences.map((ex) => ({
      id: ex.id,
      company: ex.company,
      role: ex.role,
      description: ex.description,
      companyLogoUrl: ex.companyLogoUrl,
      location: ex.location,
      startDate: ex.startDate.toISOString(),
      endDate: ex.endDate?.toISOString() || null,
      isCurrent: ex.isCurrent,
      techStack: ex.techStack,
      githubUrl: ex.githubUrl || null,
      displayOrder: ex.displayOrder,
    })),
    projects: user.projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      longDescription: p.longDescription,
      techStack: p.techStack,
      githubUrl: p.githubUrl,
      liveUrl: p.liveUrl,
      thumbnailUrl: p.thumbnailUrl,
      category: p.category,
      isFeatured: p.isFeatured,
      status: p.status,
    })),
    engineering: user.engineeringHighlights.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      summary: e.summary,
      content: e.content,
      techStack: e.techStack,
      diagramUrl: e.diagramUrl,
      impact: e.impact,
      isFeatured: e.isFeatured,
      status: e.status,
    })),
    blogPosts: user.blogPosts.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      coverImageUrl: b.coverImageUrl,
      tags: b.tags,
      readTimeMin: b.readTimeMin,
      status: b.status,
      publishedAt: b.publishedAt?.toISOString() || null,
    })),
    education: user.education.map((ed) => ({
      id: ed.id,
      institution: ed.institution,
      degree: ed.degree,
      field: ed.field,
      startYear: ed.startYear,
      endYear: ed.endYear,
      description: ed.description,
    })),
    certifications: user.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate?.toISOString() || null,
      credentialUrl: c.credentialUrl,
    })),
    sections: {
      showSkills: sv?.showSkills ?? true,
      showExperience: sv?.showExperience ?? true,
      showProjects: sv?.showProjects ?? true,
      showEngineering: sv?.showEngineering ?? true,
      showBlog: sv?.showBlog ?? true,
      showEducation: sv?.showEducation ?? true,
      showCertifications: sv?.showCertifications ?? true,
      showGithub: sv?.showGithub ?? true,
      showContact: sv?.showContact ?? true,
      sectionOrder: (sv?.sectionOrder as string[]) || DEFAULT_ORDER,
    },
  };
}