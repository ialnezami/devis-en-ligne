import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  CogIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { QuotationData, QuotationFormItem } from '@/types/quotationEditing';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const QuotationEditor: React.FC = () => {
  const [formData, setFormData] = useState<QuotationData>({
    quotationNumber: '',
    title: '',
    description: '',
    projectType: 'service',
    client: {
      name: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isShippingAddress: true,
        isBillingAddress: true
      }
    },
    issueDate: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currency: 'USD',
    language: 'en',
    items: [],
    services: [],
    subtotal: 0,
    discount: { type: 'percentage', value: 0, conditions: [], isApproved: true },
    tax: { rate: 8.5, amount: 0, isInclusive: false, breakdown: [], isCompound: false },
    total: 0,
    terms: 'Standard terms and conditions apply',
    notes: '',
    specialConditions: [],
    timeline: {
      estimatedDuration: 30,
      durationUnit: 'days',
      milestones: [],
      dependencies: [],
      constraints: [],
      isFlexible: true,
      bufferDays: 5
    },
    paymentTerms: {
      netDays: 30,
      acceptedPaymentMethods: ['bank_transfer'],
      currency: 'USD',
      isFixedRate: true,
      depositRequired: false
    },
    attachments: [],
    relatedDocuments: [],
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

  const [activeTab, setActiveTab] = useState<'basic' | 'items' | 'pricing' | 'preview'>('basic');

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: DocumentTextIcon },
    { id: 'items', name: 'Items & Services', icon: CogIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'preview', name: 'Preview', icon: DocumentTextIcon }
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

  const addItem = () => {
    const newItem: QuotationFormItem = {
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
    const itemsTotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    const subtotal = itemsTotal;
    const discountAmount = formData.discount.type === 'percentage' 
      ? subtotal * formData.discount.value / 100 
      : formData.discount.value;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * formData.tax.rate / 100;
    const total = afterDiscount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax: { ...prev.tax, amount: taxAmount },
      total
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discount, formData.tax.rate]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
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
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'items':
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
              {formData.items.map((item) => (
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
        
      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Pricing Configuration</h3>
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
                <h3 className="text-lg font-medium mb-4">Pricing Summary</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(formData.subtotal, formData.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(formData.tax.amount, formData.currency)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(formData.total, formData.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Quotation Preview
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Review your quotation details below.
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
                    <span className="font-medium text-lg">{formatCurrency(formData.total, formData.currency)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Actions</h4>
                <div className="space-y-3">
                  <Button className="w-full">
                    Send Quotation
                  </Button>
                  <Button variant="outline" className="w-full">
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Draft
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
          Quotation Editor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and edit professional quotations
        </p>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {(() => {
              const Icon = tabs.find(t => t.id === activeTab)?.icon || DocumentTextIcon;
              return <Icon className="h-5 w-5" />;
            })()}
            <span>{tabs.find(t => t.id === activeTab)?.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationEditor;
