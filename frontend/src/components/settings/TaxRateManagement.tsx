import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon,
  GlobeAltIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

interface TaxRateManagementProps {
  onSettingsChange: () => void;
}

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  country: string;
  state?: string;
  isActive: boolean;
  description?: string;
  effectiveDate: string;
  endDate?: string;
  category: 'sales' | 'vat' | 'gst' | 'custom';
}

export default function TaxRateManagement({ onSettingsChange }: TaxRateManagementProps) {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');

  // Load tax rates on component mount
  useEffect(() => {
    loadTaxRates();
  }, []);

  const loadTaxRates = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - replace with actual data from API
      const mockTaxRates: TaxRate[] = [
        {
          id: '1',
          name: 'US Sales Tax - California',
          rate: 7.25,
          type: 'percentage',
          country: 'United States',
          state: 'CA',
          isActive: true,
          description: 'Standard sales tax rate for California',
          effectiveDate: '2024-01-01',
          category: 'sales'
        },
        {
          id: '2',
          name: 'US Sales Tax - New York',
          rate: 8.875,
          type: 'percentage',
          country: 'United States',
          state: 'NY',
          isActive: true,
          description: 'Combined state and local sales tax for New York',
          effectiveDate: '2024-01-01',
          category: 'sales'
        },
        {
          id: '3',
          name: 'EU VAT - Germany',
          rate: 19,
          type: 'percentage',
          country: 'Germany',
          isActive: true,
          description: 'Standard VAT rate for Germany',
          effectiveDate: '2024-01-01',
          category: 'vat'
        },
        {
          id: '4',
          name: 'EU VAT - France',
          rate: 20,
          type: 'percentage',
          country: 'France',
          isActive: true,
          description: 'Standard VAT rate for France',
          effectiveDate: '2024-01-01',
          category: 'vat'
        },
        {
          id: '5',
          name: 'Canada GST',
          rate: 5,
          type: 'percentage',
          country: 'Canada',
          isActive: true,
          description: 'Goods and Services Tax for Canada',
          effectiveDate: '2024-01-01',
          category: 'gst'
        }
      ];
      
      setTaxRates(mockTaxRates);
    } catch (error) {
      console.error('Failed to load tax rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTaxRate = (taxRate: Omit<TaxRate, 'id'>) => {
    const newTaxRate: TaxRate = {
      ...taxRate,
      id: Date.now().toString()
    };
    
    setTaxRates(prev => [...prev, newTaxRate]);
    setShowAddForm(false);
    onSettingsChange();
  };

  const handleEditTaxRate = (taxRate: TaxRate) => {
    setTaxRates(prev => prev.map(tr => tr.id === taxRate.id ? taxRate : tr));
    setEditingTaxRate(null);
    onSettingsChange();
  };

  const handleDeleteTaxRate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tax rate?')) {
      setTaxRates(prev => prev.filter(tr => tr.id !== id));
      onSettingsChange();
    }
  };

  const toggleTaxRateStatus = (id: string) => {
    setTaxRates(prev => prev.map(tr => 
      tr.id === id ? { ...tr, isActive: !tr.isActive } : tr
    ));
    onSettingsChange();
  };

  const filteredTaxRates = taxRates.filter(taxRate => {
    const matchesSearch = taxRate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxRate.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || taxRate.category === filterCategory;
    const matchesCountry = filterCountry === 'all' || taxRate.country === filterCountry;
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const countries = ['United States', 'Canada', 'Germany', 'France', 'United Kingdom', 'Australia'];
  const categories = ['sales', 'vat', 'gst', 'custom'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tax rates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tax Rate Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tax rates, VAT, GST, and sales tax configurations
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Tax Rate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tax rates..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="sales">Sales Tax</option>
              <option value="vat">VAT</option>
              <option value="gst">GST</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterCountry('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tax Rates Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tax Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTaxRates.map((taxRate) => (
                <tr key={taxRate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {taxRate.name}
                      </div>
                      {taxRate.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {taxRate.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {taxRate.rate}{taxRate.type === 'percentage' ? '%' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{taxRate.country}</div>
                        {taxRate.state && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {taxRate.state}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      taxRate.category === 'sales' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                      taxRate.category === 'vat' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      taxRate.category === 'gst' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {taxRate.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleTaxRateStatus(taxRate.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        taxRate.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}
                    >
                      {taxRate.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(taxRate.effectiveDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingTaxRate(taxRate)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTaxRate(taxRate.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTaxRates.length === 0 && (
          <div className="text-center py-12">
            <CalculatorIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterCategory !== 'all' || filterCountry !== 'all'
                ? 'No tax rates match your filters.'
                : 'No tax rates configured yet.'}
            </p>
            {!searchTerm && filterCategory === 'all' && filterCountry === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Tax Rate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Tax Rate Form */}
      {(showAddForm || editingTaxRate) && (
        <TaxRateForm
          taxRate={editingTaxRate}
          onSave={editingTaxRate ? handleEditTaxRate : handleAddTaxRate}
          onCancel={() => {
            setShowAddForm(false);
            setEditingTaxRate(null);
          }}
          countries={countries}
          categories={categories}
        />
      )}
    </div>
  );
}

interface TaxRateFormProps {
  taxRate?: TaxRate | null;
  onSave: (taxRate: Omit<TaxRate, 'id'>) => void;
  onCancel: () => void;
  countries: string[];
  categories: string[];
}

function TaxRateForm({ taxRate, onSave, onCancel, countries, categories }: TaxRateFormProps) {
  const [formData, setFormData] = useState({
    name: taxRate?.name || '',
    rate: taxRate?.rate || 0,
    type: taxRate?.type || 'percentage' as 'percentage' | 'fixed',
    country: taxRate?.country || '',
    state: taxRate?.state || '',
    isActive: taxRate?.isActive ?? true,
    description: taxRate?.description || '',
    effectiveDate: taxRate?.effectiveDate || new Date().toISOString().split('T')[0],
    endDate: taxRate?.endDate || '',
    category: taxRate?.category || 'sales' as TaxRate['category']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {taxRate ? 'Edit Tax Rate' : 'Add New Tax Rate'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax Rate Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., US Sales Tax - California"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rate *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                    required
                    step="0.01"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as 'percentage' | 'fixed')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., CA, NY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as TaxRate['category'])}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Optional description of this tax rate"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {taxRate ? 'Update Tax Rate' : 'Add Tax Rate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
