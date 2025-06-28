import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Check, AlertCircle } from 'lucide-react-native';

export default function AuthCallback() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setStatus('processing');
      setMessage('Processing authentication...');

      // Extract tokens from URL parameters (both query params and hash fragments)
      const { 
        access_token, 
        refresh_token, 
        error, 
        error_description,
        type 
      } = params;

      console.log('Auth callback params:', { access_token: !!access_token, refresh_token: !!refresh_token, error, type });

      if (error) {
        console.error('Auth callback error:', error, error_description);
        setStatus('error');
        setMessage(`Authentication failed: ${error_description || error}`);
        
        // Redirect to home after showing error
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 3000);
        return;
      }

      if (access_token && refresh_token) {
        setMessage('Setting up your session...');
        
        // Set the session with the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setMessage(`Session setup failed: ${sessionError.message}`);
          
          setTimeout(() => {
            router.replace('/(tabs)/');
          }, 3000);
          return;
        }

        if (data.session) {
          console.log('Authentication successful:', data.session.user.id);
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to home page after success
          setTimeout(() => {
            router.replace('/(tabs)/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No session data received');
          
          setTimeout(() => {
            router.replace('/(tabs)/');
          }, 3000);
        }
      } else {
        // No tokens found, might be initial redirect
        console.log('No tokens found in callback, redirecting to home');
        setStatus('error');
        setMessage('No authentication tokens received');
        
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 2000);
      }
    } catch (error) {
      console.error('Auth callback processing error:', error);
      setStatus('error');
      setMessage('An unexpected error occurred during authentication');
      
      setTimeout(() => {
        router.replace('/(tabs)/');
      }, 3000);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'processing' && (
          <>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.title}>Processing...</Text>
          </>
        )}
        
        {status === 'success' && (
          <>
            <View style={styles.successIcon}>
              <Check size={32} color={theme.colors.success} />
            </View>
            <Text style={styles.title}>Success!</Text>
          </>
        )}
        
        {status === 'error' && (
          <>
            <View style={styles.errorIcon}>
              <AlertCircle size={32} color={theme.colors.error} />
            </View>
            <Text style={styles.title}>Authentication Error</Text>
          </>
        )}
        
        <Text style={styles.message}>{message}</Text>
        
        {status !== 'processing' && (
          <Text style={styles.redirectText}>
            Redirecting you back to the app...
          </Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  content: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  redirectText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
});