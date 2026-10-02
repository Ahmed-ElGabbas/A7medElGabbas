import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import { MediaService } from './media.service';
import { PresignMediaDto, RegisterMediaDto } from './dto/media.dto';
import { Public } from '../common/public.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /// Public so the admin can tell "R2 not configured yet" apart from a network
  /// failure before the user tries to upload anything. Reveals no secrets —
  /// only which env var names are unset.
  @Public()
  @Get('status')
  status() {
    return this.mediaService.status();
  }

  @Post('presign')
  presign(@Body() dto: PresignMediaDto) {
    return this.mediaService.presign(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterMediaDto) {
    return this.mediaService.register(dto);
  }

  @Get()
  findAll(@Query('kind') kind?: MediaKind) {
    return this.mediaService.findAll(kind);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.mediaService.remove(id);
  }
}
