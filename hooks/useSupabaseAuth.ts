import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  supabase,
  validateTwitterOAuthConfig,
  performOAuth,
  getCurrentSession,
  refreshSession,
  subscribeToProfileChanges,
  type ProfileSubscriptionCallbackPayload
} from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { userService, type UserProfile } from '../lib/userService';

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
  updated_at?: string;
  created_at?: string;
}

type AuthState = {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthError = {
  message: string;
  type: 'auth' | 'network' | 'validation' | 'unknown' | 'config' | 'token' | 'email';
  details?: string;
  code?: string;
};

// Helper function to extract Twitter user data from session
const getTwitterUserData = (user: User | Session['user']): Partial<TwitterUser> => {
  const { user_metadata, identities } = user;

  if (!user_metadata || !identities?.[0]?.identity_data) {
    return {};
  }

  const { identity_data } = identities[0];
  const twitterHandle = identity_data.user_name || user_metadata.user_name || '';

  return {
    id: user.id,
    username: twitterHandle,
    displayName: identity_data.full_name || user_metadata.full_name || '',
    email: user.email || null,
    avatar: identity_data.avatar_url || user_metadata.avatar_url || '',
    twitterId: twitterHandle,
    verified: identity_data.verified || user_metadata.verified || false,
    twitterHandle,
    followerCount: 0, // Default value, can be updated later
  };
};

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const mounted = useRef(true);
  const timeoutId = useRef<NodeJS.Timeout>();
  const subscription = useRef<{ unsubscribe: () => void } | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Clear any existing error
  const clearError = useCallback(() => {
    if (!mounted.current) return;
    setError(null);
    setRetryCount(0);
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(async (session: Session) => {
    if (!mounted.current) return;

    try {
      const user = session?.user;
      if (!user) {
        throw new Error('No user in session');
      }

      // Get or create user profile - pass the session object which contains the user
      const { data: profile, error: profileError } = await userService.handleUserProfile({ user: session.user });
      if (profileError || !profile) {
        throw profileError || new Error('Failed to process user profile');
      }

      // Set up realtime subscription for profile updates
      const subscription = subscribeToProfileChanges(user.id, (payload: ProfileSubscriptionCallbackPayload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setAuthState(prev => ({
            ...prev,
            user: { ...prev.user, ...payload.new } as UserProfile,
          }));
        }
      });

      setAuthState({
        user: profile,
        session,
        isLoading: false,
        isAuthenticated: true,
      });
      setError(null);

      // Cleanup subscription on unmount
      return () => {
        subscription();
      };
    } catch (err) {
      console.error('Authentication error:', err);
      setError({
        message: 'Failed to process user data',
        type: 'auth',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  }, []);

  // Initialize auth state with enhanced error handling and retry logic
  useEffect(() => {
    const initializeAuth = async () => {
      if (!mounted.current) return;
      
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        // Get the current session
        const session = await getCurrentSession();
        
        if (!mounted.current) return;

        if (session?.user) {
          console.log('Found existing session for user:', session.user.email);
          
          // Get or create user profile
          const { data: profile, error: profileError } = await userService.handleUserProfile({ user: session.user });
          
          if (profileError) {
            console.error('Profile error:', profileError);
            throw profileError;
          }

          if (!mounted.current) return;

          // Update auth state with the new session and profile
          setAuthState({
            user: profile || null,
            session,
            isLoading: false,
            isAuthenticated: true,
          });

          // Set up realtime subscription if we have a user
          if (profile) {
            // Unsubscribe from any existing subscription
            if (subscription.current) {
              subscription.current.unsubscribe();
              subscription.current = null;
            }

            const newSubscription = subscribeToProfileChanges(session.user.id, (payload: ProfileSubscriptionCallbackPayload) => {
              if (!mounted.current) return;

              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                setAuthState(prev => ({
                  ...prev,
                  user: { ...prev.user, ...payload.new } as UserProfile,
                }));
              }
            });

            if (mounted.current) {
              subscription.current = { unsubscribe: newSubscription };
            } else if (newSubscription) {
              newSubscription();
            }
          }
        } else if (mounted.current) {
          console.log('No active session found');
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            session: null,
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted.current) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during authentication';
          console.error('Auth error details:', errorMessage);
          
          setError({
            message: 'Failed to initialize authentication',
            type: 'auth',
            details: errorMessage,
            code: error instanceof Error ? (error as any).code : undefined,
          });
          
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            session: null,
          }));
          
          // Auto-retry logic for transient errors
          if (retryCount < 2) {
            console.log(`Retrying auth initialization (attempt ${retryCount + 1})...`);
            const timer = setTimeout(() => {
              if (mounted.current) {
                setRetryCount(prev => prev + 1);
              }
            }, 1000 * (retryCount + 1));
            return () => clearTimeout(timer);
          }
        }
      } finally {
        if (mounted.current) {
          console.log('Auth initialization complete');
          setIsInitialized(true);
        }
      }
    };
    
    initializeAuth();

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted.current) return;
        
        console.log('Auth state changed:', event);
        
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (newSession) {
              await handleAuthSuccess(newSession);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('User signed out, cleaning up...');
            if (subscription.current) {
              subscription.current.unsubscribe();
              subscription.current = null;
            }
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
            break;
            
          case 'USER_UPDATED':
            if (newSession?.user) {
              console.log('User updated, refreshing profile...');
              const { data: profile, error } = await userService.getUserProfile(newSession.user.id);
              if (!error && profile) {
                setAuthState(prev => ({
                  ...prev,
                  user: profile,
                  session: newSession,
                }));
              }
            }
            break;
            
          case 'PASSWORD_RECOVERY':
            console.log('Password recovery flow initiated');
            // Handle password recovery if needed
            break;
            
          default:
            console.log('Unhandled auth event:', event);
        }
      }
    );

    return () => {
      console.log('Cleaning up auth hooks...');
      mounted.current = false;
      
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = null;
      }
      
      if (authListener) {
        authListener.unsubscribe();
      }
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [handleAuthSuccess, retryCount]);

  const signInWithTwitter = useCallback(async () => {
    if (!mounted.current) return { success: false, error: 'Component unmounted' };
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      // Check if Twitter OAuth is configured
      const configError = validateTwitterOAuthConfig();
      if (!configError.valid) {
        if (!mounted.current) return { success: false, error: 'Component unmounted' };
        const errorMessage = 'Twitter OAuth is not properly configured';
        const errorDetails = configError.issues.join(', ');
        setError({
          message: errorMessage,
          type: 'config',
          details: errorDetails
        });
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        return { 
          success: false, 
          error: errorMessage,
          details: errorDetails
        };
      }
      // Perform OAuth flow
      const { success, error, session } = await performOAuth();
      
      if (!success || !session) {
        throw new Error(error || 'Failed to complete Twitter authentication');
      }
      
      // Process the session and update auth state
      if (mounted.current) {
        const { data: profile, error: profileError } = await userService.handleUserProfile({ 
          user: session.user 
        });
        
        if (profileError || !profile) {
          throw profileError || new Error('Failed to process user profile');
        }
        
        setAuthState({
          user: profile,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      }
      
      return { success: true, session };
    } catch (err: any) {
      console.error('Twitter sign in error:', err);
      const errorMessage = err.message || 'Failed to sign in with Twitter';
      const errorDetails = err.details || 'Unknown error occurred';
      
      if (mounted.current) {
        setError({
          message: errorMessage,
          type: 'auth',
          details: errorDetails
        });
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      };
    } finally {
      if (mounted.current) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        setIsInitialized(true);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!mounted.current) return;
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Clear all auth-related storage first
      await AsyncStorage.multiRemove([
        'sb-auth-token',
        'sb-refresh-token',
        'sb:token',
        'sb:state',
        'sb:provider-token',
        'sb:session',
        'supabase.auth.token',
        'supabase.auth.token.iss',
        `sb-${process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '').split('.')[0]}-auth-token`,
        `sb-${process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '').split('.')[0]}-refresh-token`,
      ]);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clean up subscriptions
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = null;
      }
      
      if (!mounted.current) return;
      
      // Clear any existing timeouts
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
      
      // Reset all auth state
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Clear any errors
      setError(null);
      
      console.log('✅ Successfully signed out from Supabase');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      if (mounted.current) {
        setError({
          message: 'Failed to sign out',
          type: 'auth',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
        // Still reset the auth state even if there was an error
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } finally {
      if (mounted.current) {
        setIsInitialized(true);
      }
    }
  }, []);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    ...authState,
    error,
    isInitialized,
    signInWithTwitter,
    signOut,
    clearError,
    retryCount,
  }), [authState, error, isInitialized, signInWithTwitter, signOut, clearError, retryCount]);
};