import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Bell, Award, Star, Trash2, CheckCircle, CheckCheck, Settings } from "lucide-react-native";
import { Image } from "expo-image";
import AccountSetupModal from "../../src/components/AccountSetupModal";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification } from "../../lib/notificationService";

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, showSetupModal, setShowSetupModal } = useAuth();
  const {
    notifications,
    stats,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const styles = createStyles(theme);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reward":
        return <Award size={24} color={theme.colors.warning} />;
      case "challenge":
        return <Star size={24} color={theme.colors.accent} />;
      case "achievement":
        return <Award size={24} color={theme.colors.success} />;
      case "admin":
        return <Bell size={24} color={theme.colors.primary} />;
      case "personal":
        return <Bell size={24} color={theme.colors.accent} />;
      case "system":
      default:
        return <Bell size={24} color={theme.colors.primary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return theme.colors.warning;
      case 'medium': return theme.colors.primary;
      case 'low': return theme.colors.textSecondary;
      default: return theme.colors.primary;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filterType === 'all' || 
                             (filterType === 'unread' && !notification.read) ||
                             (filterType === 'read' && notification.read);
    
    const matchesTypeFilter = selectedType === 'all' || notification.type === selectedType;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const notificationTypes = ['all', ...Object.keys(stats.byType)];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <CheckCheck size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
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

      {/* Stats Summary */}
      {isAuthenticated && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.total - stats.unread}</Text>
            <Text style={styles.statLabel}>Read</Text>
          </View>
        </View>
      )}

      {/* Filters */}
      {isAuthenticated && (
        <View style={styles.filtersContainer}>
          {/* Read Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {['all', 'unread', 'read'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  filterType === filter && styles.activeFilterChip
                ]}
                onPress={() => setFilterType(filter as any)}
              >
                <Text style={[
                  styles.filterChipText,
                  filterType === filter && styles.activeFilterChipText
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Type Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {notificationTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  selectedType === type && styles.activeTypeChip
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.typeChipText,
                  selectedType === type && styles.activeTypeChipText
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type !== 'all' && stats.byType[type] && (
                    <Text style={styles.typeCount}> ({stats.byType[type]})</Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Notification List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {isLoading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                notification.read ? styles.readNotification : styles.unreadNotification
              ]}
              onPress={() => !notification.read && handleMarkAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={styles.iconContainer}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={[
                        styles.notificationTitle,
                        !notification.read && styles.unreadTitle
                      ]}>
                        {notification.title}
                      </Text>
                      <View style={styles.metaContainer}>
                        {notification.priority && notification.priority !== 'medium' && (
                          <View style={[
                            styles.priorityBadge,
                            { backgroundColor: getPriorityColor(notification.priority) + '20' }
                          ]}>
                            <Text style={[
                              styles.priorityText,
                              { color: getPriorityColor(notification.priority) }
                            ]}>
                              {notification.priority}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.timestamp}>
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    
                    {/* Action URL */}
                    {notification.actionUrl && (
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>View Details</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                {/* Notification Actions */}
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <TouchableOpacity 
                      style={styles.markReadButton}
                      onPress={() => handleMarkAsRead(notification.id)}
                    >
                      <CheckCircle size={16} color={theme.colors.success} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                
                {!notification.read && (
                  <View style={styles.unreadIndicator} />
                )}
              </View>

              {/* Image if available */}
              {notification.imageUrl && (
                <Image
                  source={{ uri: notification.imageUrl }}
                  style={styles.notificationImage}
                  contentFit="cover"
                />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>
              {filterType === 'unread' ? 'No unread notifications' : 
               filterType === 'read' ? 'No read notifications' : 
               'No notifications yet'}
            </Text>
            {!isAuthenticated ? (
              <TouchableOpacity onPress={() => setShowSetupModal(true)}>
                <Text style={styles.emptyStateLink}>
                  Connect your account to start receiving notifications
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyStateText}>
                {filterType === 'all' 
                  ? "You'll see notifications about rewards, challenges, and achievements here"
                  : `No ${filterType} notifications found`
                }
              </Text>
            )}
          </View>
        )}
      </ScrollView>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  activeTypeChip: {
    backgroundColor: theme.colors.accent + '20',
    borderColor: theme.colors.accent,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTypeChipText: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  typeCount: {
    fontSize: 10,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    position: 'relative',
  },
  readNotification: {
    backgroundColor: theme.colors.background,
  },
  unreadNotification: {
    backgroundColor: theme.colors.surface,
  },
  notificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationHeader: {
    flexDirection: 'row',
    flex: 1,
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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  notificationMessage: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  notificationActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  markReadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.success + '20',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.error + '20',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 4,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    transform: [{ translateY: -4 }],
  },
  notificationImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
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