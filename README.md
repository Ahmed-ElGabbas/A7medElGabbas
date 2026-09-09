# Ahmed ElGabbas — Software Engineer & Mobile Developer Portfolio

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black?style=for-the-badge)](https://ui.shadcn.com/)

A modern, high-performance personal portfolio engineered for **Ahmed ElGabbas** — Full-Stack Software Engineer & Mobile Application Developer specializing in Flutter, Next.js, and Robotics Software Engineering.

---

## ✨ Features

- **Cinematic Visual Design**: Custom dual-theme design system combining obsidian dark mode and warm off-white light mode with signature gold accents (`#D4AF37` / `#B8960C`).
- **Interactive Stack Browser**: Interactive skill explorer with live architecture spotlights, design pattern breakdowns, and category filtering.
- **Career & Academic Timeline**: Chronological track with glowing milestones, coursework highlights, and future engineering frontiers.
- **Curated Projects Showcase**: Category-filtered portfolio cards with hover glow effects, metrics, and direct GitHub links.
- **Dual-Mode Theme System**: Seamless client-side theme switching with persistent storage across sessions.
- **Mobile-First Responsive Layout**: Optimized across ultra-wide desktop monitors down to mobile smartphones.
- **100% Accessible & Performant**: Fast page load times powered by Next.js Turbopack, zero layout shifts, and semantic HTML5 hierarchy.

---

## 📝 How to Update Website Content

All content across the entire website is centralized in **one single file**:

👉 **[`src/data/portfolio.ts`](src/data/portfolio.ts)**

Whenever you need to update any information in the future, simply open and edit that file:
- **Personal Details**: Name, roles, hero rotating titles, headline, photo, resume path.
- **Contact & Socials**: Email, phone, GitHub, LinkedIn, Twitter/X, Facebook URLs.
- **About Me**: Narrative paragraphs, bullet highlights, quick facts, academic focus.
- **Skills & Stack**: Skill categories, tags, architecture spotlights, scrolling ticker.
- **Experience & Education**: Timeline positions, degree, courses, future goals.
- **Projects**: Titles, descriptions, categories, tech tags, GitHub links.
- **Recognitions**: ICPC & community honors, metrics plaque, affiliations.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Core full-stack React framework with Turbopack |
| **UI Library** | [React 19](https://react.dev/) | Component architecture & modern hooks |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation utility-first styling with `@theme inline` |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) | Accessible, customizable UI primitives (Button, Card, Badge, Input, Textarea, Separator) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/) | Scroll-triggered animations, interactive hover states, and smooth transitions |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon set |
| **Type Safety** | [TypeScript 5](https://www.typescriptlang.org/) | Strict end-to-end type validation |

---

## 📁 Repository Structure

```
my-wedsite/
├── public/
│   ├── assets/            # Downloadable assets (e.g. CV / Resume PDF)
│   ├── fonts/             # Local optimized typography (CascadiaCode)
│   └── images/            # Static imagery & profile photography
├── src/
│   ├── app/
│   │   ├── globals.css    # Tailwind v4 theme variables (Dark & Light tokens)
│   │   ├── layout.tsx     # Root HTML shell, metadata, and font definitions
│   │   └── page.tsx       # Main portfolio landing page
│   ├── components/
│   │   ├── sections/      # Independent section components
│   │   │   ├── header.tsx       # Floating glass navigation & theme toggle
│   │   │   ├── hero.tsx         # Split-screen typography & role rotator
│   │   │   ├── about.tsx        # 3-panel narrative & stats strip
│   │   │   ├── skills.tsx       # Tabbed tech stack & architecture spotlight
│   │   │   ├── experience.tsx   # Chronological career & academic timeline
│   │   │   ├── projects.tsx     # Filterable project showcase cards
│   │   │   ├── recognitions.tsx # ICPC honors & competitive programming
│   │   │   ├── contact.tsx      # Direct communication cards & contact form
│   │   │   └── footer.tsx       # Quick navigation & copyright
│   │   └── ui/            # shadcn/ui and custom primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── separator.tsx
│   │       ├── section-heading.tsx
│   │       └── ticker.tsx
│   ├── config/
│   │   └── site.ts        # Global site metadata, URLs, and navigation links
│   ├── constants/         # Content collections (experiences, skills, projects, etc.)
│   ├── hooks/             # Custom React hooks (useScrollspy, useScrollProgress, etc.)
│   └── lib/
│       └── utils.ts       # Standard cn() class merging utility
├── components.json        # shadcn configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript path aliases (@/*)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.17.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Elagbbas/my-wedsite.git
   cd my-wedsite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the portfolio.

---

## 📜 Available Scripts

- `npm run dev` — Starts the development server with Turbopack on `http://localhost:3000`.
- `npm run build` — Compiles the optimized production bundle.
- `npm run start` — Runs the production build locally.
- `npm run lint` — Runs ESLint to inspect code quality.

---

## 📬 Contact & Connect

- **Name**: Ahmed ElGabbas
- **Email**: [ahmedelgabbas769@gmail.com](mailto:ahmedelgabbas769@gmail.com)
- **LinkedIn**: [Ahmed ElGabbas](https://www.linkedin.com/in/ahmed-elgabbas-33a186344)
- **GitHub**: [@Elagbbas](https://github.com/Elagbbas)
- **Location**: Cairo, Egypt

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
