import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { Sparkles } from "lucide-react-native";
import { useRouter } from 'expo-router';
import AccountSetupModal from "@/src/components/AccountSetupModal";
import LeaderboardSection from "@/src/components/LeaderboardSection";
import CommunityFeedSection from "@/components/sections/CommunityFeedSection";
import StatsSection from "@/components/sections/StatsSection";
import QuickActionsSection from "@/components/sections/QuickActionsSection";
import ChallengesSection from "@/components/sections/ChallengesSection";
import ActivitySection from "@/components/sections/ActivitySection";
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';


export default function ExploreScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, showSetupModal, setShowSetupModal } = useAuth();
  const router = useRouter();
  
  // Component state
  const [isInitialized, setIsInitialized] = useState(false);
  const [challenges, setChallenges] = useState([
    {
      id: "1",
      theme: "Tech Innovation",
      reward: 25,
      requiredLikes: 50,
      requiredRetweets: 10,
      timeRemaining: "23 hours",
      description: "Share your thoughts on the future of AI in everyday applications",
    },
    {
      id: "2",
      theme: "Crypto Education",
      reward: 40,
      requiredLikes: 75,
      requiredRetweets: 15,
      timeRemaining: "2 days",
      description: "Explain a blockchain concept in simple terms that anyone can understand",
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

  const [refreshing, setRefreshing] = useState(false);

  // Simplified initialization
  const [isMounted, setIsMounted] = useState(false);
  const toggleAnim = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;
  
  useEffect(() => {
    // Set mounted state after a small delay to ensure proper rendering
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Animate toggle when theme changes
  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      bounciness: 20,
      speed: 20
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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => {
      const timer = setTimeout(() => {
        setRefreshing(false);
        resolve(undefined);
      }, 1000);
      return () => clearTimeout(timer);
    });
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
      ? require("@/assets/images/logo.png")
      : require("@/assets/images/logo.png");
  };

  // Show loading state if not mounted yet
  if (!isMounted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />
      {/* Header */}
      <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Explore</Text>
            </View>

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
                      backgroundColor: isDark ? theme.colors.primary + '80' : '#E5E7EB',
                    },
                  ]}
                >
                  <Animated.View 
                    style={[
                      styles.themeToggleThumb,
                      {
                        transform: [
                          {
                            translateX: toggleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [2, 22]
                            })
                          }
                        ],
                        backgroundColor: isDark ? theme.colors.primary : '#ffffff',
                      }
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
                  Connect your X account to start earning rewards
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Stats Cards */}
          <StatsSection 
            theme={theme}
            isAuthenticated={isAuthenticated}
            stats={stats}
            onStatsPress={() => !isAuthenticated && setShowSetupModal(true)}
          />

          {/* Community Activity Section */}
          <CommunityFeedSection 
            theme={theme}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />

          {/* Quick Actions */}
          <QuickActionsSection 
            theme={theme}
            onNewTweet={handleNewTweet}
            onBrowseChallenges={() => router.push('/(tabs)/challenges')}
          />

          {/* Challenges Section */}
          <ChallengesSection 
            theme={theme}
            challenges={challenges}
            onSelectChallenge={handleSelectChallenge}
            onViewAll={() => router.push('/(tabs)/challenges')}
          />

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
          <ActivitySection 
            theme={theme}
            isAuthenticated={isAuthenticated}
            onSetupPress={() => setShowSetupModal(true)}
          />

          {/* App Branding */}
          <View style={styles.brandingContainer}>
            <Image
              source={getLogoSource()}
              style={styles.brandingLogo}
              contentFit="contain"
            />
            <Text style={styles.brandingTitle}>XQuests</Text>
            <Text style={styles.brandingSubtitle}>Tweet. Engage. Earn.</Text>
            <Text style={styles.brandingDescription}>
              The future of social media engagement is here. Connect your X account, 
              participate in challenges, and earn cryptocurrency rewards for your authentic engagement.
            </Text>
          </View>
        </ScrollView>

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 32,
    height: 32,
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
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
  brandingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  brandingLogo: {
    width: 80,
    height: 80,
  },
  brandingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 16,
  },
  brandingSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  brandingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
});