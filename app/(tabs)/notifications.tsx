import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Bell, Award, Star } from "lucide-react-native";
import ResponsiveLayout from "../../components/ResponsiveLayout";
import AccountSetupModal from "../../src/components/AccountSetupModal";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

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
  const { theme, isDark } = useTheme();
  const { isAuthenticated, showSetupModal, setShowSetupModal } = useAuth();
  const styles = createStyles(theme);
  
  const [notifications, setNotifications] = useState<Notification[]>(
    isAuthenticated ? [
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
    ] : []
  );

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      ),
    );
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reward":
        return <Award size={24} color={theme.colors.warning} />;
      case "challenge":
        return <Star size={24} color={theme.colors.accent} />;
      case "achievement":
        return <Award size={24} color={theme.colors.success} />;
      case "system":
      default:
        return <Bell size={24} color={theme.colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      <ResponsiveLayout>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {/* Authentication Banner */}
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.authBanner}
            onPress={() => setShowSetupModal(true)}
          >
            <Bell size={20} color={theme.colors.primary} />
            <Text style={styles.authBannerText}>
              Connect your account to receive notifications about rewards and challenges
            </Text>
          </TouchableOpacity>
        )}

        {/* Notification List */}
        <ScrollView style={styles.scrollView}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
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
            ))
          ) : (
            <View style={styles.emptyState}>
              <Bell size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No notifications yet</Text>
              {!isAuthenticated ? (
                <TouchableOpacity onPress={() => setShowSetupModal(true)}>
                  <Text style={styles.emptyStateLink}>
                    Connect your account to start receiving notifications
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.emptyStateText}>
                  You'll see notifications about rewards, challenges, and achievements here
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </ResponsiveLayout>

      {/* Account Setup Modal */}
      {showSetupModal && (
        <AccountSetupModal
          isVisible={showSetupModal}
          onComplete={handleSetupComplete}
          onClose={() => setShowSetupModal(false)}
        />
      )}
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
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  authBanner: {
    backgroundColor: theme.colors.primary + '10',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authBannerText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  readNotification: {
    backgroundColor: theme.colors.background,
  },
  unreadNotification: {
    backgroundColor: theme.colors.surface,
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
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  notificationMessage: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateLink: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});