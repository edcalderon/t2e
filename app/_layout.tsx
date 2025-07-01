import { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import { Platform, View, ActivityIndicator, Text } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { registerSW } from '../hooks/usePWA';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAUpdatePrompt from '../components/PWAUpdatePrompt';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Enable screens before any navigation components are rendered
enableScreens();

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { initialized: authInitialized } = useAuth();
  
  // Initialize app immediately
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing XQuests app...');
        
        if (Platform.OS === 'web') {
          // Register service worker in the background
          registerSW().catch(() => {});

          // Handle initial navigation - ensure we're on tabs route
          const currentPath = window.location.pathname;
          console.log('Current path:', currentPath);
          
          // If we're not on a valid route, redirect to tabs
          if (currentPath === '/' || currentPath === '' || !currentPath.startsWith('/(tabs)')) {
            console.log('🔄 Redirecting to tabs from:', currentPath);
            router.replace('/(tabs)');
          }
        }
        
        // Mark as ready immediately
        if (mounted) {
          setIsReady(true);
          console.log('✅ App initialization complete');
        }
      } catch (error) {
        console.error('❌ Initialization error:', error);
        if (mounted) {
          setIsReady(true); // Still mark as ready to prevent infinite loading
        }
      }
    };

    // Initialize immediately without delay
    initializeApp();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Signal app ready to any external loading screens
  useEffect(() => {
    if (Platform.OS === 'web' && isReady && authInitialized) {
      console.log('🎯 App fully ready, signaling completion');
      
      // Signal to external loading screen
      if (typeof window !== 'undefined') {
        // Multiple signals to ensure loading screen hides
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('expo-loaded'));
          window.dispatchEvent(new CustomEvent('react-loaded'));
          
          // Manual trigger as fallback
          if (window.hideLoadingScreen) {
            window.hideLoadingScreen();
          }
        }, 100);
      }
    }
  }, [isReady, authInitialized]);

  // Show minimal loading only if absolutely necessary
  if (!isReady || !authInitialized) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000'
      }}>
        <ActivityIndicator size="large" color="#1D9BF0" />
        <Text style={{ 
          marginTop: 10, 
          color: '#ffffff',
          fontSize: 16,
          fontWeight: '500'
        }}>
          Loading XQuests...
        </Text>
      </View>
    );
  }

  // Main app content
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
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

export default function RootLayout() {
  useFrameworkReady();
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}