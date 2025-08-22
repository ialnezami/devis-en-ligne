import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  ArchiveBoxIcon,
  ChartBarIcon,
  UserGroupIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CentralizedQuoteRepository } from './CentralizedQuoteRepository';
import { QuoteLifecycleTracking } from './QuoteLifecycleTracking';
import { QuoteAnalyticsDashboard } from './QuoteAnalyticsDashboard';
import { QuoteCollaboration } from './QuoteCollaboration';
import { QuoteBackupRecovery } from './QuoteBackupRecovery';
import { Quote, QuoteSearchFilters, quoteManagementService } from '@/services/quoteManagementService';
import { toast } from 'react-hot-toast';

interface CentralizedQuoteManagementProps {
  onQuoteSelect?: (quote: Quote) => void;
  onQuoteEdit?: (quote: Quote) => void;
  onQuoteDelete?: (quote: Quote) => void;
  onExportData?: (data: any, format: string) => void;
}

export const CentralizedQuoteManagement: React.FC<CentralizedQuoteManagementProps> = ({
  onQuoteSelect,
  onQuoteEdit,
  onQuoteDelete,
  onExportData,
}) => {
  const [activeTab, setActiveTab] = useState('repository');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quickStats, setQuickStats] = useState({
    totalQuotes: 0,
    pendingQuotes: 0,
    approvedQuotes: 0,
    totalValue: 0,
  });

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    setIsLoading(true);
    try {
      const analytics = await quoteManagementService.getQuoteAnalytics();
      setQuickStats({
        totalQuotes: analytics.totalQuotes,
        pendingQuotes: analytics.statusDistribution.find(s => s.status === 'pending')?.count || 0,
        approvedQuotes: analytics.statusDistribution.find(s => s.status === 'approved')?.count || 0,
        totalValue: analytics.totalValue,
      });
    } catch (error) {
      console.error('Failed to load quick stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteSelect = (quote: Quote) => {
    setSelectedQuote(quote);
    if (onQuoteSelect) {
      onQuoteSelect(quote);
    }
  };

  const handleQuoteEdit = (quote: Quote) => {
    if (onQuoteEdit) {
      onQuoteEdit(quote);
    }
  };

  const handleQuoteDelete = (quote: Quote) => {
    if (onQuoteDelete) {
      onQuoteDelete(quote);
    }
  };

  const handleExportData = (data: any, format: string) => {
    if (onExportData) {
      onExportData(data, format);
    }
  };

  const handleQuoteFilter = (filters: QuoteSearchFilters) => {
    // Switch to repository tab and apply filters
    setActiveTab('repository');
    // The repository component will handle the filters
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'expired': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Centralized Quote Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive management system for all your quotations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadQuickStats}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Quotes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : quickStats.totalQuotes.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Quotes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : quickStats.pendingQuotes.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Approved Quotes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : quickStats.approvedQuotes.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : formatCurrency(quickStats.totalValue)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Quote Info */}
      {selectedQuote && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(selectedQuote.status)}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedQuote.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    #{selectedQuote.quotationNumber} • {selectedQuote.clientName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" color={
                  selectedQuote.status === 'approved' ? 'green' :
                  selectedQuote.status === 'pending' ? 'yellow' :
                  selectedQuote.status === 'rejected' ? 'red' :
                  selectedQuote.status === 'expired' ? 'orange' : 'blue'
                }>
                  {selectedQuote.status}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuote(null)}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quote Management</CardTitle>
              
              <TabsList className="grid w-full max-w-md grid-cols-5">
                <TabsTrigger value="repository" className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Repository</span>
                </TabsTrigger>
                
                <TabsTrigger value="lifecycle" className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Lifecycle</span>
                </TabsTrigger>
                
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <ChartBarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                
                <TabsTrigger value="collaboration" className="flex items-center space-x-2">
                  <UserGroupIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
                
                <TabsTrigger value="backup" className="flex items-center space-x-2">
                  <CloudArrowUpIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Backup</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="repository" className="mt-0">
              <CentralizedQuoteRepository
                onQuoteSelect={handleQuoteSelect}
                onQuoteEdit={handleQuoteEdit}
                onQuoteDelete={handleQuoteDelete}
              />
            </TabsContent>
            
            <TabsContent value="lifecycle" className="mt-0">
              {selectedQuote ? (
                <QuoteLifecycleTracking
                  quoteId={selectedQuote.id}
                  onStatusChange={(newStatus) => {
                    setSelectedQuote(prev => prev ? { ...prev, status: newStatus as any } : null);
                    loadQuickStats(); // Refresh stats after status change
                  }}
                  onVersionCreate={() => {
                    loadQuickStats(); // Refresh stats after version creation
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Quote
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Choose a quote from the repository to view its lifecycle and version history.
                  </p>
                  <Button onClick={() => setActiveTab('repository')}>
                    Go to Repository
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <QuoteAnalyticsDashboard
                onExportData={handleExportData}
                onQuoteSelect={handleQuoteFilter}
              />
            </TabsContent>
            
            <TabsContent value="collaboration" className="mt-0">
              {selectedQuote ? (
                <QuoteCollaboration
                  quoteId={selectedQuote.id}
                  onCollaborationUpdate={() => {
                    // Handle collaboration updates if needed
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Quote
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Choose a quote from the repository to manage team collaboration and permissions.
                  </p>
                  <Button onClick={() => setActiveTab('repository')}>
                    Go to Repository
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="backup" className="mt-0">
              {selectedQuote ? (
                <QuoteBackupRecovery
                  quoteId={selectedQuote.id}
                  onBackupCreated={() => {
                    // Handle backup creation if needed
                  }}
                  onQuoteRestored={(restoredQuote) => {
                    setSelectedQuote(restoredQuote);
                    loadQuickStats(); // Refresh stats after restoration
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Quote
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Choose a quote from the repository to manage backups and recovery options.
                  </p>
                  <Button onClick={() => setActiveTab('repository')}>
                    Go to Repository
                  </Button>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab('repository')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <DocumentTextIcon className="h-6 w-6" />
              <span>Browse Quotes</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setActiveTab('analytics')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <ChartBarIcon className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setActiveTab('collaboration')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <UserGroupIcon className="h-6 w-6" />
              <span>Manage Team</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setActiveTab('backup')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <CloudArrowUpIcon className="h-6 w-6" />
              <span>Backup & Recovery</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
