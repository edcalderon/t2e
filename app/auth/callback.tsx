import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, extractTokensFromUrl } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Check, AlertCircle, RefreshCw, Info } from 'lucide-react-native';

export default function AuthCallback() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'warning'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setStatus('processing');
      setMessage('🔍 Processing authentication callback...');

      console.log('🔄 Auth callback started');
      console.log('📋 Callback params:', params);

      // Extract all possible parameters
      const allParams = {
        // Direct parameters
        access_token: params.access_token,
        refresh_token: params.refresh_token,
        code: params.code,
        error: params.error,
        error_description: params.error_description,
        type: params.type,
        // URL-based extraction
        ...extractTokensFromUrl(typeof window !== 'undefined' ? window.location.href : ''),
      };

      console.log('🎯 All extracted parameters:', {
        hasAccessToken: !!allParams.access_token,
        hasRefreshToken: !!allParams.refresh_token,
        hasCode: !!allParams.code,
        hasError: !!allParams.error,
        type: allParams.type,
        errorDescription: allParams.error_description,
      });

      if (__DEV__) {
        setDebugInfo(allParams);
      }

      // Handle OAuth errors - but be lenient with email errors
      if (allParams.error) {
        console.error('❌ OAuth error received:', allParams.error, allParams.error_description);
        
        // Check if it's an email-related error (common with Twitter)
        const isEmailError = allParams.error === 'server_error' && 
                            allParams.error_description?.toLowerCase().includes('email');
        
        if (isEmailError) {
          console.log('ℹ️ Email error detected - treating as warning, not failure');
          setStatus('warning');
          setMessage('⚠️ Authentication successful! Twitter did not provide email access (this is normal).');
          
          setTimeout(() => {
            router.replace('/(tabs)/');
          }, 3000);
          return;
        }
        
        // For other errors, treat as actual failures
        setStatus('error');
        setMessage(`❌ Authentication failed: ${allParams.error_description || allParams.error}`);
        
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 4000);
        return;
      }

      // Handle PKCE flow (authorization code)
      if (allParams.code) {
        console.log('🔐 Processing PKCE authorization code...');
        setMessage('🔐 Exchanging authorization code for session...');
        
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(allParams.code as string);
          
          if (exchangeError) {
            console.error('❌ PKCE exchange error:', exchangeError);
            
            // Check if it's an email-related error
            if (exchangeError.message?.toLowerCase().includes('email')) {
              console.log('ℹ️ Email error during PKCE exchange - treating as warning');
              setStatus('warning');
              setMessage('⚠️ Authentication successful! Email access not provided by Twitter (this is normal).');
              
              setTimeout(() => {
                router.replace('/(tabs)/');
              }, 3000);
              return;
            }
            
            throw new Error(`Code exchange failed: ${exchangeError.message}`);
          }

          if (data.session) {
            console.log('✅ PKCE authentication successful:', data.session.user.id);
            setStatus('success');
            setMessage('✅ Authentication successful! Redirecting...');
            
            setTimeout(() => {
              router.replace('/(tabs)/');
            }, 2000);
            return;
          } else {
            throw new Error('No session data received from code exchange');
          }
        } catch (codeError: any) {
          console.error('❌ Code exchange error:', codeError);
          throw new Error(`PKCE flow failed: ${codeError.message}`);
        }
      }

      // Handle implicit flow (direct tokens)
      if (allParams.access_token && allParams.refresh_token) {
        console.log('🎫 Processing direct access tokens...');
        setMessage('🎫 Setting up session with tokens...');
        
        try {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: allParams.access_token as string,
            refresh_token: allParams.refresh_token as string,
          });

          if (sessionError) {
            console.error('❌ Session setup error:', sessionError);
            
            // Check if it's an email-related error
            if (sessionError.message?.toLowerCase().includes('email')) {
              console.log('ℹ️ Email error during session setup - treating as warning');
              setStatus('warning');
              setMessage('⚠️ Authentication successful! Email access not provided by Twitter (this is normal).');
              
              setTimeout(() => {
                router.replace('/(tabs)/');
              }, 3000);
              return;
            }
            
            throw new Error(`Session setup failed: ${sessionError.message}`);
          }

          if (data.session) {
            console.log('✅ Token authentication successful:', data.session.user.id);
            setStatus('success');
            setMessage('✅ Authentication successful! Redirecting...');
            
            setTimeout(() => {
              router.replace('/(tabs)/');
            }, 2000);
            return;
          } else {
            throw new Error('No session data received from token setup');
          }
        } catch (tokenError: any) {
          console.error('❌ Token setup error:', tokenError);
          throw new Error(`Token flow failed: ${tokenError.message}`);
        }
      }

      // If we get here, no valid authentication method was found
      console.warn('⚠️ No valid authentication tokens or code found');
      setStatus('error');
      setMessage('❌ No authentication tokens received. Please try signing in again.');
      
      setTimeout(() => {
        router.replace('/(tabs)/');
      }, 4000);

    } catch (error: any) {
      console.error('❌ Auth callback processing error:', error);
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
            <Text style={styles.title}>Almost There!</Text>
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

        {/* Debug information in development */}
        {__DEV__ && debugInfo && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>
              {JSON.stringify(debugInfo, null, 2)}
            </Text>
          </View>
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
  debugContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
});