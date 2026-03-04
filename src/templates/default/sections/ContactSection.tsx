
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function ContactSection({ data }: { data: PortfolioData }) {
  const social = data.settings.socialLinks;

  return (
    <section className="px-6 py-20 max-w-3xl mx-auto text-center">
      <SectionTitle title="Get In Touch" accent={data.settings.accentColor} center />
      <p className="text-gray-400 mt-6 max-w-lg mx-auto leading-relaxed">
        {data.settings.availableForHire
          ? "I'm currently open to new opportunities. Whether you have a question or just want to say hi, my inbox is always open."
          : "Have a question or want to collaborate? Feel free to reach out."}
      </p>
      <div className="flex items-center justify-center gap-4 mt-8">
        {social?.email && (
          <a href={`mailto:${social.email}`}
            className="px-6 py-3 rounded-lg text-sm font-medium text-[#0b0f19] transition-opacity hover:opacity-90"
            style={{ background: data.settings.accentColor }}>
            Say Hello
          </a>
        )}
        {social?.linkedin && (
          <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: data.settings.accentColor, color: data.settings.accentColor }}>
            LinkedIn
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-gray-800">
        <p className="text-xs text-gray-600">
          Built with ♥ by {data.user.name}
        </p>
      </div>
    </section>
  );
}
