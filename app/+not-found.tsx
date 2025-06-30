import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Home, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const styles = createStyles(theme);

  useEffect(() => {
    // On web, if this is a direct navigation to a valid route that just failed to load,
    // try to redirect to the home page after a countdown
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
      
      // If the current path looks like it should be valid, start countdown
      const isValidRoute = validRoutes.some(route => 
        currentPath === route || 
        currentPath.startsWith('/(tabs)') ||
        currentPath === '/index'
      );
      
      if (isValidRoute || currentPath === '/') {
        setIsRedirecting(true);
        
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              router.replace('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
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

  const handleRefresh = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      router.replace('/');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={64} color={theme.colors.error} />
          </View>
          
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Page Not Found</Text>
          
          {isRedirecting ? (
            <View style={styles.redirectContainer}>
              <Text style={styles.description}>
                This looks like a valid route that failed to load. Redirecting to home page...
              </Text>
              <Text style={styles.countdown}>
                Redirecting in {countdown} seconds
              </Text>
            </View>
          ) : (
            <Text style={styles.description}>
              The page you're looking for doesn't exist or may have been moved.
            </Text>
          )}
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
              <Home size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Go Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
              <ArrowLeft size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tertiaryButton} onPress={handleRefresh}>
              <RefreshCw size={20} color={theme.colors.textSecondary} />
              <Text style={styles.tertiaryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' && (
            <View style={styles.webInfo}>
              <Text style={styles.webInfoTitle}>Netlify Deployment Issue?</Text>
              <Text style={styles.webInfoText}>
                If you're seeing this after refreshing a page, it means the Netlify redirect rules need to be configured properly. 
                The _redirects file should handle SPA routing automatically.
              </Text>
            </View>
          )}

          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>Debug Information:</Text>
            <Text style={styles.debugText}>
              Platform: {Platform.OS}
            </Text>
            {Platform.OS === 'web' && typeof window !== 'undefined' && (
              <>
                <Text style={styles.debugText}>
                  Current URL: {window.location.href}
                </Text>
                <Text style={styles.debugText}>
                  Pathname: {window.location.pathname}
                </Text>
              </>
            )}
          </View>
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
    maxWidth: 500,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 20,
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
  redirectContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  countdown: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 12,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
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
  tertiaryButton: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tertiaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  webInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: theme.colors.warning + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.warning + '30',
    marginBottom: 16,
  },
  webInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.warning,
    marginBottom: 8,
  },
  webInfoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  debugInfo: {
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    marginBottom: 4,
  },
});