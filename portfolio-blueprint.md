# Portfolio Platform — Complete Blueprint

> A multi-tenant, fully dynamic developer portfolio platform.
> Zero code changes to update content. Free to deploy and run.

---

## 1. Final Tech Stack

### Frontend + Backend (Monorepo)
```
Framework       : Next.js 14 (App Router)
Language        : TypeScript
Styling         : TailwindCSS
Animations      : Framer Motion
ORM             : Prisma
Auth            : NextAuth.js (GitHub OAuth provider)
API Layer       : Next.js API Routes (Route Handlers)
Image Upload    : Cloudinary (free: 25GB bandwidth/mo)
Markdown        : MDX / react-markdown (for blog posts)
Icons           : Lucide React
```

### Database
```
PostgreSQL on Neon (free tier: 0.5 GB, 1 project, autoscaling)
```

### Deployment
```
Hosting         : Vercel OR Cloudflare Pages (free tier)
Domain          : kousik.is-a.dev (free via is-a-dev)
CI/CD           : Auto-deploy on git push (Vercel/CF built-in)
```

### Why This Stack
- Next.js API routes = no separate backend server = no cold starts
- Prisma = type-safe DB access, easy migrations, works with Neon
- NextAuth + GitHub OAuth = free auth, no email service needed
- Everything runs on ONE Vercel/CF deployment = simple, free
- Spring Boot version kept as separate GitHub repo for showcase

---

## 2. Multi-Tenancy Model

### How It Works
```
Each user = 1 row in "User" table
Each user gets a unique slug: kousik, rahul, etc.

Public URLs:
  yourapp.vercel.app/kousik       → Kousik's portfolio
  yourapp.vercel.app/rahul        → Rahul's portfolio

With custom domain (later):
  kousik.is-a.dev                 → Kousik's portfolio

Admin URLs:
  yourapp.vercel.app/admin        → Dashboard (auth protected)
```

### Tenant Isolation
- Every content table has a `userId` foreign key
- All queries scoped by `userId` — no data leaks
- Admin dashboard only shows YOUR content
- Public routes resolve user by slug from URL

---

## 3. Database Schema

### Users
```sql
users
├── id              UUID        PK, default gen_random_uuid()
├── name            VARCHAR(100)
├── email           VARCHAR(255) UNIQUE, NOT NULL
├── slug            VARCHAR(50)  UNIQUE, NOT NULL  -- "kousik"
├── avatar_url      TEXT
├── github_username  VARCHAR(100)
├── provider        VARCHAR(20)  -- "github"
├── provider_id     VARCHAR(100)
├── created_at      TIMESTAMPTZ  DEFAULT now()
└── updated_at      TIMESTAMPTZ  DEFAULT now()
```

### Portfolio Settings (per-user site config)
```sql
portfolio_settings
├── id              UUID        PK
├── user_id         UUID        FK → users.id, UNIQUE
├── site_title      VARCHAR(200)    -- "Kousik Karanam"
├── tagline         VARCHAR(500)    -- "Backend Engineer"
├── bio             TEXT            -- Long intro paragraph
├── hero_image_url  TEXT
├── resume_url      TEXT
├── location        VARCHAR(100)
├── available_for_hire  BOOLEAN  DEFAULT false
├── social_links    JSONB           -- {github, linkedin, twitter, email}
├── theme           VARCHAR(20)  DEFAULT 'dark'  -- dark/light/custom
├── accent_color    VARCHAR(7)   DEFAULT '#5eead4'
├── meta_title      VARCHAR(100)    -- SEO title
├── meta_description VARCHAR(300)   -- SEO description
├── custom_domain   VARCHAR(255)    -- "kousik.is-a.dev" (future)
├── analytics_id    VARCHAR(50)     -- Google Analytics (optional)
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ
```

### Skills
```sql
skills
├── id              UUID        PK
├── user_id         UUID        FK → users.id
├── category        VARCHAR(50)     -- "Backend", "DevOps", "Database"
├── name            VARCHAR(100)    -- "Spring Boot"
├── icon_url        TEXT            -- optional icon
├── proficiency     SMALLINT        -- 1-5 (optional)
├── display_order   INTEGER      DEFAULT 0
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ

INDEX: (user_id, category, display_order)
```

### Experience
```sql
experiences
├── id              UUID        PK
├── user_id         UUID        FK → users.id
├── company         VARCHAR(200)
├── role            VARCHAR(200)
├── description     TEXT            -- Markdown supported
├── company_logo_url TEXT
├── location        VARCHAR(100)
├── start_date      DATE
├── end_date        DATE            -- NULL = present
├── is_current      BOOLEAN      DEFAULT false
├── tech_stack      TEXT[]          -- {"Java", "Kafka", "Redis"}
├── display_order   INTEGER      DEFAULT 0
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ

INDEX: (user_id, display_order)
```

### Projects
```sql
projects
├── id              UUID        PK
├── user_id         UUID        FK → users.id
├── title           VARCHAR(200)
├── slug            VARCHAR(200)    -- URL-friendly title
├── description     TEXT
├── long_description TEXT           -- Markdown, detailed writeup
├── tech_stack      TEXT[]          -- {"Electron", "FastAPI", "MediaPipe"}
├── github_url      TEXT
├── live_url        TEXT
├── thumbnail_url   TEXT
├── screenshots     TEXT[]          -- array of image URLs
├── architecture_url TEXT           -- architecture diagram image
├── category        VARCHAR(50)     -- "personal", "professional", "oss"
├── is_featured     BOOLEAN      DEFAULT false
├── display_order   INTEGER      DEFAULT 0
├── status          VARCHAR(20)  DEFAULT 'published' -- draft/published
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ

INDEX: (user_id, is_featured, display_order)
INDEX: (user_id, slug) UNIQUE
```

### Engineering Highlights
```sql
engineering_highlights
├── id              UUID        PK
├── user_id         UUID        FK → users.id
├── title           VARCHAR(200)    -- "Kafka Event Pipeline"
├── slug            VARCHAR(200)
├── summary         TEXT            -- Short description
├── content         TEXT            -- Full Markdown writeup
├── tech_stack      TEXT[]
├── diagram_url     TEXT            -- Architecture diagram
├── impact          TEXT            -- "Reduced latency by 40%"
├── is_featured     BOOLEAN      DEFAULT false
├── display_order   INTEGER      DEFAULT 0
├── status          VARCHAR(20)  DEFAULT 'published'
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ

INDEX: (user_id, is_featured, display_order)
```

### Blog Posts
```sql
blog_posts
├── id              UUID        PK
├── user_id         UUID        FK → users.id
├── title           VARCHAR(300)
├── slug            VARCHAR(300)    UNIQUE per user
├── excerpt         VARCHAR(500)    -- Preview text
├── content         TEXT            -- Full Markdown content
├── cover_image_url TEXT
├── tags            TEXT[]          -- {"kafka", "system-design"}
├── read_time_min   SMALLINT        -- Calculated on save
├── status          VARCHAR(20)  DEFAULT 'draft' -- draft/published
├── published_at    TIMESTAMPTZ     -- Set when status → published
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ

INDEX: (user_id, status, published_at DESC)
INDEX: (user_id, slug) UNIQUE
```

### Education (optional section)
```sql
education
├── id              UUID        PK
├── user_id         UUID        FK → users.id
├── institution     VARCHAR(200)
├── degree          VARCHAR(200)
├── field           VARCHAR(200)
├── start_year      SMALLINT
├── end_year        SMALLINT
├── description     TEXT
├── display_order   INTEGER      DEFAULT 0
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ
```

### Certifications (optional section)
```sql
certifications
├── id              UUID        PK
├── user_id         UUID        FK → users.id
├── name            VARCHAR(200)
├── issuer          VARCHAR(200)
├── issue_date      DATE
├── credential_url  TEXT
├── display_order   INTEGER      DEFAULT 0
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ
```

### Section Visibility (toggle sections on/off per user)
```sql
section_visibility
├── id              UUID        PK
├── user_id         UUID        FK → users.id, UNIQUE
├── show_skills     BOOLEAN     DEFAULT true
├── show_experience BOOLEAN     DEFAULT true
├── show_projects   BOOLEAN     DEFAULT true
├── show_engineering BOOLEAN    DEFAULT true
├── show_blog       BOOLEAN     DEFAULT true
├── show_education  BOOLEAN     DEFAULT true
├── show_certifications BOOLEAN DEFAULT true
├── show_github     BOOLEAN     DEFAULT true
├── show_contact    BOOLEAN     DEFAULT true
├── section_order   JSONB       -- ["hero","skills","projects","experience",...]
└── updated_at      TIMESTAMPTZ
```

---

## 4. API Design

### Public APIs (no auth, cached)
```
GET  /api/[slug]                    → User profile + settings
GET  /api/[slug]/skills             → Skills by category
GET  /api/[slug]/experience         → Experience (sorted)
GET  /api/[slug]/projects           → Published projects
GET  /api/[slug]/projects/[id]      → Single project detail
GET  /api/[slug]/engineering        → Engineering highlights
GET  /api/[slug]/blog               → Published blog posts
GET  /api/[slug]/blog/[postSlug]    → Single blog post
GET  /api/[slug]/sections           → Section visibility + order
```

### Admin APIs (auth required, scoped to logged-in user)
```
── Settings ──
GET    /api/admin/settings          → Get my portfolio settings
PUT    /api/admin/settings          → Update settings

── Skills ──
GET    /api/admin/skills
POST   /api/admin/skills
PUT    /api/admin/skills/[id]
DELETE /api/admin/skills/[id]
PATCH  /api/admin/skills/reorder    → Bulk update display_order

── Experience ──
GET    /api/admin/experience
POST   /api/admin/experience
PUT    /api/admin/experience/[id]
DELETE /api/admin/experience/[id]

── Projects ──
GET    /api/admin/projects
POST   /api/admin/projects
PUT    /api/admin/projects/[id]
DELETE /api/admin/projects/[id]

── Engineering ──
GET    /api/admin/engineering
POST   /api/admin/engineering
PUT    /api/admin/engineering/[id]
DELETE /api/admin/engineering/[id]

── Blog ──
GET    /api/admin/blog
POST   /api/admin/blog
PUT    /api/admin/blog/[id]
DELETE /api/admin/blog/[id]
PATCH  /api/admin/blog/[id]/publish

── Sections ──
PUT    /api/admin/sections          → Toggle visibility + reorder

── Upload ──
POST   /api/admin/upload            → Upload image to Cloudinary
```

---

## 5. Application Architecture

```
┌─────────────────────────────────────────────────────┐
│                    NEXT.JS APP                       │
│                                                     │
│  ┌──────────────┐          ┌──────────────────┐     │
│  │ Public Pages │          │  Admin Dashboard  │     │
│  │              │          │  (Auth Protected) │     │
│  │ /[slug]      │          │  /admin           │     │
│  │ /[slug]/blog │          │  /admin/projects  │     │
│  │ /[slug]/...  │          │  /admin/blog      │     │
│  └──────┬───────┘          └────────┬──────────┘     │
│         │                           │                │
│         ▼                           ▼                │
│  ┌─────────────────────────────────────────────┐     │
│  │          API Route Handlers                  │     │
│  │          /api/[slug]/*  (public)             │     │
│  │          /api/admin/*   (protected)          │     │
│  └──────────────────┬──────────────────────────┘     │
│                     │                                │
│  ┌──────────────────▼──────────────────────────┐     │
│  │            Prisma ORM Layer                  │     │
│  │      (Type-safe queries, scoped by userId)   │     │
│  └──────────────────┬──────────────────────────┘     │
│                     │                                │
│  ┌──────────────────▼──────┐  ┌────────────────┐     │
│  │   NextAuth.js Session   │  │  Cloudinary SDK │     │
│  │   (GitHub OAuth)        │  │  (Image Upload) │     │
│  └─────────────────────────┘  └────────────────┘     │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │   Neon PostgreSQL     │
          │   (Free Tier)         │
          │                       │
          │   users               │
          │   portfolio_settings  │
          │   skills              │
          │   experiences         │
          │   projects            │
          │   engineering_...     │
          │   blog_posts          │
          │   education           │
          │   certifications      │
          │   section_visibility  │
          └───────────────────────┘
```

---

## 6. Folder Structure

```
portfolio-platform/
│
├── prisma/
│   ├── schema.prisma           # Full database schema
│   └── seed.ts                 # Seed data for dev
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing / redirect
│   │   │
│   │   ├── [slug]/             # ── PUBLIC PORTFOLIO ──
│   │   │   ├── page.tsx        # Full portfolio homepage
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx    # Blog listing
│   │   │   │   └── [postSlug]/
│   │   │   │       └── page.tsx
│   │   │   └── projects/
│   │   │       └── [projectSlug]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── admin/              # ── ADMIN DASHBOARD ──
│   │   │   ├── layout.tsx      # Auth guard + sidebar
│   │   │   ├── page.tsx        # Dashboard overview
│   │   │   ├── settings/
│   │   │   │   └── page.tsx    # Edit profile, social, theme
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx    # List + add/edit projects
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── experience/
│   │   │   │   └── page.tsx
│   │   │   ├── skills/
│   │   │   │   └── page.tsx
│   │   │   ├── engineering/
│   │   │   │   └── page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Markdown editor
│   │   │   ├── education/
│   │   │   │   └── page.tsx
│   │   │   └── sections/
│   │   │       └── page.tsx    # Toggle & reorder sections
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── [slug]/         # Public API routes
│   │       │   ├── route.ts
│   │       │   ├── skills/route.ts
│   │       │   ├── experience/route.ts
│   │       │   ├── projects/route.ts
│   │       │   ├── engineering/route.ts
│   │       │   └── blog/route.ts
│   │       └── admin/          # Protected API routes
│   │           ├── settings/route.ts
│   │           ├── skills/route.ts
│   │           ├── experience/route.ts
│   │           ├── projects/route.ts
│   │           ├── engineering/route.ts
│   │           ├── blog/route.ts
│   │           ├── sections/route.ts
│   │           └── upload/route.ts
│   │
│   ├── components/
│   │   ├── public/             # Portfolio display components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── SkillsGrid.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ExperienceTimeline.tsx
│   │   │   ├── EngineeringCard.tsx
│   │   │   ├── BlogCard.tsx
│   │   │   ├── TerminalSection.tsx
│   │   │   ├── GithubActivity.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── admin/              # Dashboard components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── FormModal.tsx
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── TagInput.tsx
│   │   │   ├── SectionReorder.tsx
│   │   │   └── StatsCard.tsx
│   │   │
│   │   └── ui/                 # Shared UI primitives
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Toast.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # NextAuth config
│   │   ├── cloudinary.ts       # Upload helper
│   │   ├── github.ts           # GitHub API integration
│   │   └── utils.ts            # Shared utilities
│   │
│   └── types/
│       └── index.ts            # Shared TypeScript types
│
├── public/
│   └── default-avatar.png
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 7. Development Roadmap

### Phase 1: Foundation (Week 1)
```
□ Initialize Next.js project with TypeScript + Tailwind
□ Set up Prisma with Neon PostgreSQL
□ Create full database schema + run migrations
□ Configure NextAuth.js with GitHub OAuth
□ Build Prisma client singleton + utility helpers
□ Create seed script with sample data
□ Verify: Can login, DB connected, seed data visible
```

### Phase 2: Admin Dashboard — Core (Week 2)
```
□ Admin layout (sidebar, header, auth guard)
□ Settings page (edit name, bio, social, theme)
□ Skills CRUD (add/edit/delete/reorder by category)
□ Experience CRUD (add/edit/delete with date ranges)
□ Image upload integration with Cloudinary
□ Verify: Can manage all basic content via admin
```

### Phase 3: Admin Dashboard — Content (Week 3)
```
□ Projects CRUD (with tech stack tags, screenshots)
□ Engineering Highlights CRUD
□ Blog post editor with Markdown preview
□ Blog publish/draft workflow
□ Section visibility toggles + drag-to-reorder
□ Education + Certifications CRUD
□ Verify: All content types manageable, sections toggleable
```

### Phase 4: Public Portfolio — UI (Week 4)
```
□ Dynamic route /[slug] — resolve user, fetch all data
□ Hero section (name, tagline, avatar, social links)
□ Skills grid (grouped by category)
□ Experience timeline
□ Featured projects showcase
□ Engineering highlights section
□ Blog listing + individual post pages
□ Contact section
□ Responsive design for all sections
□ Verify: Full portfolio renders from DB data
```

### Phase 5: Polish + Advanced (Week 5)
```
□ Framer Motion animations (scroll reveals, hovers)
□ Terminal/interactive section
□ GitHub activity integration (recent repos, commits)
□ SEO: dynamic meta tags, Open Graph per page
□ Theme support (dark/light based on user setting)
□ Loading states + error boundaries
□ Performance: image optimization, caching headers
□ Verify: Smooth, fast, SEO-friendly portfolio
```

### Phase 6: Deploy + Domain (Week 6)
```
□ Deploy to Vercel / Cloudflare Pages
□ Set environment variables in dashboard
□ Register kousik.is-a.dev (submit PR to is-a-dev)
□ Configure custom domain in hosting platform
□ Enable HTTPS
□ Test full flow: login → edit → view public portfolio
□ README documentation
□ Verify: Live at kousik.is-a.dev, fully functional
```

---

## 8. Free Tier Limits (What You Get)

| Service        | Free Tier                          | Enough? |
|----------------|-------------------------------------|---------|
| Vercel         | 100GB bandwidth, 100 deploys/day   | Yes     |
| Neon Postgres  | 0.5GB storage, auto-suspend        | Yes     |
| Cloudinary     | 25GB bandwidth, 25K transforms/mo  | Yes     |
| NextAuth       | Open source, unlimited             | Yes     |
| is-a.dev       | Free forever                       | Yes     |
| GitHub OAuth   | Free, unlimited                    | Yes     |
| **Total Cost** | **₹0/month**                       |         |

---

## 9. Portability & Migration Guide

### Moving Database off Neon
```bash
# Export from Neon (standard pg_dump)
pg_dump "postgresql://user:pass@neon-host/db?sslmode=require" > backup.sql

# Import to any PostgreSQL (AWS RDS, GCP Cloud SQL, self-hosted)
psql "postgresql://user:pass@new-host/db" < backup.sql

# Update one env variable — zero code changes
DATABASE_URL="postgresql://user:pass@new-host/db"

# Re-run Prisma to verify
npx prisma db pull
```

### Moving Hosting off Vercel
```
Option A: AWS Amplify     → Connect GitHub repo, auto-detects Next.js
Option B: AWS EC2 / GCP   → Docker container with `next build && next start`
Option C: Any VPS          → Node.js 18+ and `npm run start`
Option D: Cloudflare Pages → @cloudflare/next-on-pages adapter

Steps:
1. Set environment variables on new host
2. Connect GitHub repo or push Docker image
3. Update DNS CNAME for kousik.is-a.dev
4. Done — no code changes needed
```

### Moving Images off Cloudinary
```
Image URLs stored as plain TEXT in database.
Switch upload utility to AWS S3 / GCP Storage / any CDN.
Existing URLs keep working (Cloudinary doesn't delete on free tier).
Optionally: bulk-migrate URLs with a simple script.
```

### Auth (NextAuth) — Fully Portable
```
Sessions stored in YOUR PostgreSQL (Prisma adapter).
Moving hosts = just set NEXTAUTH_URL to new domain.
GitHub OAuth: update callback URL in GitHub app settings.
No data migration needed — it's all in your DB already.
```

---

## 10. Future Enhancements (Post-Launch)

```
□ Visitor analytics dashboard (simple hit counter via DB)
□ Multiple theme templates users can pick from
□ PDF resume auto-generation from experience data
□ Custom CSS injection per user
□ API rate limiting for public endpoints
□ Blog comments (via GitHub Discussions or Giscus)
□ Newsletter signup integration
□ Buy kousik.dev → point to same deployment
□ Spring Boot version of backend (separate showcase repo)
```
