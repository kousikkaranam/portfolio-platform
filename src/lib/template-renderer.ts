import Mustache from "mustache";
import type { PortfolioData } from "@/templates/types";

function fmtDate(iso: string | null): string {
  if (!iso) return "Present";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Build Mustache view context from PortfolioData */
export function buildTemplateContext(data: PortfolioData): Record<string, unknown> {
  const sl = (data.settings.socialLinks ?? {}) as Record<string, string>;

  return {
    // Profile
    name:        data.user.name,
    avatar:      data.user.image ?? "",
    slug:        data.user.slug,
    tagline:     data.settings.tagline ?? "",
    bio:         data.settings.bio ?? "",
    location:    data.settings.location ?? "",
    accentColor: data.settings.accentColor,
    resumeUrl:   data.settings.resumeUrl ?? "",
    available:   data.settings.availableForHire,

    // Social
    email:           sl.email           ?? "",
    phone:           sl.phone           ? `${sl.phoneCode ?? ""} ${sl.phone}`.trim() : "",
    github:          sl.github          ?? "",
    linkedin:        sl.linkedin        ?? "",
    twitter:         sl.twitter         ?? "",
    instagram:       sl.instagram       ?? "",
    youtube:         sl.youtube         ?? "",
    customLinkLabel: sl.customLinkLabel ?? "",
    customLinkUrl:   sl.customLinkUrl   ?? "",
    contactTitle:    sl.contactTitle    ?? "Get In Touch",
    contactMessage:  sl.contactMessage  ?? "",

    // Experience
    experiences: data.experiences.map((e) => ({
      company:      e.company,
      role:         e.role,
      description:  e.description ?? "",
      location:     e.location ?? "",
      startDate:    fmtDate(e.startDate),
      endDate:      e.isCurrent ? "Present" : fmtDate(e.endDate),
      isCurrent:    e.isCurrent,
      techStack:    e.techStack.map((t) => ({ name: t })),
      techStackStr: e.techStack.join(", "),
      githubUrl:    e.githubUrl ?? "",
    })),
    hasExperiences: data.experiences.length > 0,

    // Skills
    skills: data.skills.map((s) => ({
      name:        s.name,
      category:    s.category,
      proficiency: s.proficiency ?? 80,
    })),
    hasSkills: data.skills.length > 0,

    // Projects
    projects: data.projects.map((p) => ({
      title:        p.title,
      description:  p.description ?? "",
      techStack:    p.techStack.map((t) => ({ name: t })),
      techStackStr: p.techStack.join(", "),
      githubUrl:    p.githubUrl ?? "",
      liveUrl:      p.liveUrl ?? "",
      thumbnail:    p.thumbnailUrl ?? "",
      isFeatured:   p.isFeatured,
      category:     p.category ?? "",
    })),
    hasProjects: data.projects.length > 0,
    featuredProjects: data.projects
      .filter((p) => p.isFeatured)
      .map((p) => ({
        title:        p.title,
        description:  p.description ?? "",
        techStackStr: p.techStack.join(", "),
        githubUrl:    p.githubUrl ?? "",
        liveUrl:      p.liveUrl ?? "",
        thumbnail:    p.thumbnailUrl ?? "",
      })),

    // Education
    education: data.education.map((e) => ({
      institution: e.institution,
      degree:      e.degree ?? "",
      field:       e.field ?? "",
      degreeField: [e.degree, e.field].filter(Boolean).join(", "),
      startYear:   e.startYear ? String(e.startYear) : "",
      endYear:     e.endYear   ? String(e.endYear)   : "Present",
      description: e.description ?? "",
    })),
    hasEducation: data.education.length > 0,

    // Certifications
    certifications: data.certifications.map((c) => ({
      name:          c.name,
      issuer:        c.issuer ?? "",
      issueDate:     fmtDate(c.issueDate),
      credentialUrl: c.credentialUrl ?? "",
    })),
    hasCertifications: data.certifications.length > 0,

    // Blog
    blogPosts: data.blogPosts.map((b) => ({
      title:       b.title,
      excerpt:     b.excerpt ?? "",
      slug:        b.slug,
      url:         `/${data.user.slug}/blog/${b.slug}`,
      publishedAt: fmtDate(b.publishedAt),
      readTime:    b.readTimeMin ? `${b.readTimeMin} min read` : "",
      tags:        b.tags.map((t) => ({ name: t })),
      tagsStr:     b.tags.join(", "),
      coverImage:  b.coverImageUrl ?? "",
    })),
    hasBlogPosts: data.blogPosts.length > 0,

    // Section flags
    showSkills:         data.sections.showSkills,
    showExperience:     data.sections.showExperience,
    showProjects:       data.sections.showProjects,
    showBlog:           data.sections.showBlog,
    showEducation:      data.sections.showEducation,
    showCertifications: data.sections.showCertifications,
    showContact:        data.sections.showContact,
  };
}

/** Render a Mustache HTML template with real portfolio data */
export function renderTemplate(html: string, data: PortfolioData): string {
  return Mustache.render(html, buildTemplateContext(data));
}
