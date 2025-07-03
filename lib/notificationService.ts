import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { webSocketService } from './websocketService';

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
        
      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

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

      // Set auth token for WebSocket
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        webSocketService.setAuthToken(session.access_token);
      }

      // Connect to WebSocket
      await webSocketService.connect();

      // Define the expected WebSocket message type
      interface WebSocketMessage {
        type: string;
        data: any; // You might want to replace 'any' with a more specific type
      }

      // Type guard to check if the message is a WebSocketMessage
      const isWebSocketMessage = (message: unknown): message is WebSocketMessage => {
        return (
          typeof message === 'object' &&
          message !== null &&
          'type' in message &&
          typeof (message as WebSocketMessage).type === 'string' &&
          'data' in message
        );
      };

      // Subscribe to WebSocket messages
      const unsubscribe = webSocketService.addMessageHandler((message: unknown) => {
        try {
          if (!isWebSocketMessage(message)) {
            console.warn('Received invalid WebSocket message format:', message);
            return;
          }
          
          if (message.type === 'notification' || message.type === 'user_notification') {
            console.log('Processing notification:', message.type, message.data);
            const notification = this.transformNotification(message.data);
            this.addNotification(notification);
            this.showPushNotification(notification);
          } else {
            console.log('Unhandled WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      // Also keep Supabase realtime as fallback
      const channel = supabase
        .channel('notifications-fallback')
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

      // Return cleanup function
      return () => {
        unsubscribe();
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
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

  private async showPushNotification(notification: Notification) {
    try {
      // For web, show browser notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker?.ready;
          const notificationOptions: NotificationOptions = {
            body: notification.message,
            icon: '/assets/images/icon.png',
            badge: '/assets/images/favicon.png',
            data: notification.data,
          };

          // Add vibration if supported
          if ('vibrate' in Notification.prototype) {
            (notificationOptions as any).vibrate = [200, 100, 200];
          }

          if (registration?.showNotification) {
            // Use service worker for notifications if available
            await registration.showNotification(notification.title, notificationOptions);
          } else {
            // Fallback to regular notifications
            new Notification(notification.title, notificationOptions);
          }
        } else if (Notification.permission !== 'denied') {
          // Request permission if not already denied
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            this.showPushNotification(notification);
          }
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error);
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

  private async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'> & { id?: string }) {
    // Ensure type is valid
    const validTypes: NotificationType[] = ['system', 'reward', 'challenge', 'achievement', 'admin', 'personal'];
    const notificationType: NotificationType = validTypes.includes(notification.type as NotificationType)
      ? notification.type as NotificationType
      : 'system';

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notificationType,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          user_id: notification.userId,
          admin_id: notification.adminId,
          priority: notification.priority || 'medium',
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

      const result = await this.createNotification({
        ...notification,
        type: notification.type || 'admin',
        priority: notification.priority || 'medium',
        userId: undefined, // Global notification
        adminId: user.id,
      });

      // Notify all connected clients via WebSocket
      try {
        if (webSocketService.getConnectionStatus()) {
          console.log('Sending WebSocket notification:', result);
          await webSocketService.sendMessage({
            type: 'notification',
            payload: result
          });
          console.log('WebSocket notification sent successfully');
        } else {
          console.warn('WebSocket not connected, skipping real-time notification');
        }
      } catch (wsError) {
        console.warn('WebSocket notification failed, falling back to polling', wsError);
        // The notification is still saved, clients will sync on next poll
      }

      return {
        success: true,
        message: 'Notification sent successfully',
        notification: result
      };
    } catch (error) {
      console.error('Error sending global notification:', error);
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

      const result = await this.createNotification({
        ...notification,
        type: notification.type || 'personal',
        priority: notification.priority || 'medium',
        userId,
        adminId: user.id,
      });

      // Notify the specific user via WebSocket if they're connected
      try {
        if (webSocketService.getConnectionStatus()) {
          console.log('Sending user WebSocket notification:', { userId, notification: result });
          await webSocketService.sendMessage({
            type: 'user_notification',
            userId,
            payload: result
          });
          console.log('User WebSocket notification sent successfully');
        } else {
          console.warn('WebSocket not connected, skipping real-time user notification');
        }
      } catch (wsError) {
        console.warn('WebSocket user notification failed, falling back to polling', wsError);
        // The notification is still saved, client will sync on next poll
      }

      return {
        success: true,
        message: 'Notification sent successfully',
        notification: result
      };
    } catch (error) {
      console.error('Error sending user notification:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send notification'
      };
    }
  }

  async getAllNotifications(limit = 100, offset = 0) {
    try {
      // First, get the basic notification data
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!notifications) return [];

      // Transform notifications and fetch user data if needed
      const transformed = await Promise.all(notifications.map(async (notification) => {
        const transformed = this.transformNotification(notification);
        
        // If you need user/admin data, fetch it separately
        if (notification.user_id || notification.admin_id) {
          const userId = notification.user_id;
          const adminId = notification.admin_id;
          const userData = userId ? await this.getUserData(userId) : null;
          const adminData = adminId ? await this.getUserData(adminId) : null;
          
          return {
            ...transformed,
            user: userData,
            admin: adminData
          };
        }
        
        return transformed;
      }));

      return transformed;
    } catch (error) {
      console.error('Error in getAllNotifications:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Helper method to get user data
  private async getUserData(userId: string) {
    try {
      // First, get the user's auth data which includes email
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error('Error fetching auth data:', authError);
        return null;
      }
      
      // Then get the profile data excluding email since it's in auth
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url') // Removed email as it's in auth
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        // Return just the auth data if we can't get profile
        return { 
          id: userId,
          email: authData.user?.email,
          username: authData.user?.email?.split('@')[0] || 'User'
        };
      }
      
      // Combine auth and profile data
      return {
        ...profileData,
        email: authData.user?.email
      };
    } catch (error) {
      console.error('Error in getUserData:', error);
      return {
        id: userId,
        username: 'User',
        email: null
      };
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