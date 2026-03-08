import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { fetchPortfolioData } from "@/lib/portfolio";
import DefaultTemplate from "@/templates/default/DefaultTemplate";
import { renderTemplate } from "@/lib/template-renderer";

const ownerSlug = process.env.PORTFOLIO_OWNER_SLUG;

export async function generateMetadata(): Promise<Metadata> {
  if (!ownerSlug) return {};
  const data = await fetchPortfolioData(ownerSlug);
  if (!data) return {};
  return {
    title: data.settings.metaTitle || data.settings.siteTitle || `${data.user.name} — Portfolio`,
    description: data.settings.metaDescription || data.settings.tagline || `${data.user.name}'s developer portfolio`,
    openGraph: {
      title: data.settings.siteTitle || data.user.name,
      description: data.settings.tagline || "",
      images: data.settings.heroImageUrl ? [data.settings.heroImageUrl] : [],
    },
  };
}

export default async function Home() {
  // If PORTFOLIO_OWNER_SLUG is set, render that portfolio directly at "/"
  if (ownerSlug) {
    const data = await fetchPortfolioData(ownerSlug);
    if (data) {
      const user = await prisma.user.findUnique({
        where: { slug: ownerSlug },
        select: { id: true },
      });
      if (user) {
        const customTemplate = await prisma.customTemplate.findFirst({
          where: { userId: user.id, isActive: true },
        });
        if (customTemplate) {
          const rendered = renderTemplate(customTemplate.html, data);
          return (
            <div
              id="custom-template"
              style={{ minHeight: "100vh" }}
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          );
        }
      }
      return <DefaultTemplate data={data} />;
    }
  }

  // Fallback: redirect to the first registered user's portfolio
  const firstUser = await prisma.user.findFirst({
    where: { slug: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { slug: true },
  });

  if (firstUser?.slug) {
    redirect(`/${firstUser.slug}`);
  }

  // No users yet — show login
  redirect("/login");
}
