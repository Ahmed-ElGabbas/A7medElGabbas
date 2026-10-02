import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PresignMediaDto, RegisterMediaDto } from './dto/media.dto';
import { PresignResult, R2StorageService } from './r2.storage';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: R2StorageService,
  ) {}

  /**
   * Whether uploads can be issued right now, so the admin can disable its
   * dropzone and show a clear message instead of failing on click.
   */
  status() {
    const missing = this.storage.missingConfig();
    return {
      configured: missing.length === 0,
      missing,
      maxUploadBytes: 25 * 1024 * 1024,
    };
  }

  async presign(dto: PresignMediaDto): Promise<PresignResult> {
    const key = this.storage.buildKey(dto);
    return this.storage.presignPut(dto, key);
  }

  /**
   * Records an upload in the registry after the browser's direct PUT succeeds,
   * so previously uploaded files can be reused from the admin.
   */
  async register(dto: RegisterMediaDto) {
    const url = this.storage.buildPublicUrl(dto.key);

    const existing = await this.prisma.mediaAsset.findFirst({ where: { url } });
    if (existing) return existing;

    return this.prisma.mediaAsset.create({
      data: {
        url,
        kind: dto.kind,
        originalFilename: dto.originalFilename,
        size: dto.size,
      },
    });
  }

  async findAll(kind?: MediaKind) {
    const items = await this.prisma.mediaAsset.findMany({
      where: kind ? { kind } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  }

  /**
   * Removes both the registry row and the underlying R2 object.
   *
   * The R2 delete is best-effort: an object the admin can no longer see is
   * still tracked down by its uploads/ prefix, and failing the whole request
   * because R2 was briefly unreachable would leave the row behind too, which
   * is the worse outcome (the UI would keep offering a dead asset). Failures
   * are logged instead.
   */
  async remove(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Media asset "${id}" not found`);

    const key = this.storage.keyFromPublicUrl(asset.url);
    if (key === undefined) {
      throw new BadRequestException('Asset URL is not in the expected R2 uploads/ prefix');
    }

    try {
      await this.storage.deleteObject(key);
    } catch (error) {
      this.logger.warn(
        `Deleted media asset ${id} from the registry but could not remove ${key} from R2: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return this.prisma.mediaAsset.delete({ where: { id } });
  }
}