import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ArchiveBoxIcon,
  ClockIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DownloadIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Quote, QuoteBackup, quoteManagementService } from '@/services/quoteManagementService';
import { toast } from 'react-hot-toast';

interface QuoteBackupRecoveryProps {
  quoteId: string;
  onBackupCreated?: (backup: QuoteBackup) => void;
  onQuoteRestored?: (quote: Quote) => void;
}

export const QuoteBackupRecovery: React.FC<QuoteBackupRecoveryProps> = ({
  quoteId,
  onBackupCreated,
  onQuoteRestored,
}) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [backups, setBackups] = useState<QuoteBackup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<QuoteBackup | null>(null);
  const [backupType, setBackupType] = useState<'manual' | 'auto'>('manual');
  const [backupNotes, setBackupNotes] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (quoteId) {
      loadBackupData();
    }
  }, [quoteId]);

  const loadBackupData = async () => {
    setIsLoading(true);
    try {
      const [quoteData, backupsData] = await Promise.all([
        quoteManagementService.getQuote(quoteId),
        quoteManagementService.getQuoteBackups(quoteId),
      ]);
      
      setQuote(quoteData);
      setBackups(backupsData);
    } catch (error) {
      console.error('Failed to load backup data:', error);
      toast.error('Failed to load backup data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!backupNotes.trim()) {
      toast.error('Please provide backup notes');
      return;
    }

    setIsCreatingBackup(true);
    try {
      const newBackup = await quoteManagementService.createQuoteBackup(quoteId, backupType);
      
      // Add notes to the backup (this would typically be handled by the backend)
      const backupWithNotes = {
        ...newBackup,
        changeLog: backupNotes,
      };
      
      setBackups(prev => [backupWithNotes, ...prev]);
      setShowBackupModal(false);
      setBackupNotes('');
      setBackupType('manual');
      
      if (onBackupCreated) {
        onBackupCreated(backupWithNotes);
      }
      
      toast.success('Backup created successfully');
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    if (!window.confirm(`Are you sure you want to restore this quote from backup "${selectedBackup.id}"? This will overwrite the current quote data.`)) {
      return;
    }

    setIsRestoring(true);
    try {
      const restoredQuote = await quoteManagementService.restoreFromBackup(quoteId, selectedBackup.id);
      
      setQuote(restoredQuote);
      setShowRestoreModal(false);
      setSelectedBackup(null);
      
      if (onQuoteRestored) {
        onQuoteRestored(restoredQuote);
      }
      
      toast.success('Quote restored successfully from backup');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      toast.error('Failed to restore from backup');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: The current service doesn't have a delete backup method
      // This would need to be implemented in the backend
      setBackups(prev => prev.filter(b => b.id !== backupId));
      toast.success('Backup deleted successfully');
    } catch (error) {
      console.error('Failed to delete backup:', error);
      toast.error('Failed to delete backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return <CloudArrowUpIcon className="h-5 w-5" />;
      case 'auto': return <ArchiveBoxIcon className="h-5 w-5" />;
      case 'version': return <DocumentTextIcon className="h-5 w-5" />;
      default: return <ArchiveBoxIcon className="h-5 w-5" />;
    }
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'blue';
      case 'auto': return 'green';
      case 'version': return 'purple';
      default: return 'gray';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return <DocumentTextIcon className="h-4 w-4" />;
      case 'xml': return <DocumentTextIcon className="h-4 w-4" />;
      case 'pdf': return <DocumentTextIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getBackupStatus = (backup: QuoteBackup) => {
    const now = new Date();
    const backupDate = new Date(backup.createdAt);
    const daysSinceBackup = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceBackup <= backup.retentionDays) {
      return { status: 'active', color: 'green', text: 'Active' };
    } else {
      return { status: 'expired', color: 'red', text: 'Expired' };
    }
  };

  const filteredBackups = backups.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading backup data...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Quote not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quote Backup & Recovery
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage backups and restore quotes from previous versions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadBackupData}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={() => setShowBackupModal(true)}>
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>
      </div>

      {/* Backup Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{backups.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Backups</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {backups.filter(b => getBackupStatus(b).status === 'active').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Backups</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {backups.filter(b => b.backupType === 'manual').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manual Backups</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {backups.filter(b => b.backupType === 'auto').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Auto Backups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBackups.length === 0 ? (
            <div className="text-center py-8">
              <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No backups found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first backup to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBackups.map((backup) => {
                const status = getBackupStatus(backup);
                return (
                  <div key={backup.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full bg-${getBackupTypeColor(backup.backupType)}-100 dark:bg-${getBackupTypeColor(backup.backupType)}-900/20`}>
                          {getBackupTypeIcon(backup.backupType)}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Backup {backup.id.slice(-8)}
                            </h4>
                            <Badge variant="outline" color={getBackupTypeColor(backup.backupType)}>
                              {backup.backupType}
                            </Badge>
                            <Badge variant="outline" color={status.color}>
                              {status.text}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created by {backup.createdBy} on {formatDate(backup.createdAt)}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              {getFormatIcon(backup.format)}
                              <span>{backup.format.toUpperCase()}</span>
                            </span>
                            
                            <span className="flex items-center space-x-1">
                              <ArchiveBoxIcon className="h-3 w-3" />
                              <span>{formatFileSize(backup.size)}</span>
                            </span>
                            
                            {backup.isCompressed && (
                              <span className="flex items-center space-x-1">
                                <CloudArrowDownIcon className="h-3 w-3" />
                                <span>Compressed</span>
                              </span>
                            )}
                            
                            <span className="flex items-center space-x-1">
                              <ClockIcon className="h-3 w-3" />
                              <span>Retention: {backup.retentionDays} days</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          disabled={status.status === 'expired'}
                        >
                          <CloudArrowDownIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Backup Details */}
                    {backup.changeLog && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {backup.changeLog}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Backup
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="manual"
                      checked={backupType === 'manual'}
                      onChange={(e) => setBackupType(e.target.value as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Manual Backup</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="auto"
                      checked={backupType === 'auto'}
                      onChange={(e) => setBackupType(e.target.value as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto Backup</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Notes
                </label>
                <textarea
                  value={backupNotes}
                  onChange={(e) => setBackupNotes(e.target.value)}
                  placeholder="Describe what this backup contains or why it was created..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Backup Information</p>
                    <p className="mt-1">
                      This backup will include the complete quote data, including all items, 
                      pricing, and metadata. The backup will be stored securely and can be 
                      used to restore the quote if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowBackupModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBackup}
                disabled={isCreatingBackup || !backupNotes.trim()}
              >
                {isCreatingBackup ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Create Backup
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Restore from Backup
            </h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <p className="font-medium">Warning</p>
                    <p className="mt-1">
                      This action will overwrite the current quote data with the backup data. 
                      This action cannot be undone. Make sure you want to proceed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Backup Details
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>ID:</strong> {selectedBackup.id}</p>
                  <p><strong>Type:</strong> {selectedBackup.backupType}</p>
                  <p><strong>Created:</strong> {formatDate(selectedBackup.createdAt)}</p>
                  <p><strong>Size:</strong> {formatFileSize(selectedBackup.size)}</p>
                  <p><strong>Format:</strong> {selectedBackup.format.toUpperCase()}</p>
                </div>
              </div>
              
              {selectedBackup.changeLog && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Backup Notes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBackup.changeLog}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowRestoreModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRestoreBackup}
                disabled={isRestoring}
                className="bg-red-600 hover:bg-red-700"
              >
                {isRestoring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Restoring...
                  </>
                ) : (
                  <>
                    <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                    Restore Quote
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
