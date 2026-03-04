"use client";

import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function EngineeringSection({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor;
  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="Engineering Highlights" accent={accent} />
      <div className="grid md:grid-cols-2 gap-4 mt-10">
        {data.engineering.map((e) => (
          <div key={e.id} className="rounded-xl p-5 border transition-colors" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            onMouseEnter={(ev) => (ev.currentTarget.style.borderColor = "var(--border-light)")}
            onMouseLeave={(ev) => (ev.currentTarget.style.borderColor = "var(--border)")}>
            {e.isFeatured && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-3 inline-block" style={{ background: `${accent}15`, color: accent }}>Featured</span>
            )}
            <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>{e.title}</h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>{e.summary}</p>
            {e.impact && <p className="text-sm font-medium mb-3" style={{ color: accent }}>↑ {e.impact}</p>}
            <div className="flex gap-1.5 flex-wrap">
              {e.techStack.map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--text-secondary)" }}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
