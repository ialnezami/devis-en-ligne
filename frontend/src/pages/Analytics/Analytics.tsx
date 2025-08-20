import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AnalyticsDashboard from './components/AnalyticsDashboard/AnalyticsDashboard';
import ConversionFunnel from './components/ConversionFunnel/ConversionFunnel';
import DateRangeFilters from './components/DateRangeFilters/DateRangeFilters';
import ExportPanel from './components/ExportPanel/ExportPanel';
import ReportScheduler from './components/ReportScheduler/ReportScheduler';
import { useAnalytics } from '@/hooks/useAnalytics';

const Analytics: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'conversions', 'quotations']);
  
  const {
    analyticsData,
    isLoading,
    refreshData,
    exportData,
    scheduleReport
  } = useAnalytics(selectedDateRange);

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
  };

  const handleMetricsChange = (metrics: string[]) => {
    setSelectedMetrics(metrics);
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportData(format, selectedDateRange, selectedMetrics);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleScheduleReport = async (schedule: any) => {
    try {
      await scheduleReport(schedule);
    } catch (error) {
      console.error('Report scheduling failed:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Analytics Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics & Reporting
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Comprehensive insights into your business performance and quotation analytics
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Date Range Filters */}
        <DateRangeFilters
          selectedRange={selectedDateRange}
          onRangeChange={handleDateRangeChange}
          onMetricsChange={handleMetricsChange}
          selectedMetrics={selectedMetrics}
        />

        {/* Analytics Dashboard */}
        <AnalyticsDashboard
          data={analyticsData}
          dateRange={selectedDateRange}
          selectedMetrics={selectedMetrics}
        />

        {/* Conversion Funnel */}
        <ConversionFunnel
          data={analyticsData.conversionFunnel}
          dateRange={selectedDateRange}
        />

        {/* Export and Scheduling Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExportPanel
            onExport={handleExport}
            dateRange={selectedDateRange}
            selectedMetrics={selectedMetrics}
          />
          <ReportScheduler
            onSchedule={handleScheduleReport}
            dateRange={selectedDateRange}
            selectedMetrics={selectedMetrics}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
