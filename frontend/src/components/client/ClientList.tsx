import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DuplicateIcon,
  ShareIcon,
  ArrowDownOnSquareIcon,
  UploadIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Client, ClientSearchFilters, clientManagementService } from '@/services/clientManagementService';
import { toast } from 'react-hot-toast';

interface ClientListProps {
  onClientSelect?: (client: Client) => void;
  onClientEdit?: (client: Client) => void;
  onClientDelete?: (client: Client) => void;
  onClientDuplicate?: (client: Client) => void;
  onClientShare?: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  onClientSelect,
  onClientEdit,
  onClientDelete,
  onClientDuplicate,
  onClientShare,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ClientSearchFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [industries, setIndustries] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    loadClients();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, filters, searchTerm, sortBy, sortOrder]);

  const loadFilterOptions = async () => {
    try {
      const [industriesData, statusesData, prioritiesData, companySizesData, tagsData] = await Promise.all([
        clientManagementService.getClientIndustries(),
        clientManagementService.getClientStatuses(),
        clientManagementService.getClientPriorities(),
        clientManagementService.getCompanySizes(),
        clientManagementService.getClientTags(),
      ]);
      
      setIndustries(industriesData);
      setStatuses(statusesData);
      setPriorities(prioritiesData);
      setCompanySizes(companySizesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const result = await clientManagementService.getClients(filters, currentPage, 20);
      setClients(result.clients);
      setTotalPages(result.totalPages);
      setTotalClients(result.total);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.companyName.toLowerCase().includes(term) ||
        client.contactPerson.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        client.address.city.toLowerCase().includes(term) ||
        client.industry.toLowerCase().includes(term) ||
        client.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply other filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(client => filters.status!.includes(client.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(client => filters.priority!.includes(client.priority));
    }

    if (filters.industry && filters.industry.length > 0) {
      filtered = filtered.filter(client => filters.industry!.includes(client.industry));
    }

    if (filters.companySize && filters.companySize.length > 0) {
      filtered = filtered.filter(client => filters.companySize!.includes(client.companySize));
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(client =>
        client.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(client => {
        const clientDate = new Date(client.createdAt);
        return clientDate >= filters.dateRange!.start && clientDate <= filters.dateRange!.end;
      });
    }

    if (filters.revenueRange) {
      filtered = filtered.filter(client =>
        client.totalRevenue >= filters.revenueRange!.min && client.totalRevenue <= filters.revenueRange!.max
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Client];
      let bValue: any = b[sortBy as keyof Client];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setClients(filtered);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadClients();
  };

  const handleClientSelect = (client: Client) => {
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleClientEdit = (client: Client) => {
    if (onClientEdit) {
      onClientEdit(client);
    }
  };

  const handleClientDelete = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete "${client.companyName}"?`)) {
      try {
        await clientManagementService.deleteClient(client.id);
        toast.success('Client deleted successfully');
        loadClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const handleClientDuplicate = async (client: Client) => {
    const newCompanyName = prompt('Enter new company name:', `${client.companyName} (Copy)`);
    if (newCompanyName && newCompanyName.trim()) {
      try {
        const duplicatedClient = await clientManagementService.duplicateClient(client.id, newCompanyName);
        toast.success('Client duplicated successfully');
        loadClients();
        
        if (onClientDuplicate) {
          onClientDuplicate(duplicatedClient.client);
        }
      } catch (error) {
        console.error('Failed to duplicate client:', error);
        toast.error('Failed to duplicate client');
      }
    }
  };

  const handleClientShare = (client: Client) => {
    if (onClientShare) {
      onClientShare(client);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClients.length === 0) {
      toast.error('Please select clients to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedClients.length} clients?`)) {
      try {
        await clientManagementService.bulkDeleteClients(selectedClients);
        toast.success(`${selectedClients.length} clients deleted successfully`);
        setSelectedClients([]);
        loadClients();
      } catch (error) {
        console.error('Failed to delete clients:', error);
        toast.error('Failed to delete clients');
      }
    }
  };

  const handleBulkExport = async () => {
    if (selectedClients.length === 0) {
      toast.error('Please select clients to export');
      return;
    }

    try {
      const blob = await clientManagementService.bulkExportClients(selectedClients, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${selectedClients.length} clients`);
    } catch (error) {
      console.error('Failed to export clients:', error);
      toast.error('Failed to export clients');
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectAllClients = () => {
    setSelectedClients(clients.map(client => client.id));
  };

  const clearSelection = () => {
    setSelectedClients([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'prospect': return 'blue';
      case 'lead': return 'yellow';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getCompanySizeColor = (size: string) => {
    switch (size) {
      case 'enterprise': return 'purple';
      case 'large': return 'blue';
      case 'medium': return 'green';
      case 'small': return 'gray';
      default: return 'gray';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Client Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your client relationships and information
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search clients by name, contact, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="companyName">Company Name</option>
              <option value="totalRevenue">Revenue</option>
              <option value="lastContactDate">Last Contact</option>
              <option value="priority">Priority</option>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            
            <Button onClick={handleSearch} disabled={isLoading}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <Select
                  multiple
                  value={filters.priority || []}
                  onChange={(e) => handleFilterChange('priority', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <Select
                  multiple
                  value={filters.industry || []}
                  onChange={(e) => handleFilterChange('industry', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Size
                </label>
                <Select
                  multiple
                  value={filters.companySize || []}
                  onChange={(e) => handleFilterChange('companySize', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedClients.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedClients.length} clients selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={clearSelection}>
                  Clear Selection
                </Button>
                
                <Button variant="outline" onClick={handleBulkExport}>
                  <ArrowDownOnSquareIcon className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                
                <Button variant="outline" onClick={handleBulkDelete} className="text-red-600">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Clients ({totalClients})</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllClients}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No clients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedClients.length === clients.length}
                        onChange={(e) => e.target.checked ? selectAllClients() : clearSelection()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-3 font-medium">Client</th>
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Priority</th>
                    <th className="text-left p-3 font-medium">Revenue</th>
                    <th className="text-left p-3 font-medium">Last Contact</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => toggleClientSelection(client.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.companyName}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <BuildingOfficeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {client.companyName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {client.industry} • {client.companySize}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              {client.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {client.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{client.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{client.contactPerson}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{client.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <Badge variant="outline" color={getStatusColor(client.status)}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </Badge>
                      </td>
                      
                      <td className="p-3">
                        <Badge variant="outline" color={getPriorityColor(client.priority)}>
                          {client.priority.charAt(0).toUpperCase() + client.priority.slice(1)}
                        </Badge>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{formatCurrency(client.totalRevenue)}</span>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(client.lastContactDate)}</span>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClientSelect(client)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClientEdit(client)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClientDuplicate(client)}
                          >
                            <DuplicateIcon className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClientShare(client)}
                          >
                            <ShareIcon className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClientDelete(client)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages} ({totalClients} total clients)
              </span>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
