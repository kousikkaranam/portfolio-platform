# Portfolio Platform

A dynamic, AI-powered portfolio generator where developers can build, customize, and publish stunning portfolio websites — completely free.

> **Live:** [kousik.is-a.dev](https://kousik.is-a.dev)  
> **Status:** Active Development  
> **License:** MIT

---

## What is this?

Instead of hardcoding a portfolio every time you want to update it, this platform gives you a **full admin dashboard** to manage your content and an **AI-powered template engine** that generates portfolio designs on demand. Think of it as a free, open-source alternative to Carrd or Super.so — built specifically for developers.

**For a single user:** Manage your entire portfolio from a dashboard. Change content, swap designs, publish instantly.

**For multiple users:** Anyone can sign in with GitHub, fill in their data (or upload a resume), pick a template, and get a live portfolio — all on the same deployment.

---

## Features

### Built
- [x] GitHub OAuth authentication (NextAuth)
- [x] Admin dashboard with protected routes
- [x] Portfolio settings (title, tagline, bio, social links, theme, accent color)
- [x] Skills management with categories and proficiency levels
- [x] Experience timeline with tech stack tags
- [x] Projects with thumbnails, categories, live/GitHub URLs
- [x] Engineering highlights (deep dives, system design case studies)
- [x] Blog with Markdown content, tags, read-time estimation
- [x] Education and certifications management
- [x] Section visibility toggles and drag-to-reorder
- [x] Cloudinary image uploads (drag & drop)
- [x] Public portfolio rendering at /[username]

### Planned
- [ ] AI resume parser (upload PDF → instant portfolio)
- [ ] LinkedIn PDF import
- [ ] AI template engine (describe or import any design)
- [ ] AI chatbot on every portfolio (answers visitor questions)
- [ ] Static export + GitHub Pages publishing (free hosting per user)
- [ ] Custom domain support
- [ ] Template marketplace (users share AI-generated designs)
- [ ] Light/dark theme toggle on portfolios
- [ ] Framer Motion animations
- [ ] Download resume button
- [ ] Analytics dashboard

---

## Tech Stack

| Layer          | Technology                       | Why                                    |
|----------------|----------------------------------|----------------------------------------|
| Framework      | Next.js 14 (App Router)          | SSR, API routes, file-based routing    |
| Language       | TypeScript                       | Type safety across the stack           |
| Styling        | Tailwind CSS                     | Rapid UI development                   |
| ORM            | Prisma 6                         | Type-safe database access              |
| Database       | Neon PostgreSQL (serverless)     | Free tier, serverless, branch-able     |
| Auth           | NextAuth.js (GitHub OAuth)       | Free, session-based, GitHub login      |
| Image Storage  | Cloudinary                       | Free 25GB bandwidth/month              |
| Hosting        | Vercel                           | Free tier, edge functions, auto-deploy |
| Domain         | is-a.dev (GitHub subdomain)      | Free developer subdomain               |
| AI (planned)   | Claude API / Groq (Llama 3)     | Resume parsing, chatbot, template gen  |

**Monthly cost: ₹0**

---

## Database Schema

10 tables powering the entire platform:

```
┌──────────────────────────────────────────────────────────────┐
│                        CORE                                  │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐       │
│  │  users   │  │ accounts │  │     sessions         │       │
│  │          │──│ (OAuth)  │  │  (NextAuth managed)  │       │
│  └────┬─────┘  └──────────┘  └─────────────────────┘       │
│       │                                                      │
│       │ one-to-one / one-to-many                             │
│       ▼                                                      │
│  ┌──────────────────┐  ┌────────────┐  ┌──────────────┐    │
│  │portfolio_settings │  │   skills   │  │ experiences  │    │
│  │(theme, bio, URLs) │  │(categorized│  │(timeline)    │    │
│  └──────────────────┘  └────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────┐  ┌────────────────────┐  ┌──────────────┐    │
│  │ projects │  │engineering_highlights│ │  blog_posts  │    │
│  │(showcase)│  │(deep dives)         │  │(markdown)    │    │
│  └──────────┘  └────────────────────┘  └──────────────┘    │
│                                                              │
│  ┌───────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ education │  │ certifications │  │section_visibility │   │
│  └───────────┘  └────────────────┘  │(toggle + reorder) │   │
│                                      └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

Full schema: [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## Project Structure

```
portfolio-platform/
├── prisma/
│   └── schema.prisma              # Database schema (10 tables)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   │   ├── upload/route.ts               # Cloudinary upload
│   │   │   └── admin/
│   │   │       ├── settings/route.ts         # Portfolio settings CRUD
│   │   │       ├── skills/route.ts           # Skills CRUD
│   │   │       ├── experience/route.ts       # Experience CRUD
│   │   │       ├── projects/route.ts         # Projects CRUD
│   │   │       ├── engineering/route.ts      # Engineering highlights CRUD
│   │   │       ├── blog/route.ts             # Blog posts CRUD
│   │   │       ├── education/route.ts        # Education CRUD
│   │   │       ├── certifications/route.ts   # Certifications CRUD
│   │   │       └── sections/route.ts         # Section visibility CRUD
│   │   │
│   │   ├── admin/                 # Protected admin dashboard
│   │   │   ├── layout.tsx         # Admin layout with sidebar
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── settings/page.tsx
│   │   │   ├── skills/page.tsx
│   │   │   ├── experience/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   ├── engineering/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── education/page.tsx
│   │   │   ├── certifications/page.tsx
│   │   │   └── sections/page.tsx
│   │   │
│   │   └── [username]/            # Public portfolio (dynamic route)
│   │       └── page.tsx
│   │
│   ├── components/
│   │   └── admin/
│   │       └── ImageUpload.tsx    # Reusable Cloudinary upload
│   │
│   ├── lib/
│   │   ├── auth.ts               # NextAuth configuration
│   │   └── prisma.ts             # Prisma client singleton
│   │
│   └── templates/                 # Portfolio templates (future)
│       ├── types.ts               # PortfolioData contract
│       ├── registry.ts            # Template registry
│       └── default/               # Fallback template
│
├── public/
├── .env                           # Environment variables (not committed)
├── .env.example                   # Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub OAuth app (for authentication)
- Neon PostgreSQL account (free)
- Cloudinary account (free)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/portfolio-platform.git
cd portfolio-platform
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/portfolio?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/portfolio?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# GitHub OAuth
GITHUB_ID="your_github_oauth_app_id"
GITHUB_SECRET="your_github_oauth_app_secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 3. Set up the database

```bash
npx prisma db push
npx prisma generate
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard → Settings → Environment Variables.

---

## Architecture

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Admin UI   │────▶│  API Routes  │────▶│  Neon Postgres│
│  (React)     │◀────│  (Next.js)   │◀────│  (via Prisma) │
└─────────────┘     └──────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │  Cloudinary  │
                    │  (images)    │
                    └─────────────┘

┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Visitor     │────▶│  /[username] │────▶│  Neon Postgres│
│  Browser     │◀────│  SSR page    │◀────│  (read-only)  │
└─────────────┘     └──────────────┘     └──────────────┘
```

### Auth Flow

```
User clicks "Sign in with GitHub"
  → NextAuth redirects to GitHub OAuth
  → User authorizes
  → GitHub returns access_token
  → NextAuth creates User + Account in DB
  → Session cookie set
  → User redirected to /admin
```

### Admin Route Protection

All `/admin/*` routes and `/api/admin/*` endpoints check for a valid session:

```tsx
const session = await getServerSession(authOptions);
if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### Image Upload Flow

```
User drags image → ImageUpload component
  → FormData POST to /api/upload
  → Server converts to buffer
  → cloudinary.uploader.upload_stream()
  → Returns { url, publicId, width, height }
  → URL stored in the relevant Prisma model
```

---

## API Reference

All admin endpoints require authentication via session cookie.

| Method   | Endpoint                      | Description                    |
|----------|-------------------------------|--------------------------------|
| `GET`    | `/api/admin/settings`         | Get portfolio settings         |
| `PUT`    | `/api/admin/settings`         | Update portfolio settings      |
| `GET`    | `/api/admin/skills`           | List all skills                |
| `POST`   | `/api/admin/skills`           | Create a skill                 |
| `PUT`    | `/api/admin/skills`           | Update a skill                 |
| `DELETE` | `/api/admin/skills?id=xxx`    | Delete a skill                 |
| `GET`    | `/api/admin/experience`       | List all experiences           |
| `POST`   | `/api/admin/experience`       | Create an experience           |
| `PUT`    | `/api/admin/experience`       | Update an experience           |
| `DELETE` | `/api/admin/experience?id=xxx`| Delete an experience           |
| `GET`    | `/api/admin/projects`         | List all projects              |
| `POST`   | `/api/admin/projects`         | Create a project               |
| `PUT`    | `/api/admin/projects`         | Update a project               |
| `DELETE` | `/api/admin/projects?id=xxx`  | Delete a project               |
| `GET`    | `/api/admin/engineering`      | List engineering highlights    |
| `POST`   | `/api/admin/engineering`      | Create a highlight             |
| `PUT`    | `/api/admin/engineering`      | Update a highlight             |
| `DELETE` | `/api/admin/engineering?id=xxx`| Delete a highlight            |
| `GET`    | `/api/admin/blog`             | List all blog posts            |
| `POST`   | `/api/admin/blog`             | Create a blog post             |
| `PUT`    | `/api/admin/blog`             | Update a blog post             |
| `DELETE` | `/api/admin/blog?id=xxx`      | Delete a blog post             |
| `GET`    | `/api/admin/education`        | List education entries         |
| `POST`   | `/api/admin/education`        | Create an entry                |
| `PUT`    | `/api/admin/education`        | Update an entry                |
| `DELETE` | `/api/admin/education?id=xxx` | Delete an entry                |
| `GET`    | `/api/admin/certifications`   | List certifications            |
| `POST`   | `/api/admin/certifications`   | Create a certification         |
| `PUT`    | `/api/admin/certifications`   | Update a certification         |
| `DELETE` | `/api/admin/certifications?id=xxx`| Delete a certification     |
| `GET`    | `/api/admin/sections`         | Get section visibility         |
| `PUT`    | `/api/admin/sections`         | Update visibility & order      |
| `POST`   | `/api/upload`                 | Upload image to Cloudinary     |

---

## Roadmap

### Phase 1 — Foundation ✅
> Auth, database, admin dashboard core

- [x] Project scaffolding (Next.js 14 + TypeScript + Tailwind)
- [x] Neon PostgreSQL + Prisma 6 setup
- [x] NextAuth with GitHub OAuth
- [x] Portfolio settings admin page
- [x] Skills CRUD with categories
- [x] Experience CRUD with timeline

### Phase 2 — Content Management 🔧
> Complete admin dashboard with all content types

- [x] Prisma schema for all 10 tables
- [ ] Projects admin page + API
- [ ] Engineering highlights admin page + API
- [ ] Blog admin page + API (Markdown editor)
- [ ] Education admin page + API
- [ ] Certifications admin page + API
- [ ] Sections visibility & reorder admin page + API
- [ ] Cloudinary image upload integration
- [ ] Admin sidebar navigation update

### Phase 3 — Public Portfolio 🔜
> Render portfolios from database

- [ ] Dynamic public route /[username]
- [ ] Default portfolio template
- [ ] SEO meta tags (Open Graph, Twitter cards)
- [ ] Responsive design (mobile-first)
- [ ] Section ordering from SectionVisibility

### Phase 4 — AI Resume Import 🔜
> Upload a PDF, get a portfolio instantly

- [ ] PDF upload + text extraction (pdf-parse)
- [ ] Claude API structured extraction prompt
- [ ] JSON → Prisma bulk insert pipeline
- [ ] LinkedIn PDF variant parsing
- [ ] "Review & Edit" step before saving
- [ ] Progress indicator during processing

### Phase 5 — AI Template Engine 🔜
> Generate unlimited portfolio designs

- [ ] PortfolioData contract (shared interface)
- [ ] Template storage model (CustomTemplate table)
- [ ] "Import from URL" — fetch page + Claude converts to template
- [ ] "Describe your template" — text prompt to HTML+CSS
- [ ] Template preview (sandboxed rendering)
- [ ] Template picker in admin settings
- [ ] One default fallback template

### Phase 6 — AI Chatbot 🔜
> Every portfolio gets a conversational assistant

- [ ] Chat API route (Groq free tier / Llama 3)
- [ ] Floating chat widget component
- [ ] Portfolio data injection as context
- [ ] Rate limiting (50 messages/day per portfolio)
- [ ] Response caching for common questions

### Phase 7 — Publishing Pipeline 🔜
> One-click publish to free hosting

- [ ] Static HTML export generator
- [ ] GitHub API integration (push to user's repo)
- [ ] GitHub Pages auto-deployment
- [ ] Custom domain CNAME setup
- [ ] "Publish" button in admin dashboard
- [ ] Publish status tracking

### Phase 8 — Polish 🔜
> Production-ready quality

- [ ] Light/dark theme toggle on portfolios
- [ ] Framer Motion scroll animations
- [ ] Download resume button (auto-generated PDF)
- [ ] Analytics dashboard (page views, visitors)
- [ ] Template marketplace (share/discover designs)
- [ ] Multi-language support (i18n)
- [ ] PWA support
- [ ] Lighthouse 90+ score

---

## Environment Variables

| Variable                | Required | Description                      |
|-------------------------|----------|----------------------------------|
| `DATABASE_URL`          | Yes      | Neon PostgreSQL connection string |
| `DIRECT_URL`            | Yes      | Neon direct connection (migrations)|
| `NEXTAUTH_URL`          | Yes      | App URL (http://localhost:3000)  |
| `NEXTAUTH_SECRET`       | Yes      | Random 32-char secret            |
| `GITHUB_ID`             | Yes      | GitHub OAuth App client ID       |
| `GITHUB_SECRET`         | Yes      | GitHub OAuth App client secret   |
| `CLOUDINARY_CLOUD_NAME` | Yes      | Cloudinary cloud name            |
| `CLOUDINARY_API_KEY`    | Yes      | Cloudinary API key               |
| `CLOUDINARY_API_SECRET` | Yes      | Cloudinary API secret            |
| `GROQ_API_KEY`          | No       | Groq API key (for AI chatbot)    |
| `ANTHROPIC_API_KEY`     | No       | Claude API key (for AI features) |

---

## Contributing

This is currently a personal project, but contributions are welcome once the core is stable.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT — do whatever you want with it.

---

Built by [Kousik Karanam](https://kousikkaranam.is-a.dev) with Next.js, Prisma, and a lot of coffee.