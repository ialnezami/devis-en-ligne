import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  BellIcon,
  XMarkIcon,
  ArrowUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface TrialExpirationNotificationsProps {
  daysRemaining: number;
  onUpgrade: () => void;
  onDismiss?: (notificationId: string) => void;
}

interface Notification {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  daysThreshold: number;
  isDismissed: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function TrialExpirationNotifications({ 
  daysRemaining, 
  onUpgrade,
  onDismiss 
}: TrialExpirationNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    const generateNotifications = (): Notification[] => {
      const notifs: Notification[] = [];

      // Critical notification for last day
      if (daysRemaining <= 1) {
        notifs.push({
          id: 'critical-expiry',
          type: 'critical',
          title: 'Trial Expires Today!',
          message: 'Your free trial expires today. Upgrade now to continue using all features without interruption.',
          daysThreshold: 1,
          isDismissed: false,
          action: {
            label: 'Upgrade Now',
            onClick: onUpgrade
          }
        });
      }
      // Warning for last 3 days
      else if (daysRemaining <= 3) {
        notifs.push({
          id: 'urgent-expiry',
          type: 'critical',
          title: 'Trial Expires Soon!',
          message: `Your free trial expires in ${daysRemaining} days. Don't lose access to your data and features.`,
          daysThreshold: 3,
          isDismissed: false,
          action: {
            label: 'Upgrade Now',
            onClick: onUpgrade
          }
        });
      }
      // Warning for last week
      else if (daysRemaining <= 7) {
        notifs.push({
          id: 'week-expiry',
          type: 'warning',
          title: 'Trial Expires This Week',
          message: `Your free trial expires in ${daysRemaining} days. Consider upgrading to continue using premium features.`,
          daysThreshold: 7,
          isDismissed: false,
          action: {
            label: 'View Plans',
            onClick: onUpgrade
          }
        });
      }
      // Info for last 2 weeks
      else if (daysRemaining <= 14) {
        notifs.push({
          id: 'info-expiry',
          type: 'info',
          title: 'Trial Status',
          message: `You have ${daysRemaining} days remaining in your free trial. Explore all features while you can.`,
          daysThreshold: 14,
          isDismissed: false
        });
      }

      return notifs;
    };

    setNotifications(generateNotifications());
  }, [daysRemaining, onUpgrade]);

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isDismissed: true }
          : notif
      )
    );
    onDismiss?.(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getActionButtonStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const activeNotifications = notifications.filter(n => !n.isDismissed);
  const hasNotifications = activeNotifications.length > 0;

  if (!hasNotifications) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main Notification Banner */}
      {activeNotifications.length > 0 && (
        <div className={`${getNotificationStyles(activeNotifications[0].type)} border rounded-lg p-4`}>
          <div className="flex items-start space-x-3">
            {getNotificationIcon(activeNotifications[0].type)}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {activeNotifications[0].title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {activeNotifications[0].message}
              </p>
              
              <div className="flex items-center space-x-3">
                {activeNotifications[0].action && (
                  <button
                    onClick={activeNotifications[0].action.onClick}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getActionButtonStyles(activeNotifications[0].type)}`}
                  >
                    {activeNotifications[0].action.label}
                  </button>
                )}
                
                {activeNotifications.length > 1 && (
                  <button
                    onClick={() => setShowAllNotifications(!showAllNotifications)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {showAllNotifications ? 'Hide' : `Show ${activeNotifications.length - 1} more`}
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleDismiss(activeNotifications[0].id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Additional Notifications */}
      {showAllNotifications && activeNotifications.slice(1).map((notification) => (
        <div key={notification.id} className={`${getNotificationStyles(notification.type)} border rounded-lg p-4`}>
          <div className="flex items-start space-x-3">
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {notification.message}
              </p>
              
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getActionButtonStyles(notification.type)}`}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={() => handleDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}

      {/* Trial Status Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Trial Status
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {daysRemaining} days remaining
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              daysRemaining <= 3 ? 'bg-red-500' :
              daysRemaining <= 7 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              daysRemaining <= 3 ? 'text-red-600 dark:text-red-400' :
              daysRemaining <= 7 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {daysRemaining <= 3 ? 'Critical' :
               daysRemaining <= 7 ? 'Warning' :
               'Good'}
            </span>
          </div>
        </div>
        
        {daysRemaining <= 7 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onUpgrade}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowUpIcon className="h-4 w-4 inline mr-2" />
              Upgrade to Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
