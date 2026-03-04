"use client";

import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";
import { Mail, Phone, Github, Linkedin, Twitter, Instagram, Youtube, Link } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  github: Github, linkedin: Linkedin, twitter: Twitter, instagram: Instagram, youtube: Youtube,
};

export default function ContactSection({ data }: { data: PortfolioData }) {
  const social = (data.settings.socialLinks ?? {}) as Record<string, string>;
  const accent = data.settings.accentColor;

  const title = social.contactTitle?.trim() || "Get In Touch";
  const message = social.contactMessage?.trim() || (
    data.settings.availableForHire
      ? "I'm currently open to new opportunities. Whether you have a question or just want to say hi, my inbox is always open."
      : "Have a question or want to collaborate? Feel free to reach out."
  );

  const phoneDisplay = social.phone
    ? `${social.phoneCode || ""}${social.phoneCode ? " " : ""}${social.phone}`.trim()
    : null;

  const standardLinks = ["github", "linkedin", "twitter", "instagram", "youtube"].filter((k) => social[k]);

  return (
    <section className="px-6 py-20 max-w-3xl mx-auto text-center">
      <SectionTitle title={title} accent={accent} center />

      <p className="mt-6 max-w-lg mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {social.email && (
          <a href={`mailto:${social.email}`}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: accent, color: "var(--accent-fg)" }}>
            <Mail size={15} />
            Say Hello
          </a>
        )}
        {data.settings.resumeUrl && (
          <a href={data.settings.resumeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium border transition-colors"
            style={{ borderColor: accent, color: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.background = `${accent}10`)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
            Resume
          </a>
        )}
      </div>

      {(standardLinks.length > 0 || phoneDisplay || (social.customLinkLabel && social.customLinkUrl)) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {standardLinks.map((key) => {
            const Icon = ICON_MAP[key];
            return (
              <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <Icon size={15} />
                <span className="hidden sm:inline capitalize">{key === "youtube" ? "YouTube" : key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </a>
            );
          })}

          {phoneDisplay && (
            <a href={`tel:${social.phoneCode ?? ""}${social.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
              <Phone size={15} />
              <span className="hidden sm:inline">{phoneDisplay}</span>
            </a>
          )}

          {social.customLinkLabel && social.customLinkUrl && (
            <a href={social.customLinkUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
              <Link size={15} />
              <span className="hidden sm:inline">{social.customLinkLabel}</span>
            </a>
          )}
        </div>
      )}

      <div className="mt-20 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Built with ♥ by {data.user.name}</p>
      </div>
    </section>
  );
}
