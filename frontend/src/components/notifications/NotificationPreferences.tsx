import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  GlobeAltIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
  UserIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { NotificationPreferences, notificationService } from '@/services/notificationService';
import { toast } from 'react-hot-toast';

interface NotificationPreferencesProps {
  onPreferencesUpdated?: (preferences: NotificationPreferences) => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onPreferencesUpdated,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const prefs = await notificationService.getNotificationPreferences();
      if (prefs) {
        setPreferences(prefs);
        setOriginalPreferences(prefs);
      } else {
        // Create default preferences if none exist
        const defaultPrefs: NotificationPreferences = {
          id: 'default',
          userId: 'current-user',
          emailNotifications: true,
          pushNotifications: true,
          inAppNotifications: true,
          quoteNotifications: true,
          clientNotifications: true,
          systemNotifications: true,
          reminderNotifications: true,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          categories: {
            quote: true,
            client: true,
            system: true,
            communication: true,
            reminder: true,
            update: true,
          },
          frequency: 'immediate',
          digestEnabled: false,
          digestTime: '09:00',
          updatedAt: new Date(),
        };
        setPreferences(defaultPrefs);
        setOriginalPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const updatedPrefs = await notificationService.updateNotificationPreferences(preferences);
      if (updatedPrefs) {
        setPreferences(updatedPrefs);
        setOriginalPreferences(updatedPrefs);
        setHasChanges(false);
        toast.success('Notification preferences updated successfully');

        if (onPreferencesUpdated) {
          onPreferencesUpdated(updatedPrefs);
        }
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPreferences = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences);
      setHasChanges(false);
      toast.success('Preferences reset to original values');
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;

    setPreferences(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev, [key]: value };
      const hasChanges = JSON.stringify(updated) !== JSON.stringify(originalPreferences);
      setHasChanges(hasChanges);
      
      return updated;
    });
  };

  const handleCategoryChange = (category: keyof NotificationPreferences['categories'], value: boolean) => {
    if (!preferences) return;

    setPreferences(prev => {
      if (!prev) return prev;
      
      const updated = {
        ...prev,
        categories: {
          ...prev.categories,
          [category]: value,
        },
      };
      
      const hasChanges = JSON.stringify(updated) !== JSON.stringify(originalPreferences);
      setHasChanges(hasChanges);
      
      return updated;
    });
  };

  const handleQuietHoursChange = (key: keyof NotificationPreferences['quietHours'], value: any) => {
    if (!preferences) return;

    setPreferences(prev => {
      if (!prev) return prev;
      
      const updated = {
        ...prev,
        quietHours: {
          ...prev.quietHours,
          [key]: value,
        },
      };
      
      const hasChanges = JSON.stringify(updated) !== JSON.stringify(originalPreferences);
      setHasChanges(hasChanges);
      
      return updated;
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EnvelopeIcon className="h-5 w-5" />;
      case 'push': return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'inApp': return <ComputerDesktopIcon className="h-5 w-5" />;
      default: return <BellIcon className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quote': return <StarIcon className="h-5 w-5" />;
      case 'client': return <UserIcon className="h-5 w-5" />;
      case 'system': return <CogIcon className="h-5 w-5" />;
      case 'communication': return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'reminder': return <CalendarIcon className="h-5 w-5" />;
      case 'update': return <ArrowPathIcon className="h-5 w-5" />;
      default: return <BellIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quote': return 'purple';
      case 'client': return 'indigo';
      case 'system': return 'gray';
      case 'communication': return 'blue';
      case 'reminder': return 'yellow';
      case 'update': return 'green';
      default: return 'gray';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'immediate': return 'Immediate';
      case 'hourly': return 'Hourly Digest';
      case 'daily': return 'Daily Digest';
      case 'weekly': return 'Weekly Digest';
      default: return frequency;
    }
  };

  const getTimezoneOptions = () => {
    const timezones = Intl.supportedValuesOf('timeZone');
    return timezones.map(tz => ({
      value: tz,
      label: tz.replace(/_/g, ' '),
    }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading notification preferences...</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Failed to load notification preferences</p>
        <Button onClick={loadPreferences} className="mt-4">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure how and when you receive notifications
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="outline" color="yellow">
              Unsaved Changes
            </Badge>
          )}
          
          <Button variant="outline" onClick={handleResetPreferences}>
            Reset
          </Button>
          
          <Button 
            onClick={handleSavePreferences}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <DevicePhoneMobileIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on mobile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <ComputerDesktopIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">In-App Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Show notifications within the app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications}
                  onChange={(e) => handlePreferenceChange('inAppNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(preferences.categories).map(([category, enabled]) => (
              <div key={category} className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className={`p-2 rounded-full bg-${getCategoryColor(category)}-100`}>
                  {getCategoryIcon(category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {enabled ? 'Notifications enabled' : 'Notifications disabled'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleCategoryChange(category as keyof NotificationPreferences['categories'], e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Frequency
              </label>
              <Select
                value={preferences.frequency}
                onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly Digest</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {getFrequencyLabel(preferences.frequency)} notifications
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Digest Notifications
              </label>
              <div className="flex items-center space-x-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.digestEnabled}
                    onChange={(e) => handlePreferenceChange('digestEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Enable digest notifications
                </span>
              </div>
            </div>
          </div>

          {preferences.digestEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Digest Time
              </label>
              <Input
                type="time"
                value={preferences.digestTime}
                onChange={(e) => handlePreferenceChange('digestTime', e.target.value)}
                className="w-48"
              />
              <p className="text-sm text-gray-500 mt-1">
                Time when digest notifications will be sent
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable quiet hours
            </span>
          </div>

          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={preferences.quietHours.startTime}
                  onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={preferences.quietHours.endTime}
                  onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <Select
                  value={preferences.quietHours.timezone}
                  onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                >
                  {getTimezoneOptions().map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Quiet Hours Information</p>
                <p>
                  During quiet hours, only urgent notifications will be sent. 
                  Regular notifications will be queued and sent when quiet hours end.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Settings */}
      {preferences.pushNotifications && (
        <Card>
          <CardHeader>
            <CardTitle>Push Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Push Notifications</p>
                  <p>
                    Push notifications require browser permission. Click the button below to 
                    enable push notifications for this site.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => notificationService.requestPushPermission()}
                  >
                    Enable Push Notifications
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
