import React, { useState } from 'react';
import { CogIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

interface DashboardCustomizationProps {
  customizations: {
    showStatistics: boolean;
    showCharts: boolean;
    showActivityFeed: boolean;
    showQuickActions: boolean;
    refreshInterval: number;
    theme: 'light' | 'dark' | 'auto';
  };
  onCustomizationChange: (customizations: any) => void;
}

const DashboardCustomization: React.FC<DashboardCustomizationProps> = ({
  customizations,
  onCustomizationChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: string) => {
    const newCustomizations = {
      ...customizations,
      [key]: !customizations[key as keyof typeof customizations]
    };
    onCustomizationChange(newCustomizations);
  };

  const handleRefreshIntervalChange = (interval: number) => {
    const newCustomizations = {
      ...customizations,
      refreshInterval: interval
    };
    onCustomizationChange(newCustomizations);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    const newCustomizations = {
      ...customizations,
      theme
    };
    onCustomizationChange(newCustomizations);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Customize Dashboard"
      >
        <CogIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dashboard Customization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customize your dashboard layout and preferences
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Visibility Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Widget Visibility
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customizations.showStatistics}
                      onChange={() => handleToggle('showStatistics')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Statistics Cards
                    </span>
                    {customizations.showStatistics ? (
                      <EyeIcon className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customizations.showCharts}
                      onChange={() => handleToggle('showCharts')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Charts & Graphs
                    </span>
                    {customizations.showCharts ? (
                      <EyeIcon className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customizations.showActivityFeed}
                      onChange={() => handleToggle('showActivityFeed')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Activity Feed
                    </span>
                    {customizations.showActivityFeed ? (
                      <EyeIcon className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customizations.showQuickActions}
                      onChange={() => handleToggle('showQuickActions')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Quick Actions
                    </span>
                    {customizations.showQuickActions ? (
                      <EyeIcon className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </label>
                </div>
              </div>

              {/* Refresh Interval */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Data Refresh Interval
                </h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => handleRefreshIntervalChange(interval * 1000)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        customizations.refreshInterval === interval * 1000
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {interval}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Preference */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Theme Preference
                </h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'auto'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        customizations.theme === theme
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    const defaultCustomizations = {
                      showStatistics: true,
                      showCharts: true,
                      showActivityFeed: true,
                      showQuickActions: true,
                      refreshInterval: 30000,
                      theme: 'auto' as const
                    };
                    onCustomizationChange(defaultCustomizations);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardCustomization;
