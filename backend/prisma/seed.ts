import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

async function main(): Promise<void> {
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

main()
  .catch((error: unknown) => {
    console.error('[seed] failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
