import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ContactSubmission } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { hashIp, ipHashSecret } from './contact-privacy';
import { CreateContactSubmissionDto, MarkSubmissionReadDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Stores a submission and kicks off the admin notification.
   *
   * Returns null when the honeypot was filled, which only a bot does. The caller
   * responds identically either way so a bot learns nothing from the status code
   * — that indistinguishability is the whole point of a honeypot, which is why
   * it is signalled by a null return rather than an exception.
   */
  async create(
    dto: CreateContactSubmissionDto,
    context: { ip?: string; userAgent?: string } = {},
  ): Promise<ContactSubmission | null> {
    if (dto.website) {
      this.logger.warn('Dropped a contact submission that filled the honeypot field.');
      return null;
    }

    const submission = await this.prisma.contactSubmission.create({
      data: {
        name: dto.name,
        email: dto.email,
        /// The live form allows a blank subject, and the column is NOT NULL.
        subject: dto.subject ?? '',
        message: dto.message,
        ipHash: hashIp(context.ip, this.hashSecret()),
        /// Trimmed and capped: the header is attacker-controlled and this is the
        /// only place it is retained.
        userAgent: truncate(context.userAgent, 500),
      },
    });

    this.notifyAsync(submission);

    return submission;
  }

  /**
   * Fire-and-forget notification.
   *
   * Deliberately not awaited: the visitor's response must not wait on, or be
   * failed by, a third-party email API (BACKEND_PLAN.md §4.4).
   *
   * The try/catch and the `.catch` are both needed. `.catch` alone does not
   * cover a synchronous throw — the exception escapes before the handler can be
   * attached — and a try/catch alone does not cover a rejected promise. Together
   * they mean no future change to NotificationsService can take down a contact
   * submission that is already safely stored.
   */
  private notifyAsync(submission: ContactSubmission): void {
    const report = (error: unknown): void => {
      this.logger.error(
        `Notification for submission ${submission.id} failed unexpectedly. The submission is saved.`,
        error instanceof Error ? error.stack : String(error),
      );
    };

    try {
      void this.notifications.notifyNewSubmission(submission).catch(report);
    } catch (error) {
      report(error);
    }
  }

  /**
   * Admin inbox. Newest first, plus the unread count the inbox header and the
   * dashboard badge both need — one round trip instead of two.
   */
  async findAll() {
    const [items, unreadCount] = await Promise.all([
      this.prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.contactSubmission.count({ where: { read: false } }),
    ]);

    return { items, unreadCount, notifications: this.notifications.status() };
  }

  /**
   * Marks a submission read or unread. Idempotent — re-marking an already-read
   * row just returns it unchanged.
   */
  async markRead(id: string, dto: MarkSubmissionReadDto = {}): Promise<ContactSubmission> {
    const existing = await this.prisma.contactSubmission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Contact submission "${id}" not found`);

    return this.prisma.contactSubmission.update({
      where: { id },
      data: { read: dto.read ?? true },
    });
  }

  private hashSecret(): string | undefined {
    return ipHashSecret({
      CONTACT_IP_HASH_SALT: this.config.get<string>('CONTACT_IP_HASH_SALT'),
      JWT_SECRET: this.config.get<string>('JWT_SECRET'),
    });
  }
}

/** Caps an unbounded, attacker-controlled header before it reaches the DB. */
function truncate(value: string | undefined, maxLength: number): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}