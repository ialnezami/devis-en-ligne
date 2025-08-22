import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  UserIcon,
  CogIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { QuotationFormData, QuotationItem, QuotationService } from '@/types/quotationCreation';

const QuotationCreationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuotationFormData>({
    quotationNumber: '',
    title: '',
    description: '',
    projectType: 'service',
    client: {
      name: '',
      email: '',
      company: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    issueDate: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currency: 'USD',
    language: 'en',
    items: [],
    services: [],
    subtotal: 0,
    discount: { type: 'percentage', value: 0 },
    tax: { rate: 8.5, amount: 0, isInclusive: false, breakdown: [] },
    total: 0,
    terms: '',
    notes: '',
    timeline: {
      estimatedDuration: 30,
      durationUnit: 'days',
      milestones: []
    },
    paymentTerms: {
      netDays: 30,
      depositRequired: false
    },
    attachments: [],
    relatedDocuments: [],
    status: 'draft',
    approvalWorkflow: [],
    tags: [],
    category: '',
    priority: 'medium',
    source: 'manual',
    autoCalculate: true,
    includeTax: true,
    sendEmail: false,
    trackViews: true,
    allowComments: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '',
    lastModifiedBy: '',
    versionHistory: []
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: DocumentTextIcon, description: 'Quotation details and client information' },
    { id: 2, title: 'Items & Services', icon: CogIcon, description: 'Add products, services, and pricing' },
    { id: 3, title: 'Pricing & Terms', icon: CurrencyDollarIcon, description: 'Set pricing, discounts, and payment terms' },
    { id: 4, title: 'Timeline & Delivery', icon: CalendarIcon, description: 'Project timeline and milestones' },
    { id: 5, title: 'Review & Send', icon: CheckCircleIcon, description: 'Review and send quotation' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        address: {
          ...prev.client.address,
          [field]: value
        }
      }
    }));
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: '',
      quantity: 1,
      unit: 'piece',
      unitPrice: 0,
      total: 0,
      isCustom: false,
      availability: 'in-stock'
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculateTotals = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const servicesTotal = formData.services.reduce((sum, service) => sum + service.total, 0);
    const subtotal = itemsTotal + servicesTotal;
    
    let discountAmount = 0;
    if (formData.discount.type === 'percentage') {
      discountAmount = subtotal * (formData.discount.value / 100);
    } else {
      discountAmount = formData.discount.value;
    }
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (formData.tax.rate / 100);
    const total = afterDiscount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax: { ...prev.tax, amount: taxAmount },
      total
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Quotation Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quotation Number</label>
                    <Input
                      value={formData.quotationNumber}
                      onChange={(e) => handleInputChange('quotationNumber', e.target.value)}
                      placeholder="Q-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Project quotation title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief project description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Type</label>
                    <Select
                      options={[
                        { value: 'service', label: 'Service' },
                        { value: 'product', label: 'Product' },
                        { value: 'consulting', label: 'Consulting' },
                        { value: 'maintenance', label: 'Maintenance' },
                        { value: 'custom', label: 'Custom' }
                      ]}
                      value={{ value: formData.projectType, label: formData.projectType.charAt(0).toUpperCase() + formData.projectType.slice(1) }}
                      onChange={(option) => handleInputChange('projectType', option?.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Client Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Client Name</label>
                    <Input
                      value={formData.client.name}
                      onChange={(e) => handleClientChange('name', e.target.value)}
                      placeholder="Client full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.client.email}
                      onChange={(e) => handleClientChange('email', e.target.value)}
                      placeholder="client@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <Input
                      value={formData.client.company}
                      onChange={(e) => handleClientChange('company', e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={formData.client.phone}
                      onChange={(e) => handleClientChange('phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Items & Services</h3>
              <Button onClick={addItem} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="Item name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Qty</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Unit Price</label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Total</label>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CogIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>No items added yet. Click "Add Item" to get started.</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Pricing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <Select
                      options={[
                        { value: 'USD', label: 'US Dollar (USD)' },
                        { value: 'EUR', label: 'Euro (EUR)' },
                        { value: 'GBP', label: 'British Pound (GBP)' }
                      ]}
                      value={{ value: formData.currency, label: formData.currency }}
                      onChange={(option) => handleInputChange('currency', option?.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                    <Select
                      options={[
                        { value: 'percentage', label: 'Percentage' },
                        { value: 'fixed', label: 'Fixed Amount' }
                      ]}
                      value={{ value: formData.discount.type, label: formData.discount.type.charAt(0).toUpperCase() + formData.discount.type.slice(1) }}
                      onChange={(option) => handleInputChange('discount', { ...formData.discount, type: option?.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Value</label>
                    <Input
                      type="number"
                      value={formData.discount.value}
                      onChange={(e) => handleInputChange('discount', { ...formData.discount, value: parseFloat(e.target.value) })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                    <Input
                      type="number"
                      value={formData.tax.rate}
                      onChange={(e) => handleInputChange('tax', { ...formData.tax, rate: parseFloat(e.target.value) })}
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Payment Terms</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Net Days</label>
                    <Input
                      type="number"
                      value={formData.paymentTerms.netDays}
                      onChange={(e) => handleInputChange('paymentTerms', { ...formData.paymentTerms, netDays: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.paymentTerms.depositRequired}
                      onChange={(e) => handleInputChange('paymentTerms', { ...formData.paymentTerms, depositRequired: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm font-medium">Require deposit</label>
                  </div>
                  {formData.paymentTerms.depositRequired && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Deposit Percentage</label>
                      <Input
                        type="number"
                        value={formData.paymentTerms.depositPercentage || 0}
                        onChange={(e) => handleInputChange('paymentTerms', { ...formData.paymentTerms, depositPercentage: parseFloat(e.target.value) })}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Pricing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${(formData.discount.type === 'percentage' ? formData.subtotal * formData.discount.value / 100 : formData.discount.value).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${formData.tax.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${formData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Project Timeline</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Duration</label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        value={formData.timeline.estimatedDuration}
                        onChange={(e) => handleInputChange('timeline', { ...formData.timeline, estimatedDuration: parseInt(e.target.value) })}
                        min="1"
                      />
                      <Select
                        options={[
                          { value: 'days', label: 'Days' },
                          { value: 'weeks', label: 'Weeks' },
                          { value: 'months', label: 'Months' }
                        ]}
                        value={{ value: formData.timeline.durationUnit, label: formData.timeline.durationUnit.charAt(0).toUpperCase() + formData.timeline.durationUnit.slice(1) }}
                        onChange={(option) => handleInputChange('timeline', { ...formData.timeline, durationUnit: option?.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Terms & Conditions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Terms</label>
                    <textarea
                      value={formData.terms}
                      onChange={(e) => handleInputChange('terms', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Standard terms and conditions..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Ready to Send
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Review your quotation details below. Once you're satisfied, you can send it to your client.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Quotation Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Number:</span>
                    <span className="font-medium">{formData.quotationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Title:</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Client:</span>
                    <span className="font-medium">{formData.client.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-medium text-lg">${formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Actions</h4>
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Send Quotation
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Quotation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Step-by-step quotation creation wizard
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.id <= currentStep 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <steps[currentStep - 1].icon className="h-5 w-5" />
            <span>{steps[currentStep - 1].title}</span>
            <Badge variant="outline" size="sm">
              Step {currentStep} of {steps.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            Save Draft
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationCreationWizard;
