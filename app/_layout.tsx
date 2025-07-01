import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { enableScreens } from 'react-native-screens';
import { Platform, View } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { AuthProvider } from '../contexts/AuthContext';
import { registerSW } from '../hooks/usePWA';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAUpdatePrompt from '../components/PWAUpdatePrompt';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Enable screens before any navigation components are rendered
enableScreens();

function AppContent() {

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
        <SidebarProvider>
          {content}
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}