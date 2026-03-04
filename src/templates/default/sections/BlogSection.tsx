"use client";

import Link from "next/link";
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";

export default function BlogSection({ data }: { data: PortfolioData }) {
  const accent = data.settings.accentColor;
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="Blog" accent={accent} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {data.blogPosts.map((post) => (
          <Link key={post.id} href={`/${data.user.slug}/blog/${post.slug}`}
            className="group rounded-xl overflow-hidden block border transition-colors"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
            {post.coverImageUrl && (
              <div className="h-40">
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                {post.publishedAt && <span>{fmt(post.publishedAt)}</span>}
                {post.readTimeMin && <span>· {post.readTimeMin} min read</span>}
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: "var(--text)" }}>{post.title}</h3>
              {post.excerpt && <p className="text-sm line-clamp-3 mb-3" style={{ color: "var(--text-secondary)" }}>{post.excerpt}</p>}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: `${accent}15`, color: accent }}>{t}</span>
                  ))}
                </div>
                <span className="text-xs flex-shrink-0 ml-2" style={{ color: accent }}>Read →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
