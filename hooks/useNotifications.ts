import { useState, useEffect } from 'react';
import { notificationService, Notification, NotificationStats } from '../lib/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    recent: [],
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        
        // Subscribe to notification updates
        unsubscribe = notificationService.subscribe((updatedNotifications) => {
          setNotifications(updatedNotifications);
          setStats(notificationService.getStats());
        });

        // Get initial notifications
        setNotifications(notificationService.getNotifications());
        setStats(notificationService.getStats());
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const deleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
  };

  const refreshNotifications = async () => {
    setIsLoading(true);
    try {
      await notificationService.initialize();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    stats,
    isLoading,
    unreadCount: stats.unread,
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
      await notificationService.sendGlobalNotification(notification);
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
      await notificationService.sendUserNotification(userId, notification);
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