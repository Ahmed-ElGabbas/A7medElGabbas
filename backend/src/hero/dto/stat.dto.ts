import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/transform';

/**
 * Hero stats ("2+ / Years Experience").
 *
 * `value` is deliberately free text rather than a number: the existing content
 * uses suffixes ("2+", "500+") and bare counts, which a numeric column could not
 * represent. `label` is the caption rendered underneath.
 */
export class CreateStatDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  value!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label!: string;
}

export class UpdateStatDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  value?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label?: string;
}