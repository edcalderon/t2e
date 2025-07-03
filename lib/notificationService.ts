import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType = 'system' | 'reward' | 'challenge' | 'achievement' | 'admin' | 'personal';

export interface Notification {
  id: string;
  type: NotificationType;
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
  private realtimeChannel: RealtimeChannel | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔔 Initializing notification service...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('❌ Error getting user for notifications:', userError);
        return;
      }

      this.currentUserId = user?.id || null;
      console.log('👤 Current user ID:', this.currentUserId);

      // Load notifications from storage first
      await this.loadNotifications();
      
      // Then sync with server
      await this.syncWithServer();
      
      // Setup realtime subscription
      await this.setupRealtimeSubscription();
      
      // Start connection monitoring
      this.startConnectionMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
      // Still mark as initialized to prevent infinite retry loops
      this.isInitialized = true;
    }
  }

  private async loadNotifications() {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifyListeners();
        console.log('📱 Loaded notifications from storage:', this.notifications.length);
      }
    } catch (error) {
      console.error('❌ Error loading notifications from storage:', error);
    }
  }

  private async syncWithServer() {
    try {
      if (!this.currentUserId) {
        console.log('ℹ️ No user ID, skipping server sync');
        return;
      }

      console.log('🔄 Syncing notifications with server...');
      
      // Fetch user-specific and global notifications
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${this.currentUserId},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }

      if (notifications) {
        this.notifications = notifications.map(this.transformNotification);
        await this.saveToStorage();
        this.notifyListeners();
        console.log('✅ Synced notifications from server:', notifications.length);
      }
    } catch (error) {
      console.error('❌ Error syncing notifications:', error);
    }
  }

  private async setupRealtimeSubscription() {
    try {
      // Clean up existing subscription
      await this.cleanupRealtimeSubscription();

      if (!this.currentUserId) {
        console.log('ℹ️ No user ID, skipping realtime setup');
        return;
      }

      console.log('🔗 Setting up realtime subscription...');

      // Create a unique channel name
      const channelName = `notifications_${this.currentUserId}_${Date.now()}`;
      
      this.realtimeChannel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: this.currentUserId },
        },
      });

      // Listen for INSERT events on notifications table
      this.realtimeChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${this.currentUserId}`,
          },
          (payload) => {
            console.log('📨 Received user notification:', payload);
            this.handleRealtimeNotification(payload.new);
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
            console.log('📢 Received global notification:', payload);
            this.handleRealtimeNotification(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${this.currentUserId}`,
          },
          (payload) => {
            console.log('📝 Notification updated:', payload);
            this.handleNotificationUpdate(payload.new);
          }
        )
        .subscribe((status, err) => {
          console.log('🔔 Realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('✅ Successfully subscribed to notifications');
          } else if (status === 'CHANNEL_ERROR') {
            this.isConnected = false;
            console.error('❌ Channel error:', err);
            this.handleConnectionError();
          } else if (status === 'TIMED_OUT') {
            this.isConnected = false;
            console.error('⏰ Subscription timed out');
            this.handleConnectionError();
          } else if (status === 'CLOSED') {
            this.isConnected = false;
            console.log('🔒 Subscription closed');
          }
        });

      // Start heartbeat to keep connection alive
      this.startHeartbeat();

    } catch (error) {
      console.error('❌ Error setting up realtime subscription:', error);
      this.handleConnectionError();
    }
  }

  private async cleanupRealtimeSubscription() {
    if (this.realtimeChannel) {
      console.log('🧹 Cleaning up existing realtime subscription...');
      try {
        await this.realtimeChannel.unsubscribe();
      } catch (error) {
        console.error('❌ Error unsubscribing from channel:', error);
      }
      this.realtimeChannel = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.isConnected = false;
  }

  private startHeartbeat() {
    // Send a heartbeat every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.realtimeChannel && this.isConnected) {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { timestamp: Date.now() },
        });
      }
    }, 30000);
  }

  private startConnectionMonitoring() {
    // Check connection status every 60 seconds
    this.connectionCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 60000);
  }

  private async checkConnectionHealth() {
    try {
      // Check if we're still authenticated
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('🔐 User no longer authenticated, cleaning up notifications');
        await this.cleanup();
        return;
      }

      // If user changed, reinitialize
      if (user.id !== this.currentUserId) {
        console.log('👤 User changed, reinitializing notifications');
        this.currentUserId = user.id;
        await this.setupRealtimeSubscription();
        await this.syncWithServer();
        return;
      }

      // Check if connection is still alive
      if (!this.isConnected && this.realtimeChannel) {
        console.log('🔄 Connection lost, attempting to reconnect...');
        await this.handleConnectionError();
      }
    } catch (error) {
      console.error('❌ Error checking connection health:', error);
    }
  }

  private async handleConnectionError() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(async () => {
      try {
        await this.setupRealtimeSubscription();
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
        this.handleConnectionError(); // Try again
      }
    }, delay);
  }

  private handleRealtimeNotification(dbNotification: any) {
    try {
      const notification = this.transformNotification(dbNotification);
      this.addNotification(notification);
      this.showPushNotification(notification);
    } catch (error) {
      console.error('❌ Error handling realtime notification:', error);
    }
  }

  private handleNotificationUpdate(dbNotification: any) {
    try {
      const notification = this.transformNotification(dbNotification);
      const index = this.notifications.findIndex(n => n.id === notification.id);
      
      if (index !== -1) {
        this.notifications[index] = notification;
        this.saveToStorage();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('❌ Error handling notification update:', error);
    }
  }

  private transformNotification(dbNotification: any): Notification {
    // Ensure the type is one of the allowed values, default to 'system' if invalid
    const validTypes: NotificationType[] = ['system', 'reward', 'challenge', 'achievement', 'admin', 'personal'];
    const notificationType: NotificationType = validTypes.includes(dbNotification.type as NotificationType)
      ? dbNotification.type as NotificationType
      : 'system';

    return {
      id: dbNotification.id,
      type: notificationType,
      title: dbNotification.title,
      message: dbNotification.message,
      data: dbNotification.data,
      read: dbNotification.read || false,
      createdAt: dbNotification.created_at || new Date().toISOString(),
      userId: dbNotification.user_id,
      adminId: dbNotification.admin_id,
      priority: dbNotification.priority || 'medium',
      expiresAt: dbNotification.expires_at,
      actionUrl: dbNotification.action_url,
      imageUrl: dbNotification.image_url,
    };
  }

  private addNotification(notification: Notification) {
    // Check if notification already exists
    const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
    
    if (existingIndex !== -1) {
      // Update existing notification
      this.notifications[existingIndex] = notification;
    } else {
      // Add new notification at the beginning
      this.notifications.unshift(notification);
      // Keep only latest 100 notifications
      this.notifications = this.notifications.slice(0, 100);
    }
    
    this.saveToStorage();
    this.notifyListeners();
  }

  private async saveToStorage() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('❌ Error saving notifications to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.notifications);
      } catch (error) {
        console.error('❌ Error notifying listener:', error);
      }
    });
  }

  private async showPushNotification(notification: Notification) {
    try {
      // For web, show browser notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const notificationOptions: NotificationOptions = {
            body: notification.message,
            icon: '/assets/images/icon.png',
            badge: '/assets/images/favicon.png',
            data: notification.data,
            tag: notification.id, // Prevent duplicate notifications
          };

          // Add vibration if supported
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }

          const browserNotification = new Notification(notification.title, notificationOptions);
          
          // Auto-close after 5 seconds
          setTimeout(() => {
            browserNotification.close();
          }, 5000);

          // Handle click
          browserNotification.onclick = () => {
            window.focus();
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
            browserNotification.close();
          };
        } else if (Notification.permission !== 'denied') {
          // Request permission if not already denied
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            this.showPushNotification(notification);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error showing push notification:', error);
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
      // Update locally first for immediate UI feedback
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

      if (error) {
        console.error('❌ Error marking notification as read on server:', error);
        // Revert local change if server update failed
        if (notification) {
          notification.read = false;
          await this.saveToStorage();
          this.notifyListeners();
        }
        throw error;
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      if (!this.currentUserId) {
        console.log('ℹ️ No user ID, cannot mark all as read');
        return;
      }

      // Update locally first
      const unreadNotifications = this.notifications.filter(n => !n.read);
      unreadNotifications.forEach(n => n.read = true);
      await this.saveToStorage();
      this.notifyListeners();

      // Update on server
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .or(`user_id.eq.${this.currentUserId},user_id.is.null`)
        .eq('read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read on server:', error);
        // Revert local changes if server update failed
        unreadNotifications.forEach(n => n.read = false);
        await this.saveToStorage();
        this.notifyListeners();
        throw error;
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      // Remove locally first
      const originalNotifications = [...this.notifications];
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      await this.saveToStorage();
      this.notifyListeners();

      // Delete from server (only if user owns it)
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error deleting notification from server:', error);
        // Revert local change if server delete failed
        this.notifications = originalNotifications;
        await this.saveToStorage();
        this.notifyListeners();
        throw error;
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  async refreshNotifications() {
    try {
      await this.syncWithServer();
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error);
      throw error;
    }
  }

  // Admin methods
  async sendGlobalNotification(notification: {
    title: string;
    message: string;
    type?: NotificationType;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
  }): Promise<{ success: boolean; message: string; notification?: Notification }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, message: 'Authentication required' };
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type || 'admin',
          title: notification.title,
          message: notification.message,
          data: {},
          user_id: null, // Global notification
          admin_id: user.id,
          priority: notification.priority || 'medium',
          expires_at: notification.expiresAt,
          action_url: notification.actionUrl,
          image_url: notification.imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      const transformedNotification = this.transformNotification(data);

      return {
        success: true,
        message: 'Global notification sent successfully',
        notification: transformedNotification
      };
    } catch (error) {
      console.error('❌ Error sending global notification:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send notification'
      };
    }
  }

  async sendUserNotification(userId: string, notification: {
    title: string;
    message: string;
    type?: NotificationType;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
  }): Promise<{ success: boolean; message: string; notification?: Notification }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, message: 'Authentication required' };
      }

      if (!userId) {
        return { success: false, message: 'User ID is required' };
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type || 'personal',
          title: notification.title,
          message: notification.message,
          data: {},
          user_id: userId,
          admin_id: user.id,
          priority: notification.priority || 'medium',
          expires_at: notification.expiresAt,
          action_url: notification.actionUrl,
          image_url: notification.imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      const transformedNotification = this.transformNotification(data);

      return {
        success: true,
        message: 'User notification sent successfully',
        notification: transformedNotification
      };
    } catch (error) {
      console.error('❌ Error sending user notification:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send notification'
      };
    }
  }

  async getAllNotifications(limit = 100, offset = 0) {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      return notifications?.map(this.transformNotification) || [];
    } catch (error) {
      console.error('❌ Error in getAllNotifications:', error);
      return [];
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
      console.error('❌ Error fetching notification analytics:', error);
      throw error;
    }
  }

  // Cleanup method
  async cleanup() {
    console.log('🧹 Cleaning up notification service...');
    
    await this.cleanupRealtimeSubscription();
    
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    
    this.listeners = [];
    this.isInitialized = false;
    this.currentUserId = null;
    this.reconnectAttempts = 0;
    
    console.log('✅ Notification service cleanup complete');
  }

  // Connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const notificationService = new NotificationService();