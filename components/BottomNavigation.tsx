import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Search, Bell, Award, Settings } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function BottomNavigation() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  const navItems = [
    { id: 'explore', icon: Search, route: '/(tabs)/' },
    { id: 'notifications', icon: Bell, route: '/(tabs)/notifications', badge: 3 },
    { id: 'challenges', icon: Award, route: '/(tabs)/challenges' },
    { id: 'settings', icon: Settings, route: '/(tabs)/settings' },
  ];

  const getActiveRoute = () => {
    if (pathname === '/(tabs)/' || pathname === '/') return 'explore';
    if (pathname.includes('notifications')) return 'notifications';
    if (pathname.includes('challenges')) return 'challenges';
    if (pathname.includes('settings')) return 'settings';
    return 'explore';
  };

  const activeRoute = getActiveRoute();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeRoute === item.id;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconComponent 
                  size={24} 
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.badge && (
                  <View style={styles.badge}>
                    <View style={styles.badgeInner} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for iPhone home indicator
    paddingHorizontal: 16,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});