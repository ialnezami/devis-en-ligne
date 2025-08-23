import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MessageSearchResult, MessageSearchFilters } from '../../services/messagingService';

interface MessageSearchProps {
  onSearchResultClick: (result: MessageSearchResult) => void;
  onClose?: () => void;
  className?: string;
}

export default function MessageSearch({ onSearchResultClick, onClose, className = '' }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<MessageSearchFilters>({
    dateRange: 'all',
    conversationId: '',
    senderId: '',
    hasAttachments: false,
    messageType: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('messageSearchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('messageSearchHistory', JSON.stringify(updated));
  };

  // Handle search submission
  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;

    setIsSearching(true);
    saveSearchHistory(query);

    try {
      // Simulate API call - replace with actual messagingService.searchMessages call
      const results: MessageSearchResult[] = [
        {
          message: {
            id: 'msg1',
            conversationId: 'conv1',
            senderId: 'user1',
            senderName: 'John Doe',
            content: query,
            messageType: 'text',
            isEdited: false,
            isDeleted: false,
            readBy: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          conversation: {
            id: 'conv1',
            title: 'Project Discussion',
            type: 'project',
            participants: [],
            unreadCount: 0,
            isArchived: false,
            isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          highlight: {
            content: query,
            sender: 'John Doe'
          },
          relevance: 0.95
        },
        {
          message: {
            id: 'msg2',
            conversationId: 'conv2',
            senderId: 'user2',
            senderName: 'Jane Smith',
            content: `We discussed ${query} during the meeting`,
            messageType: 'text',
            isEdited: false,
            isDeleted: false,
            readBy: [],
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 86400000)
          },
          conversation: {
            id: 'conv2',
            title: 'Client Meeting',
            type: 'project',
            participants: [],
            unreadCount: 0,
            isArchived: false,
            isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          highlight: {
            content: `We discussed ${query} during the meeting`,
            sender: 'Jane Smith'
          },
          relevance: 0.87
        }
      ];

      setSearchResults(results);
      setSelectedResultIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  // Handle result selection
  const handleResultClick = (result: MessageSearchResult) => {
    onSearchResultClick(result);
    onClose?.();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedResultIndex(-1);
    searchInputRef.current?.focus();
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      conversationId: '',
      senderId: '',
      hasAttachments: false,
      messageType: 'all'
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Get relevance color
  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Messages
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search messages, conversations, or users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Actions */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => handleSearch()}
            disabled={!searchQuery.trim() || isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-lg border ${
              showFilters 
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Conversation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conversation
              </label>
              <input
                type="text"
                value={filters.conversationId}
                onChange={(e) => setFilters(prev => ({ ...prev, conversationId: e.target.value }))}
                placeholder="Conversation ID or name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Sender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sender
              </label>
              <input
                type="text"
                value={filters.senderId}
                onChange={(e) => setFilters(prev => ({ ...prev, senderId: e.target.value }))}
                placeholder="User ID or name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Message Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message Type
              </label>
              <select
                value={filters.messageType}
                onChange={(e) => setFilters(prev => ({ ...prev, messageType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="text">Text Only</option>
                <option value="file">File Messages</option>
                <option value="system">System Messages</option>
              </select>
            </div>

            {/* Has Attachments */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasAttachments"
                checked={filters.hasAttachments}
                onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasAttachments" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Has Attachments
              </label>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-end mt-4 space-x-3">
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="max-h-96 overflow-y-auto">
        {searchResults.length > 0 ? (
          <div ref={resultsRef}>
            {searchResults.map((result, index) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                  index === selectedResultIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {result.senderName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        in {result.conversationName}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRelevanceColor(result.relevanceScore)} bg-opacity-10`}>
                        {Math.round(result.relevanceScore * 100)}% match
                      </span>
                    </div>
                    
                    <p className="text-gray-800 dark:text-gray-200 mb-2">
                      {result.content}
                    </p>
                    
                    {result.context && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        Context: {result.context}
                      </p>
                    )}
                    
                    {result.attachments.length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          📎 {result.attachments.length} attachment(s)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(result.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No messages found matching your search.</p>
            <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
          </div>
        ) : null}
      </div>

      {/* Search History */}
      {!searchQuery && searchHistory.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(query);
                  handleSearch(query);
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
