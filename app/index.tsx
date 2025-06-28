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
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { Award, Plus, Search, Sparkles, TrendingUp, Users, Moon, Sun, Trophy, Bell, Settings, Menu, MoveHorizontal as MoreHorizontal } from "lucide-react-native";
import ChallengeCard from "../src/components/ChallengeCard";
import LeaderboardSection from "../src/components/LeaderboardSection";
import AccountSetupModal from "../src/components/AccountSetupModal";
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarAnimation] = useState(new Animated.Value(1));
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

  // Animation for theme toggle
  const [themeAnimation] = useState(new Animated.Value(isDark ? 1 : 0));

  useEffect(() => {
    Animated.timing(themeAnimation, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  useEffect(() => {
    if (isFirstTimeUser) {
      setShowSetupModal(true);
    }
  }, [isFirstTimeUser]);

  // Animate sidebar collapse/expand
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: sidebarCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarCollapsed]);

  const handleSetupComplete = () => {
    setIsFirstTimeUser(false);
    setShowSetupModal(false);
  };

  const handleSelectChallenge = (challengeId: string) => {
    console.log(`Selected challenge: ${challengeId}`);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const sidebarItems = [
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: 3 },
    { id: 'challenges', icon: Award, label: 'Challenges' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderSidebar = () => {
    const sidebarWidth = sidebarAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [88, 275],
    });

    const textOpacity = sidebarAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    const textMarginLeft = sidebarAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20],
    });

    const postButtonWidth = sidebarAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [56, 200],
    });

    const postButtonTextMarginLeft = sidebarAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8],
    });

    return (
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        {/* X Logo */}
        <View style={styles.logoContainer}>
          <View style={[
            styles.xLogo,
            sidebarCollapsed && styles.xLogoCollapsed
          ]}>
            <Text style={styles.xLogoText}>𝕏</Text>
          </View>
        </View>

        {/* Navigation Items */}
        <View style={styles.navItems}>
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive,
                  sidebarCollapsed && styles.navItemCollapsed
                ]}
                onPress={() => setActiveTab(item.id)}
              >
                <View style={[
                  styles.navItemContent,
                  sidebarCollapsed && styles.navItemContentCollapsed
                ]}>
                  <View style={[
                    styles.iconWrapper,
                    sidebarCollapsed && styles.iconWrapperCollapsed
                  ]}>
                    <IconComponent 
                      size={sidebarCollapsed ? 32 : 26} 
                      color={isActive ? theme.colors.text : theme.colors.textSecondary}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.badge && (
                      <View style={[
                        styles.badge,
                        sidebarCollapsed && styles.badgeCollapsed
                      ]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Animated.Text 
                    style={[
                      styles.navItemText,
                      isActive && styles.navItemTextActive,
                      { opacity: textOpacity, marginLeft: textMarginLeft }
                    ]}
                  >
                    {item.label}
                  </Animated.Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Post Button */}
        <Animated.View style={[styles.postButtonContainer, { width: postButtonWidth }]}>
          <TouchableOpacity style={[
            styles.postButton,
            sidebarCollapsed && styles.postButtonCollapsed
          ]}>
            <Plus size={sidebarCollapsed ? 28 : 24} color="#FFFFFF" strokeWidth={2.5} />
            <Animated.Text style={[styles.postButtonText, { opacity: textOpacity, marginLeft: postButtonTextMarginLeft }]}>
              Post
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        {/* User Profile */}
        <TouchableOpacity style={[
          styles.userProfile,
          sidebarCollapsed && styles.userProfileCollapsed
        ]}>
          <Image
            source={{ uri: userProfile.avatar }}
            style={[
              styles.userAvatar,
              sidebarCollapsed && styles.userAvatarCollapsed
            ]}
          />
          <Animated.View style={[styles.userInfo, { opacity: textOpacity }]}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userHandle}>{userProfile.handle}</Text>
          </Animated.View>
          <TouchableOpacity 
            style={[
              styles.collapseButton,
              sidebarCollapsed && styles.collapseButtonCollapsed
            ]}
            onPress={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <Menu size={24} color={theme.colors.textSecondary} />
            ) : (
              <MoreHorizontal size={20} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMainContent = () => (
    <View style={styles.mainContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {activeTab === 'explore' ? 'Explore' :
             activeTab === 'notifications' ? 'Notifications' :
             activeTab === 'challenges' ? 'Challenges' :
             activeTab === 'settings' ? 'Settings' : 'XQuests'}
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.walletBadge}>
              <Sparkles size={16} color={theme.colors.primary} />
              <Text style={styles.walletAmount}>{userProfile.walletBalance}</Text>
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
                    <Moon size={12} color={theme.colors.primary} />
                  ) : (
                    <Sun size={12} color="#FFD700" />
                  )}
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'explore' && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <TrendingUp size={20} color={theme.colors.success} />
                  <Text style={styles.statValue}>{stats.totalEarned}</Text>
                  <Text style={styles.statLabel}>Total Earned</Text>
                  <Text style={styles.statChange}>+{stats.thisWeek} this week</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Trophy size={20} color={theme.colors.warning} />
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
                  <Plus size={20} color={theme.colors.primary} />
                  <Text style={styles.quickActionText}>New Tweet</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => setActiveTab('challenges')}
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
                <TouchableOpacity onPress={() => setActiveTab('challenges')}>
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
          </>
        )}

        {activeTab === 'challenges' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Challenges</Text>
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
        )}

        {activeTab === 'notifications' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.notificationItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Bell size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  New challenge available: <Text style={styles.highlight}>Crypto Education</Text>
                </Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.notificationItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Trophy size={16} color={theme.colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Challenge completed! You earned <Text style={styles.highlight}>40 ALGO</Text>
                </Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Profile Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Wallet Configuration</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Notification Preferences</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Privacy & Security</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      <View style={styles.layout}>
        {renderSidebar()}
        {renderMainContent()}
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

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  logoContainer: {
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  xLogo: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  xLogoCollapsed: {
    alignSelf: 'center',
    marginLeft: 0,
  },
  xLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  navItems: {
    flex: 1,
    paddingTop: 8,
  },
  navItem: {
    borderRadius: 24,
    marginVertical: 2,
    overflow: 'hidden',
  },
  navItemCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    alignSelf: 'center',
    padding: 0,
    margin: 0,
  },
  navItemActive: {
    backgroundColor: 'transparent',
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navItemContentCollapsed: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperCollapsed: {
    width: 32,
    height: 32,
    margin: 0,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemText: {
    fontSize: 20,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  navItemTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
  },
  badgeCollapsed: {
    top: -12,
    right: -12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  postButtonContainer: {
    marginVertical: 16,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  postButtonCollapsed: {
    width: 64,
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 0,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
  },
  userProfileCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    flexDirection: 'column',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarCollapsed: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  userHandle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  collapseButton: {
    padding: 4,
  },
  collapseButtonCollapsed: {
    marginTop: 12,
    alignSelf: 'center',
  },
  mainContent: {
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
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  settingsContainer: {
    marginTop: 16,
  },
  settingItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
});