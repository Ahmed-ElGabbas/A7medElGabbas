import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/**
 * Read-only admin overview endpoints: the dashboard counters, the cross-content
 * search box, and the JSON backup export. PrismaModule is global, so nothing
 * extra needs importing here.
 */
@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}