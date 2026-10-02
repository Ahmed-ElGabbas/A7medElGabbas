import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CertificateCategory } from '@prisma/client';

/**
 * Display labels for the hard CertificateCategory enum. The DB keeps the enum
 * keys (see the schema comment — the set is fixed by the filtering logic in
 * src/components/sections/certificates.tsx), while the frontend has always
 * used these human-readable strings. The API returns both so the frontend
 * renders the label without a lookup table and the constraint stays enforced
 * in the database.
 */
export const CERTIFICATE_CATEGORY_LABELS: Record<CertificateCategory, string> = {
  MOBILE_FLUTTER: 'Mobile & Flutter',
  WEB_FRONTEND: 'Web & Frontend',
  BACKEND_APIS: 'Backend & APIs',
  ALGORITHMS_AI: 'Algorithms & AI',
};

const MEDIA_REF =
  /^(https:\/\/[^\s]+|\/[A-Za-z0-9\-_.~!$&'()*+,;=:@%/?#[\]]*)$/;

const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateCertificateDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  issuer!: string;

  /// Free text on purpose — existing values mix "2024" and "20/01/26", so
  /// forcing a single date format would either break them or lose information.
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  issueDate!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  credentialId!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  credentialUrl?: string;

  @IsEnum(CertificateCategory)
  category!: CertificateCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @ArrayMaxSize(40)
  skills?: string[];

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  badgeText!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'previewImageUrl must be an https URL or a root-relative path' })
  previewImageUrl?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'fileUrl must be an https URL or a root-relative path' })
  fileUrl?: string;
}

export class UpdateCertificateDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  issuer?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  issueDate?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  credentialId?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  credentialUrl?: string;

  @IsOptional()
  @IsEnum(CertificateCategory)
  category?: CertificateCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @ArrayMaxSize(40)
  skills?: string[];

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  badgeText?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'previewImageUrl must be an https URL or a root-relative path' })
  previewImageUrl?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'fileUrl must be an https URL or a root-relative path' })
  fileUrl?: string;
}

export class ReorderCertificatesDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @ArrayMaxSize(500)
  ids!: string[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  startOrder?: number;
}
