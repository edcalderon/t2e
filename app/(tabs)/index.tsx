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
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { Award, Plus, Sparkles, TrendingUp, Users, Trophy, Heart, MessageCircle, Repeat, ExternalLink, Hash, RefreshCw } from "lucide-react-native";
import { useRouter } from 'expo-router';
import ChallengeCard from "../../src/components/ChallengeCard";
import LeaderboardSection from "../../src/components/LeaderboardSection";
import AccountSetupModal from "../../src/components/AccountSetupModal";
import ResponsiveLayout from "../../components/ResponsiveLayout";
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface CommunityTweet {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  verified: boolean;
  challengeTag?: string;
}

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

  const [communityTweets, setCommunityTweets] = useState<CommunityTweet[]>([
    {
      id: "1",
      username: "cryptodev_alex",
      displayName: "Alex Chen",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Just completed my first #xquests challenge! Explaining DeFi to my non-crypto friends was harder than I thought, but so rewarding 🚀 #crypto #education",
      timestamp: "2m",
      likes: 24,
      retweets: 8,
      replies: 3,
      verified: false,
      challengeTag: "DeFi Education"
    },
    {
      id: "2",
      username: "web3_sarah",
      displayName: "Sarah Martinez",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "The future of AI is here and it's incredible! Working on my #xquests submission about AI in healthcare. The potential to save lives is mind-blowing 🤖💊",
      timestamp: "5m",
      likes: 67,
      retweets: 23,
      replies: 12,
      verified: true,
      challengeTag: "AI Innovation"
    },
    {
      id: "3",
      username: "blockchain_bob",
      displayName: "Bob Thompson",
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Building communities in web3 isn't just about tech - it's about people! My #xquests challenge focuses on human connection in digital spaces 🌐❤️",
      timestamp: "8m",
      likes: 45,
      retweets: 15,
      replies: 7,
      verified: false,
      challengeTag: "Community Building"
    },
    {
      id: "4",
      username: "algo_enthusiast",
      displayName: "Maria Rodriguez",
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Algorand's carbon-negative blockchain is the future! 🌱 Just earned 35 ALGO from my #xquests sustainability challenge. Green crypto FTW! #algorand #sustainability",
      timestamp: "12m",
      likes: 89,
      retweets: 34,
      replies: 18,
      verified: true,
      challengeTag: "Sustainability"
    },
    {
      id: "5",
      username: "nft_creator_jane",
      displayName: "Jane Wilson",
      avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "NFTs beyond art: digital identity, certificates, memberships... the possibilities are endless! My #xquests submission explores real-world utility 🎨➡️🌍",
      timestamp: "15m",
      likes: 52,
      retweets: 19,
      replies: 9,
      verified: false,
      challengeTag: "NFT Innovation"
    },
    {
      id: "6",
      username: "defi_wizard",
      displayName: "David Kim",
      avatar: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      content: "Yield farming strategies that actually make sense! Breaking down complex DeFi concepts for my #xquests challenge. Education is key to adoption 📚💰",
      timestamp: "18m",
      likes: 73,
      retweets: 28,
      replies: 14,
      verified: true,
      challengeTag: "DeFi Education"
    }
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMoreTweets, setLoadingMoreTweets] = useState(false);

  // Animation for theme toggle
  const [themeAnimation] = useState(new Animated.Value(isDark ? 1 : 0));

  useEffect(() => {
    Animated.timing(themeAnimation, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update engagement metrics
      setCommunityTweets(prevTweets => 
        prevTweets.map(tweet => ({
          ...tweet,
          likes: tweet.likes + Math.floor(Math.random() * 3),
          retweets: tweet.retweets + Math.floor(Math.random() * 2),
          replies: tweet.replies + Math.floor(Math.random() * 2),
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate fetching new tweets
    setTimeout(() => {
      // Add a new tweet at the beginning
      const newTweet: CommunityTweet = {
        id: Date.now().toString(),
        username: "new_user_" + Math.floor(Math.random() * 1000),
        displayName: "New User",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
        content: "Just joined #xquests and loving the community! Ready to start earning ALGO 🚀",
        timestamp: "now",
        likes: 1,
        retweets: 0,
        replies: 0,
        verified: false,
        challengeTag: "Welcome"
      };
      setCommunityTweets(prev => [newTweet, ...prev.slice(0, 5)]);
      setRefreshing(false);
    }, 1500);
  };

  const loadMoreTweets = () => {
    setLoadingMoreTweets(true);
    
    // Simulate loading more tweets
    setTimeout(() => {
      const newTweets: CommunityTweet[] = [
        {
          id: Date.now().toString() + "_1",
          username: "crypto_newbie",
          displayName: "Emma Johnson",
          avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
          content: "Learning about smart contracts through #xquests has been amazing! The community here is so supportive 💪 #blockchain #learning",
          timestamp: "22m",
          likes: 31,
          retweets: 12,
          replies: 5,
          verified: false,
          challengeTag: "Education"
        },
        {
          id: Date.now().toString() + "_2",
          username: "algo_trader",
          displayName: "Michael Chen",
          avatar: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
          content: "Passive income through DeFi staking explained! My #xquests challenge breaks down the risks and rewards 📈 #defi #algorand",
          timestamp: "25m",
          likes: 94,
          retweets: 41,
          replies: 23,
          verified: true,
          challengeTag: "DeFi Education"
        },
        {
          id: Date.now().toString() + "_3",
          username: "web3_builder",
          displayName: "Lisa Park",
          avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
          content: "Building the future one dApp at a time! My #xquests submission showcases how blockchain can revolutionize supply chains 🔗",
          timestamp: "28m",
          likes: 67,
          retweets: 25,
          replies: 11,
          verified: false,
          challengeTag: "Innovation"
        }
      ];
      
      setCommunityTweets(prev => [...prev, ...newTweets]);
      setLoadingMoreTweets(false);
    }, 1000);
  };

  const formatEngagementNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
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

  // Get the appropriate logo based on theme
  const getLogoSource = () => {
    return isDark 
      ? require("../../assets/images/small_logo_white.svg")
      : require("../../assets/images/small_logo_black.svg");
  };

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

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
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

          {/* Community Activity Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Hash size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Community Activity</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.reloadButton, loadingMoreTweets && styles.reloadButtonDisabled]}
                onPress={loadMoreTweets}
                disabled={loadingMoreTweets}
              >
                {loadingMoreTweets ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <RefreshCw size={16} color={theme.colors.primary} />
                )}
                <Text style={[
                  styles.reloadButtonText,
                  loadingMoreTweets && styles.reloadButtonTextDisabled
                ]}>
                  {loadingMoreTweets ? 'Loading...' : 'Load More'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>
              Real-time #xquests tweets from our community
            </Text>

            {/* Loading State for Community Feed */}
            {loadingMoreTweets && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading new tweets...</Text>
              </View>
            )}

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={Platform.OS !== 'web'}
              style={styles.communityFeed}
              contentContainerStyle={styles.communityFeedContent}
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
            >
              {communityTweets.map((tweet) => (
                <View key={tweet.id} style={styles.tweetCard}>
                  {/* Tweet Header */}
                  <View style={styles.tweetHeader}>
                    <Image
                      source={{ uri: tweet.avatar }}
                      style={styles.tweetAvatar}
                    />
                    <View style={styles.tweetUserInfo}>
                      <View style={styles.tweetUserNameRow}>
                        <Text style={styles.tweetDisplayName}>{tweet.displayName}</Text>
                        {tweet.verified && (
                          <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedIcon}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.tweetUsername}>@{tweet.username}</Text>
                    </View>
                    <Text style={styles.tweetTimestamp}>{tweet.timestamp}</Text>
                  </View>

                  {/* Tweet Content */}
                  <Text style={styles.tweetContent}>{tweet.content}</Text>

                  {/* Challenge Tag */}
                  {tweet.challengeTag && (
                    <View style={styles.challengeTagContainer}>
                      <Award size={12} color={theme.colors.primary} />
                      <Text style={styles.challengeTag}>{tweet.challengeTag}</Text>
                    </View>
                  )}

                  {/* Tweet Engagement */}
                  <View style={styles.tweetEngagement}>
                    <View style={styles.engagementItem}>
                      <Heart size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.engagementText}>
                        {formatEngagementNumber(tweet.likes)}
                      </Text>
                    </View>
                    <View style={styles.engagementItem}>
                      <Repeat size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.engagementText}>
                        {formatEngagementNumber(tweet.retweets)}
                      </Text>
                    </View>
                    <View style={styles.engagementItem}>
                      <MessageCircle size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.engagementText}>
                        {formatEngagementNumber(tweet.replies)}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.engagementItem}>
                      <ExternalLink size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
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
              source={getLogoSource()}
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.error,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  reloadButtonDisabled: {
    opacity: 0.6,
  },
  reloadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  reloadButtonTextDisabled: {
    color: theme.colors.textTertiary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  sectionLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  communityFeed: {
    marginHorizontal: -16,
    ...(Platform.OS === 'web' && {
      overflow: 'visible',
    }),
  },
  communityFeedContent: {
    paddingHorizontal: 16,
    gap: 12,
    ...(Platform.OS === 'web' && {
      minWidth: '100%',
    }),
  },
  tweetCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    width: 280,
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
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    }),
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tweetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tweetUserInfo: {
    flex: 1,
  },
  tweetUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tweetDisplayName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tweetUsername: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tweetTimestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tweetContent: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  challengeTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  challengeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  tweetEngagement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
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