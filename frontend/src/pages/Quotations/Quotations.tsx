import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, FilterIcon } from '@heroicons/react/outline';
import { Link } from 'react-router-dom';
import { Quotation, QuotationStatus } from '@/types';

const Quotations: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockQuotations: Quotation[] = [
      {
        id: '1',
        number: 'Q-2024-001',
        title: 'Website Development Project',
        description: 'Complete website development for e-commerce platform',
        clientId: 'client-1',
        client: {
          id: 'client-1',
          name: 'TechStart Inc',
          email: 'contact@techstart.com',
          phone: '+1-555-0123',
          company: 'TechStart Inc',
          position: 'CTO',
          address: {
            street: '123 Innovation Blvd',
            city: 'Startup City',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          notes: 'Startup company looking for MVP development',
          tags: ['startup', 'technology', 'mvp'],
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z'
        },
        items: [
          {
            id: 'item-1',
            name: 'Frontend Development',
            description: 'React.js frontend with responsive design',
            quantity: 1,
            unitPrice: 5000,
            taxRate: 20,
            discount: 0,
            total: 5000
          },
          {
            id: 'item-2',
            name: 'Backend API',
            description: 'Node.js backend with PostgreSQL',
            quantity: 1,
            unitPrice: 4000,
            taxRate: 20,
            discount: 0,
            total: 4000
          }
        ],
        status: QuotationStatus.DRAFT,
        totalAmount: 9000,
        taxAmount: 1800,
        discountAmount: 0,
        grandTotal: 10800,
        validUntil: '2024-02-15T00:00:00.000Z',
        paymentTerms: 'Net 30',
        notes: 'Project to be completed within 8 weeks',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: '2',
        number: 'Q-2024-002',
        title: 'Mobile App Development',
        description: 'Cross-platform mobile application',
        clientId: 'client-2',
        client: {
          id: 'client-2',
          name: 'MobileCorp',
          email: 'info@mobilecorp.com',
          phone: '+1-555-0456',
          company: 'MobileCorp',
          position: 'Product Manager',
          address: {
            street: '456 Mobile Ave',
            city: 'App City',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          notes: 'Established company expanding to mobile',
          tags: ['mobile', 'established', 'enterprise'],
          createdAt: '2024-01-16T10:00:00.000Z',
          updatedAt: '2024-01-16T10:00:00.000Z'
        },
        items: [
          {
            id: 'item-3',
            name: 'Mobile App Development',
            description: 'React Native cross-platform app',
            quantity: 1,
            unitPrice: 8000,
            taxRate: 20,
            discount: 500,
            total: 7500
          }
        ],
        status: QuotationStatus.SENT,
        totalAmount: 7500,
        taxAmount: 1500,
        discountAmount: 500,
        grandTotal: 8500,
        validUntil: '2024-02-20T00:00:00.000Z',
        paymentTerms: 'Net 45',
        notes: 'App should support both iOS and Android',
        createdAt: '2024-01-16T10:00:00.000Z',
        updatedAt: '2024-01-16T10:00:00.000Z'
      }
    ];

    setTimeout(() => {
      setQuotations(mockQuotations);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: QuotationStatus) => {
    const statusConfig = {
      [QuotationStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      [QuotationStatus.SENT]: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      [QuotationStatus.VIEWED]: { color: 'bg-yellow-100 text-yellow-800', label: 'Viewed' },
      [QuotationStatus.ACCEPTED]: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      [QuotationStatus.REJECTED]: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      [QuotationStatus.EXPIRED]: { color: 'bg-gray-100 text-gray-800', label: 'Expired' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Quotations
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and track all your quotations
              </p>
            </div>
            <Link
              to="/quotations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Quotation
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as QuotationStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value={QuotationStatus.DRAFT}>Draft</option>
                <option value={QuotationStatus.SENT}>Sent</option>
                <option value={QuotationStatus.VIEWED}>Viewed</option>
                <option value={QuotationStatus.ACCEPTED}>Accepted</option>
                <option value={QuotationStatus.REJECTED}>Rejected</option>
                <option value={QuotationStatus.EXPIRED}>Expired</option>
              </select>
            </div>

            {/* Additional Filters */}
            <div>
              <button className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-center">
                <FilterIcon className="h-5 w-5 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {filteredQuotations.length} Quotation{filteredQuotations.length !== 1 ? 's' : ''}
            </h3>
          </div>

          {filteredQuotations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No quotations found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first quotation.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  to="/quotations/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Quotation
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuotations.map((quotation) => (
                <div key={quotation.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getStatusBadge(quotation.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {quotation.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {quotation.client.name} • {quotation.number}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(quotation.grandTotal)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Valid until {formatDate(quotation.validUntil)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/quotations/${quotation.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quotations;
