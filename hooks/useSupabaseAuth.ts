import { useState, useEffect } from 'react';
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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError({ message: sessionError.message, code: sessionError.message });
        }

        if (mounted && session?.user) {
          const twitterUser = getTwitterUserData(session.user);
          setAuthState({
            user: twitterUser,
            session,
            isLoading: false,
            isAuthenticated: true,
          });
        } else if (mounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError({ message: 'Failed to initialize authentication' });
          setAuthState(prev => ({ ...prev, isLoading: false }));
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
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Twitter
  const signInWithTwitter = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));

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

        return { success: true };
      } else {
        // Mobile authentication with expo-auth-session
        const redirectUri = makeRedirectUri({
          scheme: 'xquests',
          path: 'auth/callback',
        });

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
          // Open the OAuth URL in a browser
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUri
          );

          if (result.type === 'success' && result.url) {
            // Extract the session from the callback URL
            const url = new URL(result.url);
            const accessToken = url.searchParams.get('access_token');
            const refreshToken = url.searchParams.get('refresh_token');

            if (accessToken && refreshToken) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                throw sessionError;
              }

              return { success: true };
            }
          }
        }

        throw new Error('Authentication was cancelled or failed');
      }
    } catch (err: any) {
      console.error('Twitter sign-in error:', err);
      const authError: AuthError = {
        message: err.message || 'Failed to sign in with Twitter',
        code: err.code,
      };
      setError(authError);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: authError };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

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
  const retry = () => {
    setError(null);
    return signInWithTwitter();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    ...authState,
    error,
    signInWithTwitter,
    signOut,
    retry,
    clearError,
  };
};