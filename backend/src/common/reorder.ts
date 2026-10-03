import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Shared implementation of the `PATCH /<collection>/reorder` behaviour
 * (BACKEND_PLAN.md §4.2).
 *
 * Every orderable list — stats, quick facts, skill categories, skills within a
 * category, ticker skills, experiences, education, projects, certificates — needs
 * exactly the same thing: validate an incoming id array, then rewrite `order` for
 * the whole set in one transaction. That was duplicated per module, so it lives
 * here once and each service supplies only its model-specific queries.
 *
 * The update callback returns a PrismaPromise, which is what lets
 * `$transaction` run the writes together instead of N round trips. Passing a
 * callback rather than a Prisma model delegate keeps this fully type-safe: a
 * delegate's `findMany`/`update` overloads are far too specific to match a
 * hand-written structural interface without casts.
 *
 * Validation runs before any write, so a bad payload leaves the existing order
 * untouched rather than half-applied.
 */
export async function applyReorder(
  prisma: PrismaService,
  ids: string[],
  existingIds: string[],
  label: string,
  update: (id: string, order: number) => Prisma.PrismaPromise<unknown>,
  startOrder = 0,
): Promise<void> {
  const known = new Set(existingIds);

  const unknown = ids.filter((id) => !known.has(id));
  if (unknown.length > 0) {
    throw new BadRequestException(`Unknown ${label} ids: ${unknown.join(', ')}`);
  }

  if (new Set(ids).size !== ids.length) {
    throw new BadRequestException('ids must not contain duplicates');
  }

  await prisma.$transaction(ids.map((id, index) => update(id, startOrder + index)));
}