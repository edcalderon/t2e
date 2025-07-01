import { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import { Platform, View, ActivityIndicator, Text, BackHandler } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { registerSW } from '../hooks/usePWA';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAUpdatePrompt from '../components/PWAUpdatePrompt';
import SplashScreen from '../components/SplashScreen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Enable screens before any navigation components are rendered
enableScreens();

function AppContent() {
  const [appReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { initialized: authInitialized } = useAuth();
  
  const handleSplashComplete = () => {
    console.log('🎬 Splash screen completed');
    setShowSplash(false);
  };

  // Handle app initialization
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initialize = async () => {
      try {
        console.log('🚀 Initializing XQuests app...');
        
        if (Platform.OS === 'web') {
          // Register service worker in the background
          registerSW().catch(() => {});

          // Handle initial navigation
          const currentPath = window.location.pathname;
          const isTabRoute = currentPath.startsWith('/(tabs)') || currentPath === '/';
          
          if (!isTabRoute) {
            console.log('🔄 Redirecting to tabs from:', currentPath);
            window.history.replaceState({}, '', '/(tabs)');
            await router.replace('/(tabs)');
          }
        } else if (pathname === '/' || pathname === '') {
          await router.replace('/(tabs)');
        }
        
        // Mark as ready
        if (mounted) {
          setAppReady(true);
          setInitialized(true);
          console.log('✅ App initialization complete');
        }
      } catch (error) {
        console.error('❌ Initialization error:', error);
        if (mounted) {
          setAppReady(true);
          setInitialized(true);
        }
      }
    };

    // Initialize with a small delay
    initTimeout = setTimeout(() => {
      initialize();
    }, 100);

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, [pathname, router]);

  // Signal app ready to loading screen
  useEffect(() => {
    if (Platform.OS === 'web' && appReady && authInitialized && !showSplash) {
      console.log('🎯 App fully ready, signaling to loading screen');
      
      // Multiple signals to ensure loading screen hides
      const signalReady = () => {
        if (typeof window !== 'undefined') {
          // Dispatch multiple events
          window.dispatchEvent(new CustomEvent('expo-loaded'));
          window.dispatchEvent(new CustomEvent('react-loaded'));
          
          // Manual trigger as fallback
          if (window.hideLoadingScreen) {
            window.hideLoadingScreen();
          }
        }
      };
      
      // Signal immediately and with delays
      signalReady();
      setTimeout(signalReady, 100);
      setTimeout(signalReady, 500);
    }
  }, [appReady, authInitialized, showSplash]);

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    
    const backAction = () => {
      if (pathname !== '/' && pathname !== '/(tabs)') {
        router.back();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [pathname, router]);

  // Show splash screen if needed
  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <StatusBar style="light" />
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      </View>
    );
  }

  // Show loading state while app is initializing
  if (!appReady || !authInitialized) {
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