import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { AuthProvider } from '../contexts/AuthContext';
import { registerSW } from '../hooks/usePWA';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAUpdatePrompt from '../components/PWAUpdatePrompt';

// Enable screens before any navigation components are rendered
enableScreens();

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Register service worker for PWA functionality
    if (Platform.OS === 'web') {
      registerSW();
      
      // Enhanced client-side routing for direct URL access
      if (typeof window !== 'undefined') {
        // Handle browser navigation properly
        const handlePopState = (event: PopStateEvent) => {
          // Let Expo Router handle the navigation
          console.log('Browser navigation detected:', window.location.pathname);
        };
        
        // Handle initial page load for direct URLs
        const handleInitialLoad = () => {
          const currentPath = window.location.pathname;
          console.log('Initial page load:', currentPath);
          
          // If we're not on the home page and this is a direct load,
          // ensure the router is ready to handle it
          if (currentPath !== '/' && currentPath !== '/index') {
            // Add a small delay to ensure router is initialized
            setTimeout(() => {
              // Check if the current route is valid by seeing if we're on a 404
              if (document.title.includes('404') || document.title.includes('Not Found')) {
                console.log('Detected 404, may need redirect handling');
              }
            }, 100);
          }
        };
        
        // Add event listeners
        window.addEventListener('popstate', handlePopState);
        
        // Handle initial load
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', handleInitialLoad);
        } else {
          handleInitialLoad();
        }
        
        return () => {
          window.removeEventListener('popstate', handlePopState);
          document.removeEventListener('DOMContentLoaded', handleInitialLoad);
        };
      }
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          
          {/* PWA Components - only render on web */}
          {Platform.OS === 'web' && (
            <>
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
            </>
          )}
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}