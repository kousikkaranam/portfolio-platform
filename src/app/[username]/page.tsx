
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchPortfolioData } from "@/lib/portfolio";
import DefaultTemplate from "@/templates/default/DefaultTemplate";

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

  // Future: check for active custom template and render it instead
  // const customTemplate = await prisma.customTemplate.findFirst({ where: { userId, isActive: true } });
  // if (customTemplate) return <CustomRenderer html={customTemplate.html} data={data} />;

  return <DefaultTemplate data={data} />;
}