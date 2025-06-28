import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase, getTwitterUserData } from '../lib/supabase';
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

  // Initialize auth state with timeout
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Initializing Supabase auth...');
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && !isInitialized) {
            console.log('Auth initialization timeout, setting as not authenticated');
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
            setIsInitialized(true);
          }
        }, 5000); // 5 second timeout

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError({ message: sessionError.message, code: sessionError.message });
        }

        if (mounted) {
          if (session?.user) {
            console.log('Found existing session for user:', session.user.id);
            const twitterUser = getTwitterUserData(session.user);
            setAuthState({
              user: twitterUser,
              session,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            console.log('No existing session found');
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mounted) {
          setError({ message: 'Failed to initialize authentication' });
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          if (session?.user) {
            const twitterUser = getTwitterUserData(session.user);
            setAuthState({
              user: twitterUser,
              session,
              isLoading: false,
              isAuthenticated: true,
            });
            setError(null);
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

  // Sign in with Twitter
  const signInWithTwitter = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      console.log('Starting Twitter sign-in...');

      if (Platform.OS === 'web') {
        // Web authentication
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'twitter',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          throw error;
        }

        console.log('Web OAuth initiated successfully');
        return { success: true };
      } else {
        // Mobile authentication with expo-auth-session
        const redirectUri = makeRedirectUri({
          scheme: 'xquests',
          path: 'auth/callback',
        });

        console.log('Mobile redirect URI:', redirectUri);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'twitter',
          options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          throw error;
        }

        if (data.url) {
          console.log('Opening OAuth URL:', data.url);
          
          // Open the OAuth URL in a browser
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUri
          );

          console.log('OAuth result:', result.type);

          if (result.type === 'success' && result.url) {
            // Handle the callback URL
            const url = new URL(result.url);
            const fragment = url.hash.substring(1);
            const params = new URLSearchParams(fragment);
            
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              console.log('Setting session with tokens...');
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                throw sessionError;
              }

              console.log('Session set successfully');
              return { success: true };
            } else {
              throw new Error('No access token received from OAuth callback');
            }
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
      console.error('Twitter sign-in error:', err);
      const authError: AuthError = {
        message: err.message || 'Failed to sign in with Twitter',
        code: err.code,
      };
      setError(authError);
      return { success: false, error: authError };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      console.log('Signed out successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Sign out error:', err);
      const authError: AuthError = {
        message: err.message || 'Failed to sign out',
        code: err.code,
      };
      setError(authError);
      return { success: false, error: authError };
    }
  };

  // Retry authentication
  const retry = useCallback(() => {
    setError(null);
    return signInWithTwitter();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...authState,
    error,
    signInWithTwitter,
    signOut,
    retry,
    clearError,
    isInitialized,
  };
};