import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { 
  PaintBrushIcon, 
  DocumentDuplicateIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  HeartIcon,
  BuildingOfficeIcon,
  PaletteIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  CompanyBranding, 
  EstimateTemplate, 
  EstimateCategory,
  EstimatePersonalization,
  BrandConsistency
} from '@/types/customizableEstimates';
import { cn, formatCurrency } from '@/lib/utils';

// Mock data for demonstration
const mockCompanyBranding: CompanyBranding = {
  id: '1',
  companyName: 'Acme Solutions',
  logo: {
    url: '/logo.png',
    altText: 'Acme Solutions Logo',
    size: 'medium',
    position: 'left'
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    text: '#1f2937',
    background: '#ffffff',
    border: '#e5e7eb'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    accent: 'Inter'
  },
  contactInfo: {
    address: '123 Business St, Tech City, TC 12345',
    phone: '+1-555-0123',
    email: 'hello@acmesolutions.com',
    website: 'www.acmesolutions.com',
    socialMedia: {
      linkedin: 'linkedin.com/company/acme-solutions',
      twitter: '@acmesolutions'
    }
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockTemplates: EstimateTemplate[] = [
  {
    id: '1',
    name: 'Professional Service',
    description: 'Clean and professional template for service-based businesses',
    category: {} as EstimateCategory,
    industry: 'Technology',
    isDefault: true,
    isPublic: true,
    isActive: true,
    sections: [],
    styling: {
      layout: 'professional',
      theme: 'light',
      spacing: 'comfortable',
      borders: 'subtle',
      shadows: 'subtle',
      animations: false
    },
    defaults: {
      terms: 'Standard terms and conditions apply',
      notes: 'Thank you for your business',
      validUntil: 30,
      currency: 'USD',
      language: 'en',
      includeTax: true,
      taxRate: 8.5,
      paymentTerms: 'Net 30'
    },
    pricing: {} as any,
    branding: mockCompanyBranding,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    usageCount: 45,
    rating: 4.8,
    reviews: []
  },
  {
    id: '2',
    name: 'Creative Agency',
    description: 'Modern and creative template for design and marketing agencies',
    category: {} as EstimateCategory,
    industry: 'Creative',
    isDefault: false,
    isPublic: true,
    isActive: true,
    sections: [],
    styling: {
      layout: 'creative',
      theme: 'light',
      spacing: 'spacious',
      borders: 'none',
      shadows: 'prominent',
      animations: true
    },
    defaults: {
      terms: 'Creative work terms and conditions',
      notes: 'Let\'s create something amazing together',
      validUntil: 14,
      currency: 'USD',
      language: 'en',
      includeTax: true,
      taxRate: 8.5,
      paymentTerms: 'Net 15'
    },
    pricing: {} as any,
    branding: mockCompanyBranding,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    usageCount: 23,
    rating: 4.6,
    reviews: []
  },
  {
    id: '3',
    name: 'Consulting Services',
    description: 'Professional template for consulting and advisory services',
    category: {} as EstimateCategory,
    industry: 'Consulting',
    isDefault: false,
    isPublic: true,
    isActive: true,
    sections: [],
    styling: {
      layout: 'classic',
      theme: 'light',
      spacing: 'compact',
      borders: 'prominent',
      shadows: 'none',
      animations: false
    },
    defaults: {
      terms: 'Consulting service terms and conditions',
      notes: 'Professional consulting services',
      validUntil: 60,
      currency: 'USD',
      language: 'en',
      includeTax: true,
      taxRate: 8.5,
      paymentTerms: 'Net 45'
    },
    pricing: {} as any,
    branding: mockCompanyBranding,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    usageCount: 18,
    rating: 4.9,
    reviews: []
  }
];

const mockCategories: EstimateCategory[] = [
  {
    id: '1',
    name: 'Technology',
    description: 'Software development, IT services, and tech consulting',
    icon: '💻',
    color: '#3b82f6',
    industry: 'Technology',
    subcategories: [],
    templates: []
  },
  {
    id: '2',
    name: 'Creative',
    description: 'Design, marketing, and creative services',
    icon: '🎨',
    color: '#f59e0b',
    industry: 'Creative',
    subcategories: [],
    templates: []
  },
  {
    id: '3',
    name: 'Consulting',
    description: 'Business consulting and advisory services',
    icon: '📊',
    color: '#10b981',
    industry: 'Consulting',
    subcategories: [],
    templates: []
  },
  {
    id: '4',
    name: 'Construction',
    description: 'Construction and renovation services',
    icon: '🏗️',
    color: '#ef4444',
    industry: 'Construction',
    subcategories: [],
    templates: []
  }
];

const CustomizableEstimates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branding' | 'templates' | 'personalization' | 'compliance'>('branding');
  const [selectedTemplate, setSelectedTemplate] = useState<EstimateTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [branding, setBranding] = useState<CompanyBranding>(mockCompanyBranding);
  const [templates, setTemplates] = useState<EstimateTemplate[]>(mockTemplates);
  const [categories, setCategories] = useState<EstimateCategory[]>(mockCategories);

  const tabs = [
    { id: 'branding', name: 'Branding', icon: PaintBrushIcon },
    { id: 'templates', name: 'Templates', icon: DocumentDuplicateIcon },
    { id: 'personalization', name: 'Personalization', icon: CogIcon },
    { id: 'compliance', name: 'Compliance', icon: CheckCircleIcon }
  ];

  const getTemplateLayoutIcon = (layout: string) => {
    switch (layout) {
      case 'modern': return '✨';
      case 'classic': return '📜';
      case 'minimal': return '⚪';
      case 'creative': return '🎨';
      case 'professional': return '💼';
      default: return '📄';
    }
  };

  const getTemplateLayoutColor = (layout: string) => {
    switch (layout) {
      case 'modern': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'classic': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'minimal': return 'bg-white text-gray-800 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700';
      case 'creative': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'professional': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTemplatePreview = (template: EstimateTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleBrandingEdit = () => {
    setShowBrandingModal(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Customizable Estimates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Build your brand and create professional estimate templates
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="lg">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Import Templates
          </Button>
          <Button size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Company Branding */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <span>Company Branding</span>
                </CardTitle>
                <Button onClick={handleBrandingEdit}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Branding
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logo and Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {branding.companyName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {branding.companyName}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {branding.contactInfo.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Address:</span>
                      <span className="text-gray-900 dark:text-white">{branding.contactInfo.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                      <span className="text-gray-900 dark:text-white">{branding.contactInfo.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Website:</span>
                      <span className="text-gray-900 dark:text-white">{branding.contactInfo.website}</span>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Brand Colors</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg mx-auto mb-2"
                        style={{ backgroundColor: branding.colors.primary }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Primary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg mx-auto mb-2"
                        style={{ backgroundColor: branding.colors.secondary }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Secondary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg mx-auto mb-2"
                        style={{ backgroundColor: branding.colors.accent }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Accent</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Heading Font:</span>
                      <span className="text-gray-900 dark:text-white">{branding.fonts.heading}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Body Font:</span>
                      <span className="text-gray-900 dark:text-white">{branding.fonts.body}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PaletteIcon className="h-5 w-5" />
                <span>Brand Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <PhotoIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Logo Usage</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Guidelines for proper logo placement and sizing
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <PaletteIcon className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Color Usage</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Color combinations and restrictions
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Typography</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Font usage and text hierarchy
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CogIcon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Spacing</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Layout spacing and margins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Template Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Template Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary cursor-pointer transition-colors"
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTemplateLayoutIcon(template.styling.layout)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {template.description}
                            </p>
                          </div>
                        </div>
                        {template.isDefault && (
                          <Badge variant="success" size="sm">Default</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Layout:</span>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getTemplateLayoutColor(template.styling.layout)
                          )}>
                            {template.styling.layout}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Usage:</span>
                          <span className="text-gray-900 dark:text-white">{template.usageCount} times</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-gray-900 dark:text-white">{template.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleTemplatePreview(template)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <HeartIcon className="h-4 w-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'personalization' && (
        <div className="space-y-6">
          {/* Personal Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Default Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Default Template</label>
                      <Select
                        options={templates.map(t => ({ value: t.id, label: t.name }))}
                        value={templates.find(t => t.isDefault) ? { value: templates.find(t => t.isDefault)!.id, label: templates.find(t => t.isDefault)!.name } : undefined}
                        placeholder="Select template"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Default Currency</label>
                      <Select
                        options={[
                          { value: 'USD', label: 'US Dollar (USD)' },
                          { value: 'EUR', label: 'Euro (EUR)' },
                          { value: 'GBP', label: 'British Pound (GBP)' }
                        ]}
                        value={{ value: 'USD', label: 'US Dollar (USD)' }}
                        placeholder="Select currency"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Default Language</label>
                      <Select
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Spanish' },
                          { value: 'fr', label: 'French' }
                        ]}
                        value={{ value: 'en', label: 'English' }}
                        placeholder="Select language"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Automation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Auto-save drafts</span>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Include tax by default</span>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Add custom fields to your estimates for industry-specific requirements
                  </p>
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Project Reference</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Internal project reference number
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Contract Type</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Type of contract or agreement
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Delivery Date</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Expected delivery or completion date
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Industry Standards */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Standards & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Legal Requirements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Tax calculation compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Payment terms disclosure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Terms and conditions</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Accessibility</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">WCAG 2.1 AA compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Screen reader support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">High contrast support</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800 dark:text-green-200">Compliant</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All templates meet industry standards
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Updates Available</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    2 templates have minor updates
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">Review Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    1 template needs compliance review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Preview Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={`Template Preview - ${selectedTemplate?.name}`}
        size="4xl"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="font-medium">{selectedTemplate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Layout:</span>
                    <span className="font-medium capitalize">{selectedTemplate.styling.layout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Theme:</span>
                    <span className="font-medium capitalize">{selectedTemplate.styling.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Spacing:</span>
                    <span className="font-medium capitalize">{selectedTemplate.styling.spacing}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Default Settings</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Currency:</span>
                    <span className="font-medium">{selectedTemplate.defaults.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Valid Until:</span>
                    <span className="font-medium">{selectedTemplate.defaults.validUntil} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tax Rate:</span>
                    <span className="font-medium">{selectedTemplate.defaults.taxRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Payment Terms:</span>
                    <span className="font-medium">{selectedTemplate.defaults.paymentTerms}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                  Close
                </Button>
                <Button>
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Branding Edit Modal */}
      <Modal
        isOpen={showBrandingModal}
        onClose={() => setShowBrandingModal(false)}
        title="Edit Company Branding"
        size="4xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Branding customization interface would go here with color pickers, font selectors, and logo upload.
          </p>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowBrandingModal(false)}>
                Cancel
              </Button>
              <Button>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomizableEstimates;
