import { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";


export default function ExperienceSection({ data }: { data: PortfolioData }) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <SectionTitle title="Experience" accent={data.settings.accentColor} />
      <div className="mt-10 space-y-0">
        {data.experiences.map((ex, i) => (
          <div key={ex.id} className="relative pl-8 pb-10 last:pb-0">
            {/* Timeline line */}
            {i < data.experiences.length - 1 && (
              <div className="absolute left-[11px] top-3 bottom-0 w-px bg-gray-800" />
            )}
            {/* Dot */}
            <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 bg-[#0b0f19] flex items-center justify-center"
              style={{ borderColor: ex.isCurrent ? data.settings.accentColor : "#374151" }}>
              {ex.isCurrent && <div className="w-2 h-2 rounded-full" style={{ background: data.settings.accentColor }} />}
            </div>

            <div className="bg-[#121826] border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-white font-semibold">{ex.role}</h3>
                  <p className="text-gray-400 text-sm">{ex.company}{ex.location && ` · ${ex.location}`}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {fmt(ex.startDate)} — {ex.isCurrent ? "Present" : ex.endDate ? fmt(ex.endDate) : ""}
                </span>
              </div>
              {ex.description && <p className="text-sm text-gray-400 mt-3 leading-relaxed">{ex.description}</p>}
              {ex.techStack.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {ex.techStack.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: `${data.settings.accentColor}15`, color: data.settings.accentColor }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
