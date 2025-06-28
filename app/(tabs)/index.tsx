import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { Award, Plus, Sparkles, TrendingUp, Users, Trophy } from "lucide-react-native";
import { useRouter } from 'expo-router';
import ChallengeCard from "../../src/components/ChallengeCard";
import LeaderboardSection from "../../src/components/LeaderboardSection";
import AccountSetupModal from "../../src/components/AccountSetupModal";
import ResponsiveLayout from "../../components/ResponsiveLayout";
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function ExploreScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, showSetupModal, setShowSetupModal } = useAuth();
  const router = useRouter();
  
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

  // Animation for theme toggle
  const [themeAnimation] = useState(new Animated.Value(isDark ? 1 : 0));

  useEffect(() => {
    Animated.timing(themeAnimation, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
  };

  const handleSelectChallenge = (challengeId: string) => {
    if (!isAuthenticated) {
      setShowSetupModal(true);
      return;
    }
    console.log(`Selected challenge: ${challengeId}`);
  };

  const handleNewTweet = () => {
    if (!isAuthenticated) {
      setShowSetupModal(true);
      return;
    }
    console.log('Creating new tweet');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Get user stats or show zeros
  const getStats = () => {
    if (!isAuthenticated || !user) {
      return {
        totalEarned: "0.00",
        thisWeek: "+0.00",
        rank: "#--",
        streak: "0 days",
        walletBalance: "0.00",
      };
    }

    return {
      totalEarned: "1,247.50",
      thisWeek: "+127.25",
      rank: "#47",
      streak: "12 days",
      walletBalance: "245.75",
    };
  };

  const stats = getStats();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      <ResponsiveLayout>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Explore</Text>

            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.walletBadge}
                onPress={() => !isAuthenticated && setShowSetupModal(true)}
              >
                <Sparkles size={16} color={theme.colors.primary} />
                <Text style={styles.walletAmount}>{stats.walletBalance}</Text>
                <Text style={styles.walletCurrency}>ALGO</Text>
              </TouchableOpacity>
              
              {/* Theme Toggle Button */}
              <TouchableOpacity 
                style={styles.themeToggle}
                onPress={handleThemeToggle}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.themeToggleTrack,
                    {
                      backgroundColor: isDark ? theme.colors.primary : '#E5E7EB',
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.themeToggleThumb,
                      {
                        transform: [
                          {
                            translateX: themeAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [2, 22],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {isDark ? (
                      <Text style={styles.themeIcon}>🌙</Text>
                    ) : (
                      <Text style={styles.themeIcon}>☀️</Text>
                    )}
                  </Animated.View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Authentication Status Banner */}
          {!isAuthenticated && (
            <TouchableOpacity 
              style={styles.authBanner}
              onPress={() => setShowSetupModal(true)}
            >
              <View style={styles.authBannerContent}>
                <Sparkles size={20} color={theme.colors.primary} />
                <Text style={styles.authBannerText}>
                  Connect your account to start earning rewards
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <TouchableOpacity 
                style={styles.statCard}
                onPress={() => !isAuthenticated && setShowSetupModal(true)}
              >
                <TrendingUp size={20} color={theme.colors.success} />
                <Text style={styles.statValue}>{stats.totalEarned}</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
                <Text style={styles.statChange}>{stats.thisWeek} this week</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.statCard}
                onPress={() => !isAuthenticated && setShowSetupModal(true)}
              >
                <Trophy size={20} color={theme.colors.warning} />
                <Text style={styles.statValue}>{stats.rank}</Text>
                <Text style={styles.statLabel}>Global Rank</Text>
                <Text style={styles.statChange}>{stats.streak} streak</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={handleNewTweet}
              >
                <Plus size={20} color={theme.colors.primary} />
                <Text style={styles.quickActionText}>New Tweet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => router.push('/(tabs)/challenges')}
              >
                <Award size={20} color={theme.colors.primary} />
                <Text style={styles.quickActionText}>Browse Challenges</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Challenges Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Challenges</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/challenges')}>
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
              <TouchableOpacity onPress={() => !isAuthenticated && setShowSetupModal(true)}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            <LeaderboardSection />
          </View>

          {/* Activity Feed */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            
            {isAuthenticated ? (
              <>
                <TouchableOpacity style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                    <Trophy size={16} color={theme.colors.warning} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      You earned <Text style={styles.highlight}>25 ALGO</Text> from the Tech Innovation challenge
                    </Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Users size={16} color={theme.colors.primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      You moved up to <Text style={styles.highlight}>rank #47</Text> on the global leaderboard
                    </Text>
                    <Text style={styles.activityTime}>5 hours ago</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: theme.colors.success + '20' }]}>
                    <Award size={16} color={theme.colors.success} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      New achievement unlocked: <Text style={styles.highlight}>Tweet Master</Text>
                    </Text>
                    <Text style={styles.activityTime}>1 day ago</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.emptyActivityState}
                onPress={() => setShowSetupModal(true)}
              >
                <Text style={styles.emptyActivityText}>
                  Connect your account to see your activity
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* App Branding */}
          <View style={styles.brandingContainer}>
            <Image
              source={require("../../assets/images/xquests-logo.png")}
              style={styles.brandingLogo}
              contentFit="contain"
            />
            <Text style={styles.brandingTitle}>XQuests</Text>
            <Text style={styles.brandingSubtitle}>Tweet. Engage. Earn.</Text>
          </View>
        </ScrollView>
      </ResponsiveLayout>

      {/* Account Setup Modal */}
      {showSetupModal && (
        <AccountSetupModal
          isVisible={showSetupModal}
          onComplete={handleSetupComplete}
          onClose={() => setShowSetupModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: 6,
  },
  walletCurrency: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  themeToggle: {
    padding: 4,
  },
  themeToggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  themeToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  themeIcon: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  authBanner: {
    backgroundColor: theme.colors.primary + '10',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  authBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  authBannerText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
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
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statChange: {
    fontSize: 12,
    color: theme.colors.success,
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
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
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
    color: theme.colors.text,
  },
  sectionLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  highlight: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyActivityState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    color: theme.colors.primary,
    marginTop: 12,
  },
  brandingSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});