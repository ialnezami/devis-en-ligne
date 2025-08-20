# In-App Notifications Setup Guide

This guide covers the setup and configuration of the In-App Notifications system for the Online Quotation Tool.

## Overview

The In-App Notifications system provides real-time notifications within the application, including:
- User-specific notifications
- Company-wide notifications
- Notification preferences management
- WebSocket-based real-time delivery
- Notification archiving and management

## Prerequisites

- NestJS backend running
- PostgreSQL database configured
- Redis server running (for queues)
- WebSocket support enabled

## Database Setup

### 1. Create Database Tables

The system will automatically create the following tables when you run the application:

```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'unread',
  data JSONB,
  metadata JSONB,
  channels JSONB DEFAULT '["in_app"]',
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  read_at TIMESTAMP,
  archived_at TIMESTAMP,
  deleted_at TIMESTAMP,
  expires_at TIMESTAMP,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  source VARCHAR(50),
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  icon VARCHAR(100),
  image_url VARCHAR(500),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  read_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  user_preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  webhook_notifications BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start VARCHAR(10) DEFAULT '22:00',
  quiet_hours_end VARCHAR(10) DEFAULT '08:00',
  quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',
  priority_settings JSONB DEFAULT '{"low": true, "normal": true, "high": true, "urgent": true}',
  type_settings JSONB,
  channel_settings JSONB,
  frequency_settings JSONB,
  digest_enabled BOOLEAN DEFAULT FALSE,
  digest_frequency VARCHAR(20) DEFAULT 'daily',
  digest_time VARCHAR(10) DEFAULT '09:00',
  digest_timezone VARCHAR(50) DEFAULT 'UTC',
  muted_until TIMESTAMP,
  muted_types JSONB DEFAULT '[]',
  muted_categories JSONB DEFAULT '[]',
  show_unread_count BOOLEAN DEFAULT TRUE,
  show_preview BOOLEAN DEFAULT TRUE,
  play_sound BOOLEAN DEFAULT TRUE,
  show_badge BOOLEAN DEFAULT TRUE,
  group_notifications BOOLEAN DEFAULT FALSE,
  allow_reply BOOLEAN DEFAULT TRUE,
  allow_forward BOOLEAN DEFAULT TRUE,
  allow_share BOOLEAN DEFAULT TRUE,
  custom_sounds JSONB,
  language VARCHAR(10) DEFAULT 'en',
  locale VARCHAR(10) DEFAULT 'en-US',
  timezone VARCHAR(50) DEFAULT 'UTC',
  high_contrast BOOLEAN DEFAULT FALSE,
  large_text BOOLEAN DEFAULT FALSE,
  screen_reader_friendly BOOLEAN DEFAULT TRUE,
  keyboard_navigation BOOLEAN DEFAULT TRUE,
  allow_analytics BOOLEAN DEFAULT TRUE,
  allow_personalization BOOLEAN DEFAULT FALSE,
  allow_cross_device_sync BOOLEAN DEFAULT TRUE,
  blocked_senders JSONB DEFAULT '[]',
  allowed_senders JSONB DEFAULT '[]',
  auto_backup BOOLEAN DEFAULT TRUE,
  backup_frequency VARCHAR(20) DEFAULT 'weekly',
  sync_across_devices BOOLEAN DEFAULT TRUE,
  last_backup_at TIMESTAMP,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_company_status ON notifications(company_id, status);
CREATE INDEX idx_notifications_type_status ON notifications(type, status);
CREATE INDEX idx_notifications_created_status ON notifications(created_at, status);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

### 2. Database Migrations

If you're using TypeORM migrations, create a migration file:

```bash
npm run typeorm:generate-migration -- -n CreateNotificationTables
```

## Environment Configuration

### 1. Backend Environment Variables

Add these to your `.env` file:

```env
# WebSocket Configuration
FRONTEND_URL=http://localhost:3000

# Notification Settings
NOTIFICATION_CLEANUP_INTERVAL=3600000  # 1 hour in milliseconds
NOTIFICATION_EXPIRY_DAYS=30
NOTIFICATION_MAX_PER_USER=1000
```

### 2. Frontend Environment Variables

Add these to your frontend `.env` file:

```env
# WebSocket Configuration
REACT_APP_WS_URL=ws://localhost:3001/notifications
REACT_APP_WS_RECONNECT_INTERVAL=5000
REACT_APP_WS_MAX_RECONNECT_ATTEMPTS=5
```

## Installation

### 1. Install Dependencies

```bash
# Backend dependencies
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Frontend dependencies
npm install socket.io-client
```

### 2. Update Package.json Scripts

```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## Configuration

### 1. WebSocket Configuration

The WebSocket gateway is configured in `notifications.gateway.ts`:

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
```

### 2. Authentication

WebSocket connections are authenticated using JWT tokens:

```typescript
@UseGuards(WsJwtGuard)
export class NotificationsGateway {
  // ... implementation
}
```

### 3. Rate Limiting

Configure rate limiting for WebSocket connections in your main app:

```typescript
// app.module.ts
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService) => ({
    ttl: configService.get('throttler.ttl', 60),
    limit: configService.get('throttler.limit', 100),
    // Add WebSocket-specific limits
    ws: {
      ttl: 60,
      limit: 1000,
    },
  }),
  inject: [ConfigService],
}),
```

## Usage

### 1. Backend Usage

#### Creating Notifications

```typescript
// In your service
@Injectable()
export class QuotationService {
  constructor(
    private readonly inAppNotificationService: InAppNotificationService,
  ) {}

  async createQuotation(createQuotationDto: CreateQuotationDto) {
    // ... create quotation logic

    // Send notification
    await this.inAppNotificationService.createNotification({
      userId: quotation.userId,
      companyId: quotation.companyId,
      title: 'New Quotation Created',
      message: `Quotation ${quotation.number} has been created successfully.`,
      type: NotificationType.QUOTATION_CREATED,
      priority: NotificationPriority.NORMAL,
      data: { quotationId: quotation.id },
    });
  }
}
```

#### Sending Real-time Notifications

```typescript
// In your service
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async sendRealTimeNotification(userId: string, notification: any) {
    await this.notificationsGateway.sendNotificationToUser(userId, notification);
  }
}
```

### 2. Frontend Usage

#### WebSocket Connection

```typescript
// hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useNotifications = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const newSocket = io('http://localhost:3001/notifications', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connected', (data) => {
      console.log('Connected to notifications:', data);
    });

    newSocket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('unreadCount', (data) => {
      setUnreadCount(data.count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, notifications, unreadCount };
};
```

#### Notification Component

```typescript
// components/NotificationBell.tsx
import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div className="notification-bell">
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </div>
  );
};
```

## Testing

### 1. Backend Testing

```bash
# Run notification tests
npm run test notifications

# Run specific test file
npm run test notifications.service.spec.ts
```

### 2. WebSocket Testing

Test WebSocket connections using a tool like Postman or wscat:

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:3001/notifications" -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send test message
{"event": "ping"}
```

### 3. Frontend Testing

```bash
# Run frontend tests
npm run test

# Run notification tests
npm run test -- --testPathPattern=notifications
```

## Monitoring and Debugging

### 1. Logging

The system includes comprehensive logging:

```typescript
// Check logs for WebSocket connections
tail -f logs/app.log | grep "NotificationsGateway"

// Check notification creation logs
tail -f logs/app.log | grep "InAppNotificationService"
```

### 2. WebSocket Connection Status

Monitor active WebSocket connections:

```typescript
// In your service
const stats = this.notificationsGateway.getConnectionStats();
console.log('Active connections:', stats.totalConnected);
```

### 3. Performance Monitoring

Monitor notification delivery performance:

```typescript
// Check notification statistics
const stats = await this.inAppNotificationService.getUserNotificationStats(userId);
console.log('User notification stats:', stats);
```

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Failed

**Symptoms**: Frontend can't connect to WebSocket
**Solutions**:
- Check if backend is running on correct port
- Verify CORS configuration
- Check JWT token validity
- Ensure WebSocket gateway is properly registered

#### 2. Notifications Not Delivered

**Symptoms**: Notifications created but not received
**Solutions**:
- Check user notification preferences
- Verify WebSocket connection status
- Check notification type settings
- Verify user is not muted

#### 3. Database Connection Issues

**Symptoms**: Error creating notifications
**Solutions**:
- Check database connection
- Verify entity registration
- Check migration status
- Verify table creation

### Debug Commands

```bash
# Check WebSocket connections
curl -X GET http://localhost:3001/notifications/status

# Test notification creation
curl -X POST http://localhost:3001/in-app-notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "companyId": "company-id",
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "info"
  }'

# Check notification preferences
curl -X GET http://localhost:3001/in-app-notifications/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Considerations

### 1. Authentication

- All WebSocket connections require valid JWT tokens
- Users can only access their own notifications
- Company-wide notifications respect user permissions

### 2. Rate Limiting

- WebSocket connections are rate-limited
- Notification creation is throttled
- Bulk operations have size limits

### 3. Data Validation

- All notification data is validated using DTOs
- SQL injection protection through TypeORM
- XSS protection in notification content

## Performance Optimization

### 1. Database Indexing

Ensure proper indexes are created:

```sql
-- Add composite indexes for common queries
CREATE INDEX idx_notifications_user_company_status ON notifications(user_id, company_id, status);
CREATE INDEX idx_notifications_type_priority ON notifications(type, priority);
```

### 2. Caching

Implement Redis caching for frequently accessed data:

```typescript
// Cache user preferences
const preferences = await this.cacheManager.get(`preferences:${userId}`);
if (!preferences) {
  preferences = await this.preferencesRepository.findOne({ where: { userId } });
  await this.cacheManager.set(`preferences:${userId}`, preferences, 3600);
}
```

### 3. Batch Operations

Use batch operations for multiple notifications:

```typescript
// Create multiple notifications at once
await this.inAppNotificationService.createMultipleNotifications(notifications);
```

## Deployment

### 1. Production Configuration

Update environment variables for production:

```env
# Production WebSocket settings
FRONTEND_URL=https://yourdomain.com
NOTIFICATION_CLEANUP_INTERVAL=1800000  # 30 minutes
NOTIFICATION_EXPIRY_DAYS=90
```

### 2. Load Balancing

For multiple backend instances, ensure WebSocket connections are properly routed:

```nginx
# Nginx configuration for WebSocket support
location /notifications {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. Monitoring

Set up monitoring for production:

```typescript
// Health check endpoint
@Get('health')
async healthCheck() {
  const stats = this.notificationsGateway.getConnectionStats();
  return {
    status: 'healthy',
    connections: stats.totalConnected,
    timestamp: new Date(),
  };
}
```

## Conclusion

The In-App Notifications system provides a robust, scalable solution for real-time user notifications. With proper configuration and monitoring, it can handle high-volume notification delivery while maintaining performance and security.

For additional support or questions, refer to the API documentation or contact the development team.
