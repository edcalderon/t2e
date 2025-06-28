import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import {
  Bell,
  Award,
  History,
  Settings,
  ChevronRight,
  Home,
  Trophy,
} from "lucide-react-native";
import ChallengeCard from "../src/components/ChallengeCard";
import LeaderboardSection from "../src/components/LeaderboardSection";
import AccountSetupModal from "../src/components/AccountSetupModal";
import NotificationsScreen from "../src/components/NotificationsScreen";
import SettingsScreen from "../src/components/SettingsScreen";
import ChallengesScreen from "../src/components/ChallengesScreen";

export default function MainDashboard() {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "home" | "challenges" | "notifications" | "settings"
  >("home");
  const [userProfile, setUserProfile] = useState({
    name: "Alex Johnson",
    handle: "@alexjohnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    walletBalance: "245.75",
    completedChallenges: 12,
  });

  const [challenges, setChallenges] = useState([
    {
      id: "1",
      theme: "Tech Innovation",
      reward: 25,
      requiredLikes: 50,
      requiredRetweets: 10,
      timeRemaining: "23 hours",
      description:
        "Share your thoughts on the future of AI in everyday applications",
    },
    {
      id: "2",
      theme: "Crypto Education",
      reward: 40,
      requiredLikes: 75,
      requiredRetweets: 15,
      timeRemaining: "2 days",
      description:
        "Explain a blockchain concept in simple terms that anyone can understand",
    },
    {
      id: "3",
      theme: "Community Building",
      reward: 30,
      requiredLikes: 60,
      requiredRetweets: 12,
      timeRemaining: "1 day",
      description: "Share how web3 communities can better onboard new members",
    },
  ]);

  useEffect(() => {
    // Check if first time user and show setup modal
    if (isFirstTimeUser) {
      setShowSetupModal(true);
    }
  }, [isFirstTimeUser]);

  const handleSetupComplete = () => {
    setIsFirstTimeUser(false);
    setShowSetupModal(false);
  };

  const handleSelectChallenge = (challengeId) => {
    // Navigate to challenge detail screen
    console.log(`Selected challenge: ${challengeId}`);
    // In a real app, you would navigate to the challenge detail screen
  };

  // Render the appropriate screen based on activeScreen state
  const renderScreen = () => {
    switch (activeScreen) {
      case "challenges":
        return <ChallengesScreen onBack={() => setActiveScreen("home")} />;
      case "notifications":
        return <NotificationsScreen onBack={() => setActiveScreen("home")} />;
      case "settings":
        return <SettingsScreen onBack={() => setActiveScreen("home")} />;
      case "home":
      default:
        return renderHomeScreen();
    }
  };

  // Render the home dashboard
  const renderHomeScreen = () => {
    return (
      <>
        {/* Header */}
        <View className="px-4 pt-2 pb-4 bg-xqdark border-b border-gray-800">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Image
                source={{ uri: userProfile.avatar }}
                className="w-10 h-10 rounded-full"
              />
              <View className="ml-3">
                <Text className="font-bold text-lg text-white">
                  {userProfile.name}
                </Text>
                <Text className="text-gray-400">{userProfile.handle}</Text>
              </View>
            </View>

            <View className="flex-row items-center bg-xqcyan/20 px-3 py-1 rounded-full">
              <Text className="font-bold text-xqcyan mr-1">
                {userProfile.walletBalance}
              </Text>
              <Text className="text-xqcyan">ALGO</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 bg-slate-50">
          {/* Challenges Section */}
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Available Challenges</Text>
              <TouchableOpacity onPress={() => setActiveScreen("challenges")}>
                <Text className="text-xqcyan">View All</Text>
              </TouchableOpacity>
            </View>

            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                title={challenge.description}
                theme={challenge.theme}
                reward={challenge.reward}
                timeRemaining={challenge.timeRemaining}
                requiredLikes={challenge.requiredLikes}
                requiredRetweets={challenge.requiredRetweets}
                requiredReplies={5}
                onSelect={() => handleSelectChallenge(challenge.id)}
              />
            ))}
          </View>

          {/* Leaderboard Section */}
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Leaderboard</Text>
              <TouchableOpacity>
                <Text className="text-xqcyan">View All</Text>
              </TouchableOpacity>
            </View>

            <LeaderboardSection />
          </View>

          {/* Achievements & History */}
          <View className="px-4 py-4">
            <Text className="text-xl font-bold mb-4">Quick Access</Text>

            <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-lg mb-3 shadow-sm">
              <View className="w-10 h-10 bg-xqcyan/20 rounded-full items-center justify-center">
                <Trophy size={20} color="#06B6D4" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-bold">Achievements</Text>
                <Text className="text-gray-500">
                  {userProfile.completedChallenges} badges earned
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-lg shadow-sm">
              <View className="w-10 h-10 bg-xqpurple/20 rounded-full items-center justify-center">
                <History size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-bold">Reward History</Text>
                <Text className="text-gray-500">View your past earnings</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Logo and App Name */}
          <View className="items-center my-8">
            <Image
              source={require("../assets/images/xquests-logo.png")}
              style={{ width: 80, height: 80 }}
              contentFit="contain"
            />
            <Text className="text-xqpurple font-bold text-xl mt-2">
              XQuests
            </Text>
            <Text className="text-gray-500 text-sm">Tweet. Engage. Earn.</Text>
          </View>
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="light" />

      {renderScreen()}

      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center py-3 bg-xqdark border-t border-gray-800">
        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveScreen("home")}
        >
          <Home
            size={24}
            color={activeScreen === "home" ? "#06B6D4" : "#9ca3af"}
          />
          <Text
            className={`text-xs mt-1 ${activeScreen === "home" ? "text-xqcyan font-medium" : "text-gray-400"}`}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveScreen("challenges")}
        >
          <Award
            size={24}
            color={activeScreen === "challenges" ? "#06B6D4" : "#9ca3af"}
          />
          <Text
            className={`text-xs mt-1 ${activeScreen === "challenges" ? "text-xqcyan font-medium" : "text-gray-400"}`}
          >
            Challenges
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveScreen("notifications")}
        >
          <Bell
            size={24}
            color={activeScreen === "notifications" ? "#06B6D4" : "#9ca3af"}
          />
          <Text
            className={`text-xs mt-1 ${activeScreen === "notifications" ? "text-xqcyan font-medium" : "text-gray-400"}`}
          >
            Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveScreen("settings")}
        >
          <Settings
            size={24}
            color={activeScreen === "settings" ? "#06B6D4" : "#9ca3af"}
          />
          <Text
            className={`text-xs mt-1 ${activeScreen === "settings" ? "text-xqcyan font-medium" : "text-gray-400"}`}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Setup Modal for first-time users */}
      {showSetupModal && (
        <AccountSetupModal
          isVisible={showSetupModal}
          onComplete={handleSetupComplete}
        />
      )}
    </SafeAreaView>
  );
}
