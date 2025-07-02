import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  Shield, 
  Send, 
  Users, 
  BarChart3, 
  Bell, 
  Plus, 
  Search,
  Filter,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Globe,
  User,
  X,
  Calendar,
  TrendingUp,
  MessageSquare,
  Settings
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminNotifications } from '../../hooks/useNotifications';

export default function AdminScreen() {
  const { theme, isDark } = useTheme();
  const { isAdmin, isLoading: adminLoading, permissions } = useAdmin();
  const { user, twitterUser, setShowSetupModal } = useAuth();
  const {
    isLoading,
    analytics,
    sendGlobalNotification,
    sendUserNotification,
    getAllNotifications,
    getAnalytics,
  } = useAdminNotifications();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'send' | 'manage' | 'analytics'>('dashboard');
  const [showSendModal, setShowSendModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'global' | 'user'>('all');

  // Send notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'admin',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    isGlobal: true,
    targetUserId: '',
    actionUrl: '',
    imageUrl: '',
    expiresAt: '',
  });

  const styles = createStyles(theme);

  useEffect(() => {
    if (isAdmin && permissions.canViewAnalytics) {
      loadData();
    }
  }, [isAdmin, permissions]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadNotifications(),
        loadAnalytics(),
        loadUsers(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getAllNotifications(50, 0);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      await getAnalytics();
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadUsers = async () => {
    // Mock users data - in real app, fetch from your user management system
    setUsers([
      { id: '1', username: 'cryptoking', email: 'crypto@example.com', status: 'active' },
      { id: '2', username: 'algotrader', email: 'algo@example.com', status: 'active' },
      { id: '3', username: 'web3guru', email: 'web3@example.com', status: 'inactive' },
    ]);
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      Alert.alert('Error', 'Please fill in title and message');
      return;
    }

    try {
      const notificationData = {
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        priority: notificationForm.priority,
        actionUrl: notificationForm.actionUrl || undefined,
        imageUrl: notificationForm.imageUrl || undefined,
        expiresAt: notificationForm.expiresAt || undefined,
      };

      if (notificationForm.isGlobal) {
        await sendGlobalNotification(notificationData);
        Alert.alert('Success', 'Global notification sent successfully!');
      } else {
        if (!notificationForm.targetUserId) {
          Alert.alert('Error', 'Please select a target user');
          return;
        }
        await sendUserNotification(notificationForm.targetUserId, notificationData);
        Alert.alert('Success', 'User notification sent successfully!');
      }

      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        type: 'admin',
        priority: 'medium',
        isGlobal: true,
        targetUserId: '',
        actionUrl: '',
        imageUrl: '',
        expiresAt: '',
      });
      setShowSendModal(false);
      await loadNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'global' && !notification.userId) ||
                         (filterType === 'user' && notification.userId);
    
    return matchesSearch && matchesFilter;
  });

  // Check admin access
  if (adminLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Checking admin access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.accessDeniedContainer}>
          <Shield size={64} color={theme.colors.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access the admin panel.
          </Text>
          <Text style={styles.accessDeniedSubtext}>
            Only authorized administrators can access this area.
          </Text>
          {!user && !twitterUser && (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => setShowSetupModal(true)}
            >
              <Text style={styles.loginButtonText}>Connect Account</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const renderDashboard = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
        <Text style={styles.welcomeSubtitle}>
          Welcome back, @{user?.username || twitterUser?.username}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Bell size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{analytics?.totalSent || 0}</Text>
          <Text style={styles.statLabel}>Total Sent</Text>
        </View>
        <View style={styles.statCard}>
          <Eye size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>{analytics?.totalRead || 0}</Text>
          <Text style={styles.statLabel}>Total Read</Text>
        </View>
        <View style={styles.statCard}>
          <Globe size={24} color={theme.colors.warning} />
          <Text style={styles.statValue}>{analytics?.globalNotifications || 0}</Text>
          <Text style={styles.statLabel}>Global</Text>
        </View>
        <View style={styles.statCard}>
          <User size={24} color={theme.colors.accent} />
          <Text style={styles.statValue}>{analytics?.userNotifications || 0}</Text>
          <Text style={styles.statLabel}>Targeted</Text>
        </View>
      </View>

      {/* Read Rate */}
      <View style={styles.readRateCard}>
        <View style={styles.readRateHeader}>
          <TrendingUp size={20} color={theme.colors.success} />
          <Text style={styles.readRateTitle}>Read Rate</Text>
        </View>
        <Text style={styles.readRateValue}>
          {analytics?.readRate?.toFixed(1) || 0}%
        </Text>
        <Text style={styles.readRateDescription}>
          Overall notification engagement rate
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => setShowSendModal(true)}
          >
            <Send size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Send Notification</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => setActiveTab('manage')}
          >
            <Settings size={24} color={theme.colors.accent} />
            <Text style={styles.quickActionText}>Manage</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => setActiveTab('analytics')}
          >
            <BarChart3 size={24} color={theme.colors.warning} />
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={loadData}
          >
            <TrendingUp size={24} color={theme.colors.success} />
            <Text style={styles.quickActionText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Notifications */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {notifications.slice(0, 3).map((notification) => (
          <View key={notification.id} style={styles.recentNotificationCard}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
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
            </View>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            <View style={styles.notificationMeta}>
              <Text style={styles.notificationTime}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.notificationType}>
                {notification.userId ? 'Targeted' : 'Global'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSendTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sendSection}>
        <Text style={styles.sectionTitle}>Send Notification</Text>
        
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={() => setShowSendModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>Create New Notification</Text>
        </TouchableOpacity>

        {/* Recent Sent Notifications */}
        <Text style={styles.subsectionTitle}>Recently Sent</Text>
        {notifications.slice(0, 5).map((notification) => (
          <View key={notification.id} style={styles.sentNotificationCard}>
            <View style={styles.sentNotificationHeader}>
              <Text style={styles.sentNotificationTitle}>{notification.title}</Text>
              <View style={styles.sentNotificationMeta}>
                <Text style={styles.sentNotificationTime}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </Text>
                {notification.userId ? (
                  <User size={16} color={theme.colors.accent} />
                ) : (
                  <Globe size={16} color={theme.colors.primary} />
                )}
              </View>
            </View>
            <Text style={styles.sentNotificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderManageTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.manageSection}>
        <Text style={styles.sectionTitle}>Manage Notifications</Text>
        
        {/* Search and Filter */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Search size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notifications..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['all', 'global', 'user'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                filterType === filter && styles.activeFilterTab
              ]}
              onPress={() => setFilterType(filter as any)}
            >
              <Text style={[
                styles.filterTabText,
                filterType === filter && styles.activeFilterTabText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        {filteredNotifications.map((notification) => (
          <View key={notification.id} style={styles.manageNotificationCard}>
            <View style={styles.manageNotificationHeader}>
              <View style={styles.manageNotificationTitleRow}>
                <Text style={styles.manageNotificationTitle}>{notification.title}</Text>
                <View style={styles.manageNotificationBadges}>
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
                  {notification.userId ? (
                    <User size={16} color={theme.colors.accent} />
                  ) : (
                    <Globe size={16} color={theme.colors.primary} />
                  )}
                </View>
              </View>
              <Text style={styles.manageNotificationTime}>
                {new Date(notification.createdAt).toLocaleString()}
              </Text>
            </View>
            <Text style={styles.manageNotificationMessage} numberOfLines={3}>
              {notification.message}
            </Text>
            <View style={styles.manageNotificationActions}>
              <TouchableOpacity style={styles.viewButton}>
                <Eye size={16} color={theme.colors.primary} />
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Trash2 size={16} color={theme.colors.error} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.analyticsSection}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        
        {/* Overview Stats */}
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <MessageSquare size={24} color={theme.colors.primary} />
            <Text style={styles.analyticsValue}>{analytics?.totalSent || 0}</Text>
            <Text style={styles.analyticsLabel}>Total Notifications</Text>
          </View>
          <View style={styles.analyticsCard}>
            <CheckCircle size={24} color={theme.colors.success} />
            <Text style={styles.analyticsValue}>{analytics?.totalRead || 0}</Text>
            <Text style={styles.analyticsLabel}>Read Notifications</Text>
          </View>
          <View style={styles.analyticsCard}>
            <TrendingUp size={24} color={theme.colors.warning} />
            <Text style={styles.analyticsValue}>
              {analytics?.readRate?.toFixed(1) || 0}%
            </Text>
            <Text style={styles.analyticsLabel}>Read Rate</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Clock size={24} color={theme.colors.accent} />
            <Text style={styles.analyticsValue}>
              {notifications.filter(n => !n.read).length}
            </Text>
            <Text style={styles.analyticsLabel}>Unread</Text>
          </View>
        </View>

        {/* By Type */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Notifications by Type</Text>
          {Object.entries(analytics?.byType || {}).map(([type, count]) => (
            <View key={type} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{type}</Text>
              <View style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      width: `${(count as number / analytics?.totalSent * 100) || 0}%`,
                      backgroundColor: getTypeColor(type)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.chartValue}>{count}</Text>
            </View>
          ))}
        </View>

        {/* By Priority */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Notifications by Priority</Text>
          {Object.entries(analytics?.byPriority || {}).map(([priority, count]) => (
            <View key={priority} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{priority}</Text>
              <View style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      width: `${(count as number / analytics?.totalSent * 100) || 0}%`,
                      backgroundColor: getPriorityColor(priority)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.chartValue}>{count}</Text>
            </View>
          ))}
        </View>
      </div>
    </ScrollView>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return theme.colors.warning;
      case 'medium': return theme.colors.primary;
      case 'low': return theme.colors.textSecondary;
      default: return theme.colors.primary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return theme.colors.primary;
      case 'system': return theme.colors.accent;
      case 'reward': return theme.colors.success;
      case 'challenge': return theme.colors.warning;
      case 'achievement': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
            <TrendingUp size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'send', label: 'Send', icon: Send },
          { id: 'manage', label: 'Manage', icon: Settings },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <IconComponent 
                size={20} 
                color={isActive ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                isActive && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'send' && renderSendTab()}
      {activeTab === 'manage' && renderManageTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Send Notification Modal */}
      <Modal
        visible={showSendModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSendModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Notification</Text>
            <TouchableOpacity onPress={() => setShowSendModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Notification Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notification Type</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Global Notification</Text>
                <Switch
                  value={notificationForm.isGlobal}
                  onValueChange={(value) => setNotificationForm(prev => ({ ...prev, isGlobal: value }))}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Target User (if not global) */}
            {!notificationForm.isGlobal && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Target User ID</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter user ID"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={notificationForm.targetUserId}
                  onChangeText={(text) => setNotificationForm(prev => ({ ...prev, targetUserId: text }))}
                />
              </View>
            )}

            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Notification title"
                placeholderTextColor={theme.colors.textSecondary}
                value={notificationForm.title}
                onChangeText={(text) => setNotificationForm(prev => ({ ...prev, title: text }))}
              />
            </View>

            {/* Message */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Notification message"
                placeholderTextColor={theme.colors.textSecondary}
                value={notificationForm.message}
                onChangeText={(text) => setNotificationForm(prev => ({ ...prev, message: text }))}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      notificationForm.priority === priority && styles.activePriorityButton,
                      { borderColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setNotificationForm(prev => ({ ...prev, priority: priority as any }))}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      notificationForm.priority === priority && styles.activePriorityButtonText,
                      { color: getPriorityColor(priority) }
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action URL (Optional) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Action URL (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://example.com"
                placeholderTextColor={theme.colors.textSecondary}
                value={notificationForm.actionUrl}
                onChangeText={(text) => setNotificationForm(prev => ({ ...prev, actionUrl: text }))}
              />
            </View>

            {/* Image URL (Optional) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Image URL (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={theme.colors.textSecondary}
                value={notificationForm.imageUrl}
                onChangeText={(text) => setNotificationForm(prev => ({ ...prev, imageUrl: text }))}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSendModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendModalButton, isLoading && styles.sendModalButtonDisabled]}
              onPress={handleSendNotification}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" />
                  <Text style={styles.sendModalButtonText}>Send</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  readRateCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  readRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  readRateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  readRateValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.success,
    marginBottom: 4,
  },
  readRateDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  recentNotificationCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  notificationType: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  sendSection: {
    padding: 16,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  sentNotificationCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  sentNotificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentNotificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  sentNotificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentNotificationTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  sentNotificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  manageSection: {
    padding: 16,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterButton: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeFilterTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  manageNotificationCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  manageNotificationHeader: {
    marginBottom: 8,
  },
  manageNotificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  manageNotificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  manageNotificationBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manageNotificationTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  manageNotificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  manageNotificationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '20',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.error + '20',
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '500',
  },
  analyticsSection: {
    padding: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 8,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  analyticsLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  chartLabel: {
    fontSize: 14,
    color: theme.colors.text,
    width: 80,
    textTransform: 'capitalize',
  },
  chartBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 4,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    width: 40,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activePriorityButton: {
    backgroundColor: theme.colors.surface,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  activePriorityButtonText: {
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sendModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    gap: 8,
  },
  sendModalButtonDisabled: {
    opacity: 0.6,
  },
  sendModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});