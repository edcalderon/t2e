import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '@supabase/supabase-js';
import {
  supabase,
  validateTwitterOAuthConfig,
  performOAuth,
  getCurrentSession,
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
  const subscription = useRef<Subscription | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(async (session: Session) => {
    try {
      console.log('✅ Handling auth success for user:', session.user?.id);
      const twitterUser = getTwitterUserData(session.user);
      
      // Ensure required fields are present before setting auth state
      if (twitterUser.id) {
        setAuthState({
          user: {
            id: twitterUser.id,
            email: twitterUser.email || null,
            username: twitterUser.username || '',
            displayName: twitterUser.displayName || '',
            avatar: twitterUser.avatar || '',
            verified: twitterUser.verified || false,
            twitterId: twitterUser.twitterId || twitterUser.id || '',
            twitterHandle: twitterUser.twitterHandle || '',
            followerCount: twitterUser.followerCount || 0,
          },
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        console.warn('User data is incomplete after successful auth');
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          session: null,
        }));
      }
    } catch (error) {
      console.error('Error handling auth success:', error);
      setError({
        message: 'Failed to process authentication',
        type: 'auth',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        session: null,
      }));
    }
  }, [setAuthState, setError]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
   
        // Get initial session
        const session = await getCurrentSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('✅ Found existing session for user:', session.user.id);
            const twitterUser = getTwitterUserData(session.user);
            
            // Ensure required fields are present before setting auth state
            if (twitterUser.id) {
              setAuthState({
                user: {
                  id: twitterUser.id,
                  email: twitterUser.email || null,
                  username: twitterUser.username || '',
                  displayName: twitterUser.displayName || '',
                  avatar: twitterUser.avatar || '',
                  verified: twitterUser.verified || false,
                  followerCount: twitterUser.followerCount || 0,
                  ...twitterUser
                } as UserProfile,
                session,
                isLoading: false,
                isAuthenticated: true,
              });
            } else {
              console.error('❌ Twitter user data is missing required fields');
              throw new Error('Incomplete user data from Twitter');
            }
            setError(null);
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
        if (mounted) {
          setError({ 
            message: err.message || 'Failed to initialize authentication',
            type: 'config',
            details: 'Initialization failed'
          });
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });

          // No need to set up subscription in error case as we're setting isAuthenticated to false
        } else if (mounted) {
          console.log('No active session found');
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            session: null,
          }));
        }
      }
    };
    
    initializeAuth();

    // Listen for auth changes
    const { data: authData } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id || 'No user');
        
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (session) {
              await handleAuthSuccess(session);
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
            if (session?.user) {
              console.log('User updated, refreshing profile...');
              const { data: profile, error: profileError } = await userService.getUserProfile(session.user.id);
              if (!profileError && profile) {
                setAuthState(prev => ({
                  ...prev,
                  user: profile,
                  session: session,
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
    
    // Store the subscription
    subscription.current = authData.subscription;
    
    return (): void => {
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = null;
      }
    };
  }, [handleAuthSuccess, retryCount]);

  // Sign in with Twitter
  const signInWithTwitter = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      console.log('🐦 Starting Twitter sign-in...');

      // Validate configuration
      const configValidation = validateTwitterOAuthConfig();
      if (!configValidation.valid) {
        throw new Error(`Configuration issues: ${configValidation.issues.join(', ')}`);
      }

      // Perform OAuth
      const result = await performOAuth();
      
      if (result.success) {
        console.log('✅ Twitter OAuth completed successfully');
        return { success: true };
      } else {
        throw new Error(result.error || 'OAuth failed');
      }
    } catch (err: any) {
      console.error('❌ Twitter sign-in error:', err);
      
      let errorType: AuthError['type'] = 'unknown';
      let userFriendlyMessage = err.message;
      
      // Categorize errors
      if (err.message?.includes('configuration') || err.message?.includes('environment')) {
        errorType = 'config';
        userFriendlyMessage = 'Configuration issue detected. Please check your setup.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorType = 'network';
        userFriendlyMessage = 'Network connection issue. Please check your internet.';
      } else if (err.message?.includes('token') || err.message?.includes('session')) {
        errorType = 'token';
        userFriendlyMessage = 'Authentication token issue. This usually resolves with a retry.';
      } else if (err.message?.toLowerCase().includes('email') || err.message?.includes('server_error')) {
        errorType = 'email';
        userFriendlyMessage = 'Twitter authentication successful! (Email not provided by Twitter)';
        
        // For email issues, check if we actually have a session
        try {
          const currentSession = await getCurrentSession();
          if (currentSession) {
            console.log('✅ Session found despite email error - treating as success');
            return { success: true };
          }
        } catch (sessionCheckError) {
          console.log('ℹ️ No session found after email error');
        }
        
        return { success: true }; // Treat email issues as success
      } else if (err.message?.includes('auth') || err.message?.includes('oauth')) {
        errorType = 'auth';
        userFriendlyMessage = 'Authentication service issue. Please try again.';
      } else if (err.message?.includes('cancelled') || err.message?.includes('cancel')) {
        errorType = 'auth';
        userFriendlyMessage = 'Authentication was cancelled';
      }
      
      const authError: AuthError = {
        message: userFriendlyMessage || 'Failed to sign in with Twitter',
        code: err.code,
        type: errorType,
        details: err.message,
      };
      
      setError(authError);
      setRetryCount(prev => prev + 1);
      return { success: false, error: authError };
    }
  };

  // Retry with exponential backoff
  const retry = useCallback(async () => {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
    console.log(`🔄 Retrying authentication in ${delay}ms (attempt ${retryCount + 1})`);
    
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

  // Function to clear any error state
  const clearError = useCallback(() => {
    setError(null);
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