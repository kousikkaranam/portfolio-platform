<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# Portfolio Platform

An AI-powered portfolio generator for developers. Build, customize, and publish stunning portfolio websites — completely free.

> **Live Demo:** [kousikkaranam.is-a.dev](https://kousikkaranam.is-a.dev)

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Third-Party Licenses](#third-party-licenses--acknowledgments)

---

## About

Instead of hardcoding a portfolio every time you want to update it, this platform gives you a **full admin dashboard** to manage your content and an **AI-powered template engine** that generates portfolio designs on demand.

- **Single-user mode:** Deploy your own instance. Manage your entire portfolio from the dashboard — change content, swap designs, publish instantly.
- **Multi-user mode:** Host a platform where anyone can sign in with GitHub, upload a resume (or enter data manually), pick a template, and get a live portfolio at `/[username]`.

---

## Features

### Core
- **GitHub OAuth** — one-click sign in via NextAuth.js
- **Admin Dashboard** — protected routes for managing all portfolio content
- **Public Portfolios** — server-side rendered at `/[username]`
- **Section Management** — toggle visibility and drag-to-reorder any section
- **Dark/Light Theme** — theme toggle on portfolio pages
- **Framer Motion Animations** — smooth scroll transitions

### Content Management
- **Portfolio Settings** — title, tagline, bio, hero image, social links, theme colors
- **Skills** — categorized (Frontend, Backend, Database, etc.) with proficiency levels
- **Experience** — work timeline with dates, descriptions, and tech stack tags
- **Projects** — thumbnails, categories, live/GitHub URLs, featured flag
- **Engineering Highlights** — deep dives and system design case studies
- **Blog** — Markdown posts with tags, read-time estimation, publish status
- **Education & Certifications** — degrees, issuers, credential URLs
- **Custom Sections** — user-defined sections with flexible content
- **Image Uploads** — Cloudinary drag-and-drop integration

### AI-Powered
- **Resume Parser** — upload a PDF, extract structured data via Groq / Claude / Gemini
- **Resume Editor** — edit, store, and compile LaTeX resumes to PDF
- **Resume Export** — download as DOCX
- **Template Engine** — generate custom portfolio HTML/CSS from text prompts
- **Template Gallery** — browse, preview, and manage AI-generated designs

### Integrations
- **GitHub** — display personal and work repositories
- **Cloudinary** — image CDN with on-the-fly transformations
- **texlive.net** — server-side LaTeX to PDF compilation

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | SSR, API routes, file-based routing |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type safety across the stack |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |
| **ORM** | [Prisma 6](https://www.prisma.io/) | Type-safe database access |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless PostgreSQL |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) | GitHub OAuth, session management |
| **Images** | [Cloudinary](https://cloudinary.com/) | Image CDN and transformations |
| **AI** | [Groq](https://groq.com/) / [Claude](https://www.anthropic.com/) / [Gemini](https://ai.google.dev/) | Multi-provider AI (resume parsing, template generation) |
| **PDF** | [unpdf](https://github.com/nicehash/unpdf) + [texlive.net](https://texlive.net/) | PDF extraction + LaTeX compilation |
| **Documents** | [docx](https://github.com/dolanmiu/docx) | DOCX generation |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Scroll animations |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) | In-browser LaTeX/template editing |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) | Blog post rendering |
| **Templating** | [Mustache](https://mustache.github.io/) | Portfolio template variable substitution |

**Monthly hosting cost: $0** — runs entirely on free tiers (Vercel + Neon + Cloudinary).

---

## Getting Started

### Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js** 18+ | Runtime |
| **npm** / yarn / pnpm | Package manager |
| [GitHub OAuth App](https://github.com/settings/developers) | Authentication |
| [Neon](https://neon.tech/) account | PostgreSQL database (free tier) |
| [Cloudinary](https://cloudinary.com/) account | Image hosting (free tier) |
| AI API key | [Groq](https://console.groq.com/) (free, recommended), [Gemini](https://ai.google.dev/), or [Claude](https://console.anthropic.com/) |

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd portfolio-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your credentials (see Environment Variables section)

# 4. Push the database schema
npx prisma db push
npx prisma generate

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
portfolio-platform/
├── prisma/
│   └── schema.prisma                 # 14-table PostgreSQL schema
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # GitHub OAuth handler
│   │   │   ├── upload/               # Cloudinary image upload
│   │   │   ├── chat/[username]/      # AI chatbot per portfolio
│   │   │   └── admin/                # All protected CRUD endpoints
│   │   │       ├── settings/         # Portfolio settings
│   │   │       ├── skills/           # Skills
│   │   │       ├── experience/       # Work experience
│   │   │       ├── projects/         # Projects
│   │   │       ├── engineering/      # Engineering highlights
│   │   │       ├── blog/             # Blog posts
│   │   │       ├── education/        # Education
│   │   │       ├── certifications/   # Certifications
│   │   │       ├── custom-sections/  # Custom sections
│   │   │       ├── sections/         # Section visibility & order
│   │   │       ├── stats/            # Dashboard statistics
│   │   │       ├── import/           # AI resume parser + save
│   │   │       ├── resume/           # Resume CRUD, compile, tailor
│   │   │       └── templates/        # Template CRUD, generate, gallery
│   │   │
│   │   ├── admin/                    # Protected admin dashboard (18 pages)
│   │   ├── login/                    # GitHub OAuth login
│   │   └── [username]/               # Public portfolio (SSR)
│   │       ├── page.tsx              # Portfolio renderer
│   │       └── blog/[postSlug]/      # Individual blog posts
│   │
│   ├── components/
│   │   ├── admin/                    # Admin UI (Sidebar, FormFields, ImageUpload)
│   │   └── public/                   # Public portfolio section components
│   │
│   ├── lib/
│   │   ├── auth.ts                   # NextAuth configuration
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── portfolio.ts              # Portfolio data aggregator
│   │   ├── template-renderer.ts      # Mustache template rendering
│   │   ├── cloudinary.ts             # Cloudinary helpers
│   │   └── utils.ts                  # Shared utilities
│   │
│   ├── templates/
│   │   ├── types.ts                  # PortfolioData TypeScript interface
│   │   └── default/                  # Default portfolio template
│   │       ├── DefaultTemplate.tsx
│   │       ├── components/           # Navbar, ChatWidget, ThemeToggle
│   │       └── sections/             # 12+ renderable sections
│   │
│   └── types/
│       └── next-auth.d.ts            # NextAuth type extensions
│
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── .gitignore
├── LICENSE                           # MIT License
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Database Schema

14 tables across three layers:

```
CORE (NextAuth)
  User  ─  Account  ─  Session  ─  VerificationToken

PORTFOLIO CONTENT
  PortfolioSettings    Skill              Experience
  Project              EngineeringHighlight    BlogPost
  Education            Certification

ADVANCED FEATURES
  Resume               CustomTemplate     CustomSection
  SectionVisibility
```

Key design decisions:
- All content tables **cascade-delete** on user removal
- Unique constraints on slug fields (no duplicate URLs)
- PostgreSQL arrays for tech stacks and tags
- JSON fields for complex structures (social links, section order)
- `displayOrder` fields for drag-and-drop reordering

Full schema: [`prisma/schema.prisma`](prisma/schema.prisma)

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Admin UI    │────▶│  API Routes  │────▶│ Neon PostgreSQL│
│  (React)     │◀────│  (Next.js)   │◀────│ (via Prisma)   │
└─────────────┘     └──────┬───────┘     └───────────────┘
                           │
                   ┌───────┼───────┐
                   │       │       │
              Cloudinary  Groq   texlive.net
              (images)   Claude   (LaTeX→PDF)
                         Gemini

┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Visitor     │────▶│ /[username]  │────▶│ Neon PostgreSQL│
│  Browser     │◀────│  SSR page    │◀────│ (read-only)    │
└─────────────┘     └──────────────┘     └───────────────┘
```

### Auth Flow

```
Sign in with GitHub
  → NextAuth redirects to GitHub OAuth
  → User authorizes → GitHub returns access_token
  → NextAuth creates User + Account in DB
  → Auto-creates PortfolioSettings + SectionVisibility
  → Session cookie set → redirect to /admin
```

### Route Protection

All `/admin/*` and `/api/admin/*` routes validate the session server-side:

```ts
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## API Reference

All `/api/admin/*` endpoints require authentication via session cookie.

### Content CRUD

| Method | Endpoint | Description |
|---|---|---|
| `GET` `PUT` | `/api/admin/settings` | Portfolio settings |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/skills` | Skills |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/experience` | Work experience |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/projects` | Projects |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/engineering` | Engineering highlights |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/blog` | Blog posts |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/education` | Education |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/certifications` | Certifications |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/custom-sections` | Custom sections |
| `GET` `PUT` | `/api/admin/sections` | Section visibility & order |

### AI & Resume

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/import/resume` | Parse PDF resume via AI → structured JSON |
| `POST` | `/api/admin/import/save` | Persist parsed resume data to DB |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/resume` | Resume CRUD |
| `POST` | `/api/admin/resume/compile` | Compile LaTeX → PDF via texlive.net |
| `POST` | `/api/admin/resume/tailor` | AI-tailored resume variant |

### Templates & Utilities

| Method | Endpoint | Description |
|---|---|---|
| `GET` `POST` | `/api/admin/templates` | Template CRUD |
| `POST` | `/api/admin/templates/generate` | AI-powered template generation |
| `GET` | `/api/admin/templates/gallery` | Browse template gallery |
| `GET` | `/api/admin/templates/preview` | Preview a template |
| `GET` | `/api/admin/templates/detail` | Template detail view |
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `POST` | `/api/upload` | Upload image to Cloudinary |
| `POST` | `/api/chat/[username]` | AI chatbot (per portfolio) |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string |
| `DIRECT_URL` | Yes | Neon direct connection (for migrations) |
| `NEXTAUTH_URL` | Yes | App URL (`http://localhost:3000` for local) |
| `NEXTAUTH_SECRET` | Yes | Random secret — generate with `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `GITHUB_TOKEN` | No | GitHub PAT — avoids API rate limits for GitHub section |
| `PORTFOLIO_OWNER_SLUG` | No | Username to redirect `/` to (single-user mode) |
| `AI_PROVIDER` | No | `groq` (default) / `gemini` / `anthropic` |
| `GROQ_API_KEY` | No | [Groq](https://console.groq.com/) API key (free, recommended) |
| `GEMINI_API_KEY` | No | Google Gemini API key |
| `ANTHROPIC_API_KEY` | No | Anthropic Claude API key |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

> **Note:** Never commit `.env` or `.env.local` to version control. Only `.env.example` (with empty values) should be committed.

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Then set all environment variables in **Vercel Dashboard > Settings > Environment Variables**.

### Self-Hosting

Any platform that supports Node.js 18+ and Next.js:

```bash
npm run build
npm run start
```

Ensure `DATABASE_URL`, `NEXTAUTH_URL`, and all required environment variables are set in your hosting environment.

### Recommended Free-Tier Stack

| Service | Purpose | Free Tier |
|---|---|---|
| [Vercel](https://vercel.com/) | Hosting | Generous free tier |
| [Neon](https://neon.tech/) | PostgreSQL | 0.5 GB storage |
| [Cloudinary](https://cloudinary.com/) | Images | 25 GB bandwidth/month |
| [Groq](https://groq.com/) | AI API | Free tier available |
| [is-a.dev](https://is-a.dev/) | Domain | Free `.is-a.dev` subdomain |

**Total monthly cost: $0**

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma studio` | Open database GUI |
| `npx tsx prisma/seed.ts` | Seed the database |

---

## Security

- All admin routes are protected by server-side session validation
- OAuth tokens are managed by NextAuth.js (never exposed to client)
- Environment variables containing secrets (API keys, DB credentials) must never be committed
- All user content is scoped by `userId` — users can only access their own data
- Cloudinary uploads are server-side (API secret never reaches the client)
- Input from AI providers is treated as untrusted (parsed and validated before storage)

If you discover a security vulnerability, please report it privately rather than opening a public issue.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch 🚀 (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code:
- ✅ Follows existing patterns and conventions
- ✅ Passes `npm run lint`
- ✅ Does not introduce security vulnerabilities
- ✅ Includes descriptive commit messages

---

## License

Copyright (c) 2025 Kousik Karanam.

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Kousik Karanam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Third-Party Licenses & Acknowledgments

This project incorporates the following open-source software:

| Package | License | Copyright |
|---|---|---|
| [Next.js](https://nextjs.org/) | MIT | Vercel, Inc. |
| [React](https://react.dev/) | MIT | Meta Platforms, Inc. |
| [Tailwind CSS](https://tailwindcss.com/) | MIT | Tailwind Labs, Inc. |
| [Prisma](https://www.prisma.io/) | Apache-2.0 | Prisma Data, Inc. |
| [NextAuth.js](https://next-auth.js.org/) | ISC | Balazs Orban & contributors |
| [Framer Motion](https://www.framer.com/motion/) | MIT | Framer B.V. |
| [Lucide React](https://lucide.dev/) | ISC | Lucide contributors |
| [Cloudinary SDK](https://cloudinary.com/) | MIT | Cloudinary, Ltd. |
| [Groq SDK](https://groq.com/) | Apache-2.0 | Groq, Inc. |
| [Anthropic SDK](https://www.anthropic.com/) | MIT | Anthropic, PBC |
| [Google Generative AI](https://ai.google.dev/) | Apache-2.0 | Google LLC |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | MIT | Microsoft Corporation |
| [react-markdown](https://github.com/remarkjs/react-markdown) | MIT | Titus Wormer |
| [Mustache.js](https://mustache.github.io/) | MIT | Jan Lehnardt & contributors |
| [docx](https://github.com/dolanmiu/docx) | MIT | Dolan Miu |
| [unpdf](https://github.com/unjs/unpdf) | MIT | unjs contributors |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | MIT | Modood Alvi |
| [react-easy-crop](https://github.com/ValentinH/react-easy-crop) | MIT | Valentin Hervieu |
| [TypeScript](https://www.typescriptlang.org/) | Apache-2.0 | Microsoft Corporation |
| [ESLint](https://eslint.org/) | MIT | OpenJS Foundation |

Full license texts for all dependencies are available in their respective `node_modules/<package>/LICENSE` files.

### Services

| Service | Usage |
|---|---|
| [Neon](https://neon.tech/) | Serverless PostgreSQL hosting |
| [Vercel](https://vercel.com/) | Application hosting and deployment |
| [Cloudinary](https://cloudinary.com/) | Image CDN and transformations |
| [texlive.net](https://texlive.net/) | LaTeX compilation API |
| [is-a.dev](https://is-a.dev/) | Free developer subdomains |

---

<p align="center">
  Built by <a href="kousikkaranam.is-a.dev">Kousik Karanam</a>
  <br />
  <sub>Copyright &copy; 2025 Kousik Karanam. All rights reserved.</sub>
</p>
