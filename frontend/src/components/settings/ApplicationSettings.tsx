import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CreditCardIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import CompanySettings from './CompanySettings';
import UserRoleManagement from './UserRoleManagement';
import BrandingConfiguration from './BrandingConfiguration';
import TaxRateManagement from './TaxRateManagement';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import SystemSettings from './SystemSettings';

interface ApplicationSettingsProps {
  className?: string;
}

export default function ApplicationSettings({ className = '' }: ApplicationSettingsProps) {
  const [activeTab, setActiveTab] = useState('company');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const tabs = [
    {
      id: 'company',
      name: 'Company Settings',
      icon: BuildingOfficeIcon,
      description: 'Company information, address, and contact details'
    },
    {
      id: 'branding',
      name: 'Branding',
      icon: DocumentTextIcon,
      description: 'Logo, colors, and visual identity'
    },
    {
      id: 'tax',
      name: 'Tax Rates',
      icon: CreditCardIcon,
      description: 'Tax rates and tax configuration'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: UserGroupIcon,
      description: 'User roles, permissions, and access control'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Email and push notification preferences'
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Password policies and security settings'
    },
    {
      id: 'system',
      name: 'System',
      icon: ComputerDesktopIcon,
      description: 'System preferences and technical settings'
    }
  ];

  const handleTabChange = (tabId: string) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        'You have unsaved changes. Are you sure you want to switch tabs?'
      );
      if (!confirmChange) return;
    }
    setActiveTab(tabId);
    setHasUnsavedChanges(false);
  };

  const handleSettingsChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      // Save all settings across all tabs
      // This would typically involve calling save methods on each settings component
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setHasUnsavedChanges(false);
      // Show success message
      console.log('All settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'company':
        return <CompanySettings onSettingsChange={handleSettingsChange} />;
      case 'branding':
        return <BrandingConfiguration onSettingsChange={handleSettingsChange} />;
      case 'tax':
        return <TaxRateManagement onSettingsChange={handleSettingsChange} />;
      case 'users':
        return <UserRoleManagement onSettingsChange={handleSettingsChange} />;
      case 'notifications':
        return <NotificationSettings onSettingsChange={handleSettingsChange} />;
      case 'security':
        return <SecuritySettings onSettingsChange={handleSettingsChange} />;
      case 'system':
        return <SystemSettings onSettingsChange={handleSettingsChange} />;
      default:
        return <CompanySettings onSettingsChange={handleSettingsChange} />;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Application Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your application preferences and company settings
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ Unsaved changes
              </span>
            )}
            <button
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
