
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function SkillsSection({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor;
  const categories = data.skills.reduce<Record<string, typeof data.skills>>((acc, skill) => {
    (acc[skill.category] = acc[skill.category] || []).push(skill);
    return acc;
  }, {});

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="Skills" accent={accent} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {Object.entries(categories).map(([cat, skills]) => (
          <div key={cat} className="rounded-xl p-5 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: accent }}>{cat}</h3>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                    {s.proficiency && <span style={{ color: "var(--text-muted)" }}>{s.proficiency}%</span>}
                  </div>
                  {s.proficiency && (
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.proficiency}%`, background: accent }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
