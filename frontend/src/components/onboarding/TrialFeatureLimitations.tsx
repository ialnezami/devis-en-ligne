import React from 'react';
import { 
  ExclamationTriangleIcon, 
  LockClosedIcon, 
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { TrialInfo } from './FreeTrialOnboarding';

interface TrialFeatureLimitationsProps {
  trialInfo: TrialInfo;
  onUpgrade: () => void;
}

export default function TrialFeatureLimitations({ 
  trialInfo, 
  onUpgrade 
}: TrialFeatureLimitationsProps) {
  const featureLimitations = [
    {
      feature: 'Quote Creation',
      current: trialInfo.usage.quotesCreated,
      limit: trialInfo.usage.maxQuotes,
      unit: 'quotes',
      isLimited: trialInfo.usage.quotesCreated >= trialInfo.usage.maxQuotes,
      upgradeBenefit: 'Unlimited quotes'
    },
    {
      feature: 'Client Management',
      current: trialInfo.usage.clientsAdded,
      limit: trialInfo.usage.maxClients,
      unit: 'clients',
      isLimited: trialInfo.usage.clientsAdded >= trialInfo.usage.maxClients,
      upgradeBenefit: 'Unlimited clients'
    },
    {
      feature: 'Storage',
      current: trialInfo.usage.storageUsed,
      limit: trialInfo.usage.maxStorage,
      unit: 'MB',
      isLimited: trialInfo.usage.storageUsed >= trialInfo.usage.maxStorage,
      upgradeBenefit: '1GB+ storage'
    },
    {
      feature: 'Templates',
      current: 3,
      limit: 5,
      unit: 'templates',
      isLimited: false,
      upgradeBenefit: 'Premium templates'
    },
    {
      feature: 'Support',
      current: 'Email',
      limit: 'Priority',
      unit: '',
      isLimited: false,
      upgradeBenefit: 'Priority support'
    }
  ];

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Trial Limitations
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your free trial has some limitations. Upgrade to unlock unlimited access to all features.
        </p>
      </div>

      {/* Current Usage Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Usage
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureLimitations.map((feature, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {feature.feature}
                </h4>
                {feature.isLimited && (
                  <LockClosedIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              {typeof feature.current === 'number' && typeof feature.limit === 'number' ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.current} / {feature.limit} {feature.unit}
                    </span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(feature.current, feature.limit))}`}>
                      {Math.round(getUsagePercentage(feature.current, feature.limit))}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getUsagePercentage(feature.current, feature.limit))}`}
                      style={{ width: `${getUsagePercentage(feature.current, feature.limit)}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.current}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    vs {feature.limit}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Feature</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Free Trial</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Paid Plans</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-900 dark:text-white">Quote Creation</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {trialInfo.usage.maxQuotes} quotes
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">Unlimited</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-900 dark:text-white">Client Management</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {trialInfo.usage.maxClients} clients
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">Unlimited</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-900 dark:text-white">Storage</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {trialInfo.usage.maxStorage}MB
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">1GB+</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-900 dark:text-white">Templates</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Basic</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">Premium</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-900 dark:text-white">Support</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Email</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">Priority</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-900 dark:text-white">Advanced Features</td>
                <td className="py-3 px-4 text-center">
                  <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                </td>
                <td className="py-3 px-4 text-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Unlock Full Potential
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            Upgrade to a paid plan and remove all limitations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {featureLimitations.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-blue-800 dark:text-blue-200">
                {feature.upgradeBenefit}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={onUpgrade}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <ArrowUpIcon className="h-5 w-5 mr-2" />
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Current Limitations Alert */}
      {trialInfo.limitations.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Current Limitations
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {trialInfo.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
