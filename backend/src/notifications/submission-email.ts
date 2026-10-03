import type { ContactSubmission } from '@prisma/client';

/** The parts of a stored submission an email needs. */
export type SubmissionForEmail = Pick<
  ContactSubmission,
  'id' | 'name' | 'email' | 'subject' | 'message' | 'createdAt'
>;

export interface SubmissionEmailContent {
  subject: string;
  text: string;
  html: string;
}

export interface SubmissionEmailOptions {
  /** Public base URL of the Next.js app, e.g. https://example.com. */
  frontendUrl: string;
}

/**
 * Escapes the five characters that can break out of HTML text or an attribute.
 *
 * Every value below reaches this email straight from an unauthenticated public
 * form, so name/subject/message are attacker-controlled. Rendering them raw
 * would both break the markup and open an injection seam in whatever client
 * opens the notification.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips CR/LF/TAB and clamps the length.
 *
 * Used for the Subject header, which is the one place user input reaches an
 * envelope-level field: a newline in a header is header injection, and the name
 * is otherwise unbounded as far as the mail layer is concerned.
 */
function headerSafe(value: string, maxLength = 60): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLength);
}

/**
 * The deep link from the notification into the admin inbox, per BACKEND_PLAN.md
 * §4.4. Trailing slashes on the configured base are normalised so a value pasted
 * as "https://example.com/" does not produce a doubled path.
 */
export function adminSubmissionUrl(frontendUrl: string, id: string): string {
  const base = frontendUrl.trim().replace(/\/+$/, '');
  return `${base}/admin/contact?submission=${encodeURIComponent(id)}`;
}

/**
 * Builds a mailto: href, or returns null when the value is not a plain address.
 *
 * escapeHtml alone is not enough for an href: it stops the value breaking out of
 * the attribute, but a value like "javascript:alert(1)" would still land inside
 * `href="mailto:..."`. The DTO already rejects anything that is not an email, so
 * this is defence in depth for the one place visitor input becomes a link target
 * — and it degrades to plain text instead of an unsafe anchor.
 */
function mailtoHref(email: string): string | null {
  const address = email.trim();
  if (!/^[^\s"'<>()]+@[^\s"'<>()]+\.[^\s"'<>()]+$/.test(address)) return null;
  return `mailto:${escapeHtml(address)}`;
}

const label = (text: string): string =>
  `<p style="margin:0 0 4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a8a8a;">${text}</p>`;

/**
 * Builds the notification email for a new contact submission.
 *
 * Pure and synchronous on purpose: this is the part worth exhaustively testing
 * (escaping, deep links, header safety, both renderings agreeing) and it must
 * never depend on the Resend client or the network.
 */
export function buildSubmissionEmail(
  submission: SubmissionForEmail,
  options: SubmissionEmailOptions,
): SubmissionEmailContent {
  const adminUrl = adminSubmissionUrl(options.frontendUrl, submission.id);
  const safeName = headerSafe(submission.name);
  const subjectLabel = submission.subject.trim() || '(no subject)';
  const receivedAt = submission.createdAt.toISOString();

  const emailSubject = `New portfolio contact submission from ${safeName || 'someone'}`;

  const text = [
    'New submission on your portfolio contact form.',
    '',
    `Name:     ${submission.name}`,
    `Email:    ${submission.email}`,
    `Subject:  ${subjectLabel}`,
    `Received: ${receivedAt}`,
    '',
    'Message:',
    submission.message,
    '',
    `Open in the admin inbox: ${adminUrl}`,
  ].join('\n');

  const emailHref = mailtoHref(submission.email);
  const emailHtml = emailHref
    ? `<a href="${emailHref}" style="color:#c9a227;">${escapeHtml(submission.email)}</a>`
    : `<span style="color:#f4f4f5;">${escapeHtml(submission.email)}</span>`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0b0c;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <p style="margin:0 0 16px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c9a227;">
        Portfolio / contact
      </p>

      <div style="border:1px solid #2a2a2c;border-radius:12px;padding:20px;background:#111113;">
        <p style="margin:0 0 16px;font-size:15px;color:#f4f4f5;">
          New submission from <strong style="color:#c9a227;">${escapeHtml(submission.name)}</strong>
        </p>

        <div style="margin-bottom:14px;">
          ${label('Name')}
          <p style="margin:0;font-size:14px;color:#f4f4f5;">${escapeHtml(submission.name)}</p>
        </div>

        <div style="margin-bottom:14px;">
          ${label('Email')}
          <p style="margin:0;font-size:14px;">${emailHtml}</p>
        </div>

        <div style="margin-bottom:14px;">
          ${label('Subject')}
          <p style="margin:0;font-size:14px;color:#f4f4f5;">${escapeHtml(subjectLabel)}</p>
        </div>

        <div style="margin-bottom:18px;">
          ${label('Message')}
          <p style="margin:0;font-size:14px;line-height:1.6;color:#f4f4f5;white-space:pre-wrap;word-break:break-word;">${escapeHtml(submission.message)}</p>
        </div>

        <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#c9a227;color:#0b0b0c;font-size:12px;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;">
          Open in admin inbox
        </a>

        <p style="margin:16px 0 0;font-size:11px;color:#8a8a8a;">
          Received ${escapeHtml(receivedAt)} &middot; Reply directly to ${escapeHtml(submission.email)}
        </p>
      </div>
    </div>
  </body>
</html>`;

  return { subject: emailSubject, text, html };
}