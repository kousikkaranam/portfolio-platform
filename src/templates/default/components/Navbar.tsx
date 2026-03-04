"use client";

import { useState, useEffect } from "react";
import type { PortfolioData } from "@/templates/types";
import ThemeToggle from "./ThemeToggle";

const SECTION_LABELS: Record<string, string> = {
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  engineering: "Engineering",
  blog: "Blog",
  education: "Education",
  certifications: "Certs",
  github: "GitHub",
  contact: "Contact",
};

export default function Navbar({ data }: { data: PortfolioData }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const DATA_GUARDS: Record<string, (d: PortfolioData) => boolean> = {
    skills:         (d) => d.skills.length > 0,
    experience:     (d) => d.experiences.length > 0,
    projects:       (d) => d.projects.length > 0,
    engineering:    (d) => d.engineering.length > 0,
    blog:           (d) => d.blogPosts.length > 0,
    education:      (d) => d.education.length > 0,
    certifications: (d) => d.certifications.length > 0,
    github:         (d) => !!d.user.githubUsername,
  };

  const VIS_MAP: Record<string, keyof PortfolioData["sections"]> = {
    skills: "showSkills", experience: "showExperience", projects: "showProjects",
    engineering: "showEngineering", blog: "showBlog", education: "showEducation",
    certifications: "showCertifications", github: "showGithub", contact: "showContact",
  };

  const navLinks = data.sections.sectionOrder
    .filter((key) => {
      if (key === "hero") return false;
      if (key.startsWith("custom_")) {
        const id = key.slice(7);
        const section = (data as any).customSections?.find((s: any) => s.id === id);
        return section?.isVisible ?? false;
      }
      const visField = VIS_MAP[key];
      if (visField && !data.sections[visField]) return false;
      const guard = DATA_GUARDS[key];
      if (guard && !guard(data)) return false;
      return true;
    })
    .filter((key) => key.startsWith("custom_") || SECTION_LABELS[key]);

  const getLinkLabel = (key: string): string => {
    if (key.startsWith("custom_")) {
      const id = key.slice(7);
      return (data as any).customSections?.find((s: any) => s.id === id)?.title ?? "Section";
    }
    return SECTION_LABELS[key] ?? key;
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const accent = data.settings.accentColor;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-md border-b shadow-lg" : "bg-transparent"
      }`}
      style={scrolled ? {
        background: "color-mix(in srgb, var(--bg) 90%, transparent)",
        borderColor: "var(--border)",
      } : undefined}
    >
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Name / logo */}
        <button
          onClick={() => scrollTo("hero")}
          className="font-semibold text-sm hover:opacity-80 transition-opacity"
          style={{ color: "var(--text)" }}
        >
          {data.settings.siteTitle || data.user.name}
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((key) => (
            <button
              key={key}
              onClick={() => scrollTo(key)}
              className="px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-[var(--border)]/50"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              {getLinkLabel(key)}
            </button>
          ))}
          <ThemeToggle accent={accent} />
          {data.settings.resumeUrl && (
            <a
              href={data.settings.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: accent, color: "var(--accent-fg)" }}
            >
              Resume
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle accent={accent} />
          <button
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} style={{ background: "var(--text-secondary)" }} />
            <span className={`block w-5 h-0.5 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} style={{ background: "var(--text-secondary)" }} />
            <span className={`block w-5 h-0.5 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} style={{ background: "var(--text-secondary)" }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden backdrop-blur-md border-t px-6 py-4 flex flex-col gap-1"
          style={{ background: "color-mix(in srgb, var(--bg) 95%, transparent)", borderColor: "var(--border)" }}
        >
          {navLinks.map((key) => (
            <button
              key={key}
              onClick={() => scrollTo(key)}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "color-mix(in srgb, var(--border) 50%, transparent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = ""; }}
            >
              {getLinkLabel(key)}
            </button>
          ))}
          {data.settings.resumeUrl && (
            <a
              href={data.settings.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 px-4 py-2.5 rounded-lg text-sm font-medium text-center transition-opacity hover:opacity-90"
              style={{ background: accent, color: "var(--accent-fg)" }}
            >
              Resume
            </a>
          )}
        </div>
      )}
    </header>
  );
}
