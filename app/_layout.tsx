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
    console.log('🚀 RootLayout mounted');
    
    // Register service worker for PWA functionality
    if (Platform.OS === 'web') {
      registerSW();
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