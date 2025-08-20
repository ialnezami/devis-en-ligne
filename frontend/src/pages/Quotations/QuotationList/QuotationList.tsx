import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { Quotation, Client } from '@/types';

const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock clients data
  const mockClients: Client[] = [
    {
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
    {
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
    }
  ];

  // Mock quotations data
  const mockQuotations: Quotation[] = [
    {
      id: '1',
      number: 'QT-2024-001',
      title: 'Website Development Project',
      description: 'Complete website development including frontend, backend, and database',
      clientId: 'client-1',
      client: mockClients[0],
      items: [],
      status: 'sent',
      totalAmount: 10500,
      taxAmount: 2100,
      discountAmount: 0,
      grandTotal: 12600,
      validUntil: '2024-12-31',
      paymentTerms: 'Net 30',
      notes: 'Project to be completed within 8 weeks',
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z'
    },
    {
      id: '2',
      number: 'QT-2024-002',
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application for iOS and Android',
      clientId: 'client-2',
      client: mockClients[1],
      items: [],
      status: 'draft',
      totalAmount: 8000,
      taxAmount: 1600,
      discountAmount: 0,
      grandTotal: 9600,
      validUntil: '2024-11-30',
      paymentTerms: 'Net 30',
      notes: 'Focus on user experience and performance',
      createdAt: '2024-01-16T10:00:00.000Z',
      updatedAt: '2024-01-16T10:00:00.000Z'
    },
    {
      id: '3',
      number: 'QT-2024-003',
      title: 'E-commerce Platform',
      description: 'Full-featured e-commerce platform with payment integration',
      clientId: 'client-1',
      client: mockClients[0],
      items: [],
      status: 'accepted',
      totalAmount: 15000,
      taxAmount: 3000,
      discountAmount: 1500,
      grandTotal: 16500,
      validUntil: '2024-10-31',
      paymentTerms: 'Net 45',
      notes: 'Priority project with tight deadline',
      createdAt: '2024-01-17T10:00:00.000Z',
      updatedAt: '2024-01-17T10:00:00.000Z'
    }
  ];

  useEffect(() => {
    // Simulate loading quotations data
    const loadQuotations = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setQuotations(mockQuotations);
      } catch (error) {
        console.error('Error loading quotations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Quotation];
    let bValue: any = b[sortBy as keyof Quotation];

    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setQuotations(prev => prev.filter(q => q.id !== id));
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleDownload = (id: string) => {
    // Simulate PDF download
    console.log('Downloading quotation:', id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading quotations...</p>
        </div>
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Quotation
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
                <option value="number">Number</option>
                <option value="grandTotal">Total Amount</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quotation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {quotation.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{quotation.number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {quotation.client.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {quotation.client.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {getStatusLabel(quotation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${quotation.grandTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {quotation.validUntil}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/quotations/${quotation.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(quotation.id)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Download PDF"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
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

          {sortedQuotations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <FunnelIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No quotations found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first quotation.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  to="/quotations/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Quotation
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {sortedQuotations.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quotations</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{sortedQuotations.length}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${sortedQuotations.reduce((sum, q) => sum + q.grandTotal, 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Accepted</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sortedQuotations.filter(q => q.status === 'accepted').length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {sortedQuotations.filter(q => ['draft', 'sent', 'viewed'].includes(q.status)).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationList;
