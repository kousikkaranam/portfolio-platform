
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";
import { ContributionBlock, InternalBlock } from "./GitHubBlocks";

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

async function fetchTopRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const headers: HeadersInit = { Accept: "application/vnd.github.v3+json" };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20&type=owner`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const repos: GitHubRepo[] = await res.json();
    return repos
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);
  } catch {
    return [];
  }
}

function extractGitHubUsername(input: string): string | null {
  if (!input) return null;
  const match = input.match(/github\.com\/([^/?#]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-]+$/.test(input.trim())) return input.trim();
  return null;
}

// Returns true only if the URL is a public github.com profile
function isPublicGitHub(url: string): boolean {
  return /^https?:\/\/(www\.)?github\.com\/[^/?#]+\/?$/.test(url.trim());
}

export default async function GitHubSection({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor;

  // Personal GitHub from social links or OAuth username
  const rawPersonal = data.settings.socialLinks?.github || data.user.githubUsername || "";
  const personalUsername = extractGitHubUsername(rawPersonal);

  // Work accounts from experiences — split into public (github.com) and internal
  const rawWorkAccounts = data.experiences
    .filter((ex) => !!ex.githubUrl)
    .map((ex) => ({
      company: ex.company,
      profileUrl: ex.githubUrl!,
      isPublic: isPublicGitHub(ex.githubUrl!),
      username: extractGitHubUsername(ex.githubUrl!),
    }))
    .filter((w, i, arr) => arr.findIndex((x) => x.profileUrl === w.profileUrl) === i); // dedupe by URL

  const publicWorkAccounts = rawWorkAccounts
    .filter((w): w is typeof w & { username: string } => w.isPublic && !!w.username);

  const internalWorkAccounts = rawWorkAccounts.filter((w) => !w.isPublic);

  // Nothing to show at all
  if (!personalUsername && rawWorkAccounts.length === 0) return null;

  // Fetch repos in parallel (only for public github.com accounts)
  const [personalRepos, ...workRepos] = await Promise.all([
    personalUsername ? fetchTopRepos(personalUsername) : Promise.resolve([]),
    ...publicWorkAccounts.map((w) => fetchTopRepos(w.username)),
  ]);

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="GitHub" accent={accent} />

      <div className="mt-10 space-y-6">
        {/* Personal */}
        {personalUsername && (
          <ContributionBlock
            username={personalUsername}
            label="Personal"
            profileUrl={`https://github.com/${personalUsername}`}
            accent={accent}
            repos={personalRepos}
          />
        )}

        {/* Public work accounts — show chart + repos */}
        {publicWorkAccounts.map((w, i) => (
          <ContributionBlock
            key={w.profileUrl}
            username={w.username}
            label={`Work · ${w.company}`}
            profileUrl={w.profileUrl}
            accent={accent}
            repos={workRepos[i] ?? []}
          />
        ))}

        {/* Internal work accounts — show profile link only, no chart */}
        {internalWorkAccounts.map((w) => (
          <InternalBlock
            key={w.profileUrl}
            label={`Work · ${w.company}`}
            profileUrl={w.profileUrl}
            accent={accent}
          />
        ))}
      </div>
    </section>
  );
}
