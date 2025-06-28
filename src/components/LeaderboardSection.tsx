import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from '../../contexts/ThemeContext';

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
      profileImage: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      engagementScore: 9876,
      rewardsEarned: 450,
    },
    {
      id: "2",
      username: "algotrader",
      profileImage: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      engagementScore: 8765,
      rewardsEarned: 380,
    },
    {
      id: "3",
      username: "web3guru",
      profileImage: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      engagementScore: 7654,
      rewardsEarned: 320,
    },
  ],
  friendsUsers = [
    {
      id: "4",
      username: "cryptofriend",
      profileImage: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      engagementScore: 5432,
      rewardsEarned: 210,
    },
    {
      id: "5",
      username: "blockchainbuddy",
      profileImage: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      engagementScore: 4321,
      rewardsEarned: 180,
    },
    {
      id: "6",
      username: "tokenpal",
      profileImage: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      engagementScore: 3210,
      rewardsEarned: 150,
    },
  ],
}: LeaderboardSectionProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  const styles = createStyles(theme);

  const displayUsers = activeTab === "global" ? globalUsers : friendsUsers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("global")}
          style={[
            styles.tab,
            activeTab === "global" && styles.activeTab
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "global" && styles.activeTabText
            ]}
          >
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("friends")}
          style={[
            styles.tab,
            activeTab === "friends" && styles.activeTab
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Column Headers */}
      <View style={styles.columnHeaders}>
        <Text style={styles.columnHeader}>User</Text>
        <Text style={styles.columnHeaderRight}>Engagement</Text>
        <Text style={styles.columnHeaderRight}>Rewards</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {displayUsers.map((user, index) => (
          <View
            key={user.id}
            style={[
              styles.userRow,
              index < displayUsers.length - 1 && styles.userRowBorder
            ]}
          >
            <View style={styles.userInfo}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
              <Text style={styles.username}>{user.username}</Text>
            </View>
            <Text style={styles.engagement}>
              {user.engagementScore.toLocaleString()}
            </Text>
            <Text style={styles.rewards}>
              {user.rewardsEarned} ALGO
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  columnHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  columnHeaderRight: {
    width: 80,
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  listContainer: {
    maxHeight: 180,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  userRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rank: {
    width: 24,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  engagement: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  rewards: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
  },
});