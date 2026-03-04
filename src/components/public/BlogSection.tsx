import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[];
  readTimeMin: number | null;
  publishedAt: string | Date | null;
}

interface Props {
  posts: Post[];
  slug: string;
  accent: string;
}

function formatDate(d: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogSection({ posts, slug, accent }: Props) {
  return (
    <section id="blog" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Blog</h2>
        <p className="text-gray-400 mb-10">Thoughts on engineering</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${slug}/blog/${post.slug}`}
              className="bg-[#121826] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group block"
            >
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                {post.readTimeMin && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTimeMin} min read
                  </span>
                )}
              </div>

              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[var(--accent)] transition-colors"
                style={{ ["--accent" as string]: accent }}
              >
                {post.title}
              </h3>

              {post.excerpt && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-[#0b0f19] text-gray-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <span
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: accent }}
              >
                Read more <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}