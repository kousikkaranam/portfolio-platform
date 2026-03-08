import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // If PORTFOLIO_OWNER_SLUG is set, the rewrite in next.config.ts
  // serves the portfolio at "/" — this page won't be reached in that case.

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
