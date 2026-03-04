"use client";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  fork: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Ruby: "#701516",
  Kotlin: "#a97bff",
  Swift: "#fa7343",
  Dart: "#00b4ab",
};

function RepoCards({ repos, accent }: { repos: GitHubRepo[]; accent: string }) {
  if (repos.length === 0) return null;
  return (
    <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.map((repo) => {
        const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] ?? "#6b7280") : null;
        return (
          <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer"
            className="group rounded-xl p-4 flex flex-col gap-2.5 border transition-colors"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{repo.name}</span>
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-xs leading-relaxed line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>
              {repo.description || "No description"}
            </p>
            {repo.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {repo.topics.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${accent}15`, color: accent }}>{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              {repo.language && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColor ?? "#6b7280" }} />
                  {repo.language}
                </span>
              )}
              {repo.stargazers_count > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {repo.stargazers_count}
                </span>
              )}
              {repo.forks_count > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h.01M8 7a2 2 0 100-4 2 2 0 000 4zm0 0v10m0 0a2 2 0 100 4 2 2 0 000-4zm8-10h.01M16 7a2 2 0 100-4 2 2 0 000 4zm0 0v2a4 4 0 01-4 4h0a4 4 0 01-4-4V7" />
                  </svg>
                  {repo.forks_count}
                </span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}

export function InternalBlock({ label, profileUrl }: { label: string; profileUrl: string; accent: string }) {
  const host = (() => { try { return new URL(profileUrl).hostname; } catch { return profileUrl; } })();
  return (
    <div className="rounded-xl p-6 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{host}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded" style={{ color: "var(--text-muted)", background: "var(--border)" }}>Internal</span>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors border"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View profile
          </a>
        </div>
      </div>
      <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>Contribution data is not publicly available for internal repositories.</p>
    </div>
  );
}

export function ContributionBlock({
  username,
  label,
  profileUrl,
  accent,
  repos,
}: {
  username: string;
  label: string;
  profileUrl: string;
  accent: string;
  repos: GitHubRepo[];
}) {
  return (
    <div className="rounded-xl p-6 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
            style={{ color: accent }}>
            @{username}
          </a>
        </div>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors border"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          View profile
        </a>
      </div>

      <div className="overflow-x-auto">
        <img
          src={`https://ghchart.rshah.org/${username}`}
          alt={`${username}'s contribution graph`}
          className="mx-auto max-w-full rounded"
          style={{ filter: "invert(0.85) hue-rotate(130deg)" }}
        />
      </div>

      <RepoCards repos={repos} accent={accent} />
    </div>
  );
}
