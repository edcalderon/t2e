import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
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
  Plus,
  Search,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react-native";
import ChallengeCard from "../src/components/ChallengeCard";
import LeaderboardSection from "../src/components/LeaderboardSection";
import AccountSetupModal from "../src/components/AccountSetupModal";
import NotificationsScreen from "../src/components/NotificationsScreen";
import SettingsScreen from "../src/components/SettingsScreen";
import ChallengesScreen from "../src/components/ChallengesScreen";

const { width } = Dimensions.get('window');

export default function MainDashboard() {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "home" | "challenges" | "notifications" | "settings"
  >("home");
  const [userProfile, setUserProfile] = useState({
    name: "Alex Johnson",
    handle: "@alexjohnson",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    walletBalance: "245.75",
    completedChallenges: 12,
    followers: "1.2K",
    following: "892",
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

  const [stats] = useState({
    totalEarned: "1,247.50",
    thisWeek: "+127.25",
    rank: "#47",
    streak: "12 days",
  });

  useEffect(() => {
    if (isFirstTimeUser) {
      setShowSetupModal(true);
    }
  }, [isFirstTimeUser]);

  const handleSetupComplete = () => {
    setIsFirstTimeUser(false);
    setShowSetupModal(false);
  };

  const handleSelectChallenge = (challengeId) => {
    console.log(`Selected challenge: ${challengeId}`);
  };

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

  const renderHomeScreen = () => {
    return (
      <>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: userProfile.avatar }}
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <Text style={styles.userHandle}>{userProfile.handle}</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.walletBadge}>
                <Sparkles size={16} color="#1D9BF0" />
                <Text style={styles.walletAmount}>{userProfile.walletBalance}</Text>
                <Text style={styles.walletCurrency}>ALGO</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.headerButton}>
                <Search size={20} color="#71767B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <TrendingUp size={20} color="#00BA7C" />
                <Text style={styles.statValue}>{stats.totalEarned}</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
                <Text style={styles.statChange}>+{stats.thisWeek} this week</Text>
              </View>
              
              <View style={styles.statCard}>
                <Trophy size={20} color="#FFD700" />
                <Text style={styles.statValue}>{stats.rank}</Text>
                <Text style={styles.statLabel}>Global Rank</Text>
                <Text style={styles.statChange}>{stats.streak} streak</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <Plus size={20} color="#1D9BF0" />
                <Text style={styles.quickActionText}>New Tweet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setActiveScreen("challenges")}
              >
                <Award size={20} color="#1D9BF0" />
                <Text style={styles.quickActionText}>Browse Challenges</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Challenges Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Challenges</Text>
              <TouchableOpacity onPress={() => setActiveScreen("challenges")}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {challenges.slice(0, 2).map((challenge) => (
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Performers</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            <LeaderboardSection />
          </View>

          {/* Activity Feed */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            
            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Trophy size={16} color="#FFD700" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  You earned <Text style={styles.highlight}>25 ALGO</Text> from the Tech Innovation challenge
                </Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Users size={16} color="#1D9BF0" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  You moved up to <Text style={styles.highlight}>rank #47</Text> on the global leaderboard
                </Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Award size={16} color="#00BA7C" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  New achievement unlocked: <Text style={styles.highlight}>Tweet Master</Text>
                </Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* App Branding */}
          <View style={styles.brandingContainer}>
            <Image
              source={require("../assets/images/xquests-logo.png")}
              style={styles.brandingLogo}
              contentFit="contain"
            />
            <Text style={styles.brandingTitle}>XQuests</Text>
            <Text style={styles.brandingSubtitle}>Tweet. Engage. Earn.</Text>
          </View>
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />

      {renderScreen()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen("home")}
        >
          <Home
            size={24}
            color={activeScreen === "home" ? "#1D9BF0" : "#71767B"}
          />
          <Text
            style={[
              styles.navLabel,
              { color: activeScreen === "home" ? "#1D9BF0" : "#71767B" }
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen("challenges")}
        >
          <Award
            size={24}
            color={activeScreen === "challenges" ? "#1D9BF0" : "#71767B"}
          />
          <Text
            style={[
              styles.navLabel,
              { color: activeScreen === "challenges" ? "#1D9BF0" : "#71767B" }
            ]}
          >
            Challenges
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen("notifications")}
        >
          <Bell
            size={24}
            color={activeScreen === "notifications" ? "#1D9BF0" : "#71767B"}
          />
          <Text
            style={[
              styles.navLabel,
              { color: activeScreen === "notifications" ? "#1D9BF0" : "#71767B" }
            ]}
          >
            Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveScreen("settings")}
        >
          <Settings
            size={24}
            color={activeScreen === "settings" ? "#1D9BF0" : "#71767B"}
          />
          <Text
            style={[
              styles.navLabel,
              { color: activeScreen === "settings" ? "#1D9BF0" : "#71767B" }
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Setup Modal */}
      {showSetupModal && (
        <AccountSetupModal
          isVisible={showSetupModal}
          onComplete={handleSetupComplete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 0.5,
    borderBottomColor: '#2F3336',
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E7E9EA',
  },
  userHandle: {
    fontSize: 14,
    color: '#71767B',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1419',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D9BF0',
    marginLeft: 6,
  },
  walletCurrency: {
    fontSize: 12,
    color: '#71767B',
    marginLeft: 4,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16181C',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E7E9EA',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#71767B',
    marginTop: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#00BA7C',
    marginTop: 2,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16181C',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2F3336',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D9BF0',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E7E9EA',
  },
  sectionLink: {
    fontSize: 14,
    color: '#1D9BF0',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2F3336',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16181C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: '#E7E9EA',
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 13,
    color: '#71767B',
    marginTop: 4,
  },
  highlight: {
    color: '#1D9BF0',
    fontWeight: '600',
  },
  brandingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  brandingLogo: {
    width: 60,
    height: 60,
  },
  brandingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D9BF0',
    marginTop: 12,
  },
  brandingSubtitle: {
    fontSize: 14,
    color: '#71767B',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderTopWidth: 0.5,
    borderTopColor: '#2F3336',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});