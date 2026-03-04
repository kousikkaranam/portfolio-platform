
import type { PortfolioData } from "@/templates/types";
import HeroSection from "./sections/HeroSection";
import SkillsSection from "./sections/SkillsSection";
import ExperienceSection from "./sections/ExperienceSection";
import ProjectsSection from "./sections/ProjectsSection";
import EngineeringSection from "./sections/EngineeringSection";
import BlogSection from "./sections/BlogSection";
import EducationSection from "./sections/EducationSection";
import CertificationsSection from "./sections/CertificationsSection";
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

export default function DefaultTemplate({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor || "#5eead4";

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-300" style={{ "--accent": accent } as React.CSSProperties}>
      {data.sections.sectionOrder.map((key) => {
        // Check visibility
        const visField = SECTION_VISIBILITY[key];
        if (visField && !data.sections[visField]) return null;

        // Check data existence (skip empty sections)
        if (key === "skills" && data.skills.length === 0) return null;
        if (key === "experience" && data.experiences.length === 0) return null;
        if (key === "projects" && data.projects.length === 0) return null;
        if (key === "engineering" && data.engineering.length === 0) return null;
        if (key === "blog" && data.blogPosts.length === 0) return null;
        if (key === "education" && data.education.length === 0) return null;
        if (key === "certifications" && data.certifications.length === 0) return null;

        const Component = SECTION_COMPONENTS[key];
        if (!Component) return null;

        return <Component key={key} data={data} />;
      })}
    </div>
  );
}