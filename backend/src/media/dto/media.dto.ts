import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MediaKind } from '@prisma/client';

const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

const MIME_TYPE = /^(image\/(png|jpe?g|webp|gif|avif|svg\+xml)|application\/pdf)$/;

const OBJECT_KEY = /^[A-Za-z0-9][A-Za-z0-9\-_.]*(\/[A-Za-z0-9][A-Za-z0-9\-_.]*)*$/;

/** 25 MB ceiling, re-checked server-side before a URL is signed. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export class PresignMediaDto {
  /// Only images and PDFs — matches the MediaKind enum and what the
  /// certificate and project sections actually store.
  @IsString()
  @Matches(MIME_TYPE, {
    message: 'contentType must be an image/* type or application/pdf',
  })
  contentType!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  originalFilename!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES)
  size!: number;
}

export class RegisterMediaDto extends PresignMediaDto {
  /// The object key the presign response handed back. Constrained so a client
  /// cannot register a row pointing somewhere outside its own prefix.
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  @Matches(OBJECT_KEY, { message: 'key must be a clean object key with no leading slash' })
  key!: string;

  @IsEnum(MediaKind)
  kind!: MediaKind;
}
