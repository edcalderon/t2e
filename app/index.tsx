import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootIndex() {
  useFrameworkReady();
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure the router is ready
    const timer = setTimeout(() => {
      router.replace('/(tabs)/');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Show a loading indicator while redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1D9BF0" />
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
});