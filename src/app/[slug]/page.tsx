import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/public/Hero";
import SkillsGrid from "@/components/public/SkillsGrid";
import ExperienceTimeline from "@/components/public/ExperienceTimeline";
import ProjectsSection from "@/components/public/ProjectsSection";
import EngineeringSection from "@/components/public/EngineeringSection";
import BlogSection from "@/components/public/BlogSection";
import ContactSection from "@/components/public/ContactSection";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPortfolioData(slug: string) {
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      portfolioSettings: true,
      sectionVisibility: true,
      skills: { orderBy: [{ category: "asc" }, { displayOrder: "asc" }] },
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
    },
  });

  return user;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const user = await getPortfolioData(slug);
  if (!user) return { title: "Not Found" };

  const s = user.portfolioSettings;
  return {
    title: s?.metaTitle || s?.siteTitle || user.name,
    description: s?.metaDescription || s?.tagline || "",
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params;
  const user = await getPortfolioData(slug);

  if (!user) notFound();

  const settings = user.portfolioSettings;
  const visibility = user.sectionVisibility;
  const accent = settings?.accentColor || "#5eead4";

  // Section order
  const defaultOrder = [
    "hero", "skills", "experience", "projects",
    "engineering", "blog", "contact",
  ];
  const sectionOrder = (visibility?.sectionOrder as string[]) || defaultOrder;

  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <Hero
        name={settings?.siteTitle || user.name || ""}
        tagline={settings?.tagline || ""}
        bio={settings?.bio || ""}
        avatarUrl={user.image || ""}
        location={settings?.location || ""}
        availableForHire={settings?.availableForHire || false}
        socialLinks={(settings?.socialLinks as Record<string, string>) || {}}
        accent={accent}
      />
    ),
    skills: visibility?.showSkills !== false && user.skills.length > 0 ? (
      <SkillsGrid skills={user.skills} accent={accent} />
    ) : null,
    experience: visibility?.showExperience !== false && user.experiences.length > 0 ? (
      <ExperienceTimeline experiences={user.experiences} accent={accent} />
    ) : null,
    projects: visibility?.showProjects !== false && user.projects.length > 0 ? (
      <ProjectsSection projects={user.projects} accent={accent} />
    ) : null,
    engineering: visibility?.showEngineering !== false && user.engineeringHighlights.length > 0 ? (
      <EngineeringSection highlights={user.engineeringHighlights} accent={accent} />
    ) : null,
    blog: visibility?.showBlog !== false && user.blogPosts.length > 0 ? (
      <BlogSection posts={user.blogPosts} slug={slug} accent={accent} />
    ) : null,
    contact: visibility?.showContact !== false ? (
      <ContactSection
        socialLinks={(settings?.socialLinks as Record<string, string>) || {}}
        accent={accent}
      />
    ) : null,
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      <Navbar
        name={settings?.siteTitle || user.name || ""}
        slug={slug}
        accent={accent}
      />
      <main>
        {sectionOrder.map((key) => (
          <div key={key}>{sectionMap[key]}</div>
        ))}
      </main>
      <Footer name={settings?.siteTitle || user.name || ""} accent={accent} />
    </div>
  );
}