import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  LockClosedIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface TrialToPaidConversionProps {
  onConversionComplete?: (planDetails: any) => void;
}

interface ConversionStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
}

export default function TrialToPaidConversion({ 
  onConversionComplete 
}: TrialToPaidConversionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [conversionData, setConversionData] = useState({
    plan: '',
    billingCycle: 'monthly',
    paymentMethod: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    agreeToTerms: false,
    agreeToBilling: false
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: ConversionStep[] = [
    {
      id: 'plan-selection',
      title: 'Choose Your Plan',
      description: 'Select the plan that best fits your needs',
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'payment-setup',
      title: 'Payment Information',
      description: 'Enter your payment details securely',
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'billing-address',
      title: 'Billing Address',
      description: 'Provide your billing information',
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'review-confirm',
      title: 'Review & Confirm',
      description: 'Review your selection and complete conversion',
      isCompleted: false,
      isRequired: true
    }
  ];

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: conversionData.billingCycle === 'monthly' ? 29 : 290,
      description: 'Perfect for small businesses and freelancers',
      features: [
        'Unlimited quotes',
        'Unlimited clients',
        '500MB storage',
        'Basic templates',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: conversionData.billingCycle === 'monthly' ? 79 : 790,
      description: 'Great for growing companies and teams',
      features: [
        'Everything in Basic',
        '2GB storage',
        'Premium templates',
        'Advanced analytics',
        'Priority support',
        'Team collaboration'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: conversionData.billingCycle === 'monthly' ? 199 : 1990,
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Professional',
        '10GB+ storage',
        'Custom templates',
        'Advanced workflows',
        'Dedicated support',
        'White-label options'
      ]
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setConversionData(prev => ({ ...prev, plan: planId }));
    setCurrentStep(1);
    updateStepCompletion(0, true);
  };

  const handlePaymentSubmit = () => {
    setCurrentStep(2);
    updateStepCompletion(1, true);
  };

  const handleBillingSubmit = () => {
    setCurrentStep(3);
    updateStepCompletion(2, true);
  };

  const updateStepCompletion = (stepIndex: number, isCompleted: boolean) => {
    const updatedSteps = steps.map((step, index) => 
      index === stepIndex ? { ...step, isCompleted } : step
    );
    // In a real app, you would update the steps state
  };

  const handleConversion = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call for conversion
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      updateStepCompletion(3, true);
      onConversionComplete?.(conversionData);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return conversionData.plan !== '';
      case 1:
        return conversionData.paymentMethod.cardNumber && 
               conversionData.paymentMethod.expiryDate && 
               conversionData.paymentMethod.cvv && 
               conversionData.paymentMethod.cardholderName;
      case 2:
        return conversionData.billingAddress.firstName && 
               conversionData.billingAddress.lastName && 
               conversionData.billingAddress.address && 
               conversionData.billingAddress.city && 
               conversionData.billingAddress.zipCode;
      case 3:
        return conversionData.agreeToTerms && conversionData.agreeToBilling;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Choose Your Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select the plan that best fits your business needs
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setConversionData(prev => ({ ...prev, billingCycle: 'monthly' }))}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    conversionData.billingCycle === 'monthly'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setConversionData(prev => ({ ...prev, billingCycle: 'yearly' }))}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    conversionData.billingCycle === 'yearly'
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

            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                    conversionData.plan === plan.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {plan.description}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        /{conversionData.billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      conversionData.plan === plan.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {conversionData.plan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Payment Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your payment information is encrypted and secure
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={conversionData.paymentMethod.cardNumber}
                  onChange={(e) => setConversionData(prev => ({
                    ...prev,
                    paymentMethod: { ...prev.paymentMethod, cardNumber: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={conversionData.paymentMethod.expiryDate}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      paymentMethod: { ...prev.paymentMethod, expiryDate: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={conversionData.paymentMethod.cvv}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      paymentMethod: { ...prev.paymentMethod, cvv: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={conversionData.paymentMethod.cardholderName}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      paymentMethod: { ...prev.paymentMethod, cardholderName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Billing Address
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This address will be used for billing purposes
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={conversionData.billingAddress.firstName}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, firstName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={conversionData.billingAddress.lastName}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, lastName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  value={conversionData.billingAddress.company}
                  onChange={(e) => setConversionData(prev => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, company: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={conversionData.billingAddress.address}
                  onChange={(e) => setConversionData(prev => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, address: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={conversionData.billingAddress.city}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, city: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={conversionData.billingAddress.state}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, state: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={conversionData.billingAddress.zipCode}
                    onChange={(e) => setConversionData(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, zipCode: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Review & Confirm
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review your selection before completing the conversion
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Plan Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Selected Plan</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {plans.find(p => p.id === conversionData.plan)?.name} Plan
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${plans.find(p => p.id === conversionData.plan)?.price}/
                    {conversionData.billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={conversionData.agreeToTerms}
                      onChange={(e) => setConversionData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={conversionData.agreeToBilling}
                      onChange={(e) => setConversionData(prev => ({ ...prev, agreeToBilling: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I authorize recurring billing for the selected plan
                    </span>
                  </label>
                </div>
              </div>

              {/* Conversion Button */}
              <div className="text-center">
                <button
                  onClick={handleConversion}
                  disabled={!canProceed() || isProcessing}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Complete Conversion
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-8">
            {steps.map((step, stepIdx) => {
              const isActive = stepIdx === currentStep;
              const isCompleted = step.isCompleted;
              
              return (
                <li key={step.id} className="relative">
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-8 -ml-px h-0.5 w-16 bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  <div className="relative flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{stepIdx + 1}</span>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${
                        isCompleted 
                          ? 'text-green-600 dark:text-green-400'
                          : isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {renderStepContent()}
      </div>
    </div>
  );
}
