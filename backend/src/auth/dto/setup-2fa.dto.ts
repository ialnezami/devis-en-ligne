import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Setup2FADto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
