interface Skill {
  id: string;
  category: string;
  name: string;
  proficiency: number | null;
}

interface Props {
  skills: Skill[];
  accent: string;
}

export default function SkillsGrid({ skills, accent }: Props) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] = acc[skill.category] || []).push(skill);
    return acc;
  }, {});

  return (
    <section id="skills" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Skills</h2>
        <p className="text-gray-400 mb-10">Technologies I work with</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="bg-[#121826] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
            >
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: accent }}
              >
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill.id}
                    className="bg-[#0b0f19] border border-gray-700/50 text-gray-300 text-sm px-3 py-1.5 rounded-lg"
                  >
                    {skill.name}
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