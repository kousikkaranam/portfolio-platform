"use client";

import { useState, useEffect } from "react";
import type { PortfolioData } from "@/templates/types";

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

  // Build nav links from visible sections (skip hero)
  const navLinks = data.sections.sectionOrder
    .filter((key) => {
      if (key === "hero") return false;
      const visMap: Record<string, keyof PortfolioData["sections"]> = {
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
      const field = visMap[key];
      return field ? data.sections[field] : false;
    })
    .filter((key) => SECTION_LABELS[key]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const accent = data.settings.accentColor;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0b0f19]/90 backdrop-blur-md border-b border-gray-800/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Name / logo */}
        <button
          onClick={() => scrollTo("hero")}
          className="text-white font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          {data.settings.siteTitle || data.user.name}
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((key) => (
            <button
              key={key}
              onClick={() => scrollTo(key)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
          {data.settings.resumeUrl && (
            <a
              href={data.settings.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-4 py-1.5 rounded-lg text-sm font-medium text-[#0b0f19] transition-opacity hover:opacity-90"
              style={{ background: accent }}
            >
              Resume
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-400 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-400 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-400 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0b0f19]/95 backdrop-blur-md border-t border-gray-800/50 px-6 py-4 flex flex-col gap-1">
          {navLinks.map((key) => (
            <button
              key={key}
              onClick={() => scrollTo(key)}
              className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
          {data.settings.resumeUrl && (
            <a
              href={data.settings.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 px-4 py-2.5 rounded-lg text-sm font-medium text-center text-[#0b0f19] transition-opacity hover:opacity-90"
              style={{ background: accent }}
            >
              Resume
            </a>
          )}
        </div>
      )}
    </header>
  );
}
