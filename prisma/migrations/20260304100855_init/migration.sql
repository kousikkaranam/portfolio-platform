-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "slug" TEXT,
    "githubUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteTitle" VARCHAR(200),
    "tagline" VARCHAR(500),
    "bio" TEXT,
    "heroImageUrl" TEXT,
    "resumeUrl" TEXT,
    "location" VARCHAR(100),
    "availableForHire" BOOLEAN NOT NULL DEFAULT false,
    "socialLinks" JSONB,
    "theme" VARCHAR(20) NOT NULL DEFAULT 'dark',
    "accentColor" VARCHAR(7) NOT NULL DEFAULT '#5eead4',
    "metaTitle" VARCHAR(100),
    "metaDescription" VARCHAR(300),
    "customDomain" VARCHAR(255),
    "analyticsId" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "iconUrl" TEXT,
    "proficiency" SMALLINT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" VARCHAR(200) NOT NULL,
    "role" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "companyLogoUrl" TEXT,
    "location" VARCHAR(100),
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "techStack" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "longDescription" TEXT,
    "techStack" TEXT[],
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "thumbnailUrl" TEXT,
    "screenshots" TEXT[],
    "architectureUrl" TEXT,
    "category" VARCHAR(50),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engineering_highlights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "techStack" TEXT[],
    "diagramUrl" TEXT,
    "impact" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engineering_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "excerpt" VARCHAR(500),
    "content" TEXT,
    "coverImageUrl" TEXT,
    "tags" TEXT[],
    "readTimeMin" SMALLINT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "degree" VARCHAR(200),
    "field" VARCHAR(200),
    "startYear" SMALLINT,
    "endYear" SMALLINT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "issuer" VARCHAR(200),
    "issueDate" DATE,
    "credentialUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_visibility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showSkills" BOOLEAN NOT NULL DEFAULT true,
    "showExperience" BOOLEAN NOT NULL DEFAULT true,
    "showProjects" BOOLEAN NOT NULL DEFAULT true,
    "showEngineering" BOOLEAN NOT NULL DEFAULT true,
    "showBlog" BOOLEAN NOT NULL DEFAULT true,
    "showEducation" BOOLEAN NOT NULL DEFAULT true,
    "showCertifications" BOOLEAN NOT NULL DEFAULT true,
    "showGithub" BOOLEAN NOT NULL DEFAULT true,
    "showContact" BOOLEAN NOT NULL DEFAULT true,
    "sectionOrder" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_visibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_settings_userId_key" ON "portfolio_settings"("userId");

-- CreateIndex
CREATE INDEX "skills_userId_category_displayOrder_idx" ON "skills"("userId", "category", "displayOrder");

-- CreateIndex
CREATE INDEX "experiences_userId_displayOrder_idx" ON "experiences"("userId", "displayOrder");

-- CreateIndex
CREATE INDEX "projects_userId_isFeatured_displayOrder_idx" ON "projects"("userId", "isFeatured", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "projects_userId_slug_key" ON "projects"("userId", "slug");

-- CreateIndex
CREATE INDEX "engineering_highlights_userId_isFeatured_displayOrder_idx" ON "engineering_highlights"("userId", "isFeatured", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "engineering_highlights_userId_slug_key" ON "engineering_highlights"("userId", "slug");

-- CreateIndex
CREATE INDEX "blog_posts_userId_status_idx" ON "blog_posts"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_userId_slug_key" ON "blog_posts"("userId", "slug");

-- CreateIndex
CREATE INDEX "education_userId_displayOrder_idx" ON "education"("userId", "displayOrder");

-- CreateIndex
CREATE INDEX "certifications_userId_displayOrder_idx" ON "certifications"("userId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "section_visibility_userId_key" ON "section_visibility"("userId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_settings" ADD CONSTRAINT "portfolio_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_highlights" ADD CONSTRAINT "engineering_highlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_visibility" ADD CONSTRAINT "section_visibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
