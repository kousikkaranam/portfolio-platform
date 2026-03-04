
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function EngineeringSection({ data }: { data: PortfolioData }) {
  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="Engineering Highlights" accent={data.settings.accentColor} />
      <div className="grid md:grid-cols-2 gap-4 mt-10">
        {data.engineering.map((e) => (
          <div key={e.id} className="bg-[#121826] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            {e.isFeatured && <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-3 inline-block" style={{ background: `${data.settings.accentColor}15`, color: data.settings.accentColor }}>Featured</span>}
            <h3 className="text-white font-semibold mb-2">{e.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">{e.summary}</p>
            {e.impact && (
              <p className="text-sm font-medium mb-3" style={{ color: data.settings.accentColor }}>↑ {e.impact}</p>
            )}
            <div className="flex gap-1.5 flex-wrap">
              {e.techStack.map((t) => <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
