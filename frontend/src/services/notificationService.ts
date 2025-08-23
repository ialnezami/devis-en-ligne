import axios from 'axios';

// Notification Interfaces
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'quote' | 'client' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'quote' | 'client' | 'system' | 'communication' | 'reminder' | 'update';
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
  archivedAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  quoteNotifications: boolean;
  clientNotifications: boolean;
  systemNotifications: boolean;
  reminderNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  categories: {
    quote: boolean;
    client: boolean;
    system: boolean;
    communication: boolean;
    reminder: boolean;
    update: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  digestEnabled: boolean;
  digestTime: string; // HH:mm format
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  title: string;
  message: string;
  variables: string[];
  isActive: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  recentActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

// API Response Interfaces
export interface NotificationResponse {
  success: boolean;
  notification?: Notification;
  notifications?: Notification[];
  message?: string;
  error?: string;
}

export interface NotificationPreferencesResponse {
  success: boolean;
  preferences?: NotificationPreferences;
  message?: string;
  error?: string;
}

export interface NotificationStatsResponse {
  success: boolean;
  stats?: NotificationStats;
  message?: string;
  error?: string;
}

// Notification Service
export class NotificationService {
  private baseUrl: string;
  private pushSupported: boolean;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null;

  constructor(baseUrl: string = '/api/notifications') {
    this.baseUrl = baseUrl;
    this.pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.serviceWorkerRegistration = null;
    this.initializePushNotifications();
  }

  // Initialize push notifications
  private async initializePushNotifications() {
    if (this.pushSupported) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered for push notifications');
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    }
  }

  // Get all notifications
  async getNotifications(filters?: {
    type?: string;
    category?: string;
    priority?: string;
    isRead?: boolean;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
      if (filters?.isArchived !== undefined) params.append('isArchived', filters.isArchived.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await axios.get(`${this.baseUrl}?${params.toString()}`);
      return response.data.notifications || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  // Get a single notification
  async getNotification(id: string): Promise<Notification | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data.notification || null;
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      return null;
    }
  }

  // Create a new notification
  async createNotification(notificationData: Partial<Notification>): Promise<Notification | null> {
    try {
      const response = await axios.post(this.baseUrl, notificationData);
      return response.data.notification || null;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  // Update a notification
  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, updates);
      return response.data.notification || null;
    } catch (error) {
      console.error('Failed to update notification:', error);
      return null;
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<boolean> {
    try {
      await axios.put(`${this.baseUrl}/${id}/read`);
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  // Mark notification as unread
  async markAsUnread(id: string): Promise<boolean> {
    try {
      await axios.put(`${this.baseUrl}/${id}/unread`);
      return true;
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      return false;
    }
  }

  // Archive a notification
  async archiveNotification(id: string): Promise<boolean> {
    try {
      await axios.put(`${this.baseUrl}/${id}/archive`);
      return true;
    } catch (error) {
      console.error('Failed to archive notification:', error);
      return false;
    }
  }

  // Unarchive a notification
  async unarchiveNotification(id: string): Promise<boolean> {
    try {
      await axios.put(`${this.baseUrl}/${id}/unarchive`);
      return true;
    } catch (error) {
      console.error('Failed to unarchive notification:', error);
      return false;
    }
  }

  // Delete a notification
  async deleteNotification(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  // Bulk mark notifications as read
  async markMultipleAsRead(ids: string[]): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/bulk-read`, { ids });
      return true;
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      return false;
    }
  }

  // Bulk archive notifications
  async archiveMultiple(ids: string[]): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/bulk-archive`, { ids });
      return true;
    } catch (error) {
      console.error('Failed to archive notifications:', error);
      return false;
    }
  }

  // Bulk delete notifications
  async deleteMultiple(ids: string[]): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/bulk-delete`, { ids });
      return true;
    } catch (error) {
      console.error('Failed to delete notifications:', error);
      return false;
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<NotificationStats | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/stats`);
      return response.data.stats || null;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      return null;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/preferences`);
      return response.data.preferences || null;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return null;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences | null> {
    try {
      const response = await axios.put(`${this.baseUrl}/preferences`, preferences);
      return response.data.preferences || null;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return null;
    }
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/templates`);
      return response.data.templates || [];
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      return [];
    }
  }

  // Create notification template
  async createNotificationTemplate(templateData: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    try {
      const response = await axios.post(`${this.baseUrl}/templates`, templateData);
      return response.data.template || null;
    } catch (error) {
      console.error('Failed to create notification template:', error);
      return null;
    }
  }

  // Update notification template
  async updateNotificationTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    try {
      const response = await axios.put(`${this.baseUrl}/templates/${id}`, updates);
      return response.data.template || null;
    } catch (error) {
      console.error('Failed to update notification template:', error);
      return null;
    }
  }

  // Delete notification template
  async deleteNotificationTemplate(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/templates/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification template:', error);
      return false;
    }
  }

  // Request push notification permission
  async requestPushPermission(): Promise<boolean> {
    if (!this.pushSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request push permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.pushSupported || !this.serviceWorkerRegistration) {
      console.warn('Push notifications not supported or service worker not registered');
      return null;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      // Send subscription to server
      await this.sendPushSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removePushSubscription(subscription);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Send push subscription to server
  private async sendPushSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/push-subscription`, {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to send push subscription to server:', error);
      return false;
    }
  }

  // Remove push subscription from server
  private async removePushSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/push-subscription`, {
        data: { endpoint: subscription.endpoint }
      });
      return true;
    } catch (error) {
      console.error('Failed to remove push subscription from server:', error);
      return false;
    }
  }

  // Send test push notification
  async sendTestPushNotification(): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/test-push`);
      return true;
    } catch (error) {
      console.error('Failed to send test push notification:', error);
      return false;
    }
  }

  // Utility methods for push notifications
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Check if push notifications are supported
  isPushSupported(): boolean {
    return this.pushSupported;
  }

  // Check if push notifications are enabled
  async isPushEnabled(): Promise<boolean> {
    if (!this.pushSupported) return false;
    
    try {
      const subscription = await this.serviceWorkerRegistration?.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      return false;
    }
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    try {
      const stats = await this.getNotificationStats();
      return stats?.unread || 0;
    } catch (error) {
      return 0;
    }
  }

  // Create system notification (for testing)
  async createSystemNotification(title: string, message: string, type: Notification['type'] = 'info'): Promise<Notification | null> {
    return this.createNotification({
      type,
      title,
      message,
      category: 'system',
      priority: 'medium',
      isRead: false,
      isArchived: false
    });
  }

  // Create quote notification
  async createQuoteNotification(quoteId: string, title: string, message: string, priority: Notification['priority'] = 'medium'): Promise<Notification | null> {
    return this.createNotification({
      type: 'quote',
      title,
      message,
      category: 'quote',
      priority,
      relatedEntityType: 'quote',
      relatedEntityId: quoteId,
      isRead: false,
      isArchived: false
    });
  }

  // Create client notification
  async createClientNotification(clientId: string, title: string, message: string, priority: Notification['priority'] = 'medium'): Promise<Notification | null> {
    return this.createNotification({
      type: 'client',
      title,
      message,
      category: 'client',
      priority,
      relatedEntityType: 'client',
      relatedEntityId: clientId,
      isRead: false,
      isArchived: false
    });
  }
}

// Export default instance
export const notificationService = new NotificationService();
