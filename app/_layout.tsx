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
    setShowSplash(false);
  };

  // Handle app initialization
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initialize = async () => {
      try {
        console.log('🚀 Initializing XQuests app...');
        
        if (Platform.OS === 'web') {
          // Register service worker in the background
          registerSW().catch(() => {});

          // Handle initial navigation
          const currentPath = window.location.pathname;
          const isTabRoute = currentPath.startsWith('/(tabs)');
          
          if (!isTabRoute && currentPath !== '/') {
            console.log('🔄 Redirecting to tabs from:', currentPath);
            window.history.replaceState({}, '', '/(tabs)');
            await router.replace('/(tabs)');
          }
          
          // Signal that the app is loaded
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              console.log('📡 Dispatching expo-loaded event');
              window.dispatchEvent(new CustomEvent('expo-loaded'));
              
              // Also try the manual trigger
              if (window.hideLoadingScreen) {
                window.hideLoadingScreen();
              }
            }
          }, 100);
        } else if (pathname === '/' || pathname === '') {
          await router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('❌ Initialization error:', error);
      } finally {
        if (mounted) {
          setAppReady(true);
          setInitialized(true);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initialize();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname, router]);

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

  // Signal app is ready on web
  useEffect(() => {
    if (Platform.OS === 'web' && appReady && authInitialized) {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🎯 App fully ready, dispatching react-loaded event');
          window.dispatchEvent(new CustomEvent('react-loaded'));
          
          if (window.hideLoadingScreen) {
            window.hideLoadingScreen();
          }
        }
      }, 200);
    }
  }, [appReady, authInitialized]);

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