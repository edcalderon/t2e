import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Plus, Menu, MoveHorizontal as MoreHorizontal } from "lucide-react-native";
import SmallLogoBlack from '../assets/images/small_logo_black.svg';
import SmallLogoWhite from '../assets/images/small_logo_white.svg';
import { NAV_ITEMS, getActiveRoute } from '../config/navigation';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface SharedSidebarProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
}

export default function SharedSidebar({
  children,
  sidebarCollapsed: propSidebarCollapsed = false,
  setSidebarCollapsed: propSetSidebarCollapsed
}: SharedSidebarProps) {
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(propSidebarCollapsed);
  const sidebarCollapsed = propSetSidebarCollapsed ? propSidebarCollapsed : internalSidebarCollapsed;
  const setSidebarCollapsed = propSetSidebarCollapsed || setInternalSidebarCollapsed;
  const { theme, isDark } = useTheme();
  const { user, isAuthenticated, setShowSetupModal, twitterUser, isSupabaseAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarAnimation] = useState(new Animated.Value(sidebarCollapsed ? 0 : 1));

  // Animate sidebar collapse/expand
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: sidebarCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNewPost = () => {
    if (!isAuthenticated) {
      setShowSetupModal(true);
      return;
    }
    console.log('Creating new post');
  };

  // Use shared navigation items and add authentication-specific badges
  const sidebarItems = NAV_ITEMS.map(item => ({
    ...item,
    badge: item.id === 'notifications' && isAuthenticated ? 3 : undefined
  }));

  const activeRoute = getActiveRoute(pathname);

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

  // Get user display data - prioritize local user, fallback to twitter user, then guest
  const getUserDisplayData = () => {
    if (user) {
      return {
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        isGuest: false,
      };
    } else if (twitterUser) {
      return {
        username: twitterUser.username,
        displayName: twitterUser.displayName,
        avatar: twitterUser.avatar,
        isGuest: false,
      };
    } else if (isSupabaseAuthenticated) {
      // We have a session but no user data - show basic authenticated state
      return {
        username: 'Twitter User',
        displayName: 'Connected User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=connected-user&backgroundColor=b6e3f4,c0aede,d1d4f9',
        isGuest: false,
      };
    } else {
      // Guest user - use generative avatar
      return {
        username: 'Guest User',
        displayName: 'Guest User',
        avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=guest-user&backgroundColor=f1f4f8&primaryColor=6366f1',
        isGuest: true,
      };
    }
  };

  const userDisplayData = getUserDisplayData();
  // Merge all styles
  const themeStyles = createStyles(theme);
  const bottomNavThemeStyles = bottomNavStyles(theme);
  const styles = {
    ...baseStyles,
    ...themeStyles,
    ...bottomNavThemeStyles,
    // Mobile styles override
    mobileContainer: {
      ...baseStyles.mobileContainer,
      backgroundColor: theme.colors.background,
    },
    layout: baseStyles.layout,
    mainContent: baseStyles.mainContent,
  };

  // Get the appropriate logo based on theme
  const Logo = isDark ? SmallLogoBlack : SmallLogoWhite;

  // Mobile view with custom bottom navigation
  if (isMobile) {
    return (
      <View style={styles.mobileContainer}>
        <View style={styles.mobileContent}>
          {children}
        </View>
        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeRoute === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.bottomNavItem,
                  isActive && styles.bottomNavItemActive
                ]}
                onPress={() => router.push(item.route)}
              >
                <IconComponent
                  size={24}
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text
                  style={[
                    styles.bottomNavText,
                    { color: isActive ? theme.colors.primary : theme.colors.textSecondary }
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // Desktop/Tablet view
  return (
    <View style={styles.layout}>
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        {/* Custom App Logo */}
        <View style={[
          styles.logoContainer,
          { flexDirection: 'row', alignItems: 'center' }
        ]}>
          <View style={[
            styles.appLogo,
            sidebarCollapsed && styles.appLogoCollapsed,

          ]}>
            <Logo
              width="40"
              height="40"
              preserveAspectRatio="xMidYMid meet"
            />

          </View>
          {!sidebarCollapsed && (
            <Animated.Text
              style={[
                styles.logoText,
                {
                  opacity: textOpacity,
                  marginLeft: textMarginLeft,
                },
              ]}
            >
              XQuests
            </Animated.Text>
          )}
        </View>

        {/* Navigation Items */}
        <View style={styles.navItems}>
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeRoute === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive,
                  sidebarCollapsed && styles.navItemCollapsed
                ]}
                onPress={() => router.push(item.route)}
              >
                {sidebarCollapsed ? (
                  // Collapsed mode - center icon directly
                  <View style={styles.collapsedIconContainer}>
                    <IconComponent
                      size={28}
                      color={isActive ? theme.colors.text : theme.colors.textSecondary}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.badge && item.badge > 0 && (
                      <View style={styles.badgeCollapsed}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  // Expanded mode - normal layout
                  <View style={styles.navItemContent}>
                    <View style={styles.iconWrapper}>
                      <IconComponent
                        size={26}
                        color={isActive ? theme.colors.text : theme.colors.textSecondary}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.badge && item.badge > 0 && (
                        <View style={styles.badge}>
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
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Post Button */}
        <Animated.View style={[styles.postButtonContainer, { width: postButtonWidth }]}>
          <TouchableOpacity
            style={[
              styles.postButton,
              sidebarCollapsed && styles.postButtonCollapsed
            ]}
            onPress={handleNewPost}
          >
            {sidebarCollapsed ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ color: '#fff', display: 'block' }}><g><path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z" fill="#fff"></path></g></svg>
              </View>
            ) : (
              <>
                <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                <Animated.Text style={[styles.postButtonText, { opacity: textOpacity, marginLeft: postButtonTextMarginLeft }]}>
                  Post
                </Animated.Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* User Profile */}
        <TouchableOpacity
          style={[
            styles.userProfile,
            sidebarCollapsed && styles.userProfileCollapsed
          ]}
          onPress={() => userDisplayData.isGuest && setShowSetupModal(true)}
        >
          <Image
            source={{ uri: userDisplayData.avatar }}
            style={[
              styles.userAvatar,
              sidebarCollapsed && styles.userAvatarCollapsed,
              userDisplayData.isGuest && styles.userAvatarDisabled
            ]}
          />
          <Animated.View style={[styles.userInfo, { opacity: textOpacity }]}>
            <Text style={styles.userName}>
              {userDisplayData.displayName}
            </Text>
            <Text style={styles.userHandle}>
              {userDisplayData.isGuest
                ? "Not connected"
                : `@${userDisplayData.username.toLowerCase()}`
              }
            </Text>
            {isAuthenticated && !userDisplayData.isGuest && (
              <View style={styles.connectedIndicator}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            )}
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
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
}

// Base styles that work with or without theme
const baseStyles = StyleSheet.create({
  // Mobile styles
  mobileContainer: {
    flex: 1,
    position: 'relative',
  },
  mobileContent: {
    flex: 1,
    paddingBottom: 60, // Space for bottom navigation
  },

  // Desktop/Tablet layout
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },

  // Theme-specific styles are defined in createStyles
});

// Bottom navigation styles
const bottomNavStyles = (theme: any) => StyleSheet.create({
  bottomNav: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: 8,
    paddingBottom: 12, // Extra padding for better touch targets and safe area
  },
  bottomNavItem: {
    alignItems: 'center' as const,
    padding: 8,
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  bottomNavItemActive: {
    backgroundColor: theme.colors.surface,
  },
  bottomNavText: {
    fontSize: 10,
    marginTop: 4,
  },
});

// Theme-specific styles
const createStyles = (theme: any) => StyleSheet.create({
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
  appLogo: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: 8,
    letterSpacing: 1.2,
  },
  appLogoCollapsed: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  appLogoImage: {
    width: 28,
    height: 28,
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
  collapsedIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
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
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: -12,
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
  userAvatarDisabled: {
    opacity: 0.6,
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
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 4,
  },
  connectedText: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '500',
  },
  collapseButton: {
    padding: 4,
  },
  collapseButtonCollapsed: {
    marginTop: 12,
    alignSelf: 'center',
  },
});