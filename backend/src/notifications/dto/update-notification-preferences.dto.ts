import { PartialType } from '@nestjs/swagger';
import { CreateNotificationPreferencesDto } from './create-notification-preferences.dto';

export class UpdateNotificationPreferencesDto extends PartialType(CreateNotificationPreferencesDto) {}
