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
  CreateCertificateStatDto,
  CreateIssuingOrganizationDto,
  UpdateCertificateDto,
  UpdateCertificateStatDto,
  UpdateIssuingOrganizationDto,
} from './dto/certificate.dto';
import { Public } from '../common/public.decorator';
import { ReorderIdsDto } from '../common/dto/reorder.dto';

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

  /* ------------------------------------------------------------------ */
  /* certificate_stats — declared before ':id' so the literal segment    */
  /* is not swallowed by the parameterised route.                        */
  /* ------------------------------------------------------------------ */

  @Public()
  @Get('stats')
  findAllStats() {
    return this.certificatesService.findAllStats();
  }

  @Post('stats')
  @HttpCode(HttpStatus.CREATED)
  createStat(@Body() dto: CreateCertificateStatDto) {
    return this.certificatesService.createStat(dto);
  }

  @Patch('stats/reorder')
  reorderStats(@Body() dto: ReorderIdsDto) {
    return this.certificatesService.reorderStats(dto);
  }

  @Patch('stats/:id')
  updateStat(@Param('id') id: string, @Body() dto: UpdateCertificateStatDto) {
    return this.certificatesService.updateStat(id, dto);
  }

  @Delete('stats/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStat(@Param('id') id: string) {
    await this.certificatesService.removeStat(id);
  }

  /* ------------------------------------------------------------------ */
  /* issuing_organizations                                               */
  /* ------------------------------------------------------------------ */

  @Public()
  @Get('issuing-organizations')
  findAllIssuingOrganizations() {
    return this.certificatesService.findAllIssuingOrganizations();
  }

  @Post('issuing-organizations')
  @HttpCode(HttpStatus.CREATED)
  createIssuingOrganization(@Body() dto: CreateIssuingOrganizationDto) {
    return this.certificatesService.createIssuingOrganization(dto);
  }

  @Patch('issuing-organizations/reorder')
  reorderIssuingOrganizations(@Body() dto: ReorderIdsDto) {
    return this.certificatesService.reorderIssuingOrganizations(dto);
  }

  @Patch('issuing-organizations/:id')
  updateIssuingOrganization(
    @Param('id') id: string,
    @Body() dto: UpdateIssuingOrganizationDto,
  ) {
    return this.certificatesService.updateIssuingOrganization(id, dto);
  }

  @Delete('issuing-organizations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeIssuingOrganization(@Param('id') id: string) {
    await this.certificatesService.removeIssuingOrganization(id);
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
  reorder(@Body() dto: ReorderIdsDto) {
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
