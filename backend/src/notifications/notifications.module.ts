import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { PushNotificationsController } from './controllers/push-notifications.controller';
import { InAppNotificationsController } from './controllers/in-app-notifications.controller';
import { EmailService } from './services/email.service';
import { EmailProcessor } from './processors/email.processor';
import { PushNotificationService } from './services/push-notification.service';
import { DeviceTokenService } from './services/device-token.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { PushNotificationProcessor } from './processors/push-notification.processor';
import { InAppNotificationService } from './services/in-app-notification.service';
import { NotificationPreferencesService } from './services/notification-preferences.service';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { Notification } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue(
      { name: 'email', defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200 } },
      { name: 'push-notifications', defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200 } },
    ),
    TypeOrmModule.forFeature([
      Notification,
      NotificationPreferences,
      // DeviceToken and NotificationTemplate entities will be added when they're created
    ]),
  ],
  controllers: [
    NotificationsController, 
    PushNotificationsController, 
    InAppNotificationsController
  ],
  providers: [
    EmailService,
    EmailProcessor,
    PushNotificationService,
    DeviceTokenService,
    NotificationTemplateService,
    PushNotificationProcessor,
    InAppNotificationService,
    NotificationPreferencesService,
    NotificationsGateway,
  ],
  exports: [
    EmailService,
    PushNotificationService,
    DeviceTokenService,
    NotificationTemplateService,
    InAppNotificationService,
    NotificationPreferencesService,
    NotificationsGateway,
  ],
})
export class NotificationsModule {}
