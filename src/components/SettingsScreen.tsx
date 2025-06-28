import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import {
  ChevronLeft,
  User,
  Wallet,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

export default function SettingsScreen({ onBack = () => {} }) {
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
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 py-4 bg-xqdark flex-row items-center border-b border-gray-800">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Settings</Text>
      </View>

      {/* Settings List */}
      <ScrollView className="flex-1">
        {settingsSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">
              {section.title}
            </Text>
            <View className="bg-white rounded-md mx-4 overflow-hidden">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center justify-between p-4 ${index < section.items.length - 1 ? "border-b border-gray-100" : ""}`}
                  onPress={() => {
                    if (
                      item.action === "navigate" ||
                      item.action === "button"
                    ) {
                      console.log(`Pressed ${item.title}`);
                    }
                  }}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-opacity-20 items-center justify-center">
                      {item.icon}
                    </View>
                    <Text
                      className={`ml-3 font-medium ${item.danger ? "text-red-500" : "text-gray-800"}`}
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

        <View className="items-center mb-8 mt-4">
          <Image
            source={require("../../assets/images/xquests-logo.png")}
            style={{ width: 60, height: 60 }}
            contentFit="contain"
          />
          <Text className="text-center text-gray-500 mt-2">XQuests v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
