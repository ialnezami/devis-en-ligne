import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  BellIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DownloadIcon,
  TrashIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserIcon,
  CogIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Notification, notificationService } from '@/services/notificationService';
import { toast } from 'react-hot-toast';

interface NotificationHistoryProps {
  onNotificationClick?: (notification: Notification) => void;
  onNotificationAction?: (notification: Notification, action: string) => void;
  showArchived?: boolean;
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  onNotificationClick,
  onNotificationAction,
  showArchived = false,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'type' | 'category'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    archived: 0,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  });

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, [currentPage, pageSize, showArchived]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filterType, filterCategory, filterPriority, filterRead, filterDateRange, searchTerm, sortBy, sortOrder]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const filters: any = { 
        limit: pageSize, 
        offset: (currentPage - 1) * pageSize,
        isArchived: showArchived,
      };
      
      const notificationsData = await notificationService.getNotifications(filters);
      setNotifications(notificationsData);
      setTotalNotifications(notificationsData.length); // In a real app, this would come from the API
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await notificationService.getNotificationStats();
      if (statsData) {
        setStats({
          total: statsData.total,
          unread: statsData.unread,
          archived: statsData.archived,
          byType: statsData.byType,
          byCategory: statsData.byCategory,
          byPriority: statsData.byPriority,
        });
      }
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const applyFilters = () => {
    // This would typically be handled by the API, but for now we'll filter client-side
    // In a real implementation, you'd pass these filters to the API
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const success = await notificationService.markAsRead(id);
      if (success) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
        ));
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      const success = await notificationService.markAsUnread(id);
      if (success) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isRead: false, readAt: undefined } : n
        ));
        setStats(prev => ({ ...prev, unread: prev.unread + 1 }));
        toast.success('Notification marked as unread');
      }
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      toast.error('Failed to mark notification as unread');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const success = await notificationService.archiveNotification(id);
      if (success) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isArchived: true, archivedAt: new Date() } : n
        ));
        toast.success('Notification archived');
      }
    } catch (error) {
      console.error('Failed to archive notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const success = await notificationService.unarchiveNotification(id);
      if (success) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isArchived: false, archivedAt: undefined } : n
        ));
        toast.success('Notification unarchived');
      }
    } catch (error) {
      console.error('Failed to unarchive notification:', error);
      toast.error('Failed to unarchive notification');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
      try {
        const success = await notificationService.deleteNotification(id);
        if (success) {
          setNotifications(prev => prev.filter(n => n.id !== id));
          setStats(prev => ({ 
            ...prev, 
            total: Math.max(0, prev.total - 1),
            unread: prev.unread - (notifications.find(n => n.id === id)?.isRead ? 0 : 1)
          }));
          toast.success('Notification deleted');
        }
      } catch (error) {
        console.error('Failed to delete notification:', error);
        toast.error('Failed to delete notification');
      }
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected');
      return;
    }

    try {
      const success = await notificationService.markMultipleAsRead(selectedNotifications);
      if (success) {
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, isRead: true, readAt: new Date() } : n
        ));
        setStats(prev => ({ 
          ...prev, 
          unread: Math.max(0, prev.unread - selectedNotifications.length)
        }));
        setSelectedNotifications([]);
        toast.success(`${selectedNotifications.length} notifications marked as read`);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected');
      return;
    }

    try {
      const success = await notificationService.archiveMultiple(selectedNotifications);
      if (success) {
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, isArchived: true, archivedAt: new Date() } : n
        ));
        setSelectedNotifications([]);
        toast.success(`${selectedNotifications.length} notifications archived`);
      }
    } catch (error) {
      console.error('Failed to archive notifications:', error);
      toast.error('Failed to archive notifications');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications? This action cannot be undone.`)) {
      try {
        const success = await notificationService.deleteMultiple(selectedNotifications);
        if (success) {
          const unreadCount = notifications
            .filter(n => selectedNotifications.includes(n.id) && !n.isRead)
            .length;
          
          setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
          setStats(prev => ({ 
            ...prev, 
            total: Math.max(0, prev.total - selectedNotifications.length),
            unread: Math.max(0, prev.unread - unreadCount)
          }));
          setSelectedNotifications([]);
          toast.success(`${selectedNotifications.length} notifications deleted`);
        }
      } catch (error) {
        console.error('Failed to delete notifications:', error);
        toast.error('Failed to delete notifications');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleNotificationSelect = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleExportHistory = () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        filters: {
          type: filterType,
          category: filterCategory,
          priority: filterPriority,
          read: filterRead,
          dateRange: filterDateRange,
          searchTerm,
        },
        notifications: filteredNotifications,
        stats: {
          total: filteredNotifications.length,
          unread: filteredNotifications.filter(n => !n.isRead).length,
          archived: filteredNotifications.filter(n => n.isArchived).length,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notification-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Notification history exported successfully');
    } catch (error) {
      console.error('Failed to export notification history:', error);
      toast.error('Failed to export notification history');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'info': return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'quote': return <StarIcon className="h-5 w-5 text-purple-600" />;
      case 'client': return <UserIcon className="h-5 w-5 text-indigo-600" />;
      case 'system': return <CogIcon className="h-5 w-5 text-gray-600" />;
      default: return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'info': return 'blue';
      case 'quote': return 'purple';
      case 'client': return 'indigo';
      case 'system': return 'gray';
      default: return 'gray';
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

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) return false;
    if (filterCategory !== 'all' && notification.category !== filterCategory) return false;
    if (filterPriority !== 'all' && notification.priority !== filterPriority) return false;
    if (filterRead !== 'all') {
      if (filterRead === 'read' && !notification.isRead) return false;
      if (filterRead === 'unread' && notification.isRead) return false;
    }
    if (filterDateRange !== 'all') {
      const notificationDate = new Date(notification.createdAt);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filterDateRange) {
        case 'today':
          if (diffInDays > 0) return false;
          break;
        case 'week':
          if (diffInDays > 7) return false;
          break;
        case 'month':
          if (diffInDays > 30) return false;
          break;
        case 'year':
          if (diffInDays > 365) return false;
          break;
      }
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(term) ||
        notification.message.toLowerCase().includes(term) ||
        notification.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(totalNotifications / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalNotifications);

  const paginatedNotifications = sortedNotifications.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your notification history
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button variant="outline" onClick={handleExportHistory}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" onClick={loadNotifications}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <EyeIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.unread}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-900">
                <ArchiveBoxIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.archived}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredNotifications.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>History Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="quote">Quote</option>
                  <option value="client">Client</option>
                  <option value="system">System</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="quote">Quote</option>
                  <option value="client">Client</option>
                  <option value="system">System</option>
                  <option value="communication">Communication</option>
                  <option value="reminder">Reminder</option>
                  <option value="update">Update</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <Select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="createdAt">Date</option>
                  <option value="priority">Priority</option>
                  <option value="type">Type</option>
                  <option value="category">Category</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Size
                </label>
                <Select
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedNotifications.length} notification(s) selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Mark as Read
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                  <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600">
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Notifications ({filteredNotifications.length})
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading notification history...</p>
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No notifications found</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      notification.isRead
                        ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    } ${
                      selectedNotifications.includes(notification.id)
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleNotificationSelect(notification.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full bg-${getNotificationColor(notification.type)}-100`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-medium text-gray-900 dark:text-white ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h3>
                              
                              <Badge variant="outline" color={getNotificationColor(notification.type)}>
                                {notification.type}
                              </Badge>
                              
                              <Badge variant="outline" color={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => notification.isRead 
                                  ? handleMarkAsUnread(notification.id)
                                  : handleMarkAsRead(notification.id)
                                }
                              >
                                {notification.isRead ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => notification.isArchived
                                  ? handleUnarchive(notification.id)
                                  : handleArchive(notification.id)
                                }
                              >
                                <ArchiveBoxIcon className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notification.id)}
                                className="text-red-600"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className={`text-sm text-gray-600 dark:text-gray-400 mb-2 ${
                            !notification.isRead ? 'font-medium' : ''
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>Category: {notification.category}</span>
                              {notification.relatedEntityType && (
                                <span>Related: {notification.relatedEntityType}</span>
                              )}
                            </div>
                            
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {startIndex + 1} to {endIndex} of {totalNotifications} results
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
