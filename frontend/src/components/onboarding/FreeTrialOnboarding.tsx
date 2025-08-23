import React, { useState, useEffect } from 'react';
import { 
  GiftIcon, 
  ClockIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  CloudArrowUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import TrialSignupFlow from './TrialSignupFlow';
import TrialPeriodManagement from './TrialPeriodManagement';
import GuidedOnboarding from './GuidedOnboarding';
import TutorialHelpSystem from './TutorialHelpSystem';
import TrialFeatureLimitations from './TrialFeatureLimitations';
import UpgradePrompts from './UpgradePrompts';
import TrialExpirationNotifications from './TrialExpirationNotifications';
import TrialToPaidConversion from './TrialToPaidConversion';
import BackupRestore from './BackupRestore';

interface FreeTrialOnboardingProps {
  onTrialStatusChange?: (status: 'active' | 'expired' | 'converted') => void;
  onOnboardingComplete?: (completedSteps: string[]) => void;
}

export interface TrialInfo {
  id: string;
  email: string;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  isActive: boolean;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[];
  limitations: string[];
  usage: {
    quotesCreated: number;
    clientsAdded: number;
    storageUsed: number;
    maxQuotes: number;
    maxClients: number;
    maxStorage: number;
  };
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
  order: number;
  component: React.ComponentType<any>;
}

export default function FreeTrialOnboarding({ 
  onTrialStatusChange, 
  onOnboardingComplete 
}: FreeTrialOnboardingProps) {
  const [activeTab, setActiveTab] = useState('signup');
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Initialize onboarding steps
  useEffect(() => {
    const steps: OnboardingStep[] = [
      {
        id: 'account-setup',
        title: 'Account Setup',
        description: 'Complete your profile and company information',
        isCompleted: false,
        isRequired: true,
        order: 1,
        component: () => <div>Account Setup Component</div>
      },
      {
        id: 'company-info',
        title: 'Company Information',
        description: 'Add your company details and branding',
        isCompleted: false,
        isRequired: true,
        order: 2,
        component: () => <div>Company Info Component</div>
      },
      {
        id: 'first-quote',
        title: 'Create Your First Quote',
        description: 'Learn how to create and send quotes',
        isCompleted: false,
        isRequired: true,
        order: 3,
        component: () => <div>First Quote Component</div>
      },
      {
        id: 'client-management',
        title: 'Manage Clients',
        description: 'Add and organize your client database',
        isCompleted: false,
        isRequired: false,
        order: 4,
        component: () => <div>Client Management Component</div>
      },
      {
        id: 'templates',
        title: 'Customize Templates',
        description: 'Personalize your quote templates',
        isCompleted: false,
        isRequired: false,
        order: 5,
        component: () => <div>Templates Component</div>
      }
    ];
    setOnboardingSteps(steps);
  }, []);

  // Load trial information
  useEffect(() => {
    loadTrialInfo();
  }, []);

  const loadTrialInfo = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTrialInfo: TrialInfo = {
        id: 'trial_123',
        email: 'user@example.com',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        daysRemaining: 14,
        isActive: true,
        plan: 'free',
        features: ['Basic Quotes', 'Client Management', 'Email Support'],
        limitations: ['Max 10 quotes', 'Max 25 clients', 'Basic templates only'],
        usage: {
          quotesCreated: 3,
          clientsAdded: 8,
          storageUsed: 15.5,
          maxQuotes: 10,
          maxClients: 25,
          maxStorage: 100
        }
      };
      
      setTrialInfo(mockTrialInfo);
    } catch (error) {
      console.error('Failed to load trial info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrialSignup = async (email: string, companyName: string) => {
    setIsLoading(true);
    try {
      // Simulate API call for trial signup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTrialInfo: TrialInfo = {
        id: `trial_${Date.now()}`,
        email,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        daysRemaining: 14,
        isActive: true,
        plan: 'free',
        features: ['Basic Quotes', 'Client Management', 'Email Support'],
        limitations: ['Max 10 quotes', 'Max 25 clients', 'Basic templates only'],
        usage: {
          quotesCreated: 0,
          clientsAdded: 0,
          storageUsed: 0,
          maxQuotes: 10,
          maxClients: 25,
          maxStorage: 100
        }
      };
      
      setTrialInfo(newTrialInfo);
      setActiveTab('onboarding');
      onTrialStatusChange?.('active');
    } catch (error) {
      console.error('Trial signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingStepComplete = (stepId: string) => {
    const updatedSteps = onboardingSteps.map(step => 
      step.id === stepId ? { ...step, isCompleted: true } : step
    );
    setOnboardingSteps(updatedSteps);
    
    const newCompletedSteps = [...completedSteps, stepId];
    setCompletedSteps(newCompletedSteps);
    
    // Check if all required steps are completed
    const requiredSteps = updatedSteps.filter(step => step.isRequired);
    const completedRequiredSteps = requiredSteps.filter(step => step.isCompleted);
    
    if (completedRequiredSteps.length === requiredSteps.length) {
      onOnboardingComplete?.(newCompletedSteps);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setIsLoading(true);
    try {
      // Simulate upgrade API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (trialInfo) {
        const upgradedTrialInfo: TrialInfo = {
          ...trialInfo,
          plan: plan as any,
          isActive: true,
          daysRemaining: 999, // Unlimited
          features: ['Unlimited Quotes', 'Unlimited Clients', 'Premium Templates', 'Priority Support'],
          limitations: [],
          usage: {
            ...trialInfo.usage,
            maxQuotes: 999999,
            maxClients: 999999,
            maxStorage: 1000
          }
        };
        
        setTrialInfo(upgradedTrialInfo);
        setShowUpgradeModal(false);
        onTrialStatusChange?.('converted');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'signup', label: 'Trial Signup', icon: GiftIcon },
    { id: 'trial', label: 'Trial Management', icon: ClockIcon },
    { id: 'onboarding', label: 'Onboarding', icon: UserGroupIcon },
    { id: 'tutorials', label: 'Tutorials', icon: AcademicCapIcon },
    { id: 'limitations', label: 'Feature Limits', icon: ExclamationTriangleIcon },
    { id: 'upgrade', label: 'Upgrade', icon: ArrowUpIcon },
    { id: 'backup', label: 'Backup', icon: CloudArrowUpIcon }
  ];

  if (isLoading && !trialInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading trial information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Free Trial & Onboarding
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Get started with your free trial and complete the onboarding process
              </p>
            </div>
            
            {trialInfo && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trial Status</p>
                  <p className={`font-semibold ${
                    trialInfo.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trialInfo.isActive ? 'Active' : 'Expired'}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {trialInfo.daysRemaining}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowUpIcon className="h-4 w-4 mr-2" />
                  Upgrade
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trial Info Banner */}
        {trialInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Current Plan: {trialInfo.plan.charAt(0).toUpperCase() + trialInfo.plan.slice(1)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {trialInfo.features.join(', ')}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Usage</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Quotes:</span>
                    <span>{trialInfo.usage.quotesCreated}/{trialInfo.usage.maxQuotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clients:</span>
                    <span>{trialInfo.usage.clientsAdded}/{trialInfo.usage.maxClients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span>{trialInfo.usage.storageUsed}MB/{trialInfo.usage.maxStorage}MB</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Limitations</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {trialInfo.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-center">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-2 text-yellow-500" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'signup' && (
            <TrialSignupFlow 
              onSignup={handleTrialSignup}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'trial' && trialInfo && (
            <TrialPeriodManagement 
              trialInfo={trialInfo}
              onTrialUpdate={setTrialInfo}
            />
          )}
          
          {activeTab === 'onboarding' && (
            <GuidedOnboarding 
              steps={onboardingSteps}
              onStepComplete={handleOnboardingStepComplete}
              completedSteps={completedSteps}
            />
          )}
          
          {activeTab === 'tutorials' && (
            <TutorialHelpSystem />
          )}
          
          {activeTab === 'limitations' && trialInfo && (
            <TrialFeatureLimitations 
              trialInfo={trialInfo}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}
          
          {activeTab === 'upgrade' && (
            <UpgradePrompts 
              currentPlan={trialInfo?.plan || 'free'}
              onUpgrade={handleUpgrade}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'backup' && (
            <BackupRestore />
          )}
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upgrade Your Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose a plan that fits your needs and unlock unlimited features.
              </p>
              
              <div className="space-y-3 mb-6">
                {['basic', 'pro', 'enterprise'].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => handleUpgrade(plan)}
                    disabled={isLoading}
                    className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {plan} Plan
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {plan === 'basic' && 'Perfect for small businesses'}
                      {plan === 'pro' && 'Great for growing companies'}
                      {plan === 'enterprise' && 'For large organizations'}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
