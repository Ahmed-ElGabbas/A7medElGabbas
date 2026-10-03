// The certificate DTO uses class-validator decorators, which need reflect-metadata
// to be loaded before that module is imported.
import 'reflect-metadata';
import { readFileSync, existsSync } from 'node:fs';
import * as path from 'node:path';
import { PrismaClient, CertificateCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as ts from 'typescript';
import { CERTIFICATE_CATEGORY_LABELS } from '../src/certificates/dto/certificate.dto';

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(
      `\n[seed] ${name} is not set. Add it to backend/.env (see backend/.env.example) and re-run.\n`,
    );
    process.exit(1);
  }
  return value.trim();
}

interface PortfolioProject {
  title: string;
  description: string;
  technologies: string[];
  category: string;
  featured: boolean;
}

interface PortfolioCertificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl?: string;
  category: string;
  skills: string[];
  badgeText: string;
  description: string;
  featured?: boolean;
  previewImage?: string;
  file?: string;
}

interface NavItemSeed {
  label: string;
  href: string;
}

interface StatSeed {
  value: string;
  label: string;
}

interface QuickFactSeed {
  label: string;
  value: string;
  detail?: string;
}

interface AboutSeed {
  sectionSubtitle?: string;
  narrativeTitle?: string;
  paragraphs: string[];
  highlights: string[];
  quickFacts: QuickFactSeed[];
  academicFocus?: { title?: string; description?: string };
}

interface SkillCategorySeed {
  title: string;
  icon?: string;
  skills: string[];
}

interface ExperienceSeed {
  role: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

interface EducationSeed {
  degree: string;
  institution: string;
  period: string;
  description?: string;
  gpa?: string;
  courses: string[];
}

interface FutureGoalsSeed {
  title: string;
  description?: string;
  items: string[];
}

/**
 * Loads the live frontend data module so the seeded rows cannot drift from
 * src/data/portfolio.ts. That file is pure data with no imports, so it can be
 * transpiled and evaluated in isolation; a JSON copy would rot silently.
 */
function loadPortfolioData(): Record<string, unknown> | null {
  const source = path.resolve(__dirname, '..', '..', 'src', 'data', 'portfolio.ts');

  if (!existsSync(source)) {
    console.log(
      `[seed] src/data/portfolio.ts not found at ${source} — skipping content seed.`,
    );
    return null;
  }

  const { outputText } = ts.transpileModule(readFileSync(source, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
  });

  const exports: Record<string, unknown> = {};
  new Function('exports', 'require', outputText)(exports, require);

  return exports;
}

/**
 * The six section headings. `key` is the stable machine name the frontend looks
 * up; index/label/title/subtitle are the literals currently hardcoded in the
 * six SectionHeading call sites, so seeding them reproduces today's rendering
 * exactly and the admin has real values to edit from the first run.
 */
const SECTION_META: SectionMetaSeed[] = [
  {
    key: 'about',
    index: '01',
    label: 'PROFILE',
    title: 'About Me',
    subtitle:
      'Bridging software craftsmanship, modern mobile architecture, and intelligent robotics.',
    order: 0,
  },
  {
    key: 'skills',
    index: '02',
    label: 'EXPERTISE',
    title: 'Technical Stack',
    subtitle:
      'Tools, languages, and frameworks I leverage to engineer performant, reliable software.',
    order: 1,
  },
  {
    key: 'experience',
    index: '03',
    label: 'CAREER',
    title: 'Experience & Education',
    subtitle:
      'Chronological track of engineering projects, specialized development tracks, and academic foundations.',
    order: 2,
  },
  {
    key: 'projects',
    index: '04',
    label: 'PORTFOLIO',
    title: 'Featured Projects',
    subtitle:
      'A curated showcase of cross-platform mobile apps, reactive web platforms, and robust APIs.',
    order: 3,
  },
  {
    key: 'certificates',
    index: '05',
    label: 'CREDENTIALS',
    title: 'Licenses & Certifications',
    subtitle:
      'Verified technical credentials, specialized engineering tracks, and algorithmic problem-solving qualifications.',
    order: 4,
  },
  {
    key: 'contact',
    index: '06',
    label: 'CONNECT',
    title: "Let's Build Together",
    subtitle:
      "Have a project in mind, an opportunity to discuss, or just want to say hello? My inbox is always open.",
    order: 5,
  },
];

interface SectionMetaSeed {
  key: string;
  index: string;
  label: string;
  title: string;
  subtitle: string;
  order: number;
}

/**
 * Quick facts used to have no icon field: about.tsx picked a glyph from a
 * positional array. The keys below reproduce today's icons exactly, so the
 * seeded rows render identically while becoming order-independent.
 */
const QUICK_FACT_ICONS = ['graduation', 'location', 'sparkles', 'terminal'] as const;

const CATEGORY_BY_LABEL = new Map<string, CertificateCategory>(
  Object.entries(CERTIFICATE_CATEGORY_LABELS).map(([value, label]) => [label, value as CertificateCategory]),
);

function toCategory(label: string): CertificateCategory {
  const mapped = CATEGORY_BY_LABEL.get(label);
  if (!mapped) {
    console.error(
      `\n[seed] Certificate category "${label}" has no matching enum value. Known: ${[...CATEGORY_BY_LABEL.keys()].join(' | ')}\n`,
    );
    process.exit(1);
  }
  return mapped;
}

async function seedAdmin(): Promise<void> {
  const email = requireEnv('ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('ADMIN_PASSWORD');

  if (password.length < 12) {
    console.error('\n[seed] ADMIN_PASSWORD must be at least 12 characters.\n');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`[seed] admin user ready: ${admin.email}`);
}

async function seedProjects(projects: PortfolioProject[]): Promise<void> {
  for (const [index, project] of projects.entries()) {
    const data = {
      description: project.description,
      technologies: project.technologies,
      category: project.category,
      featured: project.featured,
      order: index,
    };

    // Project.title is not unique in the schema (no migration was wanted for
    // this), so this is a find-then-write rather than a single upsert. Safe
    // here because seeding is single-threaded.
    const existing = await prisma.project.findFirst({ where: { title: project.title } });

    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data });
    } else {
      await prisma.project.create({ data: { title: project.title, ...data } });
    }
  }
  console.log(`[seed] ${projects.length} project(s) ready`);
}

async function seedCertificates(certificates: PortfolioCertificate[]): Promise<void> {
  for (const [index, certificate] of certificates.entries()) {
    const data = {
      title: certificate.title,
      issuer: certificate.issuer,
      issueDate: certificate.issueDate,
      credentialId: certificate.credentialId,
      credentialUrl: certificate.credentialUrl ?? null,
      category: toCategory(certificate.category),
      skills: certificate.skills,
      badgeText: certificate.badgeText,
      description: certificate.description,
      featured: certificate.featured ?? false,
      previewImageUrl: certificate.previewImage ?? null,
      fileUrl: certificate.file ?? null,
      order: index,
    };

    // The frontend slugs (e.g. "icpc-ecpc-contest") are preserved as the
    // primary key so the Stage 1 cutover keeps the same identifiers.
    await prisma.certificate.upsert({
      where: { id: certificate.id },
      update: data,
      create: { id: certificate.id, ...data },
    });
  }
  console.log(`[seed] ${certificates.length} certificate(s) ready`);
}

async function seedCertificateStats(
  stats: Array<{ value: string; label: string; desc?: string }>,
): Promise<void> {
  for (const [index, stat] of stats.entries()) {
    // Idempotent on (value, label): both are admin-editable, so neither is a safe
    // key, and a rerun should not duplicate a row an admin has since tweaked.
    const existing = await prisma.certificateStat.findFirst({
      where: { value: stat.value, label: stat.label },
    });

    if (existing) {
      await prisma.certificateStat.update({ where: { id: existing.id }, data: { order: index } });
    } else {
      await prisma.certificateStat.create({
        data: { value: stat.value, label: stat.label, desc: stat.desc ?? null, order: index },
      });
    }
  }
  console.log(`[seed] ${stats.length} certificate stat(s) ready`);
}

async function seedIssuingOrganizations(names: string[]): Promise<void> {
  for (const [index, name] of names.entries()) {
    const existing = await prisma.issuingOrganization.findFirst({ where: { name } });

    if (existing) {
      await prisma.issuingOrganization.update({
        where: { id: existing.id },
        data: { order: index },
      });
    } else {
      await prisma.issuingOrganization.create({ data: { name, order: index } });
    }
  }
  console.log(`[seed] ${names.length} issuing organization(s) ready`);
}

async function seedSectionMeta(): Promise<void> {
  for (const row of SECTION_META) {
    // Keyed on `key`, not `id`: the Stage 3 fix made the id autoincrementing
    // precisely because this table holds six rows, so only `key` is stable.
    await prisma.sectionMeta.upsert({
      where: { key: row.key },
      create: row,
      update: {
        index: row.index,
        label: row.label,
        title: row.title,
        subtitle: row.subtitle,
        order: row.order,
      },
    });
  }
  console.log(`[seed] ${SECTION_META.length} section heading(s) ready`);
}

async function seedSiteConfig(personal: Record<string, unknown>): Promise<void> {
  const roles = Array.isArray(personal.roles) ? (personal.roles as string[]) : [];

  await prisma.siteConfig.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      name: String(personal.name ?? ''),
      firstName: (personal.firstName as string) ?? null,
      lastName: (personal.lastName as string) ?? null,
      title: String(personal.title ?? ''),
      metaDescription: String(personal.metaDescription ?? ''),
      url: (personal.url as string) ?? null,
      headline: (personal.headline as string) ?? null,
      photoUrl: (personal.photo as string) ?? null,
      resumeUrl: (personal.resumePath as string) ?? null,
      location: (personal.location as string) ?? null,
      status: (personal.status as string) ?? null,
      statusSubtext: (personal.statusSubtext as string) ?? null,
      roles,
    },
    // Personal identity is seeded once and then owned by the admin; only the
    // fields with no admin UI yet would drift, so nothing is overwritten.
    update: {},
  });
  console.log('[seed] site config ready');
}

async function seedNavItems(items: NavItemSeed[]): Promise<void> {
  // NavItem has no unique natural key, so ids are derived from the href to keep
  // the seed idempotent without adding a migration for a uniqueness constraint.
  for (const [index, item] of items.entries()) {
    await prisma.navItem.upsert({
      where: { id: slug(item.href) },
      create: { id: slug(item.href), label: item.label, href: item.href, order: index },
      update: { label: item.label, href: item.href, order: index },
    });
  }
  console.log(`[seed] ${items.length} nav item(s) ready`);
}

function slug(href: string): string {
  return href.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'nav';
}

async function seedSocialLinks(links: Record<string, unknown>): Promise<void> {
  await prisma.socialLinks.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      email: (links.email as string) ?? null,
      phone: (links.phone as string) ?? null,
      github: (links.github as string) ?? null,
      linkedin: (links.linkedin as string) ?? null,
      twitter: (links.twitter as string) ?? null,
      facebook: (links.facebook as string) ?? null,
    },
    update: {},
  });
  console.log('[seed] social links ready');
}

async function seedStats(stats: StatSeed[]): Promise<void> {
  // Stat has no natural key either; value+label is stable enough for a seed.
  for (const [order, stat] of stats.entries()) {
    const existing = await prisma.stat.findFirst({
      where: { value: stat.value, label: stat.label },
    });
    if (existing) {
      await prisma.stat.update({ where: { id: existing.id }, data: { order } });
    } else {
      await prisma.stat.create({ data: { ...stat, order } });
    }
  }
  console.log(`[seed] ${stats.length} stat(s) ready`);
}

async function seedAbout(about: AboutSeed): Promise<void> {
  const academicFocus = (about.academicFocus ?? {}) as Record<string, unknown>;

  await prisma.aboutContent.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      sectionSubtitle: about.sectionSubtitle ?? null,
      narrativeTitle: about.narrativeTitle ?? null,
      paragraphs: about.paragraphs ?? [],
      highlights: about.highlights ?? [],
      academicFocusTitle: (academicFocus.title as string) ?? null,
      academicFocusDescription: (academicFocus.description as string) ?? null,
    },
    update: {},
  });

  const quickFacts = about.quickFacts ?? [];
  for (const [order, fact] of quickFacts.entries()) {
    const icon = QUICK_FACT_ICONS[order] ?? null;
    const existing = await prisma.quickFact.findFirst({
      where: { label: fact.label, value: fact.value },
    });
    if (existing) {
      await prisma.quickFact.update({ where: { id: existing.id }, data: { order, icon } });
    } else {
      await prisma.quickFact.create({
        data: {
          label: fact.label,
          value: fact.value,
          detail: fact.detail ?? null,
          icon,
          order,
          aboutId: 1,
        },
      });
    }
  }
  console.log(`[seed] about content + ${quickFacts.length} quick fact(s) ready`);
}

async function seedSkills(data: Record<string, unknown>): Promise<void> {
  const categories = (data.skillCategories ?? []) as SkillCategorySeed[];
  const spotlights = (data.skillSpotlights ?? {}) as Record<
    string,
    { summary: string; patterns: string[]; primaryProject: string }
  >;

  for (const [order, category] of categories.entries()) {
    // Categories have no natural key; the title is unique in practice and is
    // what the frontend spotlight map is keyed by anyway.
    let row = await prisma.skillCategory.findFirst({ where: { title: category.title } });
    if (!row) {
      row = await prisma.skillCategory.create({
        data: { title: category.title, icon: category.icon ?? null, order },
      });
    } else {
      await prisma.skillCategory.update({
        where: { id: row.id },
        data: { title: category.title, icon: category.icon ?? null, order },
      });
    }

    for (const [skillOrder, name] of category.skills.entries()) {
      const existing = await prisma.skill.findFirst({
        where: { name, categoryId: row.id },
      });
      if (existing) {
        await prisma.skill.update({ where: { id: existing.id }, data: { order: skillOrder } });
      } else {
        await prisma.skill.create({
          data: { name, order: skillOrder, categoryId: row.id },
        });
      }
    }

    const spotlight = spotlights[category.title];
    if (spotlight) {
      await prisma.skillSpotlight.upsert({
        where: { categoryId: row.id },
        create: {
          categoryId: row.id,
          summary: spotlight.summary ?? null,
          patterns: spotlight.patterns ?? [],
          primaryProject: spotlight.primaryProject ?? null,
        },
        update: {
          summary: spotlight.summary ?? null,
          patterns: spotlight.patterns ?? [],
          primaryProject: spotlight.primaryProject ?? null,
        },
      });
    }
  }
  console.log(`[seed] ${categories.length} skill categor(ies) ready`);
}

async function seedPhilosophyQuote(quote: { quote: string; author?: string }): Promise<void> {
  await prisma.philosophyQuote.upsert({
    where: { id: 1 },
    create: { id: 1, quote: quote.quote, author: quote.author ?? null },
    update: {},
  });
  console.log('[seed] philosophy quote ready');
}

async function seedTickerSkills(labels: string[]): Promise<void> {
  for (const [order, label] of labels.entries()) {
    const existing = await prisma.tickerSkill.findFirst({ where: { label } });
    if (existing) {
      await prisma.tickerSkill.update({ where: { id: existing.id }, data: { order } });
    } else {
      await prisma.tickerSkill.create({ data: { label, order } });
    }
  }
  console.log(`[seed] ${labels.length} ticker skill(s) ready`);
}

async function seedExperiences(items: ExperienceSeed[]): Promise<void> {
  for (const [order, item] of items.entries()) {
    const existing = await prisma.experience.findFirst({
      where: { role: item.role, company: item.company },
    });
    const data = { ...item, order };
    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data });
    } else {
      await prisma.experience.create({ data });
    }
  }
  console.log(`[seed] ${items.length} experience(s) ready`);
}

async function seedEducation(items: EducationSeed[]): Promise<void> {
  for (const [order, item] of items.entries()) {
    const existing = await prisma.education.findFirst({
      where: { degree: item.degree, institution: item.institution },
    });
    const data = { ...item, order };
    if (existing) {
      await prisma.education.update({ where: { id: existing.id }, data });
    } else {
      await prisma.education.create({ data });
    }
  }
  console.log(`[seed] ${items.length} education entr(ies) ready`);
}

async function seedFutureGoals(goals: FutureGoalsSeed): Promise<void> {
  await prisma.futureGoals.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      title: goals.title,
      description: goals.description ?? null,
      items: goals.items ?? [],
    },
    update: {},
  });
  console.log('[seed] future goals ready');
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedSectionMeta();

  const data = loadPortfolioData();
  if (!data) return;

  const personal = (data.personalInfo ?? {}) as Record<string, unknown>;
  await seedSiteConfig(personal);
  await seedSocialLinks((data.socialLinks ?? {}) as Record<string, unknown>);
  await seedNavItems((data.navItems ?? []) as NavItemSeed[]);
  await seedStats((data.stats ?? []) as StatSeed[]);
  await seedAbout((data.aboutData ?? {}) as AboutSeed);
  await seedSkills(data);
  await seedPhilosophyQuote(
    (data.philosophyQuote ?? { quote: '' }) as { quote: string; author?: string },
  );
  await seedTickerSkills((data.tickerSkills ?? []) as string[]);
  await seedExperiences((data.experiences ?? []) as ExperienceSeed[]);
  await seedEducation((data.education ?? []) as EducationSeed[]);
  await seedFutureGoals(
    (data.futureGoals ?? { title: '', items: [] }) as FutureGoalsSeed,
  );

  // Stage 1 content, kept last so a failure above does not half-apply the new
  // sections before the older ones.
  await seedProjects((data.projects ?? []) as PortfolioProject[]);
  await seedCertificates((data.certificates ?? []) as PortfolioCertificate[]);
  await seedCertificateStats(
    (data.certificateStats ?? []) as Array<{ value: string; label: string; desc?: string }>,
  );
  await seedIssuingOrganizations((data.issuingOrganizations ?? []) as string[]);
}

main()
  .catch((error: unknown) => {
    console.error('[seed] failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
