import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { ChevronRight } from "lucide-react-native";

type LeaderboardUser = {
  id: string;
  username: string;
  profileImage: string;
  engagementScore: number;
  rewardsEarned: number;
};

type LeaderboardSectionProps = {
  globalUsers?: LeaderboardUser[];
  friendsUsers?: LeaderboardUser[];
};

export default function LeaderboardSection({
  globalUsers = [
    {
      id: "1",
      username: "cryptoking",
      profileImage:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoking",
      engagementScore: 9876,
      rewardsEarned: 450,
    },
    {
      id: "2",
      username: "algotrader",
      profileImage:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=algotrader",
      engagementScore: 8765,
      rewardsEarned: 380,
    },
    {
      id: "3",
      username: "web3guru",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=web3guru",
      engagementScore: 7654,
      rewardsEarned: 320,
    },
  ],
  friendsUsers = [
    {
      id: "4",
      username: "cryptofriend",
      profileImage:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptofriend",
      engagementScore: 5432,
      rewardsEarned: 210,
    },
    {
      id: "5",
      username: "blockchainbuddy",
      profileImage:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=blockchainbuddy",
      engagementScore: 4321,
      rewardsEarned: 180,
    },
    {
      id: "6",
      username: "tokenpal",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=tokenpal",
      engagementScore: 3210,
      rewardsEarned: 150,
    },
  ],
}: LeaderboardSectionProps) {
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");

  const displayUsers = activeTab === "global" ? globalUsers : friendsUsers;

  return (
    <View className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Leaderboard</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-xqcyan mr-1">View All</Text>
          <ChevronRight size={16} color="#06B6D4" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row mb-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab("global")}
          className={`flex-1 py-2 ${activeTab === "global" ? "border-b-2 border-xqcyan" : ""}`}
        >
          <Text
            className={`text-center ${activeTab === "global" ? "text-xqcyan font-semibold" : "text-gray-500"}`}
          >
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("friends")}
          className={`flex-1 py-2 ${activeTab === "friends" ? "border-b-2 border-xqcyan" : ""}`}
        >
          <Text
            className={`text-center ${activeTab === "friends" ? "text-xqcyan font-semibold" : "text-gray-500"}`}
          >
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Column Headers */}
      <View className="flex-row px-2 mb-2">
        <Text className="flex-1 text-gray-500 font-medium">User</Text>
        <Text className="w-24 text-right text-gray-500 font-medium">
          Engagement
        </Text>
        <Text className="w-20 text-right text-gray-500 font-medium">
          Rewards
        </Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView className="max-h-[180px]">
        {displayUsers.map((user, index) => (
          <View
            key={user.id}
            className={`flex-row items-center py-3 px-2 ${index < displayUsers.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <View className="flex-row items-center flex-1">
              <Text className="w-6 text-gray-500 font-medium">{index + 1}</Text>
              <Image
                source={{ uri: user.profileImage }}
                className="w-8 h-8 rounded-full mr-2"
              />
              <Text className="font-medium">{user.username}</Text>
            </View>
            <Text className="w-24 text-right">
              {user.engagementScore.toLocaleString()}
            </Text>
            <Text className="w-20 text-right text-green-600">
              {user.rewardsEarned} ALGO
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
