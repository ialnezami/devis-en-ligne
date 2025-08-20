import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove success and info notifications after 5 seconds
    if (notification.type === 'success' || notification.type === 'info') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
