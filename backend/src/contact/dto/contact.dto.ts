import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/**
 * Server-side length caps for every field on a submission, applied regardless of
 * what the browser validated (BACKEND_PLAN.md §4.4). The caps are generous enough
 * for a real message and small enough that a single row cannot bloat the table.
 */
export const CONTACT_LIMITS = {
  name: 100,
  /// RFC 5321 maximum length of a forward path.
  email: 254,
  subject: 200,
  message: 5000,
  /// The honeypot is never rendered and never read by a human, so it only needs
  /// to be long enough to be a plausible-looking text input.
  honeypot: 200,
} as const;

export class CreateContactSubmissionDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(CONTACT_LIMITS.name)
  name!: string;

  /// Trimmed and lowercased so the same sender always looks identical in the
  /// inbox regardless of how their mail client capitalised the domain part.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(CONTACT_LIMITS.email)
  email!: string;

  /// Optional: the live Contact form leaves "Subject / Project Scope" blankable.
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(CONTACT_LIMITS.subject)
  subject?: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(CONTACT_LIMITS.message)
  message!: string;

  /**
   * Honeypot (BACKEND_PLAN.md §4.4). A real visitor never sees this input, so it
   * is always empty; anything that fills it in is a bot and the submission is
   * dropped. Kept on the DTO rather than handled ad hoc so it is still subject
   * to whitelist validation.
   */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(CONTACT_LIMITS.honeypot)
  website?: string;
}

export class MarkSubmissionReadDto {
  /**
   * Defaults to true (the "mark as read" action in BACKEND_PLAN.md §4.4). Passing
   * false lets the inbox move a submission back to unread without a second
   * endpoint.
   */
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}