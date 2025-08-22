import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Quote, QuoteVersion, quoteManagementService } from '@/services/quoteManagementService';
import { toast } from 'react-hot-toast';

interface QuoteLifecycleTrackingProps {
  quoteId: string;
  onStatusChange?: (newStatus: string) => void;
  onVersionCreate?: (version: QuoteVersion) => void;
}

interface LifecycleEvent {
  id: string;
  type: 'status_change' | 'version_created' | 'comment_added' | 'collaborator_added' | 'file_attached' | 'viewed' | 'exported';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  metadata?: any;
}

export const QuoteLifecycleTracking: React.FC<QuoteLifecycleTrackingProps> = ({
  quoteId,
  onStatusChange,
  onVersionCreate,
}) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [versions, setVersions] = useState<QuoteVersion[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'versions' | 'activity'>('overview');
  const [newComment, setNewComment] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionData, setVersionData] = useState({
    changeLog: '',
    isMajorVersion: false,
    changes: [] as string[],
  });

  useEffect(() => {
    if (quoteId) {
      loadQuoteData();
    }
  }, [quoteId]);

  const loadQuoteData = async () => {
    setIsLoading(true);
    try {
      const [quoteData, versionsData] = await Promise.all([
        quoteManagementService.getQuote(quoteId),
        quoteManagementService.getQuoteVersions(quoteId),
      ]);
      
      setQuote(quoteData);
      setVersions(versionsData);
      generateLifecycleEvents(quoteData, versionsData);
    } catch (error) {
      console.error('Failed to load quote data:', error);
      toast.error('Failed to load quote data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLifecycleEvents = (quoteData: Quote, versionsData: QuoteVersion[]) => {
    const events: LifecycleEvent[] = [];

    // Quote creation
    events.push({
      id: '1',
      type: 'status_change',
      title: 'Quote Created',
      description: `Quote "${quoteData.title}" was created`,
      timestamp: new Date(quoteData.createdAt),
      userId: quoteData.createdBy,
      userName: 'System',
      metadata: { status: quoteData.status },
    });

    // Status changes
    if (quoteData.status !== 'draft') {
      events.push({
        id: '2',
        type: 'status_change',
        title: 'Status Updated',
        description: `Status changed to ${quoteData.status}`,
        timestamp: new Date(quoteData.updatedAt),
        userId: quoteData.createdBy,
        userName: 'System',
        metadata: { status: quoteData.status },
      });
    }

    // Version events
    versionsData.forEach((version, index) => {
      events.push({
        id: `v${index + 1}`,
        type: 'version_created',
        title: `Version ${version.version} Created`,
        description: version.changeLog || 'New version created',
        timestamp: new Date(version.createdAt),
        userId: version.createdBy,
        userName: 'System',
        metadata: { version: version.version, isMajor: version.isMajorVersion },
      });
    });

    // Sort events by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLifecycleEvents(events);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return;

    try {
      const updatedQuote = await quoteManagementService.updateQuote(quote.id, {
        status: newStatus as any,
        updatedAt: new Date(),
      });
      
      setQuote(updatedQuote);
      
      // Add lifecycle event
      const newEvent: LifecycleEvent = {
        id: Date.now().toString(),
        type: 'status_change',
        title: 'Status Updated',
        description: `Status changed from ${quote.status} to ${newStatus}`,
        timestamp: new Date(),
        userId: 'current-user',
        userName: 'Current User',
        metadata: { previousStatus: quote.status, newStatus },
      };
      
      setLifecycleEvents(prev => [newEvent, ...prev]);
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
      toast.success(`Quote status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update quote status:', error);
      toast.error('Failed to update quote status');
    }
  };

  const handleCreateVersion = async () => {
    if (!quote || !versionData.changeLog.trim()) {
      toast.error('Please provide a change log for the new version');
      return;
    }

    try {
      const newVersion = await quoteManagementService.createQuoteVersion(quote.id, {
        version: `v${versions.length + 1}`,
        changeLog: versionData.changeLog,
        isMajorVersion: versionData.isMajorVersion,
        changes: versionData.changes,
        createdAt: new Date(),
        createdBy: 'current-user',
      });
      
      setVersions(prev => [...prev, newVersion]);
      setShowVersionModal(false);
      setVersionData({ changeLog: '', isMajorVersion: false, changes: [] });
      
      // Add lifecycle event
      const newEvent: LifecycleEvent = {
        id: Date.now().toString(),
        type: 'version_created',
        title: `Version ${newVersion.version} Created`,
        description: newVersion.changeLog,
        timestamp: new Date(),
        userId: 'current-user',
        userName: 'Current User',
        metadata: { version: newVersion.version, isMajor: newVersion.isMajorVersion },
      };
      
      setLifecycleEvents(prev => [newEvent, ...prev]);
      
      if (onVersionCreate) {
        onVersionCreate(newVersion);
      }
      
      toast.success(`Version ${newVersion.version} created successfully`);
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error('Failed to create version');
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newEvent: LifecycleEvent = {
      id: Date.now().toString(),
      type: 'comment_added',
      title: 'Comment Added',
      description: newComment,
      timestamp: new Date(),
      userId: 'current-user',
      userName: 'Current User',
      metadata: { comment: newComment },
    };
    
    setLifecycleEvents(prev => [newEvent, ...prev]);
    setNewComment('');
    toast.success('Comment added to timeline');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'expired': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'archived': return <ArchiveBoxIcon className="h-5 w-5 text-purple-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <ArrowPathIcon className="h-4 w-4" />;
      case 'version_created': return <DocumentTextIcon className="h-4 w-4" />;
      case 'comment_added': return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'collaborator_added': return <UserIcon className="h-4 w-4" />;
      case 'file_attached': return <DocumentTextIcon className="h-4 w-4" />;
      case 'viewed': return <EyeIcon className="h-4 w-4" />;
      case 'exported': return <ArrowPathIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'yellow';
      case 'expired': return 'orange';
      case 'archived': return 'purple';
      default: return 'blue';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading quote lifecycle...</p>
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
            Quote Lifecycle Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track the complete journey of quote #{quote.quotationNumber}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowVersionModal(true)}>
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Create Version
          </Button>
          
          <Button variant="outline" onClick={loadQuoteData}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(quote.status)}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {new Date(quote.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" color={getStatusColor(quote.status)}>
                {quote.status}
              </Badge>
              
              {quote.status === 'draft' && (
                <Button size="sm" onClick={() => handleStatusChange('pending')}>
                  Submit for Review
                </Button>
              )}
              
              {quote.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange('approved')}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange('rejected')}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'timeline', label: 'Timeline' },
          { key: 'versions', label: 'Versions' },
          { key: 'activity', label: 'Activity' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{versions.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Versions</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {lifecycleEvents.filter(e => e.type === 'status_change').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Status Changes</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {lifecycleEvents.filter(e => e.type === 'comment_added').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('timeline')}>
                    View Timeline
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('versions')}>
                    Manage Versions
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('activity')}>
                    View Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {lifecycleEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.description}
                      </p>
                      
                      {event.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'versions' && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {versions.map((version) => (
                  <div key={version.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" color={version.isMajorVersion ? 'red' : 'blue'}>
                          {version.version}
                        </Badge>
                        {version.isMajorVersion && (
                          <Badge variant="outline" color="red">Major</Badge>
                        )}
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {version.changeLog}
                    </p>
                    
                    {version.changes.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <strong>Changes:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {version.changes.map((change, index) => (
                            <li key={index}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add Comment</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment to the timeline..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    {lifecycleEvents.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {event.title} - {event.description}
                        </span>
                        <span className="text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Version Creation Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Version
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Change Log
                </label>
                <textarea
                  value={versionData.changeLog}
                  onChange={(e) => setVersionData(prev => ({ ...prev, changeLog: e.target.value }))}
                  placeholder="Describe the changes in this version..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="majorVersion"
                  checked={versionData.isMajorVersion}
                  onChange={(e) => setVersionData(prev => ({ ...prev, isMajorVersion: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="majorVersion" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  This is a major version
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowVersionModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVersion}>
                Create Version
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
