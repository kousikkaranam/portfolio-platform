
import type { PortfolioData } from "@/templates/types";
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

// Sections that are skipped if they have no data
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
  const accent = data.settings.accentColor || "#5eead4";

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-300" style={{ "--accent": accent } as React.CSSProperties}>
      <Navbar data={data} />

      {data.sections.sectionOrder.map((key) => {
        // Visibility check
        const visField = SECTION_VISIBILITY[key];
        if (visField && !data.sections[visField]) return null;

        // Data existence check
        const guard = DATA_GUARDS[key];
        if (guard && !guard(data)) return null;

        const Component = SECTION_COMPONENTS[key];
        if (!Component) return null;

        // Hero gets pt-0 (Navbar overlaps), all others get scroll padding
        const isHero = key === "hero";

        return (
          <div key={key} id={key} className={isHero ? "" : "scroll-mt-16"}>
            <Component data={data} />
          </div>
        );
      })}
    </div>
  );
}
