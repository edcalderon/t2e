import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { ChevronLeft, Filter, Search } from "lucide-react-native";
import ChallengeCard from "./ChallengeCard";

interface Challenge {
  id: string;
  title: string;
  theme: string;
  reward: number;
  timeRemaining: string;
  requiredLikes: number;
  requiredRetweets: number;
  requiredReplies: number;
  description: string;
}

export default function ChallengesScreen({ onBack = () => {} }) {
  const [activeTab, setActiveTab] = useState<
    "available" | "active" | "completed"
  >("available");

  const [challenges, setChallenges] = useState<{
    available: Challenge[];
    active: Challenge[];
    completed: Challenge[];
  }>({
    available: [
      {
        id: "1",
        title: "Share Your AI Use Case",
        theme: "Tech Innovation",
        reward: 35,
        timeRemaining: "23 hours",
        requiredLikes: 50,
        requiredRetweets: 10,
        requiredReplies: 5,
        description:
          "Share your thoughts on the future of AI in everyday applications",
      },
      {
        id: "2",
        title: "Explain Blockchain Simply",
        theme: "Crypto Education",
        reward: 40,
        timeRemaining: "2 days",
        requiredLikes: 75,
        requiredRetweets: 15,
        requiredReplies: 8,
        description:
          "Explain a blockchain concept in simple terms that anyone can understand",
      },
      {
        id: "3",
        title: "Web3 Onboarding Ideas",
        theme: "Community Building",
        reward: 30,
        timeRemaining: "1 day",
        requiredLikes: 60,
        requiredRetweets: 12,
        requiredReplies: 6,
        description:
          "Share how web3 communities can better onboard new members",
      },
    ],
    active: [
      {
        id: "4",
        title: "NFT Use Cases Beyond Art",
        theme: "Blockchain",
        reward: 45,
        timeRemaining: "12 hours",
        requiredLikes: 80,
        requiredRetweets: 20,
        requiredReplies: 10,
        description:
          "Discuss practical NFT applications beyond digital art and collectibles",
      },
    ],
    completed: [
      {
        id: "5",
        title: "DeFi Explained",
        theme: "Finance",
        reward: 25,
        timeRemaining: "Completed",
        requiredLikes: 40,
        requiredRetweets: 8,
        requiredReplies: 4,
        description: "Explain DeFi concepts to beginners in an accessible way",
      },
      {
        id: "6",
        title: "Algorand Benefits",
        theme: "Crypto",
        reward: 20,
        timeRemaining: "Completed",
        requiredLikes: 30,
        requiredRetweets: 5,
        requiredReplies: 3,
        description: "Share why Algorand is a strong blockchain platform",
      },
    ],
  });

  const handleSelectChallenge = (challengeId: string) => {
    console.log(`Selected challenge: ${challengeId}`);
  };

  const displayChallenges = challenges[activeTab];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 py-4 bg-xqdark flex-row items-center border-b border-gray-800">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Challenges</Text>
      </View>

      {/* Search and Filter */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2 flex-1 mr-2">
          <Search size={18} color="#6B7280" />
          <Text className="ml-2 text-gray-400">Search challenges...</Text>
        </View>
        <TouchableOpacity className="p-2">
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab("available")}
          className={`flex-1 py-3 ${activeTab === "available" ? "border-b-2 border-xqcyan" : ""}`}
        >
          <Text
            className={`text-center ${activeTab === "available" ? "text-xqcyan font-semibold" : "text-gray-500"}`}
          >
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("active")}
          className={`flex-1 py-3 ${activeTab === "active" ? "border-b-2 border-xqcyan" : ""}`}
        >
          <Text
            className={`text-center ${activeTab === "active" ? "text-xqcyan font-semibold" : "text-gray-500"}`}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("completed")}
          className={`flex-1 py-3 ${activeTab === "completed" ? "border-b-2 border-xqcyan" : ""}`}
        >
          <Text
            className={`text-center ${activeTab === "completed" ? "text-xqcyan font-semibold" : "text-gray-500"}`}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Challenge List */}
      <ScrollView className="flex-1 px-4 py-4">
        {displayChallenges.length > 0 ? (
          displayChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              title={challenge.title}
              theme={challenge.theme}
              reward={challenge.reward}
              timeRemaining={challenge.timeRemaining}
              requiredLikes={challenge.requiredLikes}
              requiredRetweets={challenge.requiredRetweets}
              requiredReplies={challenge.requiredReplies}
              onSelect={() => handleSelectChallenge(challenge.id)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <Image
              source={require("../../assets/images/xquests-logo.png")}
              style={{ width: 80, height: 80, opacity: 0.5 }}
              contentFit="contain"
            />
            <Text className="text-gray-400 mt-4 text-center">
              No {activeTab} challenges found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
