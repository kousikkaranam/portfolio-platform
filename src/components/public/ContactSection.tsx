import { Github, Linkedin, Twitter, Mail, ArrowUpRight } from "lucide-react";

interface Props {
  socialLinks: Record<string, string>;
  accent: string;
}

const socialConfig: Record<string, { icon: React.ElementType; label: string }> = {
  github: { icon: Github, label: "GitHub" },
  linkedin: { icon: Linkedin, label: "LinkedIn" },
  twitter: { icon: Twitter, label: "Twitter" },
  email: { icon: Mail, label: "Email" },
};

export default function ContactSection({ socialLinks, accent }: Props) {
  const links = Object.entries(socialLinks).filter(([, url]) => url);

  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Have a question or want to work together? Feel free to reach out.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {links.map(([key, url]) => {
            const config = socialConfig[key];
            if (!config) return null;
            const Icon = config.icon;
            const href = key === "email" ? `mailto:${url}` : url;

            return (
              <a
                key={key}
                href={href}
                target={key === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#121826] border border-gray-800 rounded-xl px-6 py-4 hover:border-gray-700 transition-colors group"
              >
                <Icon size={20} className="text-gray-400" />
                <span className="text-sm text-gray-300">{config.label}</span>
                <ArrowUpRight
                  size={16}
                  className="text-gray-600 group-hover:text-white transition-colors"
                  style={{ ["--hover" as string]: accent }}
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}