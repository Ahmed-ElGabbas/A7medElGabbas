import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/transform';

/**
 * Icon keys the frontend knows how to draw. Kept in sync with
 * QUICK_FACT_ICONS in src/lib/content-icons.ts.
 *
 * This was the root cause of the Stage 3 bug: about.tsx picked icons by array
 * position, so reordering or deleting a quick fact in the admin silently gave the
 * remaining rows the wrong glyph. Storing the key on the row makes the mapping
 * data-driven and reordering safe.
 */
export const QUICK_FACT_ICON_KEYS = [
  'graduation',
  'location',
  'sparkles',
  'terminal',
  'code',
  'briefcase',
  'award',
  'user',
  'globe',
  'heart',
] as const;

export type QuickFactIconKey = (typeof QUICK_FACT_ICON_KEYS)[number];

/**
 * Spread into a mutable array because IsIn takes any[], and the message names
 * the valid keys so the admin sees the fix rather than a bare failure.
 */
const IsQuickFactIconKey = () =>
  IsIn([...QUICK_FACT_ICON_KEYS], {
    message: `icon must be one of: ${QUICK_FACT_ICON_KEYS.join(', ')}`,
  });

export class UpdateAboutContentDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  sectionSubtitle?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  narrativeTitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(1200, { each: true })
  @ArrayMaxSize(20)
  paragraphs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  @ArrayMaxSize(20)
  highlights?: string[];

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  academicFocusTitle?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1200)
  academicFocusDescription?: string;
}

export class CreateQuickFactDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  value!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  detail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  @IsQuickFactIconKey()
  icon?: string;
}

export class UpdateQuickFactDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  value?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  detail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  @IsQuickFactIconKey()
  icon?: string;
}