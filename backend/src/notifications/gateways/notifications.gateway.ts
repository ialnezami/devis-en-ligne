import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';
import { InAppNotificationService } from '../services/in-app-notification.service';
import { NotificationPreferencesService } from '../services/notification-preferences.service';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(WsJwtGuard)
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly inAppNotificationService: InAppNotificationService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Notifications WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user information from the socket
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      
      if (!token) {
        this.logger.warn('Client connected without authentication token');
        client.disconnect();
        return;
      }

      // Verify JWT token and extract user info
      // This would typically be done in the WsJwtGuard
      // For now, we'll assume the guard has populated the socket with user info
      
      if (!client.userId) {
        this.logger.warn('Client connected without valid user ID');
        client.disconnect();
        return;
      }

      // Store connected user
      this.connectedUsers.set(client.userId, client);
      
      // Join user to their personal room
      await client.join(`user:${client.userId}`);
      
      // Join company room if available
      if (client.companyId) {
        await client.join(`company:${client.companyId}`);
      }

      this.logger.log(`User connected: ${client.userId}`, {
        socketId: client.id,
        userId: client.userId,
        companyId: client.companyId,
        totalConnected: this.connectedUsers.size,
      });

      // Send connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to notifications',
        userId: client.userId,
        timestamp: new Date(),
      });

      // Send unread notification count
      const stats = await this.inAppNotificationService.getUserNotificationStats(client.userId);
      client.emit('unreadCount', { count: stats.unread });

    } catch (error) {
      this.logger.error('Error during connection', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      
      this.logger.log(`User disconnected: ${client.userId}`, {
        socketId: client.id,
        userId: client.userId,
        totalConnected: this.connectedUsers.size,
      });
    }
  }

  /**
   * Send notification to a specific user
   */
  async sendNotificationToUser(userId: string, notification: any) {
    try {
      const userSocket = this.connectedUsers.get(userId);
      
      if (userSocket) {
        // Check user preferences
        const isEnabled = await this.notificationPreferencesService.isNotificationTypeEnabled(
          userId,
          notification.type
        );
        
        if (!isEnabled) {
          this.logger.log(`Notification type ${notification.type} disabled for user ${userId}`);
          return false;
        }

        const isChannelEnabled = await this.notificationPreferencesService.isChannelEnabled(
          userId,
          'in_app'
        );
        
        if (!isChannelEnabled) {
          this.logger.log(`In-app notifications disabled for user ${userId}`);
          return false;
        }

        // Check if user is muted
        const isMuted = await this.notificationPreferencesService.isUserMuted(userId);
        if (isMuted) {
          this.logger.log(`User ${userId} is currently muted`);
          return false;
        }

        // Send notification to user's room
        this.server.to(`user:${userId}`).emit('newNotification', notification);
        
        this.logger.log(`Notification sent to user ${userId}`, {
          notificationId: notification.id,
          type: notification.type,
        });

        return true;
      } else {
        this.logger.log(`User ${userId} not connected, notification queued`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(userIds: string[], notification: any) {
    try {
      const results = await Promise.all(
        userIds.map(userId => this.sendNotificationToUser(userId, notification))
      );

      const successCount = results.filter(Boolean).length;
      
      this.logger.log(`Notification sent to ${successCount}/${userIds.length} users`, {
        notificationId: notification.id,
        type: notification.type,
        successCount,
        totalCount: userIds.length,
      });

      return { successCount, totalCount: userIds.length };
    } catch (error) {
      this.logger.error('Failed to send notification to multiple users', error);
      throw error;
    }
  }

  /**
   * Send notification to company
   */
  async sendNotificationToCompany(companyId: string, notification: any) {
    try {
      // Get all connected users from this company
      const companyUsers = Array.from(this.connectedUsers.values())
        .filter(socket => socket.companyId === companyId);

      if (companyUsers.length === 0) {
        this.logger.log(`No users connected from company ${companyId}`);
        return { successCount: 0, totalCount: 0 };
      }

      const userIds = companyUsers.map(socket => socket.userId);
      return await this.sendNotificationToUsers(userIds, notification);
    } catch (error) {
      this.logger.error(`Failed to send notification to company ${companyId}`, error);
      throw error;
    }
  }

  /**
   * Broadcast notification to all connected users
   */
  async broadcastNotification(notification: any) {
    try {
      const connectedUserIds = Array.from(this.connectedUsers.keys());
      
      if (connectedUserIds.length === 0) {
        this.logger.log('No users connected to broadcast to');
        return { successCount: 0, totalCount: 0 };
      }

      return await this.sendNotificationToUsers(connectedUserIds, notification);
    } catch (error) {
      this.logger.error('Failed to broadcast notification', error);
      throw error;
    }
  }

  /**
   * Send notification update
   */
  async sendNotificationUpdate(userId: string, notificationId: string, update: any) {
    try {
      const userSocket = this.connectedUsers.get(userId);
      
      if (userSocket) {
        this.server.to(`user:${userId}`).emit('notificationUpdated', {
          id: notificationId,
          ...update,
        });
        
        this.logger.log(`Notification update sent to user ${userId}`, {
          notificationId,
          update,
        });

        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Failed to send notification update to user ${userId}`, error);
      return false;
    }
  }

  /**
   * Send notification deletion
   */
  async sendNotificationDeletion(userId: string, notificationId: string) {
    try {
      const userSocket = this.connectedUsers.get(userId);
      
      if (userSocket) {
        this.server.to(`user:${userId}`).emit('notificationDeleted', {
          id: notificationId,
        });
        
        this.logger.log(`Notification deletion sent to user ${userId}`, {
          notificationId,
        });

        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Failed to send notification deletion to user ${userId}`, error);
      return false;
    }
  }

  /**
   * Send unread count update
   */
  async sendUnreadCountUpdate(userId: string, count: number) {
    try {
      const userSocket = this.connectedUsers.get(userId);
      
      if (userSocket) {
        this.server.to(`user:${userId}`).emit('unreadCount', { count });
        
        this.logger.log(`Unread count update sent to user ${userId}`, { count });
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Failed to send unread count update to user ${userId}`, error);
      return false;
    }
  }

  /**
   * Handle client subscription to specific notification types
   */
  @SubscribeMessage('subscribeToType')
  async handleSubscribeToType(
    @MessageBody() data: { type: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      await client.join(`type:${data.type}`);
      
      this.logger.log(`User ${client.userId} subscribed to type ${data.type}`);
      
      client.emit('subscribed', {
        type: data.type,
        message: `Subscribed to ${data.type} notifications`,
      });
    } catch (error) {
      this.logger.error('Error subscribing to notification type', error);
      client.emit('error', { message: 'Failed to subscribe to notification type' });
    }
  }

  /**
   * Handle client unsubscription from specific notification types
   */
  @SubscribeMessage('unsubscribeFromType')
  async handleUnsubscribeFromType(
    @MessageBody() data: { type: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      await client.leave(`type:${data.type}`);
      
      this.logger.log(`User ${client.userId} unsubscribed from type ${data.type}`);
      
      client.emit('unsubscribed', {
        type: data.type,
        message: `Unsubscribed from ${data.type} notifications`,
      });
    } catch (error) {
      this.logger.error('Error unsubscribing from notification type', error);
      client.emit('error', { message: 'Failed to unsubscribe from notification type' });
    }
  }

  /**
   * Handle client subscription to company notifications
   */
  @SubscribeMessage('subscribeToCompany')
  async handleSubscribeToCompany(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      await client.join(`company:${data.companyId}`);
      
      this.logger.log(`User ${client.userId} subscribed to company ${data.companyId}`);
      
      client.emit('subscribed', {
        companyId: data.companyId,
        message: `Subscribed to company ${data.companyId} notifications`,
      });
    } catch (error) {
      this.logger.error('Error subscribing to company notifications', error);
      client.emit('error', { message: 'Failed to subscribe to company notifications' });
    }
  }

  /**
   * Handle client unsubscription from company notifications
   */
  @SubscribeMessage('unsubscribeFromCompany')
  async handleUnsubscribeFromCompany(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      await client.leave(`company:${data.companyId}`);
      
      this.logger.log(`User ${client.userId} unsubscribed from company ${data.companyId}`);
      
      client.emit('unsubscribed', {
        companyId: data.companyId,
        message: `Unsubscribed from company ${data.companyId} notifications`,
      });
    } catch (error) {
      this.logger.error('Error unsubscribing from company notifications', error);
      client.emit('error', { message: 'Failed to unsubscribe from company notifications' });
    }
  }

  /**
   * Handle client request for current unread count
   */
  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      const stats = await this.inAppNotificationService.getUserNotificationStats(client.userId);
      
      client.emit('unreadCount', { count: stats.unread });
    } catch (error) {
      this.logger.error('Error getting unread count', error);
      client.emit('error', { message: 'Failed to get unread count' });
    }
  }

  /**
   * Handle client ping for connection health check
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date() });
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalConnected: this.connectedUsers.size,
      connectedUsers: Array.from(this.connectedUsers.keys()),
      socketIds: Array.from(this.connectedUsers.values()).map(socket => socket.id),
    };
  }

  /**
   * Disconnect a specific user
   */
  disconnectUser(userId: string) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.disconnect();
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} forcefully disconnected`);
    }
  }

  /**
   * Disconnect all users
   */
  disconnectAllUsers() {
    this.connectedUsers.forEach((socket, userId) => {
      socket.disconnect();
    });
    this.connectedUsers.clear();
    this.logger.log('All users disconnected');
  }
}
