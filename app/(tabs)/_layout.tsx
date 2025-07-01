import { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Compass, Bell, Award, Settings } from 'lucide-react-native';
import { useColorScheme, Dimensions, Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import SharedSidebar from '../../components/SharedSidebar';
import { LucideIcon } from 'lucide-react-native';

interface TabBarIconProps {
  icon: LucideIcon;
  focused: boolean;
  color: string;
  activeColor: string;
  onPress: () => void;
  label: string;
}

const TabBarIcon = ({ icon: Icon, focused, color, activeColor, onPress, label }: TabBarIconProps) => (
  <TouchableOpacity 
    onPress={onPress}
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      flex: 1,
    }}
  >
    <Icon 
      size={24} 
      color={focused ? activeColor : color} 
      strokeWidth={focused ? 2.5 : 2}
    />
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
        </Tabs>
      </View>
    </SharedSidebar>
  );
}