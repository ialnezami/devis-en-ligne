import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  Quotation, 
  QuotationFilter, 
  QuotationSort, 
  QuotationBulkAction,
  QuotationPreview
} from '@/types/quotation';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

// Mock data for demonstration
const mockQuotations: Quotation[] = [
  {
    id: '1',
    quotationNumber: 'QT-2024-001',
    title: 'Website Development Project',
    description: 'Complete website development with CMS integration',
    client: {
      id: '1',
      name: 'John Smith',
      email: 'john@acmecorp.com',
      company: 'Acme Corporation',
      phone: '+1-555-0123'
    },
    status: 'sent',
    priority: 'high',
    totalAmount: 15000,
    currency: 'USD',
    validUntil: new Date('2024-03-15'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    sentAt: new Date('2024-02-01'),
    expiresAt: new Date('2024-03-15'),
    items: [],
    attachments: [],
    tags: ['website', 'development', 'cms'],
    customFields: {}
  },
  {
    id: '2',
    quotationNumber: 'QT-2024-002',
    title: 'Mobile App Development',
    description: 'iOS and Android mobile application development',
    client: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@techstart.com',
      company: 'TechStart Inc',
      phone: '+1-555-0456'
    },
    status: 'viewed',
    priority: 'urgent',
    totalAmount: 25000,
    currency: 'USD',
    validUntil: new Date('2024-03-01'),
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-02-05'),
    sentAt: new Date('2024-01-28'),
    viewedAt: new Date('2024-02-05'),
    expiresAt: new Date('2024-03-01'),
    items: [],
    attachments: [],
    tags: ['mobile', 'ios', 'android'],
    customFields: {}
  },
  {
    id: '3',
    quotationNumber: 'QT-2024-003',
    title: 'E-commerce Platform',
    description: 'Full-featured e-commerce solution with payment integration',
    client: {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@retailpro.com',
      company: 'RetailPro Solutions',
      phone: '+1-555-0789'
    },
    status: 'accepted',
    priority: 'medium',
    totalAmount: 35000,
    currency: 'USD',
    validUntil: new Date('2024-02-20'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-10'),
    sentAt: new Date('2024-01-20'),
    respondedAt: new Date('2024-02-10'),
    expiresAt: new Date('2024-02-20'),
    items: [],
    attachments: [],
    tags: ['e-commerce', 'payment', 'platform'],
    customFields: {}
  },
  {
    id: '4',
    quotationNumber: 'QT-2024-004',
    title: 'Database Migration',
    description: 'Legacy system database migration to cloud platform',
    client: {
      id: '4',
      name: 'Lisa Chen',
      email: 'lisa@datasys.com',
      company: 'DataSys Technologies',
      phone: '+1-555-0321'
    },
    status: 'draft',
    priority: 'low',
    totalAmount: 8000,
    currency: 'USD',
    validUntil: new Date('2024-04-01'),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    expiresAt: new Date('2024-04-01'),
    items: [],
    attachments: [],
    tags: ['database', 'migration', 'cloud'],
    customFields: {}
  },
  {
    id: '5',
    quotationNumber: 'QT-2024-005',
    title: 'API Integration Services',
    description: 'Third-party API integration and custom endpoints',
    client: {
      id: '5',
      name: 'David Brown',
      email: 'david@apiconnect.com',
      company: 'APIConnect Ltd',
      phone: '+1-555-0654'
    },
    status: 'rejected',
    priority: 'medium',
    totalAmount: 12000,
    currency: 'USD',
    validUntil: new Date('2024-02-15'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-08'),
    sentAt: new Date('2024-01-25'),
    respondedAt: new Date('2024-02-08'),
    expiresAt: new Date('2024-02-15'),
    items: [],
    attachments: [],
    tags: ['api', 'integration', 'endpoints'],
    customFields: {}
  }
];

const QuotationList: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>(mockQuotations);
  const [filters, setFilters] = useState<QuotationFilter>({});
  const [sort, setSort] = useState<QuotationSort>({ field: 'createdAt', direction: 'desc' });
  const [search, setSearch] = useState('');
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const sortOptions = [
    { value: 'quotationNumber', label: 'Quotation Number' },
    { value: 'title', label: 'Title' },
    { value: 'client.name', label: 'Client Name' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'totalAmount', label: 'Total Amount' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'validUntil', label: 'Valid Until' },
    { value: 'expiresAt', label: 'Expires At' }
  ];

  // Filter and search quotations
  useEffect(() => {
    let filtered = [...quotations];

    // Search filter
    if (search) {
      filtered = filtered.filter(quotation =>
        quotation.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        quotation.title.toLowerCase().includes(search.toLowerCase()) ||
        quotation.client.name.toLowerCase().includes(search.toLowerCase()) ||
        quotation.client.company?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(quotation => filters.status!.includes(quotation.status));
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(quotation => filters.priority!.includes(quotation.priority));
    }

    // Client filter
    if (filters.clientId) {
      filtered = filtered.filter(quotation => quotation.client.id === filters.clientId);
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(quotation =>
        quotation.createdAt >= filters.dateRange!.start &&
        quotation.createdAt <= filters.dateRange!.end
      );
    }

    // Amount range filter
    if (filters.amountRange) {
      filtered = filtered.filter(quotation =>
        quotation.totalAmount >= filters.amountRange!.min &&
        quotation.totalAmount <= filters.amountRange!.max
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case 'quotationNumber':
          aValue = a.quotationNumber;
          bValue = b.quotationNumber;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'client.name':
          aValue = a.client.name;
          bValue = b.client.name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'validUntil':
          aValue = a.validUntil;
          bValue = b.validUntil;
          break;
        case 'expiresAt':
          aValue = a.expiresAt;
          bValue = b.expiresAt;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredQuotations(filtered);
    setCurrentPage(1);
  }, [quotations, filters, sort, search]);

  // Pagination
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotations = filteredQuotations.slice(startIndex, endIndex);

  // Status and priority colors
  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'viewed': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      case 'expired': return 'muted';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Quotation['priority']) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'destructive';
      default: return 'default';
    }
  };

  // Bulk actions
  const handleBulkAction = (action: QuotationBulkAction['action']) => {
    if (selectedQuotations.length === 0) return;

    switch (action) {
      case 'delete':
        setQuotations(prev => prev.filter(q => !selectedQuotations.includes(q.id)));
        setSelectedQuotations([]);
        break;
      case 'export':
        // Handle export logic
        console.log('Exporting quotations:', selectedQuotations);
        break;
      default:
        console.log('Bulk action:', action, selectedQuotations);
    }
  };

  // Select all quotations on current page
  const handleSelectAll = () => {
    if (selectedQuotations.length === currentQuotations.length) {
      setSelectedQuotations([]);
    } else {
      setSelectedQuotations(currentQuotations.map(q => q.id));
    }
  };

  // Select individual quotation
  const handleSelectQuotation = (quotationId: string) => {
    setSelectedQuotations(prev =>
      prev.includes(quotationId)
        ? prev.filter(id => id !== quotationId)
        : [...prev, quotationId]
    );
  };

  // Preview quotation
  const handlePreview = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowPreviewModal(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quotations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and track all your quotations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="lg">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Import
          </Button>
          <Link to="/quotations/create">
            <Button size="lg">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search quotations, clients, or companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <Select
                options={statusOptions}
                value={filters.status?.[0] ? { value: filters.status[0], label: statusOptions.find(s => s.value === filters.status![0])?.label || '' } : undefined}
                onChange={(option) => setFilters(prev => ({ ...prev, status: option ? [option.value] : undefined }))}
                placeholder="Status"
              />
              <Select
                options={priorityOptions}
                value={filters.priority?.[0] ? { value: filters.priority[0], label: priorityOptions.find(p => p.value === filters.priority![0])?.label || '' } : undefined}
                onChange={(option) => setFilters(prev => ({ ...prev, priority: option ? [option.value] : undefined }))}
                placeholder="Priority"
              />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-primary text-white")}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      placeholder="Start Date"
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                      }))}
                    />
                    <Input
                      type="date"
                      placeholder="End Date"
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min Amount"
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        amountRange: { ...prev.amountRange, min: parseFloat(e.target.value) }
                      }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max Amount"
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        amountRange: { ...prev.amountRange, max: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select
                    options={sortOptions}
                    value={{ value: sort.field, label: sortOptions.find(s => s.value === sort.field)?.label || '' }}
                    onChange={(option) => option && setSort(prev => ({ ...prev, field: option.value as QuotationSort['field'] }))}
                    placeholder="Sort by"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedQuotations.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedQuotations.length} quotation(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations ({filteredQuotations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedQuotations.length === currentQuotations.length && currentQuotations.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Quotation</th>
                  <th className="text-left py-3 px-4 font-medium">Client</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Valid Until</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentQuotations.map((quotation) => (
                  <tr key={quotation.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedQuotations.includes(quotation.id)}
                        onChange={() => handleSelectQuotation(quotation.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {quotation.quotationNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {quotation.title}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {quotation.client.name}
                        </div>
                        {quotation.client.company && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {quotation.client.company}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getPriorityColor(quotation.priority)}>
                        {quotation.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(quotation.totalAmount, quotation.currency)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(quotation.validUntil)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePreview(quotation)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredQuotations.length)} of {filteredQuotations.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Quotation Preview - ${selectedQuotation?.quotationNumber}`}
      >
        {selectedQuotation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quotation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Number:</span>
                    <span className="font-medium">{selectedQuotation.quotationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Title:</span>
                    <span className="font-medium">{selectedQuotation.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <Badge variant={getStatusColor(selectedQuotation.status)}>
                      {selectedQuotation.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedQuotation.totalAmount, selectedQuotation.currency)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Client Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="font-medium">{selectedQuotation.client.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Company:</span>
                    <span className="font-medium">{selectedQuotation.client.company || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="font-medium">{selectedQuotation.client.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                  Close
                </Button>
                <Button>
                  Edit Quotation
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuotationList;
