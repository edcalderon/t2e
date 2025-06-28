import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Award, Plus, Search, Bell, Settings, Menu, MoveHorizontal as MoreHorizontal } from "lucide-react-native";
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface SharedSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function SharedSidebar({ sidebarCollapsed, setSidebarCollapsed }: SharedSidebarProps) {
  const { theme } = useTheme();
  const { user, isAuthenticated, setShowSetupModal } = useAuth();
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

  const sidebarItems = [
    { id: 'explore', icon: Search, label: 'Explore', route: '/(tabs)/' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: isAuthenticated ? 3 : 0, route: '/(tabs)/notifications' },
    { id: 'challenges', icon: Award, label: 'Challenges', route: '/(tabs)/challenges' },
    { id: 'settings', icon: Settings, label: 'Settings', route: '/(tabs)/settings' },
  ];

  const getActiveRoute = () => {
    if (pathname === '/(tabs)/' || pathname === '/') return 'explore';
    if (pathname.includes('notifications')) return 'notifications';
    if (pathname.includes('challenges')) return 'challenges';
    if (pathname.includes('settings')) return 'settings';
    return 'explore';
  };

  const activeRoute = getActiveRoute();

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

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
      {/* X Logo using the new SVG */}
      <View style={styles.logoContainer}>
        <View style={[
          styles.xLogo,
          sidebarCollapsed && styles.xLogoCollapsed
        ]}>
          <Image
            source={require("../assets/images/small_logo.svg")}
            style={styles.xLogoImage}
            contentFit="contain"
          />
        </View>
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
                  {item.badge > 0 && (
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
                    {item.badge > 0 && (
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
          <Plus size={sidebarCollapsed ? 28 : 24} color="#FFFFFF" strokeWidth={2.5} />
          <Animated.Text style={[styles.postButtonText, { opacity: textOpacity, marginLeft: postButtonTextMarginLeft }]}>
            Post
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>

      {/* User Profile */}
      <TouchableOpacity 
        style={[
          styles.userProfile,
          sidebarCollapsed && styles.userProfileCollapsed
        ]}
        onPress={() => !isAuthenticated && setShowSetupModal(true)}
      >
        <Image
          source={{ 
            uri: isAuthenticated && user?.avatar 
              ? user.avatar 
              : "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" 
          }}
          style={[
            styles.userAvatar,
            sidebarCollapsed && styles.userAvatarCollapsed,
            !isAuthenticated && styles.userAvatarDisabled
          ]}
        />
        <Animated.View style={[styles.userInfo, { opacity: textOpacity }]}>
          <Text style={styles.userName}>
            {isAuthenticated && user ? user.username : "Guest User"}
          </Text>
          <Text style={styles.userHandle}>
            {isAuthenticated && user ? `@${user.username.toLowerCase()}` : "Not connected"}
          </Text>
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
}

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
  xLogo: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  xLogoCollapsed: {
    alignSelf: 'center',
    marginLeft: 0,
  },
  xLogoImage: {
    width: 32,
    height: 32,
    tintColor: theme.colors.text,
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
  collapseButton: {
    padding: 4,
  },
  collapseButtonCollapsed: {
    marginTop: 12,
    alignSelf: 'center',
  },
});