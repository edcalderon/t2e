import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Clock,
  Award,
  MessageCircle,
  Repeat,
  Heart,
} from "lucide-react-native";

interface ChallengeCardProps {
  title?: string;
  theme?: string;
  reward?: number;
  timeRemaining?: string;
  requiredLikes?: number;
  requiredRetweets?: number;
  requiredReplies?: number;
  onSelect?: () => void;
}

const ChallengeCard = ({
  title = "Weekly Crypto Insights",
  theme = "Blockchain Technology",
  reward = 50,
  timeRemaining = "2 days 4 hours",
  requiredLikes = 25,
  requiredRetweets = 10,
  requiredReplies = 5,
  onSelect = () => console.log("Challenge selected"),
}: ChallengeCardProps) => {
  return (
    <View className="bg-white rounded-xl p-4 shadow-md mb-4 border border-gray-100 w-full overflow-hidden">
      {/* Challenge Header */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="bg-xqcyan/20 px-3 py-1 rounded-full">
          <Text className="text-xqcyan font-medium text-xs">{theme}</Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1">{timeRemaining}</Text>
        </View>
      </View>

      {/* Challenge Title */}
      <Text className="text-lg font-bold mb-2">{title}</Text>

      {/* Reward */}
      <View className="flex-row items-center mb-3">
        <Award size={16} color="#EAB308" />
        <Text className="text-yellow-500 font-semibold ml-1">
          {reward} ALGO
        </Text>
      </View>

      {/* Required Metrics */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-row items-center">
          <Heart size={14} color="#EF4444" />
          <Text className="text-gray-600 text-xs ml-1">
            {requiredLikes} likes
          </Text>
        </View>
        <View className="flex-row items-center">
          <Repeat size={14} color="#10B981" />
          <Text className="text-gray-600 text-xs ml-1">
            {requiredRetweets} retweets
          </Text>
        </View>
        <View className="flex-row items-center">
          <MessageCircle size={14} color="#3B82F6" />
          <Text className="text-gray-600 text-xs ml-1">
            {requiredReplies} replies
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        className="bg-gradient-to-r from-xqcyan to-xqblue py-3 rounded-lg items-center"
        onPress={onSelect}
      >
        <Text className="text-white font-medium">Select Challenge</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChallengeCard;
