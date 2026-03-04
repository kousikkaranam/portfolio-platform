# Project Blueprint

> Internal architecture document. Covers design decisions, data flow,
> schema rationale, and implementation details for every feature.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PORTFOLIO PLATFORM                              │
│                                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │  INGEST      │   │  DATA        │   │  RENDER      │                │
│  │              │   │              │   │              │                │
│  │ Manual Admin │   │              │   │ Default      │                │
│  │ Resume PDF   │──▶│  Neon        │──▶│ Template     │──▶ Portfolio   │
│  │ LinkedIn PDF │   │  PostgreSQL  │   │              │                │
│  │ AI Generate  │   │  (Prisma 6)  │   │ AI-Generated │                │
│  │              │   │              │   │ Templates    │                │
│  └─────────────┘   └──────────────┘   └──────────────┘                │
│                            │                   │                        │
│                     ┌──────┴──────┐    ┌──────┴──────┐                 │
│                     │ Cloudinary  │    │ GitHub Pages │                 │
│                     │ (images)    │    │ (publishing) │                 │
│                     └─────────────┘    └─────────────┘                 │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  AI LAYER                                                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                │  │
│  │  │ Resume     │  │ Template   │  │ Portfolio  │                │  │
│  │  │ Parser     │  │ Generator  │  │ Chatbot    │                │  │
│  │  │ (Claude)   │  │ (Claude)   │  │ (Groq)     │                │  │
│  │  └────────────┘  └────────────┘  └────────────┘                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Decisions

### Why Next.js App Router (not Pages Router)?
- Server components reduce client JS bundle
- API routes colocated with pages
- Layout system for shared admin sidebar
- Better streaming/suspense support for AI features later

### Why Prisma 6 (not 7)?
- Prisma 7 had config issues during initial setup
- v6 is stable, well-documented, works perfectly with Neon
- Migration to v7 possible later without schema changes

### Why Neon (not Supabase/PlanetScale)?
- True serverless PostgreSQL (scales to zero)
- Free tier: 0.5GB storage, 190 hours compute/month
- Branch-able databases (useful for staging)
- Direct PostgreSQL protocol (no proprietary API layer)

### Why NextAuth (not Clerk/Auth0)?
- Completely free, no user limits
- GitHub OAuth gives us access_token for future GitHub Pages publishing
- Session-based (no JWT complexity)
- Direct database adapter with Prisma

### Why Cloudinary (not S3/Uploadthing)?
- Generous free tier: 25GB bandwidth, 25K transformations
- On-the-fly image optimization (resize, format conversion)
- No AWS account/billing setup needed
- Direct upload from browser via signed URLs

### Why GitHub Pages for publishing (not Vercel)?
- Vercel free tier: 1 custom domain per project
- GitHub Pages: unlimited repos, unlimited custom domains, all free
- Users already have GitHub accounts (our auth provider)
- We have their access_token to push via GitHub API

### Why Groq for chatbot (not Claude API)?
- Groq free tier: generous rate limits
- Llama 3.3 70B is excellent for conversational AI
- Near-instant response times (LPU inference)
- Claude API reserved for higher-value tasks (resume parsing, template gen)

---

## 3. Database Schema Rationale

### Multi-tenancy Model
Every content table has a `userId` foreign key. This is single-database,
row-level multi-tenancy. Simple, free, works for thousands of users on
Neon's 0.5GB limit.

```
User has one:  PortfolioSettings, SectionVisibility
User has many: Skills, Experiences, Projects, EngineeringHighlights,
               BlogPosts, Education, Certifications
```

### Naming Conventions
- Tables: snake_case plural (`blog_posts`, `engineering_highlights`)
- Columns: camelCase in Prisma, snake_case in DB via @@map
- IDs: cuid() — URL-safe, sortable, collision-resistant
- Timestamps: `createdAt` + `updatedAt` on every content table

### Key Schema Decisions

**PortfolioSettings — single row per user:**
```
Why not split into multiple config tables?
→ Portfolio settings are always read together (rendering a portfolio
  needs title + bio + theme + social links + accent color all at once).
  Single row = single query. No joins needed.
```

**SectionVisibility — boolean flags + JSON order:**
```
Why not a separate Section table with rows per section?
→ Sections are a fixed set (skills, projects, blog, etc.). They don't
  grow dynamically. Boolean flags are simpler to query and update.
  sectionOrder is JSON because order changes frequently and atomically.
```

**Skills — category as string, not separate table:**
```
Why not a SkillCategory table with FK?
→ Skill categories are user-defined and free-form ("Backend", "DevOps",
  "Languages", etc.). A separate table adds complexity without value.
  String field with an index on [userId, category] is fast enough.
```

**Projects/Engineering — slug field:**
```
Why slugs?
→ Clean URLs: /kousik/projects/migration-utility
  Auto-generated from title, unique per user.
  @@unique([userId, slug]) prevents collisions.
```

**BlogPosts — readTimeMin auto-calculated:**
```
Why store it instead of computing on read?
→ Computed server-side on create/update (~200 words/min formula).
  Stored to avoid recomputation on every page view.
  Trivial storage cost vs repeated string splitting.
```

**Experience — startDate/endDate as DateTime @db.Date:**
```
Why Date and not String?
→ Enables sorting by date, range queries, date formatting.
  Education uses Int (startYear/endYear) because education
  dates are typically year-granularity only.
```

### Indexes
```sql
-- Every content table indexed by userId + display order
@@index([userId, displayOrder])        -- skills, experiences, projects, etc.
@@index([userId, isFeatured, displayOrder])  -- projects, engineering
@@index([userId, status])              -- blog_posts
@@unique([userId, slug])               -- projects, engineering, blog_posts
```

### Future Table: CustomTemplate
```prisma
model CustomTemplate {
  id        String  @id @default(cuid())
  userId    String
  name      String                    // "My Dark Terminal Theme"
  html      String  @db.Text          // Complete HTML+CSS with {{placeholders}}
  thumbnail String? @db.Text          // Auto-generated preview screenshot
  isActive  Boolean @default(false)   // Only one active per user
  source    String? @db.VarChar(20)   // "ai-prompt" | "url-import" | "manual"
  sourceUrl String? @db.Text          // Original URL if imported

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isActive])
  @@map("custom_templates")
}
```

---

## 4. Authentication Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser  │────▶│ NextAuth │────▶│  GitHub  │────▶│  Callback│
│  Sign In  │     │ /api/auth│     │  OAuth   │     │  Create  │
│  Button   │     │          │     │  Consent │     │  User +  │
│           │◀────│          │◀────│          │◀────│  Account │
│  Cookie   │     │ Set      │     │ Return   │     │  in DB   │
│  Set      │     │ Session  │     │ Token    │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

**What we store from GitHub OAuth:**
```
Account table:
  - access_token   → used later for GitHub Pages publishing
  - provider       → "github"
  - providerAccountId → GitHub user ID

User table:
  - name           → GitHub display name
  - email          → GitHub email
  - image          → GitHub avatar URL
  - githubUsername  → extracted for repo naming
  - slug           → derived from name (URL path)
```

**Route protection pattern:**
```tsx
// Every API route:
const session = await getServerSession(authOptions);
if (!session?.user?.id) return NextResponse.json(
  { error: "Unauthorized" }, { status: 401 }
);
// Then use session.user.id for all DB queries

// Admin pages: middleware or layout-level redirect
```

---

## 5. API Design Patterns

### Consistent CRUD Pattern
Every admin resource follows the same pattern:

```tsx
// GET    → list all for current user (sorted by displayOrder or date)
// POST   → create new (auto-increment displayOrder)
// PUT    → update by id (verify userId ownership)
// DELETE → delete by id via query param (?id=xxx)
```

### Ownership Verification
Every write operation includes `userId` in the WHERE clause:
```tsx
await prisma.project.update({
  where: { id, userId: session.user.id },  // ALWAYS include userId
  data,
});
```
This prevents users from modifying other users' data even if they
guess a valid ID.

### Slug Generation
Auto-generated on create and title-change:
```tsx
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
```

### Error Handling Pattern
```tsx
try {
  const result = await prisma.xxx.create({ data });
  return NextResponse.json(result);
} catch (error) {
  if (error.code === "P2002") {
    return NextResponse.json(
      { error: "Duplicate entry" }, { status: 409 }
    );
  }
  return NextResponse.json(
    { error: "Internal server error" }, { status: 500 }
  );
}
```

---

## 6. Image Upload Architecture

```
Browser                    Server                     Cloudinary
┌──────┐                  ┌──────┐                   ┌──────────┐
│Drag/ │  FormData POST   │/api/ │  upload_stream()  │          │
│Drop  │────────────────▶ │upload│──────────────────▶ │ portfolio│
│Image │                  │      │                    │ /projects│
│      │  { url, id,      │      │  { secure_url,    │ /blog    │
│      │◀──width, height}─│      │◀───public_id }────│ /general │
└──────┘                  └──────┘                   └──────────┘
```

**Folder structure in Cloudinary:**
```
portfolio/
├── projects/     ← project thumbnails
├── engineering/  ← architecture diagrams
├── blog/         ← cover images
├── education/    ← institution logos (if added later)
└── general/      ← profile images, misc
```

---

## 7. Template System Architecture

### The Contract (PortfolioData interface)
```typescript
// Every template receives this exact shape
interface PortfolioData {
  user: {
    name: string;
    image: string | null;
    slug: string;
    githubUsername: string | null;
  };
  settings: {
    siteTitle: string | null;
    tagline: string | null;
    bio: string | null;
    heroImageUrl: string | null;
    resumeUrl: string | null;
    location: string | null;
    availableForHire: boolean;
    socialLinks: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      email?: string;
    } | null;
    theme: string;
    accentColor: string;
  };
  skills: Array<{
    id: string;
    category: string;
    name: string;
    proficiency: number | null;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    description: string | null;
    companyLogoUrl: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    techStack: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    longDescription: string | null;
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    thumbnailUrl: string | null;
    category: string | null;
    isFeatured: boolean;
  }>;
  engineering: Array<{
    id: string;
    title: string;
    summary: string | null;
    content: string | null;
    techStack: string[];
    diagramUrl: string | null;
    impact: string | null;
    isFeatured: boolean;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    coverImageUrl: string | null;
    tags: string[];
    readTimeMin: number | null;
    publishedAt: string | null;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string | null;
    field: string | null;
    startYear: number | null;
    endYear: number | null;
    description: string | null;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string | null;
    issueDate: string | null;
    credentialUrl: string | null;
  }>;
  sections: {
    showSkills: boolean;
    showExperience: boolean;
    showProjects: boolean;
    showEngineering: boolean;
    showBlog: boolean;
    showEducation: boolean;
    showCertifications: boolean;
    showGithub: boolean;
    showContact: boolean;
    sectionOrder: string[];
  };
}
```

### Template Types

```
A) Built-in default:     src/templates/default/
                          → React components, part of the codebase
                          → Always available as fallback

B) AI-generated custom:   Stored in custom_templates table
                          → HTML + CSS string with {{placeholders}}
                          → Rendered server-side with data injection
                          → Sandboxed for security
```

### Placeholder Syntax for AI Templates
```
Simple values:     {{name}}, {{tagline}}, {{bio}}
Loops:             {{#projects}} ... {{/projects}}
Conditionals:      {{?showBlog}} ... {{/showBlog}}
Nested in loops:   {{#projects}} <h3>{{title}}</h3> {{/projects}}
```

### Template Rendering Pipeline
```
1. Fetch user data from Prisma → PortfolioData object
2. Check for active CustomTemplate
   → If found: server-side placeholder replacement → serve HTML
   → If not: render default React template
3. For static export (GitHub Pages):
   → Same pipeline but output is saved to file instead of streamed
```

---

## 8. AI Features Architecture

### Resume Parser Pipeline
```
PDF Upload → pdf-parse (extract text) → Claude API prompt:

"You are a resume parser. Extract structured data from this resume text.
Return ONLY valid JSON matching this exact schema:
{
  settings: { siteTitle, tagline, bio },
  skills: [{ category, name, proficiency }],
  experiences: [{ company, role, startDate, endDate, description, techStack }],
  education: [{ institution, degree, field, startYear, endYear }],
  certifications: [{ name, issuer, issueDate }],
  projects: [{ title, description, techStack, liveUrl, githubUrl }]
}

Rules:
- proficiency: estimate 1-100 based on context clues
- techStack: extract from descriptions, not just listed skills
- dates: ISO format for experiences, year integers for education
- bio: write a concise, professional summary (2-3 sentences)
- tagline: create from job title + specialization

Resume text:
---
{extractedText}
---"

→ Parse JSON response → Validate → Bulk upsert to Prisma
```

### AI Template Generator Pipeline
```
User input (URL or description)
         ↓
If URL: fetch page HTML+CSS via web_fetch
         ↓
Claude API prompt:

"Convert this design into a standalone HTML+CSS template.
Use this placeholder syntax:
- {{name}}, {{tagline}}, {{bio}} for simple values
- {{#projects}} ... {{/projects}} for loops
- {{title}}, {{description}} inside loops

The template must:
1. Be a single HTML file with embedded <style>
2. Be fully responsive (mobile-first)
3. Replace ALL hardcoded content with placeholders
4. Keep the original visual design as close as possible
5. Use only CSS (no JavaScript required)
6. Include sections for: hero, skills, experience, projects,
   engineering, blog, education, certifications, contact

Return ONLY the HTML. No explanation."

→ Store result in custom_templates table
→ Generate thumbnail screenshot (optional: Puppeteer on serverless)
→ User previews and activates
```

### Chatbot Architecture
```
Visitor sends message
         ↓
POST /api/chat { userId, message }
         ↓
Fetch portfolio data for that userId
         ↓
Check cache for similar questions (fuzzy match)
         ↓
If cache hit: return cached answer
If cache miss:
         ↓
Groq API (Llama 3.3 70B):
  System: "You are {name}'s portfolio assistant.
           Answer questions about them based ONLY on this data:
           {JSON.stringify(portfolioData)}.
           Be concise (2-3 sentences max).
           If the data doesn't contain the answer, say so."
  User: "{visitor's question}"
         ↓
Stream response back to client
Cache the Q&A pair for 24 hours
```

---

## 9. Publishing Pipeline (GitHub Pages)

```
User clicks "Publish" in admin
         ↓
POST /api/publish
         ↓
1. Fetch complete PortfolioData
2. Fetch active template (custom or default)
3. Render to standalone HTML string
4. Get user's GitHub access_token from accounts table
5. GitHub API calls:
   a. Create/get repo: {username}.github.io
   b. Create/update files:
      - index.html (the rendered portfolio)
      - CNAME (custom domain if set)
      - robots.txt
      - sitemap.xml (auto-generated)
   c. Enable GitHub Pages (if not already)
6. Return published URL
         ↓
Portfolio live at:
  https://{username}.github.io
  or https://custom-domain.com (if CNAME set)
```

**GitHub API calls used:**
```
PUT /repos/{owner}/{repo}/contents/{path}
  → Create or update files

POST /repos/{owner}/{repo}/pages
  → Enable GitHub Pages

GET /repos/{owner}/{repo}/pages
  → Check deployment status
```

---

## 10. Free Tier Limits & Monitoring

| Service     | Free Limit              | Our Usage (est.)         | Headroom |
|-------------|-------------------------|--------------------------|----------|
| Vercel      | 100GB bandwidth/mo      | ~5GB for 1000 users      | 95%      |
| Neon        | 0.5GB storage           | ~50MB for 1000 users     | 90%      |
| Neon        | 190 compute hours/mo    | ~20 hours typical        | 89%      |
| Cloudinary  | 25GB bandwidth/mo       | ~2GB for 1000 users      | 92%      |
| Cloudinary  | 25K transformations/mo  | ~5K typical               | 80%      |
| Groq        | 14.4K requests/day      | ~500/day at 1000 users   | 96%      |
| GitHub Pages| Unlimited repos         | 1 per user               | ∞        |

**When to worry:**
- 5000+ active users: Neon storage approaches limit
- 10000+ monthly visitors per portfolio: Cloudinary bandwidth
- Viral chatbot usage: Groq rate limits

**Scaling path (when free tier isn't enough):**
- Neon: $19/mo for 10GB
- Vercel: $20/mo Pro
- Cloudinary: $89/mo Plus
- Or self-host on a $5/mo VPS with Docker