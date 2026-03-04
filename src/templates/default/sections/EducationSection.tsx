
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function EducationSection({ data }: { data: PortfolioData }) {
  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <SectionTitle title="Education" accent={data.settings.accentColor} />
      <div className="mt-10 space-y-4">
        {data.education.map((ed) => (
          <div key={ed.id} className="bg-[#121826] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: `${data.settings.accentColor}15`, color: data.settings.accentColor }}>
              {ed.institution.charAt(0)}
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {ed.degree && ed.field ? `${ed.degree} in ${ed.field}` : ed.degree || ed.institution}
              </h3>
              <p className="text-gray-400 text-sm">{ed.institution}</p>
              <p className="text-xs text-gray-500 mt-1">{ed.startYear || "?"} — {ed.endYear || "Present"}</p>
              {ed.description && <p className="text-sm text-gray-400 mt-2 leading-relaxed">{ed.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}