import React, { useState, useEffect } from 'react';
import { 
  ComputerDesktopIcon, 
  CogIcon, 
  DatabaseIcon,
  CloudIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SystemSettingsProps {
  onSettingsChange: () => void;
}

interface SystemPreferences {
  performance: {
    cacheEnabled: boolean;
    cacheSize: number; // MB
    autoOptimize: boolean;
    compressionLevel: 'low' | 'medium' | 'high';
  };
  storage: {
    maxFileSize: number; // MB
    allowedFileTypes: string[];
    autoCleanup: boolean;
    cleanupThreshold: number; // days
    backupRetention: number; // days
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    retention: number; // days
    includeUserActions: boolean;
    includeSystemMetrics: boolean;
    exportLogs: boolean;
  };
  maintenance: {
    autoUpdate: boolean;
    updateChannel: 'stable' | 'beta' | 'alpha';
    maintenanceWindow: {
      enabled: boolean;
      day: string;
      time: string;
      duration: number; // minutes
    };
    healthChecks: boolean;
  };
  integrations: {
    webhooks: {
      enabled: boolean;
      maxRetries: number;
      timeout: number; // seconds
    };
    api: {
      rateLimit: number; // requests per minute
      maxConcurrent: number;
      timeout: number; // seconds
    };
  };
}

export default function SystemSettings({ onSettingsChange }: SystemSettingsProps) {
  const [systemPrefs, setSystemPrefs] = useState<SystemPreferences>({
    performance: {
      cacheEnabled: true,
      cacheSize: 512,
      autoOptimize: true,
      compressionLevel: 'medium'
    },
    storage: {
      maxFileSize: 100,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif'],
      autoCleanup: true,
      cleanupThreshold: 90,
      backupRetention: 365
    },
    logging: {
      level: 'info',
      retention: 30,
      includeUserActions: true,
      includeSystemMetrics: true,
      exportLogs: false
    },
    maintenance: {
      autoUpdate: true,
      updateChannel: 'stable',
      maintenanceWindow: {
        enabled: true,
        day: 'sunday',
        time: '02:00',
        duration: 120
      },
      healthChecks: true
    },
    integrations: {
      webhooks: {
        enabled: true,
        maxRetries: 3,
        timeout: 30
      },
      api: {
        rateLimit: 1000,
        maxConcurrent: 50,
        timeout: 60
      }
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load system settings on component mount
  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Settings are already initialized with defaults
      // In a real app, you would load these from the API
    } catch (error) {
      console.error('Failed to load system settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerformanceChange = (field: keyof SystemPreferences['performance'], value: any) => {
    setSystemPrefs(prev => ({
      ...prev,
      performance: { ...prev.performance, [field]: value }
    }));
    onSettingsChange();
  };

  const handleStorageChange = (field: keyof SystemPreferences['storage'], value: any) => {
    setSystemPrefs(prev => ({
      ...prev,
      storage: { ...prev.storage, [field]: value }
    }));
    onSettingsChange();
  };

  const handleLoggingChange = (field: keyof SystemPreferences['logging'], value: any) => {
    setSystemPrefs(prev => ({
      ...prev,
      logging: { ...prev.logging, [field]: value }
    }));
    onSettingsChange();
  };

  const handleMaintenanceChange = (field: keyof SystemPreferences['maintenance'], value: any) => {
    setSystemPrefs(prev => ({
      ...prev,
      maintenance: { ...prev.maintenance, [field]: value }
    }));
    onSettingsChange();
  };

  const handleMaintenanceWindowChange = (field: keyof SystemPreferences['maintenance']['maintenanceWindow'], value: any) => {
    setSystemPrefs(prev => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        maintenanceWindow: {
          ...prev.maintenance.maintenanceWindow,
          [field]: value
        }
      }
    }));
    onSettingsChange();
  };

  const handleIntegrationsChange = (section: keyof SystemPreferences['integrations'], field: string, value: any) => {
    setSystemPrefs(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [section]: {
          ...prev.integrations[section],
          [field]: value
        }
      }
    }));
    onSettingsChange();
  };

  const addFileType = (fileType: string) => {
    if (fileType && !systemPrefs.storage.allowedFileTypes.includes(fileType)) {
      handleStorageChange('allowedFileTypes', [...systemPrefs.storage.allowedFileTypes, fileType]);
    }
  };

  const removeFileType = (fileType: string) => {
    handleStorageChange('allowedFileTypes', 
      systemPrefs.storage.allowedFileTypes.filter(type => type !== fileType)
    );
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            System Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system preferences, performance, and technical settings
          </p>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showAdvanced
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <CogIcon className="h-4 w-4 inline mr-2" />
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ComputerDesktopIcon className="h-4 w-4 inline mr-2" />
            Performance
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'storage'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <DatabaseIcon className="h-4 w-4 inline mr-2" />
            Storage
          </button>
          <button
            onClick={() => setActiveTab('logging')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'logging'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4 inline mr-2" />
            Logging
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'maintenance'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ClockIcon className="h-4 w-4 inline mr-2" />
            Maintenance
          </button>
          {showAdvanced && (
            <button
              onClick={() => setActiveTab('integrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'integrations'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <CloudIcon className="h-4 w-4 inline mr-2" />
              Integrations
            </button>
          )}
        </nav>
      </div>

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Settings
            </h3>
            
            <div className="space-y-6">
              {/* Cache Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Caching
                </h4>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.performance.cacheEnabled}
                    onChange={(e) => handlePerformanceChange('cacheEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable system caching
                  </span>
                </label>
                
                {systemPrefs.performance.cacheEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cache Size (MB)
                      </label>
                      <input
                        type="number"
                        value={systemPrefs.performance.cacheSize}
                        onChange={(e) => handlePerformanceChange('cacheSize', parseInt(e.target.value))}
                        min="64"
                        max="4096"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Compression Level
                      </label>
                      <select
                        value={systemPrefs.performance.compressionLevel}
                        onChange={(e) => handlePerformanceChange('compressionLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="low">Low (Fast)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Smaller files)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Optimization */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.performance.autoOptimize}
                    onChange={(e) => handlePerformanceChange('autoOptimize', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable automatic performance optimization
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                  Automatically optimize system performance during low-usage periods
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Storage Settings
            </h3>
            
            <div className="space-y-6">
              {/* File Size Limits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={systemPrefs.storage.maxFileSize}
                  onChange={(e) => handleStorageChange('maxFileSize', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Allowed File Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allowed File Types
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {systemPrefs.storage.allowedFileTypes.map((fileType) => (
                    <span
                      key={fileType}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {fileType}
                      <button
                        onClick={() => removeFileType(fileType)}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add file type (e.g., txt)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        addFileType(input.value.toLowerCase());
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addFileType(input.value.toLowerCase());
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Auto Cleanup */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Automatic Cleanup
                </h4>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.storage.autoCleanup}
                    onChange={(e) => handleStorageChange('autoCleanup', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable automatic file cleanup
                  </span>
                </label>
                
                {systemPrefs.storage.autoCleanup && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cleanup Threshold (days)
                      </label>
                      <input
                        type="number"
                        value={systemPrefs.storage.cleanupThreshold}
                        onChange={(e) => handleStorageChange('cleanupThreshold', parseInt(e.target.value))}
                        min="1"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Backup Retention (days)
                      </label>
                      <input
                        type="number"
                        value={systemPrefs.storage.backupRetention}
                        onChange={(e) => handleStorageChange('backupRetention', parseInt(e.target.value))}
                        min="1"
                        max="3650"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logging Tab */}
      {activeTab === 'logging' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Logging Configuration
            </h3>
            
            <div className="space-y-6">
              {/* Log Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Log Level
                </label>
                <select
                  value={systemPrefs.logging.level}
                  onChange={(e) => handleLoggingChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="error">Error - Only errors</option>
                  <option value="warn">Warning - Errors and warnings</option>
                  <option value="info">Info - General information</option>
                  <option value="debug">Debug - Detailed debugging</option>
                </select>
              </div>

              {/* Log Retention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Log Retention (days)
                </label>
                <input
                  type="number"
                  value={systemPrefs.logging.retention}
                  onChange={(e) => handleLoggingChange('retention', parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Log Content */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Log Content
                </h4>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.logging.includeUserActions}
                    onChange={(e) => handleLoggingChange('includeUserActions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Include user actions in logs
                  </span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.logging.includeSystemMetrics}
                    onChange={(e) => handleLoggingChange('includeSystemMetrics', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Include system metrics in logs
                  </span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.logging.exportLogs}
                    onChange={(e) => handleLoggingChange('exportLogs', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable log export functionality
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Maintenance Settings
            </h3>
            
            <div className="space-y-6">
              {/* Auto Updates */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Automatic Updates
                </h4>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.maintenance.autoUpdate}
                    onChange={(e) => handleMaintenanceChange('autoUpdate', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable automatic system updates
                  </span>
                </label>
                
                {systemPrefs.maintenance.autoUpdate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Update Channel
                    </label>
                    <select
                      value={systemPrefs.maintenance.updateChannel}
                      onChange={(e) => handleMaintenanceChange('updateChannel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="stable">Stable (Recommended)</option>
                      <option value="beta">Beta (Testing)</option>
                      <option value="alpha">Alpha (Development)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Maintenance Window */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Window
                </h4>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.maintenance.maintenanceWindow.enabled}
                    onChange={(e) => handleMaintenanceWindowChange('enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Schedule maintenance windows
                  </span>
                </label>
                
                {systemPrefs.maintenance.maintenanceWindow.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Day of Week
                      </label>
                      <select
                        value={systemPrefs.maintenance.maintenanceWindow.day}
                        onChange={(e) => handleMaintenanceWindowChange('day', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        {days.map(day => (
                          <option key={day} value={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={systemPrefs.maintenance.maintenanceWindow.time}
                        onChange={(e) => handleMaintenanceWindowChange('time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={systemPrefs.maintenance.maintenanceWindow.duration}
                        onChange={(e) => handleMaintenanceWindowChange('duration', parseInt(e.target.value))}
                        min="15"
                        max="480"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Health Checks */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={systemPrefs.maintenance.healthChecks}
                    onChange={(e) => handleMaintenanceChange('healthChecks', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable automated health checks
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                  Monitor system health and performance automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab (Advanced) */}
      {activeTab === 'integrations' && showAdvanced && (
        <div className="space-y-6">
          {/* Webhooks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Webhook Configuration
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={systemPrefs.integrations.webhooks.enabled}
                  onChange={(e) => handleIntegrationsChange('webhooks', 'enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable webhook notifications
                </span>
              </label>
              
              {systemPrefs.integrations.webhooks.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Retries
                    </label>
                    <input
                      type="number"
                      value={systemPrefs.integrations.webhooks.maxRetries}
                      onChange={(e) => handleIntegrationsChange('webhooks', 'maxRetries', parseInt(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={systemPrefs.integrations.webhooks.timeout}
                      onChange={(e) => handleIntegrationsChange('webhooks', 'timeout', parseInt(e.target.value))}
                      min="5"
                      max="300"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              API Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rate Limit (req/min)
                </label>
                <input
                  type="number"
                  value={systemPrefs.integrations.api.rateLimit}
                  onChange={(e) => handleIntegrationsChange('api', 'rateLimit', parseInt(e.target.value))}
                  min="100"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Concurrent
                </label>
                <input
                  type="number"
                  value={systemPrefs.integrations.api.maxConcurrent}
                  onChange={(e) => handleIntegrationsChange('api', 'maxConcurrent', parseInt(e.target.value))}
                  min="10"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={systemPrefs.integrations.api.timeout}
                  onChange={(e) => handleIntegrationsChange('api', 'timeout', parseInt(e.target.value))}
                  min="10"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
