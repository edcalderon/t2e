import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase, getTwitterUserData, extractTokensFromUrl } from '../lib/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session, User } from '@supabase/supabase-js';

// Configure WebBrowser for authentication
WebBrowser.maybeCompleteAuthSession();

export interface TwitterUser {
  id: string;
  email: string | null;
  username: string;
  displayName: string;
  avatar: string;
  twitterId?: string;
  verified: boolean;
  followerCount: number;
  twitterHandle?: string;
}

export interface AuthState {
  user: TwitterUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
  type?: 'config' | 'network' | 'auth' | 'token' | 'unknown';
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize auth state with enhanced error handling
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing Supabase auth...');
        
        // Check environment configuration
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase configuration. Please check your environment variables.');
        }
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && !isInitialized) {
            console.log('⏰ Auth initialization timeout, setting as not authenticated');
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
            setIsInitialized(true);
          }
        }, 10000); // 10 second timeout

        // Get initial session with retry logic
        let sessionAttempts = 0;
        let session = null;
        let sessionError = null;

        while (sessionAttempts < 3 && !session && mounted) {
          try {
            console.log(`🔍 Session attempt ${sessionAttempts + 1}/3`);
            const { data, error } = await supabase.auth.getSession();
            session = data.session;
            sessionError = error;
            break;
          } catch (err) {
            sessionAttempts++;
            if (sessionAttempts < 3) {
              console.log(`⏳ Retrying session fetch in ${sessionAttempts}s...`);
              await new Promise(resolve => setTimeout(resolve, sessionAttempts * 1000));
            }
          }
        }
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setError({ 
            message: sessionError.message, 
            code: sessionError.message,
            type: 'auth'
          });
        }

        if (mounted) {
          if (session?.user) {
            console.log('✅ Found existing session for user:', session.user.id);
            const twitterUser = getTwitterUserData(session.user);
            if (twitterUser) {
              setAuthState({
                user: twitterUser,
                session,
                isLoading: false,
                isAuthenticated: true,
              });
            } else {
              console.warn('⚠️ Failed to extract Twitter user data');
              setAuthState({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
              });
            }
          } else {
            console.log('ℹ️ No existing session found');
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
          setIsInitialized(true);
        }
      } catch (err: any) {
        console.error('❌ Auth initialization error:', err);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mounted) {
          setError({ 
            message: err.message || 'Failed to initialize authentication',
            type: 'config'
          });
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with enhanced logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id || 'No user');
        
        if (mounted) {
          if (session?.user) {
            const twitterUser = getTwitterUserData(session.user);
            if (twitterUser) {
              setAuthState({
                user: twitterUser,
                session,
                isLoading: false,
                isAuthenticated: true,
              });
              setError(null);
              setRetryCount(0);
            } else {
              console.warn('⚠️ Failed to extract Twitter user data from session');
              setError({
                message: 'Failed to process user data',
                type: 'auth'
              });
            }
          } else {
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
          setIsInitialized(true);
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced sign in with Twitter
  const signInWithTwitter = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      console.log('🐦 Starting Twitter sign-in...');

      // Check configuration
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      if (Platform.OS === 'web') {
        // Web authentication with enhanced error handling
        console.log('🌐 Starting web OAuth flow...');
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'twitter',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          console.error('❌ Web OAuth error:', error);
          throw error;
        }

        console.log('✅ Web OAuth initiated successfully');
        return { success: true };
      } else {
        // Mobile authentication with enhanced token handling
        console.log('📱 Starting mobile OAuth flow...');
        
        const redirectUri = makeRedirectUri({
          scheme: 'xquests',
          path: 'auth/callback',
        });

        console.log('🔗 Mobile redirect URI:', redirectUri);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'twitter',
          options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          console.error('❌ Mobile OAuth error:', error);
          throw error;
        }

        if (data.url) {
          console.log('🌐 Opening OAuth URL...');
          
          // Open the OAuth URL in a browser
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUri,
            {
              showInRecents: true,
              preferEphemeralSession: false,
            }
          );

          console.log('📱 OAuth result:', result.type);

          if (result.type === 'success' && result.url) {
            console.log('✅ OAuth success, processing callback...');
            
            // Extract tokens from the callback URL
            const tokens = extractTokensFromUrl(result.url);
            
            if (tokens.error) {
              throw new Error(tokens.errorDescription || tokens.error);
            }

            // Handle PKCE flow (authorization code)
            if (tokens.code) {
              console.log('🔐 Processing PKCE authorization code...');
              
              const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(tokens.code);
              
              if (sessionError) {
                console.error('❌ PKCE exchange error:', sessionError);
                throw sessionError;
              }
              
              console.log('✅ PKCE session established successfully');
              return { success: true };
            }
            
            // Handle implicit flow (direct tokens)
            if (tokens.accessToken && tokens.refreshToken) {
              console.log('🎫 Processing direct tokens...');
              
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
              });

              if (sessionError) {
                console.error('❌ Session setup error:', sessionError);
                throw sessionError;
              }

              console.log('✅ Direct token session established successfully');
              return { success: true };
            }
            
            throw new Error('No valid authentication tokens received from OAuth callback');
          } else if (result.type === 'cancel') {
            throw new Error('Authentication was cancelled by user');
          } else {
            throw new Error('Authentication failed or was dismissed');
          }
        } else {
          throw new Error('No OAuth URL received from Supabase');
        }
      }
    } catch (err: any) {
      console.error('❌ Twitter sign-in error:', err);
      
      let errorType: AuthError['type'] = 'unknown';
      if (err.message?.includes('configuration') || err.message?.includes('environment')) {
        errorType = 'config';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorType = 'network';
      } else if (err.message?.includes('token') || err.message?.includes('session')) {
        errorType = 'token';
      } else if (err.message?.includes('auth') || err.message?.includes('oauth')) {
        errorType = 'auth';
      }
      
      const authError: AuthError = {
        message: err.message || 'Failed to sign in with Twitter',
        code: err.code,
        type: errorType,
      };
      
      setError(authError);
      setRetryCount(prev => prev + 1);
      return { success: false, error: authError };
    }
  };

  // Enhanced sign out
  const signOut = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }

      console.log('✅ Signed out successfully');
      setRetryCount(0);
      return { success: true };
    } catch (err: any) {
      console.error('❌ Sign out error:', err);
      const authError: AuthError = {
        message: err.message || 'Failed to sign out',
        code: err.code,
        type: 'auth',
      };
      setError(authError);
      return { success: false, error: authError };
    }
  };

  // Retry authentication with exponential backoff
  const retry = useCallback(async () => {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
    console.log(`🔄 Retrying authentication in ${delay}ms (attempt ${retryCount + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    setError(null);
    return signInWithTwitter();
  }, [retryCount]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    ...authState,
    error,
    signInWithTwitter,
    signOut,
    retry,
    clearError,
    isInitialized,
    retryCount,
  };
};