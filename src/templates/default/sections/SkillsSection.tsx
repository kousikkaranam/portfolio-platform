
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function SkillsSection({ data }: { data: PortfolioData }) {
  const categories = data.skills.reduce<Record<string, typeof data.skills>>((acc, skill) => {
    (acc[skill.category] = acc[skill.category] || []).push(skill);
    return acc;
  }, {});

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="Skills" accent={data.settings.accentColor} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {Object.entries(categories).map(([cat, skills]) => (
          <div key={cat} className="bg-[#121826] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: data.settings.accentColor }}>{cat}</h3>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{s.name}</span>
                    {s.proficiency && <span className="text-gray-500">{s.proficiency}%</span>}
                  </div>
                  {s.proficiency && (
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.proficiency}%`, background: data.settings.accentColor }} />
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