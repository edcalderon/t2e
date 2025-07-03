import { Href } from 'expo-router';
import { Search, Bell, Award, Settings, Shield } from 'lucide-react-native';

export interface NavItem {
  id: string;
  icon: any; // Using 'any' for Lucide icon component type
  label: string;
  route: Href<object>;
  badge?: number;
  permissions?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { 
    id: 'explore', 
    icon: Search, 
    label: 'Explore', 
    route: { pathname: '/(tabs)/' } 
  },
  { 
    id: 'notifications', 
    icon: Bell, 
    label: 'Notifications', 
    route: { pathname: '/(tabs)/notifications' }
  },
  { 
    id: 'challenges', 
    icon: Award, 
    label: 'Challenges', 
    route: { pathname: '/(tabs)/challenges' } 
  },
  { 
    id: 'admin', 
    icon: Shield, 
    label: 'Admin', 
    route: { pathname: '/(tabs)/admin' },
    permissions: ['admin']
  },
  { 
    id: 'settings', 
    icon: Settings, 
    label: 'Settings', 
    route: { pathname: '/(tabs)/settings' },
  },
];

export const getActiveRoute = (pathname: string): string => {
  if (pathname === '/(tabs)/' || pathname === '/') return 'explore';
  if (pathname.includes('notifications')) return 'notifications';
  if (pathname.includes('challenges')) return 'challenges';
  if (pathname.includes('admin')) return 'admin';
  if (pathname.includes('settings')) return 'settings';
  return 'explore';
};
