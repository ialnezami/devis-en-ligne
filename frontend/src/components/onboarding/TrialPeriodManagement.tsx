import React, { useState } from 'react';
import { 
  ClockIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { TrialInfo } from './FreeTrialOnboarding';

interface TrialPeriodManagementProps {
  trialInfo: TrialInfo;
  onTrialUpdate: (trialInfo: TrialInfo) => void;
}

export default function TrialPeriodManagement({ 
  trialInfo, 
  onTrialUpdate 
}: TrialPeriodManagementProps) {
  const [isExtending, setIsExtending] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionReason, setExtensionReason] = useState('');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = () => {
    const now = new Date();
    const diffTime = trialInfo.endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getTrialStatus = () => {
    if (!trialInfo.isActive) return 'expired';
    if (getDaysUntilExpiry() <= 3) return 'expiring-soon';
    if (getDaysUntilExpiry() <= 7) return 'expiring';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'expiring':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'expiring-soon':
        return 'text-orange-600 dark:text-orange-400';
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'expiring':
        return <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'expiring-soon':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'expired':
        return <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const handleExtendTrial = async () => {
    if (!extensionReason.trim()) return;
    
    setIsExtending(true);
    try {
      // Simulate API call for trial extension
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const extendedTrialInfo: TrialInfo = {
        ...trialInfo,
        endDate: new Date(trialInfo.endDate.getTime() + 7 * 24 * 60 * 60 * 1000), // Add 7 days
        daysRemaining: getDaysUntilExpiry() + 7
      };
      
      onTrialUpdate(extendedTrialInfo);
      setShowExtensionModal(false);
      setExtensionReason('');
    } catch (error) {
      console.error('Failed to extend trial:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleCancelTrial = async () => {
    try {
      // Simulate API call for trial cancellation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cancelledTrialInfo: TrialInfo = {
        ...trialInfo,
        isActive: false,
        daysRemaining: 0
      };
      
      onTrialUpdate(cancelledTrialInfo);
    } catch (error) {
      console.error('Failed to cancel trial:', error);
    }
  };

  const trialStatus = getTrialStatus();
  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Trial Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trial Status
          </h3>
          <div className="flex items-center space-x-3">
            {getStatusIcon(trialStatus)}
            <span className={`font-medium ${getStatusColor(trialStatus)}`}>
              {trialStatus === 'active' && 'Active'}
              {trialStatus === 'expiring' && 'Expiring Soon'}
              {trialStatus === 'expiring-soon' && 'Expiring Very Soon'}
              {trialStatus === 'expired' && 'Expired'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Start Date</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(trialInfo.startDate)}
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Days Remaining</h4>
            <p className={`text-2xl font-bold ${
              daysUntilExpiry <= 3 ? 'text-red-600 dark:text-red-400' :
              daysUntilExpiry <= 7 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {daysUntilExpiry}
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">End Date</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(trialInfo.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quotes Created</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {trialInfo.usage.quotesCreated}/{trialInfo.usage.maxQuotes}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(trialInfo.usage.quotesCreated / trialInfo.usage.maxQuotes) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Clients Added</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {trialInfo.usage.clientsAdded}/{trialInfo.usage.maxClients}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(trialInfo.usage.clientsAdded / trialInfo.usage.maxClients) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {trialInfo.usage.storageUsed}MB/{trialInfo.usage.maxStorage}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(trialInfo.usage.storageUsed / trialInfo.usage.maxStorage) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trial Actions
        </h3>
        
        <div className="flex flex-wrap gap-4">
          {trialInfo.isActive && daysUntilExpiry > 0 && (
            <button
              onClick={() => setShowExtensionModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Request Extension
            </button>
          )}
          
          {trialInfo.isActive && (
            <button
              onClick={handleCancelTrial}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Cancel Trial
            </button>
          )}
        </div>
      </div>

      {/* Trial Features & Limitations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trial Features & Limitations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Available Features</h4>
            <ul className="space-y-2">
              {trialInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Limitations</h4>
            <ul className="space-y-2">
              {trialInfo.limitations.map((limitation, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Request Trial Extension
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Extension
              </label>
              <textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Please explain why you need an extension..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendTrial}
                disabled={isExtending || !extensionReason.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExtending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Requesting...
                  </>
                ) : (
                  'Request Extension'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
