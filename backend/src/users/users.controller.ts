import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole, UserStatus } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [User],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
  ) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    if (companyId) {
      return this.usersService.findByCompany(companyId);
    }
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateProfile(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async activateAccount(@Param('id') id: string) {
    await this.usersService.activateAccount(id);
    return { message: 'Account activated successfully' };
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: 200,
    description: 'Account deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async deactivateAccount(@Param('id') id: string) {
    await this.usersService.deactivateAccount(id);
    return { message: 'Account deactivated successfully' };
  }

  @Post(':id/suspend')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Suspend user account' })
  @ApiResponse({
    status: 200,
    description: 'Account suspended successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async suspendAccount(@Param('id') id: string, @Body('reason') reason?: string) {
    await this.usersService.suspendAccount(id, reason);
    return { message: 'Account suspended successfully' };
  }

  @Get('stats/counts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        inactive: { type: 'number' },
        suspended: { type: 'number' },
        pendingVerification: { type: 'number' },
        byRole: {
          type: 'object',
          properties: {
            client: { type: 'number' },
            sales_rep: { type: 'number' },
            manager: { type: 'number' },
            admin: { type: 'number' },
            super_admin: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getUserStats() {
    const [active, inactive, suspended, pendingVerification] = await Promise.all([
      this.usersService.countByStatus(UserStatus.ACTIVE),
              this.usersService.countByStatus(UserStatus.INACTIVE),
              this.usersService.countByStatus(UserStatus.SUSPENDED),
              this.usersService.countByStatus(UserStatus.PENDING_VERIFICATION),
    ]);

    const [client, salesRep, manager, admin, superAdmin] = await Promise.all([
      this.usersService.countByRole(UserRole.CLIENT),
      this.usersService.countByRole(UserRole.SALES_REP),
      this.usersService.countByRole(UserRole.MANAGER),
      this.usersService.countByRole(UserRole.ADMIN),
      this.usersService.countByRole(UserRole.SUPER_ADMIN),
    ]);

    const total = active + inactive + suspended + pendingVerification;

    return {
      total,
      active,
      inactive,
      suspended,
      pendingVerification,
      byRole: {
        client,
        sales_rep: salesRep,
        manager,
        admin,
        super_admin: superAdmin,
      },
    };
  }
}
