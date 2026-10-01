import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import {
  UpdateSiteConfigDto,
  UpdateSocialLinksDto,
  UpsertSectionMetaDto,
} from './dto/site-config.dto';
import { Public } from '../common/public.decorator';

@Controller()
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Public()
  @Get('site-config')
  async getSiteConfig() {
    const [config, links] = await Promise.all([
      this.siteConfigService.getSiteConfig(),
      this.siteConfigService.getSocialLinks(),
    ]);

    return {
      config,
      links,
    };
  }

  @Patch('site-config')
  updateSiteConfig(@Body() dto: UpdateSiteConfigDto) {
    return this.siteConfigService.updateSiteConfig(dto);
  }

  @Patch('social-links')
  updateSocialLinks(@Body() dto: UpdateSocialLinksDto) {
    return this.siteConfigService.updateSocialLinks(dto);
  }

  @Public()
  @Get('section-meta')
  getSectionMeta() {
    return this.siteConfigService.getSectionMeta();
  }

  @Public()
  @Get('section-meta/:id')
  getSectionMetaItem(@Param('id') id: string) {
    return this.siteConfigService.getSectionMetaItem(id);
  }

  @Patch('section-meta/:id')
  upsertSectionMeta(
    @Param('id') id: string,
    @Body() dto: UpsertSectionMetaDto,
  ) {
    return this.siteConfigService.upsertSectionMeta({ ...dto, id });
  }
}
