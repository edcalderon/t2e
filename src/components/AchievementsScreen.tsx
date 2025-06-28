import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { ChevronLeft } from "lucide-react-native";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

export default function AchievementsScreen({ onBack = () => {} }) {
  const achievements: Achievement[] = [
    {
      id: "1",
      name: "Tweet Master",
      description: "Complete 10 tweet challenges",
      icon: "tweet-master",
      earned: true,
    },
    {
      id: "2",
      name: "Retweet Hero",
      description: "Get 100+ retweets on a single challenge",
      icon: "retweet-hero",
      earned: true,
    },
    {
      id: "3",
      name: "Top Gainer",
      description: "Earn 500+ ALGO from challenges",
      icon: "top-gainer",
      earned: false,
      progress: 320,
      total: 500,
    },
    {
      id: "4",
      name: "Meme Lord",
      description: "Complete 5 meme challenges",
      icon: "meme-lord",
      earned: false,
      progress: 3,
      total: 5,
    },
    {
      id: "5",
      name: "ALGO Airdrop Winner",
      description: "Win a special ALGO airdrop",
      icon: "algo-airdrop",
      earned: false,
    },
  ];

  const getIconForAchievement = (iconName: string) => {
    // In a real app, you would have individual icons for each achievement
    // For now, we'll use the badges image and just display it
    return require("../../assets/images/xquests-badges.png");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 py-4 bg-xqdark flex-row items-center border-b border-gray-800">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Achievements</Text>
      </View>

      {/* Achievements List */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-semibold mb-4">
          {achievements.filter((a) => a.earned).length} of {achievements.length}{" "}
          Badges Earned
        </Text>

        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            className={`bg-white rounded-lg p-4 mb-4 border ${achievement.earned ? "border-xqcyan" : "border-gray-200"}`}
          >
            <View className="flex-row">
              <View
                className={`w-16 h-16 rounded-lg items-center justify-center ${achievement.earned ? "opacity-100" : "opacity-40"}`}
              >
                <Image
                  source={getIconForAchievement(achievement.icon)}
                  style={{ width: 60, height: 60 }}
                  contentFit="contain"
                />
              </View>
              <View className="ml-4 flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-lg">{achievement.name}</Text>
                  {achievement.earned && (
                    <View className="bg-xqcyan/20 px-2 py-1 rounded">
                      <Text className="text-xqcyan text-xs font-medium">
                        Earned
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 mt-1">
                  {achievement.description}
                </Text>

                {achievement.progress !== undefined && (
                  <View className="mt-2">
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-gradient-to-r from-xqcyan to-xqblue"
                        style={{
                          width: `${(achievement.progress / achievement.total!) * 100}%`,
                        }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">
                      {achievement.progress} / {achievement.total}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
