import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, undefined means persistent
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  maxNotifications: number;
  autoHideDuration: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  maxNotifications: 5,
  autoHideDuration: 5000, // 5 seconds
  position: (localStorage.getItem('notificationPosition') as NotificationState['position']) || 'top-right',
  soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
  desktopNotifications: localStorage.getItem('desktopNotifications') !== 'false',
};

// Helper function to generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: generateId(),
        timestamp: Date.now(),
        read: false,
      };
      
      // Add to beginning of array
      state.notifications.unshift(newNotification);
      
      // Limit the number of notifications
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
      
      // Update unread count
      state.unreadCount = state.notifications.filter(n => !n.read).length;
      
      // Auto-remove notification after duration (if specified)
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          // Note: This will be handled by the component using useEffect
        }, newNotification.duration);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    clearNotificationsByType: (state, action: PayloadAction<NotificationType>) => {
      const removedCount = state.notifications.filter(n => n.type === action.payload).length;
      state.notifications = state.notifications.filter(n => n.type !== action.payload);
      state.unreadCount = Math.max(0, state.unreadCount - removedCount);
    },
    setMaxNotifications: (state, action: PayloadAction<number>) => {
      state.maxNotifications = action.payload;
      // Trim existing notifications if needed
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
        // Recalculate unread count
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      }
    },
    setAutoHideDuration: (state, action: PayloadAction<number>) => {
      state.autoHideDuration = action.payload;
    },
    setPosition: (state, action: PayloadAction<NotificationState['position']>) => {
      state.position = action.payload;
      localStorage.setItem('notificationPosition', action.payload);
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('soundEnabled', state.soundEnabled.toString());
    },
    toggleDesktopNotifications: (state) => {
      state.desktopNotifications = !state.desktopNotifications;
      localStorage.setItem('desktopNotifications', state.desktopNotifications.toString());
    },
    // Quick notification methods
    showSuccess: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'success',
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || state.autoHideDuration,
        timestamp: Date.now(),
        read: false,
      };
      
      state.notifications.unshift(notification);
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    showError: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'error',
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || state.autoHideDuration,
        timestamp: Date.now(),
        read: false,
      };
      
      state.notifications.unshift(notification);
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    showWarning: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'warning',
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || state.autoHideDuration,
        timestamp: Date.now(),
        read: false,
      };
      
      state.notifications.unshift(notification);
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    showInfo: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'info',
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || state.autoHideDuration,
        timestamp: Date.now(),
        read: false,
      };
      
      state.notifications.unshift(notification);
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  clearNotificationsByType,
  setMaxNotifications,
  setAutoHideDuration,
  setPosition,
  toggleSound,
  toggleDesktopNotifications,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} = notificationSlice.actions;

export default notificationSlice.reducer;
