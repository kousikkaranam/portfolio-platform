import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.sectionVisibility.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.education.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.engineeringHighlight.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.portfolioSettings.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      name: "Kousik Karanam",
      email: "kousik@demo.com",
      slug: "kousik",
      githubUsername: "kousik",
      image: null,
    },
  });

  // Portfolio settings
  await prisma.portfolioSettings.create({
    data: {
      userId: user.id,
      siteTitle: "Kousik Karanam",
      tagline: "Backend Engineer — Building Scalable Distributed Systems",
      bio: "Software Engineer specializing in backend development, distributed systems, and enterprise Java applications. Currently building microservices for pharmaceutical compliance at Leucine Tech.",
      location: "India",
      availableForHire: false,
      theme: "dark",
      accentColor: "#5eead4",
      socialLinks: {
        github: "https://github.com/kousik",
        linkedin: "https://linkedin.com/in/kousik",
        email: "kousik@demo.com",
      },
      metaTitle: "Kousik Karanam — Backend Engineer",
      metaDescription:
        "Backend engineer building scalable distributed systems with Java, Spring Boot, Kafka, and PostgreSQL.",
    },
  });

  // Skills
  const skills = [
    { category: "Backend", name: "Java", displayOrder: 0 },
    { category: "Backend", name: "Spring Boot", displayOrder: 1 },
    { category: "Backend", name: "REST APIs", displayOrder: 2 },
    { category: "Backend", name: "Kafka", displayOrder: 3 },
    { category: "Database", name: "PostgreSQL", displayOrder: 0 },
    { category: "Database", name: "MongoDB", displayOrder: 1 },
    { category: "Database", name: "Redis", displayOrder: 2 },
    { category: "DevOps", name: "Docker", displayOrder: 0 },
    { category: "DevOps", name: "AWS", displayOrder: 1 },
    { category: "DevOps", name: "CI/CD", displayOrder: 2 },
    { category: "Tools", name: "Git", displayOrder: 0 },
    { category: "Tools", name: "Linux", displayOrder: 1 },
  ];

  for (const skill of skills) {
    await prisma.skill.create({
      data: { userId: user.id, ...skill },
    });
  }

  // Experience
  await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Leucine Tech",
      role: "Software Engineer",
      description:
        "Building backend microservices for a pharmaceutical compliance platform. Developing data migration utilities, authentication services, and workflow automation systems using Spring Boot and PostgreSQL.",
      location: "India",
      startDate: new Date("2023-01-01"),
      isCurrent: true,
      techStack: [
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "MongoDB",
        "Kafka",
        "Redis",
        "Docker",
      ],
      displayOrder: 0,
    },
  });

  // Projects
  await prisma.project.create({
    data: {
      userId: user.id,
      title: "Migration Utility Service",
      slug: "migration-utility",
      description:
        "A multi-tenant data migration microservice for synchronizing data across isolated pharmaceutical compliance instances.",
      techStack: ["Java", "Spring Boot", "PostgreSQL", "MongoDB", "Docker"],
      category: "professional",
      isFeatured: true,
      displayOrder: 0,
      status: "published",
    },
  });

  await prisma.project.create({
    data: {
      userId: user.id,
      title: "Portfolio Platform",
      slug: "portfolio-platform",
      description:
        "A dynamic, multi-tenant developer portfolio platform with admin dashboard. Built with Next.js, Prisma, and PostgreSQL.",
      techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind"],
      githubUrl: "https://github.com/kousik/portfolio-platform",
      category: "personal",
      isFeatured: true,
      displayOrder: 1,
      status: "published",
    },
  });

  // Engineering Highlights
  await prisma.engineeringHighlight.create({
    data: {
      userId: user.id,
      title: "Kafka Event Pipeline",
      slug: "kafka-event-pipeline",
      summary:
        "Designed and implemented an event-driven architecture for real-time data processing across microservices.",
      techStack: ["Kafka", "Spring Boot", "Java"],
      impact: "Reduced data sync latency by 60%",
      isFeatured: true,
      displayOrder: 0,
      status: "published",
    },
  });

  await prisma.engineeringHighlight.create({
    data: {
      userId: user.id,
      title: "Multi-Tenant Migration Architecture",
      slug: "multi-tenant-migration",
      summary:
        "Built a cross-instance data synchronization system for a multi-tenant pharmaceutical compliance platform.",
      techStack: ["Java", "Spring Boot", "PostgreSQL", "MongoDB"],
      impact: "Enabled seamless data migration across 50+ tenant instances",
      isFeatured: true,
      displayOrder: 1,
      status: "published",
    },
  });

  // Blog post
  await prisma.blogPost.create({
    data: {
      userId: user.id,
      title: "Designing Event-Driven Systems with Kafka",
      slug: "designing-event-driven-systems-kafka",
      excerpt:
        "A practical guide to building reliable event-driven architectures using Apache Kafka in Spring Boot applications.",
      content:
        "# Designing Event-Driven Systems with Kafka\n\nEvent-driven architecture is a powerful pattern for building scalable, loosely coupled systems...\n\n## Why Event-Driven?\n\nTraditional request-response patterns create tight coupling between services...\n\n## Getting Started\n\nIn this post, we will explore how to set up Kafka with Spring Boot...",
      tags: ["kafka", "system-design", "spring-boot", "architecture"],
      readTimeMin: 8,
      status: "published",
      publishedAt: new Date(),
    },
  });

  // Section visibility
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

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });