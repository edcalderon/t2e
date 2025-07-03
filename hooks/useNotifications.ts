import { useState, useEffect } from 'react';
import { notificationService, Notification, NotificationStats } from '../lib/notificationService';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    recent: [],
  });
  const [connectionStatus, setConnectionStatus] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let statusCheckInterval: NodeJS.Timeout | null = null;

    const initializeNotifications = async () => {
      if (!isAuthenticated) {
        console.log('ℹ️ User not authenticated, skipping notification initialization');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔔 Initializing notifications for user:', user?.id);
        
        await notificationService.initialize();
        
        // Subscribe to notification updates
        unsubscribe = notificationService.subscribe((updatedNotifications) => {
          setNotifications(updatedNotifications);
          setStats(notificationService.getStats());
        });

        // Get initial notifications
        setNotifications(notificationService.getNotifications());
        setStats(notificationService.getStats());
        
        // Monitor connection status
        statusCheckInterval = setInterval(() => {
          setConnectionStatus(notificationService.getConnectionStatus());
        }, 5000);
        
        setConnectionStatus(notificationService.getConnectionStatus());
        
      } catch (error) {
        console.error('❌ Failed to initialize notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      initializeNotifications();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        byType: {},
        recent: [],
      });
      setIsLoading(false);
      setConnectionStatus(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [isAuthenticated, user?.id]);

  // Cleanup when component unmounts or user changes
  useEffect(() => {
    return () => {
      if (!isAuthenticated) {
        notificationService.cleanup();
      }
    };
  }, [isAuthenticated]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  };

  const refreshNotifications = async () => {
    setIsLoading(true);
    try {
      await notificationService.refreshNotifications();
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    stats,
    isLoading,
    unreadCount: stats.unread,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};

export const useAdminNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  const sendGlobalNotification = async (notification: {
    title: string;
    message: string;
    type?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
  }) => {
    setIsLoading(true);
    try {
      return await notificationService.sendGlobalNotification(notification);
    } finally {
      setIsLoading(false);
    }
  };

  const sendUserNotification = async (userId: string, notification: {
    title: string;
    message: string;
    type?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
  }) => {
    setIsLoading(true);
    try {
      return await notificationService.sendUserNotification(userId, notification);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllNotifications = async (limit = 100, offset = 0) => {
    setIsLoading(true);
    try {
      return await notificationService.getAllNotifications(limit, offset);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotificationAnalytics();
      setAnalytics(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    analytics,
    sendGlobalNotification,
    sendUserNotification,
    getAllNotifications,
    getAnalytics,
  };
};