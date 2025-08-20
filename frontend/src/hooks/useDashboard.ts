import { useState, useEffect, useCallback } from 'react';

interface DashboardStatistics {
  totalQuotations: number;
  quotationsChange: number;
  quotationsChangeType: 'increase' | 'decrease' | 'neutral';
  activeClients: number;
  clientsChange: number;
  clientsChangeType: 'increase' | 'decrease' | 'neutral';
  monthlyRevenue: number;
  revenueChange: number;
  revenueChangeType: 'increase' | 'decrease' | 'neutral';
  conversionRate: number;
  conversionChange: number;
  conversionChangeType: 'increase' | 'decrease' | 'neutral';
}

interface ChartData {
  revenue: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      fill?: boolean;
      tension?: number;
    }>;
  };
  quotationsByStatus: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
    }>;
  };
  clientGrowth: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };
  topProducts: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };
}

interface Activity {
  id: string;
  type: 'quotation' | 'client' | 'payment' | 'system';
  action: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed' | 'info';
  user?: string;
  amount?: number;
  icon?: string;
}

interface DashboardCustomizations {
  showStatistics: boolean;
  showCharts: boolean;
  showActivityFeed: boolean;
  showQuickActions: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
}

export const useDashboard = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics>({
    totalQuotations: 0,
    quotationsChange: 0,
    quotationsChangeType: 'neutral',
    activeClients: 0,
    clientsChange: 0,
    clientsChangeType: 'neutral',
    monthlyRevenue: 0,
    revenueChange: 0,
    revenueChangeType: 'neutral',
    conversionRate: 0,
    conversionChange: 0,
    conversionChangeType: 'neutral'
  });

  const [chartData, setChartData] = useState<ChartData>({
    revenue: {
      labels: [],
      datasets: []
    },
    quotationsByStatus: {
      labels: [],
      datasets: []
    },
    clientGrowth: {
      labels: [],
      datasets: []
    },
    topProducts: {
      labels: [],
      datasets: []
    }
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customizations, setCustomizations] = useState<DashboardCustomizations>({
    showStatistics: true,
    showCharts: true,
    showActivityFeed: true,
    showQuickActions: true,
    refreshInterval: 30000,
    theme: 'auto'
  });

  // Mock data generation for development
  const generateMockData = useCallback(() => {
    // Generate mock statistics
    const mockStatistics: DashboardStatistics = {
      totalQuotations: Math.floor(Math.random() * 1000) + 500,
      quotationsChange: Math.floor(Math.random() * 20) - 10,
      quotationsChangeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      activeClients: Math.floor(Math.random() * 500) + 200,
      clientsChange: Math.floor(Math.random() * 15) - 5,
      clientsChangeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
      revenueChange: Math.floor(Math.random() * 25) - 10,
      revenueChangeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      conversionRate: Math.floor(Math.random() * 30) + 15,
      conversionChange: Math.floor(Math.random() * 10) - 5,
      conversionChangeType: Math.random() > 0.5 ? 'increase' : 'decrease'
    };

    // Generate mock chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mockChartData: ChartData = {
      revenue: {
        labels: months,
        datasets: [{
          label: 'Revenue',
          data: months.map(() => Math.floor(Math.random() * 50000) + 20000),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          fill: true,
          tension: 0.4
        }]
      },
      quotationsByStatus: {
        labels: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected'],
        datasets: [{
          label: 'Quotations',
          data: [
            Math.floor(Math.random() * 100) + 20,
            Math.floor(Math.random() * 150) + 30,
            Math.floor(Math.random() * 200) + 50,
            Math.floor(Math.random() * 100) + 20,
            Math.floor(Math.random() * 50) + 10
          ],
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6'
          ]
        }]
      },
      clientGrowth: {
        labels: months,
        datasets: [{
          label: 'New Clients',
          data: months.map(() => Math.floor(Math.random() * 50) + 10),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)'
        }]
      },
      topProducts: {
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
        datasets: [{
          label: 'Sales Value',
          data: [
            Math.floor(Math.random() * 50000) + 10000,
            Math.floor(Math.random() * 40000) + 8000,
            Math.floor(Math.random() * 30000) + 6000,
            Math.floor(Math.random() * 20000) + 4000,
            Math.floor(Math.random() * 10000) + 2000
          ],
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)'
        }]
      }
    };

    // Generate mock activity data
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'quotation',
        action: 'New quotation created',
        description: 'Quotation #Q-2024-001 created for ABC Company',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'success',
        user: 'John Doe',
        amount: 25000,
        icon: 'DocumentTextIcon'
      },
      {
        id: '2',
        type: 'client',
        action: 'Client registered',
        description: 'New client XYZ Corporation added to the system',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'success',
        user: 'Jane Smith',
        icon: 'UserGroupIcon'
      },
      {
        id: '3',
        type: 'payment',
        action: 'Payment received',
        description: 'Payment of $15,000 received for quotation #Q-2023-089',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success',
        user: 'Mike Johnson',
        amount: 15000,
        icon: 'CurrencyDollarIcon'
      },
      {
        id: '4',
        type: 'quotation',
        action: 'Quotation viewed',
        description: 'Quotation #Q-2024-002 viewed by client',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'info',
        user: 'Client Portal',
        icon: 'DocumentTextIcon'
      },
      {
        id: '5',
        type: 'system',
        action: 'System maintenance',
        description: 'Scheduled maintenance completed successfully',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'success',
        icon: 'ExclamationIcon'
      }
    ];

    setStatistics(mockStatistics);
    setChartData(mockChartData);
    setRecentActivity(mockActivities);
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      generateMockData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData]);

  // Refresh dashboard data
  const refreshData = useCallback(() => {
    generateMockData();
  }, [generateMockData]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Update customizations
  const updateCustomizations = useCallback((newCustomizations: Partial<DashboardCustomizations>) => {
    setCustomizations(prev => ({
      ...prev,
      ...newCustomizations
    }));
  }, []);

  return {
    statistics,
    chartData,
    recentActivity,
    isLoading,
    customizations,
    refreshData,
    updateCustomizations
  };
};
