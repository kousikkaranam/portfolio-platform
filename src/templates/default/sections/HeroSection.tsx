
import type { PortfolioData } from "@/templates/types";
import Image from "next/image";

export default function HeroSection({ data }: { data: PortfolioData }) {
  const { user, settings } = data;
  const social = settings.socialLinks;

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19] via-[#0f1623] to-[#0b0f19]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: settings.accentColor }} />

      <div className="relative max-w-3xl mx-auto text-center">
        {user.image && (
          <div className="mb-8 inline-block">
            <Image src={user.image} alt={user.name} width={120} height={120}
              className="rounded-full border-2 mx-auto" style={{ borderColor: settings.accentColor }} />
          </div>
        )}

        <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: settings.accentColor }}>
          {settings.location && `${settings.location} · `}
          {settings.availableForHire ? "Available for hire" : "Software Engineer"}
        </p>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
          {user.name}
        </h1>

        {settings.tagline && (
          <p className="text-xl md:text-2xl text-gray-400 mb-6 max-w-2xl mx-auto">{settings.tagline}</p>
        )}

        {settings.bio && (
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">{settings.bio}</p>
        )}

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {social?.github && (
            <SocialLink href={social.github} label="GitHub">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </SocialLink>
          )}
          {social?.linkedin && (
            <SocialLink href={social.linkedin} label="LinkedIn">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </SocialLink>
          )}
          {social?.twitter && (
            <SocialLink href={social.twitter} label="Twitter">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </SocialLink>
          )}
          {social?.email && (
            <SocialLink href={`mailto:${social.email}`} label="Email">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </SocialLink>
          )}

          {settings.resumeUrl && (
            <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#0b0f19] transition-opacity hover:opacity-90"
              style={{ background: settings.accentColor }}>
              Download Resume
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="w-10 h-10 rounded-lg bg-white/5 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </a>
  );
}