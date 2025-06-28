import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { Filter, Search } from "lucide-react-native";
import ChallengeCard from "../../src/components/ChallengeCard";
import ResponsiveLayout from "../../components/ResponsiveLayout";
import { useTheme } from "../../contexts/ThemeContext";

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

export default function ChallengesScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
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
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      <ResponsiveLayout>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Challenges</Text>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={theme.colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search challenges...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("available")}
            style={[
              styles.tab,
              activeTab === "available" && styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "available" ? styles.activeTabText : styles.inactiveTabText
              ]}
            >
              Available
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("active")}
            style={[
              styles.tab,
              activeTab === "active" && styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "active" ? styles.activeTabText : styles.inactiveTabText
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("completed")}
            style={[
              styles.tab,
              activeTab === "completed" && styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" ? styles.activeTabText : styles.inactiveTabText
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Challenge List */}
        <ScrollView style={styles.challengeList}>
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
            <View style={styles.emptyState}>
              <Image
                source={require("../../assets/images/xquests-logo.png")}
                style={styles.emptyStateImage}
                contentFit="contain"
              />
              <Text style={styles.emptyStateText}>
                No {activeTab} challenges found
              </Text>
            </View>
          )}
        </ScrollView>
      </ResponsiveLayout>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: theme.colors.textSecondary,
  },
  filterButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    textAlign: 'center',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  inactiveTabText: {
    color: theme.colors.textSecondary,
  },
  challengeList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateImage: {
    width: 80,
    height: 80,
    opacity: 0.5,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});