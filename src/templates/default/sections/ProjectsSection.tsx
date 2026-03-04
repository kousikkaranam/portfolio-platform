
import type { PortfolioData } from "@/templates/types";
import Image from "next/image";
import SectionTitle from "@/templates/default/components/SectionTitle";
export default function ProjectsSection({ data }: { data: PortfolioData }) {
  const featured = data.projects.filter((p) => p.isFeatured);
  const rest = data.projects.filter((p) => !p.isFeatured);

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="Projects" accent={data.settings.accentColor} />

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mt-10 space-y-6">
          {featured.map((p) => (
            <div key={p.id} className="bg-[#121826] border border-gray-800 rounded-xl overflow-hidden md:flex">
              {p.thumbnailUrl && (
                <div className="md:w-2/5 relative h-48 md:h-auto">
                  <Image src={p.thumbnailUrl} alt={p.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${data.settings.accentColor}15`, color: data.settings.accentColor }}>Featured</span>
                  {p.category && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{p.category}</span>}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.description}</p>
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {p.techStack.map((t) => <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{t}</span>)}
                </div>
                <div className="flex gap-3">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:opacity-80" style={{ color: data.settings.accentColor }}>Live Demo ↗</a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">Source Code ↗</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {rest.map((p) => (
            <div key={p.id} className="bg-[#121826] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                {p.category && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{p.category}</span>}
              </div>
              <h3 className="text-white font-semibold mb-1">{p.title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{p.description}</p>
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {p.techStack.slice(0, 4).map((t) => <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{t}</span>)}
                {p.techStack.length > 4 && <span className="text-xs text-gray-500">+{p.techStack.length - 4}</span>}
              </div>
              <div className="flex gap-3">
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-80" style={{ color: data.settings.accentColor }}>Live ↗</a>}
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">Code ↗</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}