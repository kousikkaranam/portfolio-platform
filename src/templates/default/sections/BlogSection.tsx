
import type { PortfolioData } from "@/templates/types";
import SectionTitle from "@/templates/default/components/SectionTitle";
export default function BlogSection({ data }: { data: PortfolioData }) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <SectionTitle title="Blog" accent={data.settings.accentColor} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {data.blogPosts.map((post) => (
          <article key={post.id} className="bg-[#121826] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            {post.coverImageUrl && (
              <div className="h-40 relative">
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                {post.publishedAt && <span>{fmt(post.publishedAt)}</span>}
                {post.readTimeMin && <span>· {post.readTimeMin} min read</span>}
              </div>
              <h3 className="text-white font-semibold mb-2 line-clamp-2">{post.title}</h3>
              {post.excerpt && <p className="text-gray-400 text-sm line-clamp-3 mb-3">{post.excerpt}</p>}
              <div className="flex gap-1.5 flex-wrap">
                {post.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
