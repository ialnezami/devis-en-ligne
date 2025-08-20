import React from 'react';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (activity: Activity) => {
    const iconMap = {
      DocumentTextIcon,
      UserGroupIcon,
      CurrencyDollarIcon,
      CheckCircleIcon,
      XCircleIcon,
      ClockIcon,
      ExclamationTriangleIcon
    };

    if (activity.icon && iconMap[activity.icon as keyof typeof iconMap]) {
      const IconComponent = iconMap[activity.icon as keyof typeof iconMap];
      return <IconComponent className="h-5 w-5" />;
    }

    // Default icons based on type
    switch (activity.type) {
      case 'quotation':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'client':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'system':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'info':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quotation':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'client':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'payment':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'system':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Latest updates from your business
        </p>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                  {getActivityIcon(activity)}
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  
                  {/* Activity Details */}
                  <div className="flex items-center space-x-4 mt-2">
                    {activity.user && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {activity.user}
                      </span>
                    )}
                    
                    {activity.amount && (
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        ${activity.amount.toLocaleString()}
                      </span>
                    )}
                    
                    {activity.status && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No recent activity
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Activity will appear here as you use the system.
            </p>
          </div>
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
