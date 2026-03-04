"use client";

import type { PortfolioData } from "@/templates/types";
import Image from "next/image";

const SIZE_PX = { sm: 80, md: 120, lg: 160 } as const;

/** Convert Google Drive share/view URLs to direct-download URLs. Passes all other URLs through. */
function toDownloadUrl(url: string): string {
  // https://drive.google.com/file/d/FILE_ID/view?...  →  direct download
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;

  // https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;

  return url;
}
const SHAPE_CLASS = { circle: "rounded-full", rounded: "rounded-2xl", square: "rounded-md" } as const;

export default function HeroSection({ data }: { data: PortfolioData }) {
  const { user, settings } = data;
  const social = settings.socialLinks;
  const accentRaw = settings.accentColor;

  const imgSrc = settings.heroImageUrl || user.image;
  const shape: "circle" | "rounded" | "square" = (social?.heroImageShape as "circle" | "rounded" | "square") || "circle";
  const size: "sm" | "md" | "lg" = (social?.heroImageSize as "sm" | "md" | "lg") || "md";
  const effect: "none" | "glow" | "spin-ring" = (social?.heroImageEffect as "none" | "glow" | "spin-ring") || "none";
  const px = SIZE_PX[size];
  const radiusClass = SHAPE_CLASS[shape];

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--bg), var(--bg-card), var(--bg))" }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--accent)" }} />

      <div className="relative max-w-3xl mx-auto text-center">
        {imgSrc && (
          <div className="mb-8 flex justify-center">
            <div className="relative" style={{ width: px + 20, height: px + 20 }}>
              {effect === "spin-ring" && (
                <div
                  className="absolute inset-0"
                  style={{
                    borderRadius: shape === "circle" ? "9999px" : shape === "rounded" ? "1rem" : "0.375rem",
                    border: `2px dashed ${accentRaw}`,
                    animation: "spin 8s linear infinite",
                  }}
                />
              )}
              <div
                className="absolute inset-[10px]"
                style={{ boxShadow: effect === "glow" ? `0 0 28px 8px ${accentRaw}45` : undefined }}
              >
                <Image
                  src={imgSrc}
                  alt={user.name}
                  width={px}
                  height={px}
                  className={`w-full h-full object-cover ${radiusClass}`}
                  style={{ border: `2px solid ${accentRaw}30` }}
                />
              </div>
            </div>
          </div>
        )}

        <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          {settings.location && `${settings.location} · `}
          {settings.availableForHire ? "Available for hire" : "Software Engineer"}
        </p>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight" style={{ color: "var(--text)" }}>
          {user.name}
        </h1>

        {settings.tagline && (
          <p className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>{settings.tagline}</p>
        )}

        {settings.bio && (
          <p className="max-w-xl mx-auto leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>{settings.bio}</p>
        )}

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {social?.github && <SocialLink href={social.github} label="GitHub" accentRaw={accentRaw}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></SocialLink>}
          {social?.linkedin && <SocialLink href={social.linkedin} label="LinkedIn" accentRaw={accentRaw}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></SocialLink>}
          {social?.twitter && <SocialLink href={social.twitter} label="Twitter" accentRaw={accentRaw}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></SocialLink>}
          {social?.email && <SocialLink href={`mailto:${social.email}`} label="Email" accentRaw={accentRaw}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></SocialLink>}

          {settings.resumeUrl && (
            <>
              <a href={toDownloadUrl(settings.resumeUrl)} target="_blank" rel="noopener noreferrer" download
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)", color: "var(--accent-fg)" }}>
                Download Resume
              </a>
              <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-opacity hover:opacity-90"
                style={{ borderColor: `${accentRaw}60`, color: accentRaw }}>
                View Resume
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SocialLink({ href, label, accentRaw, children }: { href: string; label: string; accentRaw: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
      style={{ background: "color-mix(in srgb, var(--text) 5%, transparent)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = accentRaw; e.currentTarget.style.borderColor = `${accentRaw}50`; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </a>
  );
}
