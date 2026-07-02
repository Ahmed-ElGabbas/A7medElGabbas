# Ahmed ElGabbas — Portfolio Codebase Analysis

> Read-only review of the Next.js 16 / React 19 / Tailwind v4 portfolio at `/mnt/e/CS.HNU/Porjects/Portfiloo`.
> No files were modified during this analysis.

---

## 1. What this project does

A single-page personal portfolio for **Ahmed Mahmoud Ahmed ElGabbas** — a CS & AI student at Helwan National University. It presents:

- Identity / hero with name, role, status badge, social links, CTA buttons
- About section with biography + a hand-rolled 3D code-editor card showing a stylized "developer.js" object
- Skills section with tabbed categories and per-skill "SYS_MASTER / ADVANCED / PROFICIENT" ratings
- Education + Experience timeline
- Six project cards (categorized and "featured"-tagged)
- Recognitions / leadership roles
- Contact form (currently decorative — see §8 Bugs)
- Footer with brand block, navigation, socials, "Built With" list, and copyright

It also ships a **legacy vanilla HTML/CSS/JS version** at the project root (`index.HTML`, `style.css`, `portfiloo.js`) that is not wired into the Next.js app and is effectively dead code (see §10).

---

## 2. Architecture

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.2.9** (App Router) |
| Runtime | **React 19.2.4** |
| Language | **TypeScript 5** (`strict: true`, `target: ES2017`) |
| Styling | **Tailwind CSS v4** with CSS-first `@theme` config in `globals.css` |
| Animation | **framer-motion 12** (every section uses `whileInView`) |
| Icons | **lucide-react** |
| Class merging | `clsx` + `tailwind-merge` wrapped as `cn()` (declared but unused) |
| Variants | `class-variance-authority` (installed, never imported) |

### Rendering model — a notable issue

**Every component declares `"use client"`** (10 of 11 source files, including `components/ui/shared.tsx` and the entire `hooks/` file). There is **zero use of React Server Components**:

- `app/page.tsx` is a client component by transitivity (no server-only logic at all).
- The HTML payload Next sends is minimal, but the **JavaScript bundle is huge** because everything hydrates.
- SEO is hurt: search engines and link-preview bots that can't run JS (some social-card scrapers, basic crawlers) see a near-empty `<main>`.

A correct pattern for this site would be: keep `page.tsx` as a server component, render sections statically, and only opt the genuinely interactive pieces (`Header`, `Skills` tabs, `Contact` form) into `"use client"`.

---

## 3. Folder structure

```
Portfiloo/
├── assets/                                # Resume PDF (also mirrored to public/assets/)
│   └── Ahmed-Mahmoud-…-FlowCV-Resume-20241202.pdf
├── imgs/main.jpg.jpeg                     # ⚰️ unused
├── public/
│   ├── assets/…resume.pdf                 # duplicate of /assets/
│   ├── file.svg  globe.svg  main.jpg.jpeg # ⚰️ default Next.js scaffolding
│   ├── next.svg  vercel.svg  window.svg   # ⚰️ default Next.js scaffolding
├── src/
│   ├── app/
│   │   ├── globals.css                    # Tailwind v4 entry + tokens + custom layers
│   │   ├── layout.tsx                     # Metadata, fonts, body wrapper
│   │   └── page.tsx                       # Composes the 8 sections
│   ├── components/
│   │   ├── sections/                      # 8 page sections (Header → Footer)
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Skills.tsx
│   │   │   ├── Experience.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Recognitions.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/shared.tsx                  # 7 reusable primitives
│   ├── hooks/use-scroll.ts                # useScrollspy + 2 unused hooks
│   └── lib/
│       ├── animations.ts                  # framer-motion Variants (used inconsistently)
│       ├── data.ts                        # All static content lives here
│       └── utils.ts                       # cn() — unused
├── index.HTML                             # ⚰️ legacy vanilla portfolio
├── portfiloo.js                           # ⚰️ legacy vanilla JS
├── style.css                              # ⚰️ legacy vanilla CSS (24 KB)
├── eslint.config.mjs                      # Flat config, Next core-web-vitals + TS
├── next.config.ts                         # images.remotePatterns for an unused host
├── package.json                           # next 16.2.9, react 19.2.4, framer-motion 12
├── postcss.config.mjs                     # @tailwindcss/postcss only
├── tailwind.config.ts                     # (none — Tailwind v4 CSS-first)
└── tsconfig.json                          # strict, paths: { "@/*": ["./src/*"] }
```

There is **no `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`, `app/icon.*`, `app/favicon.ico`, `app/sitemap.ts`, `app/robots.ts`, `public/robots.txt`, `public/sitemap.xml`, or `README.md`**.

---

## 4. Component hierarchy

```
RootLayout (app/layout.tsx, server-component-eligible)
└── Home (app/page.tsx, client by transitivity)
    ├── Header (fixed, mobile drawer, scroll-spy)
    │   ├── Logo block (inline, duplicated in Footer)
    │   ├── Desktop nav (uses useScrollspy)
    │   ├── "Access_CV" anchor
    │   └── Mobile drawer (AnimatePresence + overlay + close button)
    ├── main
    │   ├── Hero
    │   │   ├── Vertical letter columns (first/last name)
    │   │   ├── FloatingBadge ("Available for Work · 2026")
    │   │   ├── H1 + tagline + social buttons + CTAs
    │   │   ├── Scroll indicator (ChevronDown animation)
    │   │   ├── 4× MetricCard (stats)
    │   │   └── Ticker (infinite marquee)
    │   ├── About
    │   │   ├── SectionHeading
    │   │   ├── ParallaxText ("AHMED MAHMOUD", background)
    │   │   ├── Bio paragraphs (3)
    │   │   └── 3D code editor (≈300 lines of layered absolute-positioned divs + 9 inline syntax-highlight components CL/Kw/Id/Prop/Str/Num/Bool/Op/Br/Fn)
    │   ├── Skills
    │   │   ├── SectionHeading
    │   │   ├── Tab bar (6 categories)
    │   │   └── AnimatePresence grid of skill cards
    │   ├── Experience
    │   │   ├── SectionHeading
    │   │   └── Education + Experience card lists (with hardcoded bullet array)
    │   ├── Projects
    │   │   ├── SectionHeading
    │   │   └── 6 project cards (with 2 dead "Initialize Live System / Access Source Code" anchors pointing to "#")
    │   ├── Recognitions
    │   │   ├── SectionHeading
    │   │   └── 3 recognition cards
    │   └── Contact
    │       ├── SectionHeading
    │       ├── 4 contact info items (icon + label + value)
    │       └── Contact form (4 inputs, decorative submit)
    └── Footer
        ├── Logo block (duplicate of Header)
        ├── Navigation column (navItems)
        └── "Built With" column + GradientDivider + copyright
```

### Reusable primitives (`src/components/ui/shared.tsx`)

| Export | Used by |
|---|---|
| `SectionHeading` | About, Skills, Experience, Projects, Recognitions, Contact ✅ |
| `GradientDivider` | Experience, Projects, Footer ✅ |
| `ParallaxText` | About only |
| `Ticker` | Hero only |
| `FloatingBadge` | Hero only |
| `TechBadge` | **never imported** ⚰️ |
| `MetricCard` | Hero only |

---

## 5. Data flow

```
┌─────────────────────┐
│   src/lib/data.ts   │   ← single source of truth (all static)
│  siteConfig         │
│  stats              │
│  experiences        │
│  education          │
│  skillCategories    │
│  projects           │
│  recognitions       │
│  navItems           │
└──────────┬──────────┘
           │ direct imports
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Sections (each imports what it needs and renders inline)    │
│   Header        ← navItems                                  │
│   Hero          ← siteConfig.links, stats                   │
│   About         ← (no data) — copy in JSX                   │
│   Skills        ← skillCategories                           │
│   Experience    ← experiences, education                    │
│   Projects      ← projects                                  │
│   Recognitions  ← recognitions                              │
│   Contact       ← siteConfig.links                          │
│   Footer        ← siteConfig, navItems                      │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  React state/local  │   useState in Header (scrolled/menu),
│                     │   useState in Skills (activeTab),
│                     │   useState in Contact (form)
└─────────────────────┘
```

- **No context, no redux, no fetch, no URL state.**
- The only cross-component reactive link is the **scroll-spy**: `Header` calls `useScrollspy(ids)` which reads DOM offsets on scroll and tracks the topmost section. It does not communicate with siblings.
- `lib/animations.ts` defines ~10 `Variants` (fadeInUp, fadeInLeft, etc.) but the components mostly use **inline `initial` / `whileInView` props** instead of importing them. Effectively the file is mostly dead (only the bezier `[0.25, 0.46, 0.45, 0.94]` is copy-pasted into many inline objects).

---

## 6. Styling system

### Tailwind v4, CSS-first

`src/app/globals.css` declares design tokens in an `@theme` block:

```css
--font-sans: "Space Grotesk", ...
--font-display: "Syne", ...
--font-mono: "JetBrains Mono", ...
--color-background: #080808;
--color-foreground: #fafafa;
--color-muted / muted-foreground / border / border-hover / card / card-hover / accent / surface
```

Custom utility classes in `@layer components`:

- `.section-container` — max-width 1200 px with responsive horizontal padding
- `.section-padding` — 120 px top/bottom (80 px on mobile)
- `.gradient-text`, `.gradient-line`, `.glass-card`, `.glow-sm`, `.glow-md`
- `.dot-pattern`, `.noise-bg` (inline SVG noise via data URL), `.text-stroke`
- `.animate-float`, `.animate-pulse-slow` (animations defined at file bottom; `grain` keyframes declared but no rule references it — dead)

### Theming

`<html className="scroll-smooth dark">` — `dark` is **hardcoded**, but the components don't use `dark:` variants because the design is dark-only. There is no light mode despite the visual hint.

### Styling strategy in components

Mostly Tailwind utilities with **lots of arbitrary values**:

- `bg-[#080808]`, `text-neutral-500`, `border-white/[0.06]` — bypasses the design tokens
- `font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-600` — repeated dozens of times as an ad-hoc "label" pattern

This is functional but creates **two parallel color systems** (CSS variables vs. neutral-500/600/700/etc.), and the arbitrary opacity values (`/[0.06]`, `/[0.15]`) are repeated everywhere instead of being promoted to tokens.

### Notable styling inconsistencies

- `scroll-behavior: smooth` is set both in `globals.css` (`html { … }`) **and** via the `scroll-smooth` Tailwind class on `<html>`.
- `overflow-x: hidden` is set on `<body>` in `layout.tsx` **and** in `globals.css`.
- `section-padding` mobile override uses `@media (max-width: 768px)` while the rest of the codebase uses Tailwind's mobile-first `md:` (≥768 px) convention. As a result `.section-padding` flips at *exactly* the same breakpoint, in opposite directions.

---

## 7. Design patterns

| Pattern | Used? | Notes |
|---|---|---|
| RSC + selective `"use client"` | ❌ | Everything is client |
| Component composition with shared UI | ✅ | `SectionHeading` reused 6× |
| Centralized static data | ✅ | `src/lib/data.ts` |
| Variants library for animations | ⚠️ Partial | `lib/animations.ts` exists but components mostly inline their `initial`/`animate` |
| Design tokens via CSS variables | ✅ | `@theme` block, but underused in component code |
| `cn()` helper for class merging | ❌ | Declared in `lib/utils.ts`, never imported |
| `cva` for variant components | ❌ | `class-variance-authority` installed, never used |
| Error boundaries | ❌ | None |
| Loading / not-found routes | ❌ | None |
| Metadata API | ✅ | Title, description, OG, Twitter present |
| `<head>` injection in layout | ⚠️ | Next 13+ prefers `app/icon.tsx`, metadata `icons`, or `next/font` over raw `<head>` children |

The code reads as a **single-author, design-driven project** — coherent visual identity, but missing the structural rigor you'd expect from someone shipping to production.

---

## 8. Strengths

1. **Strong visual identity.** Consistent "system / monospace / cinematic" aesthetic with a clear color system, motion language, and typography pairing (Space Grotesk + Syne + JetBrains Mono).
2. **Honest, centralized data.** All copy lives in `data.ts`; updating your bio / projects / links is a single-file edit.
3. **Reusable primitives.** `SectionHeading` is well-designed and reused in 6 sections — a real DRY win.
4. **Strict TypeScript.** `strict: true`, no `any` leakage.
5. **Metadata is thoughtful.** OpenGraph + Twitter cards, descriptive title, keywords, authors, theme-color.
6. **Accessibility wins.** `aria-label` on icon-only buttons, semantic `<header>`/`<main>`/`<footer>`, single `<h1>`, `<html lang="en">`, `rel="noopener noreferrer"` on external links.
7. **Responsive layout.** Mobile menu, breakpoints at `md` / `lg` / `xl`, gradient hero overlay, full-bleed ticker.
8. **Preconnect to Google Fonts.** Speeds up first paint of typography.
9. **Accessible scroll behaviour.** `scroll-smooth` on the root html.
10. **Inline motion bezier is consistent.** `[0.25, 0.46, 0.45, 0.94]` is the same easing everywhere — good motion design taste.

---

## 9. Weaknesses

### Architecture

- **All-client** kills RSC, balloons the JS bundle, weakens SEO/OG.
- **No error boundary.** Any throw on the page = blank screen.
- **No route handlers for the contact form** (see Bugs).
- **`useScrollspy` reads `element.offsetTop` on every scroll event** — forces synchronous layout. An `IntersectionObserver` would be both more correct and faster.

### Styling

- **Two color systems in parallel**: CSS variables (`--color-muted`, etc.) + Tailwind `neutral-*` + arbitrary opacities. Pick one.
- **Repeated label micro-component** (`font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-600`) appears ~20 times. Should be a `<MonoLabel>` component or `.label-mono` utility.
- **Inline-style spaghetti in `About.tsx`** — ~300 lines of `style={{ perspective: …, transform: …, background: …, boxShadow: … }}` for the 3D code editor. Almost impossible to maintain responsively.

### Content / UX

- **The "Open to Work" badge hardcodes "2026"** (`Hero.tsx`) — will rot next year.
- **Recognitions all say "2024"** (`Recognitions.tsx`) regardless of the actual year of the role.
- **Footer copyright says "2026"** — also stale-prone.
- **Contact form is decorative.** Submit shows "Message Sent!" for 3 s, then resets. There is **no `mailto:`, no API route, no third-party handler**. Anyone filling the form and clicking Send gets the impression their message was delivered when it wasn't.
- **Two project CTA buttons point to `"#"`** (`Projects.tsx`) — both "Initialize Live System" and "Access Source Code" are dead anchors for most projects. Either show only when URLs exist or render disabled.
- **Skills percentages are computed from index** (`95 - index * 3`), producing made-up competence numbers like `95%`, `92%`, `89%` … without any backing data.

---

## 10. Potential bugs

| # | Severity | Where | Bug |
|---|---|---|---|
| 1 | 🔴 High | `components/sections/Contact.tsx` | **Form is non-functional.** `handleSubmit` only flips a local boolean; messages are silently dropped. Visitors will think their message was sent. |
| 2 | 🔴 High | `hooks/use-scroll.ts:30` | **`useMediaQuery` is unsafely implemented.** Effect deps are `[matches, query]` and the listener calls `setMatches(media.matches)`. Every match-change re-renders → re-runs the effect → re-binds the listener, with the listener always using stale closure unless you use a ref. Currently exported but unused — would crash loudly if imported. |
| 3 | 🟠 Medium | `hooks/use-scroll.ts:9` | **`useScrollspy` recreates `handleScroll` every render** because `ids` (built via `navItems.map(...)` in `Header.tsx`) is a new array reference each render. The `useCallback` memoization is defeated → the effect re-attaches the scroll listener every render. Also uses `offsetTop` (forces layout). |
| 4 | 🟠 Medium | `app/layout.tsx` & `app/globals.css` | **`scroll-behavior: smooth` declared twice** (once in CSS, once via `scroll-smooth` class) and **`overflow-x: hidden` declared twice** (body inline class + body CSS rule). Harmless but signals unclear ownership. |
| 5 | 🟠 Medium | `components/sections/Projects.tsx:113-130` | **Project CTA links are `<a href="#">`** — clicking scrolls to top of page. No `aria-disabled`, no `rel`. |
| 6 | 🟠 Medium | `components/sections/About.tsx` | **3D code editor uses `onMouseEnter` / `onMouseLeave` to imperatively set `style` props**, bypassing the otherwise pure Tailwind styling system. Will fight any future framer-motion hover variants. |
| 7 | 🟡 Low | `app/layout.tsx` | **`<head>` manually contains `<link rel="preconnect">` and `<link rel="stylesheet">` for Google Fonts.** In the App Router, `next/font/google` would self-host, eliminate render-blocking, and remove the preconnect. |
| 8 | 🟡 Low | `next.config.ts` | **`images.remotePatterns` for `d3moma7wl9.ufs.sh`** — no `next/image` is used anywhere in the React app, so this is dead config (and the host is referenced only by the dead legacy `index.HTML`). |
| 9 | 🟡 Low | `lib/data.ts` | **Skill levels (`SYS_MASTER` etc.) are derived from array index** (`getSkillLevel(i)` in `Skills.tsx`). Adding/reordering skills silently changes "competence". |
| 10 | 🟡 Low | `components/sections/Header.tsx` | **The mobile menu doesn't trap focus**, doesn't restore focus on close, and the menu button doesn't expose `aria-expanded`. |
| 11 | 🟡 Low | All sections | **No respect for `prefers-reduced-motion`.** `framer-motion`'s `useReducedMotion` is never wired in. Animations play for users with vestibular sensitivity. |
| 12 | 🟡 Low | `app/layout.tsx` | **`metadataBase` is unset.** OpenGraph/Twitter images will resolve relative to whatever the request URL is, breaking link previews in some scrapers. |
| 13 | 🟡 Low | `components/sections/Hero.tsx` | **`FloatingBadge` says "· 2026"** — once 2027 hits, the badge lies. Use `new Date().getFullYear()`. |
| 14 | 🟡 Low | `components/sections/Experience.tsx` | **The bullet list inside Education is hardcoded** (an inline array of 5 strings in `Experience.tsx`), not driven by the `education` data entry's `description` field. The data field is rendered but ignored; the rendered bullets ignore the data. Two sources of truth. |

---

## 11. Performance issues

1. **All-client bundle.** All 11 source files are `"use client"`; no SSR/RSC benefits. First-load JS likely 200–400 KB+ before any section code.
2. **Heavy paint in Hero & About.**
   - Hero: two radial-gradient blurred divs (`blur-[120px]`, `blur-[100px]`).
   - About: 3 stacked glow divs with `filter: blur(60px/40px/20px)` + 4 absolute-positioned 3D stack layers + glass reflection overlay + 21 syntax-highlighted code lines.
3. **Three Google Fonts** (`Space Grotesk`, `Syne`, `JetBrains Mono`) with multiple weights, **render-blocking** because loaded via raw `<link>` instead of `next/font/google` (which would self-host and `font-display: swap`).
4. **Scroll handler reads `offsetTop` on every scroll tick** (`useScrollspy`) — forces layout repeatedly. Use `IntersectionObserver`.
5. **AnimatePresence + `whileInView` in every section** spins up an `IntersectionObserver` per animated element. Acceptable for ~10 sections, but each card in `Projects` / `Skills` / `Experience` has its own observer.
6. **`whileInView viewport={{ once: true }}` on the Skills grid children + `key={activeTab}` on parent**: progress bars trigger their fill animation only on first viewport hit. When the user switches tabs back later, the new tab's progress bars *do* re-animate because of the new key, but the old tab's are already complete. That's fine — just noting the interaction.
7. **Ticker renders `[...skills, ...skills]` once** but the `key={i}` on duplicated items can cause subtle DOM reuse issues if the underlying list ever changes. Static for now, so OK.
8. **No `next/image`** anywhere. There are essentially no images in the React app, but if you add any (e.g. project thumbnails), this matters.
9. **No font subsetting** (`&display=swap` only, no `&text=` subsetting).
10. **`overflow-x-hidden` on `<body>` is a known hydration/perf smell** — clips fixed-position elements and can cause iOS Safari bounce issues. Usually better to constrain the offender.

---

## 12. SEO issues

| # | Issue |
|---|---|
| 1 | **No `robots.txt`** (`public/robots.txt` or `app/robots.ts`). |
| 2 | **No `sitemap.xml`** (`app/sitemap.ts`). |
| 3 | **No structured data** (JSON-LD `Person`/`ProfilePage`/`WebSite`). |
| 4 | **No `metadataBase`** — OpenGraph/Twitter image URLs won't resolve correctly. |
| 5 | **No `openGraph.images`** / **`twitter.images`** — link previews have no card image, only title/description. |
| 6 | **No `canonical`** URL in metadata. |
| 7 | **No `<html dir>`**, no `hreflang`, no locale-specific `alternates`. (Single-locale site is fine; just flagging.) |
| 8 | **No `app/icon.*` or `app/favicon.ico`** — Next will 404 the favicon (the legacy `index.HTML` has one but it's not served). |
| 9 | **Heading hierarchy** is OK (1 × `<h1>`, multiple `<h2>`), but the **education bullets use no headings at all** and the **projects have no `<article>` semantic wrapper** — content is harder for crawlers to chunk. |
| 10 | **Project cards have no `<time>` / no dates** — fresh content signals are weak. |
| 11 | **All-client** means search engines that don't execute JS see almost nothing (verified: `app/page.tsx` contains no pre-rendered text — only `<Header /> … <Footer />` which are all-client). |
| 12 | **No `og:url` / `twitter:url`** — link previews look generic. |
| 13 | **Google Fonts is render-blocking** — penalizes LCP. |

---

## 13. Accessibility issues

| # | Severity | Issue |
|---|---|---|
| 1 | 🔴 High | **Focus indicators missing on most interactive elements.** Inputs use `focus:outline-none focus:border-white/[0.2]` (border-color change only — invisible on `bg-[#080808]`). Buttons similarly only change border. |
| 2 | 🔴 High | **No "skip to content" link.** Keyboard users must tab through the whole nav to reach `<main>`. |
| 3 | 🔴 High | **No respect for `prefers-reduced-motion`.** All entrance animations, the marquee, the floating scroll indicator, and the 3D editor's hover effect run regardless. |
| 4 | 🟠 Medium | **Mobile menu does not trap focus** and doesn't restore focus to the trigger on close. |
| 5 | 🟠 Medium | **Hamburger button lacks `aria-expanded`** (and `aria-controls`). |
| 6 | 🟠 Medium | **Color contrast is borderline-to-failing.** `text-neutral-500` on `#080808` ≈ 4.5:1 (passes AA for body but fails AAA). `text-neutral-600` ≈ 3.5:1 (fails AA for body). `text-neutral-700` ≈ 2.8:1 (fails everywhere). These are used extensively for descriptive copy and labels. |
| 7 | 🟠 Medium | **The Skills tabs are buttons, not a `role="tablist"`.** Arrow-key navigation between tabs is missing; screen readers don't announce the tab semantics. |
| 8 | 🟠 Medium | **Form errors are not announced** — `aria-describedby` and `aria-invalid` are absent. |
| 9 | 🟡 Low | **`text-stroke` (transparent fill, visible stroke)** is used for the "&" character in the hero — readable visually but may be ambiguous to assistive tech (it's still text, so OK). |
| 10 | 🟡 Low | **Decorative "Available for Work" pulse dot** uses `animate-pulse` — color alone isn't the only signal (text is present), so this is OK. |
| 11 | 🟡 Low | **The mobile drawer's close button is positioned `absolute top-6 right-6`** — overlapping the header's close button area. Confusing on small screens. |
| 12 | 🟡 Low | **Lucide icons** in icon-only buttons have `aria-label` on the parent, so OK; but icons paired with text don't have `aria-hidden`. |

---

## 14. Dead code

| # | File / symbol | Status |
|---|---|---|
| 1 | `index.HTML` (project root) | ⚰️ Legacy vanilla portfolio — not imported by Next.js |
| 2 | `portfiloo.js` (project root) | ⚰️ Vanilla JS for the legacy HTML — not loaded |
| 3 | `style.css` (project root, 24 KB) | ⚰️ Vanilla CSS for the legacy HTML — not loaded |
| 4 | `imgs/main.jpg.jpeg` | ⚰️ Never imported in `src/` |
| 5 | `public/main.jpg.jpeg` | ⚰️ Never imported in `src/` |
| 6 | `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | ⚰️ Default Next.js scaffolding, unused |
| 7 | `src/hooks/use-scroll.ts` → `useMediaQuery` | ⚰️ Exported, never imported |
| 8 | `src/hooks/use-scroll.ts` → `useMousePosition` | ⚰️ Exported, never imported |
| 9 | `src/lib/utils.ts` → `cn()` | ⚰️ Exported, never imported (verified by grep) |
| 10 | `src/lib/animations.ts` → most Variants | ⚠️ Declared but components inline `initial`/`animate` instead. Only the easing bezier is copy-pasted. |
| 11 | `src/components/ui/shared.tsx` → `TechBadge` | ⚰️ Exported, never imported |
| 12 | `class-variance-authority` (npm) | ⚰️ Installed, never imported (verified by grep) |
| 13 | `next.config.ts` → `images.remotePatterns` (d3moma7wl9.ufs.sh) | ⚰️ No `next/image` used anywhere |
| 14 | `app/globals.css` → `@keyframes grain` | ⚰️ Keyframes defined, no rule references them |
| 15 | `tsconfig.json` → `"**/*.mts"` include | ⚰️ No `.mts` files in repo |
| 16 | `app/globals.css` → `.noise-bg` | ⚠️ Defined but never applied to any element |
| 17 | `app/globals.css` → `.dot-pattern` | ⚠️ Defined but never applied to any element |
| 18 | `app/globals.css` → `.glow-sm`, `.glow-md` | ⚠️ Defined but never applied |
| 19 | `app/globals.css` → `.animate-float`, `.animate-pulse-slow` | ⚠️ Defined but never applied |
| 20 | `app/globals.css` → `--color-muted`, `--color-muted-foreground`, `--color-border-hover`, `--color-card-hover`, `--color-accent`, `--color-surface` | ⚠️ Declared but components use Tailwind `neutral-*` and `white/[0.06]` instead |

---

## 15. Duplicate code

| # | Where | Duplication |
|---|---|---|
| 1 | `Header.tsx` (lines ~76–87) and `Footer.tsx` (lines ~16–26) | **Identical "AE" logo block** — same JSX, same classes. Should be a `<Logo />` component. |
| 2 | `Header.tsx`, `About.tsx`, and `Footer.tsx` | **Same CV PDF URL hardcoded as a literal string** in 3 places. Should live in `siteConfig` (e.g. `siteConfig.cvUrl`). |
| 3 | `Header.tsx` (`handleNavClick`) and `Hero.tsx` (inline `onClick` on `#contact` and `#projects` anchors) | **Same "scroll to anchor with smooth behavior" logic**, written twice with different signatures. Should be a single helper or a `<ScrollLink href="…" />` component. |
| 4 | `Header.tsx`, `Hero.tsx`, `Footer.tsx` | **Same social-icon anchor pattern** (icon + label + hover border treatment). The Hero uses one shape, the Footer uses another — should be unified. |
| 5 | `Skills.tsx`, `Experience.tsx`, `Projects.tsx` | **"Tag pill" component** (`px-2.5 py-1 rounded-md … border-white/[0.06] … text-neutral-500`) repeated 4–6× per file. Should be a `<Tag>` primitive (or a styled `<TechBadge>` — which exists but is unused). |
| 6 | All sections | **"Mono label" micro-style** (`font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-600`) repeated 20+ times across the codebase. Promote to a `.label-mono` utility or `<MonoLabel>` component. |
| 7 | `Hero.tsx`, `About.tsx`, `Experience.tsx`, etc. | **Easing bezier `[0.25, 0.46, 0.45, 0.94]`** copied into dozens of inline `transition`/`ease` props. Same value as `lib/animations.ts` — should be a single constant. |
| 8 | `app/layout.tsx` and `app/globals.css` | **`scroll-behavior: smooth`** and **`overflow-x: hidden`** declared twice (see Bugs #4). |

---

## 16. Missing best practices

| Category | Missing |
|---|---|
| **Documentation** | No `README.md`, no `CHANGELOG`, no `LICENSE`, no contributing guide, no `.nvmrc` / `.node-version`. |
| **Testing** | No test runner, no test files, no CI. |
| **Reliability** | No `app/error.tsx`, no `app/loading.tsx`, no `app/not-found.tsx`, no `app/global-error.tsx`. |
| **SEO** | robots, sitemap, JSON-LD, canonical, `metadataBase`, OG image — all missing. |
| **PWA** | No `manifest.json`, no service worker, no offline page. |
| **Accessibility** | No skip link, no reduced-motion handling, no focus management on dialogs, no live regions. |
| **Internationalization** | No `hreflang`, no locale strategy. |
| **Security** | No CSP, no `Permissions-Policy`, no `Referrer-Policy` (browser default is fine, but explicit is better). |
| **Telemetry** | No analytics, no error reporting (Sentry/etc.), no Web Vitals reporting. |
| **Performance** | No `next/font` (self-host fonts), no `next/image`, no image preloading, no `loading.tsx` for skeletons. |
| **Code health** | No `tsconfig.json` path aliases for sub-folders (e.g. `@/components` vs `@/components/sections`), no barrel `index.ts` files. |
| **Tooling** | No `prettier` config, no `husky` / `lint-staged`, no commit hooks. ESLint uses Next defaults only. |
| **DX** | No Storybook / component playground, no JSDoc on exported hooks, no example/test for `useScrollspy`. |
| **Theming** | `dark` is hardcoded but there's no light-mode design — either commit to dark-only or implement a real theme system with tokens. |
| **Forms** | No server action, no API route, no `react-hook-form` / `zod` / shared validation. |
| **Data** | All data is in a single TS file — fine for now, but no separation between "content" and "config", and no way for non-technical edits. |

---

## 17. Ratings

| Dimension | Score | Justification |
|---|---|---|
| **Architecture** | **6 / 10** | Clean folder split and sensible primitives, but "use client" everywhere defeats RSC, no error/loading/not-found routes, no API routes for the form, and `useScrollspy` is implemented the wrong way (offsetTop on scroll). |
| **Code quality** | **6 / 10** | Consistent visual language and strict TS, but lots of copy-paste (logo, tag pills, mono labels, easing bezier), hand-rolled 3D editor mixes imperative and declarative styling, and several unused exports. |
| **Maintainability** | **5 / 10** | Single author can navigate it, but the inline-style 3D editor, the parallel color systems, the duplicated CV URL/logo/scroll logic, and the hardcoded "2024/2026" dates will bite the next maintainer. |
| **Performance** | **5 / 10** | Tailwind v4 + reasonable component size, but all-client JS, render-blocking Google Fonts (raw `<link>`), heavy blur layers, scroll listener with layout thrash, and no `next/image` path. |
| **Scalability** | **6 / 10** | Adding a new section is straightforward (copy existing pattern + add to `page.tsx`); adding a new page or a contact API is harder because of the all-client architecture and missing route conventions. |
| **UI implementation** | **8 / 10** | Visually cohesive, motion is tasteful and consistent, typography pairing is strong, responsive layout works. Loses points on focus states, color contrast, and the cramped mobile drawer. |

**Overall: ~6 / 10** — a strong design portfolio with a clean surface but a noticeable amount of structural debt underneath.

---

## 18. Prioritized roadmap

> Ordered by **impact-per-effort**. Quick wins first; structural changes after.

### 🟢 Tier 1 — Quick wins (≤ 1 day each, high ROI)

1. **Delete legacy files.** `index.HTML`, `portfiloo.js`, `style.css`, `imgs/`, the unused `public/` SVGs, `public/main.jpg.jpeg`. Removes ~28 KB of dead code and a misleading "two portfolios in one repo" signal.
2. **Remove unused exports.** Drop `useMediaQuery`, `useMousePosition`, `cn`, `TechBadge` from their files. Uninstall `class-variance-authority` (or actually use it).
3. **Wire the contact form.** Either use a `<form action="https://formspree.io/f/…">` POST or add an `app/api/contact/route.ts` Next.js route handler that emails you. Replace the decorative `setSubmitted(true)`.
4. **Fix the project CTA buttons.** Either accept URLs in `lib/data.ts` and render only what's real, or render disabled with `aria-disabled`.
5. **Add `metadataBase`, OG image, `canonical`, `app/icon.png`, `app/robots.ts`, `app/sitemap.ts`.** Five small files, massive SEO payoff.
6. **Self-host fonts with `next/font/google`.** One file change in `layout.tsx`, eliminates render-blocking and one network round-trip.
7. **Extract repeated UI.**
   - `<Logo />` (Header + Footer dedupe)
   - `<Tag />` / activate the existing `TechBadge` (Skills + Experience + Projects)
   - `<MonoLabel>` or `.label-mono` utility (20+ uses)
   - `EASE = [0.25, 0.46, 0.45, 0.94]` constant + `lib/animations.ts` actually used
8. **Centralize CV URL** in `siteConfig.cvUrl` and reference from Header / About / Footer.

### 🟡 Tier 2 — Correctness + a11y (1–3 days)

9. **Rewrite `useScrollspy` with `IntersectionObserver`.** Simpler, faster, doesn't force layout, no scroll-listener spam.
10. **Fix or remove `useMediaQuery`.** Current implementation can cause infinite re-renders if imported.
11. **Make `page.tsx` a real Server Component.** Only opt `Header`, `Skills`, `Contact` (and the form) into `"use client"`. The rest (`Hero`, `About`, `Experience`, `Projects`, `Recognitions`, `Footer`) can be server-rendered with their entrance animations being lazy-mounted via a tiny `<RevealOnView>` client wrapper. This alone will cut first-load JS significantly and surface real HTML to crawlers.
12. **Add `app/error.tsx` and `app/not-found.tsx`.** Two small files, eliminates blank-screen failure mode.
13. **Add visible focus styles.** Replace `focus:outline-none focus:border-white/[0.2]` with a real `focus-visible:ring` (white or amber) at sufficient contrast.
14. **Add a "skip to content" link.**
15. **Respect `prefers-reduced-motion`.** Wrap framer-motion animations in `useReducedMotion()` and short-circuit to a static render. Cap the marquee duration or hide the floating elements.
16. **Lift the mobile-menu button's accessibility:** `aria-expanded`, `aria-controls`, focus trap, restore focus on close, `Esc` to close.
17. **Convert Skills tabs to ARIA tabs** (`role="tablist"`, `role="tab"`, `aria-selected`, arrow-key navigation).

### 🔴 Tier 3 — Structural improvements (3+ days)

18. **Replace the inline-style 3D code editor** in `About.tsx` with either a static SVG illustration, an `<iframe>`-embedded CodeSandbox/StackBlitz, or a properly componentized 3D stack (e.g. CSS `transform-style: preserve-3d` on a parent, single `transform` on a child). Today's 300 lines of `style={{ … }}` are unmaintainable.
19. **Move the bullet list out of `Experience.tsx`'s inline array** and into `education[0].highlights: string[]` in `lib/data.ts`. Eliminates the two-sources-of-truth bug.
20. **Replace the computed skill percentages** (`95 - index * 3`) with a per-skill `level` and `years` field in `data.ts`. The current "95%" for a skill you've held for 6 months is a credibility risk for a portfolio.
21. **Decide on dark/light theming properly.** Either remove `dark` from `<html>` (since the design is dark-only) or implement a real light-mode token set with a toggle.
22. **Reduce the Tailwind arbitrary-value soup.** Promote `border-white/[0.06]`, `border-white/[0.12]`, `border-white/[0.15]`, `bg-white/[0.02]`, `bg-white/[0.04]` to `--color-border`, `--color-border-hover`, `--color-card`, `--color-card-hover` tokens (already defined in `@theme`, just unused).
23. **Add a JSON-LD `Person` block** in the layout for rich search results.
24. **Promote dates** (`"2024"`, `"2026"`) to `new Date().getFullYear()` and use ISO `<time datetime="...">` for crawlers.
25. **Add a README** with run/build/deploy instructions, and a `LICENSE` (you have personal brand on the line — MIT is fine; CC-BY-NC for content).

### ⚪ Tier 4 — Nice-to-haves (only if you keep going)

26. **Add tests** for `useScrollspy`, `cn`, and the form-submission logic. Even one Vitest setup unlocks refactoring confidence.
27. **Replace `lib/data.ts` with MDX or a content folder** so non-technical edits don't require a code deploy.
28. **Add a project thumbnail per `Project`** using `next/image`, with the existing skill for optimisation.
29. **Add a `/blog` route** with MDX — `lib/data.ts` doesn't scale to long-form content.
30. **Set up Vercel Analytics / Sentry** to actually measure the gains from Tier 1–3.

---

## 19. Summary in one paragraph

This is a visually polished, single-page Next.js 16 + React 19 + Tailwind v4 portfolio with a strong design system and a clean folder layout, but it ships with a surprising amount of structural debt under the hood: every component is `"use client"` (defeating RSC and SEO), a legacy vanilla HTML/CSS/JS portfolio lives alongside the React app as dead code, the contact form silently drops messages, several hooks and the `cn()` helper are exported but never used, the `useScrollspy` hook thrashes layout on every scroll, accessibility is borderline on focus and contrast, and there are no robots/sitemap/structured data. The fix is mostly small and well-scoped — Tier 1 alone would remove ~30 % of the issues in a day — but the all-client architecture and the inline-style 3D editor in `About.tsx` are the two decisions most worth revisiting before the next iteration.
