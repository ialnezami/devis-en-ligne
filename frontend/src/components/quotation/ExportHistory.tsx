import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownOnSquareIcon,
  TrashIcon,
  FunnelIcon,
  RefreshIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { ExportHistoryItem, pdfExportService } from '@/services/pdfExportService';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface ExportHistoryProps {
  quotationId?: string;
  onClose?: () => void;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({
  quotationId,
  onClose,
}) => {
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ExportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    template: 'all',
    search: '',
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadExportHistory();
    loadTemplates();
  }, [quotationId]);

  useEffect(() => {
    applyFilters();
  }, [exportHistory, filters]);

  const loadExportHistory = async () => {
    setIsLoading(true);
    try {
      const history = await pdfExportService.getExportHistory(quotationId);
      setExportHistory(history);
    } catch (error) {
      console.error('Failed to load export history:', error);
      toast.error('Failed to load export history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const availableTemplates = await pdfExportService.getAvailableTemplates();
      setTemplates(availableTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...exportHistory];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.createdAt) >= cutoffDate);
    }

    // Template filter
    if (filters.template !== 'all') {
      filtered = filtered.filter(item => item.metadata?.template === filters.template);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.filename.toLowerCase().includes(searchLower) ||
        item.metadata?.template?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredHistory(filtered);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(filteredHistory.map(item => item.id));
  };

  const selectNone = () => {
    setSelectedItems([]);
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} export records?`)) {
      return;
    }

    try {
      // Here you would call the API to delete the export records
      // For now, we'll just remove them from the local state
      setExportHistory(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      toast.success(`${selectedItems.length} export records deleted`);
    } catch (error) {
      console.error('Failed to delete export records:', error);
      toast.error('Failed to delete export records');
    }
  };

  const downloadExport = async (item: ExportHistoryItem) => {
    try {
      // Here you would regenerate the PDF and download it
      // For now, we'll show a success message
      toast.success(`Downloading ${item.filename}`);
    } catch (error) {
      console.error('Failed to download export:', error);
      toast.error('Failed to download export');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'processing':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5" />
            <span>Export History</span>
            {quotationId && (
              <Badge variant="outline" className="text-xs">
                Quotation Specific
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadExportHistory}
              disabled={isLoading}
            >
              <RefreshIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Range</label>
              <Select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Template</label>
              <Select
                value={filters.template}
                onChange={(e) => setFilters(prev => ({ ...prev, template: e.target.value }))}
                className="text-sm"
              >
                <option value="all">All Templates</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <Input
                type="text"
                placeholder="Search exports..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredHistory.length} exports found
            </span>
            
            {selectedItems.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {selectedItems.length} selected
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectedItems.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectNone}
                >
                  Deselect All
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedItems}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              Select All
            </Button>
          </div>
        </div>

        {/* Export History Table */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading export history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No exports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredHistory.length}
                      onChange={(e) => e.target.checked ? selectAll() : selectNone()}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.filename}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.metadata?.pageCount || 1} pages
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <Badge variant="outline" color={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </td>
                    
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.metadata?.template || 'Default'}
                    </td>
                    
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatFileSize(item.size)}
                    </td>
                    
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>
                    
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadExport(item)}
                          disabled={item.status !== 'completed'}
                        >
                          <ArrowDownOnSquareIcon className="h-4 w-4" />
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
  );
};
