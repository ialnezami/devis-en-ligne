import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StatisticsCard from './components/StatisticsCard/StatisticsCard';
import ChartCard from './components/ChartCard/ChartCard';
import ActivityFeed from './components/ActivityFeed/ActivityFeed';
import QuickActions from './components/QuickActions/QuickActions';
import DashboardCustomization from './components/DashboardCustomization/DashboardCustomization';
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard: React.FC = () => {
  const {
    statistics,
    chartData,
    recentActivity,
    isLoading,
    refreshData,
    customizations
  } = useDashboard();

  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Set up real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refreshData]);

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
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Refresh
            </button>
            <DashboardCustomization
              customizations={customizations}
              onCustomizationChange={(newCustomizations) => {
                // Handle customization changes
                console.log('Customizations updated:', newCustomizations);
              }}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatisticsCard
            title="Total Quotations"
            value={statistics.totalQuotations}
            change={statistics.quotationsChange}
            changeType={statistics.quotationsChangeType}
            icon="DocumentTextIcon"
            color="blue"
          />
          <StatisticsCard
            title="Active Clients"
            value={statistics.activeClients}
            change={statistics.clientsChange}
            changeType={statistics.clientsChangeType}
            icon="UserGroupIcon"
            color="green"
          />
          <StatisticsCard
            title="Monthly Revenue"
            value={`$${statistics.monthlyRevenue.toLocaleString()}`}
            change={statistics.revenueChange}
            changeType={statistics.revenueChangeType}
            icon="CurrencyDollarIcon"
            color="purple"
          />
          <StatisticsCard
            title="Conversion Rate"
            value={`${statistics.conversionRate}%`}
            change={statistics.conversionChange}
            changeType={statistics.conversionChangeType}
            icon="ChartBarIcon"
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Revenue Trend"
            subtitle="Last 12 months"
            type="line"
            data={chartData.revenue}
            height={300}
          />
          <ChartCard
            title="Quotations by Status"
            subtitle="Current month"
            type="doughnut"
            data={chartData.quotationsByStatus}
            height={300}
          />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Client Growth"
            subtitle="New clients per month"
            type="bar"
            data={chartData.clientGrowth}
            height={300}
          />
          <ChartCard
            title="Top Products"
            subtitle="By quotation value"
            type="horizontalBar"
            data={chartData.topProducts}
            height={300}
          />
        </div>

        {/* Quick Actions and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>

        {/* Real-time Updates Indicator */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Data updates every {refreshInterval / 1000} seconds
          </span>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
