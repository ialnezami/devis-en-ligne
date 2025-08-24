import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  CheckIcon, 
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon,
  RocketLaunchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Professional Quotations',
      description: 'Create beautiful, detailed quotations in minutes with our intuitive interface.',
      color: 'blue'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Track your business performance with comprehensive reporting and insights.',
      color: 'green'
    },
    {
      icon: UserGroupIcon,
      title: 'Client Management',
      description: 'Manage your clients efficiently with our integrated CRM system.',
      color: 'purple'
    },
    {
      icon: CogIcon,
      title: 'Customizable Templates',
      description: 'Use pre-built templates or create your own to match your brand.',
      color: 'orange'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechCorp',
      company: 'TechCorp Solutions',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Quotation Tool has transformed how we handle client proposals. It\'s a game-changer!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Sales Director',
      company: 'Innovate Marketing',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'We\'ve increased our proposal win rate by 40% since using this platform.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Freelance Consultant',
      company: 'ER Consulting',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'The templates are beautiful and save me hours of work. Highly recommended!',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      monthlyPrice: 29,
      annualPrice: 290,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Perfect for small businesses',
      features: [
        'Up to 100 quotations/month',
        'Basic templates',
        'Email support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      name: 'Professional',
      monthlyPrice: 79,
      annualPrice: 790,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Ideal for growing companies',
      features: [
        'Unlimited quotations',
        'Premium templates',
        'Priority support',
        'Advanced analytics',
        'Custom branding'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      monthlyPrice: 199,
      annualPrice: 1990,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Multi-user access',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  const getCurrentPrice = (plan: any) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getMonthlyEquivalent = (plan: any) => {
    if (billingCycle === 'monthly') return plan.monthlyPrice;
    return Math.round(plan.annualPrice / 12);
  };

  const getSavings = (plan: any) => {
    if (billingCycle === 'monthly') return 0;
    const annualTotal = plan.monthlyPrice * 12;
    const savings = annualTotal - plan.annualPrice;
    return Math.round((savings / annualTotal) * 100);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail) {
      setWaitlistSubmitted(true);
      // Here you would typically send the email to your backend
      console.log('Waitlist signup:', waitlistEmail);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'contact':
        return (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h2 className="text-4xl font-bold text-center mb-12">Contact Us</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                    <span>hello@quotationtool.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                    <span>123 Business St, Suite 100<br />New York, NY 10001</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 text-center mb-8">Choose the plan that fits your business needs</p>
            
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Annual
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Save up to 17%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-8 border rounded-2xl ${
                    plan.popular
                      ? 'border-blue-500 shadow-lg scale-105'
                      : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {/* Annual Savings Badge */}
                  {billingCycle === 'annual' && getSavings(plan) > 0 && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Save {getSavings(plan)}%
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <div className="text-4xl font-bold text-blue-600">
                        ${getCurrentPrice(plan)}
                        <span className="text-lg text-gray-500 font-normal">{plan.period}</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-sm text-gray-500 mt-1">
                          ${getMonthlyEquivalent(plan)}/month when billed annually
                        </p>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3">
                        <CheckIcon className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                All plans include a 14-day free trial. No credit card required.
              </p>
              <p className="text-sm text-gray-500">
                Need a custom plan? <a href="#" className="text-blue-600 hover:underline">Contact our sales team</a>
              </p>
            </div>
          </div>
        );

      case 'information':
        return (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h2 className="text-4xl font-bold text-center mb-12">About Our Platform</h2>
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-semibold mb-4">What is Quotation Tool?</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Quotation Tool is a comprehensive business solution designed to streamline the quotation 
                  and proposal process. Our platform helps businesses create professional, accurate, and 
                  compelling quotations that win more deals and improve client relationships.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">Time Savings</h4>
                    <p className="text-gray-600">Reduce quotation creation time from hours to minutes</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">Professional Appearance</h4>
                    <p className="text-gray-600">Consistent, branded quotations that impress clients</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">Better Tracking</h4>
                    <p className="text-gray-600">Monitor quotation status and conversion rates</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">Integration Ready</h4>
                    <p className="text-gray-600">Works with your existing business tools</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Create</h4>
                    <p className="text-gray-600">Use our templates or start from scratch</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Customize</h4>
                    <p className="text-gray-600">Add your products, services, and pricing</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Send</h4>
                    <p className="text-gray-600">Deliver professional quotations to your clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
              <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Now in Beta - Join the Waitlist
                  </div>
                  <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                    Create Professional
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Quotations</span>
                    <br />in Minutes
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Streamline your business with our powerful quotation tool. Create beautiful, 
                    detailed proposals that win more deals and impress your clients.
                  </p>
                  
                  {/* Waitlist Form */}
                  <div className="max-w-md mx-auto mb-8">
                    {!waitlistSubmitted ? (
                      <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Join Waitlist
                        </button>
                      </form>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium">🎉 You're on the waitlist! We'll notify you when we launch.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/demo"
                      className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center shadow-lg hover:shadow-xl"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Watch Demo
                    </Link>
                    <Link
                      to="/register"
                      className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors hover:bg-gray-50"
                    >
                      Get Started Free
                    </Link>
                  </div>
                </div>

                {/* Hero Stats */}
                <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                    <div className="text-gray-600">Businesses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                    <div className="text-gray-600">Quotations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                    <div className="text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Quotation Tool?</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Built for modern businesses who want to look professional and close more deals
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => (
                    <div key={feature.title} className="text-center group">
                      <div className={`bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`h-10 w-10 text-${feature.color}-600`} />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Proof Section */}
            <div className="py-24 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
                  <p className="text-xl text-gray-600">See what our customers are saying</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.name} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="flex space-x-1 mr-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                      <div className="flex items-center">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full mr-4"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-8">
                    Join thousands of businesses already using Quotation Tool
                  </p>
                  <div className="flex justify-center items-center space-x-8 text-gray-400">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 mr-2" />
                      <span>Enterprise Security</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>99.9% Uptime</span>
                    </div>
                    <div className="flex items-center">
                      <RocketLaunchIcon className="h-5 w-5 mr-2" />
                      <span>Lightning Fast</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">QuotationTool</h1>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveSection('home')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('information')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'information'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Information
              </button>
              <button
                onClick={() => setActiveSection('pricing')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'pricing'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'contact'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">QuotationTool</h3>
              <p className="text-gray-400">
                The professional quotation solution for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QuotationTool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
