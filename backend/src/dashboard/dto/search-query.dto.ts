import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/**
 * Dashboard search term.
 *
 * Trimmed before validation so a stray trailing space from a copied query
 * string cannot turn a real search into an empty one (or fail MinLength for a
 * term the user can plainly see in the box).
 */
export class SearchQueryDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'q is required' })
  @MaxLength(120)
  q!: string;
}