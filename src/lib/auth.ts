import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          slug: profile.login.toLowerCase(),
          githubUsername: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { slug: true },
        });
        session.user.slug = dbUser?.slug ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async createUser({ user }) {
      // Create default portfolio settings for new users
      await prisma.portfolioSettings.create({
        data: {
          userId: user.id,
          siteTitle: user.name ?? "My Portfolio",
          tagline: "Software Engineer",
          theme: "dark",
          accentColor: "#5eead4",
        },
      });

      // Create default section visibility
      await prisma.sectionVisibility.create({
        data: {
          userId: user.id,
          sectionOrder: [
            "hero",
            "skills",
            "experience",
            "projects",
            "engineering",
            "blog",
            "education",
            "certifications",
            "github",
            "contact",
          ],
        },
      });
    },
  },
};