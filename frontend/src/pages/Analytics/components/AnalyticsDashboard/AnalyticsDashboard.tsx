import React from 'react';
import ChartCard from '../../../Dashboard/components/ChartCard/ChartCard';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from '@heroicons/react/outline';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalQuotations: number;
    conversionRate: number;
    averageResponseTime: number;
    revenueChange: number;
    quotationsChange: number;
    conversionChange: number;
    responseTimeChange: number;
  };
  trends: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      fill?: boolean;
    }>;
  };
  performance: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  dateRange: string;
  selectedMetrics: string[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  dateRange,
  selectedMetrics
}) => {
  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return <MinusIcon className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(data.overview.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                {getChangeIcon(data.overview.revenueChange)}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(data.overview.revenueChange)}`}>
                  {data.overview.revenueChange > 0 ? '+' : ''}{data.overview.revenueChange}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  vs previous period
                </span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Quotations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Quotations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {data.overview.totalQuotations.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {getChangeIcon(data.overview.quotationsChange)}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(data.overview.quotationsChange)}`}>
                  {data.overview.quotationsChange > 0 ? '+' : ''}{data.overview.quotationsChange}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  vs previous period
                </span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatPercentage(data.overview.conversionRate)}
              </p>
              <div className="flex items-center mt-2">
                {getChangeIcon(data.overview.conversionChange)}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(data.overview.conversionChange)}`}>
                  {data.overview.conversionChange > 0 ? '+' : ''}{data.overview.conversionChange}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  vs previous period
                </span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Average Response Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Response Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatTime(data.overview.averageResponseTime)}
              </p>
              <div className="flex items-center mt-2">
                {getChangeIcon(data.overview.responseTimeChange)}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(data.overview.responseTimeChange)}`}>
                  {data.overview.responseTimeChange > 0 ? '+' : ''}{data.overview.responseTimeChange}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  vs previous period
                </span>
              </div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <ChartCard
          title="Performance Trends"
          subtitle={`${dateRange} overview`}
          type="line"
          data={data.trends}
          height={300}
        />

        {/* Performance Chart */}
        <ChartCard
          title="Performance Metrics"
          subtitle={`${dateRange} comparison`}
          type="bar"
          data={data.performance}
          height={300}
        />
      </div>

      {/* Metrics Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Selected Metrics Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedMetrics.map((metric) => {
            const metricData = {
              revenue: { label: 'Revenue', value: formatCurrency(data.overview.totalRevenue), color: 'text-green-600' },
              conversions: { label: 'Conversions', value: formatPercentage(data.overview.conversionRate), color: 'text-blue-600' },
              quotations: { label: 'Quotations', value: data.overview.totalQuotations.toLocaleString(), color: 'text-purple-600' },
              clients: { label: 'Active Clients', value: '150', color: 'text-orange-600' },
              response_time: { label: 'Response Time', value: formatTime(data.overview.averageResponseTime), color: 'text-red-600' }
            };

            const metricInfo = metricData[metric as keyof typeof metricData];
            if (!metricInfo) return null;

            return (
              <div key={metric} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metricInfo.label}
                </p>
                <p className={`text-xl font-bold ${metricInfo.color} mt-1`}>
                  {metricInfo.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
