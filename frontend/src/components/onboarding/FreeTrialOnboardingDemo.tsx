import React, { useState } from 'react';
import { GiftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import FreeTrialOnboarding from './FreeTrialOnboarding';

export default function FreeTrialOnboardingDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoStart = () => {
    setShowDemo(true);
  };

  const handleDemoStop = () => {
    setShowDemo(false);
  };

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleDemoStop}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              ← Back to Demo
            </button>
          </div>
          
          <FreeTrialOnboarding 
            onTrialStatusChange={(status) => {
              console.log('Trial status changed:', status);
            }}
            onOnboardingComplete={(completedSteps) => {
              console.log('Onboarding completed:', completedSteps);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8">
            <GiftIcon className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Free Trial & Onboarding System
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Experience our comprehensive free trial and onboarding system designed to help users get started quickly and convert to paid plans seamlessly.
          </p>
          
          <button
            onClick={handleDemoStart}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Demo
            <ArrowRightIcon className="ml-2 h-6 w-6" />
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <GiftIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Trial Signup Flow
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-step signup process with company information collection and terms acceptance.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
              <GiftIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Guided Onboarding
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Step-by-step onboarding with progress tracking and interactive tutorials.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
              <GiftIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Trial Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor trial status, usage limits, and request extensions when needed.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4">
              <GiftIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Feature Limitations
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Clear visibility into trial restrictions with upgrade prompts and comparisons.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
              <GiftIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upgrade Flow
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seamless conversion from trial to paid plans with multiple pricing options.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4">
              <GiftIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Backup & Restore
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Data protection with automated backups and easy restoration capabilities.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trial Experience
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• 14-day free trial with full feature access</li>
                <li>• Multi-step signup with company information</li>
                <li>• Real-time trial status and countdown</li>
                <li>• Usage tracking and limit notifications</li>
                <li>• Trial extension requests</li>
                <li>• Graceful degradation when limits reached</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Onboarding System
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Interactive step-by-step guidance</li>
                <li>• Progress tracking and completion status</li>
                <li>• Required vs. optional steps</li>
                <li>• Tutorial videos and help articles</li>
                <li>• Tips and best practices</li>
                <li>• Auto-advance and manual navigation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Conversion Features
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Multiple pricing plans (Basic, Pro, Enterprise)</li>
                <li>• Monthly and yearly billing options</li>
                <li>• Feature comparison tables</li>
                <li>• Upgrade prompts and notifications</li>
                <li>• Secure payment processing</li>
                <li>• Billing address management</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Protection
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Automated backup scheduling</li>
                <li>• Manual backup creation</li>
                <li>• Selective data inclusion</li>
                <li>• Compression and encryption options</li>
                <li>• Restore point management</li>
                <li>• Compatibility checking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
