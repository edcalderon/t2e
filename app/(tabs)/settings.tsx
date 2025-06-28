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
import { Image } from "expo-image";
import { User, Wallet, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight } from "lucide-react-native";
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoTweetEnabled, setAutoTweetEnabled] = useState(false);

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: "Profile Information",
          icon: <User size={20} color={theme.colors.primary} />,
          action: "navigate",
        },
        {
          id: "wallet",
          title: "Wallet Settings",
          icon: <Wallet size={20} color={theme.colors.primary} />,
          action: "navigate",
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
        },
        {
          id: "darkMode",
          title: "Dark Mode",
          icon: <Shield size={20} color={theme.colors.primary} />,
          action: "toggle",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        {
          id: "autoTweet",
          title: "Auto-Tweet Challenges",
          icon: <Shield size={20} color={theme.colors.accent} />,
          action: "toggle",
          value: autoTweetEnabled,
          onToggle: setAutoTweetEnabled,
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
        },
        {
          id: "logout",
          title: "Log Out",
          icon: <LogOut size={20} color={theme.colors.error} />,
          action: "button",
          danger: true,
        },
      ],
    },
  ];

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Settings List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                    index < section.items.length - 1 && styles.settingItemBorder
                  ]}
                  onPress={() => {
                    if (
                      item.action === "navigate" ||
                      item.action === "button"
                    ) {
                      console.log(`Pressed ${item.title}`);
                    }
                  }}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.iconWrapper}>
                      {item.icon}
                    </View>
                    <Text
                      style={[
                        styles.settingTitle,
                        item.danger && styles.dangerText
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>

                  {item.action === "toggle" && (
                    <Switch
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor={item.value ? "#ffffff" : "#f3f4f6"}
                      onValueChange={item.onToggle}
                      value={item.value}
                    />
                  )}

                  {item.action === "navigate" && (
                    <ChevronRight size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.brandingContainer}>
          <Image
            source={require("../../assets/images/xquests-logo.png")}
            style={styles.brandingLogo}
            contentFit="contain"
          />
          <Text style={styles.brandingText}>XQuests v1.0.0</Text>
        </View>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  dangerText: {
    color: theme.colors.error,
  },
  brandingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  brandingLogo: {
    width: 60,
    height: 60,
  },
  brandingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
});