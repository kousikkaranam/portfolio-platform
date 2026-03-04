import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

interface Props {
  params: Promise<{ username: string; postSlug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { username, postSlug } = await params;

  const user = await prisma.user.findUnique({ where: { slug: username } });
  if (!user) notFound();

  const post = await prisma.blogPost.findFirst({
    where: {
      userId: user.id,
      slug: postSlug,
      status: "published",
    },
  });

  if (!post) notFound();

  const settings = await prisma.portfolioSettings.findUnique({
    where: { userId: user.id },
  });

  const accent = settings?.accentColor || "#5eead4";

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href={`/${username}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back to portfolio
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {post.readTimeMin && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.readTimeMin} min read
              </span>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <article className="prose prose-invert prose-gray max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-[var(--accent)] prose-code:text-[var(--accent)] prose-pre:bg-[#121826] prose-pre:border prose-pre:border-gray-800"
          style={{ ["--accent" as string]: accent } as React.CSSProperties}
        >
          <ReactMarkdown>{post.content || ""}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}