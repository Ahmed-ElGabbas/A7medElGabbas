import { Injectable, Logger } from '@nestjs/common';
import { ResendService } from './resend.service';
import { buildSubmissionEmail, type SubmissionForEmail } from './submission-email';

export interface NotificationStatus {
  configured: boolean;
  missing: string[];
}

/**
 * Emails the admin when a contact form submission arrives.
 *
 * Every method here is deliberately incapable of throwing: BACKEND_PLAN.md §4.4
 * requires the notification to be non-blocking and fail-safe, and the cheapest
 * way to guarantee a method can never reject is to catch everything inside it
 * rather than rely on every future caller remembering to.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly resend: ResendService) {}

  /**
   * Whether email can be sent at all. Surfaced in the admin inbox so an
   * unconfigured deployment is visible before the first submission is silently
   * never notified about.
   */
  status(): NotificationStatus {
    const missing = this.resend.missingConfig();
    return { configured: missing.length === 0, missing };
  }

  /**
   * Notifies the admin about a new submission.
   *
   * Returns whether the message was handed to Resend — for logging and tests
   * only. Callers must not branch on it; a false here is an expected outcome
   * (no config, or Resend rejected the send), not an error the caller should
   * surface to the visitor.
   */
  async notifyNewSubmission(submission: SubmissionForEmail): Promise<boolean> {
    try {
      if (!this.resend.isConfigured()) {
        this.logger.warn(
          `Skipped the notification for submission ${submission.id}: Resend is not configured (${this.resend
            .missingConfig()
            .join(', ')}). The submission is stored and visible in the admin inbox.`,
        );
        return false;
      }

      const content = buildSubmissionEmail(submission, {
        frontendUrl: this.resend.frontendUrl(),
      });

      const result = await this.resend.send({
        to: this.resend.recipient(),
        /// Lets the admin hit reply in their own mail client and have it land in
        /// the sender's inbox, which BACKEND_PLAN.md §5 relies on instead of an
        /// in-app reply composer.
        replyTo: submission.email,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });

      this.logger.log(`Notification for submission ${submission.id} sent (${result.id}).`);
      return true;
    } catch (error) {
      // The submission is already committed at this point, so the only thing
      // left to do is record that the alert was lost.
      this.logger.error(
        `Could not send the notification for submission ${submission.id}. The submission is saved and the visitor still saw a success response.`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}