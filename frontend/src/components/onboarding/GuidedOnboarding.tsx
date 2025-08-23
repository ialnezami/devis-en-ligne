import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  PlayIcon, 
  PauseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { OnboardingStep } from './FreeTrialOnboarding';

interface GuidedOnboardingProps {
  steps: OnboardingStep[];
  onStepComplete: (stepId: string) => void;
  completedSteps: string[];
}

export default function GuidedOnboarding({ 
  steps, 
  onStepComplete, 
  completedSteps 
}: GuidedOnboardingProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isCurrentStepCompleted = completedSteps.includes(currentStep.id);
  const canGoNext = currentStepIndex < steps.length - 1;
  const canGoPrevious = currentStepIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepComplete = () => {
    if (!isCurrentStepCompleted) {
      onStepComplete(currentStep.id);
    }
  };

  const handleAutoAdvance = () => {
    setAutoAdvance(!autoAdvance);
    setIsPlaying(!autoAdvance);
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'account-setup':
        return <UserIcon className="h-6 w-6" />;
      case 'company-info':
        return <BuildingOfficeIcon className="h-6 w-6" />;
      case 'first-quote':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'client-management':
        return <UserGroupIcon className="h-6 w-6" />;
      case 'templates':
        return <DocumentDuplicateIcon className="h-6 w-6" />;
      default:
        return <CheckCircleIcon className="h-6 w-6" />;
    }
  };

  const getStepContent = (stepId: string) => {
    switch (stepId) {
      case 'account-setup':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Complete Your Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Let's start by setting up your personal information
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Upload Photo
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Zone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC+0 (GMT)</option>
                  <option>UTC+1 (Central European)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleStepComplete}
                disabled={isCurrentStepCompleted}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isCurrentStepCompleted
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentStepCompleted ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>
        );

      case 'company-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Company Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us about your business to personalize your experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Upload Logo
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                  <option>Select Industry</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Education</option>
                  <option>Manufacturing</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleStepComplete}
                disabled={isCurrentStepCompleted}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isCurrentStepCompleted
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentStepCompleted ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>
        );

      case 'first-quote':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Create Your First Quote
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn the basics of quote creation with our guided tutorial
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Quick Start Guide
                  </h4>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
                    <li>Choose a template from our library</li>
                    <li>Add your company and client information</li>
                    <li>Include products or services with pricing</li>
                    <li>Review and send to your client</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Watch Tutorial
              </button>
              <button
                onClick={handleStepComplete}
                disabled={isCurrentStepCompleted}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isCurrentStepCompleted
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentStepCompleted ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>
        );

      case 'client-management':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Manage Your Clients
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your client database for better relationship management
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Client Categories</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Clients</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Prospects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                    Add New Client
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                    Import Client List
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                    Set Reminders
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleStepComplete}
                disabled={isCurrentStepCompleted}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isCurrentStepCompleted
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentStepCompleted ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Customize Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Personalize your quote templates to match your brand
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Professional', 'Creative', 'Minimal'].map((style) => (
                <div key={style} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
                    <DocumentDuplicateIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-center">{style}</h4>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleStepComplete}
                disabled={isCurrentStepCompleted}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isCurrentStepCompleted
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentStepCompleted ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Step content not available</p>
          </div>
        );
    }
  };

  const progressPercentage = (completedSteps.length / steps.filter(s => s.isRequired).length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Onboarding Progress
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAutoAdvance}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedSteps.length} of {steps.filter(s => s.isRequired).length} completed
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Step {currentStepIndex + 1} of {steps.length}: {currentStep.title}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = index === currentStepIndex;
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                className={`p-3 rounded-lg border transition-colors text-left ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {isCompleted ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}</span>
                    </div>
                  )}
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.isRequired ? 'Required' : 'Optional'}
                  </span>
                </div>
                <h4 className={`text-sm font-medium ${
                  isActive ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-white'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            isCurrentStepCompleted 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-blue-100 dark:bg-blue-900/20'
          }`}>
            {getStepIcon(currentStep.id)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentStep.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStep.description}
            </p>
          </div>
        </div>

        {getStepContent(currentStep.id)}
      </div>
    </div>
  );
}
