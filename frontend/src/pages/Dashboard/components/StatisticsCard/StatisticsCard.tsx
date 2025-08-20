import React from 'react';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/outline';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'bg-orange-500',
      text: 'text-orange-600 dark:text-orange-400'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400'
    }
  };

  const iconMap = {
    DocumentTextIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ChartBarIcon
  };

  const IconComponent = iconMap[icon as keyof typeof iconMap] || DocumentTextIcon;
  const colors = colorClasses[color];

  const getChangeIcon = () => {
    if (changeType === 'increase') {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (changeType === 'decrease') {
      return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getChangeTextColor = () => {
    if (changeType === 'increase') return 'text-green-600 dark:text-green-400';
    if (changeType === 'decrease') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={`${colors.bg} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {getChangeIcon()}
              <span className={`text-sm font-medium ml-1 ${getChangeTextColor()}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                from last month
              </span>
            </div>
          )}
        </div>
        
        <div className={`${colors.icon} p-3 rounded-lg`}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
