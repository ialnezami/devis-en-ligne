import React from 'react';
import { CalendarIcon, ChartBarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/outline';

interface DateRangeFiltersProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

const DateRangeFilters: React.FC<DateRangeFiltersProps> = ({
  selectedRange,
  onRangeChange,
  selectedMetrics,
  onMetricsChange
}) => {
  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const availableMetrics = [
    { value: 'revenue', label: 'Revenue', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { value: 'conversions', label: 'Conversions', icon: ChartBarIcon, color: 'text-blue-600' },
    { value: 'quotations', label: 'Quotations', icon: UserGroupIcon, color: 'text-purple-600' },
    { value: 'clients', label: 'Clients', icon: UserGroupIcon, color: 'text-orange-600' },
    { value: 'response_time', label: 'Response Time', icon: ChartBarIcon, color: 'text-red-600' }
  ];

  const handleMetricToggle = (metric: string) => {
    const newMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter(m => m !== metric)
      : [...selectedMetrics, metric];
    onMetricsChange(newMetrics);
  };

  const handleCustomDateRange = () => {
    // TODO: Implement custom date picker
    console.log('Custom date range selected');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date Range Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
            Date Range
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => range.value === 'custom' ? handleCustomDateRange() : onRangeChange(range.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  selectedRange === range.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Inputs */}
          {selectedRange === 'custom' && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Metrics Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
            Metrics to Display
          </h3>
          
          <div className="space-y-3">
            {availableMetrics.map((metric) => {
              const IconComponent = metric.icon;
              const isSelected = selectedMetrics.includes(metric.value);
              
              return (
                <label
                  key={metric.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleMetricToggle(metric.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <IconComponent className={`h-5 w-5 ml-3 ${metric.color}`} />
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => onMetricsChange(availableMetrics.map(m => m.value))}
              className="px-3 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Select All
            </button>
            <button
              onClick={() => onMetricsChange([])}
              className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing data for: <span className="font-medium text-gray-900 dark:text-white">
              {dateRanges.find(r => r.value === selectedRange)?.label}
            </span>
          </span>
          <span>
            Metrics selected: <span className="font-medium text-gray-900 dark:text-white">
              {selectedMetrics.length} of {availableMetrics.length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilters;
