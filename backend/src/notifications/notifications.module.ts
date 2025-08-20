import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './services/email.service';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
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
    }),
  ],
  controllers: [NotificationsController],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class NotificationsModule {}
