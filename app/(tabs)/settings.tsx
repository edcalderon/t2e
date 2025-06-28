import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { User, Wallet, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight } from "lucide-react-native";
import ResponsiveLayout from "../../components/ResponsiveLayout";
import AccountSetupModal from "../../src/components/AccountSetupModal";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const { user, isAuthenticated, logout, showSetupModal, setShowSetupModal } = useAuth();
  const styles = createStyles(theme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoTweetEnabled, setAutoTweetEnabled] = useState(false);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: "Profile Information",
          icon: <User size={20} color={theme.colors.primary} />,
          action: "navigate",
          requiresAuth: true,
        },
        {
          id: "wallet",
          title: "Wallet Settings",
          icon: <Wallet size={20} color={theme.colors.primary} />,
          action: "navigate",
          requiresAuth: true,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "notifications",
          title: "Notifications",
          icon: <Bell size={20} color={theme.colors.accent} />,
          action: "toggle",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
          requiresAuth: true,
        },
        {
          id: "darkMode",
          title: "Dark Mode",
          icon: <Shield size={20} color={theme.colors.primary} />,
          action: "toggle",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
          requiresAuth: false,
        },
        {
          id: "autoTweet",
          title: "Auto-Tweet Challenges",
          icon: <Shield size={20} color={theme.colors.accent} />,
          action: "toggle",
          value: autoTweetEnabled,
          onToggle: setAutoTweetEnabled,
          requiresAuth: true,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help & Support",
          icon: <HelpCircle size={20} color={theme.colors.primary} />,
          action: "navigate",
          requiresAuth: false,
        },
        ...(isAuthenticated ? [{
          id: "logout",
          title: "Log Out",
          icon: <LogOut size={20} color={theme.colors.error} />,
          action: "button",
          danger: true,
          requiresAuth: true,
        }] : []),
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      <ResponsiveLayout>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Authentication Banner */}
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.authBanner}
            onPress={() => setShowSetupModal(true)}
          >
            <User size={20} color={theme.colors.primary} />
            <Text style={styles.authBannerText}>
              Connect your account to access all settings and features
            </Text>
          </TouchableOpacity>
        )}

        {/* User Profile Section */}
        {isAuthenticated && user && (
          <View style={styles.userSection}>
            <Image
              source={{ uri: user.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Settings List */}
        <ScrollView style={styles.scrollView}>
          {settingsSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {section.title}
              </Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.settingItem,
                      index < section.items.length - 1 && styles.settingItemBorder,
                      (item.requiresAuth && !isAuthenticated) && styles.settingItemDisabled
                    ]}
                    onPress={() => {
                      if (item.requiresAuth && !isAuthenticated) {
                        setShowSetupModal(true);
                        return;
                      }

                      if (item.id === "logout") {
                        handleLogout();
                      } else if (item.action === "navigate" || item.action === "button") {
                        console.log(`Pressed ${item.title}`);
                      }
                    }}
                  >
                    <View style={styles.settingItemLeft}>
                      <View style={styles.iconContainer}>
                        {item.icon}
                      </View>
                      <Text
                        style={[
                          styles.settingItemText,
                          item.danger && styles.dangerText,
                          (item.requiresAuth && !isAuthenticated) && styles.disabledText
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>

                    {item.action === "toggle" && (
                      <Switch
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={item.value ? "#ffffff" : theme.colors.surface}
                        onValueChange={item.onToggle}
                        value={item.value}
                        disabled={item.requiresAuth && !isAuthenticated}
                      />
                    )}

                    {item.action === "navigate" && (
                      <ChevronRight 
                        size={20} 
                        color={(item.requiresAuth && !isAuthenticated) ? theme.colors.textTertiary : theme.colors.textSecondary} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Image
              source={require("../../assets/images/xquests-logo.png")}
              style={styles.footerLogo}
              contentFit="contain"
            />
            <Text style={styles.footerText}>XQuests v1.0.0</Text>
          </View>
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItemText: {
    marginLeft: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  dangerText: {
    color: theme.colors.error,
  },
  disabledText: {
    color: theme.colors.textTertiary,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  footerLogo: {
    width: 60,
    height: 60,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
});