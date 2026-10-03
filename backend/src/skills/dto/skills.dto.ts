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
 * Category icon keys, mirrored by SKILL_CATEGORY_ICONS in
 * src/lib/content-icons.ts. Same reasoning as the quick-fact keys: the icon
 * travels with the row so reordering cannot mismatch the glyph.
 */
export const SKILL_CATEGORY_ICON_KEYS = [
  'code',
  'layout',
  'smartphone',
  'server',
  'database',
  'wrench',
  'palette',
  'cloud',
  'brain',
  'terminal',
] as const;

const IsCategoryIconKey = () =>
  IsIn([...SKILL_CATEGORY_ICON_KEYS], {
    message: `icon must be one of: ${SKILL_CATEGORY_ICON_KEYS.join(', ')}`,
  });

export class CreateSkillCategoryDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  @IsCategoryIconKey()
  icon?: string;
}

export class UpdateSkillCategoryDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  @IsCategoryIconKey()
  icon?: string;
}

export class CreateSkillDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name!: string;
}

export class UpdateSkillDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name?: string;
}

/** One spotlight row per category; addressed by category, not by its own id. */
export class UpdateSkillSpotlightDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(400)
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  @ArrayMaxSize(12)
  patterns?: string[];

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(120)
  primaryProject?: string;
}

export class UpdatePhilosophyQuoteDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(600)
  quote?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(80)
  author?: string;
}

export class CreateTickerSkillDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(48)
  label!: string;
}

export class UpdateTickerSkillDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(48)
  label?: string;
}