import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootIndex() {
  useFrameworkReady();
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the main explore tab
    router.replace('/(tabs)/');
  }, []);

  // Return a minimal view while redirecting
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});