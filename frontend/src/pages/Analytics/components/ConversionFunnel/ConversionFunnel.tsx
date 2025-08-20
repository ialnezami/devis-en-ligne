import React from 'react';
import { EyeIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon, CurrencyDollarIcon } from '@heroicons/react/outline';

interface ConversionFunnelData {
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
}

interface ConversionFunnelProps {
  data: ConversionFunnelData;
  dateRange: string;
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data, dateRange }) => {
  const iconMap = {
    EyeIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    CurrencyDollarIcon
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStageWidth = (percentage: number) => {
    return Math.max(percentage, 15); // Minimum 15% width for visibility
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Conversion Funnel
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track your quotation conversion process from view to payment
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-4">
        {data.stages.map((stage, index) => {
          const IconComponent = iconMap[stage.icon as keyof typeof iconMap] || EyeIcon;
          const isLastStage = index === data.stages.length - 1;
          
          return (
            <div key={stage.name} className="relative">
              {/* Stage Label */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stage.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stage.count.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stage.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                  <div
                    className={`h-8 rounded-full transition-all duration-500 ease-out ${stage.color}`}
                    style={{ width: `${getStageWidth(stage.percentage)}%` }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="text-white text-sm font-medium">
                        {stage.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Dropdown Arrow */}
                {!isLastStage && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-8">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300 dark:border-t-gray-600"></div>
                  </div>
                )}
              </div>

              {/* Stage Details */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {index < data.stages.length - 1 && (
                  <span>
                    Drop-off: {((data.stages[index].count - data.stages[index + 1].count) / data.stages[index].count * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.totalConversions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Conversions
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.conversionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Overall Conversion Rate
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(data.averageValue)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Quotation Value
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 Insights for {dateRange}
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• {data.stages[0].name} stage has the highest volume with {data.stages[0].count.toLocaleString()} views</li>
          <li>• Biggest drop-off occurs at {data.stages.find((_, i) => i < data.stages.length - 1 && 
            (data.stages[i].count - data.stages[i + 1].count) / data.stages[i].count === 
            Math.max(...data.stages.slice(0, -1).map((_, i) => (data.stages[i].count - data.stages[i + 1].count) / data.stages[i].count))
          )?.name} stage</li>
          <li>• Final conversion rate: {data.conversionRate.toFixed(1)}%</li>
        </ul>
      </div>
    </div>
  );
};

export default ConversionFunnel;
