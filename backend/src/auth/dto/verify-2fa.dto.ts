import { IsString, IsNotEmpty, Length, IsOptional, IsUUID } from 'class-validator';

export class Verify2FADto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @IsString()
  @IsOptional()
  backupCode?: string;
}
