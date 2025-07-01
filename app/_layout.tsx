import { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { enableScreens } from 'react-native-screens';
import { Platform, View, ActivityIndicator, Text } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { registerSW } from '../hooks/usePWA';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAUpdatePrompt from '../components/PWAUpdatePrompt';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useTheme } from '../contexts/ThemeContext';

// Enable screens before any navigation components are rendered
enableScreens();

function AppContent() {
  const { isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { initialized: authInitialized, isAuthenticated } = useAuth();
  
  // Initialize app and handle routing
  useEffect(() => {
    let mounted = true;
    let redirectTimeout: ReturnType<typeof setTimeout>;

    const initializeApp = async () => {
      try {
        if (Platform.OS === 'web') {
          // Register service worker in the background without awaiting
          registerSW().catch(() => {});
        }

        // Handle initial routing
        if (pathname === '/') {
          // Use a small timeout to ensure router is ready
          redirectTimeout = setTimeout(() => {
            if (mounted) {
              router.replace('/(tabs)');
              // Small delay before marking as ready to ensure navigation completes
              setTimeout(() => {
                if (mounted) setIsReady(true);
              }, 50);
            }
          }, 10);
        } else {
          if (mounted) setIsReady(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (mounted) setIsReady(true);
      }
    };
    
    initializeApp();
    
    return () => {
      mounted = false;
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [pathname]);

  // Show loading state only if we're not in the middle of a redirect
  const shouldShowLoading = !isReady && pathname !== '/' || !authInitialized;

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

  // Show loading state only when needed
  if (shouldShowLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#121212' : '#ffffff'
      }}>
        <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} />
      </View>
    );
  }

  // Main app content
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
  
  const content = children || <AppContent />;
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          {content}
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}