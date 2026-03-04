import { Github, ExternalLink, Star } from "lucide-react";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  isFeatured: boolean;
}

interface Props {
  projects: Project[];
  accent: string;
}

export default function ProjectsSection({ projects, accent }: Props) {
  const featured = projects.filter((p) => p.isFeatured);
  const others = projects.filter((p) => !p.isFeatured);

  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Projects</h2>
        <p className="text-gray-400 mb-10">Things I&apos;ve built</p>

        {/* Featured projects */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {featured.map((project) => (
              <div
                key={project.id}
                className="bg-[#121826] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star size={16} style={{ color: accent }} fill={accent} />
                    <span className="text-xs uppercase tracking-wider text-gray-500">
                      Featured
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--accent)] transition-colors"
                  style={{ ["--accent" as string]: accent }}
                >
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>
                )}

                {project.category && (
                  <span
                    className="inline-block text-xs px-2.5 py-1 rounded-md mb-4"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    {project.category}
                  </span>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
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
        )}

        {/* Other projects */}
        {others.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((project) => (
              <div
                key={project.id}
                className="bg-[#121826] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">
                    {project.title}
                  </h3>
                  <div className="flex gap-2 ml-2">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                        <Github size={16} />
                      </a>
                    )}
                  </div>
                </div>
                {project.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span key={tech} className="text-xs px-2 py-0.5 rounded bg-[#0b0f19] text-gray-500">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}