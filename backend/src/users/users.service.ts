import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Logger } from '../common/logger/logger.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Set default role if not provided
      if (!createUserDto.roles || createUserDto.roles.length === 0) {
        createUserDto.roles = [UserRole.CLIENT];
      }

      // Set default status
      // Status will be set by the entity default

      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      
      this.logger.log('User created successfully', { userId: savedUser.id, email: savedUser.email });
      
      return savedUser;
    } catch (error) {
      this.logger.error('Error creating user', { error: error.message, createUserDto });
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['company'],
      select: ['id', 'username', 'email', 'firstName', 'lastName', 'roles', 'status', 'createdAt', 'lastLoginAt'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['company'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['company'],
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findById(id);
      
      // Check if email is being changed and if it's already taken
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.findByEmail(updateUserDto.email);
        if (existingUser && existingUser.id !== id) {
          throw new BadRequestException('Email already taken');
        }
      }

      // Check if username is being changed and if it's already taken
      if (updateUserDto.username && updateUserDto.username !== user.username) {
        const existingUser = await this.findByUsername(updateUserDto.username);
        if (existingUser && existingUser.id !== id) {
          throw new BadRequestException('Username already taken');
        }
      }

      Object.assign(user, updateUserDto);
      const updatedUser = await this.usersRepository.save(user);
      
      this.logger.log('User updated successfully', { userId: id, updates: Object.keys(updateUserDto) });
      
      return updatedUser;
    } catch (error) {
      this.logger.error('Error updating user', { userId: id, error: error.message });
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      await this.usersRepository.softDelete(id);
      
      this.logger.log('User deleted successfully', { userId: id });
    } catch (error) {
      this.logger.error('Error deleting user', { userId: id, error: error.message });
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        lastLoginAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Error updating last login', { userId: id, error: error.message });
    }
  }

  async generatePasswordResetToken(id: string): Promise<string> {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.usersRepository.update(id, {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
      });

      this.logger.log('Password reset token generated', { userId: id });
      
      return token;
    } catch (error) {
      this.logger.error('Error generating password reset token', { userId: id, error: error.message });
      throw error;
    }
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        status: UserStatus.ACTIVE,
      });

      this.logger.log('Password reset successfully', { userId: id });
    } catch (error) {
      this.logger.error('Error resetting password', { userId: id, error: error.message });
      throw error;
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.findById(id);
      
      if (!(await user.validatePassword(currentPassword))) {
        throw new BadRequestException('Current password is incorrect');
      }

      await this.usersRepository.update(id, { password: newPassword });
      
      this.logger.log('Password changed successfully', { userId: id });
    } catch (error) {
      this.logger.error('Error changing password', { userId: id, error: error.message });
      throw error;
    }
  }

  async activateAccount(id: string): Promise<void> {
    try {
      await this.usersRepository.update(id, { status: UserStatus.ACTIVE });
      
      this.logger.log('Account activated', { userId: id });
    } catch (error) {
      this.logger.error('Error activating account', { userId: id, error: error.message });
      throw error;
    }
  }

  async deactivateAccount(id: string): Promise<void> {
    try {
      await this.usersRepository.update(id, { status: UserStatus.INACTIVE });
      
      this.logger.log('Account deactivated', { userId: id });
    } catch (error) {
      this.logger.error('Error deactivating account', { userId: id, error: error.message });
      throw error;
    }
  }

  async suspendAccount(id: string, reason?: string): Promise<void> {
    try {
      await this.usersRepository.update(id, { 
        status: UserStatus.SUSPENDED,
        suspensionReason: reason,
      });
      
      this.logger.log('Account suspended', { userId: id, reason });
    } catch (error) {
      this.logger.error('Error suspending account', { userId: id, error: error.message });
      throw error;
    }
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { roles: role },
      relations: ['company'],
      select: ['id', 'username', 'email', 'firstName', 'lastName', 'roles', 'status', 'createdAt'],
    });
  }

  async findByCompany(companyId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { company: { id: companyId } },
      relations: ['company'],
      select: ['id', 'username', 'email', 'firstName', 'lastName', 'roles', 'status', 'createdAt'],
    });
  }

  async countByStatus(status: UserStatus): Promise<number> {
    return this.usersRepository.count({ where: { status } });
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.usersRepository.count({ where: { roles: role } });
  }

  // 2FA Methods
  async storeTemporary2FASecret(id: string, secret: string, backupCodes: string[]): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        twoFactorSecret: secret,
        backupCodes: backupCodes,
      });

      this.logger.log('Temporary 2FA secret stored', { userId: id });
    } catch (error) {
      this.logger.error('Error storing temporary 2FA secret', { userId: id, error: error.message });
      throw error;
    }
  }

  async enable2FA(id: string, secret: string, backupCodes: string[]): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: backupCodes,
      });

      this.logger.log('2FA enabled', { userId: id });
    } catch (error) {
      this.logger.error('Error enabling 2FA', { userId: id, error: error.message });
      throw error;
    }
  }

  async disable2FA(id: string): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      });

      this.logger.log('2FA disabled', { userId: id });
    } catch (error) {
      this.logger.error('Error disabling 2FA', { userId: id, error: error.message });
      throw error;
    }
  }

  async removeBackupCode(id: string, backupCode: string): Promise<void> {
    try {
      const user = await this.findById(id);
      if (user.backupCodes) {
        const updatedBackupCodes = user.backupCodes.filter(code => code !== backupCode);
        await this.usersRepository.update(id, {
          backupCodes: updatedBackupCodes,
        });
      }

      this.logger.log('Backup code removed', { userId: id });
    } catch (error) {
      this.logger.error('Error removing backup code', { userId: id, error: error.message });
      throw error;
    }
  }

  async updateBackupCodes(id: string, backupCodes: string[]): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        backupCodes: backupCodes,
      });

      this.logger.log('Backup codes updated', { userId: id });
    } catch (error) {
      this.logger.error('Error updating backup codes', { userId: id, error: error.message });
      throw error;
    }
  }

  async get2FAStatus(id: string): Promise<{ enabled: boolean; backupCodesCount: number }> {
    try {
      const user = await this.findById(id);
      return {
        enabled: user.twoFactorEnabled,
        backupCodesCount: user.backupCodes?.length || 0,
      };
    } catch (error) {
      this.logger.error('Error getting 2FA status', { userId: id, error: error.message });
      throw error;
    }
  }

  // Recovery Methods
  async updateRecoveryToken(id: string, token: string, expiresAt: Date): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        recoveryToken: token,
        recoveryTokenExpiresAt: expiresAt,
      });

      this.logger.log('Recovery token updated', { userId: id });
    } catch (error) {
      this.logger.error('Error updating recovery token', { userId: id, error: error.message });
      throw error;
    }
  }

  async findByRecoveryToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { recoveryToken: token },
    });
  }

  async clearRecoveryToken(id: string): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        recoveryToken: null,
        recoveryTokenExpiresAt: null,
      });

      this.logger.log('Recovery token cleared', { userId: id });
    } catch (error) {
      this.logger.error('Error clearing recovery token', { userId: id, error: error.message });
      throw error;
    }
  }

  async countUsersWith2FA(): Promise<number> {
    return this.usersRepository.count({
      where: { twoFactorEnabled: true, status: UserStatus.ACTIVE },
    });
  }

  async countUsersWithBackupCodes(): Promise<number> {
    return this.usersRepository.count({
      where: { 
        twoFactorEnabled: true, 
        status: UserStatus.ACTIVE,
        backupCodes: { $not: { $eq: [] } } as any,
      },
    });
  }
}
