import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootIndex() {
  useFrameworkReady();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('🚀 Root index mounted, preparing redirect...');
    
    // Set redirecting state
    setIsRedirecting(true);
    
    // Add a small delay to ensure the router and contexts are ready
    const timer = setTimeout(() => {
      console.log('🔄 Redirecting to explore tab...');
      try {
        router.replace('/(tabs)/');
      } catch (error) {
        console.error('❌ Redirect error:', error);
        // Fallback: try again after a longer delay
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 500);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      setIsRedirecting(false);
    };
  }, [router]);

  // Show a loading indicator while redirecting
  return (
    <View style={styles.container}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#1D9BF0" />
        <Text style={styles.loadingText}>
          {isRedirecting ? 'Loading XQuests...' : 'Initializing...'}
        </Text>
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
});