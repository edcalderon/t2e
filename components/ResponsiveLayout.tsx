import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SharedSidebar from './SharedSidebar';
import BottomNavigation from './BottomNavigation';
import { useSidebar } from '../contexts/SidebarContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();

  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        {/* Desktop/Tablet Sidebar */}
        {!isMobile && (
          <SharedSidebar 
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        )}
        
        {/* Main Content */}
        <View style={[styles.mainContent, isMobile && styles.mobileMainContent]}>
          {children}
        </View>
      </View>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  mobileMainContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
});