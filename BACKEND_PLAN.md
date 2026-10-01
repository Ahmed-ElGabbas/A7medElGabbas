# Portfolio Backend & Admin Panel — Architecture Plan

**Status:** Approved for planning purposes. Not yet implemented. Build starts only after explicit go-ahead on this document.

**Stack decision summary:** NestJS + PostgreSQL + Prisma, Cloudflare R2 for file storage, JWT single-admin auth, hosted on Railway (backend + DB) alongside the existing Vercel-hosted Next.js frontend.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Phase 1 — Current Codebase Findings](#2-phase-1--current-codebase-findings)
3. [Database Design](#3-database-design)
4. [API Design (NestJS)](#4-api-design-nestjs)
5. [Admin Panel (Frontend)](#5-admin-panel-frontend)
6. [Frontend Integration & Migration](#6-frontend-integration--migration)
7. [Hosting & Deployment](#7-hosting--deployment)
8. [Staged Build Plan](#8-staged-build-plan)
9. [Approved Decisions Log](#9-approved-decisions-log)

---

## 1. Overview

The goal is to replace the current hardcoded content source (`src/data/portfolio.ts`) with a full custom backend and admin panel, so every section of the portfolio — Hero, About, Skills, Experience, Projects, Certificates, Contact, Footer, and site/navigation config — can be edited through a dashboard without touching code.

Scope is intentionally limited to **what is actually implemented in the live site today**. Some previously-discussed frontend concepts (tech-orbit tags, a radar chart, roadmap steps, identity chips, a command palette) are **not** present in the current codebase and are **out of scope** for this backend. If any of those are built into the frontend later, they'd get their own schema/admin additions as a separate follow-up project.

---

## 2. Phase 1 — Current Codebase Findings

### 2.1 Current architecture

`src/data/portfolio.ts` (518 lines) is the single source of truth for all content. Every file under `src/constants/*.ts` and `src/config/site.ts` is a pass-through re-export of that file and adds no independent value — these can be deleted once components fetch from the new API. The site is a single page (`src/app/page.tsx`) that statically composes `Header → Hero → About → Skills → Experience → Projects → Certificates → Contact → Footer`.

### 2.2 Content-type inventory

| Section | Current data shape | Notes |
|---|---|---|
| **Site config** | `personalInfo` (name, title, meta description, photo, resume path, location, status, headline, rotating `roles[]`), `socialLinks` (email/phone/github/linkedin/twitter/facebook) | Used throughout via `siteConfig`/`personalInfo` |
| **Navigation** | `navItems`: `{label, href}[]`, anchor-based (`#about`, etc.) | Tied to section IDs on the single page |
| **Hero stats** | `stats`: `{value, label}[]` (4 items) | Rendered in both Hero and About |
| **About** | `aboutData`: subtitle, narrative title, `paragraphs[]`, `highlights[]`, `quickFacts[]` (label/value/detail), `academicFocus` | No radar chart / roadmap / identity chips exist in the component — it's a two-column bio + quick-facts layout. `ABOUT_SPEC.md` describes an aspirational redesign not fully built |
| **Skills** | `skillCategories[]` (title, icon key, `skills: string[]`), `skillSpotlights` (per-category summary/patterns/primary project), `philosophyQuote`, `tickerSkills[]` | No numeric proficiency scores — skills are tag lists only |
| **Experience** | `experiences[]`: role, company, period, description, `technologies[]` | Text-only timeline |
| **Education** | `education[]`: degree, institution, period, description, gpa, `courses[]`; plus `futureGoals` (title, description, items[]) | `futureGoals` renders at the bottom of the Experience section |
| **Projects** | `projects[]`: title, description, `technologies[]`, category, `featured: boolean` | **No images, no GitHub/demo links today** — new fields, not a direct migration |
| **Certificates** | `certificates[]`: id, title, issuer, issueDate, credentialId, credentialUrl?, category (fixed 4-value enum), `skills[]`, badgeText, description, featured?, previewImage?, file?; plus `certificateStats[]` and `issuingOrganizations[]` | Files live in `/public/assets/certificates/*`. `CertificateModal.tsx` renders PDFs via `react-pdf`, or falls back to an image based on file extension |
| **Contact** | **No backing data model.** `handleSubmit` in `contact.tsx` just fakes a delay and a success state — nothing is sent or stored | Fully net-new build, not a migration |
| **Footer** | Reuses `siteConfig`/`navItems` plus a hardcoded tagline | |

### 2.3 Design system

CSS-variable based (Tailwind v4 `@theme inline`), light/dark themes toggled via a `.dark`/`.light` class on `<html>` and persisted to `localStorage`. Gold accent palette (`--color-accent-gold` family), `.glass-card`, `.gold-text`, `.gold-glow` utility classes, `CascadiaCode` monospace font used for both display and body text. The admin panel will reuse these tokens directly rather than introduce a separate look.

### 2.4 Cleanup notes

- `@react-three/fiber`, `@react-three/drei`, `three`, and `gsap` are listed as dependencies but are never imported anywhere in `src/` — dead weight, unrelated to this backend work but worth pruning eventually.
- The `src/constants/*` re-export layer becomes dead code once sections fetch from the API.

---

## 3. Database Design

**Database:** PostgreSQL.

**ORM:** Prisma (approved) — better migration ergonomics and TypeScript inference for a solo-maintained NestJS project than TypeORM, integrated via a shared `PrismaService`.

### 3.1 Schema

| Table | Shape | Notes |
|---|---|---|
| `site_config` | singleton: name, title, meta description, headline, photo URL, resume file URL, location, status, status subtext, `roles: text[]` | |
| `social_links` | singleton: email, phone, github, linkedin, twitter, facebook | |
| `nav_items` | id, label, href/anchor, `order` | |
| `stats` | id, value, label, `order` | shared by Hero + About |
| `about_content` | singleton: section subtitle, narrative title, `paragraphs: text[]`, `highlights: text[]`, academic focus title/description | |
| `quick_facts` | id, label, value, detail, icon key, `order`, FK → `about_content` | |
| `skill_categories` | id, title, icon key, `order` | |
| `skills` | id, name, `order`, FK → `skill_categories` | |
| `skill_spotlights` | id, summary, `patterns: text[]`, primary_project, FK → `skill_categories` (1:1) | |
| `philosophy_quote` | singleton: quote, author | |
| `ticker_skills` | id, label, `order` | |
| `experiences` | id, role, company, period, description, `technologies: text[]`, `order` | |
| `education` | id, degree, institution, period, description, gpa, `courses: text[]`, `order` | |
| `future_goals` | singleton: title, description, `items: text[]` | |
| `projects` | id, title, description, `technologies: text[]`, category, featured (bool), `order`, **image_url**, **github_url**, **demo_url** | last 3 fields are new, not in current data |
| `certificates` | id, title, issuer, issue_date, credential_id, credential_url, category, `skills: text[]`, badge_text, description, featured, preview_image_url, file_url, `order` | |
| `certificate_stats` | id, value, label, desc, `order` | |
| `issuing_organizations` | id, name, `order` | |
| `contact_submissions` | id, name, email, subject, message, ip_hash, user_agent, created_at, read (bool) | see [§4.4](#44-contact--notification-flow-new-requirement-2) |
| `admin_users` | id, email, password_hash, created_at | see [§4.3](#43-authentication--the-admin-login-flow-new-requirement-1) — no plaintext credentials ever stored |
| `media_assets` *(optional, recommended)* | id, url, kind (image/pdf), original_filename, size, created_at | central registry so the admin can reuse previously uploaded files |

Singleton tables (`site_config`, `about_content`, `philosophy_quote`, `future_goals`) are modeled as single-row tables (`id = 1`) rather than a generic key-value/JSON config blob — simpler to type and validate. Every repeated/orderable list carries an explicit `order` integer column so admin drag-and-drop reordering maps directly to a DB update.

### 3.2 File storage

| Option | Pros | Cons |
|---|---|---|
| **Cloudflare R2 (approved)** | Permanent free tier (10GB, no egress fees), one S3-compatible SDK for both images and PDFs, files survive redeploys | One more account/credential to manage |
| Cloudinary | Generous free tier, automatic image optimization | Less suited to PDFs |
| Local disk on the backend host | Simplest to code | **Not viable** — Railway/Render/Fly.io hobby tiers have ephemeral filesystems; files vanish on redeploy |

All media (project screenshots, certificate previews/PDFs, resume PDF, profile photo) goes to R2.

---

## 4. API Design (NestJS)

### 4.1 Module structure

One module per content area: `SiteConfigModule`, `NavModule`, `HeroModule` (stats), `AboutModule`, `SkillsModule`, `ExperienceModule`, `ProjectsModule`, `CertificatesModule`, `ContactModule`, `NotificationsModule`, `MediaModule`, `AuthModule`. Each content module follows the same shape: `*.controller.ts`, `*.service.ts`, `*.module.ts`, DTOs for create/update.

### 4.2 Endpoint pattern

**REST, not GraphQL** — the data is shallow and section-scoped with no complex cross-entity client-side querying need; REST endpoints are simpler to secure and cache per-route.

Per list-type module (e.g. Projects):

| Method | Route | Access |
|---|---|---|
| GET | `/projects` | Public |
| GET | `/projects/:id` | Public |
| POST | `/projects` | Admin |
| PATCH | `/projects/:id` | Admin |
| DELETE | `/projects/:id` | Admin |
| PATCH | `/projects/reorder` | Admin — accepts an ordered array of IDs |

Singleton config modules (site-config, about-content, philosophy-quote, future-goals) expose only `GET` (public) + `PATCH` (admin) — there's always exactly one row, so no create/delete.

Validation: `class-validator` + `class-transformer` DTOs on every write endpoint, Nest's `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`, a global exception filter for consistent error JSON, and Nest's built-in `Logger` for server-side error tracking.

### 4.3 Authentication & the admin login flow *(New Requirement 1)*

**Login route:** `POST /auth/login` — accepts email + password, verifies against the bcrypt hash in `admin_users`, returns a short-lived JWT (~1 hour) plus a refresh token (~7 days, httpOnly cookie). A NestJS `AuthGuard` protects every write endpoint across every module above.

**Standalone `/admin` frontend route:**
- `/admin` in the Next.js app renders **only a login form** (email + password) when there is no valid session — no shared `Header`/`Footer`/public nav, a completely separate layout from the rest of the site (its own `layout.tsx` under `src/app/admin/`).
- On successful login, redirect to `/admin/dashboard`. Everything else already planned (per-section managers, the contact inbox, etc.) lives under `/admin/*` and is gated behind this auth check — via a layout-level session check that redirects unauthenticated requests back to `/admin`.

**Credential handling — no plaintext anywhere:**
- The `admin_users` table stores only a **bcrypt-hashed** password; the plaintext password is never persisted, logged, or committed.
- A **one-time seed script** (`prisma/seed.ts` or similar) reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from a local `.env` file (git-ignored, never committed), hashes the password with bcrypt at seed time, and inserts the row into `admin_users`. The real email/password values are supplied by you, locally, when you run the seed — they are never written into this document, into any file in the repository, or into any code this plan leads to.
- Ongoing login simply compares the submitted password against the stored hash — standard bcrypt practice, HTTPS in transit, no plaintext storage anywhere at rest.

**Keeping `/admin` out of public reach:**
- Excluded from `navItems`/the public nav entirely (it's not content, it's a separate app area).
- `robots.txt` gets a `Disallow: /admin` rule.
- The `/admin` layout sets `<meta name="robots" content="noindex, nofollow">` (via Next.js `metadata` export) on every route under `/admin`, so even if a crawler reaches it, it won't be indexed.
- `/admin` is also omitted from the sitemap generation.

### 4.4 Contact & notification flow *(New Requirement 2)*

**Storage (as already planned):**

| Method | Route | Access |
|---|---|---|
| POST | `/contact` | Public, rate-limited |
| GET | `/contact/submissions` | Admin — inbox list |
| PATCH | `/contact/submissions/:id/read` | Admin — mark as read |

Every real submission from the live Contact section is validated, stored in `contact_submissions`, and visible in the admin inbox exactly as originally planned.

**Rate limiting / spam prevention** (unchanged from the original plan): `@nestjs/throttler` (e.g. 3 submissions per IP per 15 minutes), a honeypot field bots tend to fill but the real form never shows, and server-side length caps on all fields regardless of client-side validation.

**Email notification on new submission (new):**
- **Service: Resend.** It has a clean Node/NestJS SDK, a solid free tier (sufficient for a personal portfolio's contact volume), and good deliverability out of the box — my recommendation over alternatives like SendGrid or Postmark for a project this size, mainly for the simpler setup and free-tier fit.
- A small `NotificationsModule` (or a `ContactService` method calling into a dedicated `EmailService`) is invoked immediately **after** a submission is successfully written to `contact_submissions`.
- The recipient address comes from `ADMIN_NOTIFICATION_EMAIL`, an environment variable set at deploy time — never hardcoded in code or in this document.
- **Email content:** submitted name, email, subject, and message, plus a direct link to that submission in the admin inbox (e.g. `https://<your-admin-domain>/admin/contact?submission=<id>`).
- **Non-blocking, fail-safe:** the `POST /contact` response to the public form is returned as soon as the DB write succeeds — the email send happens asynchronously (fire-and-forget within the request lifecycle, or queued) and **never blocks or fails the HTTP response**. If Resend errors or times out, the failure is caught and logged server-side (`Logger.error`), but the submission remains saved and the visitor still sees a successful confirmation.

---

## 5. Admin Panel (Frontend)

**Location:** a protected `/admin` route inside the same Next.js app (not a separate app) — full reuse of design tokens/CSS/fonts, one Vercel deploy target, no cross-origin auth complexity. `/admin` code-splits naturally as its own route, so it doesn't bloat the public site's bundle.

**Visual language:** reuses `globals.css` as-is — `.glass-card`, `.gold-text`, the existing CSS variable palette, CascadiaCode font — so the admin reads as a natural extension of the site's terminal/engineering aesthetic rather than a generic admin template.

**Structure:**
- **`/admin`** — standalone login page only (see §4.3), no shared chrome from the public site.
- **`/admin/dashboard`** — overview: counts per section, recent unread contact submissions, last-edited timestamps, a "view live site" shortcut.
- **One manager view per section** — `/admin/projects`, `/admin/certificates`, `/admin/skills`, `/admin/experience`, `/admin/about`, `/admin/hero`, `/admin/site-config` — list + add/edit/delete for list-type content, a single form for singleton content.
- **`/admin/contact`** — inbox table of submissions, unread badge, mark-as-read. Replying happens from your own email client — an in-app reply composer is out of scope.

**Reordering:** drag-and-drop (`@dnd-kit/sortable`) for Projects, Skills (categories and skills-within-category), Certificates, Experience, Education, and Nav items. On drop, the new ordered ID array is sent to the relevant `*/reorder` endpoint, updating the `order` column for all affected rows in one transaction.

**File uploads:** drag-and-drop dropzone (`react-dropzone`) with a client-side preview before save. On submit, the file uploads directly to R2 via a short-lived presigned URL issued by `POST /media/presign`, and the resulting public URL is saved on the entity — large file bytes never route through the NestJS server itself.

---

## 6. Frontend Integration & Migration

**Fetching pattern:** Next.js **Server Components fetching at request time** for all sections — appropriate for a low-traffic personal site, guarantees the live site reflects admin edits immediately, and avoids building cache-invalidation logic up front. ISR with on-save revalidation (`revalidatePath`/`revalidateTag`) is a clean upgrade path later if traffic ever justifies it, but isn't needed at launch.

**Seed migration:** a one-time `seed.ts` script imports the existing object literals from `src/data/portfolio.ts` and inserts them as rows in the new tables, preserving current order as the `order` column. Runs once against the new database before cutover — nothing existing is lost.

**Safe cutover, section by section:**
1. Stand up the backend + seeded DB, fully independent of the live site.
2. Build and test the admin panel against it.
3. Swap each section component's data source from the static import to a `fetch()` call **one section at a time**, verifying identical rendering before merging each.
4. Keep the static `data/portfolio.ts` values as a hardcoded fallback (`try backend → catch → static data`) in each fetch function for the first weeks post-launch, so a backend outage never blanks a section. Remove the fallback once the new system is trusted.

---

## 7. Hosting & Deployment

**Frontend:** stays on Vercel, unchanged.

**Backend + DB: Railway** — hosts the persistent NestJS process and a managed Postgres instance in one project, free/hobby tier comfortably covers this traffic level, and git-push deploys plus built-in env var management keep friction low. Render is a close second (similar model, but its free tier cold-starts after inactivity, noticeable if demoing the admin panel). Fly.io offers more infra control but a steeper ops curve and a smaller free allowance than it used to — only worth it if you specifically want that control.

**Expected cost:** free to roughly $5/month for backend + DB, plus R2's free tier (10GB storage, no egress fees) for files — very unlikely to exceed free/cheap tiers at this scale.

**Secrets management:**
- Local development: `.env` files, git-ignored, never committed.
- Vercel (frontend): Environment Variables UI — only the public API base URL (`NEXT_PUBLIC_API_URL`) is exposed client-side.
- Railway (backend): Variables tab holds everything server-side-only — `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, R2 credentials, `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` are used **only** locally, **only** at seed time, and are never deployed as runtime variables on any host — once the `admin_users` row exists (as a hash), those two variables have no further purpose.

---

## 8. Staged Build Plan

Build in stages rather than one large effort, so the live site only ever changes one section at a time and each stage is validated before moving to the next.

| Stage | Scope | Why this order |
|---|---|---|
| **Stage 0** | Backend skeleton, Prisma schema + migrations, `AuthModule` (incl. the seed script and the standalone `/admin` login page), `site_config` + `nav_items` modules | Smallest, singleton-heavy slice that validates the entire pipeline end-to-end: DB → API → admin → public fetch, including the auth wall |
| **Stage 1** | Projects + Certificates modules, `MediaModule` (R2 uploads), drag-and-drop reordering | Highest-value, most visual sections — the strongest justification for the backend existing at all |
| **Stage 2** | Contact module + `NotificationsModule` (Resend) | Net-new functionality (the current form does nothing); moderate complexity, high value |
| **Stage 3** | Remaining sections — Hero/stats, About, Skills, Experience/Education, Footer | Pattern is proven by this point; largely repetitive implementation work |

---

## 9. Approved Decisions Log

| Decision | Status |
|---|---|
| ORM: Prisma over TypeORM | ✅ Approved |
| Storage: Cloudflare R2 over Cloudinary/S3 | ✅ Approved |
| Staged build order (0 → 1 → 2 → 3) | ✅ Approved as proposed |
| Schema/admin scope limited to currently-implemented frontend features only (no tech orbit, radar chart, roadmap steps, identity chips, or command palette) | ✅ Approved — treated as a separate future project if ever built |
| Standalone `/admin` login page, no shared public chrome, hashed-only credentials via env-var-driven seed script, noindex + robots.txt exclusion | ✅ Added (New Requirement 1) |
| Contact submissions trigger a non-blocking Resend email notification to `ADMIN_NOTIFICATION_EMAIL`, with submission details + admin link, logged (not failed) on error | ✅ Added (New Requirement 2) |

---

## 10. Schema Amendments (approved after codebase audit)

A field-level audit of the live frontend against §3.1 surfaced four gaps between the plan and the code as actually implemented. These are resolved and folded into the schema.

| # | Gap found | Resolution |
|---|---|---|
| 1 | §3.1's opening claim is that *every* section is editable, but all six section headings (`index` `01`–`06`, `label`, `title`, `subtitle`) are literals inside the section components — no data source exists for them | **Add `section_meta` as a 20th table.** Section headings become editable content |
| 2 | `personalInfo.firstName` / `lastName` exist in the data but Hero and Footer render `"Ahmed"` / `"ElGabbas"` as hardcoded JSX spans | **Add `first_name` / `last_name` columns to `site_config`** so the rendered name is editable without a frontend rewrite |
| 3 | Categories are two different shapes: `certificates.category` is a fixed 4-value TS union enforced by the component's filtering logic, while `projects.category` is filtered against a hardcoded array in the component | **`certificates.category` stays a hard enum.** **`projects.category` becomes free text** so new categories can be added from the admin without a migration; the admin surfaces existing distinct values as suggestions instead of a hardcoded list |
| 4 | `about.tsx` picks quick-fact icons *positionally* from a 4-item array, so reordering or adding quick facts in the admin scrambles the icons | **`quick_facts.icon` becomes the keying source** (column already present in §3.1). Fix applied in Stage 3, not Stage 0 |

Additional audit notes recorded for later stages (no schema impact):

- `education[].courses` exists in the data but `experience.tsx` hardcodes the same six course strings inline — editing the data currently does nothing. Fixed when that section is migrated.
- `certificates[].previewImage` is read nowhere; `CertificateModal.tsx` decides PDF vs image purely via `/\.pdf$/i` on `file`.
- `stats` renders twice (Hero and About) off one array, and Hero additionally hardcodes three of its values as literals.
- `three`, `@react-three/fiber`, `@react-three/drei`, `gsap` are installed but imported nowhere. `src/lib/animations.ts` is imported by nothing.
- Hardcoded social URLs in `header.tsx`'s mobile menu bypass `socialLinks` entirely.
- Hardcoded strings in `contact.tsx` and `footer.tsx` duplicate fields that exist in `site_config`.

---

**Next step:** Stage 0 implementation.
