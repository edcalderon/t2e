import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useEffect } from 'react';
import { Home, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  useEffect(() => {
    // On web, if this is a direct navigation to a valid route that just failed to load,
    // try to redirect to the home page after a short delay
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // List of valid routes that should exist
      const validRoutes = [
        '/',
        '/challenges',
        '/notifications', 
        '/settings',
        '/auth/callback',
        '/privacy',
        '/terms'
      ];
      
      // If the current path looks like it should be valid, redirect to home
      if (validRoutes.some(route => currentPath.includes(route)) || currentPath === '/') {
        const timer = setTimeout(() => {
          router.replace('/');
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [router]);

  const handleGoHome = () => {
    if (Platform.OS === 'web') {
      // On web, use window.location to ensure proper navigation
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.description}>
            The page you're looking for doesn't exist or may have been moved.
          </Text>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
              <Home size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Go Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
              <ArrowLeft size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' && (
            <View style={styles.webInfo}>
              <Text style={styles.webInfoText}>
                If you're seeing this after refreshing the page, you'll be redirected to the home page shortly.
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  errorCode: {
    fontSize: 72,
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  webInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  webInfoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});