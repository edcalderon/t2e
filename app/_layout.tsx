import { useEffect, useState, useCallback } from 'react';
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

// Enable screens before any navigation components are rendered
enableScreens();

function AppContent() {
  const [appReady, setAppReady] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Handle app loading state
  useEffect(() => {
    const handleLoad = () => {
      // Only hide loading screen if we're in a browser environment
      if (typeof window !== 'undefined') {
        try {
          // @ts-ignore - hideLoadingScreen is defined in the web/index.html
          if (window.hideLoadingScreen) {
            // @ts-ignore
            window.hideLoadingScreen();
          }
        } catch (error) {
          console.error('Error hiding loading screen:', error);
        }
        setAppReady(true);
      }
    };

    // If the app is already loaded, hide the loading screen immediately
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      // Otherwise, wait for the load event
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);
  
  // Handle back button/gesture on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
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
    }
  }, [pathname]);
  
  // Handle client-side navigation and app initialization
  useEffect(() => {
    if (initialized) return;
    
    console.log('🚀 RootLayout mounted');
    
    const initApp = async () => {
      try {
        console.log('🔄 Initializing app...');
        
        const initializeApp = () => {
          setAppReady(true);
          setInitialized(true);
        };
        
        if (Platform.OS === 'web') {
          // Handle initial navigation first
          const currentPath = window.location.pathname;
          const targetPath = '/(tabs)';
          
          // Only redirect if not already on a tabs route
          if (currentPath === '/' || currentPath === '' || !currentPath.startsWith('/(tabs)')) {
            // Use setTimeout to ensure the router is ready
            setTimeout(() => {
              router.replace(targetPath);
              initializeApp();
            }, 0);
          } else {
            initializeApp();
          }
          
          // Register service worker
          try {
            await registerSW();
          } catch (error) {
            // Silent fail for service worker
          }
          
          // Handle browser back/forward navigation
          const handleRouteChange = () => {
            const path = window.location.pathname;
            if (path === '/' || path === '' || path === '/(tabs)' || !path.startsWith('/(tabs)')) {
              window.history.replaceState({}, '', '/(tabs)');
              router.replace({ pathname: '/(tabs)' } as never);
            }
          };
          
          window.addEventListener('popstate', handleRouteChange);
          return () => {
            window.removeEventListener('popstate', handleRouteChange);
          };
        } else {
          // For native platforms
          if (pathname === '/' || pathname === '') {
            router.replace({ pathname: '/(tabs)' } as never);
          }
        }
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      } finally {
        console.log('✅ App initialization complete');
        setAppReady(true);
        setInitialized(true);
      }
    };
    
    initApp();
  }, [initialized]);

  // Show loading indicator while app is initializing
  if (!appReady) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
      }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Loading app...</Text>
      </View>
    );
  }
  
  return (
    <>
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
    </>
  );
}

export default function RootLayout() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}