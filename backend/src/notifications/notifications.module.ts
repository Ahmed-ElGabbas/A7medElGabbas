import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ResendService } from './resend.service';

@Module({
  providers: [NotificationsService, ResendService],
  /// NotificationsService is the public surface — ContactModule depends on it,
  /// not on the Resend wrapper, so nothing else can send mail by accident.
  exports: [NotificationsService],
})
export class NotificationsModule {}