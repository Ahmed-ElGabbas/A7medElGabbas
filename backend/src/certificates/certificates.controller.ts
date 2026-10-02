import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import {
  CreateCertificateDto,
  ReorderCertificatesDto,
  UpdateCertificateDto,
} from './dto/certificate.dto';
import { Public } from '../common/public.decorator';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Public()
  @Get()
  findAll() {
    return this.certificatesService.findAll();
  }

  @Public()
  @Get('categories')
  categories() {
    return this.certificatesService.categories();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCertificateDto) {
    return this.certificatesService.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderCertificatesDto) {
    return this.certificatesService.reorder(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCertificateDto) {
    return this.certificatesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.certificatesService.remove(id);
  }
}
