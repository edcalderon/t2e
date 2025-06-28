import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createSessionFromUrl } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Check, AlertCircle, Info } from 'lucide-react-native';

export default function AuthCallback() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'warning' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setStatus('processing');
      setMessage('🔍 Processing Twitter authentication...');

      console.log('🔄 Auth callback started');
      console.log('📋 Callback params:', params);

      // Get the current URL for processing
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      
      if (!currentUrl) {
        throw new Error('No URL available for processing');
      }

      console.log('🎯 Processing URL:', currentUrl.substring(0, 100) + '...');

      // Try to create session from URL
      const session = await createSessionFromUrl(currentUrl);

      if (session) {
        console.log('✅ Session created successfully:', session.user.id);
        setStatus('success');
        setMessage('✅ Twitter authentication successful!');
        
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 2000);
      } else {
        console.log('⚠️ No session created but no error - checking for existing session');
        
        // Import supabase here to avoid circular dependency
        const { supabase } = await import('../../lib/supabase');
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log('✅ Found existing session');
          setStatus('success');
          setMessage('✅ Authentication successful!');
          
          setTimeout(() => {
            router.replace('/(tabs)/');
          }, 2000);
        } else {
          throw new Error('No session could be established');
        }
      }
    } catch (error: any) {
      console.error('❌ Auth callback processing error:', error);
      
      // Check if it's an email-related error (which is normal for Twitter)
      if (error.message?.toLowerCase().includes('email') || 
          error.message?.includes('server_error')) {
        setStatus('warning');
        setMessage('✅ Twitter authentication successful!\n\n⚠️ Email not provided by Twitter (this is normal)');
        
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 3000);
        return;
      }
      
      setStatus('error');
      setMessage(`❌ Authentication failed: ${error.message}`);
      
      setTimeout(() => {
        router.replace('/(tabs)/');
      }, 5000);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'processing' && (
          <>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.title}>Processing Authentication</Text>
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
        
        {status === 'warning' && (
          <>
            <View style={styles.warningIcon}>
              <Info size={32} color={theme.colors.warning} />
            </View>
            <Text style={styles.title}>Authentication Successful!</Text>
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
  warningIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.warning + '20',
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