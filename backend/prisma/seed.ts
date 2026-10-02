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

/**
 * Loads the live frontend data module so the seeded rows cannot drift from
 * src/data/portfolio.ts. That file is pure data with no imports, so it can be
 * transpiled and evaluated in isolation; a JSON copy would rot silently.
 */
function loadPortfolioData(): {
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
} | null {
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

  return {
    projects: (exports.projects ?? []) as PortfolioProject[],
    certificates: (exports.certificates ?? []) as PortfolioCertificate[],
  };
}

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

async function main(): Promise<void> {
  await seedAdmin();

  const data = loadPortfolioData();
  if (data) {
    await seedProjects(data.projects);
    await seedCertificates(data.certificates);
  }
}

main()
  .catch((error: unknown) => {
    console.error('[seed] failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
