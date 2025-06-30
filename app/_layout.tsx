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
      
      // Handle client-side routing for direct URL access
      if (typeof window !== 'undefined') {
        // Ensure the app handles direct navigation properly
        const handlePopState = () => {
          // Force a re-render when user navigates with browser buttons
          window.location.reload();
        };
        
        // Only add listener if we're not on the home page
        if (window.location.pathname !== '/') {
          window.addEventListener('popstate', handlePopState);
          
          return () => {
            window.removeEventListener('popstate', handlePopState);
          };
        }
      }
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Stack screenOptions={{ headerShown: false }}>
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