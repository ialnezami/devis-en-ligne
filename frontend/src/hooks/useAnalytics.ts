import { useState, useEffect, useCallback } from 'react';

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
  conversionFunnel: {
    stages: Array<{
      name: string;
      count: number;
      percentage: number;
      color: string;
      icon: string;
    }>;
    totalConversions: number;
    conversionRate: number;
    averageValue: number;
  };
}

export const useAnalytics = (dateRange: string) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalRevenue: 0,
      totalQuotations: 0,
      conversionRate: 0,
      averageResponseTime: 0,
      revenueChange: 0,
      quotationsChange: 0,
      conversionChange: 0,
      responseTimeChange: 0
    },
    trends: {
      labels: [],
      datasets: []
    },
    performance: {
      labels: [],
      datasets: []
    },
    conversionFunnel: {
      stages: [],
      totalConversions: 0,
      conversionRate: 0,
      averageValue: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock data based on date range
  const generateMockData = useCallback((range: string): AnalyticsData => {
    const getDaysFromRange = (range: string): number => {
      switch (range) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        case '1y': return 365;
        default: return 30;
      }
    };

    const days = getDaysFromRange(range);
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Generate realistic mock data
    const baseRevenue = 50000 + Math.random() * 100000;
    const baseQuotations = 100 + Math.random() * 200;
    const baseConversionRate = 15 + Math.random() * 20;
    const baseResponseTime = 120 + Math.random() * 180;

    const overview = {
      totalRevenue: Math.round(baseRevenue),
      totalQuotations: Math.round(baseQuotations),
      conversionRate: Math.round(baseConversionRate * 10) / 10,
      averageResponseTime: Math.round(baseResponseTime),
      revenueChange: Math.round((Math.random() - 0.5) * 20),
      quotationsChange: Math.round((Math.random() - 0.5) * 15),
      conversionChange: Math.round((Math.random() - 0.5) * 10),
      responseTimeChange: Math.round((Math.random() - 0.5) * 25)
    };

    // Generate trend data
    const trends = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: Array.from({ length: days }, () => 
            baseRevenue * (0.8 + Math.random() * 0.4) / days
          ),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          fill: true
        },
        {
          label: 'Quotations',
          data: Array.from({ length: days }, () => 
            baseQuotations * (0.7 + Math.random() * 0.6) / days
          ),
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          borderColor: 'rgba(147, 51, 234, 1)',
          fill: true
        }
      ]
    };

    // Generate performance data
    const performance = {
      labels: ['Revenue', 'Quotations', 'Conversions', 'Response Time'],
      datasets: [
        {
          label: 'Current Period',
          data: [
            overview.totalRevenue / 1000, // Convert to thousands
            overview.totalQuotations,
            overview.totalQuotations * (overview.conversionRate / 100),
            overview.averageResponseTime
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)'
        },
        {
          label: 'Previous Period',
          data: [
            (overview.totalRevenue / (1 + overview.revenueChange / 100)) / 1000,
            overview.totalQuotations / (1 + overview.quotationsChange / 100),
            (overview.totalQuotations * (overview.conversionRate / 100)) / (1 + overview.conversionChange / 100),
            overview.averageResponseTime / (1 + overview.responseTimeChange / 100)
          ],
          backgroundColor: 'rgba(156, 163, 175, 0.8)',
          borderColor: 'rgba(156, 163, 175, 1)'
        }
      ]
    };

    // Generate conversion funnel data
    const totalViews = Math.round(baseQuotations * 3);
    const totalQuotes = Math.round(baseQuotations * 1.5);
    const totalAccepted = Math.round(baseQuotations * (overview.conversionRate / 100));
    const totalPaid = Math.round(totalAccepted * 0.9);

    const conversionFunnel = {
      stages: [
        {
          name: 'Views',
          count: totalViews,
          percentage: 100,
          color: 'bg-blue-500',
          icon: 'EyeIcon'
        },
        {
          name: 'Quotes Sent',
          count: totalQuotes,
          percentage: Math.round((totalQuotes / totalViews) * 100),
          color: 'bg-purple-500',
          icon: 'FileTextIcon'
        },
        {
          name: 'Quotes Accepted',
          count: totalAccepted,
          percentage: Math.round((totalAccepted / totalViews) * 100),
          color: 'bg-green-500',
          icon: 'CheckCircleIcon'
        },
        {
          name: 'Payment Received',
          count: totalPaid,
          percentage: Math.round((totalPaid / totalViews) * 100),
          color: 'bg-yellow-500',
          icon: 'CurrencyDollarIcon'
        }
      ],
      totalConversions: totalPaid,
      conversionRate: Math.round((totalPaid / totalViews) * 100),
      averageValue: Math.round(overview.totalRevenue / totalPaid)
    };

    return {
      overview,
      trends,
      performance,
      conversionFunnel
    };
  }, []);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockData(dateRange);
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, generateMockData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Export data
  const exportData = useCallback(async (
    format: 'pdf' | 'excel' | 'csv',
    dateRange: string,
    selectedMetrics: string[]
  ) => {
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call the backend API
      console.log(`Exporting ${format} for ${dateRange} with metrics:`, selectedMetrics);
      
      // Simulate file download
      const blob = new Blob(['Mock export data'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, []);

  // Schedule report
  const scheduleReport = useCallback(async (schedule: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would call the backend API
      console.log('Scheduling report:', schedule);
      
      return true;
    } catch (error) {
      console.error('Report scheduling failed:', error);
      throw error;
    }
  }, []);

  // Load data when date range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  return {
    analyticsData,
    isLoading,
    refreshData,
    exportData,
    scheduleReport
  };
};
