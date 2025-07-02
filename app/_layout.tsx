import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { enableScreens } from 'react-native-screens';
import { Platform, View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AdminProvider } from '../contexts/AdminContext';
import { registerSW } from '../hooks/usePWA';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAUpdatePrompt from '../components/PWAUpdatePrompt';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Enable screens before any navigation components are rendered
enableScreens();

function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#1D9BF0" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack 
        screenOptions={{ headerShown: false }}
        initialRouteName="(tabs)"
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="auth/callback" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="privacy" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="terms" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ headerShown: false }}
        />
      </Stack>
      
      {Platform.OS === 'web' && (
        <>
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
        </>
      )}
    </View>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useFrameworkReady();
  
  useEffect(() => {
    // Register service worker for PWA functionality
    if (Platform.OS === 'web') {
      registerSW();
    }
  }, []);

  const content = children || <AppContent />;
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <SidebarProvider>
            {content}
          </SidebarProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}