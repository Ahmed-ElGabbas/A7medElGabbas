import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/transform';

export class CreateExperienceDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  role!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  company!: string;

  /** Free-form range text, e.g. "2024 — Present". */
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  period!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(1200)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(48, { each: true })
  @ArrayMaxSize(30)
  technologies?: string[];
}

export class UpdateExperienceDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  role?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  company?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  period?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(1200)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(48, { each: true })
  @ArrayMaxSize(30)
  technologies?: string[];
}

export class CreateEducationDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  degree!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  institution!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  period!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1200)
  description?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(64)
  gpa?: string;

  /**
   * Stored as a real column. This is what the Stage 3 audit flagged: the
   * frontend used to render a hardcoded course list regardless of this value, so
   * editing courses here had no visible effect.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  @ArrayMaxSize(30)
  courses?: string[];
}

export class UpdateEducationDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  degree?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  institution?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  period?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1200)
  description?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(64)
  gpa?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  @ArrayMaxSize(30)
  courses?: string[];
}

export class UpdateFutureGoalsDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  @ArrayMaxSize(12)
  items?: string[];
}