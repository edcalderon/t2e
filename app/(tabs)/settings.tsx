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
import { useTheme } from "../../contexts/ThemeContext";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

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
                  <View style={styles.settingItemLeft}>
                    <View style={styles.iconContainer}>
                      {item.icon}
                    </View>
                    <Text
                      style={[
                        styles.settingItemText,
                        item.danger && styles.dangerText
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

        <View style={styles.footer}>
          <Image
            source={require("../../assets/images/xquests-logo.png")}
            style={styles.footerLogo}
            contentFit="contain"
          />
          <Text style={styles.footerText}>XQuests v1.0.0</Text>
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
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
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