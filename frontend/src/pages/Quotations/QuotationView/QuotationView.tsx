import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PencilIcon, DocumentArrowDownIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Quotation, QuotationStatus, Client } from '@/types';

const QuotationView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [quotation, setQuotation] = useState<Quotation | null>(null);

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
    }
  ];

  // Mock quotation data
  const mockQuotation: Quotation = {
    id: id || '1',
    number: 'QT-2024-001',
    title: 'Website Development Project',
    description: 'Complete website development including frontend, backend, and database',
    clientId: 'client-1',
    client: mockClients[0],
    items: [
      {
        id: '1',
        name: 'Frontend Development',
        description: 'React.js frontend with responsive design',
        quantity: 1,
        unitPrice: 5000,
        taxRate: 20,
        discount: 0,
        total: 6000
      },
      {
        id: '2',
        name: 'Backend Development',
        description: 'Node.js backend with REST API',
        quantity: 1,
        unitPrice: 4000,
        taxRate: 20,
        discount: 0,
        total: 4800
      },
      {
        id: '3',
        name: 'Database Design',
        description: 'PostgreSQL database design and setup',
        quantity: 1,
        unitPrice: 1500,
        taxRate: 20,
        discount: 0,
        total: 1800
      }
    ],
    status: QuotationStatus.SENT,
    totalAmount: 10500,
    taxAmount: 2100,
    discountAmount: 0,
    grandTotal: 12600,
    validUntil: '2024-12-31',
    paymentTerms: 'Net 30',
    notes: 'Project to be completed within 8 weeks',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z'
  };

  useEffect(() => {
    // Simulate loading quotation data
    const loadQuotation = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setQuotation(mockQuotation);
      } catch (error) {
        console.error('Error loading quotation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadQuotation();
    }
  }, [id]);

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case QuotationStatus.SENT:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case QuotationStatus.VIEWED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case QuotationStatus.ACCEPTED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case QuotationStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case QuotationStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: QuotationStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleEdit = () => {
    navigate(`/quotations/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/quotations');
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleDownload = () => {
    // Simulate PDF download
    console.log('Downloading PDF...');
  };

  const handleShare = () => {
    // Simulate sharing
    console.log('Sharing quotation...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quotation Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The quotation you're looking for doesn't exist.
          </p>
          <Link
            to="/quotations"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/quotations"
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Quotations
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {quotation.title}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Quotation #{quotation.number}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
                {getStatusLabel(quotation.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>

        {/* Quotation Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
                  {getStatusLabel(quotation.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.client.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{quotation.client.company}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valid Until
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.validUntil}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.description}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Items
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tax Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {quotation.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.taxRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.discount > 0 ? `${item.discount}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">${quotation.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Discount:</span>
                <span className="text-gray-900 dark:text-white">
                  {quotation.discountAmount > 0 ? `-$${quotation.discountAmount.toFixed(2)}` : '$0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Tax:</span>
                <span className="text-gray-900 dark:text-white">${quotation.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-medium">
                  <span className="text-gray-900 dark:text-white">Grand Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">${quotation.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Additional Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Terms
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.paymentTerms}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(quotation.createdAt).toLocaleDateString()}
                </p>
              </div>
              {quotation.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <p className="text-gray-900 dark:text-white">{quotation.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.client.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.client.company}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.client.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <p className="text-gray-900 dark:text-white">{quotation.client.phone || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <p className="text-gray-900 dark:text-white">
                  {quotation.client.address && (
                    <>
                      {quotation.client.address.street}<br />
                      {quotation.client.address.city}, {quotation.client.address.state} {quotation.client.address.zipCode}<br />
                      {quotation.client.address.country}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationView;
