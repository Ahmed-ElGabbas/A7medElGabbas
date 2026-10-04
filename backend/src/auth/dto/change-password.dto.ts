import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Minimum length for a new admin password.
 *
 * Long rather than complex: this account is reachable from the public internet,
 * and a passphrase the owner can actually remember beats a short string with
 * punctuation rules that push people toward reuse.
 */
export const MIN_PASSWORD_LENGTH = 12;

/** Generous ceiling; bcrypt only reads the first 72 bytes, but the field is still bounded. */
export const MAX_PASSWORD_LENGTH = 200;

/**
 * Deliberately no `@Trim()` here, unlike the other DTOs in this service: a
 * password is an exact secret, and trimming it would silently store something
 * other than what the admin typed.
 */
export class ChangePasswordDto {
  /// Verified against the stored hash before anything is written.
  @IsString()
  @MinLength(1, { message: 'currentPassword is required' })
  @MaxLength(MAX_PASSWORD_LENGTH)
  currentPassword!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `newPassword must be at least ${MIN_PASSWORD_LENGTH} characters`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH)
  newPassword!: string;
}