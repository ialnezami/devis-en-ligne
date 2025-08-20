import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/outline';
import { Link, useNavigate } from 'react-router-dom';
import { Client } from '@/types';

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    },
    {
      id: 'client-3',
      name: 'Design Studio Pro',
      email: 'hello@designstudiopro.com',
      phone: '+1-555-0789',
      company: 'Design Studio Pro',
      position: 'Creative Director',
      address: {
        street: '789 Creative Lane',
        city: 'Design City',
        state: 'CA',
        zipCode: '90211',
        country: 'USA'
      },
      notes: 'Creative agency specializing in branding and web design',
      tags: ['design', 'creative', 'agency'],
      createdAt: '2024-01-17T10:00:00.000Z',
      updatedAt: '2024-01-17T10:00:00.000Z'
    }
  ];

  useEffect(() => {
    // Simulate loading clients data
    const loadClients = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setClients(mockClients);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const getAllTags = () => {
    const tags = new Set<string>();
    clients.forEach(client => {
      client.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = tagFilter === 'all' || client.tags.includes(tagFilter);
    
    return matchesSearch && matchesTag;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Client];
    let bValue: any = b[sortBy as keyof Client];

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
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setClients(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading clients...</p>
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
                Clients
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your client relationships and information
              </p>
            </div>
            <Link
              to="/clients/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Client
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
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="company">Company</option>
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
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

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClients.map((client) => (
            <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {client.company}
                      </p>
                    )}
                    {client.position && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {client.position}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/clients/${client.id}/edit`)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <a href={`mailto:${client.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <a href={`tel:${client.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>{client.address.street}</div>
                      <div>{client.address.city}, {client.address.state} {client.address.zipCode}</div>
                      <div>{client.address.country}</div>
                    </div>
                  )}
                </div>

                {client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {client.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {client.notes && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="line-clamp-2">{client.notes}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Created: {new Date(client.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(client.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FunnelIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No clients found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || tagFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first client.'
              }
            </p>
            {!searchTerm && tagFilter === 'all' && (
              <Link
                to="/clients/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Client
              </Link>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {sortedClients.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{sortedClients.length}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Companies</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(sortedClients.map(c => c.company).filter(Boolean)).size}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tags</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getAllTags().length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sortedClients.filter(c => {
                  const created = new Date(c.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
