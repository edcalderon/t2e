import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Bell, ChevronLeft, Check, Star, Award } from "lucide-react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface Notification {
  id: string;
  type: "reward" | "challenge" | "achievement" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export default function NotificationsScreen({ onBack = () => {} }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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
        return <Award size={24} color="#22D3EE" />;
      case "challenge":
        return <Star size={24} color="#8B5CF6" />;
      case "achievement":
        return <Award size={24} color="#22D3EE" />;
      case "system":
      default:
        return <Bell size={24} color="#3B82F6" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Notification List */}
      <ScrollView style={styles.scrollView}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              notification.read ? styles.readNotification : styles.unreadNotification
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.notificationContent}>
              <View style={styles.iconContainer}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.timestamp}>
                    {notification.timestamp}
                  </Text>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors?.xqdark || '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  readNotification: {
    backgroundColor: '#ffffff',
  },
  unreadNotification: {
    backgroundColor: '#eff6ff',
  },
  notificationContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  notificationMessage: {
    color: '#374151',
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors?.xqcyan || '#22d3ee',
    marginLeft: 8,
    marginTop: 8,
  },
});