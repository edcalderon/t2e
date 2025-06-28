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
import { ChevronLeft, User, Wallet, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function SettingsScreen({ onBack = () => {} }) {
  const { theme } = useTheme();
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
          icon: <User size={20} color="#3B82F6" />,
          action: "navigate",
        },
        {
          id: "wallet",
          title: "Wallet Settings",
          icon: <Wallet size={20} color="#06B6D4" />,
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
          icon: <Bell size={20} color="#8B5CF6" />,
          action: "toggle",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: "darkMode",
          title: "Dark Mode",
          icon: <Shield size={20} color="#22D3EE" />,
          action: "toggle",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        {
          id: "autoTweet",
          title: "Auto-Tweet Challenges",
          icon: <Shield size={20} color="#8B5CF6" />,
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
          icon: <HelpCircle size={20} color="#3B82F6" />,
          action: "navigate",
        },
        {
          id: "logout",
          title: "Log Out",
          icon: <LogOut size={20} color="#EF4444" />,
          action: "button",
          danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
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
                      trackColor={{ false: "#d1d5db", true: "#06B6D4" }}
                      thumbColor={item.value ? "#ffffff" : "#f3f4f6"}
                      onValueChange={item.onToggle}
                      value={item.value}
                    />
                  )}

                  {item.action === "navigate" && (
                    <ChevronRight size={20} color="#9ca3af" />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
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
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    color: '#1f2937',
  },
  dangerText: {
    color: '#ef4444',
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
    color: '#6b7280',
    marginTop: 8,
  },
});