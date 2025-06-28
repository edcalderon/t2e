import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

export default function AuthCallback() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Extract tokens from URL parameters
      const { access_token, refresh_token, error, error_description } = params;

      if (error) {
        console.error('Auth callback error:', error, error_description);
        // Redirect to home with error
        router.replace('/(tabs)/');
        return;
      }

      if (access_token && refresh_token) {
        // Set the session with the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          router.replace('/(tabs)/');
          return;
        }

        if (data.session) {
          console.log('Authentication successful:', data.session.user.id);
          // Redirect to home page
          router.replace('/(tabs)/');
        }
      } else {
        // No tokens found, redirect to home
        router.replace('/(tabs)/');
      }
    } catch (error) {
      console.error('Auth callback processing error:', error);
      router.replace('/(tabs)/');
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>Completing authentication...</Text>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});