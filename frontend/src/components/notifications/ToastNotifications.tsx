import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { notificationService } from '@/services/notificationService';
import { toast } from 'react-hot-toast';

interface ToastNotificationsProps {
  onToastCreated?: (toastData: any) => void;
  onToastDeleted?: (toastId: string) => void;
}

export const ToastNotifications: React.FC<ToastNotificationsProps> = ({
  onToastCreated,
  onToastDeleted,
}) => {
  const [toasts, setToasts] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentToastIndex, setCurrentToastIndex] = useState(0);
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    type: 'info' as const,
    title: '',
    message: '',
    duration: 5000,
    priority: 'medium' as const,
    category: 'system' as const,
    actionText: '',
    actionUrl: '',
  });

  useEffect(() => {
    loadToasts();
  }, []);

  useEffect(() => {
    if (isPlaying && toasts.length > 0) {
      const interval = setInterval(() => {
        setCurrentToastIndex(prev => (prev + 1) % toasts.length);
      }, 3000);
      setPlayInterval(interval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, toasts.length]);

  const loadToasts = async () => {
    try {
      // In a real implementation, you'd load toast templates or saved toasts
      const sampleToasts = [
        {
          id: '1',
          type: 'success',
          title: 'Quote Created Successfully',
          message: 'Your quote has been created and saved to the system.',
          duration: 5000,
          priority: 'medium',
          category: 'quote',
        },
        {
          id: '2',
          type: 'warning',
          title: 'Client Contact Expiring',
          message: 'Client contact information will expire in 30 days.',
          duration: 8000,
          priority: 'high',
          category: 'client',
        },
        {
          id: '3',
          type: 'info',
          title: 'System Update Available',
          message: 'A new system update is available for download.',
          duration: 4000,
          priority: 'low',
          category: 'system',
        },
      ];
      setToasts(sampleToasts);
    } catch (error) {
      console.error('Failed to load toasts:', error);
    }
  };

  const handleCreateToast = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please provide both title and message');
      return;
    }

    try {
      const newToast = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      };

      setToasts(prev => [newToast, ...prev]);
      setShowCreateForm(false);
      resetForm();
      toast.success('Toast notification created successfully');

      if (onToastCreated) {
        onToastCreated(newToast);
      }
    } catch (error) {
      console.error('Failed to create toast:', error);
      toast.error('Failed to create toast notification');
    }
  };

  const handleDeleteToast = async (id: string) => {
    try {
      setToasts(prev => prev.filter(t => t.id !== id));
      toast.success('Toast notification deleted successfully');

      if (onToastDeleted) {
        onToastDeleted(id);
      }
    } catch (error) {
      console.error('Failed to delete toast:', error);
      toast.error('Failed to delete toast notification');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      priority: 'medium',
      category: 'system',
      actionText: '',
      actionUrl: '',
    });
  };

  const startToastDemo = () => {
    if (toasts.length === 0) {
      toast.error('No toasts available for demo');
      return;
    }

    setIsPlaying(true);
    setCurrentToastIndex(0);
    
    // Show first toast immediately
    showToast(toasts[0]);
  };

  const stopToastDemo = () => {
    setIsPlaying(false);
    if (playInterval) {
      clearInterval(playInterval);
      setPlayInterval(null);
    }
  };

  const showToast = (toastData: any) => {
    const toastOptions = {
      duration: toastData.duration,
      position: 'top-right' as const,
      style: {
        background: getToastBackground(toastData.type),
        color: getToastTextColor(toastData.type),
        border: `1px solid ${getToastBorderColor(toastData.type)}`,
        borderRadius: '8px',
        padding: '16px',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: getToastIcon(toastData.type),
    };

    if (toastData.actionText && toastData.actionUrl) {
      toast(
        (t) => (
          <div>
            <div className="font-semibold mb-2">{toastData.title}</div>
            <div className="text-sm mb-3">{toastData.message}</div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.open(toastData.actionUrl, '_blank');
                }}
                className="px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-colors"
              >
                {toastData.actionText}
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        toastOptions
      );
    } else {
      toast(toastData.message, toastOptions);
    }
  };

  const getToastBackground = (type: string) => {
    switch (type) {
      case 'success': return '#f0fdf4';
      case 'warning': return '#fffbeb';
      case 'error': return '#fef2f2';
      case 'info': return '#eff6ff';
      case 'quote': return '#faf5ff';
      case 'client': return '#f0f9ff';
      case 'system': return '#f9fafb';
      default: return '#f9fafb';
    }
  };

  const getToastTextColor = (type: string) => {
    switch (type) {
      case 'success': return '#166534';
      case 'warning': return '#92400e';
      case 'error': return '#dc2626';
      case 'info': return '#1d4ed8';
      case 'quote': return '#7c3aed';
      case 'client': return '#0369a1';
      case 'system': return '#374151';
      default: return '#374151';
    }
  };

  const getToastBorderColor = (type: string) => {
    switch (type) {
      case 'success': return '#bbf7d0';
      case 'warning': return '#fde68a';
      case 'error': return '#fecaca';
      case 'info': return '#bfdbfe';
      case 'quote': return '#ddd6fe';
      case 'client': return '#bae6fd';
      case 'system': return '#d1d5db';
      default: return '#d1d5db';
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'quote': return '📄';
      case 'client': return '👤';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getToastTypeColor = (type: string) => {
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

  const formatDuration = (ms: number) => {
    return `${ms / 1000}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Toast Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage toast notification templates
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={isPlaying ? 'outline' : 'default'}
            onClick={isPlaying ? stopToastDemo : startToastDemo}
            className={isPlaying ? 'text-red-600' : ''}
          >
            {isPlaying ? (
              <>
                <StopIcon className="h-4 w-4 mr-2" />
                Stop Demo
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Start Demo
              </>
            )}
          </Button>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Toast
          </Button>
        </div>
      </div>

      {/* Demo Status */}
      {isPlaying && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="animate-pulse">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Playing toast {currentToastIndex + 1} of {toasts.length}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                Next toast in: {toasts.length > 0 ? formatDuration(3000) : '0s'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Toast Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                >
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
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  <option value="system">System</option>
                  <option value="quote">Quote</option>
                  <option value="client">Client</option>
                  <option value="communication">Communication</option>
                  <option value="reminder">Reminder</option>
                  <option value="update">Update</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (ms)
                </label>
                <Input
                  type="number"
                  min="1000"
                  max="30000"
                  step="1000"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  placeholder="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <Input
                type="text"
                placeholder="Enter toast title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <Textarea
                placeholder="Enter toast message..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action Text (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., View Details"
                  value={formData.actionText}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionText: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}>
                Cancel
              </Button>
              
              <Button onClick={handleCreateToast}>
                Create Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toast Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Templates ({toasts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {toasts.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No toast templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toasts.map((toastItem) => (
                <Card key={toastItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full bg-${getToastTypeColor(toastItem.type)}-100`}>
                          {getToastIcon(toastItem.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{toastItem.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" color={getToastTypeColor(toastItem.type)}>
                              {toastItem.type}
                            </Badge>
                            <Badge variant="outline" color={getPriorityColor(toastItem.priority)}>
                              {toastItem.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <p>{toastItem.message}</p>
                      <p>Duration: {formatDuration(toastItem.duration)}</p>
                      <p>Category: {toastItem.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showToast(toastItem)}
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteToast(toastItem.id)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
