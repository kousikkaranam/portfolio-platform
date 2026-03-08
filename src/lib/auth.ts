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
          email: profile.email ?? `${profile.login}@github.noreply`,
          image: profile.avatar_url,
          slug: profile.login.toLowerCase(),
          githubUsername: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      // If registration is closed, only allow existing users
      if (process.env.REGISTRATION_OPEN === "false") {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true },
        });
        if (!existing) {
          // Check if this user was approved by admin
          const approved = await prisma.registrationRequest.findFirst({
            where: { email: user.email!, status: "approved" },
          });
          if (approved) {
            // Allow sign-in — NextAuth will create the user
            return true;
          }

          // Save registration request for admin review
          const ghProfile = profile as { login?: string } | undefined;
          await prisma.registrationRequest.upsert({
            where: { email_status: { email: user.email!, status: "pending" } },
            update: {
              name: user.name,
              image: user.image,
              githubUsername: ghProfile?.login,
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              githubUsername: ghProfile?.login,
            },
          });
          return "/login?error=RegistrationClosed";
        }
      }
      return true;
    },
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