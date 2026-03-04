import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // If an owner slug is set via env, redirect straight to their portfolio
  const ownerSlug = process.env.PORTFOLIO_OWNER_SLUG;
  if (ownerSlug) {
    redirect(`/${ownerSlug}`);
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
