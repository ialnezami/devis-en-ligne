import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { NotificationCenter } from './NotificationCenter';
import { ToastNotifications } from './ToastNotifications';
import { NotificationPreferences } from './NotificationPreferences';
import { NotificationHistory } from './NotificationHistory';
import { PushNotificationHandler } from './PushNotificationHandler';
import { NotificationBadges } from './NotificationBadges';

interface NotificationSystemProps {
  onNotificationClick?: (notification: any) => void;
  onNotificationAction?: (notification: any, action: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  onNotificationClick,
  onNotificationAction,
}) => {
  const [activeTab, setActiveTab] = useState('center');
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNotificationClick = (notification: any) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleNotificationAction = (notification: any, action: string) => {
    if (onNotificationAction) {
      onNotificationAction(notification, action);
    }
  };

  const handlePreferencesUpdated = (preferences: any) => {
    console.log('Notification preferences updated:', preferences);
    // You can add additional logic here, such as updating global state
  };

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
    // Additional logic for marking all as read
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification System
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive notification management for the quotation system
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-4 w-4" />
              <span>Total: {unreadCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-4 w-4" />
              <span>Email: Enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <DevicePhoneMobileIcon className="h-4 w-4" />
              <span>Push: Available</span>
            </div>
          </div>

          {/* Notification Badge */}
          <NotificationBadges
            showCount={true}
            showType={true}
            showPriority={true}
            onNotificationClick={handleNotificationClick}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="center" className="flex items-center space-x-2">
            <BellIcon className="h-4 w-4" />
            <span>Center</span>
          </TabsTrigger>
          <TabsTrigger value="toasts" className="flex items-center space-x-2">
            <EnvelopeIcon className="h-4 w-4" />
            <span>Toasts</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center space-x-2">
            <DevicePhoneMobileIcon className="h-4 w-4" />
            <span>Push</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Notification Center Tab */}
        <TabsContent value="center" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Center</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationCenter
                onNotificationClick={handleNotificationClick}
                onNotificationAction={handleNotificationAction}
                showUnreadOnly={false}
                maxNotifications={50}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Toast Notifications Tab */}
        <TabsContent value="toasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toast Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ToastNotifications
                onToastCreated={(toastData) => {
                  console.log('Toast created:', toastData);
                  // You can add additional logic here
                }}
                onToastDeleted={(toastId) => {
                  console.log('Toast deleted:', toastId);
                  // You can add additional logic here
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationPreferences
                onPreferencesUpdated={handlePreferencesUpdated}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationHistory
                onNotificationClick={handleNotificationClick}
                onNotificationAction={handleNotificationAction}
                showArchived={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notifications Tab */}
        <TabsContent value="push" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <PushNotificationHandler
                onPermissionChange={(permission) => {
                  console.log('Permission changed:', permission);
                  // You can add additional logic here
                }}
                onSubscriptionChange={(subscription) => {
                  console.log('Subscription changed:', subscription);
                  // You can add additional logic here
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Notifications */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                      <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {unreadCount + 150} {/* Mock data */}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unread Notifications */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                      <EnvelopeIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {unreadCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Push Subscriptions */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Push Enabled</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        85%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Response Rate */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                      <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        92%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="mt-6 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Notification Analytics Chart
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Interactive charts and detailed analytics will be displayed here.
                  This could include notification trends, user engagement metrics,
                  and performance analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Quick Actions:</span>
              <span className="ml-2">
                Mark all as read • Archive old notifications • Export history • Test notifications
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <NotificationBadges
                showCount={true}
                showType={false}
                showPriority={false}
                maxCount={99}
                onNotificationClick={handleNotificationClick}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
