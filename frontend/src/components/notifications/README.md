# Notification System

A comprehensive notification system for the quotation management application that provides real-time notifications, user preferences, and multi-channel delivery.

## Features

### 🎯 Core Functionality
- **Notification Center**: Centralized hub for viewing and managing all notifications
- **Toast Notifications**: In-app toast messages with customizable templates
- **User Preferences**: Configurable notification settings per user
- **Notification History**: Complete audit trail with filtering and search
- **Push Notifications**: Browser-based push notifications with service worker
- **Notification Badges**: Real-time unread count indicators

### 🔔 Notification Types
- **Success**: Confirmation messages and positive feedback
- **Warning**: Important alerts and cautionary information
- **Error**: Error messages and failure notifications
- **Info**: General information and updates

### 📊 Categories
- **Quote**: Quote-related notifications (creation, updates, approvals)
- **Client**: Client management notifications
- **System**: System updates and maintenance
- **User**: User account and permission notifications
- **Custom**: User-defined notification categories

### ⚡ Priority Levels
- **Low**: Non-urgent informational messages
- **Medium**: Standard notifications requiring attention
- **High**: Important notifications requiring immediate action
- **Critical**: Emergency notifications requiring immediate response

## Components

### 1. NotificationSystem.tsx
Main dashboard component that integrates all notification features using a tabbed interface.

**Props:**
- `onNotificationClick`: Callback for notification clicks
- `onNotificationAction`: Callback for notification actions

**Features:**
- Tabbed navigation between all notification features
- Responsive design with mobile support
- Dark mode compatibility

### 2. NotificationCenter.tsx
Core notification management interface with filtering, sorting, and bulk actions.

**Features:**
- Real-time notification list with pagination
- Advanced filtering by type, category, priority, and date
- Search functionality with real-time results
- Bulk actions (mark as read, archive, delete)
- Notification statistics dashboard
- Responsive grid layout

**State Management:**
- Notifications list with loading states
- Filter and search state
- Sort preferences
- Bulk selection state

### 3. ToastNotifications.tsx
Toast notification template management and testing interface.

**Features:**
- Create and manage toast notification templates
- Customizable notification types, priorities, and categories
- Configurable duration and action buttons
- Live preview and testing
- Template library management

**Template Properties:**
- Type (success, warning, error, info)
- Priority level
- Category assignment
- Duration settings
- Action button configuration
- Custom styling options

### 4. NotificationPreferences.tsx
User notification preferences and settings management.

**Features:**
- Multi-channel notification settings (email, push, in-app)
- Category-specific notification toggles
- Frequency preferences (immediate, hourly, daily, weekly digest)
- Quiet hours configuration with timezone support
- Preference reset and restore options

**Settings Categories:**
- **Email Notifications**: SMTP configuration and delivery preferences
- **Push Notifications**: Browser push settings and permissions
- **In-App Notifications**: Desktop and mobile notification preferences
- **Category Preferences**: Granular control per notification type
- **Quiet Hours**: Do-not-disturb scheduling

### 5. NotificationHistory.tsx
Comprehensive notification history with advanced filtering and export capabilities.

**Features:**
- Complete notification archive with pagination
- Advanced filtering options (type, category, priority, read status)
- Date range selection and search functionality
- Bulk operations (mark as read, archive, delete)
- Export functionality (CSV, JSON)
- Historical analytics and trends

**Filter Options:**
- Notification type and category
- Priority level and read status
- Date range and time periods
- Search term matching
- User and entity associations

### 6. PushNotificationHandler.tsx
Push notification management and testing interface.

**Features:**
- Browser compatibility checking
- Permission request and management
- Service worker registration
- Push subscription management
- Test notification sending
- VAPID key configuration

**Technical Features:**
- Service Worker integration
- Push API implementation
- Subscription management
- Permission handling
- Error handling and fallbacks

### 7. NotificationBadges.tsx
Real-time notification indicators and dropdown menus.

**Components:**
- `FloatingNotificationBadge`: Floating notification bell with count
- `InlineNotificationBadge`: Inline notification indicator
- `StatusNotificationBadge`: Status-specific notification badge

**Features:**
- Real-time unread count updates
- Notification preview dropdown
- Quick actions (mark all as read, view all)
- Position customization (top-right, top-left, bottom-right, bottom-left)
- Responsive design with mobile support

## Data Models

### Notification Interface
```typescript
interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
```

### NotificationPreferences Interface
```typescript
interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: Record<string, boolean>;
  };
  push: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: Record<string, boolean>;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    categories: Record<string, boolean>;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  digestTime: string;
}
```

### NotificationTemplate Interface
```typescript
interface NotificationTemplate {
  id: string;
  name: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  variables: string[];
  actionButton?: {
    text: string;
    url: string;
  };
  duration: number;
  enabled: boolean;
}
```

## API Integration

### NotificationService
The `NotificationService` class provides all API interactions for the notification system.

**Key Methods:**
- `getNotifications()`: Fetch notifications with filtering and pagination
- `createNotification()`: Create new notifications
- `updateNotification()`: Update existing notifications
- `deleteNotification()`: Delete notifications
- `markAsRead()`: Mark notifications as read
- `archiveNotification()`: Archive notifications
- `getNotificationPreferences()`: Fetch user preferences
- `updateNotificationPreferences()`: Update user preferences
- `subscribeToPushNotifications()`: Subscribe to push notifications
- `sendTestPushNotification()`: Send test push notifications

### Service Worker
The notification system includes a service worker for push notification handling.

**Features:**
- Push notification reception
- Background sync support
- Offline notification caching
- Click event handling
- Badge updates

## Usage Examples

### Basic Notification Creation
```typescript
import { notificationService } from '../services/notificationService';

// Create a simple notification
await notificationService.createNotification({
  type: 'success',
  title: 'Quote Created',
  message: 'Your quote has been successfully created.',
  priority: 'medium',
  category: 'quote'
});
```

### Toast Notification
```typescript
import { toast } from 'react-hot-toast';

// Show a success toast
toast.success('Operation completed successfully!');

// Show a custom toast
toast('Custom message', {
  icon: '🎉',
  duration: 5000,
  style: {
    background: '#363636',
    color: '#fff',
  },
});
```

### Push Notification Subscription
```typescript
import { notificationService } from '../services/notificationService';

// Subscribe to push notifications
const subscription = await notificationService.subscribeToPushNotifications();

if (subscription) {
  console.log('Successfully subscribed to push notifications');
}
```

### Notification Preferences
```typescript
import { notificationService } from '../services/notificationService';

// Update user preferences
await notificationService.updateNotificationPreferences({
  email: {
    enabled: true,
    frequency: 'daily',
    categories: {
      quote: true,
      client: false,
      system: true
    }
  },
  push: {
    enabled: true,
    frequency: 'immediate',
    categories: {
      quote: true,
      client: true,
      system: false
    }
  }
});
```

## Configuration

### Environment Variables
```bash
# Push notification configuration
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Email notification configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

### Service Worker Registration
The service worker is automatically registered when the notification system is initialized.

**Registration Options:**
- Scope: `/` (root domain)
- Update via: `skipWaiting()` and `clients.claim()`
- Push event handling with notification display

## Styling and Theming

### CSS Classes
The notification system uses Tailwind CSS classes for consistent styling.

**Common Classes:**
- `bg-{color}-{shade}`: Background colors
- `text-{color}-{shade}`: Text colors
- `border-{color}-{shade}`: Border colors
- `rounded-{size}`: Border radius
- `shadow-{size}`: Box shadows
- `hover:`, `focus:`, `active:`: State variants

### Dark Mode Support
All components include dark mode variants using Tailwind's dark mode classes.

**Dark Mode Classes:**
- `dark:bg-gray-900`: Dark background
- `dark:text-white`: Dark text
- `dark:border-gray-700`: Dark borders

### Custom CSS Variables
```css
:root {
  --notification-success: #10b981;
  --notification-warning: #f59e0b;
  --notification-error: #ef4444;
  --notification-info: #3b82f6;
}
```

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components load only when needed
- **Debounced Search**: Search input debouncing for performance
- **Virtual Scrolling**: Large lists use virtual scrolling
- **Memoization**: React.memo for expensive components
- **State Batching**: Multiple state updates batched together

### Caching
- **Notification Cache**: Recent notifications cached in memory
- **Preference Cache**: User preferences cached locally
- **Template Cache**: Notification templates cached for reuse

## Accessibility

### ARIA Support
- **aria-label**: Descriptive labels for interactive elements
- **aria-expanded**: Dropdown state indication
- **aria-live**: Live region announcements
- **aria-describedby**: Element descriptions

### Keyboard Navigation
- **Tab Order**: Logical tab sequence
- **Arrow Keys**: Dropdown navigation
- **Enter/Space**: Activation keys
- **Escape**: Close dropdowns and modals

### Screen Reader Support
- **Semantic HTML**: Proper heading structure
- **Alt Text**: Descriptive alt text for images
- **Status Messages**: Live status updates
- **Focus Management**: Proper focus handling

## Testing

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';

test('renders notification center', () => {
  render(<NotificationCenter />);
  expect(screen.getByText('Notification Center')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
import { notificationService } from '../services/notificationService';

test('creates notification successfully', async () => {
  const notification = await notificationService.createNotification({
    type: 'success',
    title: 'Test',
    message: 'Test message'
  });
  
  expect(notification.id).toBeDefined();
});
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('notification workflow', async ({ page }) => {
  await page.goto('/notifications');
  await page.click('[data-testid="create-notification"]');
  await page.fill('[data-testid="title-input"]', 'Test Notification');
  await page.click('[data-testid="save-button"]');
  
  await expect(page.locator('text=Test Notification')).toBeVisible();
});
```

## Browser Compatibility

### Supported Browsers
- **Chrome**: 88+ (Full support)
- **Firefox**: 85+ (Full support)
- **Safari**: 14+ (Full support)
- **Edge**: 88+ (Full support)

### Feature Support Matrix
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Push Notifications | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Notifications API | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |

### Fallbacks
- **Push Notifications**: Fallback to email for unsupported browsers
- **Service Worker**: Graceful degradation for older browsers
- **Modern CSS**: PostCSS autoprefixer for vendor prefixes

## Troubleshooting

### Common Issues

#### Push Notifications Not Working
1. Check HTTPS requirement
2. Verify service worker registration
3. Check browser permissions
4. Validate VAPID keys

#### Notifications Not Displaying
1. Check notification preferences
2. Verify notification service status
3. Check browser console for errors
4. Validate notification data format

#### Performance Issues
1. Check notification count and filtering
2. Verify lazy loading implementation
3. Monitor memory usage
4. Check for unnecessary re-renders

### Debug Mode
Enable debug mode by setting the environment variable:
```bash
NOTIFICATION_DEBUG=true
```

This will provide additional logging and debugging information.

## Future Enhancements

### Planned Features
- **WebSocket Integration**: Real-time notification updates
- **Mobile Push**: Native mobile app push notifications
- **Advanced Analytics**: Detailed notification performance metrics
- **AI-Powered Filtering**: Smart notification categorization
- **Multi-language Support**: Internationalization support

### Technical Improvements
- **Offline Support**: Enhanced offline notification handling
- **Performance Optimization**: Further performance improvements
- **Accessibility**: Enhanced accessibility features
- **Testing**: Comprehensive test coverage

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive documentation
- Include unit tests for new features

### Testing
- Write unit tests for all components
- Include integration tests for API calls
- Add E2E tests for critical workflows
- Maintain test coverage above 80%

## License

This notification system is part of the quotation management application and follows the same licensing terms.
