import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  ClockIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Client, ClientActivity, clientManagementService } from '@/services/clientManagementService';
import { toast } from 'react-hot-toast';

interface ClientActivityTrackingProps {
  client: Client;
  onActivityLogged?: (activity: ClientActivity) => void;
}

export const ClientActivityTracking: React.FC<ClientActivityTrackingProps> = ({
  client,
  onActivityLogged,
}) => {
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingActivity, setViewingActivity] = useState<ClientActivity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    activitiesThisWeek: 0,
    activitiesThisMonth: 0,
    mostActiveDay: '',
    activityTrend: 'stable' as 'increasing' | 'decreasing' | 'stable',
  });

  useEffect(() => {
    loadActivities();
  }, [client.id]);

  useEffect(() => {
    calculateActivityStats();
  }, [activities]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const activitiesData = await clientManagementService.getClientActivities(client.id);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateActivityStats = () => {
    if (activities.length === 0) return;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activitiesThisWeek = activities.filter(activity => 
      new Date(activity.timestamp) >= oneWeekAgo
    ).length;

    const activitiesThisMonth = activities.filter(activity => 
      new Date(activity.timestamp) >= oneMonthAgo
    ).length;

    // Calculate most active day
    const dayCounts: Record<string, number> = {};
    activities.forEach(activity => {
      const day = new Date(activity.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => 
      dayCounts[a[0]] > dayCounts[b[0]] ? a : b
    )[0];

    // Calculate activity trend
    const recentActivities = activities.filter(activity => 
      new Date(activity.timestamp) >= oneWeekAgo
    ).length;
    const previousWeekActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return activityDate >= twoWeeksAgo && activityDate < oneWeekAgo;
    }).length;

    let activityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentActivities > previousWeekActivities) {
      activityTrend = 'increasing';
    } else if (recentActivities < previousWeekActivities) {
      activityTrend = 'decreasing';
    }

    setActivityStats({
      totalActivities: activities.length,
      activitiesThisWeek,
      activitiesThisMonth,
      mostActiveDay,
      activityTrend,
    });
  };

  const getFilteredActivities = () => {
    let filtered = [...activities];

    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filterDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(activity => new Date(activity.timestamp) >= startDate);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(term) ||
        activity.description.toLowerCase().includes(term) ||
        (activity.metadata && JSON.stringify(activity.metadata).toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserIcon className="h-5 w-5" />;
      case 'quote_view': return <EyeIcon className="h-5 w-5" />;
      case 'document_download': return <ChartBarIcon className="h-5 w-5" />;
      case 'communication': return <ClockIcon className="h-5 w-5" />;
      case 'payment': return <CheckCircleIcon className="h-5 w-5" />;
      case 'profile_update': return <InformationCircleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'blue';
      case 'quote_view': return 'green';
      case 'document_download': return 'orange';
      case 'communication': return 'purple';
      case 'payment': return 'green';
      case 'profile_update': return 'gray';
      default: return 'gray';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    return type.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpIcon className="h-5 w-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDownIcon className="h-5 w-5 text-red-600" />;
      default:
        return <TrendingUpIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Client Activity Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and track all client activities and interactions
          </p>
        </div>

        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activityStats.totalActivities}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activityStats.activitiesThisWeek}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activityStats.activitiesThisMonth}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                {getTrendIcon(activityStats.activityTrend)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activity Trend</p>
                <p className={`text-lg font-semibold ${getTrendColor(activityStats.activityTrend)}`}>
                  {activityStats.activityTrend.charAt(0).toUpperCase() + activityStats.activityTrend.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Active Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activityStats.mostActiveDay}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Highest activity day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                activities.reduce((acc, activity) => {
                  acc[activity.type] = (acc[activity.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded bg-${getActivityTypeColor(type)}-100`}>
                        {getActivityTypeIcon(type)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getActivityTypeLabel(type)}
                      </span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Type
                </label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="login">Login</option>
                  <option value="quote_view">Quote View</option>
                  <option value="document_download">Document Download</option>
                  <option value="communication">Communication</option>
                  <option value="payment">Payment</option>
                  <option value="profile_update">Profile Update</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <Select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recent Activities ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No activities found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-${getActivityTypeColor(activity.type)}-100`}>
                          {getActivityTypeIcon(activity.type)}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingActivity(activity)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" color={getActivityTypeColor(activity.type)}>
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                        
                        {activity.ipAddress && (
                          <span>IP: {activity.ipAddress}</span>
                        )}
                        
                        {activity.relatedEntityId && (
                          <span>Related: {activity.relatedEntityType} #{activity.relatedEntityId}</span>
                        )}
                      </div>
                      
                      <span className="text-xs">{formatDate(activity.timestamp)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Activity Modal */}
      {viewingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Activity Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingActivity(null)}
                >
                  <XCircleIcon className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full bg-${getActivityTypeColor(viewingActivity.type)}-100`}>
                    {getActivityTypeIcon(viewingActivity.type)}
                  </div>
                  
                  <div>
                    <Badge variant="outline" color={getActivityTypeColor(viewingActivity.type)}>
                      {getActivityTypeLabel(viewingActivity.type)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {viewingActivity.title}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {viewingActivity.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timestamp
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(viewingActivity.timestamp)}</p>
                  </div>
                  
                  {viewingActivity.ipAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        IP Address
                      </label>
                      <p className="text-gray-900 dark:text-white">{viewingActivity.ipAddress}</p>
                    </div>
                  )}
                  
                  {viewingActivity.userAgent && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User Agent
                      </label>
                      <p className="text-gray-900 dark:text-white text-xs break-all">
                        {viewingActivity.userAgent}
                      </p>
                    </div>
                  )}
                  
                  {viewingActivity.relatedEntityId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Related Entity Type
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {viewingActivity.relatedEntityType}
                      </p>
                    </div>
                  )}
                  
                  {viewingActivity.relatedEntityId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Related Entity ID
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {viewingActivity.relatedEntityId}
                      </p>
                    </div>
                  )}
                </div>
                
                {viewingActivity.metadata && Object.keys(viewingActivity.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Metadata
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {JSON.stringify(viewingActivity.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={() => setViewingActivity(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
