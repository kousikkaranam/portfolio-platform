import { Zap } from "lucide-react";

interface Highlight {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  techStack: string[];
  impact: string | null;
  isFeatured: boolean;
}

interface Props {
  highlights: Highlight[];
  accent: string;
}

export default function EngineeringSection({ highlights, accent }: Props) {
  return (
    <section id="engineering" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">
          Engineering Work
        </h2>
        <p className="text-gray-400 mb-10">
          Systems and architectures I&apos;ve designed
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((item) => (
            <div
              key={item.id}
              className="bg-[#121826] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>

              {item.summary && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {item.summary}
                </p>
              )}

              {item.impact && (
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} style={{ color: accent }} />
                  <span className="text-sm" style={{ color: accent }}>
                    {item.impact}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {item.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#0b0f19] border border-gray-700/50 text-gray-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}