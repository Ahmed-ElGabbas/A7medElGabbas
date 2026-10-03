import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

const REQUIRED_VARS = ['RESEND_API_KEY', 'ADMIN_NOTIFICATION_EMAIL'] as const;

/**
 * Resend's built-in test sender. Only delivers to the address on the Resend
 * account, which is exactly what is wanted for a first live send before a domain
 * is verified — it keeps the notification pipeline testable without DNS.
 */
export const RESEND_TEST_FROM = 'Portfolio <onboarding@resend.dev>';

export interface OutboundEmail {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

export interface SendResult {
  id: string;
}

/**
 * Thin transport wrapper over the Resend SDK.
 *
 * Split from NotificationsService for the same reason R2StorageService is split
 * out of MediaService: the network call is the only part that cannot be unit
 * tested, so it is confined to one small, obviously-stubbed class while the
 * content-building and orchestration around it stay pure.
 */
@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);

  /**
   * Built on first use rather than in the constructor, matching
   * R2StorageService: booting the API without a Resend key must still succeed,
   * since contact submissions are stored and read back from the admin inbox
   * regardless of whether email works.
   */
  private client: Resend | null = null;

  constructor(private readonly config: ConfigService) {}

  /** Which required vars are absent or blank. Empty means the module can send. */
  missingConfig(): string[] {
    return REQUIRED_VARS.filter((name) => {
      const value = this.config.get<string>(name);
      return !value || !value.trim();
    });
  }

  isConfigured(): boolean {
    return this.missingConfig().length === 0;
  }

  /**
   * Sender address. NOTIFICATION_FROM_EMAIL lets a verified domain be used;
   * without it the send still works against Resend's own test sender.
   */
  fromAddress(): string {
    const configured = (this.config.get<string>('NOTIFICATION_FROM_EMAIL') ?? '').trim();
    return configured || RESEND_TEST_FROM;
  }

  private assertConfigured(): void {
    const missing = this.missingConfig();
    if (missing.length > 0) {
      this.logger.warn(`Notification requested but config is incomplete: ${missing.join(', ')}`);
      throw new ServiceUnavailableException(
        `Email notifications are not configured. Set ${missing.join(', ')} in backend/.env.`,
      );
    }
  }

  private resend(): Resend {
    if (!this.client) {
      this.client = new Resend(this.config.get<string>('RESEND_API_KEY') as string);
    }
    return this.client;
  }

  /**
   * Sends one message.
   *
   * Resend resolves with `{ error }` rather than rejecting for most API-level
   * failures, so the error branch is checked explicitly and turned into a throw —
   * otherwise a 401 from a rotated key would look like a successful send.
   */
  async send(email: OutboundEmail): Promise<SendResult> {
    this.assertConfigured();

    const { data, error } = await this.resend().emails.send({
      from: this.fromAddress(),
      to: email.to,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (error) {
      throw new Error(`Resend rejected the message: ${error.message}`);
    }

    return { id: data.id };
  }

  /** Exposed so NotificationsService can build content without touching config. */
  frontendUrl(): string {
    return (this.config.get<string>('FRONTEND_URL') ?? '').trim();
  }

  recipient(): string {
    return (this.config.get<string>('ADMIN_NOTIFICATION_EMAIL') ?? '').trim();
  }
}