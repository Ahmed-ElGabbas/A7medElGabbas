import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Media references accept either an absolute https URL (an R2 public URL) or a
 * root-relative path (/assets/certificates/x.pdf). The second form is what the
 * existing static content in src/data/portfolio.ts uses, so it has to stay
 * valid until that content is migrated to R2.
 */
const MEDIA_REF =
  /^(https:\/\/[^\s]+|\/[A-Za-z0-9\-_.~!$&'()*+,;=:@%/?#[\]]*)$/;

const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateProjectDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @ArrayMaxSize(40)
  technologies?: string[];

  /// Free text on purpose — see the schema comment on Project.category. The
  /// admin surfaces existing distinct values as suggestions instead of forcing
  /// a closed set, so new categories need no migration.
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  category!: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'imageUrl must be an https URL or a root-relative path' })
  imageUrl?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'githubUrl must be an https URL or a root-relative path' })
  githubUrl?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'demoUrl must be an https URL or a root-relative path' })
  demoUrl?: string;
}

export class UpdateProjectDto {
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
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @ArrayMaxSize(40)
  technologies?: string[];

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'imageUrl must be an https URL or a root-relative path' })
  imageUrl?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'githubUrl must be an https URL or a root-relative path' })
  githubUrl?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(MEDIA_REF, { message: 'demoUrl must be an https URL or a root-relative path' })
  demoUrl?: string;
}

