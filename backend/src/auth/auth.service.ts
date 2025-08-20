import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../notifications/email.service';
import { Logger } from '../common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private logger: Logger,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (user && await user.validatePassword(password)) {
        const { password: _, ...result } = user;
        return result as User;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error validating user', { email, error: error.message });
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const tokens = await this.generateTokens(user);
    
    // Update last login
    await this.usersService.updateLastLogin(user.id);
    
    this.logger.log('User logged in successfully', { userId: user.id, email: user.email });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
        company: user.company,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const existingUsername = await this.usersService.findByUsername(registerDto.username);
    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    // Create user
    const user = await this.usersService.create(registerDto);
    
    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    this.logger.log('User registered successfully', { userId: user.id, email: user.email });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      
      this.logger.log('Token refreshed successfully', { userId: user.id });
      
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    
    if (user && user.status === 'active') {
      const resetToken = await this.usersService.generatePasswordResetToken(user.id);
      
      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      
      this.logger.log('Password reset email sent', { userId: user.id, email: user.email });
    }

    // Always return success to prevent email enumeration
    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByPasswordResetToken(resetPasswordDto.token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.resetPassword(user.id, resetPasswordDto.newPassword);
    
    this.logger.log('Password reset successfully', { userId: user.id });
    
    return { message: 'Password has been reset successfully' };
  }

  async logout(userId: string) {
    // In a more sophisticated implementation, you might want to blacklist the token
    // For now, we'll just log the logout
    this.logger.log('User logged out', { userId });
    
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
