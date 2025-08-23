import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  BellIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { notificationService } from '@/services/notificationService';
import { toast } from 'react-hot-toast';

interface PushNotificationHandlerProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
}

export const PushNotificationHandler: React.FC<PushNotificationHandlerProps> = ({
  onPermissionChange,
  onSubscriptionChange,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'unregistered' | 'registering' | 'registered' | 'error'>('unregistered');
  const [testNotification, setTestNotification] = useState({
    title: 'Test Push Notification',
    body: 'This is a test push notification from the quotation system.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'test-notification',
    requireInteraction: false,
    silent: false,
  });

  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Check if push notifications are supported
      const supported = notificationService.isPushSupported();
      setPushSupported(supported);

      if (!supported) {
        console.log('Push notifications not supported in this browser');
        return;
      }

      // Check current permission status
      const currentPermission = await checkPermissionStatus();
      setPermission(currentPermission);

      // Check if already subscribed
      const subscribed = await notificationService.isPushEnabled();
      setIsSubscribed(subscribed);

      if (subscribed) {
        // Get current subscription
        const currentSubscription = await getCurrentSubscription();
        setSubscription(currentSubscription);
      }

      // Check service worker status
      await checkServiceWorkerStatus();

    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      setServiceWorkerStatus('error');
    }
  };

  const checkPermissionStatus = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  };

  const getCurrentSubscription = async (): Promise<PushSubscription | null> => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          return await registration.pushManager.getSubscription();
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      return null;
    }
  };

  const checkServiceWorkerStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setServiceWorkerStatus('registered');
        } else {
          setServiceWorkerStatus('unregistered');
        }
      }
    } catch (error) {
      console.error('Failed to check service worker status:', error);
      setServiceWorkerStatus('error');
    }
  };

  const handleRequestPermission = async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    try {
      const granted = await notificationService.requestPushPermission();
      
      if (granted) {
        setPermission('granted');
        toast.success('Push notification permission granted!');
        
        if (onPermissionChange) {
          onPermissionChange('granted');
        }
      } else {
        setPermission('denied');
        toast.error('Push notification permission denied');
        
        if (onPermissionChange) {
          onPermissionChange('denied');
        }
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      toast.error('Failed to request push notification permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (permission !== 'granted') {
      toast.error('Push notification permission is required');
      return;
    }

    setIsLoading(true);
    try {
      const newSubscription = await notificationService.subscribeToPushNotifications();
      
      if (newSubscription) {
        setSubscription(newSubscription);
        setIsSubscribed(true);
        toast.success('Successfully subscribed to push notifications!');
        
        if (onSubscriptionChange) {
          onSubscriptionChange(newSubscription);
        }
      } else {
        toast.error('Failed to subscribe to push notifications');
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await notificationService.unsubscribeFromPushNotifications();
      
      if (success) {
        setSubscription(null);
        setIsSubscribed(false);
        toast.success('Successfully unsubscribed from push notifications');
        
        if (onSubscriptionChange) {
          onSubscriptionChange(null);
        }
      } else {
        toast.error('Failed to unsubscribe from push notifications');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      toast.error('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!isSubscribed) {
      toast.error('You must be subscribed to push notifications to test them');
      return;
    }

    try {
      const success = await notificationService.sendTestPushNotification();
      
      if (success) {
        toast.success('Test push notification sent successfully!');
      } else {
        toast.error('Failed to send test push notification');
      }
    } catch (error) {
      console.error('Failed to send test push notification:', error);
      toast.error('Failed to send test push notification');
    }
  };

  const handleTestLocalNotification = () => {
    if (permission !== 'granted') {
      toast.error('Push notification permission is required');
      return;
    }

    try {
      const notification = new Notification(testNotification.title, {
        body: testNotification.body,
        icon: testNotification.icon,
        badge: testNotification.badge,
        tag: testNotification.tag,
        requireInteraction: testNotification.requireInteraction,
        silent: testNotification.silent,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      toast.success('Local test notification sent!');
    } catch (error) {
      console.error('Failed to send local test notification:', error);
      toast.error('Failed to send local test notification');
    }
  };

  const getPermissionStatusColor = (status: NotificationPermission) => {
    switch (status) {
      case 'granted': return 'green';
      case 'denied': return 'red';
      case 'default': return 'yellow';
      default: return 'gray';
    }
  };

  const getPermissionStatusText = (status: NotificationPermission) => {
    switch (status) {
      case 'granted': return 'Granted';
      case 'denied': return 'Denied';
      case 'default': return 'Not Requested';
      default: return 'Unknown';
    }
  };

  const getServiceWorkerStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'green';
      case 'registering': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getServiceWorkerStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Registered';
      case 'registering': return 'Registering...';
      case 'error': return 'Error';
      default: return 'Not Registered';
    }
  };

  const getSubscriptionInfo = () => {
    if (!subscription) return null;

    try {
      const endpoint = subscription.endpoint;
      const keys = {
        p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : 'N/A',
        auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : 'N/A',
      };

      return { endpoint, keys };
    } catch (error) {
      console.error('Failed to get subscription info:', error);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Push Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage push notification settings and subscriptions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={initializePushNotifications}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Support</p>
                <Badge variant="outline" color={pushSupported ? 'green' : 'red'}>
                  {pushSupported ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <ShieldCheckIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permission</p>
                <Badge variant="outline" color={getPermissionStatusColor(permission)}>
                  {getPermissionStatusText(permission)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <CogIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Worker</p>
                <Badge variant="outline" color={getServiceWorkerStatusColor(serviceWorkerStatus)}>
                  {getServiceWorkerStatusText(serviceWorkerStatus)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Management */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Push Notification Permissions</p>
                <p>
                  Push notifications require explicit permission from the user. 
                  Once granted, you can receive notifications even when the app is not active.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Request Permission</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ask the user to allow push notifications
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleRequestPermission}
              disabled={!pushSupported || permission === 'granted' || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Requesting...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Request Permission
                </>
              )}
            </Button>
          </div>

          {permission === 'denied' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">Permission Denied</p>
                  <p>
                    Push notification permission has been denied. You can reset this in your browser settings 
                    and try again, or contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {permission === 'granted' && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isSubscribed 
                      ? 'Stop receiving push notifications'
                      : 'Start receiving push notifications'
                    }
                  </p>
                </div>
              </div>
              
              <Button
                variant={isSubscribed ? 'outline' : 'default'}
                onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                disabled={isLoading}
                className={isSubscribed ? 'text-red-600' : ''}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {isSubscribed ? 'Unsubscribing...' : 'Subscribing...'}
                  </>
                ) : (
                  <>
                    {isSubscribed ? (
                      <>
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Unsubscribe
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>

            {isSubscribed && subscription && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Subscription Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <Badge variant="outline" color="green">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Endpoint:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs truncate max-w-xs">
                      {getSubscriptionInfo()?.endpoint || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">P256DH Key:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs truncate max-w-xs">
                      {getSubscriptionInfo()?.keys.p256dh || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Auth Key:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs truncate max-w-xs">
                      {getSubscriptionInfo()?.keys.auth || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Notifications */}
      {permission === 'granted' && (
        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Title
                </label>
                <Input
                  type="text"
                  value={testNotification.title}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Body
                </label>
                <Input
                  type="text"
                  value={testNotification.body}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter notification body"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon URL
                </label>
                <Input
                  type="url"
                  value={testNotification.icon}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="/favicon.ico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Badge URL
                </label>
                <Input
                  type="url"
                  value={testNotification.badge}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="/favicon.ico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag
                </label>
                <Input
                  type="text"
                  value={testNotification.tag}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="test-notification"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testNotification.requireInteraction}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, requireInteraction: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require interaction</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testNotification.silent}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, silent: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Silent</span>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleTestLocalNotification}
                disabled={permission !== 'granted'}
                variant="outline"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Test Local Notification
              </Button>

              <Button
                onClick={handleTestNotification}
                disabled={!isSubscribed}
                variant="outline"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Test Push Notification
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Testing Notifications</p>
                  <p>
                    Local notifications are displayed immediately in the browser. 
                    Push notifications are sent through the server and may take a few seconds to arrive.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browser Support Information */}
      {!pushSupported && (
        <Card>
          <CardHeader>
            <CardTitle>Browser Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">Push Notifications Not Supported</p>
                  <p>
                    Your browser does not support push notifications. This feature requires:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>HTTPS connection (required for security)</li>
                    <li>Modern browser with Service Worker support</li>
                    <li>Push API support</li>
                  </ul>
                  <p className="mt-2">
                    Try using a modern browser like Chrome, Firefox, or Edge with HTTPS enabled.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
