import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username (must be unique)',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'User roles',
    example: ['client'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  roles?: UserRole[];

  @ApiProperty({
    description: 'Company ID (if applicable)',
    example: 'uuid-here',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiProperty({
    description: 'Two-factor authentication enabled',
    example: false,
    required: false,
  })
  @IsOptional()
  twoFactorEnabled?: boolean;
}
