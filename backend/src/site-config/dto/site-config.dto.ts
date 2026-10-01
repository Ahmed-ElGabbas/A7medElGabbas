import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSiteConfigDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  metaDescription!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  url?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  headline?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumeUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  status?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  statusSubtext?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  roles?: string[];
}

export class UpdateSocialLinksDto {
  @IsOptional()
  @IsString()
  @MaxLength(254)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  github?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  linkedin?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  twitter?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  facebook?: string | null;
}

export class UpsertSectionMetaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Type(() => String)
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  index?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  label?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  subtitle?: string | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  order?: number;
}
