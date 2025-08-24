import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string): Promise<any> {
    // Mock user validation - in production this would check against database
    if (email && password) {
      return {
        id: 'mock-user-id',
        email: email,
        username: 'mockuser',
        firstName: 'Mock',
        lastName: 'User',
        roles: ['user'],
        status: 'active',
        twoFactorEnabled: false,
      };
    }
    return null;
  }

  async register(registerDto: any) {
    // Mock registration response
    return {
      user: {
        id: 'mock-user-id',
        email: registerDto.email || 'mock@example.com',
        username: registerDto.username || 'mockuser',
        firstName: registerDto.firstName || 'Mock',
        lastName: registerDto.lastName || 'User',
        roles: ['user'],
        status: 'active',
        twoFactorEnabled: false,
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
  }

  async login(loginDto: any) {
    // Mock login response
    return {
      user: {
        id: 'mock-user-id',
        email: loginDto.email || 'mock@example.com',
        username: loginDto.username || 'mockuser',
        firstName: 'Mock',
        lastName: 'User',
        roles: ['user'],
        status: 'active',
        twoFactorEnabled: false,
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
  }

  async verify2FAAndLogin(userId: string, verify2FADto: any) {
    // Mock 2FA verification response
    return {
      user: {
        id: userId,
        email: 'mock@example.com',
        username: 'mockuser',
        firstName: 'Mock',
        lastName: 'User',
        roles: ['user'],
        status: 'active',
        twoFactorEnabled: true,
      },
      accessToken: 'mock-access-token-after-2fa',
      refreshToken: 'mock-refresh-token-after-2fa',
    };
  }

  async refreshToken(refreshTokenDto: any) {
    // Mock token refresh response
    return {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
    };
  }

  async forgotPassword(forgotPasswordDto: any) {
    // Mock password reset response
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: any) {
    // Mock password reset response
    return {
      message: 'Password has been reset successfully.',
    };
  }

  async logout(userId: string) {
    // Mock logout response
    return {
      message: 'User logged out successfully.',
    };
  }
}
