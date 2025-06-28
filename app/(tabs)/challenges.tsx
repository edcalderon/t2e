import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Filter, Search } from "lucide-react-native";
import ChallengeCard from "../../src/components/ChallengeCard";
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
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
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
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
      <View style={styles.tabContainer}>
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
              activeTab === "available" && styles.activeTabText
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
              activeTab === "active" && styles.activeTabText
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
              activeTab === "completed" && styles.activeTabText
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Challenge List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              style={styles.emptyLogo}
              contentFit="contain"
            />
            <Text style={styles.emptyText}>
              No {activeTab} challenges found
            </Text>
          </View>
        )}
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
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    marginRight: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyLogo: {
    width: 80,
    height: 80,
    opacity: 0.5,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});