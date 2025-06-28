import { useState, useEffect, useCallback } from 'react';
import { 
  supabase, 
  getTwitterUserData, 
  validateTwitterOAuthConfig,
  performOAuth,
  handleTwitterOAuthError
} from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

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
  type?: 'config' | 'network' | 'auth' | 'token' | 'email' | 'unknown';
  details?: string;
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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing Supabase auth...');
        
        // Validate configuration first
        const configValidation = validateTwitterOAuthConfig();
        if (!configValidation.valid) {
          throw new Error(`Configuration issues: ${configValidation.issues.join(', ')}`);
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

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          // Don't treat session errors as fatal - user might just not be logged in
          console.log('ℹ️ Session error treated as not authenticated');
        }

        if (mounted) {
          if (session?.user) {
            console.log('✅ Found existing session for user:', session.user.id);
            const twitterUser = getTwitterUserData(session.user);
            
            setAuthState({
              user: twitterUser,
              session,
              isLoading: false,
              isAuthenticated: true,
            });
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
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
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
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id || 'No user');
        
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
            setRetryCount(0);
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

  // Sign in with Twitter using the simplified OAuth flow
  const signInWithTwitter = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setError(null);
      console.log('🐦 Starting Twitter sign-in...');

      // Validate configuration
      const configValidation = validateTwitterOAuthConfig();
      if (!configValidation.valid) {
        throw new Error(`Configuration issues: ${configValidation.issues.join(', ')}`);
      }

      // Use the simplified OAuth flow
      const result = await performOAuth();
      
      if (result.success) {
        console.log('✅ Twitter OAuth completed successfully');
        
        // Wait a moment for the auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if we now have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Session confirmed after OAuth');
          return { success: true };
        } else {
          console.log('⚠️ OAuth succeeded but no session found - this might still be processing');
          // Don't treat this as an error, the auth state change listener will handle it
          return { success: true };
        }
      } else {
        throw new Error(result.error || 'OAuth failed');
      }
    } catch (err: any) {
      console.error('❌ Twitter sign-in error:', err);
      
      let errorType: AuthError['type'] = 'unknown';
      let userFriendlyMessage = err.message;
      
      if (err.message?.includes('configuration') || err.message?.includes('environment')) {
        errorType = 'config';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorType = 'network';
      } else if (err.message?.includes('token') || err.message?.includes('session')) {
        errorType = 'token';
      } else if (err.message?.toLowerCase().includes('email') || err.message?.includes('server_error')) {
        errorType = 'email';
        userFriendlyMessage = 'Twitter authentication successful! (Email not provided by Twitter)';
        // For email issues, we might still want to consider this a success
        console.log('ℹ️ Email issue detected, but authentication may have succeeded');
        
        // Check if we actually have a session despite the email error
        try {
          const { data: currentSession } = await supabase.auth.getSession();
          if (currentSession.session) {
            console.log('✅ Session found despite email error - treating as success');
            return { success: true };
          }
        } catch (sessionCheckError) {
          console.log('ℹ️ No session found after email error');
        }
        
        return { success: true }; // Treat email issues as success
      } else if (err.message?.includes('auth') || err.message?.includes('oauth')) {
        errorType = 'auth';
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

  // Sign out
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
        details: 'Sign out failed'
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