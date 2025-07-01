import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootIndex() {
  useFrameworkReady();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  useEffect(() => {
    console.log('🚀 Root index mounted, preparing redirect...');
    
    // Set redirecting state
    setIsRedirecting(true);
    
    const performRedirect = () => {
      console.log(`🔄 Redirecting to explore tab... (attempt ${redirectAttempts + 1})`);
      try {
        router.replace('/(tabs)/');
        console.log('✅ Redirect initiated successfully');
      } catch (error) {
        console.error('❌ Redirect error:', error);
        
        // Retry logic
        if (redirectAttempts < 3) {
          setRedirectAttempts(prev => prev + 1);
          setTimeout(performRedirect, 500 * (redirectAttempts + 1));
        } else {
          console.error('❌ Max redirect attempts reached');
          // Force navigation as last resort
          if (typeof window !== 'undefined') {
            window.location.href = '/(tabs)/';
          }
        }
      }
    };
    
    // Initial redirect with minimal delay
    const timer = setTimeout(performRedirect, 100);

    return () => {
      clearTimeout(timer);
      setIsRedirecting(false);
    };
  }, [router, redirectAttempts]);

  // Show a loading indicator while redirecting
  return (
    <View style={styles.container}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#1D9BF0" />
        <Text style={styles.loadingText}>
          {isRedirecting ? 'Loading XQuests...' : 'Initializing...'}
        </Text>
        {redirectAttempts > 0 && (
          <Text style={styles.retryText}>
            Retry attempt {redirectAttempts}/3
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  retryText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});