import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface NotificationSettingsProps {
  onSettingsChange: () => void;
}

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  category: string;
}

interface EmailSettings {
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  timezone: string;
  language: string;
}

interface PushSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationSettings({ onSettingsChange }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    enabled: true,
    frequency: 'immediate',
    timezone: 'UTC',
    language: 'en'
  });
  const [pushSettings, setPushSettings] = useState<PushSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');

  // Load notification settings on component mount
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock notification preferences data
      const mockPreferences: NotificationPreference[] = [
        // Quote Notifications
        {
          id: 'quote.created',
          name: 'Quote Created',
          description: 'When a new quote is created',
          email: true,
          push: true,
          inApp: true,
          category: 'Quotes'
        },
        {
          id: 'quote.updated',
          name: 'Quote Updated',
          description: 'When a quote is modified',
          email: true,
          push: false,
          inApp: true,
          category: 'Quotes'
        },
        {
          id: 'quote.approved',
          name: 'Quote Approved',
          description: 'When a quote is approved by client',
          email: true,
          push: true,
          inApp: true,
          category: 'Quotes'
        },
        {
          id: 'quote.rejected',
          name: 'Quote Rejected',
          description: 'When a quote is rejected by client',
          email: true,
          push: true,
          inApp: true,
          category: 'Quotes'
        },
        
        // Client Notifications
        {
          id: 'client.new',
          name: 'New Client',
          description: 'When a new client is added',
          email: true,
          push: false,
          inApp: true,
          category: 'Clients'
        },
        {
          id: 'client.contact',
          name: 'Client Contact',
          description: 'When a client sends a message',
          email: true,
          push: true,
          inApp: true,
          category: 'Clients'
        },
        
        // System Notifications
        {
          id: 'system.maintenance',
          name: 'System Maintenance',
          description: 'Scheduled maintenance notifications',
          email: true,
          push: false,
          inApp: true,
          category: 'System'
        },
        {
          id: 'system.security',
          name: 'Security Alerts',
          description: 'Important security notifications',
          email: true,
          push: true,
          inApp: true,
          category: 'System'
        },
        
        // User Notifications
        {
          id: 'user.login',
          name: 'Login Alerts',
          description: 'When someone logs into your account',
          email: true,
          push: true,
          inApp: false,
          category: 'Security'
        },
        {
          id: 'user.permission',
          name: 'Permission Changes',
          description: 'When your permissions are modified',
          email: true,
          push: false,
          inApp: true,
          category: 'Security'
        }
      ];
      
      setPreferences(mockPreferences);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (id: string, type: 'email' | 'push' | 'inApp', value: boolean) => {
    setPreferences(prev => prev.map(pref => 
      pref.id === id ? { ...pref, [type]: value } : pref
    ));
    onSettingsChange();
  };

  const handleEmailSettingsChange = (field: keyof EmailSettings, value: any) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
    onSettingsChange();
  };

  const handlePushSettingsChange = (field: keyof PushSettings, value: any) => {
    setPushSettings(prev => ({ ...prev, [field]: value }));
    onSettingsChange();
  };

  const handleQuietHoursChange = (field: keyof PushSettings['quietHours'], value: any) => {
    setPushSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [field]: value }
    }));
    onSettingsChange();
  };

  const toggleAllPreferences = (type: 'email' | 'push' | 'inApp', value: boolean) => {
    setPreferences(prev => prev.map(pref => ({ ...pref, [type]: value })));
    onSettingsChange();
  };

  const groupedPreferences = preferences.reduce((acc, preference) => {
    if (!acc[preference.category]) {
      acc[preference.category] = [];
    }
    acc[preference.category].push(preference);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading notification settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your email and push notification preferences
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BellIcon className="h-4 w-4 inline mr-2" />
            Notification Preferences
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <EnvelopeIcon className="h-4 w-4 inline mr-2" />
            Email Settings
          </button>
          <button
            onClick={() => setActiveTab('push')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'push'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <DevicePhoneMobileIcon className="h-4 w-4 inline mr-2" />
            Push Notifications
          </button>
        </nav>
      </div>

      {/* Notification Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toggleAllPreferences('email', true)}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300"
              >
                Enable All Email
              </button>
              <button
                onClick={() => toggleAllPreferences('email', false)}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300"
              >
                Disable All Email
              </button>
              <button
                onClick={() => toggleAllPreferences('push', true)}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300"
              >
                Enable All Push
              </button>
              <button
                onClick={() => toggleAllPreferences('push', false)}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300"
              >
                Disable All Push
              </button>
            </div>
          </div>

          {/* Notification Categories */}
          {Object.entries(groupedPreferences).map(([category, categoryPreferences]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {category}
              </h3>
              <div className="space-y-4">
                {categoryPreferences.map((preference) => (
                  <div key={preference.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {preference.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {preference.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Email Toggle */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preference.email}
                          onChange={(e) => handlePreferenceChange(preference.id, 'email', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                      </label>
                      
                      {/* Push Toggle */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preference.push}
                          onChange={(e) => handlePreferenceChange(preference.id, 'push', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
                      </label>
                      
                      {/* In-App Toggle */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preference.inApp}
                          onChange={(e) => handlePreferenceChange(preference.id, 'inApp', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">In-App</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Email Notification Settings
            </h3>
            
            <div className="space-y-6">
              {/* Email Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSettings.enabled}
                    onChange={(e) => handleEmailSettingsChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {emailSettings.enabled && (
                <>
                  {/* Email Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Frequency
                    </label>
                    <select
                      value={emailSettings.frequency}
                      onChange={(e) => handleEmailSettingsChange('frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={emailSettings.timezone}
                      onChange={(e) => handleEmailSettingsChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      {timezones.map(timezone => (
                        <option key={timezone} value={timezone}>{timezone}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={emailSettings.language}
                      onChange={(e) => handleEmailSettingsChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Push Notifications Tab */}
      {activeTab === 'push' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Push Notification Settings
            </h3>
            
            <div className="space-y-6">
              {/* Push Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications on your device
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushSettings.enabled}
                    onChange={(e) => handlePushSettingsChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {pushSettings.enabled && (
                <>
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Sound
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Play sound for notifications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushSettings.sound}
                      onChange={(e) => handlePushSettingsChange('sound', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {/* Vibration Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Vibration
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vibrate device for notifications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushSettings.vibration}
                      onChange={(e) => handlePushSettingsChange('vibration', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {/* Quiet Hours */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Quiet Hours
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mute notifications during specific hours
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={pushSettings.quietHours.enabled}
                        onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {pushSettings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={pushSettings.quietHours.start}
                            onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={pushSettings.quietHours.end}
                            onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
