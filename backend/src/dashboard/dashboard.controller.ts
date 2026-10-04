import {
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SearchQueryDto } from './dto/search-query.dto';

/**
 * Admin dashboard reads. Nothing here is marked `@Public()`, so the global
 * AuthGuard rejects every call without a valid admin session — which is what
 * keeps the content dump and the visitor PII behind the inbox off the public
 * API.
 */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /// Counters plus the recent-activity feed, in one round trip.
  @Get('overview')
  @Header('Cache-Control', 'no-store')
  overview(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.overview(limit);
  }

  @Get('search')
  @Header('Cache-Control', 'no-store')
  search(@Query() query: SearchQueryDto) {
    return this.dashboardService.search(query);
  }

  /**
   * Full content snapshot as a downloadable file.
   *
   * `Content-Disposition` is set so hitting the URL directly saves a file rather
   * than dumping JSON into the tab; the admin UI fetches it through the same
   * authenticated origin and saves it from the blob instead.
   */
  @Get('export')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="portfolio-backup.json"')
  exportBackup() {
    return this.dashboardService.exportBackup();
  }
}