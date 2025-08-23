import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { notificationService } from '@/services/notificationService';
import { toast } from 'react-hot-toast';

interface NotificationBadgesProps {
  showCount?: boolean;
  showType?: boolean;
  showPriority?: boolean;
  maxCount?: number;
  onNotificationClick?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

export const NotificationBadges: React.FC<NotificationBadgesProps> = ({
  showCount = true,
  showType = true,
  showPriority = true,
  maxCount = 99,
  onNotificationClick,
  onMarkAllAsRead,
  className = '',
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotificationCount();
    loadRecentNotifications();
  }, []);

  // Refresh notification count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotificationCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const loadRecentNotifications = async () => {
    setIsLoading(true);
    try {
      const notifications = await notificationService.getNotifications({
        isRead: false,
        limit: 5,
      });
      setRecentNotifications(notifications);
    } catch (error) {
      console.error('Failed to load recent notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = recentNotifications.map(n => n.id);
      if (unreadIds.length > 0) {
        const success = await notificationService.markMultipleAsRead(unreadIds);
        if (success) {
          setUnreadCount(0);
          setRecentNotifications([]);
          toast.success('All notifications marked as read');
          
          if (onMarkAllAsRead) {
            onMarkAllAsRead();
          }
        }
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    setShowDropdown(false);
    
    if (onNotificationClick) {
      onNotificationClick(notificationId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckIcon className="h-4 w-4 text-green-600" />;
      case 'warning': return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XMarkIcon className="h-4 w-4 text-red-600" />;
      case 'info': return <InformationCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'quote': return <StarIcon className="h-4 w-4 text-purple-600" />;
      case 'client': return <UserIcon className="h-4 w-4 text-indigo-600" />;
      case 'system': return <CogIcon className="h-4 w-4 text-gray-600" />;
      default: return <BellIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'info': return 'blue';
      case 'quote': return 'purple';
      case 'client': return 'indigo';
      case 'system': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const formatNotificationTime = (date: Date | string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        aria-label={`${unreadCount} unread notifications`}
      >
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        
        {/* Notification Count Badge */}
        {showCount && unreadCount > 0 && (
          <Badge
            variant="solid"
            color="red"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold p-0 min-w-0"
          >
            {displayCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDropdown(false)}
                  className="p-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading notifications...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-4 text-center">
                  <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No unread notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Notification Icon */}
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {notification.title}
                            </h4>
                            
                            <span className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {notification.message}
                          </p>

                          {/* Badges */}
                          <div className="flex items-center space-x-2">
                            {showType && (
                              <Badge
                                variant="outline"
                                color={getNotificationColor(notification.type)}
                                className="text-xs"
                              >
                                {notification.type}
                              </Badge>
                            )}
                            
                            {showPriority && (
                              <Badge
                                variant="outline"
                                color={getPriorityColor(notification.priority)}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to full notification center
                    window.location.href = '/notifications';
                  }}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Floating Notification Badge for corner positioning
export const FloatingNotificationBadge: React.FC<NotificationBadgesProps & {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ position = 'top-right', ...props }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <NotificationBadges {...props} />
    </div>
  );
};

// Inline Notification Badge for text display
export const InlineNotificationBadge: React.FC<{
  count: number;
  type?: string;
  priority?: string;
  maxCount?: number;
  className?: string;
}> = ({ count, type, priority, maxCount = 99, className = '' }) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;

  if (count === 0) return null;

  return (
    <Badge
      variant="solid"
      color="red"
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

// Status Notification Badge
export const StatusNotificationBadge: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  showNotification?: boolean;
  className?: string;
}> = ({ status, showNotification = false, className = '' }) => {
  const statusConfig = {
    online: { color: 'green', icon: '🟢', text: 'Online' },
    offline: { color: 'gray', icon: '⚫', text: 'Offline' },
    away: { color: 'yellow', icon: '🟡', text: 'Away' },
    busy: { color: 'red', icon: '🔴', text: 'Busy' },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm">{config.icon}</span>
      <Badge variant="outline" color={config.color as any}>
        {config.text}
      </Badge>
      {showNotification && (
        <InlineNotificationBadge count={1} />
      )}
    </div>
  );
};
