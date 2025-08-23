import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhotoIcon,
  FilmIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { messagingService, MessageSearchResult, Message } from '../../services/messagingService';
import { toast } from 'react-hot-toast';

interface MessageSearchProps {
  conversationId?: string;
  onResultClick?: (result: MessageSearchResult) => void;
  className?: string;
}

interface SearchFilters {
  query: string;
  conversationId?: string;
  senderId?: string;
  messageType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
  isRead?: boolean;
  isEdited?: boolean;
}

export default function MessageSearch({ 
  conversationId, 
  onResultClick,
  className = '' 
}: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    conversationId,
    hasAttachments: false,
    isRead: false,
    isEdited: false
  });
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'sender'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Perform search when filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 500);
    } else {
      setResults([]);
      setTotalResults(0);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, sortBy, sortOrder, currentPage]);

  const performSearch = async () => {
    if (!filters.query.trim()) return;

    try {
      setLoading(true);
      const response = await messagingService.searchMessages(filters.query, {
        conversationId: filters.conversationId,
        senderId: filters.senderId,
        messageType: filters.messageType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        limit: 20,
        offset: (currentPage - 1) * 20
      });

      setResults(response.results);
      setTotalResults(response.total);
      setHasMore(response.results.length === 20);
    } catch (error) {
      toast.error('Search failed');
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, query }));
    setCurrentPage(1);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      query: searchQuery,
      conversationId,
      hasAttachments: false,
      isRead: false,
      isEdited: false
    });
    setCurrentPage(1);
  };

  const handleResultClick = (result: MessageSearchResult) => {
    onResultClick?.(result);
  };

  const loadMoreResults = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <PhotoIcon className="w-4 h-4" />;
      case 'video':
        return <FilmIcon className="w-4 h-4" />;
      case 'document':
        return <DocumentTextIcon className="w-4 h-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
    }
  };

  const getReadStatusIcon = (message: Message) => {
    if (message.readBy.length === 0) {
      return <ClockIcon className="w-4 h-4 text-gray-400" />;
    } else if (message.readBy.length === 1) {
      return <CheckIcon className="w-4 h-4 text-blue-500" />;
    } else {
      return <CheckIcon className="w-4 h-4 text-green-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters 
                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' 
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
            title="Toggle filters"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Stats */}
        {totalResults > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
            {filters.conversationId && ' in this conversation'}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Message Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Type
              </label>
              <select
                value={filters.messageType || ''}
                onChange={(e) => updateFilter('messageType', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All types</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="quote">Quote</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Boolean Filters */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments || false}
                  onChange={(e) => updateFilter('hasAttachments', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Has attachments</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isRead || false}
                  onChange={(e) => updateFilter('isRead', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Is read</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isEdited || false}
                  onChange={(e) => updateFilter('isEdited', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Is edited</span>
              </label>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear all filters
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="sender">Sender</option>
              </select>
              
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.message.id}
              onClick={() => handleResultClick(result)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getMessageTypeIcon(result.message.messageType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.message.senderName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(result.message.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {result.message.attachments && result.message.attachments.length > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          📎 {result.message.attachments.length}
                        </span>
                      )}
                      {getReadStatusIcon(result.message)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {result.message.readBy.length} read
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {highlightText(result.message.content, searchQuery)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Conversation: {result.conversation.title}</span>
                      <span>•</span>
                      <span>Relevance: {Math.round(result.relevance * 100)}%</span>
                    </div>
                    
                    {result.message.isEdited && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (edited)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Load More */}
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMoreResults}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Load more results'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && searchQuery && results.length === 0 && (
        <div className="text-center py-8">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Search Tips */}
      {!searchQuery && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Search Tips
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use quotes for exact phrases: "quote template"</li>
            <li>• Search by sender: from:john</li>
            <li>• Search by date: after:2024-01-01</li>
            <li>• Search attachments: has:attachment</li>
            <li>• Combine filters for more precise results</li>
          </ul>
        </div>
      )}
    </div>
  );
}
