import React, { useState } from 'react';
import { 
  CheckIcon, 
  StarIcon, 
  ArrowUpIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface UpgradePromptsProps {
  currentPlan: string;
  onUpgrade: (plan: string) => Promise<void>;
  isLoading: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

export default function UpgradePrompts({ 
  currentPlan, 
  onUpgrade, 
  isLoading 
}: UpgradePromptsProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingCycle === 'monthly' ? 29 : 290,
      billing: billingCycle,
      description: 'Perfect for small businesses and freelancers',
      features: [
        'Unlimited quotes',
        'Unlimited clients',
        '500MB storage',
        'Basic templates',
        'Email support',
        'Basic analytics'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: billingCycle === 'monthly' ? 79 : 790,
      billing: billingCycle,
      description: 'Great for growing companies and teams',
      features: [
        'Everything in Basic',
        '2GB storage',
        'Premium templates',
        'Advanced analytics',
        'Priority support',
        'Team collaboration',
        'Custom branding',
        'API access'
      ],
      popular: true,
      savings: billingCycle === 'yearly' ? 'Save $158/year' : undefined
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 199 : 1990,
      billing: billingCycle,
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Professional',
        '10GB+ storage',
        'Custom templates',
        'Advanced workflows',
        'Dedicated support',
        'White-label options',
        'Advanced security',
        'Custom integrations'
      ],
      savings: billingCycle === 'yearly' ? 'Save $398/year' : undefined
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = async () => {
    if (selectedPlan) {
      await onUpgrade(selectedPlan);
    }
  };

  const getCurrentPlanDisplay = () => {
    return currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <ArrowUpIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upgrade Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Unlock unlimited features and take your business to the next level
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Current Plan: <span className="font-medium text-gray-900 dark:text-white">{getCurrentPlanDisplay()}</span>
          </span>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose Your Billing Cycle
          </h3>
          
          <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all duration-200 ${
              selectedPlan === plan.id
                ? 'border-blue-500 dark:border-blue-400 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${plan.popular ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  <StarIcon className="h-3 w-3 mr-1" />
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{plan.billing === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                
                {plan.savings && (
                  <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                    {plan.savings}
                  </span>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isLoading || currentPlan === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-default'
                    : selectedPlan === plan.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade Button */}
      {selectedPlan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Upgrade?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You've selected the <span className="font-medium">{plans.find(p => p.id === selectedPlan)?.name}</span> plan
            </p>
            
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Upgrade Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 text-center">
          Why Upgrade?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Unlimited Growth</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Remove all limitations and scale your business without restrictions
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Premium Features</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Access advanced tools and premium templates to stand out
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Priority Support</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Get faster support and dedicated assistance when you need it
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Can I change my plan later?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Is there a setup fee?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No setup fees. You only pay the monthly or yearly subscription cost.
            </p>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              What happens to my data if I downgrade?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your data is safe. You'll have access to existing data but may hit limits on new content.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Do you offer refunds?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We offer a 30-day money-back guarantee for all paid plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
