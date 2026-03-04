
import type { PortfolioData } from "@/templates/types";
import { derivePalette } from "@/lib/colorUtils";
import Navbar from "./components/Navbar";
import HeroSection from "./sections/HeroSection";
import SkillsSection from "./sections/SkillsSection";
import ExperienceSection from "./sections/ExperienceSection";
import ProjectsSection from "./sections/ProjectsSection";
import EngineeringSection from "./sections/EngineeringSection";
import BlogSection from "./sections/BlogSection";
import EducationSection from "./sections/EducationSection";
import CertificationsSection from "./sections/CertificationsSection";
import GitHubSection from "./sections/GitHubSection";
import ContactSection from "./sections/ContactSection";
import CustomSectionRenderer from "./sections/CustomSectionRenderer";
import ChatWidget from "./components/ChatWidget";

const SECTION_COMPONENTS: Record<string, React.FC<{ data: PortfolioData }>> = {
  hero: HeroSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  engineering: EngineeringSection,
  blog: BlogSection,
  education: EducationSection,
  certifications: CertificationsSection,
  github: GitHubSection,
  contact: ContactSection,
};

const SECTION_VISIBILITY: Record<string, keyof PortfolioData["sections"]> = {
  skills: "showSkills",
  experience: "showExperience",
  projects: "showProjects",
  engineering: "showEngineering",
  blog: "showBlog",
  education: "showEducation",
  certifications: "showCertifications",
  github: "showGithub",
  contact: "showContact",
};

const DATA_GUARDS: Record<string, (data: PortfolioData) => boolean> = {
  skills: (d) => d.skills.length > 0,
  experience: (d) => d.experiences.length > 0,
  projects: (d) => d.projects.length > 0,
  engineering: (d) => d.engineering.length > 0,
  blog: (d) => d.blogPosts.length > 0,
  education: (d) => d.education.length > 0,
  certifications: (d) => d.certifications.length > 0,
  github: (d) => !!d.user.githubUsername,
};

export default function DefaultTemplate({ data }: { data: PortfolioData }) {
  const s = (data.settings.socialLinks ?? {}) as Record<string, string>;
  const darkAccent = data.settings.accentColor || "#5eead4";
  const lightAccent = s.lightAccent || darkAccent;
  const darkBg = s.darkBg || "#0a0a0a";
  const lightBg = s.lightBg || "#ffffff";

  const dark = derivePalette(darkBg, "dark");
  const light = derivePalette(lightBg, "light");

  return (
    <div
      id="portfolio-root"
      data-theme="dark"
      className="min-h-screen"
      style={{
        "--dark-bg": dark.bg,
        "--dark-bg-card": dark.bgCard,
        "--dark-border": dark.border,
        "--dark-border-light": dark.borderLight,
        "--dark-accent": darkAccent,
        "--light-bg": light.bg,
        "--light-bg-card": light.bgCard,
        "--light-border": light.border,
        "--light-border-light": light.borderLight,
        "--light-accent": lightAccent,
      } as React.CSSProperties}
    >
      <Navbar data={data} />

      {data.sections.sectionOrder.map((key) => {
        if (key.startsWith("custom_")) {
          const id = key.slice(7);
          const cs = data.customSections.find((s) => s.id === id);
          if (!cs || !cs.isVisible) return null;
          return (
            <div key={key} id={key} className="scroll-mt-16">
              <CustomSectionRenderer title={cs.title} content={cs.content} accentColor={darkAccent} />
            </div>
          );
        }

        const visField = SECTION_VISIBILITY[key];
        if (visField && !data.sections[visField]) return null;

        const guard = DATA_GUARDS[key];
        if (guard && !guard(data)) return null;

        const Component = SECTION_COMPONENTS[key];
        if (!Component) return null;

        return (
          <div key={key} id={key} className={key === "hero" ? "" : "scroll-mt-16"}>
            <Component data={data} />
          </div>
        );
      })}

      <ChatWidget
        username={data.user.slug}
        name={data.user.name}
        accentColor={darkAccent}
      />
    </div>
  );
}
