"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

type Exp = PortfolioData["experiences"][number];

interface CompanyGroup {
  company: string;
  location: string | null;
  logoUrl: string | null;
  isCurrent: boolean;
  earliest: string;
  latest: string | null;  // null = Present
  roles: Exp[];
}

function groupByCompany(experiences: Exp[]): CompanyGroup[] {
  const map = new Map<string, CompanyGroup>();
  for (const ex of experiences) {
    const existing = map.get(ex.company);
    if (!existing) {
      map.set(ex.company, {
        company: ex.company,
        location: ex.location,
        logoUrl: ex.companyLogoUrl,
        isCurrent: ex.isCurrent,
        earliest: ex.startDate,
        latest: ex.isCurrent ? null : ex.endDate,
        roles: [ex],
      });
    } else {
      existing.roles.push(ex);
      if (ex.isCurrent) { existing.isCurrent = true; existing.latest = null; }
      if (new Date(ex.startDate) < new Date(existing.earliest)) existing.earliest = ex.startDate;
      if (!ex.isCurrent && ex.endDate && existing.latest) {
        if (new Date(ex.endDate) > new Date(existing.latest)) existing.latest = ex.endDate;
      }
      if (!existing.location && ex.location) existing.location = ex.location;
      if (!existing.logoUrl && ex.companyLogoUrl) existing.logoUrl = ex.companyLogoUrl;
    }
  }
  // Sort groups: most recent first (by earliest start date of group, descending)
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.earliest).getTime() - new Date(a.earliest).getTime()
  );
}

function RoleContent({ ex, accent }: { ex: Exp; accent: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (ex.description?.length ?? 0) > 280;
  return (
    <>
      {ex.description && (
        <div className="mt-1.5">
          <div className="relative">
            <div
              className="prose prose-invert prose-sm max-w-none overflow-hidden transition-all duration-300"
              style={{
                maxHeight: !expanded && isLong ? "5.5rem" : "none",
                "--tw-prose-body": "var(--text-secondary)",
                "--tw-prose-bold": "var(--text)",
                "--tw-prose-bullets": "var(--text-muted)",
                "--tw-prose-counters": "var(--text-muted)",
                "--tw-prose-links": accent,
                "--tw-prose-headings": "var(--text)",
                "--tw-prose-code": "var(--text)",
              } as React.CSSProperties}
            >
              <ReactMarkdown>{ex.description}</ReactMarkdown>
            </div>
            {/* Fade-out gradient when collapsed */}
            {!expanded && isLong && (
              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: "linear-gradient(to top, var(--bg-card), transparent)" }} />
            )}
          </div>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs mt-1.5 transition-colors cursor-pointer"
              style={{ color: accent }}
            >
              {expanded ? "Show less ↑" : "Show more ↓"}
            </button>
          )}
        </div>
      )}
      {ex.techStack.length > 0 && (
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {ex.techStack.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: `${accent}15`, color: accent }}>{t}</span>
          ))}
        </div>
      )}
      {ex.githubUrl && (
        <a href={ex.githubUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs mt-2 transition-colors" style={{ color: "var(--text-muted)" }}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Work GitHub
        </a>
      )}
    </>
  );
}

/** Single role — no nested dot/line, role title shown inline in company header area */
function SingleRole({ ex, accent }: { ex: Exp; accent: string }) {
  return (
    <div>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{ex.role}</p>
      <RoleContent ex={ex} accent={accent} />
    </div>
  );
}

/** Multiple roles — shows nested dot + left border line */
function RoleItem({ ex, accent }: { ex: Exp; accent: string }) {
  return (
    <div className="relative pl-4 pb-6 last:pb-0 ml-3 border-l" style={{ borderColor: "var(--border)" }}>
      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2"
        style={{ background: "var(--bg)", borderColor: ex.isCurrent ? accent : "var(--border-light)" }} />
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{ex.role}</p>
        <span className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          {fmt(ex.startDate)} — {ex.isCurrent ? "Present" : ex.endDate ? fmt(ex.endDate) : ""}
        </span>
      </div>
      <RoleContent ex={ex} accent={accent} />
    </div>
  );
}

export default function ExperienceSection({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor;
  const groups = groupByCompany(data.experiences);

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <SectionTitle title="Experience" accent={accent} />
      <div className="mt-10 space-y-0">
        {groups.map((group, i) => (
          <div key={group.company} className="relative pl-8 pb-10 last:pb-0">
            {/* Main timeline line */}
            {i < groups.length - 1 && (
              <div className="absolute left-[11px] top-3 bottom-0 w-px" style={{ background: "var(--border)" }} />
            )}

            {/* Company dot */}
            <div
              className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 flex items-center justify-center"
              style={{ background: "var(--bg)", borderColor: group.isCurrent ? accent : "var(--border-light)" }}
            >
              {group.isCurrent && (
                <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
              )}
            </div>

            {/* Company header */}
            <div className="rounded-xl overflow-hidden border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
                {group.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group.logoUrl}
                    alt={group.company}
                    className="w-8 h-8 rounded object-contain bg-white/5 p-0.5 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{group.company}</p>
                  {group.location && (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{group.location}</p>
                  )}
                </div>
                <span className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {fmt(group.earliest)} — {group.latest ? fmt(group.latest) : "Present"}
                </span>
              </div>

              {/* Roles — flat if single, nested timeline if multiple */}
              <div className="px-5 pt-3 pb-3">
                {group.roles.length === 1 ? (
                  <SingleRole ex={group.roles[0]} accent={accent} />
                ) : (
                  <div className="space-y-0">
                    {group.roles
                      .slice()
                      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                      .map((ex) => (
                        <RoleItem key={ex.id} ex={ex} accent={accent} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
