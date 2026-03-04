interface Experience {
  id: string;
  company: string;
  role: string;
  description: string | null;
  location: string | null;
  startDate: string | Date;
  endDate: string | Date | null;
  isCurrent: boolean;
  techStack: string[];
}

interface Props {
  experiences: Experience[];
  accent: string;
}

function formatDate(d: string | Date | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ExperienceTimeline({ experiences, accent }: Props) {
  return (
    <section id="experience" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Experience</h2>
        <p className="text-gray-400 mb-10">Where I&apos;ve worked</p>

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[11px] top-2 bottom-2 w-px"
            style={{ backgroundColor: `${accent}30` }}
          />

          <div className="space-y-10">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className="absolute left-0 top-2 w-[23px] h-[23px] rounded-full border-[3px] bg-[#0b0f19]"
                  style={{ borderColor: accent }}
                />

                <div className="bg-[#121826] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {exp.role}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(exp.startDate)} —{" "}
                      {exp.isCurrent ? (
                        <span style={{ color: accent }}>Present</span>
                      ) : (
                        formatDate(exp.endDate)
                      )}
                    </span>
                  </div>

                  <p className="text-sm mb-3" style={{ color: accent }}>
                    {exp.company}
                    {exp.location && (
                      <span className="text-gray-500"> · {exp.location}</span>
                    )}
                  </p>

                  {exp.description && (
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {exp.description}
                    </p>
                  )}

                  {exp.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2.5 py-1 rounded-md bg-[#0b0f19] border border-gray-700/50 text-gray-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}