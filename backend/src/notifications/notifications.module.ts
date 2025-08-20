import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { PushNotificationsController } from './controllers/push-notifications.controller';
import { EmailService } from './services/email.service';
import { EmailProcessor } from './processors/email.processor';
import { PushNotificationService } from './services/push-notification.service';
import { DeviceTokenService } from './services/device-token.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { PushNotificationProcessor } from './processors/push-notification.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue(
      {
        name: 'email',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'push-notifications',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
    ),
    TypeOrmModule.forFeature([
      // Add your entities here when they're created
      // DeviceToken,
      // NotificationTemplate,
    ]),
  ],
  controllers: [NotificationsController, PushNotificationsController],
  providers: [
    EmailService,
    EmailProcessor,
    PushNotificationService,
    DeviceTokenService,
    NotificationTemplateService,
    PushNotificationProcessor,
  ],
  exports: [
    EmailService,
    PushNotificationService,
    DeviceTokenService,
    NotificationTemplateService,
  ],
})
export class NotificationsModule {}
