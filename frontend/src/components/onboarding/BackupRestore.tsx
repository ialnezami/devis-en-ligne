import React, { useState } from 'react';
import { 
  CloudArrowUpIcon, 
  CloudArrowDownIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface BackupRestoreProps {
  onBackupComplete?: (backupInfo: any) => void;
  onRestoreComplete?: (restoreInfo: any) => void;
}

interface BackupItem {
  id: string;
  name: string;
  size: string;
  createdAt: Date;
  type: 'manual' | 'scheduled' | 'auto';
  status: 'completed' | 'in-progress' | 'failed';
  includes: string[];
}

interface RestorePoint {
  id: string;
  name: string;
  date: Date;
  size: string;
  description: string;
  isCompatible: boolean;
}

export default function BackupRestore({ 
  onBackupComplete, 
  onRestoreComplete 
}: BackupRestoreProps) {
  const [activeTab, setActiveTab] = useState('backup');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [backupOptions, setBackupOptions] = useState({
    includeQuotes: true,
    includeClients: true,
    includeTemplates: true,
    includeSettings: true,
    includeFiles: false,
    compression: 'medium',
    encryption: true
  });

  const mockBackups: BackupItem[] = [
    {
      id: 'backup_1',
      name: 'Full Backup - Dec 15, 2024',
      size: '45.2 MB',
      createdAt: new Date('2024-12-15'),
      type: 'manual',
      status: 'completed',
      includes: ['Quotes', 'Clients', 'Templates', 'Settings']
    },
    {
      id: 'backup_2',
      name: 'Scheduled Backup - Dec 14, 2024',
      size: '42.8 MB',
      createdAt: new Date('2024-12-14'),
      type: 'scheduled',
      status: 'completed',
      includes: ['Quotes', 'Clients', 'Templates', 'Settings']
    },
    {
      id: 'backup_3',
      name: 'Auto Backup - Dec 13, 2024',
      size: '41.5 MB',
      createdAt: new Date('2024-12-13'),
      type: 'auto',
      status: 'completed',
      includes: ['Quotes', 'Clients', 'Templates']
    }
  ];

  const mockRestorePoints: RestorePoint[] = [
    {
      id: 'restore_1',
      name: 'System Restore Point - Dec 15, 2024',
      date: new Date('2024-12-15'),
      size: '45.2 MB',
      description: 'Full system backup before major update',
      isCompatible: true
    },
    {
      id: 'restore_2',
      name: 'Data Restore Point - Dec 10, 2024',
      date: new Date('2024-12-10'),
      size: '38.7 MB',
      description: 'Data backup before client migration',
      isCompatible: true
    },
    {
      id: 'restore_3',
      name: 'Legacy Backup - Nov 30, 2024',
      date: new Date('2024-11-30'),
      size: '35.1 MB',
      description: 'Backup from previous version',
      isCompatible: false
    }
  ];

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup: BackupItem = {
        id: `backup_${Date.now()}`,
        name: `Manual Backup - ${new Date().toLocaleDateString()}`,
        size: '46.1 MB',
        createdAt: new Date(),
        type: 'manual',
        status: 'completed',
        includes: Object.entries(backupOptions)
          .filter(([key, value]) => value && key !== 'compression' && key !== 'encryption')
          .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
      };
      
      onBackupComplete?.(newBackup);
    } catch (error) {
      console.error('Backup creation failed:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    
    setIsRestoring(true);
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const restoreInfo = {
        backupId: selectedBackup,
        restoreDate: new Date(),
        status: 'completed'
      };
      
      onRestoreComplete?.(restoreInfo);
      setSelectedBackup('');
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDownloadBackup = (backupId: string) => {
    const backup = mockBackups.find(b => b.id === backupId);
    if (backup) {
      // Simulate download
      console.log(`Downloading backup: ${backup.name}`);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    // Simulate deletion
    console.log(`Deleting backup: ${backupId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'scheduled':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'auto':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const tabs = [
    { id: 'backup', label: 'Backup', icon: CloudArrowUpIcon },
    { id: 'restore', label: 'Restore', icon: CloudArrowDownIcon }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <CloudArrowUpIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Backup & Restore
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Safeguard your data with automated backups and restore when needed
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            {/* Backup Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Backup
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Include Data</h4>
                  <div className="space-y-3">
                    {Object.entries(backupOptions)
                      .filter(([key]) => key !== 'compression' && key !== 'encryption')
                      .map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => setBackupOptions(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Backup Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Compression Level
                      </label>
                      <select
                        value={backupOptions.compression}
                        onChange={(e) => setBackupOptions(prev => ({
                          ...prev,
                          compression: e.target.value as 'low' | 'medium' | 'high'
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="low">Low (Faster, Larger)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Slower, Smaller)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={backupOptions.encryption}
                          onChange={(e) => setBackupOptions(prev => ({
                            ...prev,
                            encryption: e.target.checked
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Encrypt backup for security
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreatingBackup ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                      Create Backup
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Existing Backups */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Existing Backups
              </h3>
              
              <div className="space-y-4">
                {mockBackups.map((backup) => (
                  <div key={backup.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {backup.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(backup.type)}`}>
                            {backup.type}
                          </span>
                          {getStatusIcon(backup.status)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Size: {backup.size}</span>
                          <span>Created: {backup.createdAt.toLocaleDateString()}</span>
                          <span>Includes: {backup.includes.join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                          title="Download Backup"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          title="Delete Backup"
                        >
                          <ExclamationTriangleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Restore Tab */}
        {activeTab === 'restore' && (
          <div className="space-y-6">
            {/* Restore Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Restore Point
              </h3>
              
              <div className="space-y-4">
                {mockRestorePoints.map((restorePoint) => (
                  <div key={restorePoint.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="restorePoint"
                        value={restorePoint.id}
                        checked={selectedBackup === restorePoint.id}
                        onChange={(e) => setSelectedBackup(e.target.value)}
                        disabled={!restorePoint.isCompatible}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {restorePoint.name}
                          </h4>
                          {!restorePoint.isCompatible && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              Incompatible
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {restorePoint.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Date: {restorePoint.date.toLocaleDateString()}</span>
                          <span>Size: {restorePoint.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={handleRestore}
                  disabled={!selectedBackup || isRestoring}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRestoring ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                      Restore from Backup
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Restore Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Important: Restore Process
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                    <li>Restoring will overwrite current data</li>
                    <li>Make sure to backup current data before restoring</li>
                    <li>The restore process cannot be interrupted</li>
                    <li>System will be temporarily unavailable during restore</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
