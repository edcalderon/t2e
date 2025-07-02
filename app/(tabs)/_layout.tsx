import { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Compass, Bell, Award, Settings, Shield } from 'lucide-react-native';
import { useColorScheme, Dimensions, Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useNotifications } from '../../hooks/useNotifications';
import SharedSidebar from '../../components/SharedSidebar';
import { LucideIcon } from 'lucide-react-native';

interface TabBarIconProps {
  icon: LucideIcon;
  focused: boolean;
  color: string;
  activeColor: string;
  onPress: () => void;
  label: string;
  badge?: number;
}

const TabBarIcon = ({ icon: Icon, focused, color, activeColor, onPress, label, badge }: TabBarIconProps) => (
  <TouchableOpacity 
    onPress={onPress}
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      flex: 1,
      position: 'relative',
    }}
  >
    <Icon 
      size={24} 
      color={focused ? activeColor : color} 
      strokeWidth={focused ? 2.5 : 2}
    />
    {badge && badge > 0 && (
      <View style={{
        position: 'absolute',
        top: 4,
        right: 8,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: '700',
        }}>
          {badge > 99 ? '99+' : badge}
        </Text>
      </View>
    )}
    <Text 
      style={{
        fontSize: 10,
        marginTop: 2,
        fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium',
        color: focused ? activeColor : color,
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;
const isIos = Platform.OS === 'ios';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const { isAdmin } = useAdmin();
  const { unreadCount } = useNotifications();

  return (
    <SharedSidebar 
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
    >
      <View style={{ flex: 1}}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide the default tab bar
          }}
          initialRouteName="index"
          backBehavior="history"
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Explore',
              tabBarIcon: ({ size, color }) => (
                <Compass size={24} color={color} strokeWidth={2.5} />
              ),
            }}
          />

          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Activity',
              tabBarIcon: ({ size, color }) => (
                <Bell size={24} color={color} strokeWidth={2.5} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="challenges"
            options={{
              title: 'Challenges',
              tabBarIcon: ({ size, color }) => (
                <Award size={24} color={color} strokeWidth={2.5} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Profile',
              tabBarIcon: ({ size, color }) => (
                <Settings size={24} color={color} strokeWidth={2.5} />
              ),
            }}
          />

          {/* Admin Tab - Only visible to admins */}
          {isAdmin && (
            <Tabs.Screen
              name="admin"
              options={{
                title: 'Admin',
                tabBarIcon: ({ size, color }) => (
                  <Shield size={24} color={color} strokeWidth={2.5} />
                ),
              }}
            />
          )}
        </Tabs>
      </View>
    </SharedSidebar>
  );
}