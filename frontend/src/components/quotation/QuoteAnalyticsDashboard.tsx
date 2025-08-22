import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  ChartBarIcon,
  TrendingUpIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { QuoteAnalytics, QuoteSearchFilters, quoteManagementService } from '@/services/quoteManagementService';
import { toast } from 'react-hot-toast';

interface QuoteAnalyticsDashboardProps {
  onExportData?: (data: any, format: string) => void;
  onQuoteSelect?: (filters: QuoteSearchFilters) => void;
}

export const QuoteAnalyticsDashboard: React.FC<QuoteAnalyticsDashboardProps> = ({
  onExportData,
  onQuoteSelect,
}) => {
  const [analytics, setAnalytics] = useState<QuoteAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['all']);
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous' | 'same_period_last_year'>('previous');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, comparisonPeriod]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const filters: QuoteSearchFilters = {};
      
      // Apply date range filter
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'ytd':
          startDate.setMonth(0, 1);
          break;
        case 'mtd':
          startDate.setDate(1);
          break;
      }
      
      filters.dateRange = { start: startDate, end: endDate };
      
      const analyticsData = await quoteManagementService.getQuoteAnalytics(filters);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'totalQuotes': return <DocumentTextIcon className="h-6 w-6" />;
      case 'totalValue': return <CurrencyDollarIcon className="h-6 w-6" />;
      case 'conversionRate': return <TrendingUpIcon className="h-6 w-6" />;
      case 'averageValue': return <ChartBarIcon className="h-6 w-6" />;
      default: return <ChartBarIcon className="h-6 w-6" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'totalQuotes': return 'blue';
      case 'totalValue': return 'green';
      case 'conversionRate': return 'purple';
      case 'averageValue': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      default: return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
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

  const handleExportAnalytics = (format: 'csv' | 'json' | 'xlsx') => {
    if (!analytics) return;
    
    if (onExportData) {
      onExportData(analytics, format);
    } else {
      // Fallback export
      const dataStr = format === 'json' 
        ? JSON.stringify(analytics, null, 2)
        : 'CSV/Excel export not implemented';
      
      const dataBlob = new Blob([dataStr], { type: 'text/plain' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote_analytics_${dateRange}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    }
  };

  const handleQuoteFilter = (status?: string) => {
    const filters: QuoteSearchFilters = {};
    
    if (status) {
      filters.status = [status];
    }
    
    if (onQuoteSelect) {
      onQuoteSelect(filters);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quote Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your quotation performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-32"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="ytd">Year to date</option>
            <option value="mtd">Month to date</option>
          </Select>

          <Select
            value={comparisonPeriod}
            onChange={(e) => setComparisonPeriod(e.target.value as any)}
            className="w-48"
          >
            <option value="previous">vs Previous period</option>
            <option value="same_period_last_year">vs Same period last year</option>
          </Select>

          <Button variant="outline" onClick={() => handleExportAnalytics('csv')}>
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Quotes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.totalQuotes)}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${getMetricColor('totalQuotes')}-100 dark:bg-${getMetricColor('totalQuotes')}-900/20`}>
                {getMetricIcon('totalQuotes')}
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
                  {formatCurrency(analytics.totalValue)}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${getMetricColor('totalValue')}-100 dark:bg-${getMetricColor('totalValue')}-900/20`}>
                {getMetricIcon('totalValue')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analytics.averageValue)}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${getMetricColor('averageValue')}-100 dark:bg-${getMetricColor('averageValue')}-900/20`}>
                {getMetricIcon('averageValue')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(analytics.conversionRate)}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${getMetricColor('conversionRate')}-100 dark:bg-${getMetricColor('conversionRate')}-900/20`}>
                {getMetricIcon('conversionRate')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Response Time</span>
                <span className="font-medium">{analytics.performanceMetrics.averageResponseTime} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</span>
                <span className="font-medium text-green-600">
                  {formatPercentage(analytics.performanceMetrics.approvalRate)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rejection Rate</span>
                <span className="font-medium text-red-600">
                  {formatPercentage(analytics.performanceMetrics.rejectionRate)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Valid Until</span>
                <span className="font-medium">{analytics.performanceMetrics.averageValidUntil} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.statusDistribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.status)}
                    <span className="text-sm font-medium capitalize">{status.status}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {status.count} ({formatPercentage(status.percentage)})
                    </span>
                    <Badge variant="outline" color={getStatusColor(status.status)}>
                      {formatCurrency(status.value)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.monthlyTrends.map((trend, index) => {
                  const previousTrend = index < analytics.monthlyTrends.length - 1 
                    ? analytics.monthlyTrends[index + 1] 
                    : null;
                  
                  const countChange = previousTrend 
                    ? ((trend.count - previousTrend.count) / previousTrend.count) * 100
                    : 0;
                  
                  const valueChange = previousTrend 
                    ? ((trend.value - previousTrend.value) / previousTrend.value) * 100
                    : 0;
                  
                  return (
                    <tr key={trend.month} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {trend.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(trend.count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(trend.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-1">
                          {countChange > 0 ? (
                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                          ) : countChange < 0 ? (
                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                          ) : null}
                          <span className={countChange > 0 ? 'text-green-600' : countChange < 0 ? 'text-red-600' : 'text-gray-600'}>
                            {Math.abs(countChange).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topClients.map((client, index) => (
              <div key={client.clientName} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {client.clientName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.quoteCount} quotes
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(client.totalValue)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg: {formatCurrency(client.totalValue / client.quoteCount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleQuoteFilter('pending')}
              className="flex items-center space-x-2"
            >
              <ClockIcon className="h-4 w-4" />
              <span>View Pending Quotes</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuoteFilter('approved')}
              className="flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>View Approved Quotes</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuoteFilter('rejected')}
              className="flex items-center space-x-2"
            >
              <XCircleIcon className="h-4 w-4" />
              <span>View Rejected Quotes</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuoteFilter('expired')}
              className="flex items-center space-x-2"
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>View Expired Quotes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
