import { useState, useEffect } from 'react';
import { notificationService, Notification, NotificationStats, NotificationType } from '../lib/notificationService';
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
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;
    let statusCheckInterval: NodeJS.Timeout | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const updateNotifications = () => {
      if (!isMounted) return;
      const currentNotifications = notificationService.getNotifications();
      setNotifications(currentNotifications);
      setStats(notificationService.getStats());
    };

    const handleError = (error: Error) => {
      console.error('❌ Notification subscription error:', error);
      if (!isMounted) return;
      setConnectionStatus(false);
      
      // Clear any existing reconnect timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      // Attempt to reconnect after a delay
      reconnectTimeout = setTimeout(() => {
        if (isMounted) {
          initializeNotifications();
        }
      }, 5000);
    };

    const initializeNotifications = async () => {
      if (!isMounted || !isAuthenticated) {
        console.log(isMounted ? 'ℹ️ User not authenticated' : 'ℹ️ Component unmounted');
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        console.log('🔔 Initializing notifications for user:', user?.id);
        setIsLoading(true);
        
        await notificationService.initialize();
        
        // Subscribe to notification updates
        unsubscribe = notificationService.subscribe(updateNotifications);
        
        // Get initial notifications
        updateNotifications();
        
        // Monitor connection status more frequently
        statusCheckInterval = setInterval(() => {
          if (!isMounted) return;
          const currentStatus = notificationService.getConnectionStatus();
          setConnectionStatus(currentStatus);
          
          // If disconnected, try to reinitialize
          if (!currentStatus) {
            console.log('🔄 Connection lost, attempting to reconnect...');
            initializeNotifications();
          }
        }, 3000);
        
        setConnectionStatus(notificationService.getConnectionStatus());
        
      } catch (error) {
        console.error('❌ Failed to initialize notifications:', error);
        handleError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
      isMounted = false;
      if (unsubscribe) {
        console.log('🧹 Cleaning up notification subscription');
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
    type?: NotificationType;
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
    type?: NotificationType;
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