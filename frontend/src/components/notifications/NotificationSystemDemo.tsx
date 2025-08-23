import React, { useState } from 'react';
import { NotificationSystem } from './NotificationSystem';
import { FloatingNotificationBadge } from './NotificationBadges';
import { toast } from 'react-hot-toast';

export default function NotificationSystemDemo() {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notificationAction, setNotificationAction] = useState<string>('');

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    console.log('Notification clicked:', notification);
    
    // Show a toast for demonstration
    toast.success(`Notification clicked: ${notification.title}`);
  };

  const handleNotificationAction = (notification: any, action: string) => {
    setNotificationAction(action);
    console.log('Notification action:', { notification, action });
    
    // Show a toast for demonstration
    toast.success(`Action "${action}" performed on notification: ${notification.title}`);
  };

  const handleTestNotifications = () => {
    // Create some test notifications
    const testNotifications = [
      {
        id: 'test-1',
        type: 'success',
        title: 'Quote Created Successfully',
        message: 'Your quote has been created and saved to the system.',
        priority: 'medium',
        category: 'quote',
      },
      {
        id: 'test-2',
        type: 'warning',
        title: 'Client Contact Expiring',
        message: 'Client contact information will expire in 30 days.',
        priority: 'high',
        category: 'client',
      },
      {
        id: 'test-3',
        type: 'info',
        title: 'System Update Available',
        message: 'A new system update is available for download.',
        priority: 'low',
        category: 'system',
      },
    ];

    // Show test notifications
    testNotifications.forEach((notification, index) => {
      setTimeout(() => {
        toast(notification.message, {
          icon: notification.type === 'success' ? '✅' : 
                notification.type === 'warning' ? '⚠️' : 
                notification.type === 'error' ? '❌' : 'ℹ️',
          duration: 4000,
        });
      }, index * 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Floating Notification Badge */}
      <FloatingNotificationBadge
        position="top-right"
        showCount={true}
        showType={true}
        showPriority={true}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={() => {
          toast.success('All notifications marked as read!');
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Notification System Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            This demo showcases the comprehensive notification system including:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Notification center with filtering and management
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Toast notification templates and testing
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              User preferences and notification settings
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Complete notification history and archiving
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Push notification management and testing
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Notification analytics and reporting
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Real-time notification badges and dropdowns
            </li>
          </ul>
        </div>

        {/* Demo Controls */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Demo Controls
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Notifications
                </h3>
                <button
                  onClick={handleTestNotifications}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Show Test Toasts
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Creates sample toast notifications to demonstrate the system
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => toast.success('Success notification!')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Success Toast
                  </button>
                  <button
                    onClick={() => toast.error('Error notification!')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors ml-2"
                  >
                    Error Toast
                  </button>
                  <button
                    onClick={() => toast('Info notification!', { icon: 'ℹ️' })}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors ml-2"
                  >
                    Info Toast
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification System */}
        <NotificationSystem
          onNotificationClick={handleNotificationClick}
          onNotificationAction={handleNotificationAction}
        />

        {/* Demo Information */}
        {selectedNotification && (
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Selected Notification Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <p><strong>Title:</strong> {selectedNotification.title}</p>
                <p><strong>Type:</strong> {selectedNotification.type}</p>
                <p><strong>Priority:</strong> {selectedNotification.priority}</p>
                <p><strong>Category:</strong> {selectedNotification.category}</p>
              </div>
              <div>
                <p><strong>Message:</strong> {selectedNotification.message}</p>
                <p><strong>ID:</strong> {selectedNotification.id}</p>
                <p><strong>Created:</strong> {new Date(selectedNotification.createdAt || Date.now()).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {notificationAction && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-md font-semibold text-green-900 dark:text-green-100 mb-2">
              Last Action Performed
            </h3>
            <p className="text-green-800 dark:text-green-200">
              <strong>Action:</strong> {notificationAction}
            </p>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🎯 Smart Filtering
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Advanced filtering by type, category, priority, and date range. 
              Search through notifications with real-time results.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🔔 Multi-Channel Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Support for email, push, and in-app notifications. 
              Configurable preferences and quiet hours.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📊 Analytics & Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Comprehensive analytics dashboard with notification trends, 
              user engagement metrics, and performance insights.
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Frontend Components
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• React functional components with TypeScript</li>
                <li>• Custom hooks for state management</li>
                <li>• Responsive design with Tailwind CSS</li>
                <li>• Dark mode support</li>
                <li>• Accessibility features (ARIA labels, keyboard navigation)</li>
                <li>• Real-time updates and optimistic UI</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Backend Integration
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• RESTful API endpoints for CRUD operations</li>
                <li>• Push notification service with VAPID keys</li>
                <li>• Service Worker for offline support</li>
                <li>• Real-time updates via WebSockets (planned)</li>
                <li>• Database persistence and caching</li>
                <li>• User preference management</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Browser Compatibility
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The notification system works on all modern browsers with HTTPS. 
              Push notifications require Service Worker support and user permission. 
              Fallback to email notifications is available for unsupported browsers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
