import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { NotificationsModule } from '../notifications/notifications.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { contactRateLimit } from './contact-rate-limit';

/**
 * Rate limits are resolved from the environment here rather than with a static
 * array so the window can be tuned per environment without a code change, while
 * still defaulting to the 3-per-15-minutes in BACKEND_PLAN.md §4.4.
 */
@Module({
  imports: [
    NotificationsModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const { limit, ttlMs } = contactRateLimit({
          CONTACT_RATE_LIMIT: config.get<string>('CONTACT_RATE_LIMIT'),
          CONTACT_RATE_WINDOW: config.get<string>('CONTACT_RATE_WINDOW'),
        });

        return [{ ttl: ttlMs, limit }];
      },
    }),
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}