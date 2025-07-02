import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export interface Notification {
  id: string;
  type: 'system' | 'reward' | 'challenge' | 'achievement' | 'admin' | 'personal';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  userId?: string; // If null, it's a global notification
  adminId?: string; // ID of admin who sent it
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
  actionUrl?: string;
  imageUrl?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recent: Notification[];
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadNotifications();
      await this.setupRealtimeSubscription();
      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  private async loadNotifications() {
    try {
      // Load from local storage first for immediate display
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifyListeners();
      }

      // Then sync with server
      await this.syncWithServer();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private async syncWithServer() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user-specific and global notifications
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (notifications) {
        this.notifications = notifications.map(this.transformNotification);
        await this.saveToStorage();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error syncing notifications:', error);
    }
  }

  private async setupRealtimeSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to new notifications
      supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = this.transformNotification(payload.new);
            this.addNotification(notification);
            this.showPushNotification(notification);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: 'user_id=is.null', // Global notifications
          },
          (payload) => {
            const notification = this.transformNotification(payload.new);
            this.addNotification(notification);
            this.showPushNotification(notification);
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  }

  private transformNotification(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      type: dbNotification.type,
      title: dbNotification.title,
      message: dbNotification.message,
      data: dbNotification.data,
      read: dbNotification.read || false,
      createdAt: dbNotification.created_at,
      userId: dbNotification.user_id,
      adminId: dbNotification.admin_id,
      priority: dbNotification.priority || 'medium',
      expiresAt: dbNotification.expires_at,
      actionUrl: dbNotification.action_url,
      imageUrl: dbNotification.image_url,
    };
  }

  private addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.notifications = this.notifications.slice(0, 100); // Keep only latest 100
    this.saveToStorage();
    this.notifyListeners();
  }

  private async saveToStorage() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  private showPushNotification(notification: Notification) {
    // For web, show browser notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/assets/images/icon.png',
          badge: '/assets/images/favicon.png',
          tag: notification.id,
          data: notification.data,
        });
      }
    }
  }

  // Public methods
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getStats(): NotificationStats {
    const byType: Record<string, number> = {};
    this.notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    return {
      total: this.notifications.length,
      unread: this.getUnreadCount(),
      byType,
      recent: this.notifications.slice(0, 5),
    };
  }

  async markAsRead(notificationId: string) {
    try {
      // Update locally
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        await this.saveToStorage();
        this.notifyListeners();
      }

      // Update on server
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update locally
      this.notifications.forEach(n => n.read = true);
      await this.saveToStorage();
      this.notifyListeners();

      // Update on server
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .or(`user_id.eq.${user.id},user_id.is.null`);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      // Remove locally
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      await this.saveToStorage();
      this.notifyListeners();

      // Delete from server (only if user owns it)
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          user_id: notification.userId,
          admin_id: notification.adminId,
          priority: notification.priority,
          expires_at: notification.expiresAt,
          action_url: notification.actionUrl,
          image_url: notification.imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformNotification(data);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Admin methods
  async sendGlobalNotification(notification: {
    title: string;
    message: string;
    type?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return await this.createNotification({
        ...notification,
        type: notification.type || 'admin',
        priority: notification.priority || 'medium',
        userId: undefined, // Global notification
        adminId: user.id,
      });
    } catch (error) {
      console.error('Error sending global notification:', error);
      throw error;
    }
  }

  async sendUserNotification(userId: string, notification: {
    title: string;
    message: string;
    type?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return await this.createNotification({
        ...notification,
        type: notification.type || 'personal',
        priority: notification.priority || 'medium',
        userId,
        adminId: user.id,
      });
    } catch (error) {
      console.error('Error sending user notification:', error);
      throw error;
    }
  }

  async getAllNotifications(limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          user:user_id(username, email),
          admin:admin_id(username, email)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data?.map(this.transformNotification) || [];
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  }

  async getNotificationAnalytics() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('type, priority, read, created_at, user_id');

      if (error) throw error;

      const analytics = {
        totalSent: data?.length || 0,
        totalRead: data?.filter(n => n.read).length || 0,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        globalNotifications: data?.filter(n => !n.user_id).length || 0,
        userNotifications: data?.filter(n => n.user_id).length || 0,
        readRate: 0,
      };

      data?.forEach(n => {
        analytics.byType[n.type] = (analytics.byType[n.type] || 0) + 1;
        analytics.byPriority[n.priority] = (analytics.byPriority[n.priority] || 0) + 1;
      });

      analytics.readRate = analytics.totalSent > 0 
        ? (analytics.totalRead / analytics.totalSent) * 100 
        : 0;

      return analytics;
    } catch (error) {
      console.error('Error fetching notification analytics:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();