
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchPortfolioData } from "@/lib/portfolio";
import DefaultTemplate from "@/templates/default/DefaultTemplate";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/lib/template-renderer";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await fetchPortfolioData(username);
  if (!data) return { title: "Not Found" };

  return {
    title: data.settings.metaTitle || data.settings.siteTitle || `${data.user.name} — Portfolio`,
    description: data.settings.metaDescription || data.settings.tagline || `${data.user.name}'s developer portfolio`,
    openGraph: {
      title: data.settings.siteTitle || data.user.name,
      description: data.settings.tagline || "",
      images: data.settings.heroImageUrl ? [data.settings.heroImageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: data.settings.siteTitle || data.user.name,
      description: data.settings.tagline || "",
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { username } = await params;
  const data = await fetchPortfolioData(username);
  if (!data) notFound();

  // Check for active custom template
  const user = await prisma.user.findUnique({ where: { slug: username }, select: { id: true } });
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