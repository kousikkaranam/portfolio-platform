
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function EducationSection({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor;
  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <SectionTitle title="Education" accent={accent} />
      <div className="mt-10 space-y-4">
        {data.education.map((ed) => (
          <div key={ed.id} className="rounded-xl p-5 flex items-start gap-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: `${accent}15`, color: accent }}>
              {ed.institution.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text)" }}>
                {ed.degree && ed.field ? `${ed.degree} in ${ed.field}` : ed.degree || ed.institution}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{ed.institution}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{ed.startYear || "?"} — {ed.endYear || "Present"}</p>
              {ed.description && <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ed.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
