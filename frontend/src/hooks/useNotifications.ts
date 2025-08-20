import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  isRead: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Implement WebSocket connection for real-time notifications
    // For now, load mock notifications
    loadMockNotifications();
  }, []);

  const loadMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Quotation Created',
        message: 'Quotation #Q-001 has been created successfully.',
        type: 'quotation_created',
        priority: 'normal',
        status: 'unread',
        createdAt: new Date().toISOString(),
        isRead: false
      },
      {
        id: '2',
        title: 'Payment Received',
        message: 'Payment of $1,500 has been received for Invoice #INV-001.',
        type: 'payment_received',
        priority: 'high',
        status: 'unread',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: false
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true, status: 'read' }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true, status: 'read' }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    // Recalculate unread count
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };
};
