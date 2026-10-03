import { Transform } from 'class-transformer';

/**
 * Trims strings on the way in.
 *
 * Without this, an admin who types a value and leaves a trailing space stores
 * "Available for Hire " which renders with a stray gap and silently fails
 * uniqueness-style comparisons. Applied before the class-validator length
 * checks so a whitespace-only value trips MinLength instead of being stored.
 *
 * Non-strings pass through untouched, which is what lets it sit safely in front
 * of optional and array-typed properties.
 */
export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));