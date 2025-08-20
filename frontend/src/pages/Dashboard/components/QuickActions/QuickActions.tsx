import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  DownloadIcon,
  BellIcon
} from '@heroicons/react/outline';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  badge?: string;
}

const QuickActions: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      id: 'create-quotation',
      title: 'Create Quotation',
      description: 'Generate a new quotation for a client',
      icon: DocumentTextIcon,
      href: '/quotations/create',
      color: 'blue'
    },
    {
      id: 'add-client',
      title: 'Add Client',
      description: 'Register a new client in the system',
      icon: UserGroupIcon,
      href: '/clients/create',
      color: 'green'
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access analytics and business reports',
      icon: ChartBarIcon,
      href: '/analytics/reports',
      color: 'purple'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure system preferences',
      icon: CogIcon,
      href: '/settings',
      color: 'orange'
    }
  ];

  const additionalActions = [
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports and data',
      icon: DownloadIcon,
      href: '/analytics/export',
      color: 'blue'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: BellIcon,
      href: '/settings/notifications',
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'bg-blue-500',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: 'bg-green-500',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'bg-purple-500',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        icon: 'bg-orange-500',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-300'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Primary Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => {
            const colors = getColorClasses(action.color);
            const IconComponent = action.icon;
            
            return (
              <Link
                key={action.id}
                to={action.href}
                className={`${colors.bg} ${colors.hover} p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 group`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${colors.icon} p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${colors.text} group-hover:underline`}>
                      {action.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                  
                  <PlusIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Additional Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          More Actions
        </h3>
        
        <div className="space-y-3">
          {additionalActions.map((action) => {
            const colors = getColorClasses(action.color);
            const IconComponent = action.icon;
            
            return (
              <Link
                key={action.id}
                to={action.href}
                className={`${colors.bg} ${colors.hover} p-3 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 group flex items-center space-x-3`}
              >
                <div className={`${colors.icon} p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${colors.text} group-hover:underline`}>
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Stats
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Today's Quotations
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              3
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Pending Approvals
            </span>
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              2
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              New Messages
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
