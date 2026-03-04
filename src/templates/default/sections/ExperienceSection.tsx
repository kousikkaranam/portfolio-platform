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
              {ex.githubUrl && (
                <a href={ex.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white mt-3 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Work GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
