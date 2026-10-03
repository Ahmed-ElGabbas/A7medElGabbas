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

  /**
   * The path segment is the section key ("about", "skills"), not the row id.
   * Named `key` rather than `id` so it is not mistaken for a numeric id — the
   * service resolves it with `where: { key }`, and this is the only place the
   * distinction is visible.
   */
  @Public()
  @Get('section-meta/:key')
  getSectionMetaItem(@Param('key') key: string) {
    return this.siteConfigService.getSectionMetaItem(key);
  }

  @Patch('section-meta/:key')
  upsertSectionMeta(@Param('key') key: string, @Body() dto: UpsertSectionMetaDto) {
    return this.siteConfigService.upsertSectionMeta({ ...dto, id: key });
  }
}
