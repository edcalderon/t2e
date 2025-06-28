import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { Bell, ChevronLeft, Check, Star, Award } from "lucide-react-native";

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

  const getNotificationBackground = (read: boolean) => {
    return read ? "bg-white" : "bg-blue-50";
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 py-4 bg-xqdark flex-row items-center border-b border-gray-800">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Notifications</Text>
      </View>

      {/* Notification List */}
      <ScrollView className="flex-1">
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            className={`p-4 border-b border-gray-100 ${getNotificationBackground(
              notification.read,
            )}`}
            onPress={() => markAsRead(notification.id)}
          >
            <View className="flex-row">
              <View className="mr-3 mt-1">
                {getNotificationIcon(notification.type)}
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-bold text-base">
                    {notification.title}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {notification.timestamp}
                  </Text>
                </View>
                <Text className="text-gray-700">{notification.message}</Text>
              </View>
              {!notification.read && (
                <View className="w-3 h-3 rounded-full bg-xqcyan ml-2 mt-2" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
