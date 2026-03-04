
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function CertificationsSection({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor;
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <SectionTitle title="Certifications" accent={accent} />
      <div className="grid md:grid-cols-2 gap-4 mt-10">
        {data.certifications.map((c) => (
          <div key={c.id} className="rounded-xl p-5 flex items-start gap-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15` }}>
              <svg className="w-5 h-5" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold" style={{ color: "var(--text)" }}>{c.name}</h3>
              {c.issuer && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.issuer}</p>}
              {c.issueDate && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Issued {fmt(c.issueDate)}</p>}
              {c.credentialUrl && (
                <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs mt-2 inline-block hover:opacity-80" style={{ color: accent }}>
                  View Credential ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
