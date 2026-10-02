import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignMediaDto } from './dto/media.dto';

const REQUIRED_VARS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
] as const;

export interface PresignResult {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresInSeconds: number;
}

/**
 * Presigned-upload issuance against Cloudflare R2 over the S3-compatible API.
 *
 * Per BACKEND_PLAN.md §5 the browser PUTs the file bytes straight to R2 using
 * a short-lived URL from here, so large uploads never route through the
 * NestJS process and no upload middleware (multer etc.) is needed.
 */
@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);

  /// Short-lived on purpose: the URL is only used for the immediate PUT.
  private readonly presignExpirySeconds = 300;

  /// Built on first use rather than in the constructor so that booting the API
  /// without R2 credentials still succeeds (the admin UI reads /media/status to
  /// decide whether to offer uploads).
  private client: S3Client | null = null;

  constructor(private readonly config: ConfigService) {}

  /**
   * Which required R2 vars are currently absent or blank. Empty means the
   * module is ready to sign.
   */
  missingConfig(): string[] {
    return REQUIRED_VARS.filter((name) => {
      const value = this.config.get<string>(name);
      return !value || !value.trim();
    });
  }

  isConfigured(): boolean {
    return this.missingConfig().length === 0;
  }

  private assertConfigured(): void {
    const missing = this.missingConfig();
    if (missing.length > 0) {
      this.logger.warn(`R2 upload requested but config is incomplete: ${missing.join(', ')}`);
      throw new ServiceUnavailableException(
        `Cloudflare R2 is not configured. Set ${missing.join(', ')} in backend/.env.`,
      );
    }
  }

  /**
   * Builds a collision-resistant, path-safe object key. The original filename
   * is only used for its extension, so nothing user-controlled (other than the
   * sanitised extension) reaches the key.
   */
  buildKey(dto: PresignMediaDto): string {
    const extension = extensionFor(dto.contentType, dto.originalFilename);
    const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `uploads/${unique}${extension}`;
  }

  buildPublicUrl(key: string): string {
    const base = (this.config.get<string>('R2_PUBLIC_URL') ?? '').trim().replace(/\/+$/, '');
    return `${base}/${key}`;
  }

  /**
   * Inverse of buildPublicUrl, used when deleting an asset.
   *
   * Deliberately strict: the URL must sit on the configured R2_PUBLIC_URL
   * origin and the remainder must match the exact shape buildKey emits. That
   * prevents a tampered media_assets row from being turned into an arbitrary
   * DeleteObject call against some other key in the bucket.
   *
   * Returns undefined when the URL is not one of ours.
   */
  keyFromPublicUrl(url: string): string | undefined {
    const base = (this.config.get<string>('R2_PUBLIC_URL') ?? '').trim().replace(/\/+$/, '');
    if (!base) return undefined;

    const prefix = `${base}/`;
    if (!url.startsWith(prefix)) return undefined;

    const key = url.slice(prefix.length);
    return /^uploads\/[A-Za-z0-9][A-Za-z0-9\-_.]*$/.test(key) ? key : undefined;
  }

  /**
   * Cloudflare exposes R2 through an account-scoped endpoint rather than
   * region-scoped ones, so the region is always the literal "auto" and the
   * account id becomes the endpoint host.
   */
  buildEndpoint(): string {
    return `https://${this.config.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
  }

  private s3Client(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: this.buildEndpoint(),
        credentials: {
          accessKeyId: this.config.get<string>('R2_ACCESS_KEY_ID') ?? '',
          secretAccessKey: this.config.get<string>('R2_SECRET_ACCESS_KEY') ?? '',
        },
        // Cloudflare's documented presigned URLs are path-style
        // (https://<account>.r2.cloudflarestorage.com/<bucket>/<key>), so the
        // bucket is kept in the path rather than hoisted into the hostname.
        forcePathStyle: true,
      });
    }
    return this.client;
  }

  /**
   * Signs a single PUT for one object.
   *
   * ContentType is part of the signature, so the browser must send a matching
   * `Content-Type` header on the PUT or R2 rejects it with SignatureDoesNotMatch.
   * ContentLength is deliberately *not* signed — the upload size is already
   * capped by PresignMediaDto, and signing it makes the URL fragile against
   * intermediaries that rewrite Content-Length.
   */
  async presignPut(dto: PresignMediaDto, key: string): Promise<PresignResult> {
    this.assertConfigured();

    const bucket = this.config.get<string>('R2_BUCKET') as string;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client(), command, {
      expiresIn: this.presignExpirySeconds,
    });

    return {
      key,
      uploadUrl,
      publicUrl: this.buildPublicUrl(key),
      expiresInSeconds: this.presignExpirySeconds,
    };
  }

  /**
   * Removes the stored object. Used by the media registry so deleting an asset
   * does not leave an orphan object consuming the R2 free tier.
   *
   * Callers treat failure as non-fatal — see MediaService.remove.
   */
  async deleteObject(key: string): Promise<void> {
    this.assertConfigured();

    const command = new DeleteObjectCommand({
      Bucket: this.config.get<string>('R2_BUCKET') as string,
      Key: key,
    });

    await this.s3Client().send(command);
  }
}

/** Maps a content type to a file extension, falling back to the filename's. */
export function extensionFor(contentType: string, filename: string): string {
  const fromMime: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
  };

  const byMime = fromMime[contentType.toLowerCase()];
  if (byMime) return byMime;

  const match = /\.([A-Za-z0-9]{1,8})$/.exec(filename);
  return match ? `.${match[1].toLowerCase()}` : '';
}