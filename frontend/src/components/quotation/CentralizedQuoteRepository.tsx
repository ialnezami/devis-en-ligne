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
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Quote, QuoteSearchFilters, quoteManagementService } from '@/services/quoteManagementService';
import { toast } from 'react-hot-toast';

interface CentralizedQuoteRepositoryProps {
  onQuoteSelect?: (quote: Quote) => void;
  onQuoteEdit?: (quote: Quote) => void;
  onQuoteDelete?: (quote: Quote) => void;
}

export const CentralizedQuoteRepository: React.FC<CentralizedQuoteRepositoryProps> = ({
  onQuoteSelect,
  onQuoteEdit,
  onQuoteDelete,
}) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<QuoteSearchFilters>({});
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadFilterOptions();
    loadQuotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quotes, filters, searchTerm, sortBy, sortOrder]);

  const loadFilterOptions = async () => {
    try {
      const options = await quoteManagementService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const result = await quoteManagementService.getQuotes(filters, currentPage, 20);
      setQuotes(result.quotes);
      setTotalPages(result.totalPages);
      setTotalQuotes(result.total);
    } catch (error) {
      console.error('Failed to load quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quotes];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.title.toLowerCase().includes(term) ||
        quote.quotationNumber.toLowerCase().includes(term) ||
        quote.clientName.toLowerCase().includes(term) ||
        quote.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply status filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(quote => filters.status!.includes(quote.status));
    }

    // Apply priority filters
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(quote => filters.priority!.includes(quote.priority));
    }

    // Apply category filters
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(quote => filters.category!.includes(quote.category));
    }

    // Apply industry filters
    if (filters.industry && filters.industry.length > 0) {
      filtered = filtered.filter(quote => filters.industry!.includes(quote.industry));
    }

    // Apply date range filters
    if (filters.dateRange) {
      filtered = filtered.filter(quote => {
        const quoteDate = new Date(quote.createdAt);
        return quoteDate >= filters.dateRange!.start && quoteDate <= filters.dateRange!.end;
      });
    }

    // Apply amount range filters
    if (filters.amountRange) {
      filtered = filtered.filter(quote =>
        quote.total >= filters.amountRange!.min && quote.total <= filters.amountRange!.max
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Quote];
      let bValue: any = b[sortBy as keyof Quote];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredQuotes(filtered);
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
    loadQuotes();
  };

  const handleQuoteSelect = (quote: Quote) => {
    if (onQuoteSelect) {
      onQuoteSelect(quote);
    }
  };

  const handleQuoteEdit = (quote: Quote) => {
    if (onQuoteEdit) {
      onQuoteEdit(quote);
    }
  };

  const handleQuoteDelete = async (quote: Quote) => {
    if (window.confirm(`Are you sure you want to delete "${quote.title}"?`)) {
      try {
        await quoteManagementService.deleteQuote(quote.id);
        toast.success('Quote deleted successfully');
        loadQuotes();
      } catch (error) {
        console.error('Failed to delete quote:', error);
        toast.error('Failed to delete quote');
      }
    }
  };

  const handleBulkArchive = async () => {
    if (selectedQuotes.length === 0) {
      toast.error('Please select quotes to archive');
      return;
    }

    const reason = prompt('Enter reason for archiving:');
    if (reason !== null) {
      try {
        await quoteManagementService.bulkArchiveQuotes(selectedQuotes, reason);
        toast.success(`${selectedQuotes.length} quotes archived successfully`);
        setSelectedQuotes([]);
        loadQuotes();
      } catch (error) {
        console.error('Failed to archive quotes:', error);
        toast.error('Failed to archive quotes');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuotes.length === 0) {
      toast.error('Please select quotes to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedQuotes.length} quotes?`)) {
      try {
        await quoteManagementService.bulkDeleteQuotes(selectedQuotes);
        toast.success(`${selectedQuotes.length} quotes deleted successfully`);
        setSelectedQuotes([]);
        loadQuotes();
      } catch (error) {
        console.error('Failed to delete quotes:', error);
        toast.error('Failed to delete quotes');
      }
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      const blob = await quoteManagementService.exportQuotes(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotes_export.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Quotes exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export quotes:', error);
      toast.error('Failed to export quotes');
    }
  };

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev =>
      prev.includes(quoteId)
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const selectAllQuotes = () => {
    setSelectedQuotes(filteredQuotes.map(quote => quote.id));
  };

  const clearSelection = () => {
    setSelectedQuotes([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      case 'expired': return 'gray';
      case 'archived': return 'purple';
      default: return 'blue';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Centralized Quote Repository
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize all your quotations in one place
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Quote
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
                  placeholder="Search quotes by title, number, client, or tags..."
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
              <option value="title">Title</option>
              <option value="clientName">Client Name</option>
              <option value="total">Amount</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
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
                  {filterOptions.statuses?.map((status: string) => (
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
                  {filterOptions.priorities?.map((priority: string) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  multiple
                  value={filters.category || []}
                  onChange={(e) => handleFilterChange('category', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {filterOptions.categories?.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
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
                  {filterOptions.industries?.map((industry: string) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedQuotes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedQuotes.length} quotes selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={clearSelection}>
                  Clear Selection
                </Button>
                
                <Button variant="outline" onClick={handleBulkArchive}>
                  <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                  Archive Selected
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

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quotes ({totalQuotes})</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllQuotes}>
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
              <p className="text-gray-600 dark:text-gray-400">Loading quotes...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No quotes found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    selectedQuotes.includes(quote.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedQuotes.includes(quote.id)}
                        onChange={() => toggleQuoteSelection(quote.id)}
                        className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {quote.title}
                          </h3>
                          <Badge variant="outline" color={getStatusColor(quote.status)}>
                            {quote.status}
                          </Badge>
                          <Badge variant="outline" color={getPriorityColor(quote.priority)}>
                            {quote.priority}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">#{quote.quotationNumber}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-4 w-4" />
                            <span>{quote.clientName}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            <span>{formatCurrency(quote.total, quote.currency)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{formatDate(quote.createdAt)}</span>
                          </div>
                        </div>
                        
                        {quote.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <TagIcon className="h-4 w-4 text-gray-400" />
                            {quote.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuoteSelect(quote)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuoteEdit(quote)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuoteDelete(quote)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
                Page {currentPage} of {totalPages} ({totalQuotes} total quotes)
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
