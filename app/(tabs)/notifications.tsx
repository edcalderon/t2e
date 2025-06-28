import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Bell, Check, Star, Award } from "lucide-react-native";
import { useTheme } from '../../contexts/ThemeContext';

interface Notification {
  id: string;
  type: "reward" | "challenge" | "achievement" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "reward",
      title: "Reward Received!",
      message:
        "You earned 25 ALGO for completing the Tech Innovation challenge.",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "challenge",
      title: "New Challenge Available",
      message:
        "A new Crypto Education challenge is now available. Earn up to 40 ALGO!",
      timestamp: "5 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "achievement",
      title: "Achievement Unlocked",
      message:
        "You've earned the 'Retweet Hero' badge for getting 100+ retweets!",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: "4",
      type: "system",
      title: "Welcome to XQuests",
      message:
        "Complete your profile to start earning rewards for your tweets.",
      timestamp: "2 days ago",
      read: true,
    },
    {
      id: "5",
      type: "reward",
      title: "Bonus Reward!",
      message: "You received a 10 ALGO bonus for consistent engagement.",
      timestamp: "3 days ago",
      read: true,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      ),
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reward":
        return <Award size={24} color={theme.colors.primary} />;
      case "challenge":
        return <Star size={24} color={theme.colors.accent} />;
      case "achievement":
        return <Award size={24} color={theme.colors.warning} />;
      case "system":
      default:
        return <Bell size={24} color={theme.colors.primary} />;
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Notification List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadNotification
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.notificationContent}>
              <View style={styles.iconContainer}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.timestamp}>
                    {notification.timestamp}
                  </Text>
                </View>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
              </View>
              {!notification.read && (
                <View style={styles.unreadIndicator} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  unreadNotification: {
    backgroundColor: theme.colors.primaryLight,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    marginTop: 8,
  },
});